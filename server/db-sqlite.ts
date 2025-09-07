import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema";

// Use a fixed SQLite database file for development
const dbPath = './database.sqlite';
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
