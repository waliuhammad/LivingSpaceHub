<?php
/**
 * Living Space Hub API — private server settings.
 *
 * Upload this file (renamed to config.php) to Hostinger OUTSIDE public_html:
 *   domains/livingspaceshub.com/lsh-private/config.php
 * next to service-account.json. Never put it inside public_html.
 */
return [
    'project_id' => 'livingspacehub-52269',
    'service_account_file' => __DIR__ . '/service-account.json',

    'store_name' => 'Living Space Hub',
    'site_url' => 'https://livingspaceshub.com',

    // Emails are sent from this address. It must be a mailbox on your domain (hPanel → Emails).
    'mail_from' => 'info@livingspaceshub.com',
    'mail_from_name' => 'Living Space Hub',

    // Who receives new-order and contact-form alerts
    'admin_emails' => ['info@livingspaceshub.com'],

    // Recommended: send through Hostinger's SMTP so emails don't land in spam.
    // Leave 'host' empty to use PHP mail() instead.
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'username' => 'info@livingspaceshub.com',
        'password' => 'THE-MAILBOX-PASSWORD',
    ],

    // Cloudinary → Settings → API Keys. The secret stays on the server; the website never sees it.
    'cloudinary_cloud_name' => 'fvpzi9pm',
    'cloudinary_api_key' => '',
    'cloudinary_api_secret' => '',
];
