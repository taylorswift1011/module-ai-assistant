<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Drivers;

use InvoiceShelf\Modules\Ai\Contracts\AiDriver;
use InvoiceShelf\Modules\Ai\Data\AiChatResponse;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * Claude Code (subscription) driver.
 *
 * Runs the official `claude` CLI headlessly (`claude -p`), so inference is
 * billed to the Claude subscription the CLI is logged in with. No API key is
 * stored by InvoiceShelf: an operator runs `claude login` once, as the user
 * the web server runs as. The CLI is started with every built-in tool and
 * slash command disabled, so it only ever answers the prompt.
 *
 * The CLI has no native OpenAI-style function calling, so tools are described
 * in the system prompt and the model replies with a JSON `tool_calls` object
 * when it wants one run. The binary comes from the host environment
 * (`CLAUDE_CLI_PATH`, default `claude`), never from an admin-editable setting.
 */
class ClaudeCliDriver extends AiDriver
{
    protected const TIMEOUT_SECONDS = 180;

    protected const MODEL_PATTERN = '/^[A-Za-z0-9][A-Za-z0-9._\-\[\]]{0,99}$/';

    public function chatCompletion(
        array $messages,
        string $model,
        array $tools = [],
        array $options = [],
    ): AiChatResponse {
        $system = [];
        $transcript = [];

        foreach ($messages as $message) {
            $role = (string) ($message['role'] ?? 'user');
            $content = (string) ($message['content'] ?? '');

            if ($role === 'system') {
                $system[] = $content;

                continue;
            }

            if ($role === 'tool') {
                $transcript[] = '[Tool result for '.($message['tool_call_id'] ?? '').']'."\n".$content;

                continue;
            }

            if ($role === 'assistant' && ! empty($message['tool_calls'])) {
                $calls = array_map(static fn (array $call): array => [
                    'name' => $call['function']['name'] ?? '',
                    'arguments' => json_decode((string) ($call['function']['arguments'] ?? '{}'), true) ?: new \stdClass,
                ], $message['tool_calls']);
                $transcript[] = '[Assistant]'."\n".json_encode(['tool_calls' => $calls], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

                continue;
            }

            $transcript[] = ($role === 'assistant' ? '[Assistant]' : '[User]')."\n".$content;
        }

        if ($tools !== []) {
            $system[] = $this->toolInstructions($tools);
        }

        $transcript[] = '[Assistant]';

        $run = $this->run(implode("\n\n", $system), implode("\n\n", $transcript), $model);
        $text = trim($run['text']);
        $toolCalls = $tools !== [] ? $this->extractToolCalls($text) : [];

        return new AiChatResponse(
            message: $toolCalls === [] ? $text : null,
            toolCalls: $toolCalls,
            finishReason: $toolCalls === [] ? 'stop' : 'tool_calls',
            usage: $run['usage'],
            model: $model,
        );
    }

    public function textCompletion(string $prompt, string $model, array $options = []): string
    {
        return $this->run('', $prompt, $model)['text'];
    }

    public function validateConnection(): array
    {
        $run = $this->run('Reply with the single word OK.', 'ping', 'haiku');

        return ['ok' => true, 'response' => mb_substr(trim($run['text']), 0, 40)];
    }

    public function listModels(): array
    {
        return [];
    }

    /**
     * @return array{text: string, usage: array{tokens_in?: int, tokens_out?: int}}
     */
    protected function run(string $system, string $prompt, string $model): array
    {
        if (preg_match(self::MODEL_PATTERN, $model) !== 1) {
            throw new AiException('Invalid Claude model name', 'invalid_model');
        }

        $command = [
            $this->binary(), '-p',
            '--model', $model,
            '--output-format', 'json',
            '--tools', '',
            '--disable-slash-commands',
            '--strict-mcp-config',
            '--no-session-persistence',
        ];
        if ($system !== '') {
            $command[] = '--system-prompt';
            $command[] = $system;
        }

        // Run from a neutral directory so no project CLAUDE.md or settings are picked up.
        $process = new Process($command, sys_get_temp_dir(), null, $prompt, self::TIMEOUT_SECONDS);

        try {
            $process->run();
        } catch (ProcessTimedOutException $e) {
            throw new AiException('The Claude CLI timed out', 'server_error', 0, $e);
        } catch (Throwable $e) {
            throw new AiException('Unable to run the Claude CLI: '.$e->getMessage(), 'cli_unavailable', 0, $e);
        }

        if ($process->getExitCode() === 127 || str_contains($process->getErrorOutput(), 'not found')) {
            throw new AiException('The Claude CLI is not installed on the server', 'cli_unavailable');
        }

        $body = json_decode($process->getOutput(), true);
        if (! is_array($body)) {
            throw new AiException('The Claude CLI returned no result: '.mb_substr(trim($process->getErrorOutput()), 0, 300), 'server_error');
        }

        if (($body['is_error'] ?? false) === true) {
            $message = (string) ($body['result'] ?? 'unknown error');
            $notLoggedIn = str_contains(strtolower($message), 'not logged in') || str_contains(strtolower($message), '/login');

            throw new AiException(
                $notLoggedIn ? 'The Claude CLI is not logged in. Run `claude login` as the web server user.' : 'Claude CLI error: '.$message,
                $notLoggedIn ? 'invalid_key' : (str_contains(strtolower($message), 'limit') ? 'rate_limited' : 'server_error'),
            );
        }

        $usage = $body['usage'] ?? [];

        return [
            'text' => (string) ($body['result'] ?? ''),
            'usage' => [
                'tokens_in' => (int) ($usage['input_tokens'] ?? 0)
                    + (int) ($usage['cache_creation_input_tokens'] ?? 0)
                    + (int) ($usage['cache_read_input_tokens'] ?? 0),
                'tokens_out' => (int) ($usage['output_tokens'] ?? 0),
            ],
        ];
    }

    /**
     * The binary is host configuration (`CLAUDE_CLI_PATH`); the callers never
     * pass `cli_path` from user input, so an admin cannot choose what runs.
     */
    protected function binary(): string
    {
        $path = $this->config['cli_path'] ?? getenv('CLAUDE_CLI_PATH');

        return is_string($path) && $path !== '' ? $path : 'claude';
    }

    /**
     * @param  array<int, array<string, mixed>>  $tools  OpenAI tools schema.
     */
    protected function toolInstructions(array $tools): string
    {
        $lines = [];
        foreach ($tools as $tool) {
            $function = $tool['function'] ?? $tool;
            $lines[] = '- '.($function['name'] ?? '').': '.($function['description'] ?? '')."\n  parameters (JSON schema): "
                .json_encode($function['parameters'] ?? new \stdClass, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return "You can call these tools to look up data:\n".implode("\n", $lines)
            ."\n\nTo call one or more tools, reply with ONLY a JSON object, no other text and no code fence: "
            .'{"tool_calls":[{"name":"<tool name>","arguments":{...}}]}. '
            .'Tool results then arrive as "[Tool result ...]" messages. '
            .'When you have what you need, or need no tool, reply normally in plain text.';
    }

    /**
     * @return array<int, array{id: string, name: string, arguments: array<string, mixed>}>
     */
    protected function extractToolCalls(string $text): array
    {
        $json = trim($text);
        if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/s', $json, $m) === 1) {
            $json = $m[1];
        }
        if ($json === '' || $json[0] !== '{') {
            return [];
        }

        $decoded = json_decode($json, true);
        if (! is_array($decoded) || ! is_array($decoded['tool_calls'] ?? null)) {
            return [];
        }

        $calls = [];
        foreach ($decoded['tool_calls'] as $i => $call) {
            $name = is_array($call) ? ($call['name'] ?? null) : null;
            if (! is_string($name) || $name === '') {
                continue;
            }
            $arguments = $call['arguments'] ?? [];
            $calls[] = [
                'id' => 'call_'.bin2hex(random_bytes(6)).'_'.$i,
                'name' => $name,
                'arguments' => is_array($arguments) ? $arguments : [],
            ];
        }

        return $calls;
    }
}
