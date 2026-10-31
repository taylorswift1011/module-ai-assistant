<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use Modules\AiAssistant\Drivers\ClaudeCliDriver;
use PHPUnit\Framework\TestCase;

final class ClaudeCliDriverTest extends TestCase
{
    private string $dir;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir().'/claude-cli-test-'.bin2hex(random_bytes(4));
        mkdir($this->dir);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->dir.'/*') ?: [] as $file) {
            unlink($file);
        }
        rmdir($this->dir);
    }

    /** A stand-in `claude` that records its argv and stdin, then prints the given result JSON. */
    private function fakeCli(string $stdout): string
    {
        $path = $this->dir.'/claude';
        file_put_contents($path, "#!/bin/sh\nprintf '%s\\n' \"\$@\" > {$this->dir}/argv\ncat > {$this->dir}/stdin\ncat <<'JSON'\n{$stdout}\nJSON\n");
        chmod($path, 0755);

        return $path;
    }

    private function ok(string $text): string
    {
        return (string) json_encode(['type' => 'result', 'is_error' => false, 'result' => $text, 'usage' => [
            'input_tokens' => 10, 'cache_creation_input_tokens' => 2, 'cache_read_input_tokens' => 3, 'output_tokens' => 7,
        ]]);
    }

    public function test_plain_reply_is_returned_with_usage_and_tools_are_disabled(): void
    {
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->fakeCli($this->ok('Hello there'))]);
        $response = $driver->chatCompletion([
            ['role' => 'system', 'content' => 'You are helpful.'],
            ['role' => 'user', 'content' => 'Hi'],
        ], 'sonnet');

        self::assertSame('Hello there', $response->message);
        self::assertFalse($response->hasToolCalls());
        self::assertSame(['tokens_in' => 15, 'tokens_out' => 7], $response->usage);

        $argv = file_get_contents($this->dir.'/argv');
        self::assertStringContainsString("--tools\n\n", $argv);
        self::assertStringContainsString('--no-session-persistence', $argv);
        self::assertStringContainsString("--system-prompt\nYou are helpful.", $argv);
        self::assertStringContainsString("[User]\nHi", (string) file_get_contents($this->dir.'/stdin'));
    }

    public function test_a_json_tool_call_reply_becomes_tool_calls(): void
    {
        $reply = "```json\n{\"tool_calls\":[{\"name\":\"search_invoices\",\"arguments\":{\"limit\":5}}]}\n```";
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->fakeCli($this->ok($reply))]);
        $tools = [['type' => 'function', 'function' => ['name' => 'search_invoices', 'description' => 'Find invoices', 'parameters' => ['type' => 'object']]]];

        $response = $driver->chatCompletion([['role' => 'user', 'content' => 'latest invoices?']], 'sonnet', $tools);

        self::assertTrue($response->hasToolCalls());
        self::assertNull($response->message);
        self::assertSame('search_invoices', $response->toolCalls[0]['name']);
        self::assertSame(5, $response->toolCalls[0]['arguments']['limit']);
        self::assertNotSame('', $response->toolCalls[0]['id']);
        self::assertStringContainsString('search_invoices: Find invoices', (string) file_get_contents($this->dir.'/argv'));
    }

    public function test_tool_results_and_prior_tool_calls_are_replayed_in_the_transcript(): void
    {
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->fakeCli($this->ok('Done'))]);
        $driver->chatCompletion([
            ['role' => 'user', 'content' => 'q'],
            ['role' => 'assistant', 'content' => null, 'tool_calls' => [['id' => 'c1', 'type' => 'function', 'function' => ['name' => 't', 'arguments' => '{"a":1}']]]],
            ['role' => 'tool', 'tool_call_id' => 'c1', 'content' => '{"rows":[]}'],
        ], 'haiku');

        $stdin = (string) file_get_contents($this->dir.'/stdin');
        self::assertStringContainsString('{"tool_calls":[{"name":"t","arguments":{"a":1}}]}', $stdin);
        self::assertStringContainsString("[Tool result for c1]\n{\"rows\":[]}", $stdin);
    }

    public function test_not_logged_in_maps_to_invalid_key(): void
    {
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->fakeCli('{"is_error":true,"result":"Not logged in · Please run /login"}')]);
        try {
            $driver->validateConnection();
            self::fail('Expected an AiException.');
        } catch (AiException $e) {
            self::assertSame('invalid_key', $e->errorKey);
        }
    }

    public function test_a_missing_binary_is_reported(): void
    {
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->dir.'/does-not-exist']);
        $this->expectException(AiException::class);
        $driver->textCompletion('hi', 'sonnet');
    }

    public function test_a_model_name_that_could_be_a_flag_is_rejected(): void
    {
        $driver = new ClaudeCliDriver('', ['cli_path' => $this->fakeCli($this->ok('x'))]);
        try {
            $driver->textCompletion('hi', '--dangerously-skip-permissions');
            self::fail('Expected an AiException.');
        } catch (AiException $e) {
            self::assertSame('invalid_model', $e->errorKey);
        }
    }
}
