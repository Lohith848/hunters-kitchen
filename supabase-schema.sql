-- The Hunters Kitchen - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  college TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MENU ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  items JSONB NOT NULL,
  total_amount INTEGER NOT NULL,
  delivery_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOTEL SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hotel_settings (
  id INTEGER DEFAULT 1 PRIMARY KEY,
  opening_time TIME DEFAULT '10:00',
  closing_time TIME DEFAULT '22:00',
  is_open BOOLEAN DEFAULT true
);

-- ============================================
-- HOLIDAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Menu Items: Anyone can view, only admins can modify
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Orders: Users can view/create their own orders, admins can view all
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Hotel Settings: Anyone can view, only admins can modify
CREATE POLICY "Anyone can view hotel settings" ON hotel_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage hotel settings" ON hotel_settings
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Holidays: Anyone can view, only admins can modify
CREATE POLICY "Anyone can view holidays" ON holidays
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage holidays" ON holidays
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- Admins: Only admins can view admins table
CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admins)
  );

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default hotel settings
INSERT INTO hotel_settings (id, opening_time, closing_time, is_open)
VALUES (1, '10:00', '22:00', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE MENU ITEMS (Optional - for testing)
-- ============================================

INSERT INTO menu_items (name, description, price, category, is_available) VALUES
  ('Chicken Biryani', 'Aromatic basmati rice cooked with tender chicken and spices', 150, 'Main Course', true),
  ('Paneer Biryani', 'Fragrant rice prepared with soft paneer cubes and herbs', 130, 'Main Course', true),
  ('Chicken Curry', 'Spicy chicken curry served with gravy', 120, 'Curry', true),
  ('Paneer Butter Masala', 'Creamy tomato-based paneer curry', 110, 'Curry', true),
  ('Naan', 'Soft leavened flatbread', 20, 'Bread', true),
  ('Roti', 'Whole wheat flatbread', 15, 'Bread', true),
  ('Fried Rice', 'Chinese-style fried rice with vegetables', 80, 'Rice', true),
  ('Chicken 65', 'Spicy deep-fried chicken appetizer', 90, 'Snacks', true),
  ('Veg Manchurian', 'Vegetable balls in Manchurian sauce', 70, 'Snacks', true),
  ('Coke', 'Chilled soft drink (300ml)', 40, 'Beverages', true),
  ('Water Bottle', '500ml drinking water', 20, 'Beverages', true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, address, college)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'college', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
