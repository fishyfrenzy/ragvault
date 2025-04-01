-- First, rename the column from brand to licensing
ALTER TABLE t_shirts RENAME COLUMN brand TO licensing;

-- Then, create a temporary column to store the array values
ALTER TABLE t_shirts ADD COLUMN licensing_array TEXT[] DEFAULT '{}'::TEXT[];

-- Update the temporary column, converting the existing string values to arrays
-- This will split the string on commas and trim whitespace
UPDATE t_shirts 
SET licensing_array = ARRAY[licensing]
WHERE licensing IS NOT NULL;

-- Drop the old column
ALTER TABLE t_shirts DROP COLUMN licensing;

-- Rename the new array column to licensing
ALTER TABLE t_shirts RENAME COLUMN licensing_array TO licensing;

-- Add NOT NULL constraint back
ALTER TABLE t_shirts ALTER COLUMN licensing SET NOT NULL; 