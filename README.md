# SOCIONET — Real Working Super App (Single Render Deploy)

This project now runs as a **real full-stack Next.js app** (UI + API routes + server state), deployable on Render in one deploy.

## What works now
- Cryptographic-style internet identity creation (`/api/identity`).
- Stateful backend data store using server-side JSON DB (`lib/server/db.ts`) and REST APIs.
- Social feed with create/edit/like/comment (`/api/posts`, `/api/posts/[id]`).
- Messaging with create/edit/reaction/disappear/delete (`/api/messages`, `/api/messages/[id]`).
- Communities/chats (`/api/chats`).
- AI assistant endpoint (`/api/ai`).
- Search endpoint across users/posts/messages (`/api/search`).
- Call session creation endpoint (`/api/calls`).
- Installable PWA metadata.

## Run locally
```bash
npm ci
npm run dev
```

## Render one-deploy setup
1. Push this repository.
2. In Render, create a **Blueprint** deploy.
3. Render reads `render.yaml`.
4. Build: `npm ci && npm run build`
5. Start: `npm run start`

## Notes
- This implementation is a serious working foundation.
- For true global internet scale (WebRTC SFU clusters, audited E2EE key mgmt, blockchain finality, compliance infra), the next step is splitting into dedicated services while keeping one-click blueprint deployment.
