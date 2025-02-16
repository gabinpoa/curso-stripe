import { getStripeProducts } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers, modules, lessons } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  const products = await getStripeProducts();
  for (const product of products) {
    const descriptions = [
      'Este módulo ensina a fazer algo muito legal e é a introdução ao curso.',
      'Este módulo aprofunda os conhecimentos adquiridos no módulo anterior.',
      'Este módulo oferece conteúdo extra para enriquecer seu aprendizado.',
    ];

    const productModules = await db
      .insert(modules)
      .values([
        {
          name: 'Modulo ' + 1,
          description: descriptions[0],
          order: 1,
          productId: product.id,
        },
        {
          name: 'Modulo ' + 2,
          description: descriptions[1],
          order: 2,
          productId: product.id,
        },
        {
          name: 'Modulo ' + 3,
          description: descriptions[2],
          order: 3,
          productId: product.id,
          isExtraContent: true,
        },
      ])
      .returning();

    for (const module of productModules) {
      await db.insert(lessons).values([
        {
          name: `Lesson 1 of ${module.name}`,
          content: `      
---
title: Example Title
description: This is an example .mdx file
image: /images/example.jpg
date: "2023-10-20"
authors:
  - John Doe
---


Hello World!

For more information see [pwn.guide](https://pwn.guide).

---

## Example

These are the foods I like:

- **PIZZA**

- Kebab

- Hamburger

I love to code. Here is an example JavaScript code:

\`\`\`js
console.log("Example")
\`\`\``,
          contentType: 'MDX',
          order: 1,
          moduleId: module.id,
        },
        {
          name: `Lesson 2 of ${module.name}`,
          content:
            'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
          contentType: 'VIDEO',
          order: 2,
          moduleId: module.id,
        },
      ]);
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
