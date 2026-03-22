import { NextResponse } from 'next/server';
import { mutateState, readState } from '@/lib/server/db';

const id = () => Math.random().toString(36).slice(2, 10);

export async function GET() {
  const state = await readState();
  return NextResponse.json(state.posts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const next = await mutateState((s) => {
    if (!s.identity) return s;
    const post = {
      id: id(),
      authorProfileId: s.identity.activeProfileId,
      text: String(body.text || ''),
      visibility: body.visibility || 'public',
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    return { ...s, posts: [post, ...s.posts] };
  });
  return NextResponse.json(next.posts[0] ?? null);
}
