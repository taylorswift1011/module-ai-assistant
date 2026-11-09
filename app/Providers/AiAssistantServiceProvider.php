<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use InvoiceShelf\Modules\Contracts\Host\ModuleAuthorization;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use InvoiceShelf\Modules\Registry;
use InvoiceShelf\Modules\Support\ModuleServiceProvider;
use Modules\AiAssistant\Application\AiToolRegistry;
use Modules\AiAssistant\Application\Tools\GetCompanyStatsTool;
use Modules\AiAssistant\Application\Tools\GetCustomerTool;
use Modules\AiAssistant\Application\Tools\GetInvoiceTool;
use Modules\AiAssistant\Application\Tools\ListExpenseCategoriesTool;
use Modules\AiAssistant\Application\Tools\ListOverdueInvoicesTool;
use Modules\AiAssistant\Application\Tools\ListRecentPaymentsTool;
use Modules\AiAssistant\Application\Tools\RankExpenseCategoriesTool;
use Modules\AiAssistant\Application\Tools\RankTopCustomersTool;
use Modules\AiAssistant\Application\Tools\RankTopItemsTool;
use Modules\AiAssistant\Application\Tools\SearchCustomersTool;
use Modules\AiAssistant\Application\Tools\SearchInvoicesTool;
use Modules\AiAssistant\Application\Tools\SearchItemsTool;
use Modules\AiAssistant\Drivers\ClaudeCliDriver;
use Modules\AiAssistant\Drivers\LocalOpenAiDriver;
use Modules\AiAssistant\Drivers\OpenRouterDriver;
use Modules\AiAssistant\Lifecycle\DataCleanup;

final class AiAssistantServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'AiAssistant';

    protected string $nameLower = 'aiassistant';

    public function register(): void
    {
        parent::register();

        $this->app->singleton(AiToolRegistry::class, function (Application $app): AiToolRegistry {
            return new AiToolRegistry($app->make(ModuleAuthorization::class), [
                $app->make(SearchInvoicesTool::class), $app->make(GetInvoiceTool::class),
                $app->make(ListOverdueInvoicesTool::class), $app->make(SearchCustomersTool::class),
                $app->make(GetCustomerTool::class), $app->make(ListRecentPaymentsTool::class),
                $app->make(SearchItemsTool::class), $app->make(ListExpenseCategoriesTool::class),
                $app->make(GetCompanyStatsTool::class), $app->make(RankTopCustomersTool::class),
                $app->make(RankTopItemsTool::class), $app->make(RankExpenseCategoriesTool::class),
            ]);
        });
    }

    public function boot(): void
    {
        parent::boot();

        $modulePath = module_path($this->name);
        Registry::registerScript('ai-assistant', $modulePath.'/dist/init.js');
        Registry::registerStyle('ai-assistant', $modulePath.'/dist/style.css');
        Registry::registerAiDriver('openrouter', [
            'class' => OpenRouterDriver::class,
            'label' => 'OpenRouter',
            'website' => 'https://openrouter.ai',
            'default_base_url' => 'https://openrouter.ai/api/v1',
            'supported_roles' => ['chat', 'text_generation'],
            'suggested_models' => [
                ['value' => 'anthropic/claude-sonnet-4.6', 'label' => 'Anthropic Claude Sonnet 4.6'],
                ['value' => 'anthropic/claude-haiku-4.5', 'label' => 'Anthropic Claude Haiku 4.5'],
                ['value' => 'anthropic/claude-opus-4.6', 'label' => 'Anthropic Claude Opus 4.6'],
                ['value' => 'openai/gpt-5.4', 'label' => 'OpenAI GPT-5.4'],
                ['value' => 'openai/gpt-5.4-mini', 'label' => 'OpenAI GPT-5.4 mini'],
                ['value' => 'google/gemini-3.1-pro-preview', 'label' => 'Google Gemini 3.1 Pro (preview)'],
                ['value' => 'google/gemini-3.1-flash-lite-preview', 'label' => 'Google Gemini 3.1 Flash Lite (preview)'],
                ['value' => 'z-ai/glm-5.1', 'label' => 'Z.AI GLM 5.1'],
                ['value' => 'z-ai/glm-4.7-flash', 'label' => 'Z.AI GLM 4.7 Flash'],
            ],
            'config_fields' => [[
                'key' => 'base_url',
                'type' => 'text',
                'label' => 'Base URL',
                'default' => 'https://openrouter.ai/api/v1',
            ]],
        ]);
        Registry::registerAiDriver('local_openai', [
            'class' => LocalOpenAiDriver::class,
            'label' => 'Local AI (OpenAI-compatible)',
            'website' => '',
            'default_base_url' => 'http://localhost:11434/v1',
            'requires_api_key' => false,
            'accepts_api_key' => true,
            'allows_configured_hosts' => true,
            'global_only' => true,
            'supported_roles' => ['chat', 'text_generation'],
            'fetches_models' => true,
            'suggested_models' => [],
            'config_fields' => [[
                'key' => 'base_url',
                'type' => 'text',
                'label' => 'Base URL of the OpenAI-compatible API',
                'default' => 'http://localhost:11434/v1',
            ]],
        ]);
        Registry::registerAiDriver('claude_cli', [
            'class' => ClaudeCliDriver::class,
            'label' => 'Claude Code (subscription login)',
            'website' => '',
            'requires_api_key' => false,
            'global_only' => true,
            'supported_roles' => ['chat', 'text_generation'],
            'suggested_models' => [
                ['value' => 'sonnet', 'label' => 'Claude Sonnet (latest)'],
                ['value' => 'haiku', 'label' => 'Claude Haiku (latest)'],
                ['value' => 'opus', 'label' => 'Claude Opus (latest)'],
            ],
            'config_fields' => [],
        ]);
        $this->app->bind(DataCleanup::class, fn (Application $app): DataCleanup => new DataCleanup(
            $app->make(SettingsStore::class),
        ));

        Gate::define('manage ai config', static fn (mixed $user): bool => is_object($user)
            && method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin());
        Gate::define('use ai', static fn (): bool => true);
        RateLimiter::for('ai-assistant', static function (Request $request): Limit {
            $userId = $request->user()?->getAuthIdentifier() ?? $request->ip();

            return Limit::perMinute(30)->by($userId.':'.$request->header('company', 'none'));
        });
        $this->loadRoutesFrom($modulePath.'/routes/api.php');
    }
}
