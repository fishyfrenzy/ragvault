-- Create tables
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    color TEXT,
    icon TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[]
);

CREATE TABLE t_shirts (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    year INTEGER NOT NULL,
    condition TEXT NOT NULL,
    size TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    date_added TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estimated_value DECIMAL(10,2) NOT NULL,
    listing_status TEXT NOT NULL,
    price DECIMAL(10,2),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    collection_id BIGINT REFERENCES collections(id) ON DELETE SET NULL
);

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    instagram TEXT,
    twitter TEXT,
    facebook TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    show_email BOOLEAN DEFAULT false,
    show_location BOOLEAN DEFAULT false,
    show_website BOOLEAN DEFAULT false,
    show_social BOOLEAN DEFAULT false,
    collection_overview_preferences JSONB DEFAULT '{
        "showTotalItems": true,
        "showEstimatedValue": true,
        "showLicensing": true,
        "showTags": true,
        "order": ["totalItems", "estimatedValue", "licensing", "tags"]
    }'::jsonb,
    featured_shirts BIGINT[] DEFAULT '{}'::BIGINT[],
    featured_collections BIGINT[] DEFAULT '{}'::BIGINT[]
);

-- Create indexes
CREATE INDEX t_shirts_user_id_idx ON t_shirts(user_id);
CREATE INDEX t_shirts_collection_id_idx ON t_shirts(collection_id);
CREATE INDEX collections_user_id_idx ON collections(user_id);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE t_shirts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own t-shirts"
    ON t_shirts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own t-shirts"
    ON t_shirts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own t-shirts"
    ON t_shirts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own t-shirts"
    ON t_shirts FOR DELETE
    USING (auth.uid() = user_id); 