<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Scheduling;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use InvoiceShelf\Modules\Contracts\Host\SettingsStore;
use Modules\AiAssistant\Application\AiAssistantService;
use Modules\AiAssistant\Application\AiConfigurationService;
use Modules\AiAssistant\Models\AiScheduledTask;
use RuntimeException;
use Throwable;

/**
 * Runs the assistant's scheduled tasks.
 *
 * A task is a prompt sent to the same chat service as a person's message, as
 * the member who owns the task, so it can read exactly what that member may
 * read and no more. Each run is a new conversation in that member's history,
 * which is where the result is delivered.
 */
final class ScheduledTaskRunner
{
    public function __construct(
        private readonly AiAssistantService $assistant,
        private readonly AiConfigurationService $configuration,
        private readonly SettingsStore $settings,
    ) {}

    public function timezone(int $companyId): string
    {
        $zone = $this->settings->getCompany($companyId, 'time_zone');

        return is_string($zone) && in_array($zone, \DateTimeZone::listIdentifiers(), true) ? $zone : 'UTC';
    }

    public function nextRunFor(AiScheduledTask $task, ?CarbonInterface $after = null): CarbonImmutable
    {
        return TaskSchedule::next(
            $task->frequency,
            $task->day,
            $task->run_at,
            $this->timezone($task->company_id),
            $after ?? CarbonImmutable::now(),
        );
    }

    /** Run every enabled task whose time has come; returns how many ran. */
    public function runDue(CarbonInterface $now): int
    {
        $ran = 0;

        $due = AiScheduledTask::query()
            ->where('enabled', true)
            ->whereNotNull('next_run_at')
            ->where('next_run_at', '<=', $now)
            ->orderBy('next_run_at')
            ->get();

        foreach ($due as $task) {
            if ($this->claim($task, $now)) {
                $this->run($task, $now);
                $ran++;
            }
        }

        return $ran;
    }

    /**
     * Move the task on before it runs, in one conditional update, so two
     * overlapping runners cannot both take it and a crash cannot repeat it.
     */
    private function claim(AiScheduledTask $task, CarbonInterface $now): bool
    {
        $claimed = AiScheduledTask::query()
            ->whereKey($task->id)
            ->where('next_run_at', $task->next_run_at)
            ->update(['next_run_at' => $this->nextRunFor($task, $now)]);

        return $claimed === 1;
    }

    /** Run one task now, whatever its schedule says. */
    public function run(AiScheduledTask $task, ?CarbonInterface $now = null): AiScheduledTask
    {
        $now ??= CarbonImmutable::now();
        $status = AiScheduledTask::STATUS_OK;
        $error = null;
        $conversationId = null;

        try {
            $resolved = $this->configuration->resolveForCompany($task->company_id);

            if ($resolved === null || empty($resolved['chat_enabled'])) {
                $status = AiScheduledTask::STATUS_SKIPPED;
                $error = 'The AI assistant chat is not enabled for this company.';
            } else {
                $message = $this->actingAs($task->user_id, function () use ($task, $now, &$conversationId) {
                    $conversation = $this->assistant->startConversation($task->company_id, $task->user_id);
                    $conversation->title = Str::limit($task->name.' – '.CarbonImmutable::instance($now)->setTimezone($this->timezone($task->company_id))->format('j M Y'), 60);
                    $conversation->save();
                    $conversationId = $conversation->id;

                    return $this->assistant->chat($conversation, $task->prompt);
                });

                if (str_starts_with((string) $message->content, 'Error:')) {
                    $status = AiScheduledTask::STATUS_FAILED;
                    $error = Str::limit(trim(substr((string) $message->content, 6)), 500);
                }
            }
        } catch (Throwable $e) {
            report($e);
            $status = AiScheduledTask::STATUS_FAILED;
            $error = Str::limit($e->getMessage(), 500);
        }

        $task->forceFill([
            'last_run_at' => $now,
            'last_status' => $status,
            'last_error' => $error,
            'last_conversation_id' => $conversationId ?? $task->last_conversation_id,
        ])->save();

        return $task;
    }

    /**
     * Run as the task's member, so the host's own permission checks apply to
     * everything the assistant reads.
     *
     * @template T
     *
     * @param  callable(): T  $callback
     * @return T
     */
    private function actingAs(int $userId, callable $callback): mixed
    {
        $user = Auth::guard('web')->getProvider()->retrieveById($userId);

        if ($user === null) {
            throw new RuntimeException('The member this task runs as no longer exists.');
        }

        $guard = Auth::guard('sanctum');
        $previousDefault = Auth::getDefaultDriver();
        $previousUser = $guard->hasUser() ? $guard->user() : null;

        Auth::shouldUse('sanctum');
        $guard->setUser($user);

        try {
            return $callback();
        } finally {
            // Leave the guard as it was found: this may run inside a request.
            $previousUser !== null ? $guard->setUser($previousUser) : $guard->forgetUser();
            Auth::shouldUse($previousDefault);
        }
    }
}
