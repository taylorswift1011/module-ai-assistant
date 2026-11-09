<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\AiAssistant\Application\Scheduling\TaskSchedule;

final class ScheduledTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $create = $this->isMethod('POST');
        $required = $create ? 'required' : 'sometimes';
        $frequency = (string) $this->input('frequency', '');

        return [
            'name' => [$required, 'string', 'max:120'],
            'prompt' => [$required, 'string', 'max:4000'],
            'frequency' => [$required, Rule::in(TaskSchedule::FREQUENCIES)],
            'day' => [
                Rule::requiredIf(fn (): bool => in_array($frequency, [TaskSchedule::WEEKLY, TaskSchedule::MONTHLY], true)),
                'nullable', 'integer', 'min:1', 'max:'.($frequency === TaskSchedule::WEEKLY ? 7 : 31),
            ],
            'run_at' => [$required, 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'enabled' => ['sometimes', 'boolean'],
        ];
    }
}
