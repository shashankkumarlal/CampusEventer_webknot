import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema";

// Use a fixed SQLite database file
const sqlite = new Database('./database.sqlite');
export const db = drizzle(sqlite, { schema });