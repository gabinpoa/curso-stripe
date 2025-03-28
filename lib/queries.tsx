import { cookiesClient } from '@/utils/amplify-utils';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { JSX } from 'react';
import { components } from './mdxUtil';

export async function getFullModules(courseId: string) {
  const { data: modules } =
    await cookiesClient.models.Module.listModuleByCourseId(
      {
        courseId: courseId,
      },
      {
        selectionSet: [
          'name',
          'order',
          'description',
          'isExtraContent',
          'lessons.name',
          'lessons.order',
          'lessons.content.content',
          'lessons.content.contentType',
        ],
      }
    );
  return modules;
}

export async function getPreviewModules(courseId: string) {
  const { data: modules } =
    await cookiesClient.models.Module.listModuleByCourseId(
      {
        courseId: courseId,
      },
      {
        selectionSet: [
          'courseId',
          'name',
          'isExtraContent',
          'order',
          'lessons.name',
          'lessons.order',
        ],
      }
    );
  return modules;
}

export async function getCoursePreview(courseId: string) {
  const { data: course } = await cookiesClient.models.Course.get(
    {
      productId: courseId,
    },
    {
      selectionSet: [
        'name',
        'description',
        'image',
        'priceUnitAmount',
        'priceId',
        'modules.name',
        'modules.order',
        'modules.isExtraContent',
        'modules.lessons.name',
        'modules.lessons.order',
      ],
      authMode: 'apiKey',
    }
  );

  return course;
}

type Lesson = {
  name: string;
  order: number;
  content: {
    contentType: 'MDX' | 'VIDEO' | null;
    content: string;
  };
  mdxComponent?: JSX.Element;
};

export function getLessonMdxComponent(content: string) {
  return <MDXRemote source={content} components={components} />;
}

export function getLessonWithComponent(lesson: Lesson) {
  if (lesson.content.contentType === 'MDX') {
    return {
      ...lesson,
      mdxComponent: getLessonMdxComponent(lesson.content.content),
    };
  }
  return lesson;
}

export function restrictExtraContentFromModules(modules: any[]) {
  return modules
    .filter((module) => module.isExtraContent)
    .map((module) => {
      return {
        ...module,
        lessons: module.lessons.map(restrictExtraContentFromLesson),
      };
    });
}

export function restrictExtraContentFromLesson(lesson: any) {
  lesson.content.content =
    '# Esse conteúdo fica disponível 7 dias após a compra';
  lesson.content.contentType = 'MDX';
  return lesson;
}

export async function getSubscriptionData(
  subscriptionId: string,
  customerId: string
) {
  const subscription = (
    await cookiesClient.models.CourseSubscription.get(
      {
        subscriptionId,
      },
      { authMode: 'userPool' }
    )
  ).data;

  if (!subscription) {
    return { message: 'Subscription not found by subscriptionId' };
  } else if (subscription.customerId !== customerId) {
    return { message: 'Subscription customerId does not match' };
  }

  return subscription;
}

export async function getCustomerSubscriptionsData(customerId: string) {
  const { data: subscriptions } =
    await cookiesClient.models.CourseSubscription.listCourseSubscriptionByCustomerIdAndProductId(
      {
        customerId,
      },
      {
        authMode: 'userPool',
      }
    );

  return subscriptions;
}

export async function getCustomerValidSubscriptionsProductIds(
  customerId: string
) {
  const { data } =
    await cookiesClient.models.CourseSubscription.listCourseSubscriptionByCustomerIdAndStatus(
      {
        customerId,
        status: {
          between: ['active', 'trialing'],
        },
      },
      {
        selectionSet: ['productId'],
        authMode: 'userPool',
      }
    );
  return data.map((subscription) => subscription.productId);
}
