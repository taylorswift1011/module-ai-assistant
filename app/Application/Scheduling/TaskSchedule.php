<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Scheduling;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use InvalidArgumentException;

/**
 * When a scheduled task is next due.
 *
 * Pure date arithmetic in the company's own timezone, so "the last day of the
 * month at 18:00" means 18:00 in Auckland whatever the server clock says, and
 * a daylight-saving change moves the UTC instant, not the wall-clock time.
 */
final class TaskSchedule
{
    public const DAILY = 'daily';

    public const WEEKLY = 'weekly';

    public const MONTHLY = 'monthly';

    public const MONTH_END = 'month_end';

    public const FREQUENCIES = [self::DAILY, self::WEEKLY, self::MONTHLY, self::MONTH_END];

    /** The first run strictly after `$after`, as a UTC instant. */
    public static function next(string $frequency, ?int $day, string $runAt, string $timezone, CarbonInterface $after): CarbonImmutable
    {
        if (! in_array($frequency, self::FREQUENCIES, true)) {
            throw new InvalidArgumentException("Unknown frequency: {$frequency}");
        }
        if (preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $runAt) !== 1) {
            throw new InvalidArgumentException("Run time must be HH:MM, got: {$runAt}");
        }

        $cursor = CarbonImmutable::instance($after)->setTimezone($timezone)->startOfDay();

        // The longest gap is a month-end to the next, or a 31st skipped over short months; a year is ample.
        for ($i = 0; $i < 400; $i++, $cursor = $cursor->addDay()) {
            if (! self::matches($frequency, $day, $cursor)) {
                continue;
            }

            $candidate = $cursor->setTimeFromTimeString($runAt);
            if ($candidate->greaterThan($after)) {
                return $candidate->utc();
            }
        }

        throw new InvalidArgumentException('The schedule never comes due.');
    }

    private static function matches(string $frequency, ?int $day, CarbonImmutable $date): bool
    {
        return match ($frequency) {
            self::DAILY => true,
            self::WEEKLY => $date->dayOfWeekIso === ($day ?? 1),
            // Day 31 means "the 31st, or the last day of a shorter month".
            self::MONTHLY => $date->day === min($day ?? 1, $date->daysInMonth),
            self::MONTH_END => $date->day === $date->daysInMonth,
        };
    }
}
