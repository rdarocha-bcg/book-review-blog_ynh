-- Book Review Blog API — initial schema (English comments only)

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255) NOT NULL,
  book_title VARCHAR(500) NOT NULL,
  book_author VARCHAR(255) NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  description TEXT,
  content MEDIUMTEXT,
  image_url VARCHAR(2000) NULL,
  published_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_reviews_published (is_published),
  INDEX idx_reviews_genre (genre),
  INDEX idx_reviews_created_by (created_by)
);

CREATE TABLE IF NOT EXISTS user_directory (
  uid VARCHAR(255) PRIMARY KEY,
  email VARCHAR(500) NULL,
  display_name VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
