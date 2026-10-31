<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Drivers\ClaudeCliDriver;
use PHPUnit\Framework\TestCase;

final class KeylessGlobalOnlyDriverTest extends TestCase
{
    private function service(array $global, array $company = []): AiConfigurationService
    {
        $store = new class($global, $company) implements SettingsStore
        {
            public function __construct(public array $global, public array $company) {}

            public function getGlobal(string $key, mixed $default = null): mixed
            {
                return $this->global[$key] ?? $default;
            }

            public function putGlobal(string $key, mixed $value): void {}

            public function deleteGlobal(string $key): void {}

            public function getCompany(int $companyId, string $key, mixed $default = null): mixed
            {
                return $this->company[$key] ?? $default;
            }

            public function putCompany(int $companyId, string $key, mixed $value): void {}

            public function deleteCompany(int $companyId, string $key): void {}

            public function deleteCompanyForAll(string $key): void {}
        };

        Registry::registerAiDriver('claude_cli', [
            'class' => ClaudeCliDriver::class, 'label' => 'cli', 'requires_api_key' => false, 'global_only' => true,
            'supported_roles' => ['chat'], 'suggested_models' => [], 'config_fields' => [],
        ]);

        return new AiConfigurationService($store);
    }

    public function test_a_keyless_driver_builds_without_an_api_key(): void
    {
        $service = $this->service(['ai_enabled' => 'YES', 'ai_driver' => 'claude_cli']);

        self::assertInstanceOf(ClaudeCliDriver::class, $service->makeDriver(1));
        self::assertFalse($service->driverRequiresApiKey('claude_cli'));
    }

    public function test_a_company_cannot_use_a_global_only_driver(): void
    {
        $service = $this->service(
            ['ai_enabled' => 'YES', 'ai_driver' => 'openrouter', 'ai_api_key' => 'k'],
            ['use_custom_ai_config' => 'YES', 'company_ai_enabled' => 'YES', 'company_ai_driver' => 'claude_cli'],
        );

        self::assertNull($service->makeDriver(1));
    }
}
