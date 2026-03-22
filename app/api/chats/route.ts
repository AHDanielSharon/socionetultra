import { NextResponse } from 'next/server';
import { mutateState, readState } from '@/lib/server/db';

const id = () => Math.random().toString(36).slice(2, 10);

export async function GET() {
  const state = await readState();
  return NextResponse.json(state.chats);
}

export async function POST(req: Request) {
  const body = await req.json();
  const next = await mutateState((s) => {
    if (!s.identity) return s;
    const chat = {
      id: id(),
      title: String(body.title || 'Untitled Chat'),
      type: body.type || 'group',
      participants: [s.identity.activeProfileId],
      pinned: false
    };
    return { ...s, chats: [...s.chats, chat] };
  });
  return NextResponse.json(next.chats[next.chats.length - 1] ?? null);
}
