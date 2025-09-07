import { db } from './server/db-sqlite';
import { colleges } from './shared/schema';

async function seedColleges() {
  try {
    console.log('Inserting college data...');
    
    // Insert REVA University
    await db.insert(colleges).values({
      id: 'c1',
      name: 'REVA University',
      location: 'Bangalore'
    }).onConflictDoNothing();

    // Insert BNMIT
    await db.insert(colleges).values({
      id: 'c2', 
      name: 'BNMIT',
      location: 'Bangalore'
    }).onConflictDoNothing();

    console.log('✅ Successfully inserted college data');
    
    // Verify the data
    const allColleges = await db.select().from(colleges);
    console.log('Current colleges in database:');
    allColleges.forEach(college => {
      console.log(`- ${college.name} (ID: ${college.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error inserting college data:', error);
  }
}

seedColleges();
