export const storeCategoriesTable = `
CREATE TABLE IF NOT EXISTS store_categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  icon_url VARCHAR,
  icon_name VARCHAR,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;