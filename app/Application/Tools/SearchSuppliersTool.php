<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Tools;

use Modules\AiAssistant\Application\Tools\Concerns\ReadsPurchases;

final class SearchSuppliersTool extends AiTool
{
    use ReadsPurchases;

    private const MAX_LIMIT = 50;

    public function name(): string
    {
        return 'search_suppliers';
    }

    public function description(): string
    {
        return 'Search suppliers (the companies bills are owed to) by name. With include_balance, also returns what is currently owed to each, per currency. Use it to answer "how much do we owe X".';
    }

    public function parameterSchema(): array
    {
        return ['type' => 'object', 'properties' => [
            'query' => ['type' => 'string', 'description' => 'Optional text matched against the supplier name.'],
            'include_balance' => ['type' => 'boolean', 'description' => 'Also fetch the amount currently owed to each supplier (one extra lookup per supplier).'],
            'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => self::MAX_LIMIT, 'description' => 'Max rows to return (default 10, max 50).'],
        ], 'required' => []];
    }

    public function execute(array $arguments, int $companyId, int $userId): mixed
    {
        $limit = max(1, min((int) ($arguments['limit'] ?? 10), self::MAX_LIMIT));
        $page = $this->fetch('suppliers', array_filter(['search' => $arguments['query'] ?? null, 'limit' => $limit], static fn (mixed $v): bool => $v !== null && $v !== ''), $companyId);
        if (isset($page['error'])) {
            return $page;
        }

        $suppliers = [];
        foreach ($page['data'] ?? [] as $supplier) {
            $row = [
                'id' => $supplier['id'] ?? null,
                'name' => $supplier['name'] ?? null,
                'contact_name' => $supplier['contact_name'] ?? null,
                'email' => $supplier['email'] ?? null,
                'phone' => $supplier['phone'] ?? null,
                'payment_terms_days' => $supplier['payment_terms'] ?? null,
                'enabled' => $supplier['enabled'] ?? null,
            ];

            if (! empty($arguments['include_balance'])) {
                $detail = $this->fetch('suppliers/'.(int) $supplier['id'], [], $companyId);
                $row['balances'] = isset($detail['error']) ? $detail : array_map(fn (array $balance): array => [
                    'currency' => $balance['currency']['code'] ?? null,
                    'owed' => $this->major($balance['due'] ?? 0, $balance['currency'] ?? null),
                    'advances' => $this->major($balance['advances'] ?? 0, $balance['currency'] ?? null),
                    'credits' => $this->major($balance['credits'] ?? 0, $balance['currency'] ?? null),
                ], $detail['data']['balances'] ?? []);
            }

            $suppliers[] = $row;
        }

        return ['suppliers' => $suppliers];
    }
}
