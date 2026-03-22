import { NextResponse } from 'next/server';
import { mutateState, readState } from '@/lib/server/db';

const id = () => Math.random().toString(36).slice(2, 10);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get('chatId');
  const state = await readState();
  const messages = chatId ? state.messages.filter((m) => m.chatId === chatId) : state.messages;
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const body = await req.json();
  const next = await mutateState((s) => {
    if (!s.identity) return s;
    const msg = {
      id: id(),
      chatId: String(body.chatId),
      by: s.identity.activeProfileId,
      text: String(body.text || ''),
      createdAt: new Date().toISOString(),
      scheduledFor: body.scheduledFor || undefined
    };
    return { ...s, messages: [...s.messages, msg] };
  });
  return NextResponse.json(next.messages[next.messages.length - 1] ?? null);
}
