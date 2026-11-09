<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Tools;

use Modules\AiAssistant\Application\Tools\Concerns\ReadsPurchases;

final class SearchBillsTool extends AiTool
{
    use ReadsPurchases;

    private const DEFAULT_LIMIT = 10;

    private const MAX_LIMIT = 50;

    public function name(): string
    {
        return 'search_bills';
    }

    public function description(): string
    {
        return 'Search supplier bills (money the company owes its suppliers). Filter by bill number, supplier (name or id), payment status (UNPAID, PARTIAL, SETTLED, OVERDUE), bill status (DRAFT, OPEN, VOID) or a date range. Returns bill numbers, suppliers, dates, totals and the amount still due, in the bill currency.';
    }

    public function parameterSchema(): array
    {
        return ['type' => 'object', 'properties' => [
            'query' => ['type' => 'string', 'description' => 'Optional text matched against the bill number.'],
            'supplier' => ['type' => 'string', 'description' => 'Optional supplier name (partial match).'],
            'supplier_id' => ['type' => 'integer', 'description' => 'Optional supplier ID.'],
            'payment_status' => ['type' => 'string', 'enum' => ['UNPAID', 'PARTIAL', 'SETTLED', 'OVERDUE'], 'description' => 'UNPAID = nothing paid yet, PARTIAL = part paid, SETTLED = fully paid, OVERDUE = unpaid past the due date.'],
            'status' => ['type' => 'string', 'enum' => ['DRAFT', 'OPEN', 'VOID'], 'description' => 'Optional bill status.'],
            'from_date' => ['type' => 'string', 'description' => 'Only bills dated on or after this YYYY-MM-DD date.'],
            'to_date' => ['type' => 'string', 'description' => 'Only bills dated on or before this YYYY-MM-DD date.'],
            'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_LIMIT, 'description' => 'Max rows to return (default 10, max 50).'],
        ], 'required' => []];
    }

    public function execute(array $arguments, int $companyId, int $userId): mixed
    {
        $limit = max(1, min((int) ($arguments['limit'] ?? self::DEFAULT_LIMIT), self::MAX_LIMIT));
        $query = array_filter([
            'search' => $arguments['query'] ?? null,
            'status' => $arguments['status'] ?? null,
            'settlement_status' => $arguments['payment_status'] ?? null,
            'from_date' => $arguments['from_date'] ?? null,
            'to_date' => $arguments['to_date'] ?? null,
            'limit' => $limit,
        ], static fn (mixed $value): bool => $value !== null && $value !== '');

        $supplierIds = [];
        if (! empty($arguments['supplier_id'])) {
            $supplierIds = [(int) $arguments['supplier_id']];
        } elseif (! empty($arguments['supplier'])) {
            $found = $this->fetch('suppliers', ['search' => (string) $arguments['supplier'], 'limit' => 5], $companyId);
            if (isset($found['error'])) {
                return $found;
            }
            $supplierIds = array_map(static fn (array $supplier): int => (int) $supplier['id'], $found['data'] ?? []);
            if ($supplierIds === []) {
                return ['bills' => [], 'note' => 'No supplier matches "'.$arguments['supplier'].'".'];
            }
        }

        $bills = [];
        foreach ($supplierIds === [] ? [null] : $supplierIds as $supplierId) {
            $page = $this->fetch('bills', $query + ($supplierId === null ? [] : ['supplier_id' => $supplierId]), $companyId);
            if (isset($page['error'])) {
                return $page;
            }
            foreach ($page['data'] ?? [] as $bill) {
                $bills[(int) $bill['id']] = $this->billSummary($bill);
            }
        }
        krsort($bills);

        return ['bills' => array_slice(array_values($bills), 0, $limit)];
    }
}
