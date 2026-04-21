-- Add featured column to reviews (academics already has it from 001_init.sql)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE reviews ADD INDEX IF NOT EXISTS idx_reviews_featured (featured);
