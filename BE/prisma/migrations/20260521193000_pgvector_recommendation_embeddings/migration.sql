DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_available_extensions
        WHERE name = 'vector'
    ) THEN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS vector';

        EXECUTE '
            CREATE TABLE IF NOT EXISTS "ProductEmbedding" (
                "id" SERIAL PRIMARY KEY,
                "productId" INTEGER NOT NULL UNIQUE,
                "content" TEXT NOT NULL,
                "embedding" vector(384) NOT NULL,
                "metadata" JSONB,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "ProductEmbedding_productId_fkey"
                    FOREIGN KEY ("productId") REFERENCES "Product"("id")
                    ON DELETE CASCADE ON UPDATE CASCADE
            )
        ';

        EXECUTE '
            CREATE INDEX IF NOT EXISTS "ProductEmbedding_productId_idx"
                ON "ProductEmbedding"("productId")
        ';

        EXECUTE '
            CREATE INDEX IF NOT EXISTS "ProductEmbedding_embedding_idx"
                ON "ProductEmbedding"
                USING ivfflat ("embedding" vector_cosine_ops)
                WITH (lists = 100)
        ';
    ELSE
        RAISE NOTICE 'pgvector extension is not installed on this PostgreSQL server; skipping ProductEmbedding table.';
    END IF;
END $$;
