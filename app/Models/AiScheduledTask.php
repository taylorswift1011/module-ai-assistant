<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A prompt the assistant runs on a schedule, as one member, for one company.
 *
 * @property int $id
 * @property int $company_id
 * @property int $user_id
 * @property string $name
 * @property string $prompt
 * @property string $frequency
 * @property int|null $day
 * @property string $run_at
 * @property bool $enabled
 * @property Carbon|null $next_run_at
 * @property Carbon|null $last_run_at
 * @property string|null $last_status
 * @property string|null $last_error
 * @property int|null $last_conversation_id
 */
class AiScheduledTask extends Model
{
    public const STATUS_OK = 'ok';

    public const STATUS_FAILED = 'failed';

    public const STATUS_SKIPPED = 'skipped';

    protected $table = 'ai_scheduled_tasks';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'day' => 'integer',
            'next_run_at' => 'datetime',
            'last_run_at' => 'datetime',
        ];
    }
}
