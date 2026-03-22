import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = String(body.prompt || '').trim();
  const plan = [
    'AI Assistant Plan',
    '1. Post a short update + story in same hour.',
    '2. Use close-friends visibility for sensitive updates.',
    '3. Start a channel and schedule a live event.',
    `Context handled: ${prompt || 'general strategy'}`
  ].join('\n');
  return NextResponse.json({ output: plan });
}
