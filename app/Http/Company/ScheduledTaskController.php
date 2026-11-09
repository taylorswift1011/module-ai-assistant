<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Company;

use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\AiAssistant\Application\Scheduling\ScheduledTaskRunner;
use Modules\AiAssistant\Application\Scheduling\ScheduledTaskTemplates;
use Modules\AiAssistant\Application\Scheduling\TaskSchedule;
use Modules\AiAssistant\Http\ModuleController;
use Modules\AiAssistant\Http\Requests\ScheduledTaskRequest;
use Modules\AiAssistant\Models\AiScheduledTask;

/** A company owner's scheduled assistant tasks. A task runs as the member who made it. */
final class ScheduledTaskController extends ModuleController
{
    public const MAX_TASKS_PER_COMPANY = 10;

    public function __construct(private readonly ScheduledTaskRunner $runner) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $companyId = $this->companyId($request);

        return response()->json([
            'timezone' => $this->runner->timezone($companyId),
            'tasks' => AiScheduledTask::query()->where('company_id', $companyId)->orderBy('name')->get()->map(fn (AiScheduledTask $task): array => $this->present($task))->all(),
            'templates' => ScheduledTaskTemplates::all(),
        ]);
    }

    public function store(ScheduledTaskRequest $request): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $companyId = $this->companyId($request);

        if (AiScheduledTask::query()->where('company_id', $companyId)->count() >= self::MAX_TASKS_PER_COMPANY) {
            return response()->json(['error' => 'too_many_tasks', 'message' => 'A company can have '.self::MAX_TASKS_PER_COMPANY.' scheduled tasks.'], 422);
        }

        $task = new AiScheduledTask($request->validated() + ['enabled' => true]);
        $task->company_id = $companyId;
        $task->user_id = (int) Auth::id();
        $task->day = $this->dayFor($task->frequency, $request->validated('day'));
        $task->next_run_at = $task->enabled ? $this->runner->nextRunFor($task) : null;
        $task->save();

        return response()->json(['task' => $this->present($task)], 201);
    }

    public function update(ScheduledTaskRequest $request, int $id): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $task = $this->find($request, $id);

        $task->fill($request->validated());
        $task->day = $this->dayFor($task->frequency, $task->day);
        // A changed schedule, or a task switched back on, is timed afresh from now.
        if ($task->isDirty(['frequency', 'day', 'run_at', 'enabled']) || ($task->enabled && $task->next_run_at === null)) {
            $task->next_run_at = $task->enabled ? $this->runner->nextRunFor($task) : null;
        }
        $task->save();

        return response()->json(['task' => $this->present($task)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $this->find($request, $id)->delete();

        return response()->json(['success' => true]);
    }

    /** Make the task due now; the scheduler picks it up within a minute. */
    public function runNow(Request $request, int $id): JsonResponse
    {
        $this->authorizeAbility('owner only');
        $task = $this->find($request, $id);

        if (! $task->enabled) {
            return response()->json(['error' => 'task_disabled', 'message' => 'Switch the task on before running it.'], 422);
        }

        $task->forceFill(['next_run_at' => CarbonImmutable::now()->subSecond()])->save();

        return response()->json(['task' => $this->present($task), 'message' => 'Queued. It runs within a minute and appears in your conversations.']);
    }

    private function find(Request $request, int $id): AiScheduledTask
    {
        return AiScheduledTask::query()->where('company_id', $this->companyId($request))->findOrFail($id);
    }

    private function companyId(Request $request): int
    {
        return (int) $request->header('company');
    }

    private function dayFor(string $frequency, mixed $day): ?int
    {
        return in_array($frequency, [TaskSchedule::WEEKLY, TaskSchedule::MONTHLY], true) ? (int) $day : null;
    }

    /** @return array<string, mixed> */
    private function present(AiScheduledTask $task): array
    {
        return [
            'id' => $task->id,
            'name' => $task->name,
            'prompt' => $task->prompt,
            'frequency' => $task->frequency,
            'day' => $task->day,
            'run_at' => $task->run_at,
            'enabled' => $task->enabled,
            'runs_as_you' => $task->user_id === (int) Auth::id(),
            'next_run_at' => $task->next_run_at?->toIso8601String(),
            'last_run_at' => $task->last_run_at?->toIso8601String(),
            'last_status' => $task->last_status,
            'last_error' => $task->last_error,
            'last_conversation_id' => $task->last_conversation_id,
        ];
    }
}
