'use server';

import { db } from '@/lib/db/drizzle'; // Import your Drizzle database instance
import { products, modules, lessons, ContentType } from '@/lib/db/schema'; // Import your Drizzle schema
import { eq } from 'drizzle-orm'; // Import Drizzle query helpers
import { getUser } from '@/lib/db/queries';
import { nanoid } from 'nanoid';
import { unauthorized } from 'next/navigation';

export async function fetchStripeProduct(productId: string) {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    unauthorized();
  }

  try {
    if (!product.default_price || typeof product.default_price !== 'string') {
      throw new Error('Invalid default price');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description || null,
      defaultPriceId: product.default_price,
      thumbnail: product.images[0] || '',
      active: product.active,
    };
  } catch (error) {
    console.error('Error fetching Stripe product:', error);
    throw new Error('Failed to fetch product from Stripe');
  }
}

type ModuleInput = {
  name: string;
  description: string;
  order: number;
  isExtraContent: boolean;
  contentType: ContentType;
  collectionId: string;
  lessons: LessonInput[];
};

type LessonInput = {
  name: string;
  description: string;
  contentType: ContentType;
  content: string;
  order: number;
};

export async function createCourse(data: {
  productId: string;
  libraryId: string;
  modules: ModuleInput[];
}) {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    unauthorized();
  }

  const { productId, libraryId, modules: modulesData } = data;

  try {
    // Check if product already exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existingProduct.length > 0) {
      throw new Error('Product already exists in the database');
    }

    // Fetch product from Stripe
    const stripeProduct = await stripe.products.retrieve(productId);

    if (
      !stripeProduct.default_price ||
      typeof stripeProduct.default_price !== 'string'
    ) {
      throw new Error('Invalid default price');
    }

    // Insert product
    const moduleQueryResult = await db.insert(products).values({
      id: productId,
      name: stripeProduct.name,
      description: stripeProduct.description || null,
      defaultPriceId: stripeProduct.default_price,
      thumbnail: stripeProduct.images[0] || '',
    });

    if (moduleQueryResult[0].affectedRows === 0) {
      throw new Error('Failed to insert product into the database');
    }

    // Process each module
    for (const [moduleIndex, moduleData] of modulesData.entries()) {
      const moduleId = nanoid();
      // Insert module
      const moduleQueryResult = await db.insert(modules).values({
        productId: productId,
        name: moduleData.name,
        description: moduleData.description || null,
        order: moduleIndex + 1,
        isExtraContent: moduleData.isExtraContent,
        id: moduleId,
      });

      if (moduleQueryResult[0].affectedRows === 0) {
        throw new Error('Failed to insert module into the database');
      }

      // Process based on content type
      if (moduleData.contentType === ContentType.VIDEO) {
        // For BunnyNet videos, fetch the collection and create lessons
        if (moduleData.collectionId && libraryId) {
          await processBunnyNetCollection(
            moduleId,
            libraryId,
            moduleData.collectionId
          );
        }
      } else if (moduleData.contentType === ContentType.MDX) {
        // For MDX content, create lessons directly from input
        for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
          await db.insert(lessons).values({
            moduleId: moduleId,
            name: lessonData.name,
            description: lessonData.description || null,
            contentType: ContentType.MDX,
            content: lessonData.content,
            order: lessonIndex + 1,
            id: nanoid(),
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating course:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create course'
    );
  }
}

async function processBunnyNetCollection(
  moduleId: string,
  libraryId: string,
  collectionId: string
) {
  try {
    if (!process.env.BUNNY_ACCESS_KEY) {
      throw new Error('BunnyNet access key is not set');
    }
    // Fetch videos from BunnyNet collection
    const videosResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&collection=${collectionId}&orderBy=date`,
      {
        headers: {
          Accept: 'application/json',
          AccessKey: process.env.BUNNY_ACCESS_KEY,
        },
      }
    );

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos from BunnyNet');
    }

    const videosData = await videosResponse.json();

    // Create lessons from videos
    for (const [index, video] of videosData.items.entries()) {
      await db.insert(lessons).values({
        moduleId: moduleId,
        name: video.title.split('.mp4')[0],
        description: video.description || null,
        contentType: ContentType.VIDEO,
        content: `https://iframe.mediadelivery.net/embed/${video.videoLibraryId}/${video.guid}`,
        order: index + 1,
        id: nanoid(),
      });
    }
  } catch (error) {
    console.error('Error processing BunnyNet collection:', error);
    throw new Error('Failed to process BunnyNet videos');
  }
}
