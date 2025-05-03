import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from './lib/auth/token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const unprotectedPaths = ['/sign-in', '/sign-up', '/auth/link-magico'];
  const isProtectedPath = !unprotectedPaths.some((path) => pathname.startsWith(path));

  if (!sessionCookie && isProtectedPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const res = NextResponse.next();

  if (sessionCookie) {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneMonth.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneMonth,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
