import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { runWithAmplifyServerContext } from './utils/amplify-utils';
import { fetchAuthSession } from 'aws-amplify/auth/server';

const protectedRoutes = ['/dashboard', '/cursos', '/meus-cursos'];
const exceptionRoute = '/visao-geral';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) && !pathname.endsWith(exceptionRoute)
  );

  const response = NextResponse.next();

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, {});
        return session.tokens !== undefined;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  if (authenticated || !isProtectedRoute) {
    return response;
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
