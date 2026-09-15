<?php
/**
 * POST { publicIds: string[] } with an admin or store manager's Firebase ID token.
 * Deletes images from Cloudinary using the API secret, which stays on the server.
 * Only images inside the site's "living-space-hub/" folder can be deleted.
 */
require __DIR__ . '/_bootstrap.php';

$input = require_post();
rate_limit('cloudinary', 60, 600);
require_role(['admin', 'manager']);

$cfg = config();
if (empty($cfg['cloudinary_cloud_name']) || empty($cfg['cloudinary_api_key']) || empty($cfg['cloudinary_api_secret'])) {
    respond(503, ['error' => 'Cloudinary deletion not configured']);
}

$ids = $input['publicIds'] ?? null;
if (!is_array($ids) || count($ids) === 0 || count($ids) > 20) {
    respond(400, ['error' => 'publicIds must be a list of 1–20 ids']);
}

$results = [];
foreach ($ids as $publicId) {
    if (!is_string($publicId) || !preg_match('#^living-space-hub/[A-Za-z0-9_/-]{1,200}$#', $publicId)) {
        $results[] = ['publicId' => $publicId, 'result' => 'rejected'];
        continue;
    }
    $timestamp = time();
    $params = ['invalidate' => 'true', 'public_id' => $publicId, 'timestamp' => $timestamp];
    ksort($params);
    $toSign = urldecode(http_build_query($params));
    $signature = sha1($toSign . $cfg['cloudinary_api_secret']);

    try {
        $res = http_request('POST', 'https://api.cloudinary.com/v1_1/' . rawurlencode($cfg['cloudinary_cloud_name']) . '/image/destroy', [
            'Content-Type: application/x-www-form-urlencoded',
        ], http_build_query($params + ['api_key' => $cfg['cloudinary_api_key'], 'signature' => $signature]));
        $results[] = ['publicId' => $publicId, 'result' => $res['json']['result'] ?? ('http ' . $res['status'])];
    } catch (Throwable $err) {
        error_log('LSH API cloudinary-delete: ' . $err->getMessage());
        $results[] = ['publicId' => $publicId, 'result' => 'error'];
    }
}

respond(200, ['ok' => true, 'results' => $results]);
