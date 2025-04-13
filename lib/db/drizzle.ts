import { drizzle } from 'drizzle-orm/mysql2';
import dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const db = drizzle(process.env.DATABASE_URL, {
  schema,
  mode: 'default',
});
