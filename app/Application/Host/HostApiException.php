<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Host;

use RuntimeException;

final class HostApiException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status = 500)
    {
        parent::__construct($message);
    }
}
