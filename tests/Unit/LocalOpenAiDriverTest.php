<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Closure;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Drivers\LocalOpenAiDriver;
use Modules\AiAssistant\Rules\PublicHttpUrl;
use Modules\AiAssistant\Support\Net\PrivateNetworkGuard;
use PHPUnit\Framework\TestCase;

final class LocalOpenAiDriverTest extends TestCase
{
    protected function tearDown(): void
    {
        putenv(PrivateNetworkGuard::ALLOWED_HOSTS_ENV);
    }

    private function allow(string $hosts): void
    {
        putenv(PrivateNetworkGuard::ALLOWED_HOSTS_ENV.'='.$hosts);
    }

    private function baseUrlOf(array $config): string
    {
        $driver = new class('', $config) extends LocalOpenAiDriver
        {
            public function url(): string
            {
                return $this->getBaseUrl();
            }
        };

        return $driver->url();
    }

    public function test_a_private_host_is_refused_until_the_operator_names_it(): void
    {
        try {
            $this->baseUrlOf(['base_url' => 'http://10.1.2.20:11434/v1']);
            self::fail('Expected the host to be refused.');
        } catch (AiException $e) {
            self::assertSame('invalid_base_url', $e->errorKey);
            self::assertStringContainsString('AI_LOCAL_ALLOWED_HOSTS', $e->getMessage());
        }

        $this->allow('10.1.2.20');
        self::assertSame('http://10.1.2.20:11434/v1', $this->baseUrlOf(['base_url' => 'http://10.1.2.20:11434/v1/']));
    }

    public function test_the_default_is_ollamas_local_address_and_needs_the_loopback_to_be_named(): void
    {
        $this->allow('localhost');

        self::assertSame('http://localhost:11434/v1', $this->baseUrlOf([]));
    }

    public function test_naming_a_host_opens_that_host_only(): void
    {
        $this->allow('10.1.2.20, ollama.lan:11434 ,[::1]:8080');

        self::assertTrue(PrivateNetworkGuard::isConfiguredHost('10.1.2.20', 9999), 'no port means any port');
        self::assertTrue(PrivateNetworkGuard::isConfiguredHost('OLLAMA.lan', 11434));
        self::assertFalse(PrivateNetworkGuard::isConfiguredHost('ollama.lan', 80), 'a named port is the only port');
        self::assertTrue(PrivateNetworkGuard::isConfiguredHost('::1', 8080));
        self::assertFalse(PrivateNetworkGuard::isConfiguredHost('10.1.2.21', 11434), 'a neighbour is not named');
        self::assertNotNull(PrivateNetworkGuard::blockedReason('http://10.1.2.21/v1', true));
        self::assertNotNull(PrivateNetworkGuard::blockedReason('http://169.254.169.254/', true));
    }

    public function test_the_list_never_widens_the_other_providers(): void
    {
        $this->allow('10.1.2.20');

        self::assertNotNull(PrivateNetworkGuard::blockedReason('http://10.1.2.20/v1'));
    }

    public function test_the_validation_rule_accepts_a_named_host_only_for_the_local_driver(): void
    {
        $this->allow('10.1.2.20');
        $failures = [];
        $fail = static function (string $message) use (&$failures): void {
            $failures[] = $message;
        };
        $run = static fn (PublicHttpUrl $rule, string $url) => $rule->validate('ai_base_url', $url, Closure::fromCallable($fail));

        $run(new PublicHttpUrl(true), 'http://10.1.2.20:11434/v1');
        self::assertSame([], $failures);

        $run(new PublicHttpUrl(true), 'http://10.1.2.99:11434/v1');
        self::assertCount(1, $failures);
        self::assertStringContainsString('AI_LOCAL_ALLOWED_HOSTS', $failures[0]);

        $run(new PublicHttpUrl, 'http://10.1.2.20:11434/v1');
        self::assertCount(2, $failures);
    }

    public function test_the_driver_is_keyless_global_only_and_buildable_without_a_key(): void
    {
        Registry::registerAiDriver('local_openai', [
            'class' => LocalOpenAiDriver::class, 'label' => 'local', 'requires_api_key' => false,
            'accepts_api_key' => true, 'allows_configured_hosts' => true, 'global_only' => true,
            'supported_roles' => ['chat'], 'suggested_models' => [], 'config_fields' => [],
        ]);
        $store = new class implements SettingsStore
        {
            public function getGlobal(string $key, mixed $default = null): mixed
            {
                return ['ai_enabled' => 'YES', 'ai_driver' => 'local_openai', 'ai_base_url' => 'http://10.1.2.20:11434/v1'][$key] ?? $default;
            }

            public function putGlobal(string $key, mixed $value): void {}

            public function deleteGlobal(string $key): void {}

            public function getCompany(int $companyId, string $key, mixed $default = null): mixed
            {
                return $key === 'use_custom_ai_config' ? 'NO' : $default;
            }

            public function putCompany(int $companyId, string $key, mixed $value): void {}

            public function deleteCompany(int $companyId, string $key): void {}

            public function deleteCompanyForAll(string $key): void {}
        };
        $service = new AiConfigurationService($store);

        self::assertInstanceOf(LocalOpenAiDriver::class, $service->makeDriver(1));
        self::assertTrue($service->driverIsGlobalOnly('local_openai'));
        self::assertTrue($service->driverAllowsConfiguredHosts('local_openai'));
        self::assertFalse($service->driverRequiresApiKey('local_openai'));
    }
}
