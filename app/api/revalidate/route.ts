import { type NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret');

  if (secret !== process.env['SANITY_REVALIDATE_SECRET']) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { _type?: string };
    const type = body._type;

    if (type) {
      revalidateTag(type, { expire: 0 });
    } else {
      revalidateTag('sanity', { expire: 0 });
    }

    return NextResponse.json({ revalidated: true, type });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
