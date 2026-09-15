<?php
/**
 * Living Space Hub — shared helpers for the small PHP API that runs on Hostinger next to the site.
 *
 * Secrets never live in public_html. They are read from a private folder one level above it:
 *   /home/<user>/domains/livingspaceshub.com/lsh-private/config.php
 *   /home/<user>/domains/livingspaceshub.com/lsh-private/service-account.json
 * (see server-config/README.md in the project).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const LSH_PRIVATE_DIR_NAME = 'lsh-private';

/* ───────────── responses & input ───────────── */

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function require_post(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        respond(405, ['error' => 'Method not allowed']);
    }
    $raw = file_get_contents('php://input', false, null, 0, 65536) ?: '';
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        respond(400, ['error' => 'Invalid JSON body']);
    }
    return $data;
}

function valid_doc_id($id): bool
{
    return is_string($id) && preg_match('/^[A-Za-z0-9_-]{1,128}$/', $id) === 1;
}

/* ───────────── config ───────────── */

function config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $dir = getenv('LSH_PRIVATE_DIR') ?: dirname(__DIR__, 2) . '/' . LSH_PRIVATE_DIR_NAME;
    $file = $dir . '/config.php';
    if (!is_file($file)) {
        error_log("LSH API: missing $file");
        respond(503, ['error' => 'API not configured']);
    }
    $config = require $file;
    $config['private_dir'] = $dir;
    return $config;
}

function private_path(string $name): string
{
    return config()['private_dir'] . '/' . $name;
}

/* ───────────── rate limiting (per IP, file based) ───────────── */

function rate_limit(string $bucket, int $max, int $windowSeconds): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $dir = private_path('cache');
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return; // can't rate limit without storage; don't block real customers
    }
    $file = $dir . '/rl-' . $bucket . '-' . hash('sha256', $ip) . '.json';
    $now = time();
    $hits = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
    $hits = array_values(array_filter($hits, fn($t) => $t > $now - $windowSeconds));
    if (count($hits) >= $max) {
        respond(429, ['error' => 'Too many requests']);
    }
    $hits[] = $now;
    file_put_contents($file, json_encode($hits), LOCK_EX);
}

/* ───────────── HTTP ───────────── */

function http_request(string $method, string $url, array $headers = [], ?string $body = null): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($response === false) {
        throw new RuntimeException("HTTP request failed: $error");
    }
    return ['status' => $status, 'body' => $response, 'json' => json_decode($response, true)];
}

function base64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    return (string) base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

/* ───────────── Google service account → OAuth access token ───────────── */

function service_account(): array
{
    static $sa = null;
    if ($sa === null) {
        $file = config()['service_account_file'] ?? private_path('service-account.json');
        $sa = json_decode((string) @file_get_contents($file), true);
        if (!is_array($sa) || empty($sa['private_key'])) {
            error_log('LSH API: service account file missing or invalid');
            respond(503, ['error' => 'API not configured']);
        }
    }
    return $sa;
}

function google_access_token(): string
{
    if (getenv('LSH_FIRESTORE_EMULATOR')) {
        return 'owner'; // local testing against the Firestore emulator only
    }
    $cacheFile = private_path('cache/google-token.json');
    if (is_file($cacheFile)) {
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (($cached['expires'] ?? 0) > time() + 120) {
            return $cached['token'];
        }
    }

    $sa = service_account();
    $now = time();
    $header = base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $claims = base64url(json_encode([
        'iss' => $sa['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud' => 'https://oauth2.googleapis.com/token',
        'iat' => $now,
        'exp' => $now + 3600,
    ]));
    openssl_sign("$header.$claims", $signature, $sa['private_key'], OPENSSL_ALGO_SHA256);
    $jwt = "$header.$claims." . base64url($signature);

    $res = http_request('POST', 'https://oauth2.googleapis.com/token', ['Content-Type: application/x-www-form-urlencoded'], http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt,
    ]));
    if ($res['status'] !== 200 || empty($res['json']['access_token'])) {
        throw new RuntimeException('Could not get Google access token: ' . $res['body']);
    }
    $token = $res['json']['access_token'];
    @mkdir(dirname($cacheFile), 0700, true);
    @file_put_contents($cacheFile, json_encode(['token' => $token, 'expires' => $now + (int) $res['json']['expires_in']]), LOCK_EX);
    return $token;
}

/* ───────────── Firestore REST (as the service account — bypasses security rules) ───────────── */

function firestore_url(string $path): string
{
    $base = getenv('LSH_FIRESTORE_EMULATOR') ? 'http://' . getenv('LSH_FIRESTORE_EMULATOR') : 'https://firestore.googleapis.com';
    return $base . '/v1/projects/' . config()['project_id'] . '/databases/(default)/documents/' . $path;
}

function firestore_decode(array $value)
{
    if (array_key_exists('nullValue', $value)) return null;
    if (isset($value['stringValue'])) return $value['stringValue'];
    if (isset($value['integerValue'])) return (int) $value['integerValue'];
    if (isset($value['doubleValue'])) return (float) $value['doubleValue'];
    if (isset($value['booleanValue'])) return (bool) $value['booleanValue'];
    if (isset($value['timestampValue'])) return $value['timestampValue'];
    if (isset($value['mapValue'])) return firestore_decode_fields($value['mapValue']['fields'] ?? []);
    if (isset($value['arrayValue'])) return array_map('firestore_decode', $value['arrayValue']['values'] ?? []);
    return null;
}

function firestore_decode_fields(array $fields): array
{
    $out = [];
    foreach ($fields as $key => $value) {
        $out[$key] = firestore_decode($value);
    }
    return $out;
}

/** Returns ['data' => array, 'updateTime' => string] or null if the document doesn't exist. */
function firestore_get(string $path): ?array
{
    $res = http_request('GET', firestore_url($path), ['Authorization: Bearer ' . google_access_token()]);
    if ($res['status'] === 404) return null;
    if ($res['status'] !== 200) throw new RuntimeException("Firestore get failed ({$res['status']})");
    return ['data' => firestore_decode_fields($res['json']['fields'] ?? []), 'updateTime' => $res['json']['updateTime']];
}

/**
 * Set top-level fields, but only if the document hasn't changed since `$updateTime`.
 * Returns false if someone else changed it first (used to "claim" an email so it's sent once).
 */
function firestore_claim(string $path, array $fields, string $updateTime): bool
{
    $encoded = [];
    foreach ($fields as $key => $value) {
        // null means "now"
        $encoded[$key] = is_string($value) ? ['stringValue' => $value] : ['timestampValue' => gmdate('Y-m-d\TH:i:s\Z')];
    }
    $project = config()['project_id'];
    $write = [
        'update' => ['name' => "projects/$project/databases/(default)/documents/$path", 'fields' => $encoded],
        'updateMask' => ['fieldPaths' => array_keys($fields)],
        'currentDocument' => ['updateTime' => $updateTime],
    ];
    // documents:commit carries the precondition in the body, which both Firestore and its emulator honour
    $res = http_request('POST', preg_replace('#/documents/.*$#', '/documents:commit', firestore_url($path)), [
        'Authorization: Bearer ' . google_access_token(),
        'Content-Type: application/json',
    ], json_encode(['writes' => [$write]]));
    return $res['status'] === 200;
}

/* ───────────── Firebase ID token verification (staff-only endpoints) ───────────── */

function google_securetoken_certs(): array
{
    $cacheFile = private_path('cache/securetoken-certs.json');
    if (is_file($cacheFile) && filemtime($cacheFile) > time() - 3600) {
        return json_decode((string) file_get_contents($cacheFile), true) ?: [];
    }
    $res = http_request('GET', 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if ($res['status'] !== 200 || !is_array($res['json'])) {
        throw new RuntimeException('Could not fetch Firebase signing certificates');
    }
    @mkdir(dirname($cacheFile), 0700, true);
    @file_put_contents($cacheFile, $res['body'], LOCK_EX);
    return $res['json'];
}

/** Verifies the "Authorization: Bearer <Firebase ID token>" header. Returns the token claims or null. */
function verify_firebase_user(): ?array
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/', $auth, $m)) {
        return null;
    }
    [, $h, $p, $s] = $m;
    $header = json_decode(base64url_decode($h), true);
    $claims = json_decode(base64url_decode($p), true);
    if (($header['alg'] ?? '') !== 'RS256' || empty($header['kid']) || !is_array($claims)) {
        return null;
    }
    $certs = google_securetoken_certs();
    if (empty($certs[$header['kid']])) {
        return null;
    }
    if (openssl_verify("$h.$p", base64url_decode($s), $certs[$header['kid']], OPENSSL_ALGO_SHA256) !== 1) {
        return null;
    }
    $project = config()['project_id'];
    $now = time();
    if (($claims['aud'] ?? '') !== $project
        || ($claims['iss'] ?? '') !== "https://securetoken.google.com/$project"
        || ($claims['exp'] ?? 0) < $now
        || ($claims['iat'] ?? PHP_INT_MAX) > $now + 300
        || empty($claims['sub'])) {
        return null;
    }
    return $claims;
}

/** Requires a signed-in user whose Firestore role is in $roles. Returns their uid. */
function require_role(array $roles): string
{
    try {
        $claims = verify_firebase_user();
        $profile = $claims ? firestore_get('users/' . $claims['sub']) : null;
    } catch (Throwable $err) {
        error_log('LSH API auth check failed: ' . $err->getMessage());
        respond(503, ['error' => 'Could not verify sign-in, try again']);
    }
    if (!$claims) {
        respond(401, ['error' => 'Sign in required']);
    }
    if (!$profile || !in_array($profile['data']['role'] ?? '', $roles, true)) {
        respond(403, ['error' => 'Not allowed']);
    }
    return $claims['sub'];
}

/* ───────────── email ───────────── */

function e(?string $text): string
{
    return htmlspecialchars((string) $text, ENT_QUOTES, 'UTF-8');
}

function money($amount): string
{
    return 'Rs.' . number_format((float) $amount);
}

function email_layout(string $title, string $bodyHtml): string
{
    $store = e(config()['store_name']);
    $site = e(config()['site_url']);
    return <<<HTML
<!doctype html><html><body style="margin:0;background:#F5F2ED;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2ED;padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#5A5A40;color:#ffffff;padding:20px 28px;font-size:18px;letter-spacing:2px;font-weight:bold">{$store}</td></tr>
<tr><td style="padding:28px">
<h1 style="font-size:22px;margin:0 0 16px">{$title}</h1>
{$bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#fafafa;color:#888;font-size:12px"><a href="{$site}" style="color:#5A5A40">{$site}</a></td></tr>
</table></td></tr></table></body></html>
HTML;
}

function order_items_table(array $order): string
{
    $rows = '';
    foreach ($order['items'] ?? [] as $item) {
        $options = '';
        foreach (($item['options'] ?? []) as $k => $v) {
            $options .= ' • ' . e((string) $k) . ': ' . e((string) $v);
        }
        $rows .= '<tr><td style="padding:6px 0;border-bottom:1px solid #eee">' . (int) $item['quantity'] . '× ' . e($item['name']) .
            '<span style="color:#888">' . $options . '</span></td><td align="right" style="padding:6px 0;border-bottom:1px solid #eee">' .
            money($item['price'] * $item['quantity']) . '</td></tr>';
    }
    $rows .= '<tr><td style="padding:6px 0;color:#666">Subtotal</td><td align="right">' . money($order['subtotal'] ?? 0) . '</td></tr>';
    $rows .= '<tr><td style="padding:6px 0;color:#666">Shipping</td><td align="right">' . (($order['shipping'] ?? 0) > 0 ? money($order['shipping']) : 'Free') . '</td></tr>';
    if (($order['discount'] ?? 0) > 0) {
        $rows .= '<tr><td style="padding:6px 0;color:#2f7a4f">Discount (' . e($order['couponCode'] ?? '') . ')</td><td align="right" style="color:#2f7a4f">−' . money($order['discount']) . '</td></tr>';
    }
    $rows .= '<tr><td style="padding:8px 0;font-weight:bold">Total</td><td align="right" style="font-weight:bold">' . money($order['total'] ?? 0) . '</td></tr>';
    return '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:12px 0 20px">' . $rows . '</table>';
}

const PAYMENT_LABELS = ['cod' => 'Cash on Delivery', 'jazzcash' => 'JazzCash', 'easypaisa' => 'EasyPaisa'];

/** Sends through SMTP when configured (better inbox delivery), otherwise PHP mail(). */
function send_email(string $to, string $subject, string $html, ?string $replyTo = null): bool
{
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    $cfg = config();
    $from = $cfg['mail_from'];
    $fromName = $cfg['mail_from_name'] ?? $cfg['store_name'];
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'From: =?UTF-8?B?' . base64_encode($fromName) . "?= <$from>",
        'Date: ' . date(DATE_RFC2822),
        'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . substr(strrchr($from, '@'), 1) . '>',
    ];
    if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = "Reply-To: $replyTo";
    }
    $body = chunk_split(base64_encode($html));

    if (!empty($cfg['smtp']['host'])) {
        try {
            return smtp_send($cfg['smtp'], $from, $to, $encodedSubject, $headers, $body);
        } catch (Throwable $err) {
            error_log('LSH API: SMTP failed, falling back to mail(): ' . $err->getMessage());
        }
    }
    return mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $from);
}

function smtp_send(array $smtp, string $from, string $to, string $subject, array $headers, string $body): bool
{
    $port = (int) ($smtp['port'] ?? 465);
    $host = ($port === 465 ? 'ssl://' : '') . $smtp['host'];
    $socket = @stream_socket_client("$host:$port", $errno, $errstr, 15);
    if (!$socket) {
        throw new RuntimeException("SMTP connect failed: $errstr");
    }
    stream_set_timeout($socket, 15);
    $read = function () use ($socket): string {
        $data = '';
        while (($line = fgets($socket, 515)) !== false) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') break;
        }
        return $data;
    };
    $cmd = function (string $command, array $expect) use ($socket, $read): string {
        fwrite($socket, $command . "\r\n");
        $reply = $read();
        if (!in_array((int) substr($reply, 0, 3), $expect, true)) {
            throw new RuntimeException('SMTP error after "' . explode(' ', $command)[0] . '": ' . trim($reply));
        }
        return $reply;
    };

    $read();
    $cmd('EHLO ' . (gethostname() ?: 'localhost'), [250]);
    if ($port === 587) {
        $cmd('STARTTLS', [220]);
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $cmd('EHLO ' . (gethostname() ?: 'localhost'), [250]);
    }
    $cmd('AUTH LOGIN', [334]);
    $cmd(base64_encode($smtp['username']), [334]);
    $cmd(base64_encode($smtp['password']), [235]);
    $cmd("MAIL FROM:<$from>", [250]);
    $cmd("RCPT TO:<$to>", [250, 251]);
    $cmd('DATA', [354]);
    $message = implode("\r\n", array_merge($headers, ["To: <$to>", "Subject: $subject"])) . "\r\n\r\n" . $body;
    $message = preg_replace('/^\./m', '..', $message);
    $cmd($message . "\r\n.", [250]);
    $cmd('QUIT', [221]);
    fclose($socket);
    return true;
}

/** True if an ISO timestamp is within the last $minutes. */
function recent(?string $iso, int $minutes): bool
{
    $time = $iso ? strtotime($iso) : false;
    return $time !== false && $time > time() - $minutes * 60;
}
