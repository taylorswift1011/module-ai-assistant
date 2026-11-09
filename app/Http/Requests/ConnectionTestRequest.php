<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Drivers\AiDriverFactory;
use Modules\AiAssistant\Rules\PublicHttpUrl;

final class ConnectionTestRequest extends FormRequest
{
    /** A provider without a Base URL field is saved without one, whatever the form still holds. */
    protected function prepareForValidation(): void
    {
        $meta = Registry::driverMeta('ai', (string) $this->input('ai_driver'));

        if (($meta['uses_base_url'] ?? true) === false) {
            $this->merge(['ai_base_url' => null]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    private function driverAllowsConfiguredHosts(): bool
    {
        return (bool) (Registry::driverMeta('ai', (string) $this->input('ai_driver'))['allows_configured_hosts'] ?? false);
    }

    public function rules(): array
    {
        return ['ai_driver' => ['required', 'string', Rule::in(AiDriverFactory::availableDrivers())], 'ai_api_key' => ['nullable', 'string', 'max:1000'], 'ai_base_url' => ['nullable', 'url', 'max:500', new PublicHttpUrl($this->driverAllowsConfiguredHosts())]];
    }
}
