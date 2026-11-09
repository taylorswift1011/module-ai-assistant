<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Drivers;

use Illuminate\Http\Client\PendingRequest;
use Modules\AiAssistant\Support\Net\PrivateNetworkGuard;

/**
 * A local or self-hosted model behind an OpenAI-compatible API.
 *
 * Ollama, LM Studio, llama.cpp's server, vLLM, LocalAI and LiteLLM all answer
 * `POST {base_url}/chat/completions` and `GET {base_url}/models`, which is the
 * shape the OpenRouter driver already speaks. The differences are that the
 * API key is optional (sent as a bearer token only when one is set), the base
 * URL has no default on the public internet, and the host may be a private
 * address, but only one the operator named in AI_LOCAL_ALLOWED_HOSTS.
 */
class LocalOpenAiDriver extends OpenRouterDriver
{
    /** Local models are slower than a hosted API, especially on the first request. */
    protected const TIMEOUT_SECONDS = 300;

    protected const DEFAULT_BASE_URL = 'http://localhost:11434/v1';

    protected function providerName(): string
    {
        return 'the local AI server';
    }

    protected function request(int $timeout): PendingRequest
    {
        // A redirect could carry the call from a host the operator named to one they did not.
        return parent::request($timeout)->withoutRedirecting();
    }

    protected function assertBaseUrlAllowed(string $url): void
    {
        PrivateNetworkGuard::assertAllowed($url, true);
    }
}
