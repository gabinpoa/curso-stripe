import { db } from './drizzle';
import { lessons, modules } from './schema';

async function deleteAll() {
  await db.delete(lessons);
  await db.delete(modules);

  console.log('All modules and lessons have been deleted successfully.');
}

deleteAll()
  .catch((error) => {
    console.error('Delete process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Delete process finished. Exiting...');
    process.exit(0);
  });

// This script deletes all modules and lessons from the database.
//
// ## Usage
//  Run the script using the following command:
//  ```sh
//  pnpx tsx lib/db/delete-all.ts
//  ```
