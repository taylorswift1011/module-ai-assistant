<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Modules\AiAssistant\Support\Net\PrivateNetworkGuard;

final class PublicHttpUrl implements ValidationRule
{
    /** @param  bool  $allowConfiguredHosts  also accept the private hosts the operator named for a local AI server */
    public function __construct(private readonly bool $allowConfiguredHosts = false) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            return;
        }

        $reason = PrivateNetworkGuard::blockedReason($value, $this->allowConfiguredHosts);

        if ($reason !== null) {
            $fail($this->allowConfiguredHosts
                ? 'The :attribute is not allowed: '.$reason.'.'
                : 'The :attribute must be a publicly reachable URL, not a private or reserved address.');
        }
    }
}
