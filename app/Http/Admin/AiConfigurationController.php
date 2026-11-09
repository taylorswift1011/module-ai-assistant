<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Admin;

use Illuminate\Http\JsonResponse;
use Modules\AiAssistant\Http\AiConfigurationController as BaseAiConfigurationController;
use Modules\AiAssistant\Http\Requests\AiConfigurationRequest;
use Modules\AiAssistant\Http\Requests\ConnectionTestRequest;

final class AiConfigurationController extends BaseAiConfigurationController
{
    public function getConfig(): JsonResponse
    {
        $this->authorizeAbility('manage ai config');

        return response()->json($this->masked($this->configuration->getGlobalConfig()));
    }

    public function saveConfig(AiConfigurationRequest $request): JsonResponse
    {
        $this->authorizeAbility('manage ai config');
        $values = $request->validated();
        if (in_array($values['ai_api_key'] ?? '', ['', '********'], true)) {
            $values['ai_api_key'] = $this->configuration->getGlobalConfig()['ai_api_key'];
        }
        $this->configuration->saveGlobalConfig($values);

        return response()->json(['success' => true]);
    }

    public function getDrivers(): JsonResponse
    {
        $this->authorizeAbility('manage ai config');

        return response()->json(['ai_drivers' => $this->configuration->listDrivers()]);
    }

    public function models(ConnectionTestRequest $request): JsonResponse
    {
        $this->authorizeAbility('manage ai config');

        return $this->listModelsFor($request->validated(), $this->configuration->getGlobalConfig());
    }

    public function testConnection(ConnectionTestRequest $request): JsonResponse
    {
        $this->authorizeAbility('manage ai config');

        return $this->testConfiguration($request->validated(), $this->configuration->getGlobalConfig());
    }
}
