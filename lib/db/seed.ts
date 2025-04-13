import { eq } from 'drizzle-orm';
import { getStripeProducts } from '../payments/stripe';
import { db } from './drizzle';
import { possibleModuleCombinations } from './sample-data';
import {
  modules,
  lessons,
  type NewModule,
  type NewModuleLesson,
} from './schema';

async function seed() {
  const products = await getStripeProducts();
  for (const [i, product] of products.entries()) {
    const newModules: NewModule[] = possibleModuleCombinations[i].map(
      ({ name, description, isExtraContent, order }) => ({
        productId: product.id,
        name,
        description,
        isExtraContent,
        order,
      })
    );
    await db.insert(modules).values(newModules);
    const productModules = await db
      .select()
      .from(modules)
      .where(eq(modules.productId, product.id));
    for (const module_ of productModules) {
      const possibleModuleForCreatedModule = possibleModuleCombinations[i].find(
        (m) => m.order === module_.order
      );
      if (!possibleModuleForCreatedModule) {
        throw new Error(
          `Module with order ${module_.order} not found in possibleModuleCombinations.`
        );
      }
      const newLessons: NewModuleLesson[] =
        possibleModuleForCreatedModule.lessons.map(
          ({ name, content, contentType, order }) => ({
            moduleId: module_.id,
            name,
            content,
            contentType,
            order,
          })
        );
      await db.insert(lessons).values(newLessons);
    }
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
