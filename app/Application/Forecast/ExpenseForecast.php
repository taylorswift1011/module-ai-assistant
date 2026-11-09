<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Forecast;

use Carbon\CarbonImmutable;
use InvoiceShelf\Modules\Contracts\Host\CompanyDataReader;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use Modules\AiAssistant\Application\Host\HostApi;
use Modules\AiAssistant\Application\Host\HostApiException;

/**
 * The numbers behind a month-ahead expense forecast and an owner-pay suggestion.
 *
 * Everything arithmetic happens here, in code, from the company's own records:
 * the model is handed totals to explain, never columns to add up. The basis is
 * stated in the result so a report can say how each figure was reached.
 */
final class ExpenseForecast
{
    /** Category names that are the owners' pay rather than running costs. */
    private const OWNER_PAY = '/salary|wage|drawing|dividend|shareholder|director/i';

    private const AVERAGE_MONTHS = 3;

    public function __construct(
        private readonly CompanyDataReader $data,
        private readonly HostApi $host,
        private readonly SettingsStore $settings,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function build(int $companyId, ?string $targetMonth = null, int $historyMonths = 6, ?CarbonImmutable $now = null): array
    {
        $zone = $this->timezone($companyId);
        $today = ($now ?? CarbonImmutable::now())->setTimezone($zone);
        $historyMonths = max(3, min($historyMonths, 12));

        $target = $targetMonth !== null && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $targetMonth) === 1
            ? CarbonImmutable::createFromFormat('!Y-m', $targetMonth, $zone)
            : $today->startOfMonth()->addMonth();
        $targetStart = $target->startOfMonth();
        $targetEnd = $target->endOfMonth();

        [$currency, $precision] = $this->currency($companyId);
        $major = static fn (float|int $minor): float => round($minor / (10 ** $precision), $precision);

        $warnings = [];
        $categoryNames = array_column($this->data->expenseCategories($companyId), 'name', 'id');
        $billCosts = $this->billCosts(
            $companyId,
            $targetStart->subMonths($historyMonths)->toDateString(),
            $targetStart->subDay()->toDateString(),
            $categoryNames,
            $warnings,
        );

        $months = [];
        $categories = [];
        for ($i = $historyMonths; $i >= 1; $i--) {
            $start = $targetStart->subMonths($i);
            $end = $start->endOfMonth();
            $key = $start->format('Y-m');
            $complete = $end->toDateString() <= $today->toDateString();

            $stats = $this->data->companyStats($companyId, $start->toDateString(), $end->toDateString());
            $rows = $this->data->rankExpenseCategories($companyId, $start->toDateString(), $end->toDateString(), 100);

            $categorised = 0.0;
            foreach ($rows as $row) {
                $name = (string) ($row['name'] ?? 'Uncategorised');
                $categories[$name][$key] = ($categories[$name][$key] ?? 0) + (float) $row['total_amount'];
                $categorised += (float) $row['total_amount'];
            }
            $total = (float) ($stats['expenses']['total'] ?? 0);
            if ($total - $categorised > 0.5) {
                $categories['Uncategorised'][$key] = $total - $categorised;
            }

            $billsTotal = 0.0;
            foreach ($billCosts[$key] ?? [] as $name => $amount) {
                $categories[$name][$key] = ($categories[$name][$key] ?? 0) + $amount;
                $billsTotal += $amount;
            }

            $months[$key] = [
                'month' => $key,
                'complete' => $complete,
                'expenses_total' => $total,
                'bills_total' => $billsTotal,
                'invoiced' => (float) ($stats['invoices']['total'] ?? 0),
                'received' => (float) ($stats['payments']['total'] ?? 0),
            ];
        }

        $completeKeys = array_keys(array_filter($months, static fn (array $m): bool => $m['complete']));
        $window = array_slice($completeKeys, -self::AVERAGE_MONTHS);
        $average = static fn (array $byMonth, array $keys): float => $keys === [] ? 0.0
            : array_sum(array_map(static fn (string $k): float => (float) ($byMonth[$k] ?? 0), $keys)) / count($keys);

        $categoryRows = [];
        $projectedRunning = 0.0;
        $ownerPayAverage = 0.0;
        $ownerPayByMonth = [];
        foreach ($categories as $name => $byMonth) {
            $ownerPay = preg_match(self::OWNER_PAY, $name) === 1;
            $avg = $average($byMonth, $window);
            $ownerPay ? $ownerPayAverage += $avg : $projectedRunning += $avg;

            foreach ($months as $key => $_) {
                if ($ownerPay) {
                    $ownerPayByMonth[$key] = ($ownerPayByMonth[$key] ?? 0) + ($byMonth[$key] ?? 0);
                }
            }

            $categoryRows[] = [
                'category' => $name,
                'owner_pay' => $ownerPay,
                'by_month' => array_map(static fn (string $k): float => $major($byMonth[$k] ?? 0), array_combine(array_keys($months), array_keys($months))),
                'average_last_'.self::AVERAGE_MONTHS.'_months' => $major($avg),
            ];
        }
        usort($categoryRows, static fn (array $a, array $b): int => $b['average_last_'.self::AVERAGE_MONTHS.'_months'] <=> $a['average_last_'.self::AVERAGE_MONTHS.'_months']);

        $receiptsAverage = $average(array_column($months, 'received', 'month'), $window);
        $invoicedAverage = $average(array_column($months, 'invoiced', 'month'), $window);

        return [
            'target_month' => $targetStart->format('Y-m'),
            'today' => $today->toDateString(),
            'timezone' => $zone,
            'currency' => $currency,
            'warnings' => $warnings,
            'caveats' => [
                'Customer receipts include any tax charged on invoices (such as GST). That tax is owed on, not income, so the spendable surplus is lower than surplus_before_owner_pay.',
                'Costs the company re-bills to customers (hosting, for example) are in the costs here and in the customers\' invoices; they roughly cancel out.',
                'Averages smooth one-off purchases; a category with a spike in one month is lumpy, not recurring.',
                'There is no bank or cash balance in InvoiceShelf, so nothing here accounts for money already in the bank.',
            ],
            'amounts' => 'Amounts are in '.($currency ?? 'the company currency').', as recorded in InvoiceShelf (tax-inclusive where the source record is).',
            'basis' => [
                'costs' => 'Costs are expenses plus supplier bills (OPEN bills, by bill date), each bill spread across its line categories; drafts and voided bills are left out.',
                'average' => 'Mean of the last '.count($window).' complete month(s): '.implode(', ', $window ?: ['none']).'.',
                'partial_months_excluded' => array_values(array_diff(array_keys($months), $completeKeys)),
            ],
            'months' => array_values(array_map(static fn (array $m): array => [
                'month' => $m['month'],
                'complete' => $m['complete'],
                'expenses' => $major($m['expenses_total']),
                'supplier_bills' => $major($m['bills_total']),
                'total_costs' => $major($m['expenses_total'] + $m['bills_total']),
                'invoiced' => $major($m['invoiced']),
                'received' => $major($m['received']),
                'owner_pay' => $major($ownerPayByMonth[$m['month']] ?? 0),
            ], $months)),
            'categories' => $categoryRows,
            'projection' => [
                'running_costs_excluding_owner_pay' => $major($projectedRunning),
                'owner_pay_recent_average' => $major($ownerPayAverage),
                'customer_receipts_recent_average' => $major($receiptsAverage),
                'invoiced_recent_average' => $major($invoicedAverage),
                'surplus_before_owner_pay' => $major($receiptsAverage - $projectedRunning),
            ],
            'known_commitments' => $this->commitments($companyId, $targetStart, $targetEnd, $precision, $today),
            'receivables' => $this->receivables($companyId, $targetEnd, $major),
        ];
    }

    /**
     * What supplier bills cost per month and category, in minor units of the company currency.
     *
     * A bill's total (tax included) is shared across its lines by line value, so
     * the categories always add up to the bill. A host that cannot be read
     * leaves a warning rather than a silently low forecast.
     *
     * @param  array<int|string, string>  $categoryNames
     * @param  list<string>  $warnings
     * @return array<string, array<string, float>> month => category name => amount
     */
    private function billCosts(int $companyId, string $from, string $to, array $categoryNames, array &$warnings): array
    {
        $costs = [];

        try {
            for ($page = 1; $page <= 10; $page++) {
                $response = $this->host->get('bills', ['status' => 'OPEN', 'from_date' => $from, 'to_date' => $to, 'limit' => 100, 'page' => $page], $companyId);

                foreach ($response['data'] ?? [] as $bill) {
                    $month = substr((string) ($bill['document_date'] ?? ''), 0, 7);
                    $items = $bill['items'] ?? [];
                    $itemsTotal = array_sum(array_map(static fn (array $item): float => (float) ($item['total'] ?? 0), $items));
                    $billTotal = (float) ($bill['base_total'] ?? $bill['total'] ?? 0);

                    if ($items === [] || $itemsTotal <= 0) {
                        $costs[$month]['Uncategorised'] = ($costs[$month]['Uncategorised'] ?? 0) + $billTotal;

                        continue;
                    }

                    foreach ($items as $item) {
                        $name = $categoryNames[(int) ($item['expense_category_id'] ?? 0)] ?? 'Uncategorised';
                        $costs[$month][$name] = ($costs[$month][$name] ?? 0) + $billTotal * ((float) ($item['total'] ?? 0) / $itemsTotal);
                    }
                }

                if ($page >= (int) ($response['meta']['last_page'] ?? 1)) {
                    break;
                }
            }
        } catch (HostApiException $e) {
            $warnings[] = 'Supplier bills could not be read ('.$e->getMessage().'), so the costs below are expenses only and likely understate the real figure.';
        }

        return $costs;
    }

    /** @return array{0: string|null, 1: int} */
    private function currency(int $companyId): array
    {
        try {
            $currency = $this->host->get('bootstrap', [], $companyId)['current_company_currency'] ?? null;
        } catch (HostApiException) {
            $currency = null;
        }

        return [
            is_array($currency) ? ($currency['code'] ?? null) : null,
            is_array($currency) && isset($currency['precision']) ? (int) $currency['precision'] : 2,
        ];
    }

    /**
     * Bills and recurring costs already known to land in the target month.
     *
     * @return array<string, mixed>
     */
    private function commitments(int $companyId, CarbonImmutable $start, CarbonImmutable $end, int $precision, CarbonImmutable $today): array
    {
        $out = [];
        $major = static fn (int $minor): float => round($minor / (10 ** $precision), $precision);

        try {
            $bills = $this->host->get('bills', ['outstanding' => 1, 'limit' => 100], $companyId)['data'] ?? [];
            $dueIn = [];
            $overdue = [];
            foreach ($bills as $bill) {
                $due = substr((string) ($bill['due_date'] ?? ''), 0, 10);
                $row = [
                    'bill' => $bill['number'] ?? null,
                    'supplier' => $bill['supplier']['name'] ?? null,
                    'due_date' => $due,
                    'overdue_today' => $due !== '' && $due < $today->toDateString(),
                    'amount_due' => $major((int) ($bill['base_due_amount'] ?? $bill['due_amount'] ?? 0)),
                ];
                if ($due >= $start->toDateString() && $due <= $end->toDateString()) {
                    $dueIn[] = $row;
                } elseif ($due !== '' && $due < $start->toDateString()) {
                    $overdue[] = $row;
                }
            }
            $out['bills_due_in_target_month'] = ['total' => round(array_sum(array_column($dueIn, 'amount_due')), $precision), 'bills' => array_slice($dueIn, 0, 15)];
            // Unpaid and due before the target month starts: they need paying now, and some are already late.
            $out['bills_unpaid_due_before_target_month'] = [
                'total' => round(array_sum(array_column($overdue, 'amount_due')), $precision),
                'of_which_overdue_today' => round(array_sum(array_column(array_filter($overdue, static fn (array $row): bool => $row['overdue_today']), 'amount_due')), $precision),
                'bills' => array_slice($overdue, 0, 15),
            ];
        } catch (HostApiException $e) {
            $out['bills'] = 'Not available: '.$e->getMessage();
        }

        try {
            $recurring = $this->host->get('recurring-costs', ['status' => 'ACTIVE', 'limit' => 100], $companyId)['data'] ?? [];
            $out['recurring_costs_due_in_target_month'] = array_values(array_map(static fn (array $cost): array => [
                'name' => $cost['name'] ?? null,
                'supplier' => $cost['supplier']['name'] ?? null,
                'frequency' => $cost['frequency'] ?? null,
                'next_run' => substr((string) ($cost['next_run_at'] ?? ''), 0, 10),
            ], array_filter($recurring, static function (array $cost) use ($start, $end): bool {
                $next = substr((string) ($cost['next_run_at'] ?? ''), 0, 10);

                return $next >= $start->toDateString() && $next <= $end->toDateString();
            })));
        } catch (HostApiException $e) {
            $out['recurring_costs'] = 'Not available: '.$e->getMessage();
        }

        return $out;
    }

    /**
     * Customer invoices still unpaid, and how much of that falls due by the end of the target month.
     *
     * @return array<string, mixed>
     */
    private function receivables(int $companyId, CarbonImmutable $end, callable $major): array
    {
        $rows = array_merge(
            $this->data->searchInvoices($companyId, null, 'UNPAID', null, 50),
            $this->data->searchInvoices($companyId, null, 'PARTIALLY_PAID', null, 50),
        );
        $rows = array_values(array_filter($rows, static fn (array $r): bool => ($r['status'] ?? '') !== 'DRAFT'));

        $outstanding = array_sum(array_map(static fn (array $r): float => (float) ($r['due_amount'] ?? 0), $rows));
        $dueByEnd = array_filter($rows, static fn (array $r): bool => ($r['due_date'] ?? '') !== '' && $r['due_date'] <= $end->toDateString());

        return [
            'outstanding_total' => $major($outstanding),
            'due_by_end_of_target_month' => $major(array_sum(array_map(static fn (array $r): float => (float) ($r['due_amount'] ?? 0), $dueByEnd))),
            'invoices' => array_slice(array_map(static fn (array $r): array => [
                'invoice' => $r['invoice_number'] ?? null,
                'customer' => $r['customer_name'] ?? null,
                'due_date' => $r['due_date'] ?? null,
                'amount_due' => $major((float) ($r['due_amount'] ?? 0)),
                'overdue' => (bool) ($r['overdue'] ?? false),
            ], $rows), 0, 15),
        ];
    }

    private function timezone(int $companyId): string
    {
        $zone = $this->settings->getCompany($companyId, 'time_zone');

        return is_string($zone) && in_array($zone, \DateTimeZone::listIdentifiers(), true) ? $zone : 'UTC';
    }
}
