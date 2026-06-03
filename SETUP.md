# AASA MedChem - Inventory & Order Management System

A complete full-stack pharmaceutical inventory and order management system built with Next.js 14, PostgreSQL, and Prisma.

## Overview

This system provides:
- **Admin Dashboard**: Monitor products, orders, and system analytics
- **Seller Portal**: Browse products, place orders, and track status
- **Role-based Access Control**: Separate interfaces for Admin and Seller roles
- **Unit Conversion System**: Automatic conversion between different measurement units (g, kg, mL, L, units)
- **Order Management**: Create, track, and manage orders with real-time price calculations
- **Product Management**: Full CRUD operations for product catalog

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL (via Neon - serverless)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Credentials Provider
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Form Management**: React Hook Form with Zod validation
- **Notifications**: React Toastify

## Project Structure

```
/app
  /api
    /auth/[...nextauth]       # NextAuth endpoint
    /products                 # Product CRUD APIs
    /orders                   # Order CRUD APIs
  /(auth)
    /login                    # Login page
  /(seller)
    /dashboard                # Seller dashboard
    /products                 # Browse products
    /orders
      /new                    # Place new order
      /page.tsx              # View orders
  /(admin)
    /admin
      /dashboard              # Admin dashboard
      /products               # Manage products
      /orders                 # Manage all orders
/components
  /ui                         # Reusable UI components
  /layout                     # Layout components (Navbar, Sidebar)
  /products                   # Product components
  /orders                     # Order components
/lib
  /prisma.ts                 # Prisma client singleton
  /auth.ts                   # NextAuth configuration
  /unitConversion.ts         # Unit conversion utilities
  /utils.ts                  # Helper functions
/prisma
  /schema.prisma             # Database schema
  /seed.ts                   # Seed data
```

## Setup Instructions

### 1. Database Setup

#### Option A: Using Neon (Recommended for Production)
1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Add it to `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.neon.tech/dbname"
```

#### Option B: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a new database:
```bash
createdb aasa_inventory
```
3. Update `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/aasa_inventory"
```

### 2. Environment Variables

Create `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-random-string-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Installation

```bash
# Install dependencies
npm install

# Initialize Prisma and create database tables
npx prisma migrate dev --name init

# Seed the database with demo data
npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Demo Credentials

After seeding, use these credentials to login:

**Admin Account:**
- Email: `admin@aasa.com`
- Password: `admin123`

**Seller Account:**
- Email: `seller@aasa.com`
- Password: `seller123`

## Features

### Authentication & Authorization
- Email/Password authentication via NextAuth.js
- Two user roles: ADMIN and SELLER
- Role-based route protection
- Automatic redirection to appropriate dashboard after login

### Admin Dashboard
- **Statistics**: View total products, orders, and revenue
- **Product Management**: Create, edit, and delete products
- **Order Management**: View all orders, change status (PENDING → CONFIRMED → CANCELLED)
- **Analytics**: Real-time order tracking

### Seller Portal
- **Dashboard**: Overview of personal orders and spending
- **Product Catalog**: Browse and search products with filters
- **Order Placement**: 
  - Select multiple products
  - Choose quantities in any supported unit
  - Real-time price calculation
  - Order confirmation
- **Order Tracking**: View order status and history

### Unit Conversion System
- Automatic conversion between units:
  - Weight: grams (g), kilograms (kg)
  - Volume: millilitres (mL), litres (L)
  - Count: pieces (unit)
- Live price calculation based on selected unit
- Consistent internal storage in base units

### Pricing System
- All prices stored in INR (Indian Rupees)
- Formatted with ₹ symbol and proper Indian number formatting (1,23,456.78)
- Dynamic price calculation based on quantity and unit

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Products
- `GET /api/products` - List products (with search/filter)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Orders
- `GET /api/orders` - List orders (seller sees own, admin sees all)
- `POST /api/orders` - Create new order (seller only)
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status (admin only)

## Database Schema

### Users
```typescript
- id: UUID (primary key)
- email: String (unique)
- password: String (hashed with bcrypt)
- name: String
- role: Enum (ADMIN | SELLER)
- createdAt, updatedAt: Timestamp
```

### Products
```typescript
- id: UUID (primary key)
- name: String
- sku: String (unique)
- description: String (optional)
- category: String (optional)
- baseUnit: Enum (g | kg | L | mL | unit)
- basePricePerUnit: Decimal(20,6)
- stockQuantity: Decimal(20,6)
- isActive: Boolean
- createdAt, updatedAt: Timestamp
```

### Orders
```typescript
- id: UUID (primary key)
- orderNumber: String (unique, auto-generated)
- sellerId: UUID (foreign key)
- status: Enum (PENDING | CONFIRMED | CANCELLED)
- totalAmount: Decimal(20,6)
- notes: String (optional)
- createdAt, updatedAt: Timestamp
```

### OrderItems
```typescript
- id: UUID (primary key)
- orderId: UUID (foreign key)
- productId: UUID (foreign key)
- orderedUnit: Enum (g | kg | L | mL | unit)
- orderedQuantity: Decimal(20,6)
- baseQuantity: Decimal(20,6) [converted to product base unit]
- unitPrice: Decimal(20,6)
- totalPrice: Decimal(20,6)
```

## Unit Conversion Examples

### Weight Conversion
- 1 kg = 1000 g
- Price per kg = Price per g × 1000

### Volume Conversion
- 1 L = 1000 mL
- Price per L = Price per mL × 1000

### Quantity Storage
All quantities are stored in base units internally:
- Base weight: grams (g)
- Base volume: millilitres (mL)
- Base count: unit (unit)

## Development

### Run Development Server
```bash
npm run dev
```

### Generate Prisma Client
```bash
npx prisma generate
```

### View Database
```bash
npx prisma studio
```

### Update Database Schema
```bash
npx prisma migrate dev --name migration_name
```

## Production Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a secure secret
   - `NEXTAUTH_URL`: Your production URL (e.g., https://yourdomain.com)
4. Deploy

### Pre-deployment Checklist
- [ ] Update `.env.local` with production database URL
- [ ] Generate secure `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test all authentication flows
- [ ] Verify seed data or create admin account
- [ ] Test payment/pricing calculations
- [ ] Review and update security settings

## Security Considerations

- Passwords are hashed with bcrypt (10 salt rounds)
- NextAuth.js handles session management securely
- Database queries use Prisma (prevents SQL injection)
- Environment variables are not exposed to client
- API routes validate user session and role
- Middleware protects routes based on role

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db execute --stdin < /dev/null

# Check connection string format
# PostgreSQL: postgresql://user:password@host:port/database
```

### Prisma Client Not Found
```bash
npm install @prisma/client
npx prisma generate
```

### Seed Data Not Loading
```bash
# Run seed manually
npm run db:seed

# Or with ts-node
npx ts-node prisma/seed.ts
```

### NextAuth Session Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

## Performance Optimization

- Server-side pagination for large datasets
- Database query optimization with Prisma select
- Client-side caching with React Query patterns
- Image optimization with Next.js Image component
- Tailwind CSS for minimal CSS bundle

## Future Enhancements

- [ ] Multi-currency support
- [ ] Inventory tracking and low stock alerts
- [ ] Email notifications for order updates
- [ ] PDF invoice generation
- [ ] Advanced analytics and reporting
- [ ] Bulk order operations
- [ ] Integration with payment gateways
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Audit logs for all operations

## Support & Documentation

For detailed information on specific features:
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

This project is proprietary software. All rights reserved.

## Contact

For support or inquiries, please contact the development team.
