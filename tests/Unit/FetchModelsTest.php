<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use Modules\AiAssistant\Drivers\LocalOpenAiDriver;
use Modules\AiAssistant\Support\Net\PrivateNetworkGuard;
use PHPUnit\Framework\TestCase;

final class FetchModelsTest extends TestCase
{
    protected function setUp(): void
    {
        putenv(PrivateNetworkGuard::ALLOWED_HOSTS_ENV.'=10.1.2.20');
    }

    protected function tearDown(): void
    {
        putenv(PrivateNetworkGuard::ALLOWED_HOSTS_ENV);
    }

    /** @param array<string, mixed> $config */
    private function driver(mixed $response, array $config = ['base_url' => 'http://10.1.2.20:11434/v1'], string $key = ''): LocalOpenAiDriver
    {
        $factory = (new Factory)->fake(['*' => $response]);

        return new class($key, $config, $factory) extends LocalOpenAiDriver
        {
            public function __construct(string $key, array $config, private readonly Factory $factory)
            {
                parent::__construct($key, $config);
            }

            protected function request(int $timeout): PendingRequest
            {
                return $this->factory->timeout($timeout);
            }
        };
    }

    public function test_the_openai_list_is_returned_sorted_and_without_duplicates(): void
    {
        $driver = $this->driver(Factory::response(['data' => [
            ['id' => 'qwen2.5:7b'], ['id' => 'Llama3.1:8b'], ['id' => 'qwen2.5:7b'], ['object' => 'model'],
        ]]));

        self::assertSame([
            ['value' => 'Llama3.1:8b', 'label' => 'Llama3.1:8b'],
            ['value' => 'qwen2.5:7b', 'label' => 'qwen2.5:7b'],
        ], $driver->fetchModels());
    }

    public function test_ollamas_native_list_shape_is_understood(): void
    {
        $driver = $this->driver(Factory::response(['models' => [['name' => 'mistral:latest', 'model' => 'mistral:latest']]]));

        self::assertSame([['value' => 'mistral:latest', 'label' => 'mistral:latest']], $driver->fetchModels());
    }

    public function test_a_rejected_key_and_a_server_error_say_what_went_wrong(): void
    {
        foreach ([[401, 'invalid_key'], [500, 'server_error']] as [$status, $key]) {
            try {
                $this->driver(Factory::response('nope', $status))->fetchModels();
                self::fail('Expected an AiException.');
            } catch (AiException $e) {
                self::assertSame($key, $e->errorKey);
            }
        }
    }

    public function test_list_models_stays_quiet_where_fetch_models_explains(): void
    {
        self::assertSame([], $this->driver(Factory::response('nope', 500))->listModels());
    }

    public function test_a_host_the_operator_did_not_name_is_never_called(): void
    {
        $this->expectException(AiException::class);
        $this->expectExceptionMessage('AI_LOCAL_ALLOWED_HOSTS');

        $this->driver(Factory::response(['data' => []]), ['base_url' => 'http://169.254.169.254/v1'])->fetchModels();
    }
}
