<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Modules\AiAssistant\Application\Host\HostApi;
use Modules\AiAssistant\Application\Host\HostApiException;
use Modules\AiAssistant\Application\Tools\GetBillTool;
use Modules\AiAssistant\Application\Tools\SearchBillsTool;
use Modules\AiAssistant\Application\Tools\SearchSuppliersTool;
use PHPUnit\Framework\TestCase;

final class SupplierToolsTest extends TestCase
{
    private const NZD = ['code' => 'NZD', 'precision' => 2];

    /** @param array<string, callable|array<string, mixed>> $routes @return object{calls: list<array{0: string, 1: array<string, mixed>, 2: int}>} */
    private function host(array $routes): HostApi
    {
        return new class($routes) implements HostApi
        {
            /** @var list<array{0: string, 1: array<string, mixed>, 2: int}> */
            public array $calls = [];

            public function __construct(private readonly array $routes) {}

            public function get(string $path, array $query, int $companyId): array
            {
                $this->calls[] = [$path, $query, $companyId];
                $answer = $this->routes[$path] ?? throw new HostApiException('Not found.', 404);

                return is_callable($answer) ? $answer($query) : $answer;
            }
        };
    }

    /** @return array<string, mixed> */
    private function bill(int $id, string $number, int $supplierId, int $total, int $due, string $settlement = 'UNPAID'): array
    {
        return [
            'id' => $id, 'number' => $number, 'reference' => null, 'supplier_id' => $supplierId,
            'supplier' => ['name' => "Supplier {$supplierId}"], 'document_date' => '2026-10-01', 'due_date' => '2026-10-31',
            'status' => 'OPEN', 'settlement_status' => $settlement, 'currency' => self::NZD, 'total' => $total, 'due_amount' => $due,
        ];
    }

    public function test_bills_are_listed_in_major_units_with_the_amount_due(): void
    {
        $host = $this->host(['bills' => ['data' => [$this->bill(7, 'BILL-000007', 3, 123456, 23456, 'PARTIAL')]]]);

        $result = (new SearchBillsTool($host))->execute(['payment_status' => 'PARTIAL', 'from_date' => '2026-10-01'], 1, 5);

        self::assertSame([[
            'id' => 7, 'bill_number' => 'BILL-000007', 'reference' => null, 'supplier_id' => 3, 'supplier_name' => 'Supplier 3',
            'bill_date' => '2026-10-01', 'due_date' => '2026-10-31', 'status' => 'OPEN', 'payment_status' => 'PARTIAL',
            'currency' => 'NZD', 'total' => 1234.56, 'amount_due' => 234.56,
        ]], $result['bills']);
        self::assertSame(['settlement_status' => 'PARTIAL', 'from_date' => '2026-10-01', 'limit' => 10], $host->calls[0][1]);
        self::assertSame(1, $host->calls[0][2]);
    }

    public function test_a_supplier_name_is_resolved_and_every_match_is_searched_newest_first(): void
    {
        $host = $this->host([
            'suppliers' => ['data' => [['id' => 3, 'name' => 'Vultr'], ['id' => 4, 'name' => 'Vultr Holdings']]],
            'bills' => fn (array $q): array => ['data' => [$this->bill($q['supplier_id'] === 3 ? 10 : 20, 'B'.$q['supplier_id'], $q['supplier_id'], 1000, 1000)]],
        ]);

        $result = (new SearchBillsTool($host))->execute(['supplier' => 'Vultr', 'limit' => 5], 1, 5);

        self::assertSame([20, 10], array_column($result['bills'], 'id'));
        self::assertSame('Vultr', $host->calls[0][1]['search']);
    }

    public function test_an_unknown_supplier_says_so_instead_of_listing_everything(): void
    {
        $host = $this->host(['suppliers' => ['data' => []]]);

        $result = (new SearchBillsTool($host))->execute(['supplier' => 'Nobody'], 1, 5);

        self::assertSame([], $result['bills']);
        self::assertStringContainsString('Nobody', $result['note']);
        self::assertCount(1, $host->calls, 'the bills endpoint must not be called unfiltered');
    }

    public function test_a_user_who_may_not_see_bills_gets_an_unauthorized_result_not_an_exception(): void
    {
        $host = new class implements HostApi
        {
            public function get(string $path, array $query, int $companyId): array
            {
                throw new HostApiException('You do not have permission to view this.', 403);
            }
        };

        self::assertSame('unauthorized', (new SearchBillsTool($host))->execute([], 1, 5)['error']);
        self::assertSame('unauthorized', (new SearchSuppliersTool($host))->execute([], 1, 5)['error']);
    }

    public function test_get_bill_finds_the_exact_number_and_returns_items_and_payments(): void
    {
        $detail = $this->bill(7, 'BILL-000007', 3, 11500, 0, 'SETTLED') + [
            'sub_total' => 10000, 'tax' => 1500, 'notes' => 'October hosting',
            'items' => [['description' => 'Cloud server', 'quantity' => 1.0, 'price' => 10000, 'total' => 10000]],
            'payment_allocations' => [['amount' => 11500, 'payment' => ['number' => 'SP-000002']]],
        ];
        $host = $this->host([
            'bills' => ['data' => [$this->bill(70, 'BILL-000070', 3, 1, 1), $this->bill(7, 'BILL-000007', 3, 11500, 0)]],
            'bills/7' => ['data' => $detail],
        ]);

        $result = (new GetBillTool($host))->execute(['bill_number' => 'bill-000007'], 1, 5);

        self::assertSame('BILL-000007', $result['bill_number']);
        self::assertSame(115.0, $result['total']);
        self::assertSame(15.0, $result['tax']);
        self::assertSame([['description' => 'Cloud server', 'quantity' => 1.0, 'unit_price' => 100.0, 'total' => 100.0]], $result['items']);
        self::assertSame([['payment' => 'SP-000002', 'amount' => 115.0]], $result['payments']);
    }

    public function test_get_bill_needs_a_number_or_an_id_and_reports_a_missing_bill(): void
    {
        $host = $this->host(['bills' => ['data' => []]]);

        self::assertSame('missing_argument', (new GetBillTool($host))->execute([], 1, 5)['error']);
        self::assertSame('not_found', (new GetBillTool($host))->execute(['bill_number' => 'X-1'], 1, 5)['error']);
    }

    public function test_suppliers_can_carry_what_is_owed_per_currency(): void
    {
        $host = $this->host([
            'suppliers' => ['data' => [['id' => 3, 'name' => 'Vultr', 'payment_terms' => 30, 'enabled' => true]]],
            'suppliers/3' => ['data' => ['balances' => [['currency' => self::NZD, 'due' => 250050, 'advances' => 0, 'credits' => 1000]]]],
        ]);

        $result = (new SearchSuppliersTool($host))->execute(['query' => 'Vultr', 'include_balance' => true], 1, 5);

        self::assertSame('Vultr', $result['suppliers'][0]['name']);
        self::assertSame([['currency' => 'NZD', 'owed' => 2500.5, 'advances' => 0.0, 'credits' => 10.0]], $result['suppliers'][0]['balances']);
    }

    public function test_the_tools_are_open_to_the_registry_because_the_host_decides_access(): void
    {
        $host = $this->host([]);

        foreach ([new SearchBillsTool($host), new GetBillTool($host), new SearchSuppliersTool($host)] as $tool) {
            self::assertNull($tool->requiredAbility());
            self::assertArrayNotHasKey('company_id', $tool->parameterSchema()['properties']);
        }
    }
}
