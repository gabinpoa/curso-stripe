import { setSession } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/token';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const courseId = searchParams.get('courseId');

    const redirectUrl = courseId ? `/cursos/${courseId}` : '/';

    if (!token) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    try {
        const sessionData = await verifyToken(token);
        if (
            !sessionData?.user?.customerId ||
            typeof sessionData.user.customerId !== 'string' ||
            new Date(sessionData.expires) < new Date()
        ) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        const user = await db
            .select()
            .from(users)
            .where(and(eq(users.customerId, sessionData.user.customerId)))
            .limit(1);

        if (user.length === 0 || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await setSession(user[0].customerId);

        redirect(redirectUrl);
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}