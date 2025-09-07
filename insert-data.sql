-- Create colleges table and insert data
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR REPLACE INTO colleges (id, name, location) VALUES 
('c1', 'REVA University', 'Bangalore'),
('c2', 'BNMIT', 'Bangalore');

-- Verify the data
SELECT * FROM colleges;
