-- Create the tattoos table
CREATE TABLE IF NOT EXISTS tattoos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  size TEXT CHECK (size IN ('small', 'medium', 'large')),
  style TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE tattoos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read tattoos
CREATE POLICY "Allow public read access" ON tattoos
  FOR SELECT USING (true);

-- Insert initial mock data
INSERT INTO tattoos (name, price, size, style, image_url)
VALUES 
  ('Lion Majestueux', 500, 'small', ARRAY['Animaux'], 'https://iahhlyfbpddidoozknjv.supabase.co/storage/v1/object/public/tatoo_images/animaux.jpeg'),
  ('Rose Délicate', 500, 'small', ARRAY['Fleurs'], 'https://iahhlyfbpddidoozknjv.supabase.co/storage/v1/object/public/tatoo_images/roses.jpeg'),
  ('Aigle Royal', 1000, 'medium', ARRAY['Animaux'], 'https://iahhlyfbpddidoozknjv.supabase.co/storage/v1/object/public/tatoo_images/aigles.jpeg'),
  ('Animaux', 3000, 'large', ARRAY['Animaux', 'Géométrique'], 'https://iahhlyfbpddidoozknjv.supabase.co/storage/v1/object/public/tatoo_images/animaux.jpeg'),
  ('Papillons', 500, 'small', ARRAY['Insectes'], 'https://iahhlyfbpddidoozknjv.supabase.co/storage/v1/object/public/tatoo_images/papillons.jpeg');

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  shipping_method TEXT CHECK (shipping_method IN ('pickup', 'delivery')),
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID, -- Optional: link to tattoos table if exists
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  is_reseller_pack BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Optional for admin only access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Simple policy for public insert (customer) and auth read (admin)
-- For a real app, you'd restrict select to authenticated users (admin)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can see orders" ON orders FOR SELECT USING (true); -- Simplify for now
CREATE POLICY "Admins can see items" ON order_items FOR SELECT USING (true); -- Simplify for now
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (true); -- Simplify for now
