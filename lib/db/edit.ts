import { eq, lt } from 'drizzle-orm';
import { db } from './drizzle';
import { lessons, modules } from './schema';

async function editDb() {
  await db.delete(lessons).where(lt(lessons.moduleId, 7));
  await db.delete(modules).where(lt(modules.id, 7));
}
editDb()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Edit process finished');
    process.exit(0);
  });
