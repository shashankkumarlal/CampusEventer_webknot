import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

try {
  // Create all tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      college_id TEXT
    );

    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT,
      date INTEGER NOT NULL,
      location TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      registration_deadline INTEGER,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
      image_url TEXT,
      tags TEXT,
      requirements TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      created_by TEXT NOT NULL,
      college_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      event_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      registered_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      event_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      checkin_method TEXT NOT NULL DEFAULT 'manual' CHECK (checkin_method IN ('manual', 'qr', 'self')),
      checked_in_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      event_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Insert college data
  const insertCollege = db.prepare(`
    INSERT OR REPLACE INTO colleges (id, name, location, created_at) 
    VALUES (?, ?, ?, unixepoch())
  `);

  insertCollege.run('c1', 'REVA University', 'Bangalore');
  insertCollege.run('c2', 'BNMIT', 'Bangalore');

  console.log('✅ Database tables created successfully');
  console.log('✅ College data inserted');
  
  // Verify tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables created:', tables.map(t => t.name).join(', '));

} catch (error) {
  console.error('❌ Error creating tables:', error.message);
} finally {
  db.close();
}
