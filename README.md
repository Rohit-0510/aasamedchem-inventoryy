# AASA MedChem — Pharmaceutical Inventory Management System

A full-stack inventory and order management system built for AasaMedChem, supporting role-based access for Admins and Sellers with unit conversion, pricing in INR, and quotation/order management.

---

## 🔗 Live Demo
[https://aasamedchem-inventoryy.vercel.app](https://aasamedchem-inventoryy.vercel.app)

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aasa.com | admin123 |
| Seller | seller@aasa.com | seller123 |

---

## 📋 Project Overview

This system allows:
- **Admins** to manage products, configure pricing, and view/manage all orders
- **Sellers** to browse products, place orders in any supported unit, and track their order history
- **Unit-aware pricing** — prices are calculated correctly regardless of which unit the seller uses

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Neon PostgreSQL (Serverless) |
| ORM | Prisma |
| Authentication | NextAuth.js |
| Deployment | Vercel |
| Password Hashing | bcryptjs |
| Forms | react-hook-form |
| Notifications | react-toastify |

---

## 🏗 High-Level System Design

```
User Browser
     ↓
Next.js Frontend (React + Tailwind)
     ↓
Next.js API Routes (/api/*)
     ↓
Prisma ORM
     ↓
Neon PostgreSQL Database
```

- Frontend and backend live in the same Next.js project
- API routes handle all business logic and session validation
- Prisma connects to Neon PostgreSQL via DATABASE_URL environment variable
- NextAuth.js manages sessions using JWT tokens
- Entire app is deployed on Vercel

---

## 🗄 Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String | Unique email |
| password | String | Bcrypt hashed |
| name | String | Display name |
| role | Enum (ADMIN, SELLER) | Access level |
| createdAt | DateTime | Auto generated |

### Products
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Product name |
| sku | String | Unique identifier |
| description | String? | Optional |
| category | String? | Optional |
| baseUnit | Enum | g, kg, L, mL, unit |
| basePricePerUnit | Decimal(20,6) | Price in INR per base unit |
| stockQuantity | Decimal(20,6) | Stored in base unit |
| isActive | Boolean | Visibility flag |

### Orders
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| orderNumber | String | Auto generated unique |
| sellerId | String | Foreign key → Users |
| status | Enum | PENDING, CONFIRMED, CANCELLED |
| totalAmount | Decimal(20,6) | Total in INR |
| notes | String? | Optional |

### OrderItems
| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| orderId | String | Foreign key → Orders |
| productId | String | Foreign key → Products |
| orderedUnit | Enum | Unit chosen by seller |
| orderedQuantity | Decimal(20,6) | Quantity in ordered unit |
| baseQuantity | Decimal(20,6) | Converted to base unit |
| unitPrice | Decimal(20,6) | Price per ordered unit in INR |
| totalPrice | Decimal(20,6) | Total in INR |

---

## ⚖ Unit Storage and Conversion Strategy

### Base Units
| Dimension | Base Unit | Reason |
|-----------|-----------|--------|
| Weight | grams (g) | Smallest common weight unit |
| Volume | milliliters (mL) | Smallest common volume unit |
| Count | unit | No conversion needed |

### Conversion Factors
| From | To | Factor |
|------|----|--------|
| kg | g | × 1000 |
| g | kg | ÷ 1000 |
| L | mL | × 1000 |
| mL | L | ÷ 1000 |
| unit | unit | × 1 |

### How Conversions Work
- **Before saving to DB:** ordered quantity is converted to base unit
- **During price calculation:** base price is adjusted to match ordered unit
- **Before display:** base quantity is converted back to display unit
- All conversion logic lives in `lib/unitConversion.ts`

### Data Types
- All quantities and prices use `Decimal(20, 6)` in PostgreSQL
- Handles up to 20 digits total with 6 decimal places
- Avoids floating point precision errors
- Final displayed prices are rounded to 2 decimal places in INR format

---

## 🚀 Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Rohit-0510/aasamedchem-inventoryy.git
cd aasamedchem-inventoryy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env.local file
```
DATABASE_URL=your_neon_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Generate Prisma client
```bash
npx prisma generate
```

### 5. Run database migrations
```bash
npx prisma migrate dev --name init
```

### 6. Seed the database
```bash
npx prisma db seed
```

### 7. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁ Vercel Deployment

### First time deploy:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → your Vercel URL
4. Click Deploy

### Redeploy after changes:
```bash
git add .
git commit -m "your change description"
git push
```
Vercel automatically redeploys on every push to main.

---

## 👤 How to Use

### Admin Panel
1. Login with admin@aasa.com / admin123
2. **Dashboard** — view stats and summary
3. **Products** — create, edit, delete products and set base prices
4. **Orders** — view all seller orders, check unit conversions and pricing, update order status

### Seller Panel
1. Login with seller@aasa.com / seller123
2. **Browse Products** — search and filter available products
3. **Place Order** — select products, choose quantity and unit, see live price calculation
4. **My Orders** — view order history and status

---

## 📁 Project Structure

```
/app
  /(auth)/login        → Login page
  /(seller)/dashboard  → Seller dashboard
  /(seller)/products   → Browse products
  /(seller)/orders     → Order history
  /(admin)/admin       → Admin panels
  /api                 → All API routes
/components
  /ui                  → Reusable UI components
  /layout              → Sidebar and Navbar
/lib
  /prisma.ts           → Prisma client singleton
  /unitConversion.ts   → All conversion logic
  /auth.ts             → NextAuth configuration
  /utils.ts            → Helper functions
/prisma
  /schema.prisma       → Database schema
  /seed.ts             → Seed data
```

---

## 👨‍💻 Author
Rohit Kumar Dubey