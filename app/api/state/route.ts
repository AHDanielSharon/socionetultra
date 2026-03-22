import { NextResponse } from 'next/server';
import { mutateState, readState } from '@/lib/server/db';

export async function GET() {
  const state = await readState();
  return NextResponse.json(state);
}

export async function DELETE() {
  const next = await mutateState(() => ({
    identity: null,
    posts: [],
    stories: [],
    chats: [],
    messages: [],
    follows: {},
    friends: {},
    blocked: [],
    muted: [],
    notif: { push: true, silentMode: false, priorityOnly: false, messages: true, posts: true, calls: true }
  }));
  return NextResponse.json(next);
}
