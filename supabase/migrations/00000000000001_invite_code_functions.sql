-- Drop existing table and functions if they exist
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.check_invite_code CASCADE;
DROP FUNCTION IF EXISTS public.use_invite_code CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    invite_code TEXT UNIQUE,
    used_invite_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to check if an invite code is valid
CREATE OR REPLACE FUNCTION public.check_invite_code(code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE invite_code = code 
        AND (
            SELECT COUNT(*) FROM profiles WHERE used_invite_code = code
        ) < 3
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use an invite code
CREATE OR REPLACE FUNCTION public.use_invite_code(input_code text, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the code exists and hasn't been used too many times
    IF NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE invite_code = input_code 
        AND (
            SELECT COUNT(*) 
            FROM profiles 
            WHERE used_invite_code = input_code
        ) < 3
    ) THEN
        RETURN false;
    END IF;

    -- Update the user's profile with the used invite code
    UPDATE profiles 
    SET used_invite_code = input_code
    WHERE id = user_id;

    RETURN true;
END;
$$;

-- Function to generate a new invite code for a user
CREATE OR REPLACE FUNCTION public.generate_invite_code(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_code text;
BEGIN
    -- Check if user already has an invite code
    IF EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = user_id 
        AND invite_code IS NOT NULL
    ) THEN
        RETURN NULL;
    END IF;

    -- Generate a unique 6-character code
    LOOP
        new_code := upper(substring(md5(random()::text) from 1 for 6));
        EXIT WHEN NOT EXISTS (
            SELECT 1 
            FROM profiles 
            WHERE invite_code = new_code
        );
    END LOOP;

    -- Update the user's profile with the new invite code
    UPDATE profiles 
    SET invite_code = new_code
    WHERE id = user_id;

    RETURN new_code;
END;
$$; 