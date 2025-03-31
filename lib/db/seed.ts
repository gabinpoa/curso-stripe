import { getStripeProducts } from '../payments/stripe';
import { db } from './drizzle';
import { possibleModuleCombinations } from './sample-data';
import { modules, lessons } from './schema';
import { NewModule, NewModuleLesson } from './types';

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
    const productModules = await db
      .insert(modules)
      .values(newModules)
      .returning();

    for (const [j, module] of productModules.entries()) {
      const newLessons: NewModuleLesson[] = possibleModuleCombinations[i][
        j
      ].lessons.map(({ name, content, contentType, order }) => ({
        moduleId: module.id,
        name,
        content,
        contentType,
        order,
      }));
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
