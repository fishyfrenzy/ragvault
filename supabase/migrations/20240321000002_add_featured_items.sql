-- Add featured items columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS featured_shirts integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS featured_collections integer[] DEFAULT '{}';

-- Add RLS policies for featured items
CREATE POLICY "Users can view their own featured items"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own featured items"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id); 