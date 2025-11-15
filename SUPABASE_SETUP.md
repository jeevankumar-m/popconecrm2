# Supabase Database Setup

This document provides the SQL script to create the `customers` table in your Supabase database.

## Steps to Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL script:

```sql
-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_category TEXT NOT NULL CHECK (customer_category IN ('B2C', 'B2B', 'BULK')),
  sub_type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  area TEXT,
  order_source TEXT,
  last_order_date DATE,
  order_count INTEGER DEFAULT 0,
  assigned_to TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Hot', 'Cold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_customers_category ON customers(customer_category);
CREATE INDEX IF NOT EXISTS idx_customers_sub_type ON customers(sub_type);
CREATE INDEX IF NOT EXISTS idx_customers_area ON customers(area);
CREATE INDEX IF NOT EXISTS idx_customers_order_source ON customers(order_source);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO customers (customer_category, sub_type, name, phone, email, area, order_source, last_order_date, order_count, assigned_to, status) VALUES
('B2C', 'Confirmed', 'John Doe', '1234567890', 'john@example.com', 'Porur', 'Instagram', '2024-01-15', 5, 'Sales Team A', 'Active'),
('B2C', 'COD Pending', 'Jane Smith', '0987654321', 'jane@example.com', 'T Nagar', 'Facebook', '2024-01-10', 2, 'Sales Team B', 'Hot'),
('B2B', 'Regular Buyers', 'ABC Shop', '1122334455', 'abc@shop.com', 'Porur', 'Direct', '2024-01-20', 15, 'Sales Team A', 'Active'),
('B2B', 'Leads / Potential', 'XYZ Theatre', '2233445566', 'xyz@theatre.com', 'Anna Nagar', 'Website', NULL, 0, 'Sales Team C', 'Cold'),
('BULK', 'One-time Order', 'College Event', '3344556677', 'event@college.edu', 'Guindy', 'Direct', '2024-01-18', 1, 'Sales Team A', 'Active'),
('B2C', 'Inquiry', 'Test Customer', '4455667788', 'test@example.com', 'Adyar', 'Instagram', NULL, 0, 'Sales Team B', 'Cold');
```

## Environment Variables

After creating the table, set up your environment variables:

1. Copy `.env.example` to `.env`
2. Fill in your Supabase project URL and anon key:
   - Find these in your Supabase project settings under "API"
   - `VITE_SUPABASE_URL`: Your project URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon/public key

## Row Level Security (RLS)

As per requirements, RLS is disabled for now. If you need to enable it later, you can do so in the Supabase dashboard under Authentication > Policies.

