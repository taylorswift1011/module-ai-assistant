<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Feature;

use Carbon\CarbonImmutable;
use Illuminate\Auth\GenericUser;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use InvoiceShelf\Modules\Ai\Contracts\AiDriver;
use InvoiceShelf\Modules\Ai\Data\AiChatResponse;
use InvoiceShelf\Modules\Ai\Exceptions\AiException;
use InvoiceShelf\Modules\Contracts\Host\ModuleAuthorization;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use InvoiceShelf\Modules\Registry;
use Modules\AiAssistant\Application\AiAssistantService;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Application\AiToolRegistry;
use Modules\AiAssistant\Application\Scheduling\ScheduledTaskRunner;
use Modules\AiAssistant\Http\Company\ScheduledTaskController;
use Modules\AiAssistant\Http\Requests\ScheduledTaskRequest;
use Modules\AiAssistant\Models\AiConversation;
use Modules\AiAssistant\Models\AiMessage;
use Modules\AiAssistant\Models\AiScheduledTask;
use Orchestra\Testbench\TestCase;

final class ScheduledTasksTest extends TestCase
{
    private ScheduledStubSettings $settings;

    private ScheduledTaskRunner $runner;

    protected function getEnvironmentSetUp($app): void
    {
        $app['config']->set('app.key', 'base64:'.base64_encode(str_repeat('a', 32)));
        $app['config']->set('database.default', 'testing');
        $app['config']->set('database.connections.testing', ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true]);
        $app['config']->set('auth.guards.sanctum', ['driver' => 'session', 'provider' => 'users']);
        $app['config']->set('auth.providers.users', ['driver' => 'scheduled-stub']);
    }

    protected function defineDatabaseMigrations(): void
    {
        $this->loadMigrationsFrom(dirname(__DIR__, 2).'/database/migrations');
    }

    protected function setUp(): void
    {
        parent::setUp();

        Auth::provider('scheduled-stub', fn (): UserProvider => new ScheduledStubUsers);
        $this->settings = new ScheduledStubSettings;
        $this->settings->global = [
            'ai_enabled' => 'YES', 'ai_driver' => 'scheduled-stub', 'ai_api_key' => 'k', 'ai_chat_enabled' => 'YES', 'ai_chat_model' => 'm',
        ];
        $this->settings->company[41] = ['time_zone' => 'Pacific/Auckland'];
        $this->app->instance(SettingsStore::class, $this->settings);
        Registry::registerAiDriver('scheduled-stub', [
            'class' => ScheduledStubDriver::class, 'label' => 'stub', 'supported_roles' => ['chat'], 'suggested_models' => [], 'config_fields' => [],
        ]);
        ScheduledStubDriver::$reply = 'Forecast done.';
        ScheduledStubDriver::$requests = [];
        Gate::define('owner only', fn (): bool => true);
        Auth::shouldUse('sanctum');
        Auth::guard('sanctum')->setUser(new GenericUser(['id' => 7]));
        CarbonImmutable::setTestNow('2026-11-30 05:00:30'); // 18:00:30 NZDT on the 30th, just past month-end 18:00

        $this->runner = new ScheduledTaskRunner(
            new AiAssistantService(new AiConfigurationService($this->settings), new AiToolRegistry(new class implements ModuleAuthorization
            {
                public function allows(int $userId, int $companyId, string $ability, ?string $resource = null): bool
                {
                    return true;
                }
            }, [])),
            new AiConfigurationService($this->settings),
            $this->settings,
        );
    }

    protected function tearDown(): void
    {
        unset(Registry::$drivers['ai']['scheduled-stub']);
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    /** @param array<string, mixed> $attributes */
    private function task(array $attributes = []): AiScheduledTask
    {
        return AiScheduledTask::query()->create($attributes + [
            'company_id' => 41, 'user_id' => 7, 'name' => 'Month-end forecast', 'prompt' => 'Forecast next month.',
            'frequency' => 'month_end', 'run_at' => '18:00', 'enabled' => true,
            'next_run_at' => CarbonImmutable::parse('2026-11-30 05:00:00', 'UTC'),
        ]);
    }

    public function test_a_due_task_runs_as_its_member_and_lands_in_their_conversations(): void
    {
        $task = $this->task();

        self::assertSame(1, $this->runner->runDue(CarbonImmutable::now()));

        $task->refresh();
        self::assertSame('ok', $task->last_status);
        self::assertNull($task->last_error);
        $conversation = AiConversation::query()->findOrFail($task->last_conversation_id);
        self::assertSame(7, (int) $conversation->user_id);
        self::assertSame(41, (int) $conversation->company_id);
        self::assertSame('Month-end forecast – 30 Nov 2026', $conversation->title);
        self::assertSame(['user', 'assistant'], AiMessage::query()->where('conversation_id', $conversation->id)->orderBy('id')->pluck('role')->all());
        self::assertSame('Forecast done.', AiMessage::query()->where('conversation_id', $conversation->id)->where('role', 'assistant')->value('content'));
        self::assertSame('Forecast next month.', ScheduledStubDriver::$requests[0][1]['content']);
        // Moved on to the next month-end at 18:00 NZ time (a Thursday, daylight time): 31 Dec 05:00 UTC.
        self::assertSame('2026-12-31 05:00:00', $task->next_run_at->utc()->toDateTimeString());
    }

    public function test_a_task_is_not_run_twice_nor_before_it_is_due_nor_while_switched_off(): void
    {
        $this->task();
        $this->task(['name' => 'later', 'next_run_at' => CarbonImmutable::parse('2026-12-31 05:00:00', 'UTC')]);
        $this->task(['name' => 'off', 'enabled' => false]);

        self::assertSame(1, $this->runner->runDue(CarbonImmutable::now()));
        self::assertSame(0, $this->runner->runDue(CarbonImmutable::now()), 'the claim moved it on, so a second pass finds nothing');
        self::assertCount(1, ScheduledStubDriver::$requests);
    }

    public function test_a_company_with_chat_switched_off_is_skipped_and_still_moves_on(): void
    {
        $this->settings->global['ai_chat_enabled'] = 'NO';
        $task = $this->task();

        $this->runner->runDue(CarbonImmutable::now());

        $task->refresh();
        self::assertSame('skipped', $task->last_status);
        self::assertStringContainsString('not enabled', (string) $task->last_error);
        self::assertNull($task->last_conversation_id);
        self::assertTrue($task->next_run_at->greaterThan(CarbonImmutable::now()));
    }

    public function test_a_provider_failure_is_recorded_not_thrown(): void
    {
        ScheduledStubDriver::$fail = true;
        $task = $this->task();

        $this->runner->runDue(CarbonImmutable::now());

        ScheduledStubDriver::$fail = false;
        $task->refresh();
        self::assertSame('failed', $task->last_status);
        self::assertStringContainsString('model is down', (string) $task->last_error);
        self::assertNotNull($task->last_conversation_id, 'the error is still readable in the conversation');
    }

    public function test_a_member_who_no_longer_exists_fails_the_task_without_running_it(): void
    {
        $task = $this->task(['user_id' => 999]);

        $this->runner->runDue(CarbonImmutable::now());

        $task->refresh();
        self::assertSame('failed', $task->last_status);
        self::assertStringContainsString('no longer exists', (string) $task->last_error);
        self::assertSame([], ScheduledStubDriver::$requests);
    }

    private function request(array $body, string $method = 'POST', int $company = 41): ScheduledTaskRequest
    {
        $request = ScheduledTaskRequest::create('/', $method, $body);
        $request->headers->set('company', (string) $company);
        $request->setContainer($this->app);
        $request->setRedirector($this->app->make('redirect'));
        Auth::shouldUse('sanctum');
        Auth::guard('sanctum')->setUser(new GenericUser(['id' => 7]));

        return $request;
    }

    public function test_creating_a_task_schedules_it_for_the_companys_own_timezone_and_runs_as_the_creator(): void
    {
        $request = $this->request(['name' => 'Forecast', 'prompt' => 'Do it', 'frequency' => 'month_end', 'run_at' => '18:00']);
        $request->validateResolved();

        $response = (new ScheduledTaskController($this->runner))->store($request);

        self::assertSame(201, $response->getStatusCode());
        $task = AiScheduledTask::query()->firstOrFail();
        self::assertSame(7, (int) $task->user_id);
        self::assertSame(41, (int) $task->company_id);
        self::assertTrue($task->enabled);
        self::assertNull($task->day);
        self::assertSame('2026-12-31 05:00:00', $task->next_run_at->utc()->toDateTimeString());
    }

    public function test_the_schedule_is_validated(): void
    {
        foreach ([
            ['name' => 'x', 'prompt' => 'p', 'frequency' => 'weekly', 'run_at' => '09:00'],
            ['name' => 'x', 'prompt' => 'p', 'frequency' => 'weekly', 'day' => 8, 'run_at' => '09:00'],
            ['name' => 'x', 'prompt' => 'p', 'frequency' => 'monthly', 'run_at' => '09:00'],
            ['name' => 'x', 'prompt' => 'p', 'frequency' => 'yearly', 'run_at' => '09:00'],
            ['name' => 'x', 'prompt' => 'p', 'frequency' => 'daily', 'run_at' => '9am'],
            ['name' => '', 'prompt' => 'p', 'frequency' => 'daily', 'run_at' => '09:00'],
        ] as $body) {
            try {
                $this->request($body)->validateResolved();
                self::fail('Expected validation to fail for '.json_encode($body));
            } catch (ValidationException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_a_company_is_capped_and_tasks_are_never_shared_between_companies(): void
    {
        for ($i = 0; $i < ScheduledTaskController::MAX_TASKS_PER_COMPANY; $i++) {
            $this->task(['name' => "t{$i}"]);
        }
        $controller = new ScheduledTaskController($this->runner);
        $request = $this->request(['name' => 'one too many', 'prompt' => 'p', 'frequency' => 'daily', 'run_at' => '09:00']);
        $request->validateResolved();

        self::assertSame(422, $controller->store($request)->getStatusCode());

        $theirs = $this->task(['company_id' => 42, 'name' => 'other company']);
        $asCompany41 = tap(Request::create('/', 'DELETE'), fn (Request $r) => $r->headers->set('company', '41'));
        try {
            $controller->destroy($asCompany41, $theirs->id);
            self::fail('Another company\'s task must not be reachable.');
        } catch (ModelNotFoundException) {
            self::assertNotNull(AiScheduledTask::query()->find($theirs->id));
        }
    }

    public function test_run_now_makes_a_task_due_and_a_disabled_one_refuses(): void
    {
        $controller = new ScheduledTaskController($this->runner);
        $later = $this->task(['next_run_at' => CarbonImmutable::parse('2026-12-31 05:00:00', 'UTC')]);
        $off = $this->task(['name' => 'off', 'enabled' => false]);
        $http = fn (): Request => tap(Request::create('/'), fn (Request $r) => $r->headers->set('company', '41'));

        self::assertSame(200, $controller->runNow($http(), $later->id)->getStatusCode());
        self::assertTrue($later->refresh()->next_run_at->lessThan(CarbonImmutable::now()));
        self::assertSame(1, $this->runner->runDue(CarbonImmutable::now()));

        self::assertSame(422, $controller->runNow($http(), $off->id)->getStatusCode());
    }

    public function test_changing_the_schedule_retimes_the_task_and_switching_off_clears_it(): void
    {
        $controller = new ScheduledTaskController($this->runner);
        $task = $this->task();

        $request = $this->request(['frequency' => 'daily', 'run_at' => '07:30'], 'PUT');
        $request->validateResolved();
        $controller->update($request, $task->id);
        self::assertSame('2026-11-30 18:30:00', $task->refresh()->next_run_at->utc()->toDateTimeString(), '07:30 NZDT on 1 Dec is 18:30 UTC on the 30th');

        $off = $this->request(['enabled' => false], 'PUT');
        $off->validateResolved();
        $controller->update($off, $task->id);
        self::assertNull($task->refresh()->next_run_at);

        $on = $this->request(['enabled' => true], 'PUT');
        $on->validateResolved();
        $controller->update($on, $task->id);
        self::assertNotNull($task->refresh()->next_run_at);
    }
}

final class ScheduledStubUsers implements UserProvider
{
    public function retrieveById($identifier): ?Authenticatable
    {
        return in_array((int) $identifier, [7], true) ? new GenericUser(['id' => (int) $identifier]) : null;
    }

    public function retrieveByToken($identifier, $token): ?Authenticatable
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token): void {}

    public function retrieveByCredentials(array $credentials): ?Authenticatable
    {
        return null;
    }

    public function validateCredentials(Authenticatable $user, array $credentials): bool
    {
        return false;
    }

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): void {}
}

final class ScheduledStubSettings implements SettingsStore
{
    /** @var array<string, mixed> */
    public array $global = [];

    /** @var array<int, array<string, mixed>> */
    public array $company = [];

    public function getGlobal(string $key, mixed $default = null): mixed
    {
        return $this->global[$key] ?? $default;
    }

    public function putGlobal(string $key, mixed $value): void
    {
        $this->global[$key] = $value;
    }

    public function deleteGlobal(string $key): void
    {
        unset($this->global[$key]);
    }

    public function getCompany(int $companyId, string $key, mixed $default = null): mixed
    {
        return $this->company[$companyId][$key] ?? $default;
    }

    public function putCompany(int $companyId, string $key, mixed $value): void
    {
        $this->company[$companyId][$key] = $value;
    }

    public function deleteCompany(int $companyId, string $key): void
    {
        unset($this->company[$companyId][$key]);
    }

    public function deleteCompanyForAll(string $key): void {}
}

final class ScheduledStubDriver extends AiDriver
{
    public static string $reply = '';

    public static bool $fail = false;

    /** @var list<array<int, array<string, mixed>>> */
    public static array $requests = [];

    public function chatCompletion(array $messages, string $model, array $tools = [], array $options = []): AiChatResponse
    {
        if (self::$fail) {
            throw new AiException('model is down', 'server_error');
        }
        self::$requests[] = $messages;

        return new AiChatResponse(self::$reply);
    }

    public function textCompletion(string $prompt, string $model, array $options = []): string
    {
        return self::$reply;
    }

    public function validateConnection(): array
    {
        return ['ok' => true];
    }
}
