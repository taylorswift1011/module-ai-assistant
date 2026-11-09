<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Tools\Concerns;

use Modules\AiAssistant\Application\Host\HostApi;
use Modules\AiAssistant\Application\Host\HostApiException;

/** Shared plumbing of the supplier tools: one call into the host API, errors as tool results. */
trait ReadsPurchases
{
    public function __construct(private readonly HostApi $host) {}

    /** The host decides who may see bills, so the registry gate is only `use ai`. */
    public function requiredAbility(): ?array
    {
        return null;
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    private function fetch(string $path, array $query, int $companyId): array
    {
        try {
            return $this->host->get($path, $query, $companyId);
        } catch (HostApiException $e) {
            return ['error' => $e->status === 403 ? 'unauthorized' : 'host_error', 'message' => $e->getMessage()];
        }
    }

    /** Minor units (cents) as a plain number in the currency's major unit. */
    private function major(mixed $minor, mixed $currency): float
    {
        $precision = is_array($currency) && isset($currency['precision']) ? (int) $currency['precision'] : 2;

        return round(((int) $minor) / (10 ** $precision), $precision);
    }

    /**
     * @param  array<string, mixed>  $bill
     * @return array<string, mixed>
     */
    private function billSummary(array $bill): array
    {
        $currency = $bill['currency'] ?? null;
        $due = (int) ($bill['due_amount'] ?? 0);
        $total = (int) ($bill['total'] ?? 0);
        $settlement = (string) ($bill['settlement_status'] ?? '');

        return [
            'id' => $bill['id'] ?? null,
            'bill_number' => $bill['number'] ?? null,
            'reference' => $bill['reference'] ?? null,
            'supplier_id' => $bill['supplier_id'] ?? null,
            'supplier_name' => $bill['supplier']['name'] ?? ($bill['supplier_snapshot']['name'] ?? null),
            'bill_date' => $bill['document_date'] ?? null,
            'due_date' => $bill['due_date'] ?? null,
            'status' => $bill['status'] ?? null,
            'payment_status' => $settlement !== '' ? $settlement : ($due === 0 ? 'SETTLED' : ($due === $total ? 'UNPAID' : 'PARTIAL')),
            'currency' => is_array($currency) ? ($currency['code'] ?? null) : null,
            'total' => $this->major($total, $currency),
            'amount_due' => $this->major($due, $currency),
        ];
    }
}
