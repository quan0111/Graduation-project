CREATE EXTENSION IF NOT EXISTS vector;

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
);

CREATE INDEX IF NOT EXISTS "ProductEmbedding_productId_idx"
    ON "ProductEmbedding"("productId");

CREATE INDEX IF NOT EXISTS "ProductEmbedding_embedding_idx"
    ON "ProductEmbedding"
    USING ivfflat ("embedding" vector_cosine_ops)
    WITH (lists = 100);
