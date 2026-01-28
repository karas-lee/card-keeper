-- Add tsvector column for full-text search
ALTER TABLE "BusinessCard" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS "BusinessCard_searchVector_idx" ON "BusinessCard" USING GIN ("searchVector");

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_card_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.company, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."jobTitle", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.address, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.memo, '')), 'D') ||
    setweight(to_tsvector('simple', COALESCE(NEW."ocrRawText", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
DROP TRIGGER IF EXISTS card_search_vector_update ON "BusinessCard";
CREATE TRIGGER card_search_vector_update
  BEFORE INSERT OR UPDATE ON "BusinessCard"
  FOR EACH ROW
  EXECUTE FUNCTION update_card_search_vector();

-- Backfill existing records
UPDATE "BusinessCard" SET "searchVector" =
  setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(company, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE("jobTitle", '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(address, '')), 'C') ||
  setweight(to_tsvector('simple', COALESCE(memo, '')), 'D') ||
  setweight(to_tsvector('simple', COALESCE("ocrRawText", '')), 'D');
