/*
  # Store Management System

  1. New Tables
    - `store_addons` - Manage available add-ons with pricing and details
    - `store_orders` - Track customer orders and purchases
    - `store_order_items` - Individual items within orders
    - `store_categories` - Categorize add-ons (SaaS, Standalone, etc.)

  2. Security
    - Enable RLS on all store tables
    - Super admins can manage all store data
    - Anonymous users can view published add-ons
    - Authenticated users can place orders

  3. Features
    - Add-on management with versioning
    - Order processing and tracking
    - Category-based organization
    - Pricing management
*/

-- Create store categories table
CREATE TABLE IF NOT EXISTS store_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store add-ons table
CREATE TABLE IF NOT EXISTS store_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  category_id uuid REFERENCES store_categories(id),
  price decimal(10,2) NOT NULL DEFAULT 0,
  original_price decimal(10,2),
  currency text DEFAULT 'KES',
  features jsonb DEFAULT '[]',
  images jsonb DEFAULT '[]',
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  version text DEFAULT '1.0.0',
  compatibility jsonb DEFAULT '{"saas": true, "standalone": true}',
  requirements text,
  installation_notes text,
  support_level text DEFAULT 'standard',
  download_count integer DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create store orders table
CREATE TABLE IF NOT EXISTS store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  institution_name text,
  billing_address jsonb,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  payment_reference text,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'KES',
  notes text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store order items table
CREATE TABLE IF NOT EXISTS store_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES store_orders(id) ON DELETE CASCADE,
  addon_id uuid REFERENCES store_addons(id),
  addon_name text NOT NULL,
  addon_description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  addon_version text,
  license_key text,
  download_url text,
  created_at timestamptz DEFAULT now()
);

-- Create store reviews table
CREATE TABLE IF NOT EXISTS store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id uuid REFERENCES store_addons(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_verified boolean DEFAULT false,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all store tables
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for store_categories
CREATE POLICY "Anyone can view active categories"
  ON store_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage categories"
  ON store_categories
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM super_admins));

-- Policies for store_addons
CREATE POLICY "Anyone can view published addons"
  ON store_addons
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Super admins can manage addons"
  ON store_addons
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM super_admins));

-- Policies for store_orders
CREATE POLICY "Super admins can view all orders"
  ON store_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins));

CREATE POLICY "Super admins can manage orders"
  ON store_orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM super_admins));

CREATE POLICY "Allow anonymous order creation"
  ON store_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for store_order_items
CREATE POLICY "Super admins can view all order items"
  ON store_order_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins));

CREATE POLICY "Super admins can manage order items"
  ON store_order_items
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM super_admins));

CREATE POLICY "Allow anonymous order item creation"
  ON store_order_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for store_reviews
CREATE POLICY "Anyone can view published reviews"
  ON store_reviews
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Super admins can manage reviews"
  ON store_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM super_admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM super_admins));

CREATE POLICY "Allow anonymous review creation"
  ON store_reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_store_addons_category_id ON store_addons(category_id);
CREATE INDEX IF NOT EXISTS idx_store_addons_published ON store_addons(is_published);
CREATE INDEX IF NOT EXISTS idx_store_addons_featured ON store_addons(is_featured);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_store_orders_email ON store_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_store_orders_created_at ON store_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_store_order_items_order_id ON store_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_addon_id ON store_reviews(addon_id);

-- Create triggers for updated_at
CREATE TRIGGER update_store_categories_updated_at BEFORE UPDATE ON store_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_addons_updated_at BEFORE UPDATE ON store_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_orders_updated_at BEFORE UPDATE ON store_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON store_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO store_categories (name, description, slug, display_order) VALUES
('SaaS Add-ons', 'Add-ons for the SaaS version of Acadeemia', 'saas-addons', 1),
('Standalone Add-ons', 'Add-ons for the Standalone version of Acadeemia', 'standalone-addons', 2),
('Premium Features', 'Premium features and enhancements', 'premium-features', 3),
('Integrations', 'Third-party integrations and connectors', 'integrations', 4),
('Templates', 'Templates and themes', 'templates', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample add-ons
DO $$
DECLARE
    saas_category_id uuid;
    standalone_category_id uuid;
BEGIN
    -- Get category IDs
    SELECT id INTO saas_category_id FROM store_categories WHERE slug = 'saas-addons';
    SELECT id INTO standalone_category_id FROM store_categories WHERE slug = 'standalone-addons';
    
    -- Insert SaaS add-ons
    INSERT INTO store_addons (
        name, slug, description, short_description, category_id, price, features, 
        is_published, is_popular, compatibility
    ) VALUES
    (
        'QR Code Attendance',
        'qr-code-attendance-saas',
        'Advanced attendance tracking using QR codes for quick and accurate recording. Students and staff can check in/out by scanning QR codes with their mobile devices.',
        'QR code-based attendance tracking system',
        saas_category_id,
        3999.00,
        '["QR code generation for each user", "Mobile app scanning capability", "Real-time attendance updates", "Attendance reports and analytics", "Integration with existing attendance system"]',
        true,
        true,
        '{"saas": true, "standalone": false}'
    ),
    (
        'Two-Factor Authentication',
        'two-factor-auth-saas',
        'Enhanced security with two-factor authentication for user accounts. Protect sensitive data with SMS and app-based verification.',
        'Enhanced security with 2FA',
        saas_category_id,
        2999.00,
        '["SMS-based verification", "App-based authentication (Google Authenticator)", "Backup codes for account recovery", "Admin controls for 2FA enforcement", "Security audit logs"]',
        true,
        true,
        '{"saas": true, "standalone": false}'
    );
    
    -- Insert Standalone add-ons
    INSERT INTO store_addons (
        name, slug, description, short_description, category_id, price, features, 
        is_published, is_popular, compatibility
    ) VALUES
    (
        'Android App',
        'android-app-standalone',
        'Mobile access through dedicated Android application. Native mobile experience for students, teachers, and parents with offline synchronization.',
        'Native Android mobile application',
        standalone_category_id,
        3999.00,
        '["Native Android application", "Offline data synchronization", "Push notifications", "Mobile-optimized interface", "App store deployment assistance"]',
        true,
        true,
        '{"saas": false, "standalone": true}'
    ),
    (
        'Biometrics Entry',
        'biometrics-entry-standalone',
        'Biometric authentication for secure access control. Fingerprint and facial recognition support for enhanced security.',
        'Biometric authentication system',
        standalone_category_id,
        1999.00,
        '["Fingerprint recognition", "Facial recognition (optional)", "Access control integration", "Attendance via biometrics", "Security audit trails"]',
        true,
        false,
        '{"saas": false, "standalone": true}'
    ),
    (
        'Multi Branch Management',
        'multi-branch-standalone',
        'Manage multiple branches or campuses from a single system. Centralized management with branch-specific controls and reporting.',
        'Multi-campus management system',
        standalone_category_id,
        2999.00,
        '["Multiple campus management", "Branch-specific user roles", "Centralized reporting", "Inter-branch data sharing", "Branch performance analytics"]',
        true,
        true,
        '{"saas": false, "standalone": true}'
    ),
    (
        'Zoom Live Classes',
        'zoom-live-classes-standalone',
        'Integrate Zoom for seamless virtual classroom experiences. Professional video conferencing for education with automated scheduling.',
        'Zoom integration for virtual classes',
        standalone_category_id,
        1999.00,
        '["Zoom integration", "Automated meeting scheduling", "Recording capabilities", "Breakout room support", "Attendance tracking"]',
        true,
        true,
        '{"saas": false, "standalone": true}'
    );
    
END $$;