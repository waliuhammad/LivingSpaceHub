<?php
/**
 * POST { messageId } — called after the contact form saves a message.
 * Emails the store once per message (recent messages only), with Reply-To set to the sender.
 */
require __DIR__ . '/_bootstrap.php';

$input = require_post();
rate_limit('contact', 5, 600);

$messageId = $input['messageId'] ?? null;
if (!valid_doc_id($messageId)) {
    respond(400, ['error' => 'Invalid message id']);
}

try {
    $doc = firestore_get("messages/$messageId");
    if (!$doc) {
        respond(404, ['error' => 'Message not found']);
    }
    $msg = $doc['data'];
    if (!empty($msg['notifiedAt']) || !recent($msg['createdAt'] ?? null, 15)) {
        respond(200, ['ok' => true, 'skipped' => true]);
    }
    if (!firestore_claim("messages/$messageId", ['notifiedAt' => null], $doc['updateTime'])) {
        respond(200, ['ok' => true, 'skipped' => true]);
    }

    $cfg = config();
    $html = email_layout('New message: ' . e($msg['subject'] ?? ''), '
        <p><strong>' . e($msg['name'] ?? '') . '</strong> &lt;' . e($msg['email'] ?? '') . '&gt;</p>
        <p style="white-space:pre-wrap;background:#fafafa;border-radius:8px;padding:12px">' . e($msg['message'] ?? '') . '</p>
        <p style="color:#888;font-size:12px">Reply to this email to answer the customer directly.</p>');

    $sent = 0;
    foreach ($cfg['admin_emails'] ?? [] as $adminEmail) {
        $sent += send_email($adminEmail, 'Contact form: ' . ($msg['subject'] ?? ''), $html, $msg['email'] ?? null) ? 1 : 0;
    }
    respond(200, ['ok' => true, 'sent' => $sent]);
} catch (Throwable $err) {
    error_log('LSH API contact-message: ' . $err->getMessage());
    respond(500, ['error' => 'Could not send notification']);
}
