<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Tools;

use Modules\AiAssistant\Application\Tools\Concerns\ReadsPurchases;

final class GetBillTool extends AiTool
{
    use ReadsPurchases;

    public function name(): string
    {
        return 'get_bill';
    }

    public function description(): string
    {
        return 'Fetch one supplier bill with its line items and payments, by bill number or bill id.';
    }

    public function parameterSchema(): array
    {
        return ['type' => 'object', 'properties' => [
            'bill_number' => ['type' => 'string', 'description' => 'The bill number, for example BILL-000012.'],
            'bill_id' => ['type' => 'integer', 'description' => 'The bill ID, when known.'],
        ], 'required' => []];
    }

    public function execute(array $arguments, int $companyId, int $userId): mixed
    {
        $id = (int) ($arguments['bill_id'] ?? 0);

        if ($id === 0) {
            $number = trim((string) ($arguments['bill_number'] ?? ''));
            if ($number === '') {
                return ['error' => 'missing_argument', 'message' => 'Give a bill_number or a bill_id.'];
            }
            $found = $this->fetch('bills', ['search' => $number, 'limit' => 20], $companyId);
            if (isset($found['error'])) {
                return $found;
            }
            $match = null;
            foreach ($found['data'] ?? [] as $bill) {
                if (strcasecmp((string) $bill['number'], $number) === 0) {
                    $match = $bill;
                }
            }
            $match ??= ($found['data'][0] ?? null);
            if ($match === null) {
                return ['error' => 'not_found', 'message' => "No bill matches \"{$number}\"."];
            }
            $id = (int) $match['id'];
        }

        $response = $this->fetch('bills/'.$id, [], $companyId);
        if (isset($response['error'])) {
            return $response;
        }

        $bill = $response['data'] ?? [];
        $currency = $bill['currency'] ?? null;

        return $this->billSummary($bill) + [
            'notes' => $bill['notes'] ?? null,
            'sub_total' => $this->major($bill['sub_total'] ?? 0, $currency),
            'tax' => $this->major($bill['tax'] ?? 0, $currency),
            'items' => array_map(fn (array $item): array => [
                'description' => $item['description'] ?? null,
                'quantity' => $item['quantity'] ?? null,
                'unit_price' => $this->major($item['price'] ?? 0, $currency),
                'total' => $this->major($item['total'] ?? 0, $currency),
            ], $bill['items'] ?? []),
            'payments' => array_map(fn (array $allocation): array => [
                'payment' => $allocation['payment']['number'] ?? null,
                'amount' => $this->major($allocation['amount'] ?? 0, $currency),
            ], $bill['payment_allocations'] ?? []),
        ];
    }
}
