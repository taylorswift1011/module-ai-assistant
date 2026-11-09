<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Console;

use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Modules\AiAssistant\Application\Scheduling\ScheduledTaskRunner;
use Modules\AiAssistant\Models\AiScheduledTask;

final class RunScheduledTasksCommand extends Command
{
    protected $signature = 'ai-assistant:run-scheduled {--task= : Run this task id now, whatever its schedule}';

    protected $description = 'Run the AI assistant tasks that are due.';

    public function handle(ScheduledTaskRunner $runner): int
    {
        if ($this->option('task') !== null) {
            $task = AiScheduledTask::query()->find((int) $this->option('task'));
            if ($task === null) {
                $this->error('No such scheduled task.');

                return self::FAILURE;
            }

            $task = $runner->run($task);
            $this->line("#{$task->id} {$task->name}: {$task->last_status}".($task->last_error ? " ({$task->last_error})" : ''));

            return $task->last_status === AiScheduledTask::STATUS_FAILED ? self::FAILURE : self::SUCCESS;
        }

        $count = $runner->runDue(CarbonImmutable::now());
        if ($count > 0) {
            $this->info("Ran {$count} scheduled task(s).");
        }

        return self::SUCCESS;
    }
}
