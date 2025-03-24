-- Add RLS policy for collection overview preferences
CREATE POLICY "Users can update their own collection overview preferences"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id); 