# SOCIONET (Interactive Super App Prototype)

This repository now contains an **installable interactive app**, not just a document page.

## Included working modules
- Decentralized-style identity bootstrap (local DID/principal generation).
- Multi-profile capability under one identity.
- Feed/posts with visibility controls, likes, and comments.
- Stories with 24-hour expiry logic.
- Messaging/chats/channels with edit/delete/reaction/disappearing/scheduled message support.
- Calling/collaboration controls (UI simulation hooks).
- Search across users/posts/messages.
- AI assistant panel for smart-reply/content-planning flows.
- Notification and privacy/location controls.
- PWA manifest for installable behavior.

## Run locally
```bash
npm ci
npm run dev
```

## Deploy on Render
- Keep `render.yaml` as-is.
- Create Blueprint deploy from this repo.
- Build: `npm ci && npm run build`
- Start: `npm run start`

## Important scope note
This is a substantial functional prototype designed for one-deploy setup. For true internet-scale production (global E2EE infra, live media relays, blockchain settlement, anti-abuse pipelines, regional compliance), additional backend services and security audits are required.
