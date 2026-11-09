<?php

declare(strict_types=1);

namespace Modules\AiAssistant\Support\Net;

/** Blocks outbound HTTP requests to private, loopback, reserved, and documentation ranges. */
final class PrivateNetworkGuard
{
    /** @var list<string> */
    private const BLOCKED_IPV4 = [
        '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16',
        '172.16.0.0/12', '192.0.0.0/24', '192.0.2.0/24', '192.168.0.0/16',
        '198.18.0.0/15', '198.51.100.0/24', '203.0.113.0/24', '240.0.0.0/4',
    ];

    /** @var list<string> */
    private const BLOCKED_IPV6 = ['::1/128', '::/128', 'fc00::/7', 'fe80::/10', '64:ff9b::/96', '2001:db8::/32'];

    /** The environment variable that names the private hosts a local AI server may live on. */
    public const ALLOWED_HOSTS_ENV = 'AI_LOCAL_ALLOWED_HOSTS';

    /**
     * Why a URL may not be called, or null when it may.
     *
     * With `$allowConfiguredHosts` the host is also let through when the
     * operator named it in AI_LOCAL_ALLOWED_HOSTS. Only the local AI driver
     * asks for that; nothing an admin can type widens the list.
     */
    public static function blockedReason(string $url, bool $allowConfiguredHosts = false): ?string
    {
        $reason = self::reasonFor($url, $allowConfiguredHosts);

        return $reason !== null && $allowConfiguredHosts
            ? $reason.'. A local AI server must be named in the '.self::ALLOWED_HOSTS_ENV.' environment variable'
            : $reason;
    }

    private static function reasonFor(string $url, bool $allowConfiguredHosts): ?string
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }
        $parts = parse_url($url);
        if ($parts === false || ! isset($parts['scheme'], $parts['host'])) {
            return 'URL must include a scheme and host';
        }
        if (! in_array(strtolower($parts['scheme']), ['http', 'https'], true)) {
            return 'URL scheme must be http or https';
        }
        $host = trim($parts['host'], '[]');
        if ($host === '') {
            return 'URL must include a host';
        }
        if ($allowConfiguredHosts && self::isConfiguredHost($host, isset($parts['port']) ? (int) $parts['port'] : null)) {
            return null;
        }
        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            return self::ipIsBlocked($host) ? "URL host {$host} is a private or reserved address" : null;
        }
        foreach (self::resolveHost($host) as $ip) {
            if (self::ipIsBlocked($ip)) {
                return "URL host {$host} resolves to a private or reserved address ({$ip})";
            }
        }

        return null;
    }

    public static function assertAllowed(string $url, bool $allowConfiguredHosts = false): void
    {
        $reason = self::blockedReason($url, $allowConfiguredHosts);
        if ($reason !== null) {
            throw new BlockedUrlException($reason);
        }
    }

    /**
     * Whether the operator named this host (and port) in AI_LOCAL_ALLOWED_HOSTS.
     *
     * The value is a comma-separated list of `host` or `host:port` entries, an
     * IPv6 address in brackets. Matching is exact: no wildcards, no ranges, so
     * naming one machine never opens its neighbours.
     */
    public static function isConfiguredHost(string $host, ?int $port): bool
    {
        $host = strtolower(trim($host, '[]'));

        foreach (self::configuredHosts() as [$allowedHost, $allowedPort]) {
            if ($allowedHost === $host && ($allowedPort === null || $allowedPort === $port)) {
                return true;
            }
        }

        return false;
    }

    /** @return list<array{0: string, 1: int|null}> */
    private static function configuredHosts(): array
    {
        $raw = getenv(self::ALLOWED_HOSTS_ENV);
        $raw = is_string($raw) && $raw !== '' ? $raw : ($_ENV[self::ALLOWED_HOSTS_ENV] ?? $_SERVER[self::ALLOWED_HOSTS_ENV] ?? '');
        $entries = [];

        foreach (explode(',', is_string($raw) ? $raw : '') as $entry) {
            $entry = strtolower(trim($entry));
            if ($entry === '') {
                continue;
            }
            if (preg_match('/^\[([^\]]+)\](?::(\d{1,5}))?$/', $entry, $m) === 1) {
                $entries[] = [$m[1], isset($m[2]) ? (int) $m[2] : null];
            } elseif (substr_count($entry, ':') === 1) {
                [$name, $port] = explode(':', $entry);
                $entries[] = [$name, ctype_digit($port) ? (int) $port : null];
            } else {
                $entries[] = [$entry, null];
            }
        }

        return $entries;
    }

    public static function ipIsBlocked(string $ip): bool
    {
        $mapped = self::extractMappedIpv4($ip);
        if ($mapped !== null) {
            return self::ipIsBlocked($mapped);
        }
        $blocks = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false ? self::BLOCKED_IPV4 : self::BLOCKED_IPV6;
        foreach ($blocks as $cidr) {
            if (self::ipInCidr($ip, $cidr)) {
                return true;
            }
        }

        return false;
    }

    public static function ipInCidr(string $ip, string $cidr): bool
    {
        [$subnet, $bits] = array_pad(explode('/', $cidr, 2), 2, null);
        $ipBin = @inet_pton($ip);
        $subnetBin = @inet_pton((string) $subnet);
        if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
            return false;
        }
        $wholeBytes = intdiv((int) $bits, 8);
        $remainder = (int) $bits % 8;
        if ($wholeBytes > 0 && strncmp($ipBin, $subnetBin, $wholeBytes) !== 0) {
            return false;
        }
        if ($remainder === 0) {
            return true;
        }
        $mask = (~((1 << (8 - $remainder)) - 1)) & 0xFF;

        return (ord($ipBin[$wholeBytes]) & $mask) === (ord($subnetBin[$wholeBytes]) & $mask);
    }

    /** @return list<string> */
    private static function resolveHost(string $host): array
    {
        $ips = [];
        if (function_exists('gethostbynamel')) {
            $v4 = @gethostbynamel($host);
            if (is_array($v4)) {
                $ips = $v4;
            }
        }
        if (function_exists('dns_get_record')) {
            $records = @dns_get_record($host, DNS_AAAA);
            if (is_array($records)) {
                foreach ($records as $record) {
                    if (isset($record['ipv6'])) {
                        $ips[] = $record['ipv6'];
                    }
                }
            }
        }

        return array_values(array_unique($ips));
    }

    private static function extractMappedIpv4(string $ip): ?string
    {
        $bin = @inet_pton($ip);
        if ($bin === false || strlen($bin) !== 16 || strncmp($bin, str_repeat("\x00", 10)."\xff\xff", 12) !== 0) {
            return null;
        }
        $ipv4 = inet_ntop(substr($bin, 12, 4));

        return $ipv4 === false ? null : $ipv4;
    }
}
