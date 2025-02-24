import Stripe from 'stripe';
import CourseCard from './course-card';

interface Props {
  productsWithPrices: Stripe.Product[];
  userSubscriptionsProductsIds: string[] | null;
}

function FeaturedCourses({
  productsWithPrices,
  userSubscriptionsProductsIds,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {productsWithPrices.map((product) => {
        const isSubscribed = userSubscriptionsProductsIds?.includes(product.id);
        return (
          <CourseCard
            key={product.id}
            product={product}
            isSubscribed={!!isSubscribed}
          />
        );
      })}
    </div>
  );
}

export default FeaturedCourses;
