# SOCIONET — Mobile-First Super App (Single Render Deploy)

SOCIONET now uses an Instagram/WhatsApp-style app shell with bottom navigation and tabbed interaction (not one long scrolling page).

## Working features
- Internet Identity flow:
  - Passkey-based login attempt (WebAuthn) + fallback quick identity.
  - Cryptographic DID + principal from backend identity endpoint.
- Decentralized-inspired architecture:
  - Server-side state ledger (`lib/server/db.ts`) and API-first app design.
  - Extensible path to blockchain anchoring (content-hash + tx index layer).
- Feed + Stories + Reels style tab.
- Real messaging (create/edit/react/disappear/delete/schedule).
- Communities/chats and call session creation.
- AI assistant endpoint for smart strategy responses.
- Explore/search tab across users/posts/messages.
- Proper install button (`beforeinstallprompt`) with installed state.

## Deploy on Render (one deploy)
- Use `render.yaml` blueprint.
- Build: `npm ci && npm run build`
- Start: `npm run start`

## Local run
```bash
npm ci
npm run dev
```

## Production next step
For true global decentralized production, add dedicated chain/indexer + object storage/IPFS + WebRTC SFU + audited E2EE key service while keeping one blueprint deploy orchestration.
