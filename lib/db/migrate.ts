import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './drizzle';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from 'dotenv';

config();

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED environment variable is not set');
}

async function main() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: 'lib/db/migrations' });
}

main()
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Migration process finished. Exiting...');
    process.exit(0);
  });
