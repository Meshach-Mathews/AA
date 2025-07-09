/*
  # Create demo data for testing

  1. Demo Users
    - Creates demo super admin user in auth.users and super_admins tables
    - Ensures original superadmin exists

  2. Demo School Data
    - Creates sample school, subscription, students, and classes for testing
    - Uses consistent UUIDs for reproducible demo data

  3. Data Safety
    - Uses ON CONFLICT clauses to prevent duplicate data
    - Checks for existing records before insertion
*/

-- Create the auth user for demo super admin
DO $$
DECLARE
    demo_user_id uuid;
    existing_superadmin_id uuid;
BEGIN
    -- Generate a consistent UUID for the demo user
    demo_user_id := '11111111-1111-1111-1111-111111111111';
    
    -- Check if demo user already exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'demo@acadeemia.com'
    ) THEN
        -- Insert into auth.users table
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            demo_user_id,
            'authenticated',
            'authenticated',
            'demo@acadeemia.com',
            crypt('DemoAdmin2025!', gen_salt('bf')),
            now(),
            null,
            null,
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Demo Admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    ELSE
        -- Get existing user ID
        SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@acadeemia.com';
    END IF;

    -- Insert into super_admins table if not exists (without role column)
    INSERT INTO super_admins (
        id,
        email,
        password_hash
    )
    VALUES (
        demo_user_id,
        'demo@acadeemia.com',
        crypt('DemoAdmin2025!', gen_salt('bf'))
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = crypt('DemoAdmin2025!', gen_salt('bf')),
        updated_at = now();

    -- Also ensure the original superadmin exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'superadmin@acadeemia.com'
    ) THEN
        -- Generate UUID for superadmin
        existing_superadmin_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            existing_superadmin_id,
            'authenticated',
            'authenticated',
            'superadmin@acadeemia.com',
            crypt('Acadeemia@2025', gen_salt('bf')),
            now(),
            null,
            null,
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Super Admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );

        -- Insert into super_admins table (without role column)
        INSERT INTO super_admins (
            id,
            email,
            password_hash
        )
        VALUES (
            existing_superadmin_id,
            'superadmin@acadeemia.com',
            crypt('Acadeemia@2025', gen_salt('bf'))
        )
        ON CONFLICT (email) DO NOTHING;
    END IF;

END $$;

-- Create a sample school for testing
INSERT INTO schools (
    id,
    name,
    address,
    phone,
    email,
    website
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Demo Academy',
    '123 Education Street, Learning City',
    '+254 700 123 456',
    'info@demoacademy.com',
    'https://demoacademy.com'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    updated_at = now();

-- Create a sample subscription for the demo school
INSERT INTO subscriptions (
    id,
    school_id,
    plan,
    status,
    start_date,
    end_date
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'professional',
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year'
) ON CONFLICT (id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = now();

-- Create some sample students for the demo school
INSERT INTO students (
    id,
    admission_number,
    first_name,
    last_name,
    date_of_birth,
    gender,
    school_id
) VALUES 
(
    '44444444-4444-4444-4444-444444444444',
    'STU001',
    'John',
    'Doe',
    '2010-05-15',
    'Male',
    '22222222-2222-2222-2222-222222222222'
),
(
    '55555555-5555-5555-5555-555555555555',
    'STU002',
    'Jane',
    'Smith',
    '2011-03-22',
    'Female',
    '22222222-2222-2222-2222-222222222222'
),
(
    '66666666-6666-6666-6666-666666666666',
    'STU003',
    'Michael',
    'Johnson',
    '2010-08-10',
    'Male',
    '22222222-2222-2222-2222-222222222222'
)
ON CONFLICT (admission_number, school_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    updated_at = now();

-- Create some sample classes for the demo school
INSERT INTO classes (
    id,
    name,
    school_id
) VALUES 
(
    '77777777-7777-7777-7777-777777777777',
    'Grade 7A',
    '22222222-2222-2222-2222-222222222222'
),
(
    '88888888-8888-8888-8888-888888888888',
    'Grade 8B',
    '22222222-2222-2222-2222-222222222222'
),
(
    '99999999-9999-9999-9999-999999999999',
    'Grade 9C',
    '22222222-2222-2222-2222-222222222222'
)
ON CONFLICT (name, school_id) DO UPDATE SET
    updated_at = now();