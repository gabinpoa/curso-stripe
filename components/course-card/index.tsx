import Stripe from 'stripe';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import CourseCardButtons from './buttons';

interface Props {
  product: Stripe.Product;
  isSubscribed: boolean;
}
export default function CourseCard({ product, isSubscribed }: Props) {
  if (!product.default_price || typeof product.default_price !== 'object') {
    throw new Error('Product default price is missing or invalid');
  }

  const formattedPrice = (product.default_price.unit_amount! / 100).toFixed(2);

  return (
    <Card className="flex flex-col justify-between" key={product.id}>
      <CardHeader className="justify-center overflow-hidden items-center">
        <img
          src={product.images[0] || '/static/placeholder.png'}
          alt={product.name}
          className="rounded-md"
        />
      </CardHeader>
      <CardContent>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="mt-2">
          {product.description}
        </CardDescription>
        <p className="font-bold mt-2">R$ {formattedPrice}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <CourseCardButtons
          productId={product.id}
          priceId={product.default_price.id}
          isSubscribed={isSubscribed}
        />
      </CardFooter>
    </Card>
  );
}
