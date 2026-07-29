import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
import { db } from '@/lib/db';
import { pushSubscriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, p256dh, auth: authKey } = body;

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json(
      { error: 'Missing subscription data' },
      { status: 400 }
    );
  }

  const existing = await db.query.pushSubscriptions.findFirst({
    where: and(
      eq(pushSubscriptions.userId, session.user.id!),
      eq(pushSubscriptions.endpoint, endpoint)
    ),
  });

  if (existing) {
    return NextResponse.json({ success: true, message: 'Already subscribed' });
  }

  await db.insert(pushSubscriptions).values({
    userId: session.user.id!,
    endpoint,
    p256dh,
    auth: authKey,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Missing endpoint' },
      { status: 400 }
    );
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, session.user.id!),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  return NextResponse.json({ success: true });
}
