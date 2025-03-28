import { stripe } from '@/lib/payments/stripe';
import { cookiesClient } from '@/utils/amplify-utils';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/#cursos', request.url));
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  const subscription = session.subscription as Stripe.Subscription;
  const product = session.line_items?.data[0]?.price?.product as Stripe.Product;
  const priceUnitAmount = session.line_items?.data[0]?.price
    ?.unit_amount as number;
  const customerId = session.customer as string;
  const image = product.images.length > 0 ? product.images[0] : '';

  await cookiesClient.models.CourseSubscription.create(
    {
      customerId: customerId,
      subscriptionId: subscription.id,
      productName: product.name,
      productId: product.id,
      image: image,
      status: subscription.status,
      priceUnitAmount: priceUnitAmount,
      priceId: session.line_items?.data[0]?.price?.id as string,
    },
    {
      authMode: 'userPool',
    }
  );

  return NextResponse.redirect(new URL('/meus-cursos', request.url));
}
