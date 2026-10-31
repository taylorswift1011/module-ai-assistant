<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Company;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AiAssistant\Http\AiConfigurationController;
use Modules\AiAssistant\Http\Requests\AiConfigurationRequest;
use Modules\AiAssistant\Http\Requests\ConnectionTestRequest;

final class CompanyAiConfigurationController extends AiConfigurationController
{
    public function getConfig(Request $request): JsonResponse
    {
        $this->authorizeAbility('owner only');

        return response()->json($this->masked($this->configuration->getCompanyConfig((int) $request->header('company'))));
    }

    public function saveConfig(AiConfigurationRequest $request): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $companyId = (int) $request->header('company');
        $values = $request->validated();
        if (($values['use_custom_ai_config'] ?? 'NO') === 'YES'
            && $this->configuration->driverIsGlobalOnly((string) ($values['ai_driver'] ?? ''))) {
            return response()->json(['error' => 'global_only_driver', 'message' => 'This provider can only be set by a super admin.'], 422);
        }
        if (in_array($values['ai_api_key'] ?? '', ['', '********'], true)) {
            $values['ai_api_key'] = $this->configuration->getCompanyConfig($companyId)['ai_api_key'];
        }
        $this->configuration->saveCompanyConfig($companyId, $values);

        return response()->json(['success' => true]);
    }

    public function testConnection(ConnectionTestRequest $request): JsonResponse
    {
        $this->authorizeAbility('owner only');

        if ($this->configuration->driverIsGlobalOnly((string) $request->validated()['ai_driver'])) {
            return response()->json(['error' => 'global_only_driver', 'message' => 'This provider can only be set by a super admin.'], 422);
        }

        return $this->testConfiguration($request->validated(), $this->configuration->getCompanyConfig((int) $request->header('company')));
    }
}
