<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Carbon\CarbonImmutable;
use InvoiceShelf\Modules\Contracts\Host\CompanyDataReader;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use Modules\AiAssistant\Application\Forecast\ExpenseForecast;
use Modules\AiAssistant\Application\Host\HostApi;
use Modules\AiAssistant\Application\Host\HostApiException;
use PHPUnit\Framework\TestCase;

final class ExpenseForecastTest extends TestCase
{
    /** Expenses (minor units) per month and category, and invoiced / received per month. */
    private const EXPENSES = [
        '2026-07' => [['Hosting', 10000], ['Shareholder Salary', 300000]],
        '2026-08' => [['Hosting', 20000], ['Shareholder Salary', 100000]],
        '2026-09' => [['Hosting', 30000], ['Shareholder Salary', 200000]],
        '2026-10' => [['Hosting', 40000], ['Shareholder Salary', 400000]],
        '2026-11' => [['Hosting', 999999]],
    ];

    private function reader(): CompanyDataReader
    {
        $reader = $this->createStub(CompanyDataReader::class);
        $reader->method('expenseCategories')->willReturn([['id' => 1, 'name' => 'Hosting'], ['id' => 2, 'name' => 'Shareholder Salary'], ['id' => 3, 'name' => 'Office']]);
        $reader->method('rankExpenseCategories')->willReturnCallback(function (int $company, ?string $start): array {
            return array_map(
                static fn (array $row): array => ['expense_category_id' => 0, 'name' => $row[0], 'total_amount' => (float) $row[1], 'expense_count' => 1],
                self::EXPENSES[substr((string) $start, 0, 7)] ?? [],
            );
        });
        $reader->method('companyStats')->willReturnCallback(function (int $company, string $start): array {
            $rows = self::EXPENSES[substr($start, 0, 7)] ?? [];

            return [
                'expenses' => ['count' => count($rows), 'total' => (float) array_sum(array_column($rows, 1))],
                'invoices' => ['count' => 1, 'total' => 500000.0],
                'payments' => ['count' => 1, 'total' => 450000.0],
            ];
        });
        $reader->method('searchInvoices')->willReturnCallback(fn (int $c, ?string $q, ?string $status): array => $status === 'UNPAID' ? [
            ['invoice_number' => 'INV-1', 'customer_name' => 'Acme', 'due_date' => '2026-12-15', 'due_amount' => 120000, 'status' => 'SENT', 'overdue' => false],
            ['invoice_number' => 'INV-2', 'customer_name' => 'Acme', 'due_date' => '2027-02-01', 'due_amount' => 50000, 'status' => 'SENT', 'overdue' => false],
            ['invoice_number' => 'INV-3', 'customer_name' => 'Acme', 'due_date' => '2026-12-01', 'due_amount' => 99999, 'status' => 'DRAFT', 'overdue' => false],
        ] : []);

        return $reader;
    }

    /** @param array<string, array<string, mixed>|\Throwable> $routes */
    private function host(array $routes): HostApi
    {
        return new class($routes) implements HostApi
        {
            public function __construct(private readonly array $routes) {}

            public function get(string $path, array $query, int $companyId): array
            {
                $answer = $this->routes[$path] ?? throw new HostApiException('Not found.', 404);
                if ($answer instanceof \Throwable) {
                    throw $answer;
                }

                return $answer;
            }
        };
    }

    private function settings(): SettingsStore
    {
        $store = $this->createStub(SettingsStore::class);
        $store->method('getCompany')->willReturn('Pacific/Auckland');

        return $store;
    }

    private function forecast(array $hostRoutes): array
    {
        return (new ExpenseForecast($this->reader(), $this->host($hostRoutes + ['bootstrap' => ['current_company_currency' => ['code' => 'NZD', 'precision' => 2]]]), $this->settings()))
            // 9 Nov 2026 (NZ): November is still in progress.
            ->build(1, null, 4, CarbonImmutable::parse('2026-11-09 03:00:00', 'UTC'));
    }

    private function bill(string $date, int $baseTotal, array $items): array
    {
        return ['number' => 'B', 'document_date' => $date, 'base_total' => $baseTotal, 'total' => $baseTotal, 'items' => $items];
    }

    public function test_it_targets_next_month_and_averages_only_complete_months(): void
    {
        $result = $this->forecast(['bills' => ['data' => [], 'meta' => ['last_page' => 1]]]);

        self::assertSame('2026-12', $result['target_month']);
        self::assertSame('NZD', $result['currency']);
        self::assertSame(['2026-11'], $result['basis']['partial_months_excluded']);
        self::assertSame(['2026-08', '2026-09', '2026-10', '2026-11'], array_column($result['months'], 'month'));
        // Running costs: hosting averaged over Aug-Oct = (200 + 300 + 400) / 3 = 300.00
        self::assertSame(300.0, $result['projection']['running_costs_excluding_owner_pay']);
    }

    public function test_owner_pay_is_kept_apart_from_running_costs(): void
    {
        $result = $this->forecast(['bills' => ['data' => [], 'meta' => ['last_page' => 1]]]);

        // Salary Aug-Oct = (1000 + 2000 + 4000) / 3
        self::assertSame(2333.33, $result['projection']['owner_pay_recent_average']);
        $salary = array_values(array_filter($result['categories'], static fn (array $c): bool => $c['category'] === 'Shareholder Salary'))[0];
        self::assertTrue($salary['owner_pay']);
        self::assertSame(['2026-08' => 1000.0, '2026-09' => 2000.0, '2026-10' => 4000.0, '2026-11' => 0.0], $salary['by_month']);
        self::assertSame(4000.0, $result['months'][2]['owner_pay']);
    }

    public function test_receipts_and_the_surplus_come_from_the_recent_average(): void
    {
        $result = $this->forecast(['bills' => ['data' => [], 'meta' => ['last_page' => 1]]]);

        self::assertSame(4500.0, $result['projection']['customer_receipts_recent_average']);
        self::assertSame(5000.0, $result['projection']['invoiced_recent_average']);
        self::assertSame(4200.0, $result['projection']['surplus_before_owner_pay']);
    }

    public function test_supplier_bills_count_as_costs_spread_across_their_lines_by_value(): void
    {
        $bills = ['data' => [
            // 600.00 bill: lines 100 (Hosting) and 300 (Office) share it 25% / 75% => 150.00 / 450.00.
            $this->bill('2026-10-05', 60000, [['expense_category_id' => 1, 'total' => 10000], ['expense_category_id' => 3, 'total' => 30000]]),
            $this->bill('2026-10-20', 10000, []),
        ], 'meta' => ['last_page' => 1]];

        $result = $this->forecast(['bills' => $bills]);

        $october = $result['months'][2];
        self::assertSame(700.0, $october['supplier_bills']);
        self::assertSame(4000.0 + 400.0 + 700.0, $october['total_costs']);
        $byName = array_column($result['categories'], null, 'category');
        self::assertSame(550.0, $byName['Hosting']['by_month']['2026-10']);
        self::assertSame(450.0, $byName['Office']['by_month']['2026-10']);
        self::assertSame(100.0, $byName['Uncategorised']['by_month']['2026-10']);
    }

    public function test_bills_unreadable_by_this_member_produce_a_warning_not_a_silent_low_figure(): void
    {
        $result = $this->forecast(['bills' => new HostApiException('You do not have permission to view this.', 403)]);

        self::assertNotSame([], $result['warnings']);
        self::assertStringContainsString('could not be read', $result['warnings'][0]);
        self::assertStringContainsString('understate', $result['warnings'][0]);
        self::assertArrayHasKey('bills', $result['known_commitments']);
    }

    public function test_bills_and_invoices_already_known_for_the_target_month_are_listed(): void
    {
        $open = ['data' => [
            ['number' => 'B-1', 'supplier' => ['name' => 'Vultr'], 'due_date' => '2026-12-10', 'base_due_amount' => 40000],
            ['number' => 'B-2', 'supplier' => ['name' => 'Anthropic'], 'due_date' => '2026-11-08', 'base_due_amount' => 17391],
            ['number' => 'B-4', 'supplier' => ['name' => 'Telco'], 'due_date' => '2026-11-20', 'base_due_amount' => 5520],
            ['number' => 'B-3', 'supplier' => ['name' => 'Later'], 'due_date' => '2027-03-01', 'base_due_amount' => 99900],
        ], 'meta' => ['last_page' => 1]];
        $result = $this->forecast(['bills' => $open, 'recurring-costs' => ['data' => [
            ['name' => 'Domain', 'frequency' => 'YEARLY', 'next_run_at' => '2026-12-20 00:00:00', 'supplier' => ['name' => 'Registrar']],
            ['name' => 'Not this month', 'frequency' => 'MONTHLY', 'next_run_at' => '2027-01-02 00:00:00'],
        ]]]);

        $known = $result['known_commitments'];
        self::assertSame(400.0, $known['bills_due_in_target_month']['total']);
        self::assertSame(229.11, $known['bills_unpaid_due_before_target_month']['total'], 'due this month and already late');
        self::assertSame(173.91, $known['bills_unpaid_due_before_target_month']['of_which_overdue_today']);
        self::assertSame(['Domain'], array_column($known['recurring_costs_due_in_target_month'], 'name'));

        // Drafts are ignored; only INV-1 falls due by the end of December.
        self::assertSame(1700.0, $result['receivables']['outstanding_total']);
        self::assertSame(1200.0, $result['receivables']['due_by_end_of_target_month']);
        self::assertSame(['INV-1', 'INV-2'], array_column($result['receivables']['invoices'], 'invoice'));
    }

    public function test_it_tells_the_model_what_the_figures_cannot_know(): void
    {
        $result = $this->forecast(['bills' => ['data' => [], 'meta' => ['last_page' => 1]]]);

        self::assertStringContainsString('no bank or cash balance', strtolower(implode(' ', $result['caveats'])));
        self::assertStringContainsString('GST', implode(' ', $result['caveats']));
    }

    /** @return array<string, mixed> */
    private function gstRoutes(array $invoices): array
    {
        return [
            'bills' => ['data' => [
                // 115.00 bill with 15.00 GST in October.
                ['document_date' => '2026-10-04', 'base_total' => 11500, 'total' => 11500, 'tax' => 1500, 'exchange_rate' => 1, 'items' => []],
            ], 'meta' => ['last_page' => 1]],
            'tax-types' => ['data' => [
                ['name' => 'Zero rated', 'percent' => '0.00'],
                ['name' => 'GST (purchases)', 'percent' => '15.00', 'compound_tax' => false],
                ['name' => 'GST', 'percent' => '15.00', 'compound_tax' => false],
            ]],
            'invoices' => ['data' => $invoices, 'meta' => ['last_page' => 1]],
        ];
    }

    private function invoice(string $date, int $total, int $tax, string $status = 'SENT'): array
    {
        return ['invoice_date' => $date, 'total' => $total, 'base_total' => $total, 'tax' => $tax, 'status' => $status, 'exchange_rate' => 1];
    }

    public function test_gst_uses_recorded_tax_and_treats_older_taxless_invoices_as_gst_inclusive(): void
    {
        $result = $this->forecast($this->gstRoutes([
            $this->invoice('2026-08-10', 115000, 0),      // before GST was recorded: 1150.00 x 15/115 = 150.00
            $this->invoice('2026-09-10', 230000, 0),      // 300.00
            $this->invoice('2026-10-10', 345000, 45000),  // recorded: 450.00
            $this->invoice('2026-10-10', 115000, 0),      // same day as the first recorded GST: still GST-inclusive, +150.00
            $this->invoice('2026-10-20', 50000, 0),       // after recording began: zero-rated, not estimated
            $this->invoice('2026-10-25', 99999, 0, 'DRAFT'),
        ]));

        $gst = $result['gst'];
        self::assertTrue($gst['available']);
        self::assertSame(15.0, $gst['rate_percent']);
        self::assertStringContainsString('(GST)', $gst['rate_source'], 'a purchases tax type at the same rate must not name the sales rate');
        $months = array_column($gst['months'], null, 'month');
        self::assertSame(150.0, $months['2026-08']['sales_gst']);
        self::assertSame(150.0, $months['2026-08']['of_which_estimated']);
        self::assertSame(600.0, $months['2026-10']['sales_gst']);
        self::assertSame(150.0, $months['2026-10']['of_which_estimated']);
        self::assertSame(15.0, $months['2026-10']['purchases_gst']);
        // Aug-Oct sales GST averages (150 + 300 + 600) / 3 = 350; purchases GST averages 15 / 3 = 5.
        self::assertSame(350.0, $gst['recent_average']['sales_gst']);
        self::assertSame(5.0, $gst['recent_average']['purchases_gst']);
        self::assertSame(345.0, $gst['set_aside_per_month']);
    }

    public function test_what_is_left_for_owner_pay_is_after_the_gst_is_put_away(): void
    {
        $result = $this->forecast($this->gstRoutes([$this->invoice('2026-10-10', 345000, 45000)]));

        // Average receipts 4500.00 less the running costs (hosting plus the October bill) less the GST set aside
        // (450 / 3 - 15 / 3 = 145.00).
        self::assertSame(145.0, $result['gst']['set_aside_per_month']);
        $running = $result['projection']['running_costs_excluding_owner_pay'];
        self::assertSame(338.33, $running);
        self::assertSame(round(4500.0 - $running - 145.0, 2), $result['projection']['available_for_owner_pay_after_gst']);
    }

    public function test_gst_says_why_it_is_missing_rather_than_guessing(): void
    {
        $result = $this->forecast(['bills' => ['data' => [], 'meta' => ['last_page' => 1]]]);

        self::assertFalse($result['gst']['available']);
        self::assertStringContainsString('could not be worked out', $result['gst']['reason']);
        self::assertNull($result['projection']['available_for_owner_pay_after_gst']);
    }

    public function test_a_company_with_no_taxable_rate_gets_no_gst_figure(): void
    {
        $routes = $this->gstRoutes([]);
        $routes['tax-types'] = ['data' => [['name' => 'Zero rated', 'percent' => '0.00']]];

        self::assertFalse($this->forecast($routes)['gst']['available']);
    }

    public function test_the_gst_modules_recommendations_are_included_when_it_is_installed(): void
    {
        $result = $this->forecast($this->gstRoutes([]) + ['gst/recommendations' => [
            'open' => 2, 'to_set_aside' => 12345,
            'data' => [
                ['kind' => 'set_aside', 'invoice_number' => 'INV-13', 'customer' => 'Hygiene Systems', 'payment_amount' => 82333, 'gst_amount' => 10739, 'estimated' => true],
                ['kind' => 'no_gst_recorded', 'invoice_number' => 'INV-14', 'customer' => 'BSI', 'payment_amount' => 5000, 'gst_amount' => 1606, 'estimated' => false],
            ],
        ]]);

        $rec = $result['gst']['gst_module_recommendations'];
        self::assertSame('Gst module', $rec['source']);
        self::assertSame(2, $rec['open']);
        self::assertSame(123.45, $rec['gst_to_set_aside']);
        self::assertSame(['Set the GST from this payment aside', 'Fix this invoice: it records no GST'], array_column($rec['recommendations'], 'action'));
        self::assertSame(107.39, $rec['recommendations'][0]['gst']);
        self::assertTrue($rec['recommendations'][0]['estimated']);
    }

    public function test_without_the_gst_module_the_forecast_stands_on_its_own_figure(): void
    {
        $result = $this->forecast($this->gstRoutes([$this->invoice('2026-10-10', 345000, 45000)]));

        self::assertArrayNotHasKey('gst_module_recommendations', $result['gst']);
        self::assertTrue($result['gst']['available']);
    }
}
