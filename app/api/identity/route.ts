import { NextResponse } from 'next/server';
import { createIdentity, mutateState, seedWelcomeChat } from '@/lib/server/db';

export async function POST() {
  const identity = createIdentity();
  const { chat, message } = seedWelcomeChat(identity);
  const next = await mutateState((s) => ({ ...s, identity, chats: [chat], messages: [message], posts: [], stories: [] }));
  return NextResponse.json(next);
}
