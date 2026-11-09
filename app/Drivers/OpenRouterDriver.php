<?php

namespace Modules\AiAssistant\Drivers;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use InvoiceShelf\Modules\Ai\Contracts\AiDriver;
use InvoiceShelf\Modules\Ai\Data\AiChatResponse;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use Modules\AiAssistant\Support\Net\BlockedUrlException;
use Modules\AiAssistant\Support\Net\PrivateNetworkGuard;
use Throwable;

/**
 * OpenRouter driver.
 *
 * OpenRouter is an OpenAI-compatible aggregator that routes requests to
 * hundreds of underlying LLMs (OpenAI, Anthropic, Google, open-source, etc.)
 * behind a single API key and a single request shape. That makes it ideal as
 * the default v1 driver — one integration unlocks the whole ecosystem.
 *
 * Endpoint: POST {base_url}/chat/completions (OpenAI format)
 * Auth:     Bearer token in Authorization header
 * Docs:     https://openrouter.ai/docs
 */
class OpenRouterDriver extends AiDriver
{
    protected const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

    protected const TIMEOUT_SECONDS = 120;

    /** Memoised, SSRF-validated base URL so we don't re-resolve DNS per request. */
    private ?string $validatedBaseUrl = null;

    public function chatCompletion(
        array $messages,
        string $model,
        array $tools = [],
        array $options = [],
    ): AiChatResponse {
        // Resolve (and SSRF-validate) the URL before the try so a blocked base
        // URL surfaces as `invalid_base_url`, not a generic `server_error`.
        $endpoint = $this->getBaseUrl().'/chat/completions';

        $payload = array_filter([
            'model' => $model,
            'messages' => $messages,
            'tools' => $tools !== [] ? $tools : null,
            'tool_choice' => $tools !== [] ? ($options['tool_choice'] ?? 'auto') : null,
            'temperature' => $options['temperature'] ?? null,
            'max_tokens' => $options['max_tokens'] ?? null,
        ], fn ($v) => $v !== null);

        try {
            $response = $this->request(static::TIMEOUT_SECONDS)
                ->acceptJson()
                ->asJson()
                ->post($endpoint, $payload);
        } catch (Throwable $e) {
            throw new AiException(
                $this->providerName().' request failed: '.$e->getMessage(),
                'server_error',
                0,
                $e,
            );
        }

        if ($response->status() === 401) {
            throw new AiException('Invalid '.$this->providerName().' API key', 'invalid_key');
        }

        if ($response->status() === 429) {
            throw new AiException($this->providerName().' rate limit exceeded', 'rate_limited');
        }

        if (! $response->successful()) {
            $errorBody = $response->json('error.message') ?? $response->body();
            throw new AiException(
                $this->providerName().' returned '.$response->status().': '.$errorBody,
                'server_error',
            );
        }

        return $this->parseChatResponse($response->json());
    }

    public function textCompletion(string $prompt, string $model, array $options = []): string
    {
        $response = $this->chatCompletion(
            [['role' => 'user', 'content' => $prompt]],
            $model,
            [],
            $options,
        );

        return $response->message ?? '';
    }

    public function validateConnection(): array
    {
        // Resolve (and SSRF-validate) the URL before the try so a blocked base
        // URL surfaces as `invalid_base_url`, not a generic `server_error`.
        $endpoint = $this->getBaseUrl().'/models';

        try {
            $response = $this->request(30)
                ->acceptJson()
                ->get($endpoint);
        } catch (Throwable $e) {
            throw new AiException(
                'Unable to reach '.$this->providerName().': '.$e->getMessage(),
                'server_error',
                0,
                $e,
            );
        }

        if ($response->status() === 401) {
            throw new AiException('Invalid '.$this->providerName().' API key', 'invalid_key');
        }

        if (! $response->successful()) {
            throw new AiException(
                $this->providerName().' validation failed with status '.$response->status(),
                'server_error',
            );
        }

        $data = $response->json('data', []);

        return [
            'ok' => true,
            'model_count' => is_array($data) ? count($data) : 0,
        ];
    }

    public function listModels(): array
    {
        try {
            $response = $this->request(30)
                ->acceptJson()
                ->get($this->getBaseUrl().'/models');
        } catch (Throwable) {
            return [];
        }

        if (! $response->successful()) {
            return [];
        }

        $models = $response->json('data', []);

        if (! is_array($models)) {
            return [];
        }

        return array_map(
            fn (array $m): array => [
                'value' => $m['id'] ?? '',
                'label' => $m['name'] ?? ($m['id'] ?? ''),
            ],
            $models,
        );
    }

    /**
     * @param  array<string, mixed>|null  $body
     */
    protected function parseChatResponse(?array $body): AiChatResponse
    {
        $choice = $body['choices'][0] ?? [];
        $message = $choice['message'] ?? [];

        $text = $message['content'] ?? null;
        $finishReason = $choice['finish_reason'] ?? 'stop';

        // Normalize OpenAI's tool_calls shape — each entry has id, type='function',
        // and function.{name,arguments} where arguments is a JSON string we need to decode.
        $toolCalls = [];
        foreach ($message['tool_calls'] ?? [] as $call) {
            $name = $call['function']['name'] ?? null;
            $rawArgs = $call['function']['arguments'] ?? '{}';
            $args = is_string($rawArgs) ? (json_decode($rawArgs, true) ?: []) : (array) $rawArgs;

            if ($name === null) {
                continue;
            }

            $toolCalls[] = [
                'id' => $call['id'] ?? '',
                'name' => $name,
                'arguments' => $args,
            ];
        }

        $usage = [];
        if (isset($body['usage'])) {
            $usage = [
                'tokens_in' => (int) ($body['usage']['prompt_tokens'] ?? 0),
                'tokens_out' => (int) ($body['usage']['completion_tokens'] ?? 0),
            ];
        }

        return new AiChatResponse(
            message: $text,
            toolCalls: $toolCalls,
            finishReason: $finishReason,
            usage: $usage,
            model: $body['model'] ?? null,
        );
    }

    /** The name used in error messages. */
    protected function providerName(): string
    {
        return 'OpenRouter';
    }

    /** A request carrying the bearer token, when there is one. */
    protected function request(int $timeout): PendingRequest
    {
        $request = $this->apiKey !== '' ? Http::withToken($this->apiKey) : Http::withHeaders([]);

        return $request->timeout($timeout);
    }

    /** Throws when the configured base URL may not be called. */
    protected function assertBaseUrlAllowed(string $url): void
    {
        PrivateNetworkGuard::assertAllowed($url);
    }

    protected function getBaseUrl(): string
    {
        if ($this->validatedBaseUrl !== null) {
            return $this->validatedBaseUrl;
        }

        $configured = (string) ($this->config['base_url'] ?? '');
        $url = rtrim($configured !== '' ? $configured : static::DEFAULT_BASE_URL, '/');

        // SSRF guard: never let an admin/owner-supplied base URL point the
        // server (with the bearer token attached) at a private/reserved host.
        try {
            $this->assertBaseUrlAllowed($url);
        } catch (BlockedUrlException $exception) {
            throw new AiException('Invalid AI base URL: '.$exception->getMessage(), 'invalid_base_url', 0, $exception);
        }

        return $this->validatedBaseUrl = $url;
    }
}
