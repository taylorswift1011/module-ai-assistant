<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Illuminate\Support\Facades\Crypt;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Lifecycle\DataCleanup;
use Orchestra\Testbench\TestCase;

/** The host's global settings column holds 255 characters; a key must still round-trip. */
final class LongApiKeyStorageTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(str_repeat('k', 32)));
        $app['config']->set('app.cipher', 'AES-256-CBC');
    }

    private function store(): object
    {
        return new class implements SettingsStore
        {
            /** @var array<string, string> */
            public array $global = [];

            /** @var array<int, array<string, string>> */
            public array $company = [];

            public function getGlobal(string $key, mixed $default = null): mixed
            {
                return $this->global[$key] ?? $default;
            }

            public function putGlobal(string $key, mixed $value): void
            {
                if (is_string($value) && strlen($value) > 255) {
                    throw new \RuntimeException("Data too long for column 'value' ({$key}, ".strlen($value).')');
                }
                $this->global[$key] = (string) $value;
            }

            public function deleteGlobal(string $key): void
            {
                unset($this->global[$key]);
            }

            public function getCompany(int $companyId, string $key, mixed $default = null): mixed
            {
                return $this->company[$companyId][$key] ?? $default;
            }

            public function putCompany(int $companyId, string $key, mixed $value): void
            {
                $this->company[$companyId][$key] = (string) $value;
            }

            public function deleteCompany(int $companyId, string $key): void
            {
                unset($this->company[$companyId][$key]);
            }

            public function deleteCompanyForAll(string $key): void
            {
                foreach ($this->company as &$settings) {
                    unset($settings[$key]);
                }
            }
        };
    }

    public function test_keys_of_every_realistic_length_save_and_read_back(): void
    {
        foreach ([1, 38, 39, 73, 164, 400, 1000] as $length) {
            $store = $this->store();
            $service = new AiConfigurationService($store);
            $key = 'sk-'.substr(str_repeat('AbC123xyz', 200), 0, $length - 3 > 0 ? $length - 3 : 0);

            $service->saveGlobalConfig(['ai_enabled' => 'YES', 'ai_driver' => 'openrouter', 'ai_api_key' => $key]);

            self::assertSame($key, $service->getGlobalConfig()['ai_api_key'], "global key of {$length} characters");
            foreach ($store->global as $stored) {
                self::assertLessThanOrEqual(255, strlen($stored));
            }
        }
    }

    public function test_a_shorter_key_leaves_no_stale_continuation_rows_and_an_empty_one_clears_the_key(): void
    {
        $store = $this->store();
        $service = new AiConfigurationService($store);

        $service->saveGlobalConfig(['ai_api_key' => str_repeat('k', 600)]);
        self::assertArrayHasKey('ai_api_key_2', $store->global);

        $service->saveGlobalConfig(['ai_api_key' => 'sk-short']);
        self::assertSame('sk-short', $service->getGlobalConfig()['ai_api_key']);
        self::assertSame([], array_intersect_key($store->global, array_flip(AiConfigurationService::KEY_PART_KEYS)));

        $service->saveGlobalConfig(['ai_api_key' => '']);
        self::assertSame('', $service->getGlobalConfig()['ai_api_key']);
    }

    public function test_a_company_key_round_trips_and_a_row_saved_before_the_split_still_reads(): void
    {
        $store = $this->store();
        $service = new AiConfigurationService($store);
        $key = str_repeat('c', 300);

        $service->saveCompanyConfig(4, ['use_custom_ai_config' => 'YES', 'ai_api_key' => $key]);
        self::assertSame($key, $service->getCompanyConfig(4)['ai_api_key']);

        $store->global['ai_api_key'] = Crypt::encryptString('old');
        self::assertSame('old', $service->getGlobalConfig()['ai_api_key']);
    }

    public function test_uninstalling_removes_the_continuation_rows_as_well(): void
    {
        $store = $this->store();
        (new AiConfigurationService($store))->saveGlobalConfig(['ai_api_key' => str_repeat('k', 600)]);

        (new DataCleanup($store))->cleanup();

        self::assertSame([], $store->global);
    }
}
