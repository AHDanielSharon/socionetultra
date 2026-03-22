import { NextResponse } from 'next/server';
import { mutateState } from '@/lib/server/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const next = await mutateState((s) => ({
    ...s,
    messages: s.messages.map((m) => {
      if (m.id !== params.id) return m;
      if (body.action === 'edit') return { ...m, text: String(body.text || m.text), editedAt: new Date().toISOString() };
      if (body.action === 'reaction') return { ...m, reaction: String(body.reaction || '🔥') };
      if (body.action === 'disappear') return { ...m, disappearsAt: new Date(Date.now() + 60_000).toISOString() };
      return m;
    })
  }));
  return NextResponse.json(next.messages.find((m) => m.id === params.id) ?? null);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const next = await mutateState((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== params.id) }));
  return NextResponse.json({ ok: true, count: next.messages.length });
}
