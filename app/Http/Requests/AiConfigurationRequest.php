<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Drivers\AiDriverFactory;
use Modules\AiAssistant\Rules\PublicHttpUrl;

final class AiConfigurationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    private function driverRequiresApiKey(string $driver): bool
    {
        return (bool) (Registry::driverMeta('ai', $driver)['requires_api_key'] ?? true);
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'use_custom_ai_config' => ['nullable', Rule::in(['YES', 'NO'])],
            'ai_enabled' => ['nullable', Rule::in(['YES', 'NO'])],
            'ai_driver' => ['required_if:ai_enabled,YES', 'nullable', 'string', Rule::in(AiDriverFactory::availableDrivers())],
            'ai_api_key' => [
                Rule::requiredIf(fn (): bool => $this->input('ai_enabled') === 'YES'
                    && $this->driverRequiresApiKey((string) $this->input('ai_driver'))),
                'nullable', 'string', 'max:1000',
            ],
            'ai_base_url' => ['nullable', 'url', 'max:500', new PublicHttpUrl],
            'ai_chat_enabled' => ['nullable', Rule::in(['YES', 'NO'])],
            'ai_chat_model' => ['nullable', 'string', 'max:200'],
            'ai_text_generation_enabled' => ['nullable', Rule::in(['YES', 'NO'])],
            'ai_text_generation_model' => ['nullable', 'string', 'max:200'],
        ];
    }
}
