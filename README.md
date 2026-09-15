# Living Space Hub

An e-commerce website for premium home decor. It is a static React site hosted on Hostinger. Firebase provides the backend (accounts and database), and Cloudinary stores product images.

## Tech stack

| Layer          | Tool                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| UI             | React 19, React Router 7, Framer Motion                                |
| Styling        | Tailwind CSS 4 + custom CSS in `src/index.css`                         |
| Accounts       | Firebase Authentication (email and password)                           |
| Database       | Cloud Firestore, protected by `firestore.rules`                        |
| Product images | Cloudinary (uploaded from the admin panel, served auto-optimised)      |
| Hosting        | Hostinger (static files uploaded from `dist/`)                         |
| Build and test | Vite 8, Oxlint, Firebase emulator + `@firebase/rules-unit-testing`     |

The backend runs on Firebase's **free Spark plan**. There is no server code: the browser talks to Firebase directly, and the security rules decide what each visitor is allowed to read or write.

## What the backend does

**Storefront**
- The shop, product pages, homepage categories, trending products, and hero image all load live from Firestore.
- Checkout offers **Cash on Delivery**, **JazzCash**, and **EasyPaisa**. For the two wallets, the customer sends money to your account and enters the transaction ID (TID).
- Guests can check out without an account. Registered customers also get **My Account** with their order history.
- The contact form and newsletter sign-ups are saved to the database.
- Customers can sign up, sign in, and reset a forgotten password.

**Admin panel (`/admin`)**
| Page         | What it does                                                                        | Who can use it          |
| ------------ | ----------------------------------------------------------------------------------- | ----------------------- |
| Overview     | Revenue received, orders, products, users, 7-day sales chart                         | All staff               |
| Products     | Add, edit, and delete products; image upload; stock; featured and hidden flags; one-click starter catalog import | Admin, Manager          |
| Categories   | Add, edit, and delete categories with cover images                                   | Admin, Manager          |
| Orders       | Filter and search, change order status, mark payments Paid, see TIDs, WhatsApp the customer | All staff (delete: Admin) |
| Transactions | Payments ledger with CSV export                                                      | Admin, Manager          |
| Settings     | Shipping fee and free-shipping threshold, JazzCash/EasyPaisa account details, hero image | Admin                   |
| Messages     | Contact-form inbox (mark read, reply by email) and newsletter subscribers (CSV export) | All staff               |
| Team & Roles | Give existing accounts the Admin, Store Manager, or Support Agent role              | Admin                   |

## Data model (Firestore)

| Collection        | Contents                                                                                     | Access                                 |
| ----------------- | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| `products`        | name, price, category, description, image, stock, featured, active                            | Anyone reads; Admin/Manager write     |
| `categories`      | label, subtitle, image, sortOrder (document id = URL key, e.g. `living`)                      | Anyone reads; Admin/Manager write     |
| `settings/store`  | shippingFee, freeShippingThreshold, jazzcash, easypaisa, heroImage                            | Anyone reads; Admin writes            |
| `orders`          | orderNumber, customer, items, subtotal, shipping, total, payment {method, status, reference}, status, userId | Anyone creates (validated); owner and staff read; staff update |
| `messages`        | Contact form submissions                                                                      | Anyone creates; staff read and manage |
| `subscribers`     | Newsletter emails (document id = email)                                                       | Anyone creates once; staff read       |
| `users`           | name, email, phone, role (`customer`, `support`, `manager`, `admin`)                          | Owner and staff read; only Admins change roles |

## One-time setup

### 1. Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com). Google Analytics is not needed.
2. **Build → Authentication → Get started → Sign-in method** and enable **Email/Password**.
3. **Build → Firestore Database → Create database**. Choose a nearby location (e.g. `asia-south1`) and start in **production mode**.
4. **Project settings → General → Your apps → Web (`</>`)**. Register an app and copy the config values into `.env` (step 3).
5. **Authentication → Settings → Authorized domains**. Add your Hostinger domain (e.g. `livingspaceshub.com` and `www.livingspaceshub.com`).
6. Deploy the security rules and indexes:
   ```bash
   firebase login
   firebase use --add            # pick the project
   npm run firebase:rules
   ```

### 2. Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com). Copy the **Cloud name** from the dashboard.
2. **Settings → Upload → Upload presets → Add upload preset**:
   - Signing mode: **Unsigned**
   - Folder: `living-space-hub`
   - Allowed formats: `jpg, png, webp, avif`
   - Max file size: `5000000` (5 MB)
   - Unique filename: on. Overwrite: off.
3. Save it and copy the preset name.

> The preset name is visible in the site's JavaScript, so anyone who finds it could upload images to your account. The limits above keep that contained. Deleting a product does not delete its Cloudinary image; remove unused images from the Cloudinary Media Library occasionally.

### 3. Environment file

```bash
cp .env.example .env     # then fill in the Firebase and Cloudinary values
```

### 4. First administrator

1. `npm run dev`, open http://localhost:5173/signup, and create your account.
2. Firebase console → **Project settings → Service accounts → Generate new private key**. Save the file as `service-account.json` in the project root. It is gitignored; never share or upload it.
3. Run:
   ```bash
   npm run make-admin -- you@example.com
   ```
   Alternatively, in the Firestore console, open `users/<your uid>` and change `role` to `admin`.
4. Sign in at `/admin-login`. On **Products**, click **Import starter catalog** to load the original 47 products and copy their images to Cloudinary. Then set shipping and the JazzCash/EasyPaisa numbers under **Settings**.

After that, add staff from **Admin → Team & Roles**. Each person signs up on the website first.

## Development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev          # http://localhost:5173
npm run lint
npm run test:rules   # security rules tests on the Firestore emulator (needs Java 11+)
```

## Deploying to Hostinger

`.env` values are baked in at build time, so rebuild after changing them.

**Option A: automatic upload over FTP**

```bash
cp .env.deploy.example .env.deploy   # FTP details from hPanel → Files → FTP Accounts
npm run deploy                       # builds, then uploads dist/ to public_html
```

The script uploads new assets first and `index.html` last, so the live site never points to missing files. It deletes old build files only inside `public_html/assets`.

**Option B: manual upload**

1. `npm run build`
2. hPanel → **File Manager → public_html**. Upload the **contents** of `dist/`, including the hidden `.htaccess`.

After deploying, open `https://yourdomain.com/shop` and refresh it. The page should load, not show a 404. Then place a test order.

**Why `.htaccess` matters:** URLs like `/shop` and `/admin/orders` are not real files. The rewrite rule sends them to `index.html`, and React Router shows the right page.

**HTTPS:** once SSL is active in hPanel, uncomment the "Force HTTPS" lines in `public/.htaccess` and redeploy.

## Known limits of the free-plan design

- **Prices are not checked on the server.** The rules check that an order is well formed, that shipping matches your settings, and that total = subtotal + shipping. They cannot compare each item's price to the catalog. The admin should check totals before confirming an order, which already happens because Cash on Delivery and wallet orders are confirmed by hand.
- **Stock is not reduced automatically** when an order is placed. Update stock from Products after dispatching.
- **Old Cloudinary images are not deleted** when a product image is replaced or removed.

Moving to the Blaze plan with Cloud Functions would handle all three.
