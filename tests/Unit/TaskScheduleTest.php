<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Tests\Unit;

use Carbon\CarbonImmutable;
use InvalidArgumentException;
use Modules\AiAssistant\Application\Scheduling\TaskSchedule;
use PHPUnit\Framework\TestCase;

final class TaskScheduleTest extends TestCase
{
    private const NZ = 'Pacific/Auckland';

    private function next(string $frequency, ?int $day, string $runAt, string $afterUtc): string
    {
        return TaskSchedule::next($frequency, $day, $runAt, self::NZ, CarbonImmutable::parse($afterUtc, 'UTC'))
            ->setTimezone(self::NZ)->format('Y-m-d H:i T');
    }

    public function test_month_end_is_the_last_day_at_the_local_time_including_february(): void
    {
        self::assertSame('2026-11-30 18:00 NZDT', $this->next('month_end', null, '18:00', '2026-11-09 00:00:00'));
        self::assertSame('2026-12-31 18:00 NZDT', $this->next('month_end', null, '18:00', '2026-11-30 06:00:01'));
        self::assertSame('2027-02-28 18:00 NZDT', $this->next('month_end', null, '18:00', '2027-02-01 00:00:00'));
        self::assertSame('2028-02-29 18:00 NZDT', $this->next('month_end', null, '18:00', '2028-02-01 00:00:00'), 'leap year');
    }

    public function test_a_run_that_just_happened_moves_on_to_the_next_period(): void
    {
        // 2026-11-30 18:00 NZDT is 2026-11-30 05:00 UTC.
        self::assertSame('2026-12-31 18:00 NZDT', $this->next('month_end', null, '18:00', '2026-11-30 05:00:00'));
        self::assertSame('2026-11-30 18:00 NZDT', $this->next('month_end', null, '18:00', '2026-11-30 04:59:59'));
    }

    public function test_monthly_clamps_a_late_day_to_short_months(): void
    {
        self::assertSame('2026-02-28 09:30 NZDT', $this->next('monthly', 31, '09:30', '2026-02-01 00:00:00'));
        self::assertSame('2026-04-30 09:30 NZST', $this->next('monthly', 31, '09:30', '2026-04-01 00:00:00'));
        self::assertSame('2026-12-15 09:30 NZDT', $this->next('monthly', 15, '09:30', '2026-11-20 00:00:00'));
    }

    public function test_weekly_uses_iso_weekdays(): void
    {
        // 2026-11-09 is a Monday; weekday 5 is the Friday after.
        self::assertSame('2026-11-13 08:00 NZDT', $this->next('weekly', 5, '08:00', '2026-11-08 20:00:00'));
        self::assertSame('2026-11-16 08:00 NZDT', $this->next('weekly', 1, '08:00', '2026-11-09 20:00:00'));
    }

    public function test_the_wall_clock_time_holds_across_the_daylight_saving_change(): void
    {
        // NZ daylight saving ends 2027-04-04 and starts 2026-09-27: 18:00 stays 18:00 locally.
        self::assertSame('2027-04-30 18:00 NZST', $this->next('month_end', null, '18:00', '2027-04-05 00:00:00'));
        self::assertSame('2026-09-30 18:00 NZDT', $this->next('month_end', null, '18:00', '2026-09-01 00:00:00'));
        self::assertSame('2026-09-27 18:00 NZDT', $this->next('daily', null, '18:00', '2026-09-27 00:00:00'));
    }

    public function test_it_rejects_what_cannot_be_scheduled(): void
    {
        $this->expectException(InvalidArgumentException::class);
        TaskSchedule::next('yearly', null, '18:00', self::NZ, CarbonImmutable::now());
    }

    public function test_it_rejects_a_bad_time(): void
    {
        $this->expectException(InvalidArgumentException::class);
        TaskSchedule::next('daily', null, '25:00', self::NZ, CarbonImmutable::now());
    }
}
