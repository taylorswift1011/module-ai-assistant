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
}
