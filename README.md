# DineFlow - Student Food Ordering Platform

A web application for college students to order food from The DineFlow with free delivery.

## Features

- **User Authentication**: Email/password signup and login via Supabase
- **Profile Management**: Students enter name, phone, college, and delivery address
- **Menu Browsing**: View available dishes with categories and prices
- **Shopping Cart**: Add/remove items with persistent cart (localStorage)
- **WhatsApp Ordering**: Orders sent to hotel owner via WhatsApp with pre-filled message
- **Order History**: Users can track their past orders
- **Admin Panel**: 
  - Menu management (add, edit, delete, toggle availability)
  - Order management (view all orders, update status)
  - Settings (hotel timings, holidays)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: Zustand (with localStorage persistence)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Clone and Install

```bash
cd hunters-kitchen
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. This creates all tables, RLS policies, and sample menu items

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_WHATSAPP_NUMBER=916383346991
   ```

### 4. Create Admin User

1. Start the dev server and sign up at `/login`
2. In Supabase Dashboard > Authentication > Users, copy your user ID
3. Run this in SQL Editor:
   ```sql
   INSERT INTO admins (id, email) VALUES ('your-user-id-here', 'your@email.com');
   ```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
hunters-kitchen/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── auth/            # Auth callback routes
│   ├── cart/            # Shopping cart page
│   ├── checkout/        # Checkout with WhatsApp ordering
│   ├── login/           # User login/signup
│   ├── menu/            # Menu browsing
│   ├── orders/          # Order history
│   ├── profile/         # User profile pages
│   ├── middleware.ts    # Auth middleware
│   ├── layout.tsx       # Root layout with Header/Footer
│   └── page.tsx         # Home page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Navigation header
│   └── Footer.tsx       # Site footer
├── lib/
│   ├── actions/         # Server actions (auth, menu, orders, admin)
│   ├── supabaseClient.ts    # Browser Supabase client
│   ├── supabaseServer.ts    # Server Supabase client
│   ├── supabaseMiddleware.ts # Auth middleware helper
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
├── store/
│   └── cart.ts          # Zustand cart store with persistence
├── supabase-schema.sql  # Database schema
└── .env.example         # Environment variables template
```

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

## Database Schema

### Tables

- `profiles` - User profiles (name, phone, address, college)
- `menu_items` - Restaurant menu items
- `orders` - Order records
- `hotel_settings` - Hotel timings and open/close status
- `holidays` - Holiday dates when hotel is closed
- `admins` - Admin user references

See `supabase-schema.sql` for full schema with RLS policies.

## WhatsApp Integration

Orders are sent via WhatsApp using the `wa.me` link format:

```
https://wa.me/<number>?text=<encoded-message>
```

The message includes:
- Customer name, phone, address, college
- Order items with quantities and prices
- Total amount
- Payment method (Cash on Delivery)

## Security

- Row Level Security (RLS) on all tables
- Protected routes via middleware
- Server-side validation for all inputs
- Admin-only routes protected by database check

## License

MIT
