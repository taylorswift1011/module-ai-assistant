<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Lifecycle;

use InvoiceShelf\Modules\Contracts\DataCleanup as DataCleanupContract;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use Modules\AiAssistant\Application\AiConfigurationService;

/** Removes legacy settings only after the host has been explicitly asked to remove module data. */
final class DataCleanup implements DataCleanupContract
{
    public function __construct(private readonly SettingsStore $settings) {}

    public function cleanup(): void
    {
        foreach ([...AiConfigurationService::SETTING_KEYS, ...AiConfigurationService::KEY_PART_KEYS] as $key) {
            $this->settings->deleteGlobal($key);
            $this->settings->deleteCompanyForAll('company_'.$key);
        }
        $this->settings->deleteCompanyForAll('use_custom_ai_config');
    }
}
