# SHOE MAFIA — Premium Luxury Sneaker Ecommerce

World-class luxury sneaker platform for **SHOE MAFIA**, Bilaspur, Chhattisgarh.

## Features

- **Customer storefront**: Cinematic dark UI, shop, product detail, cart, checkout (UPI QR, COD, Razorpay-ready), order tracking, wishlist, WhatsApp integration, Google Maps, newsletter
- **UPI payments**: Auto-generated QR at checkout — pays directly to merchant UPI ID
- **Empty catalog until admin adds products**: Shows *"New drops coming soon."* when no inventory
- **Admin dashboard**: Product upload, inventory sync, orders, analytics, barcode generate/print/download
- **POS billing**: Barcode scan, GST invoice, thermal/A4 print, real-time stock sync with online store
- **Real-time inventory**: Socket.io broadcasts stock changes between online orders and offline POS
- **Security**: JWT auth, bcrypt passwords, Zod validation, security headers, role-based admin access

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) — switch to PostgreSQL for production (see `.env.example`)
- **Realtime**: Socket.io server on port 3001

## Project location

**`F:\smafia\shoe-mafia`**

## Quick Start

```bash
cd F:\smafia\shoe-mafia
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

- Store: http://localhost:3000
- **Customer login**: http://localhost:3000/login (email + password)
- **Admin login** (separate): http://localhost:3000/admin/login
- Admin dashboard: http://localhost:3000/admin

### Admin Credentials (change in production!)

- **Username**: `SHoEmafia`
- **Password**: `ShOeMaFia@#1`

### UPI Online Payments

Configured in `.env`:

- **UPI ID**: `7587555558-2@ybl`
- **Payee**: SHOE MAFIA

Customers choose **UPI QR Pay** at checkout → order is created → QR screen shows exact amount → payment goes to your UPI. Admin confirms payment in Orders dashboard.

### Busy Stock Import

Products imported from `BCNwiseStockDetails.pdf` (Busy software):

```bash
npm run extract:pdf    # re-extract PDF text if needed
npm run import:busy    # import all products into database
```

- **BCN** = Busy barcode number (used for POS scan lookup via `busyBcn`)
- Prices, sizes, colours, and in/out of stock from PDF closing quantity

## Adding Products

1. Log in as admin → **Products** → **Add Product**
2. Fill name, price, quantity, description, image URLs, sizes
3. System auto-generates **SKU**, **Inventory ID**, and **Barcode**
4. Download/print barcode for POS scanning

## POS Workflow

1. Go to **Admin → POS Billing**
2. Scan barcode (USB scanner sends Enter after code)
3. Items add to bill — stock deducts on complete sale
4. Online stock updates instantly via WebSocket

## Production Deployment

1. Set `DATABASE_URL` to PostgreSQL
2. Set strong `JWT_SECRET`
3. Configure Razorpay keys in `.env`
4. Deploy Next.js + Socket server (or use managed WebSockets)
5. Enable HTTPS, Redis cache, CDN for images
6. **Change admin password immediately**

## Store Info

**SHOE MAFIA**  
Bus Stand, Old Telephone Exchange Road, Telipara, Bilaspur, Chhattisgarh 495001  
Phone: +91 75875 55558
