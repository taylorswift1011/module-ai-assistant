<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Application\Host;

/**
 * Read-only access to the host's own HTTP API, for data the module SDK does not
 * expose through a Host contract (supplier bills, for one).
 *
 * The host answers exactly as it would to the signed-in user, so it applies
 * its own permissions and company scoping, and the module never reads a host
 * table or imports a host model.
 */
interface HostApi
{
    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed> the decoded JSON body
     *
     * @throws HostApiException
     */
    public function get(string $path, array $query, int $companyId): array;
}
