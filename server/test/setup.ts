import { afterEach, vi } from 'vitest';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

// Clean up database after each test
afterEach(async () => {
  // Delete data from each table in the correct order to respect foreign key constraints
  await db.delete(schema.registrations);
  await db.delete(schema.attendance);
  await db.delete(schema.feedback);
  await db.delete(schema.events);
  await db.delete(schema.users);
  await db.delete(schema.colleges);
});

// Set test timeout to 10 seconds
vi.setConfig({
  testTimeout: 10000,
});
