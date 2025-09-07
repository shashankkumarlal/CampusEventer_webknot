import Database from 'better-sqlite3';

// Open the SQLite database
const db = new Database('./database.sqlite');

try {
  // Create colleges table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Insert the college data
  const insertCollege = db.prepare(`
    INSERT OR REPLACE INTO colleges (id, name, location, created_at) 
    VALUES (?, ?, ?, ?)
  `);

  const currentTime = Math.floor(Date.now() / 1000);

  insertCollege.run('c1', 'REVA University', 'Bangalore', currentTime);
  insertCollege.run('c2', 'BNMIT', 'Bangalore', currentTime);

  console.log('✅ Successfully inserted college data:');
  
  // Verify the data was inserted
  const colleges = db.prepare('SELECT * FROM colleges').all();
  colleges.forEach(college => {
    console.log(`- ${college.name} (ID: ${college.id})`);
  });

} catch (error) {
  console.error('❌ Error inserting college data:', error);
} finally {
  db.close();
}
