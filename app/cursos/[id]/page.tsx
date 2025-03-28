import CourseContent, { ProductContent } from '@/components/course-content';
import {
  cookiesClient,
  fetchUserAttributesServer,
} from '@/utils/amplify-utils';
import { redirect } from 'next/navigation';
import {
  getFullModules,
  getLessonWithComponent,
  restrictExtraContentFromLesson,
} from '@/lib/queries';
import { canAccessExtraContent } from '@/lib/payments/stripe';
import Stripe from 'stripe';

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;
  const userAttributes = await fetchUserAttributesServer();
  const customerId = userAttributes?.['custom:customer_id'] ?? '';

  const [{ data: subscriptionsData }, modules] = await Promise.all([
    cookiesClient.models.CourseSubscription.listCourseSubscriptionByCustomerIdAndProductId(
      {
        customerId,
        productId: { eq: id },
      },
      {
        authMode: 'userPool',
      }
    ),
    getFullModules(id),
  ]);

  if (subscriptionsData.length === 0) {
    console.error('User does not have a subscription to this course');
    redirect('/meus-cursos');
  }

  let validSubscription = subscriptionsData.find(
    (subscription) =>
      subscription.status === 'active' || subscription.status === 'trialing'
  );

  if (!validSubscription) {
    console.error('User does not have an active or trialing subscription');
    redirect('/meus-cursos');
  }

  const accessToExtraContent = canAccessExtraContent(
    validSubscription.status as Stripe.Subscription.Status,
    validSubscription.createdAt
  );

  let courseContent: ProductContent = {
    name: validSubscription.productName,
    description: validSubscription.productDescription,
    image: validSubscription.image,
    modules: modules.map((module) => ({
      ...module,
      lessons:
        module.isExtraContent && !accessToExtraContent
          ? module.lessons.map((lesson) =>
              getLessonWithComponent(restrictExtraContentFromLesson(lesson))
            )
          : module.lessons.map(getLessonWithComponent),
    })),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CourseContent courseData={courseContent} />
    </div>
  );
}
