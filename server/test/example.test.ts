import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { colleges } from '../../shared/schema';

describe('Database', () => {
  beforeAll(async () => {
    // Ensure the database is clean before tests
    await db.delete(colleges);
  });

  it('should be able to create a college', async () => {
    const newCollege = {
      name: 'Test College',
      location: 'Test Location',
    };

    const [inserted] = await db.insert(colleges).values(newCollege).returning();
    
    expect(inserted).toMatchObject({
      name: 'Test College',
      location: 'Test Location',
    });
    expect(inserted.id).toBeDefined();
    expect(inserted.createdAt).toBeDefined();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete(colleges);
  });
});
