# Quick Start Guide

Get the AASA MedChem inventory system running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database or Neon account
- A code editor (VS Code recommended)

## Step 1: Setup Database Connection

### Option A: Neon (Cloud Database) - **Easiest**

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (looks like `postgresql://user:password@...`)

### Option B: Local PostgreSQL

```bash
# Create database
createdb aasa_inventory
```

## Step 2: Configure Environment

Create `.env.local` in the project root:

```env
DATABASE_URL="paste_your_connection_string_here"
NEXTAUTH_SECRET="change_me_to_a_random_32_char_string"
NEXTAUTH_URL="http://localhost:3000"
```

**Quick tip:** Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Step 3: Initialize Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with demo data (creates users and 10 sample products)
npm run db:seed
```

## Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Login with Demo Accounts

**Admin:**
- Email: `admin@aasa.com`
- Password: `admin123`

**Seller:**
- Email: `seller@aasa.com`
- Password: `seller123`

## What's Included

### Admin Can:
- ✅ View dashboard with stats
- ✅ Create, edit, delete products
- ✅ View all orders from all sellers
- ✅ Change order status
- ✅ See revenue analytics

### Seller Can:
- ✅ Browse and search products
- ✅ Place orders with multiple items
- ✅ Choose quantity in any unit (g, kg, mL, L, units)
- ✅ View order history
- ✅ Track order status

## Common Tasks

### View Database
```bash
npx prisma studio
```
Opens a web UI to browse all data.

### Reset Database
```bash
npx prisma migrate reset
npm run db:seed
```

### Generate New Migration
```bash
# After changing schema.prisma
npx prisma migrate dev --name describe_change
```

### Check Logs
Database query logs appear in console during `npm run dev`

## Deployment

### Deploy to Vercel (1 Click!)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repo
4. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXTAUTH_SECRET`: A new random secret
   - `NEXTAUTH_URL`: Your production domain
5. Deploy!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check `DATABASE_URL` in `.env.local` |
| "NEXTAUTH_SECRET not found" | Make sure it's in `.env.local` and restart dev server |
| "Prisma client not found" | Run `npm install @prisma/client` |
| Seeds not running | Use `npm run db:seed` instead of `npx prisma db seed` |

## Project Structure

```
📁 app/
  📁 api/              # Backend API routes
  📁 (seller)/         # Seller pages (protected)
  📁 (admin)/          # Admin pages (protected)
  📁 (auth)/           # Login page
📁 components/         # React components
📁 lib/               # Utilities & config
  📄 auth.ts           # NextAuth setup
  📄 unitConversion.ts # Unit conversion logic
  📄 utils.ts          # Helper functions
📁 prisma/
  📄 schema.prisma     # Database schema
  📄 seed.ts           # Demo data
```

## Key Features

🔐 **Secure Authentication**
- Email/password login
- Session management
- Role-based access control

📦 **Product Catalog**
- Search & filter
- Support for different units
- Pricing per unit

🛒 **Order Management**
- Multi-item orders
- Unit selection
- Real-time price calculation
- Order status tracking

💰 **Indian Currency**
- All prices in INR
- Proper number formatting (1,23,456.78)

## Next Steps

1. ✅ Run the system locally
2. 📖 Read [SETUP.md](./SETUP.md) for detailed docs
3. 🎨 Customize UI in `/components`
4. 📊 Add new features
5. 🚀 Deploy to Vercel

## API Examples

### Get all products
```bash
curl http://localhost:3000/api/products
```

### Search products
```bash
curl "http://localhost:3000/api/products?search=aspirin"
```

### Create order (requires auth)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "abc", "orderedUnit": "kg", "orderedQuantity": "1.5"}]
  }'
```

## Support

- 📚 See [SETUP.md](./SETUP.md) for detailed documentation
- 🐛 Check browser console for errors
- 📝 Database logs in terminal during dev

## Happy Building! 🚀
