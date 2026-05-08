import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth/server';

export async function GET() {
  const me = await currentUser();
  if (!me) {
    return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  }
  return NextResponse.json(me);
}
