<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http;

use Illuminate\Http\JsonResponse;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Drivers\AiDriverFactory;

abstract class AiConfigurationController extends ModuleController
{
    public function __construct(protected readonly AiConfigurationService $configuration) {}

    /** @param array<string, mixed> $values @param array<string, mixed> $stored */
    protected function testConfiguration(array $values, array $stored): JsonResponse
    {
        $key = $values['ai_api_key'] ?? '';
        $key = in_array($key, ['', '********'], true) ? ($stored['ai_api_key'] ?? '') : $key;

        if ($key === '' && $this->configuration->driverRequiresApiKey((string) $values['ai_driver'])) {
            return response()->json(['error' => 'missing_api_key'], 422);
        }

        try {
            $details = AiDriverFactory::make(
                (string) $values['ai_driver'],
                (string) $key,
                ['base_url' => $values['ai_base_url'] ?? null],
            )->validateConnection();
        } catch (AiException $exception) {
            return response()->json([
                'error' => $exception->errorKey,
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json(['success' => true, 'details' => $details]);
    }

    /** @param array<string, mixed> $config @return array<string, mixed> */
    protected function masked(array $config): array
    {
        if (! empty($config['ai_api_key'])) {
            $config['ai_api_key'] = '********';
        }

        return $config;
    }
}
