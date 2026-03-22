import { NextResponse } from 'next/server';
import { readState } from '@/lib/server/db';

const knownUsers = ['alice', 'bob', 'charlie', 'diana', 'eve'];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const s = await readState();
  return NextResponse.json({
    users: knownUsers.filter((u) => u.includes(q)),
    posts: s.posts.filter((p) => p.text.toLowerCase().includes(q)),
    messages: s.messages.filter((m) => m.text.toLowerCase().includes(q))
  });
}
