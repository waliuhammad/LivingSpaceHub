<?php
/**
 * POST { orderId } — called by the checkout page right after an order is saved.
 * Sends the customer's confirmation email and the store's new-order alert, once per order.
 * Anyone can call it, so it only acts on orders placed in the last 15 minutes that haven't
 * been emailed yet, and only uses data read from Firestore (never from the request).
 */
require __DIR__ . '/_bootstrap.php';

$input = require_post();
rate_limit('order', 10, 600);

$orderId = $input['orderId'] ?? null;
if (!valid_doc_id($orderId)) {
    respond(400, ['error' => 'Invalid order id']);
}

try {
    $doc = firestore_get("orders/$orderId");
    if (!$doc) {
        respond(404, ['error' => 'Order not found']);
    }
    $order = $doc['data'];
    if (!empty($order['notifiedAt'])) {
        respond(200, ['ok' => true, 'skipped' => 'already notified']);
    }
    if (!recent($order['createdAt'] ?? null, 15)) {
        respond(200, ['ok' => true, 'skipped' => 'too old']);
    }
    // Claim the notification first so two calls can't both send
    if (!firestore_claim("orders/$orderId", ['notifiedAt' => null], $doc['updateTime'])) {
        respond(200, ['ok' => true, 'skipped' => 'claimed elsewhere']);
    }

    $cfg = config();
    $customer = $order['customer'] ?? [];
    $payment = $order['payment'] ?? [];
    $method = PAYMENT_LABELS[$payment['method'] ?? ''] ?? 'Cash on Delivery';
    $number = e($order['orderNumber'] ?? '');
    $trackUrl = e(rtrim($cfg['site_url'], '/') . '/track-order?order=' . rawurlencode($order['orderNumber'] ?? ''));
    $items = order_items_table($order);
    $sent = ['customer' => false, 'store' => 0];

    if (!empty($customer['email'])) {
        $next = ($payment['method'] ?? 'cod') === 'cod'
            ? 'We will call you to confirm, then dispatch your order. Please keep the cash ready on delivery.'
            : 'We will verify your ' . e($method) . ' payment (TID ' . e($payment['reference'] ?? '') . ') and then dispatch your order.';
        $html = email_layout('Thank you for your order!', '
            <p>Hi ' . e($customer['name'] ?? '') . ',</p>
            <p>We have received your order <strong style="font-family:monospace">' . $number . '</strong>.</p>
            ' . $items . '
            <p><strong>Payment:</strong> ' . e($method) . '<br><strong>Deliver to:</strong> ' . e($customer['address'] ?? '') . ', ' . e($customer['city'] ?? '') . '</p>
            <p>' . $next . '</p>
            <p><a href="' . $trackUrl . '" style="display:inline-block;background:#5A5A40;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Track your order</a></p>
            <p style="color:#888;font-size:12px">To track later, use your order number and phone number.</p>');
        $sent['customer'] = send_email($customer['email'], "Order $number received — " . $cfg['store_name'], $html, $cfg['mail_from']);
    }

    $adminUrl = e(rtrim($cfg['site_url'], '/') . '/admin/orders');
    $alert = email_layout('New order ' . $number, '
        <p><strong>' . e($customer['name'] ?? '') . '</strong> • ' . e($customer['phone'] ?? '') . (!empty($customer['email']) ? ' • ' . e($customer['email']) : '') . '<br>
        ' . e($customer['address'] ?? '') . ', ' . e($customer['city'] ?? '') . '</p>
        ' . $items . '
        <p><strong>Payment:</strong> ' . e($method) . (!empty($payment['reference']) ? ' — TID <span style="font-family:monospace">' . e($payment['reference']) . '</span>' : '') . '</p>
        ' . (!empty($order['notes']) ? '<p><strong>Note:</strong> ' . e($order['notes']) . '</p>' : '') . '
        <p><a href="' . $adminUrl . '" style="color:#5A5A40">Open in the admin panel</a></p>');
    foreach ($cfg['admin_emails'] ?? [] as $adminEmail) {
        $sent['store'] += send_email($adminEmail, "New order $number — " . money($order['total'] ?? 0), $alert, $customer['email'] ?? null) ? 1 : 0;
    }

    respond(200, ['ok' => true, 'sent' => $sent]);
} catch (Throwable $err) {
    error_log('LSH API order-placed: ' . $err->getMessage());
    respond(500, ['error' => 'Could not send notifications']);
}
