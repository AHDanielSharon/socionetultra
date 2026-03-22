import { NextResponse } from 'next/server';
import { mutateState } from '@/lib/server/db';

const uid = () => Math.random().toString(36).slice(2, 10);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const next = await mutateState((s) => {
    if (!s.identity) return s;
    return {
      ...s,
      posts: s.posts.map((p) => {
        if (p.id !== params.id) return p;
        if (body.action === 'like') {
          const has = p.likes.includes(s.identity!.activeProfileId);
          return { ...p, likes: has ? p.likes.filter((x) => x !== s.identity!.activeProfileId) : [...p.likes, s.identity!.activeProfileId] };
        }
        if (body.action === 'comment') {
          return { ...p, comments: [...p.comments, { id: uid(), by: s.identity!.activeProfileId, text: String(body.text || '') }] };
        }
        if (body.action === 'edit') {
          return { ...p, text: String(body.text || p.text), updatedAt: new Date().toISOString() };
        }
        return p;
      })
    };
  });
  return NextResponse.json(next.posts.find((p) => p.id === params.id) ?? null);
}
