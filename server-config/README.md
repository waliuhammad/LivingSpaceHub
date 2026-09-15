# Server config for the email & image API

The website includes a small PHP API in `public_html/api/`. It sends order and contact emails and deletes unused images from Cloudinary. It needs three private files that must **not** be inside `public_html`, where anyone could download them.

## One-time setup on Hostinger

1. **hPanel → Files → File Manager.** Go **up one level** from `public_html` (the folder named after your domain, e.g. `domains/livingspaceshub.com/`).
2. Create a folder named **`lsh-private`** there. The result should look like this:
   ```
   domains/livingspaceshub.com/
   ├── public_html/        ← the website
   └── lsh-private/        ← private, not reachable from the web
       ├── config.php
       └── service-account.json
   ```
3. **`service-account.json`:** upload the Firebase key file (Firebase console → Project settings → Service accounts → Generate new private key) and rename it to `service-account.json`.
4. **`config.php`:** copy `config.example.php` from this folder, rename it to `config.php`, fill it in, and upload it:
   - `mail_from` / `admin_emails`: a real mailbox on your domain (hPanel → **Emails** → create `info@livingspaceshub.com` if you don't have one).
   - `smtp.password`: that mailbox's password. Sending through SMTP keeps emails out of spam.
   - `cloudinary_api_key` / `cloudinary_api_secret`: from Cloudinary → Settings → API Keys. Needed only for deleting old images.
5. That's it. The API creates `lsh-private/cache/` by itself for rate limits and token caching.

## Check it works

- Place a test order with your email address. You should receive the confirmation, and the `admin_emails` address should receive the "New order" alert.
- If nothing arrives: hPanel → **Websites → Advanced → PHP error logs**, and look for lines starting with `LSH API`.

## Security notes

- `config.php` and `service-account.json` grant full database access and email sending. Keep them only in `lsh-private`.
- Public endpoints (`order-placed`, `contact-message`) are rate-limited per visitor. They email only about orders or messages created in the last 15 minutes, once each, and use data from the database, never from the request.
- `order-status` and `cloudinary-delete` require a signed-in staff member. The server verifies the Firebase login token and checks the role in Firestore.
