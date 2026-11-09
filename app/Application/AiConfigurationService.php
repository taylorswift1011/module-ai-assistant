<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application;

use Illuminate\Support\Facades\Crypt;
use InvoiceShelf\Modules\Ai\Contracts\AiDriver;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Drivers\AiDriverFactory;

/** Reads the legacy AI setting keys through the host-owned settings boundary. */
class AiConfigurationService
{
    public const ROLE_CHAT = 'chat';

    public const ROLE_TEXT_GENERATION = 'text_generation';

    public const ROLES = [self::ROLE_CHAT, self::ROLE_TEXT_GENERATION];

    /** @var list<string> */
    public const SETTING_KEYS = [
        'ai_enabled', 'ai_driver', 'ai_api_key', 'ai_base_url', 'ai_chat_enabled',
        'ai_chat_model', 'ai_text_generation_enabled', 'ai_text_generation_model',
    ];

    /**
     * The host's global settings table keeps `value` in a varchar(255), and an
     * encrypted API key is about 4/3 of its length plus 190 bytes of envelope,
     * so any key over ~38 characters overflows it. The encrypted key is
     * therefore split across `ai_api_key`, `ai_api_key_2` and so on.
     */
    public const KEY_CHUNK_LENGTH = 240;

    public const KEY_MAX_PARTS = 10;

    /** @var list<string> The continuation rows, so uninstall can remove them too. */
    public const KEY_PART_KEYS = [
        'ai_api_key_2', 'ai_api_key_3', 'ai_api_key_4', 'ai_api_key_5', 'ai_api_key_6',
        'ai_api_key_7', 'ai_api_key_8', 'ai_api_key_9', 'ai_api_key_10',
    ];

    public function __construct(private readonly SettingsStore $settings) {}

    /** @return array<string, mixed> */
    public function getGlobalConfig(): array
    {
        return $this->hydrateDefaults($this->decrypt($this->readGlobal()));
    }

    /** @return array<string, mixed> */
    public function getCompanyConfig(int $companyId): array
    {
        $config = [];
        foreach (self::SETTING_KEYS as $key) {
            $config[$key] = $this->settings->getCompany($companyId, 'company_'.$key);
        }
        $config['ai_api_key'] = $this->joinKeyParts(
            $config['ai_api_key'],
            fn (string $part): mixed => $this->settings->getCompany($companyId, 'company_'.$part),
        );

        return array_merge([
            'use_custom_ai_config' => $this->settings->getCompany($companyId, 'use_custom_ai_config', 'NO'),
        ], $this->hydrateDefaults($this->decrypt($config)));
    }

    /** @param array<string, mixed> $payload */
    public function saveGlobalConfig(array $payload): void
    {
        foreach ($this->storageValues($payload) as $key => $value) {
            if ($key === 'ai_api_key') {
                $this->writeKeyParts(
                    $value,
                    fn (string $part, string $chunk) => $this->settings->putGlobal($part, $chunk),
                    fn (string $part) => $this->settings->deleteGlobal($part),
                );

                continue;
            }
            $this->settings->putGlobal($key, $value);
        }
    }

    /** @param array<string, mixed> $payload */
    public function saveCompanyConfig(int $companyId, array $payload): void
    {
        if (($payload['use_custom_ai_config'] ?? 'NO') !== 'YES') {
            $this->settings->putCompany($companyId, 'use_custom_ai_config', 'NO');

            return;
        }

        foreach ($this->storageValues($payload) as $key => $value) {
            if ($key === 'ai_api_key') {
                $this->writeKeyParts(
                    $value,
                    fn (string $part, string $chunk) => $this->settings->putCompany($companyId, 'company_'.$part, $chunk),
                    fn (string $part) => $this->settings->deleteCompany($companyId, 'company_'.$part),
                );

                continue;
            }
            $this->settings->putCompany($companyId, 'company_'.$key, $value);
        }
        $this->settings->putCompany($companyId, 'use_custom_ai_config', 'YES');
    }

    /** @return array<string, mixed>|null */
    public function resolveForCompany(int $companyId): ?array
    {
        $global = $this->getGlobalConfig();
        if (($global['ai_enabled'] ?? 'NO') !== 'YES') {
            return null;
        }

        $company = $this->getCompanyConfig($companyId);
        $useCompany = ($company['use_custom_ai_config'] ?? 'NO') === 'YES';
        $resolved = $useCompany ? $company : $global;
        if ($useCompany && $this->driverIsGlobalOnly((string) ($resolved['ai_driver'] ?? ''))) {
            return null;
        }
        if (($resolved['ai_enabled'] ?? 'NO') !== 'YES') {
            return null;
        }

        $resolved['chat_enabled'] = ($resolved['ai_chat_enabled'] ?? 'NO') === 'YES';
        $resolved['text_generation_enabled'] = ($resolved['ai_text_generation_enabled'] ?? 'NO') === 'YES';

        return $resolved;
    }

    public function makeDriver(int $companyId): ?AiDriver
    {
        $config = $this->resolveForCompany($companyId);
        if ($config === null || empty($config['ai_driver'])) {
            return null;
        }
        if (empty($config['ai_api_key']) && $this->driverRequiresApiKey((string) $config['ai_driver'])) {
            return null;
        }

        return AiDriverFactory::make((string) $config['ai_driver'], (string) $config['ai_api_key'], [
            'base_url' => $config['ai_base_url'] ?? null,
        ]);
    }

    public function driverRequiresApiKey(string $driver): bool
    {
        return (bool) (Registry::driverMeta('ai', $driver)['requires_api_key'] ?? true);
    }

    /** Global-only drivers spend a server-level resource, so only a super admin may choose them. */
    public function driverIsGlobalOnly(string $driver): bool
    {
        return (bool) (Registry::driverMeta('ai', $driver)['global_only'] ?? false);
    }

    /** Whether a driver may call a private host the operator named for it. */
    public function driverAllowsConfiguredHosts(string $driver): bool
    {
        return (bool) (Registry::driverMeta('ai', $driver)['allows_configured_hosts'] ?? false);
    }

    /** @return array<int, array<string, mixed>> */
    public function listDrivers(): array
    {
        return collect(Registry::allDrivers('ai'))->map(fn (array $meta, string $name): array => [
            'value' => $name,
            'label' => $meta['label'],
            'website' => $meta['website'] ?? '',
            'requires_api_key' => (bool) ($meta['requires_api_key'] ?? true),
            'global_only' => (bool) ($meta['global_only'] ?? false),
            'accepts_api_key' => (bool) ($meta['accepts_api_key'] ?? false),
            'fetches_models' => (bool) ($meta['fetches_models'] ?? false),
            'default_base_url' => $meta['default_base_url'] ?? '',
            'supported_roles' => $meta['supported_roles'],
            'suggested_models' => $meta['suggested_models'],
            'config_fields' => $meta['config_fields'],
        ])->values()->all();
    }

    /** @return array<string, mixed> */
    private function readGlobal(): array
    {
        $values = [];
        foreach (self::SETTING_KEYS as $key) {
            $values[$key] = $this->settings->getGlobal($key);
        }
        $values['ai_api_key'] = $this->joinKeyParts(
            $values['ai_api_key'],
            fn (string $part): mixed => $this->settings->getGlobal($part),
        );

        return $values;
    }

    /**
     * Put the encrypted key back together from its rows.
     *
     * @param  callable(string): mixed  $read  reads one continuation row by its key
     */
    private function joinKeyParts(mixed $first, callable $read): mixed
    {
        if (! is_string($first) || $first === '') {
            return $first;
        }

        foreach (self::KEY_PART_KEYS as $part) {
            $next = $read($part);
            if (! is_string($next) || $next === '') {
                break;
            }
            $first .= $next;
        }

        return $first;
    }

    /**
     * Store the (encrypted) key as rows that fit the host column, and clear
     * any continuation rows a longer earlier key left behind.
     *
     * @param  callable(string, string): mixed  $put
     * @param  callable(string): mixed  $delete
     */
    private function writeKeyParts(mixed $value, callable $put, callable $delete): void
    {
        $chunks = is_string($value) && $value !== '' ? str_split($value, self::KEY_CHUNK_LENGTH) : [''];
        $put('ai_api_key', $chunks[0]);

        foreach (self::KEY_PART_KEYS as $index => $part) {
            isset($chunks[$index + 1]) ? $put($part, $chunks[$index + 1]) : $delete($part);
        }
    }

    /** @param array<string, mixed> $settings @return array<string, mixed> */
    private function decrypt(array $settings): array
    {
        if (! empty($settings['ai_api_key'])) {
            try {
                $settings['ai_api_key'] = Crypt::decryptString((string) $settings['ai_api_key']);
            } catch (\Throwable) {
                // Older core installations stored the key before encryption.
            }
        }

        return $settings;
    }

    /** @param array<string, mixed> $settings @return array<string, mixed> */
    private function hydrateDefaults(array $settings): array
    {
        return array_merge([
            'ai_enabled' => 'NO', 'ai_driver' => 'openrouter', 'ai_api_key' => '', 'ai_base_url' => '',
            'ai_chat_enabled' => 'NO', 'ai_chat_model' => 'anthropic/claude-sonnet-4.6',
            'ai_text_generation_enabled' => 'NO', 'ai_text_generation_model' => 'anthropic/claude-haiku-4.5',
        ], array_filter($settings, static fn (mixed $value): bool => $value !== null));
    }

    /** @param array<string, mixed> $payload @return array<string, mixed> */
    private function storageValues(array $payload): array
    {
        $values = [];
        foreach (self::SETTING_KEYS as $key) {
            if (! array_key_exists($key, $payload)) {
                continue;
            }
            $value = $payload[$key];
            $values[$key] = $key === 'ai_api_key' && is_string($value) && $value !== ''
                ? Crypt::encryptString($value)
                : $value;
        }

        return $values;
    }
}
