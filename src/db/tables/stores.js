export const storesTable = `
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  store_category_id VARCHAR REFERENCES store_categories(id),
  owner_id VARCHAR REFERENCES users(id),
  address VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  logo VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;