import { getExpandedProductsWithPrices, stripe } from '@/lib/payments/stripe';
import { cookiesClient } from '@/utils/amplify-utils';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const { body, statusCode } = await seed();

  if (statusCode !== 200) {
    console.error('Failed to seed data:', body);
    return new NextResponse('Failed to seed data', { status: statusCode });
  }

  return new NextResponse('Data seeded successfully', { status: statusCode });
}

async function seed() {
  const products = await getExpandedProductsWithPrices();

  const promises = products.map(async (product) => {
    if (product.default_price && typeof product.default_price === 'object') {
      await createCourse({
        image: product.images[0] || null,
        description: product.description || null,
        instructor: product.metadata.instructor || null,
        priceUnitAmount: product.default_price.unit_amount || 0,
        priceId: product.default_price.id,
        productId: product.id,
        name: product.name,
      });
    } else {
      console.error('Product has no default price:', product);
    }
    const modulesResponses = await Promise.all(createModules(product.id));
    let lessonsPromises = [];
    for (const { data: module } of modulesResponses) {
      if (module) {
        lessonsPromises.push(createLessons(module.id));
      }
    }
    await Promise.all(lessonsPromises);
  });
  try {
    await Promise.all(promises);
    return {
      statusCode: 200,
      body: 'Data seeded successfully',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
}

function createCourse(product: {
  image?: string | null;
  description?: string | null;
  instructor?: string | null;
  priceUnitAmount: number;
  priceId: string;
  productId: string;
  name: string;
}) {
  return cookiesClient.models.Course.create(product, {
    authMode: 'apiKey',
  });
}

function createModules(courseId: string) {
  const modulesData = [
    {
      courseId,
      name: 'Getting Started',
      description: 'Learn the basics of the course',
    },
    {
      courseId,
      name: 'Intermediate',
      description: 'Take your skills to the next level',
    },
    {
      courseId,
      name: 'Extra Content',
      description: 'Additional resources and content',
      isExtraContent: true,
    },
    {
      courseId,
      name: 'Advanced',
      description: 'Master the course',
    },
  ];
  return modulesData.map((module, index) =>
    cookiesClient.models.Module.create(
      { ...module, order: index + 1 },
      { authMode: 'apiKey' }
    )
  );
}

function createLessons(moduleId: string) {
  const lessonsData = [
    {
      moduleId,
      name: 'Deep Dive',
      description: 'Take your skills to the next level',
      contentType: 'VIDEO' as 'VIDEO',
      content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      moduleId,
      name: 'Markdown Basics',
      description: 'Learn how to use Markdown',
      contentType: 'MDX' as 'MDX',
      content:
        '## Markdown Basics\n\n### Headers\n\n# H1\n## H2\n### H3\n\n### Lists\n\n- Item 1\n- Item 2\n- Item 3\n\n### Code\n\n```\nconsole.log("Hello, world!");\n```\n\n### Links\n\n[GitHub](https://github.com)\n\n### Images\n\n![Alt text](https://via.placeholder.com/150)',
    },
    {
      moduleId,
      name: 'Advanced Markdown',
      description: 'Advanced Markdown features',
      contentType: 'MDX' as 'MDX',
      content:
        '## Advanced Markdown\n\n### Tables\n\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |\n\n### Blockquotes\n\n> This is a blockquote.\n\n### Inline code\n\nUse `code` in your text.',
    },
  ];
  return lessonsData.map(async (lesson, index) => {
    const { data: createdLesson } = await cookiesClient.models.Lesson.create(
      {
        moduleId: lesson.moduleId,
        name: lesson.name,
        description: lesson.description,
        order: index + 1,
      },
      {
        authMode: 'apiKey',
      }
    );

    if (!createdLesson) {
      return;
    }

    return createLessonContent({
      lessonId: createdLesson.id,
      contentType: lesson.contentType,
      content: lesson.content,
    });
  });
}

function createLessonContent(lessonContent: {
  lessonId: string;
  contentType: 'MDX' | 'VIDEO';
  content: string;
}) {
  return cookiesClient.models.LessonContent.create(lessonContent, {
    authMode: 'apiKey',
  });
}
