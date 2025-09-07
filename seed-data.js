const Database = require('better-sqlite3');

const db = new Database('./database.sqlite');

try {
  // Create the colleges table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS colleges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      location TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Insert the college data
  const insert = db.prepare(`
    INSERT OR REPLACE INTO colleges (id, name, location, created_at) 
    VALUES (?, ?, ?, unixepoch())
  `);

  insert.run('c1', 'REVA University', 'Bangalore');
  insert.run('c2', 'BNMIT', 'Bangalore');

  console.log('✅ Successfully inserted college data');
  
  // Verify the data
  const colleges = db.prepare('SELECT * FROM colleges').all();
  console.log('Colleges in database:');
  colleges.forEach(college => {
    console.log(`- ${college.name} (ID: ${college.id})`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  db.close();
}
