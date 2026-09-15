<?php
/**
 * POST { orderId } with a staff member's Firebase ID token.
 * Emails the customer about the order's current status (Confirmed / Shipped / Delivered / Cancelled),
 * at most once per status.
 */
require __DIR__ . '/_bootstrap.php';

$input = require_post();
rate_limit('status', 120, 600);
require_role(['admin', 'manager', 'support']);

$orderId = $input['orderId'] ?? null;
if (!valid_doc_id($orderId)) {
    respond(400, ['error' => 'Invalid order id']);
}

$MESSAGES = [
    'Confirmed' => ['Your order is confirmed', 'Good news — we have confirmed your order and are preparing it for dispatch.'],
    'Shipped' => ['Your order is on the way', 'Your order has been handed to our delivery partner and is on its way to you.'],
    'Delivered' => ['Your order was delivered', 'Your order has been delivered. We hope you love it! If anything is not right, just reply to this email.'],
    'Cancelled' => ['Your order was cancelled', 'Your order has been cancelled. If you did not ask for this or have any questions, please reply to this email.'],
];

try {
    $doc = firestore_get("orders/$orderId");
    if (!$doc) {
        respond(404, ['error' => 'Order not found']);
    }
    $order = $doc['data'];
    $status = $order['status'] ?? '';
    $email = $order['customer']['email'] ?? '';

    if (!isset($MESSAGES[$status]) || !$email) {
        respond(200, ['ok' => true, 'skipped' => 'nothing to send']);
    }
    if (($order['notifiedStatus'] ?? '') === $status) {
        respond(200, ['ok' => true, 'skipped' => 'already sent for this status']);
    }
    if (!firestore_claim("orders/$orderId", ['notifiedStatus' => $status], $doc['updateTime'])) {
        respond(409, ['error' => 'Order changed, try again']);
    }

    $cfg = config();
    [$title, $text] = $MESSAGES[$status];
    $number = e($order['orderNumber'] ?? '');
    $trackUrl = e(rtrim($cfg['site_url'], '/') . '/track-order?order=' . rawurlencode($order['orderNumber'] ?? ''));
    $html = email_layout($title, '
        <p>Hi ' . e($order['customer']['name'] ?? '') . ',</p>
        <p>' . $text . '</p>
        <p>Order <strong style="font-family:monospace">' . $number . '</strong></p>
        ' . order_items_table($order) . '
        <p><a href="' . $trackUrl . '" style="display:inline-block;background:#5A5A40;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Track your order</a></p>');

    $ok = send_email($email, "$title — $number", $html, $cfg['mail_from']);
    respond(200, ['ok' => $ok]);
} catch (Throwable $err) {
    error_log('LSH API order-status: ' . $err->getMessage());
    respond(500, ['error' => 'Could not send email']);
}
