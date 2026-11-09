<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Scheduling;

/** Ready-made scheduled tasks a company can start from; the prompt is theirs to edit. */
final class ScheduledTaskTemplates
{
    public const MONTH_END_FORECAST = 'month_end_forecast';

    /** @return list<array{key: string, name: string, description: string, prompt: string, frequency: string, day: int|null, run_at: string}> */
    public static function all(): array
    {
        return [[
            'key' => self::MONTH_END_FORECAST,
            'name' => 'Month-end forecast and salary recommendation',
            'description' => 'On the last day of each month: next month\'s expected costs, what is already due, and a suggested shareholder salary.',
            'frequency' => TaskSchedule::MONTH_END,
            'day' => null,
            'run_at' => '18:00',
            'prompt' => <<<'TEXT'
It is the end of the month. Prepare my expense forecast for next month and a recommended shareholder salary.

Start by calling get_expense_forecast_data (it does the arithmetic; do not recalculate its totals). Then write a short report with these sections:

1. **Forecast for next month** - a table of running costs by category using the projected figures, with a total. Keep owner pay (shareholder salary) separate from running costs. Mention any category that was lumpy rather than regular.
2. **Already known** - bills due next month, bills already overdue, and recurring costs due. Say if there are none.
3. **Money coming in** - the recent monthly average of customer receipts, and unpaid customer invoices due by the end of next month.
4. **Recommended shareholder salary** - give one figure and a sensible range. Work from expected receipts, subtract the forecast running costs and any overdue bills, set aside the tax charged on invoices (say what rate you assumed), and never recommend more than the surplus that is left. Show the sums in a small table, compare with the last three salary payments, and say plainly if there is no surplus.
5. **Assumptions and cautions** - list them briefly, including anything in the data's caveats and warnings.

Be concise (under 400 words), use the company currency, and remember this is an estimate to help me decide, not tax or accounting advice.
TEXT,
        ]];
    }
}
