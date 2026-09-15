# Living Space Hub

An e-commerce website for premium home decor, live at **https://livingspaceshub.com**. The front end is a static React site hosted on Hostinger. Firebase provides accounts and the database, Cloudinary stores images, and a small PHP API on Hostinger sends emails.

## Tech stack

| Layer          | Tool                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| UI             | React 19, React Router 7, Framer Motion, Tailwind CSS 4                     |
| Accounts       | Firebase Authentication (email and password, email verification)            |
| Database       | Cloud Firestore, protected by `firestore.rules`                             |
| Spam protection| Firebase App Check with reCAPTCHA v3 (optional, see below)                  |
| Images         | Cloudinary (uploaded from the admin panel, served auto-optimised)           |
| Emails & image cleanup | PHP API in `public/api/`, runs on Hostinger                         |
| Hosting        | Hostinger (static files + PHP)                                              |
| Build & test   | Vite 8, Oxlint, Firebase emulator + `@firebase/rules-unit-testing`          |

Firebase runs on the **free Spark plan**: no Cloud Functions. Security rules protect the data, and work that needs secrets (emails, deleting Cloudinary images) runs in the PHP API on Hostinger, which you already pay for.

## Features

**Storefront**
- Shop, product pages with **photo gallery**, **options** (colour, size…), **stock** and **reviews** (1–5 stars, email-verified customers only)
- **Wishlist**: saved in the browser for guests, saved to the account for signed-in customers (merged on sign-in)
- Checkout: **Cash on Delivery, JazzCash, EasyPaisa**, plus **coupon codes**
- **Stock is taken the moment an order is placed** and returned when the order is cancelled. Checkout re-checks stock inside a transaction, so the last piece can't be sold twice.
- **Order confirmation email** to the customer and a **new-order email** to the store
- **Track Order** page (order number + phone number) for guests; **My Account** with order history and **cancel** for Pending orders
- Customer accounts with **email verification** and password reset
- Editable **FAQ, About, contact details, footer and product tabs**
- SEO: per-page titles and descriptions, product structured data (price, stock, rating), `sitemap.xml` and `robots.txt` generated on every build

**Admin panel (`/admin`)**
| Page         | What it does                                                                         | Who            |
| ------------ | ------------------------------------------------------------------------------------ | -------------- |
| Overview     | Revenue received, orders, products, users, 7-day chart                                | All staff      |
| Products     | Add/edit/delete; main image + gallery; options; stock; featured/hidden; per-product tab text; starter catalog import | Admin, Manager |
| Categories   | Add/edit/delete with cover images                                                     | Admin, Manager |
| Orders       | Status and payment status, TIDs, WhatsApp, stock return on cancel, status emails to customers | All staff (delete: Admin) |
| Transactions | Payments ledger, CSV export                                                           | Admin, Manager |
| Customers    | Registered customers with order count and spend; **block/unblock**; CSV export         | Admin, Manager (block: Admin) |
| Coupons      | Percentage or fixed discounts, minimum order, expiry, usage stats                     | Admin, Manager |
| Reviews      | Moderate all reviews                                                                  | All staff      |
| Settings     | Shipping, JazzCash/EasyPaisa accounts, hero image, **Download Backup**                | Admin          |
| Messages     | Contact inbox + newsletter subscribers                                                | All staff      |
| Site Content | FAQ, About, contact details, social links, footer, default product tabs               | Admin          |
| Team & Roles | Grant Admin / Store Manager / Support Agent                                           | Admin          |

## Data model (Firestore)

| Collection                  | Contents / access                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `products`                  | Catalog. Public read. Admin/Manager edit. Stock changes only through orders (rules check the exact quantity). |
| `products/{id}/reviews/{uid}` | One review per verified customer. Public read.                                                     |
| `categories`, `settings/store`, `content/site` | Public read. Admin (content/settings) or Admin/Manager (categories) write.       |
| `coupons/{CODE}`            | Look up by code publicly; list/edit by staff. Discounts are re-checked by the rules on every order.  |
| `orders`                    | Created by anyone (strictly validated: shipping, coupon, totals, stock lines). Read by the owner and staff. |
| `orderTracking/{orderNumber_last4}` | Status-only record for the Track Order page (no name, address or phone).                     |
| `messages`, `subscribers`   | Created by anyone; read by staff.                                                                     |
| `users`                     | Profile, role, wishlist, blocked flag. Only admins change roles or block.                             |

## One-time setup (already done for livingspaceshub.com, kept for reference)

1. **Firebase**: project `livingspacehub-52269`, with Email/Password sign-in enabled (Anonymous disabled), Firestore created, and `livingspaceshub.com` added to authorized domains.
2. **Cloudinary**: unsigned upload preset `living-space-hub` on cloud `fvpzi9pm`.
3. **`.env`**: copy `.env.example`, fill in Firebase and Cloudinary values, `VITE_SITE_URL` and, optionally, `VITE_RECAPTCHA_SITE_KEY`.
4. **First admin**: sign up on the site, then `npm run make-admin -- you@example.com` (needs `service-account.json` in the project root).

### Email & image API on Hostinger

See **[server-config/README.md](server-config/README.md)**. In short: create `lsh-private/` next to `public_html/` and upload `config.php` (from `server-config/config.example.php`) and `service-account.json` into it. Until then the site works normally, but no emails are sent and old images stay in Cloudinary.

### Spam protection (App Check)

1. Go to [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) and create a **reCAPTCHA v3** key for `livingspaceshub.com`.
2. Firebase console → **App Check** → register the web app with **reCAPTCHA v3** and paste the **secret** key.
3. Put the **site** key in `.env` as `VITE_RECAPTCHA_SITE_KEY`, then rebuild and upload.
4. Watch App Check → **Metrics** for a few days. Once almost all requests are "verified", click **Enforce** for Cloud Firestore. From then on, bots that don't come through the website are blocked.

## Development

```bash
npm install
npm run dev            # http://localhost:5173
npm run lint
npm run test:rules     # security rules tests on the Firestore emulator (needs Java 11+)
```

Local API testing: run PHP with `LSH_PRIVATE_DIR` pointing to a private config, then `API_PROXY=http://127.0.0.1:8091 npm run dev` forwards `/api` to it.

## Deploying

```bash
npm run build                 # writes sitemap.xml + robots.txt, then builds dist/
npm run firebase:rules        # deploy security rules + indexes
```

Upload the **contents** of `dist/` to `public_html` (File Manager, or `npm run deploy` with `.env.deploy`). Include the hidden `.htaccess` files and the `api/` folder.

**When a release changes the order format** (as the coupon/stock release did), upload the new site and deploy the rules **back to back**. Old site + new rules, or new site + old rules, rejects new orders.

## Backups

- Admin → Settings → **Download Backup** (JSON of the whole database), or `npm run backup` (saves to `backups/`).
- Restore: `npm run restore -- backups/file.json` (dry run), then add `--yes` to write.

Backups contain customer details. Keep them private.

## Known limits of the free-plan design

- **Item prices in an order aren't checked against the catalog by the rules** (shipping, coupons, totals and stock quantities are). Staff confirm every order manually, so check totals when confirming.
- **Stock can be tied up by fake orders** (it's returned when you cancel them). Turning on App Check enforcement makes this much harder.
- **Blocking** stops a signed-in account; a blocked person could still check out as a guest.
