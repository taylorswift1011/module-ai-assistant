<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Illuminate\Validation\ValidationException;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Drivers\ClaudeCliDriver;
use Modules\AiAssistant\Drivers\LocalOpenAiDriver;
use Modules\AiAssistant\Drivers\OpenRouterDriver;
use Modules\AiAssistant\Http\Requests\AiConfigurationRequest;
use Modules\AiAssistant\Http\Requests\ConnectionTestRequest;
use Orchestra\Testbench\TestCase;

final class StaleBaseUrlTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $base = ['label' => 'x', 'supported_roles' => ['chat'], 'suggested_models' => []];
        $url = [['key' => 'base_url', 'type' => 'text', 'label' => 'Base URL']];
        $register = static function (string $name, array $meta): void {
            if (Registry::driverMeta('ai', $name) === null) {
                Registry::registerAiDriver($name, $meta);
            }
        };
        $register('stale_url_hosted', $base + ['class' => OpenRouterDriver::class, 'config_fields' => $url]);
        $register('stale_url_local', $base + ['class' => LocalOpenAiDriver::class, 'config_fields' => $url,
            'requires_api_key' => false, 'allows_configured_hosts' => true]);
        $register('stale_url_none', $base + ['class' => ClaudeCliDriver::class, 'config_fields' => [], 'requires_api_key' => false, 'uses_base_url' => false]);
        putenv('AI_LOCAL_ALLOWED_HOSTS=10.1.2.20');
    }

    protected function tearDown(): void
    {
        putenv('AI_LOCAL_ALLOWED_HOSTS');
        parent::tearDown();
    }

    /** @param class-string<AiConfigurationRequest|ConnectionTestRequest> $class @return array<string, mixed> */
    private function validate(string $class, array $input): array
    {
        $request = $class::create('/', 'POST', $input);
        $request->setContainer($this->app);
        $request->setRedirector($this->app->make('redirect'));
        $request->validateResolved();

        return $request->validated();
    }

    public function test_a_provider_without_a_base_url_saves_even_when_the_form_still_holds_a_private_one(): void
    {
        foreach ([AiConfigurationRequest::class, ConnectionTestRequest::class] as $class) {
            $validated = $this->validate($class, ['ai_enabled' => 'YES', 'ai_driver' => 'stale_url_none', 'ai_base_url' => 'http://10.1.2.20:11434/v1']);

            self::assertNull($validated['ai_base_url'], $class);
        }
    }

    public function test_a_provider_that_uses_a_base_url_is_still_checked(): void
    {
        $this->expectException(ValidationException::class);

        $this->validate(AiConfigurationRequest::class, ['ai_enabled' => 'YES', 'ai_driver' => 'stale_url_hosted', 'ai_api_key' => 'k', 'ai_base_url' => 'http://10.1.2.20:11434/v1']);
    }

    public function test_the_local_provider_keeps_its_named_private_url(): void
    {
        $validated = $this->validate(AiConfigurationRequest::class, ['ai_enabled' => 'YES', 'ai_driver' => 'stale_url_local', 'ai_base_url' => 'http://10.1.2.20:11434/v1']);

        self::assertSame('http://10.1.2.20:11434/v1', $validated['ai_base_url']);
    }
}
