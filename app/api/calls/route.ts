import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const id = crypto.randomUUID();
  return NextResponse.json({
    callId: id,
    mode: body.mode || 'video',
    joinUrl: `/socionet?call=${id}`,
    startedAt: new Date().toISOString()
  });
}
