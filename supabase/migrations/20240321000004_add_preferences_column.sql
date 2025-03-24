-- Add collection_overview_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS collection_overview_preferences jsonb DEFAULT '{
  "showTotalItems": true,
  "showEstimatedValue": true,
  "showLicensing": true,
  "showTags": true,
  "order": ["totalItems", "estimatedValue", "licensing", "tags"]
}'::jsonb; 