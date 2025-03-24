-- Create junction table for t-shirts and collections
CREATE TABLE t_shirt_collections (
    t_shirt_id BIGINT REFERENCES t_shirts(id) ON DELETE CASCADE,
    collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (t_shirt_id, collection_id)
);

-- Create index for performance
CREATE INDEX t_shirt_collections_t_shirt_id_idx ON t_shirt_collections(t_shirt_id);
CREATE INDEX t_shirt_collections_collection_id_idx ON t_shirt_collections(collection_id);

-- Enable RLS
ALTER TABLE t_shirt_collections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own t-shirt collections"
    ON t_shirt_collections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM t_shirts
            WHERE t_shirts.id = t_shirt_collections.t_shirt_id
            AND t_shirts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own t-shirt collections"
    ON t_shirt_collections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM t_shirts
            WHERE t_shirts.id = t_shirt_collections.t_shirt_id
            AND t_shirts.user_id = auth.uid()
        )
    );

-- Migrate existing data
INSERT INTO t_shirt_collections (t_shirt_id, collection_id)
SELECT id, collection_id
FROM t_shirts
WHERE collection_id IS NOT NULL;

-- Remove old column
ALTER TABLE t_shirts DROP COLUMN collection_id; 