# SOCIONET — Complete Product Definition (Render-Oriented)

## 1. Vision
SOCIONET is a decentralized, AI-native global social super app that unifies messaging, social media, video, calls, communities, and creator monetization while preserving privacy, user ownership, and identity portability.

## 2. Experience Goals
- One app, infinite capabilities.
- Instant-first interactions (sub-250ms target for core UI actions).
- Privacy by default and explicit control everywhere.
- Multi-device continuity with no fragile password workflows.

## 3. Identity & Access (Internet Identity)
### Functional requirements
- Passwordless login using internet identity + passkeys.
- Multi-device secure binding.
- No centralized credential resets.
- Optional anonymous session projection.
- Multi-profile model (e.g., public/creator/private) under one identity principal.

### Security requirements
- Device key attestation and revocation list.
- Session hardening with signed challenge + short token TTL.
- Anti-impersonation signature verification for profile operations.

## 4. Social Graph
- Follow + friend dual graph.
- Relationship tiers: close, standard, restricted, blocked.
- Private/public profile per module (posts, stories, live, map, inbox discoverability).
- Suggestion engine based on explicit interests + optional contextual signals.

## 5. Messaging Platform
- 1:1 chat.
- Group chat (small + large).
- Broadcast channels.
- Reactions, threads, edit/delete, pinned chats.
- Voice notes.
- File/media share.
- Scheduled messages.
- Disappearing messages and protected media views.

### Message trust model
- Private conversations encrypted by default.
- Integrity hash chain per conversation for tamper evidence.
- Cross-device key sync via secure envelope encryption.

## 6. Calling & Live Collaboration
- 1:1 and group voice/video.
- Screen sharing.
- Co-watch / co-browse rooms.
- Global latency optimization with regional edge relays.

## 7. Content Ecosystem
### Posts
- Text/image/video/carousel.
- Post-edit history for transparent moderation context.
- Nested comments and reply trees.
- Like/share/save.

### Short content
- Vertical infinite video feed.
- Remix/reuse pipelines.

### Stories
- 24-hour lifecycle.
- Viewer list.
- Polls/questions/stickers.

### Long-form video
- Channels.
- Subscriptions.
- Playlists.
- Live streaming.
- Monetization hooks.

### Ephemeral
- Auto-expiring chats.
- Private media + screenshot alerts.

## 8. Discovery
- Personalized home feed.
- Trending.
- Explore categories.
- Topic/hashtag indexing.
- Interest graph recommendations.

## 9. Real-Time Features
- Live notifications.
- Presence.
- Typing indicators.
- Cross-device state sync.
- Live reactions during events/streams.

## 10. Location & Maps
- Live location sharing with consent windows.
- Nearby people (opt-in only).
- Visibility policy by list, tier, or time.

## 11. AI Capabilities
- Built-in assistant for help and in-app tasks.
- Smart replies.
- Caption/post/thumbnail generation.
- Safety moderation.
- Voice interface and translation.

## 12. Notifications
- Real-time push.
- Priority channels.
- Quiet hours.
- Per-conversation and per-feature controls.

## 13. Search
- Unified search over users, messages, posts, videos, hashtags.
- Relevance + recency ranking.
- Privacy-aware query scope.

## 14. Privacy & Control
- Per-post visibility.
- Block/restrict/mute.
- Transparency logs and access audit view.
- User export and delete rights.

## 15. Security Baseline
- Private by default.
- Cryptographic identity binding.
- Signed content ownership.
- Hard authorization boundaries and zero-trust API validation.

## 16. UI/UX
- Futuristic minimal design.
- Fluid micro-animations.
- Accessible color and motion settings.
- Dark + light themes.
- Mobile-first responsive PWA behavior.

## 17. Render: Single-Deploy Strategy
SOCIONET can be deployed from one repository and one blueprint (`render.yaml`) with a single primary web service. External managed dependencies are attached via environment variables.

### Required runtime
- Node 20+
- Next.js production build

### Build/start
- Build: `npm ci && npm run build`
- Start: `npm run start`

### Optional managed dependencies (still one blueprint deploy)
- Postgres for social graph + metadata
- Redis for real-time fan-out and cache
- Object storage for media
- Worker service for transcoding and async tasks

## 18. Suggested Data Domains
- Identity domain
- Profile domain
- Graph domain
- Messaging domain
- Calling domain
- Media domain
- Feed/recommendation domain
- Moderation domain
- Billing/monetization domain
- Analytics/privacy domain

## 19. Suggested KPI Targets
- Message delivery p95 < 700ms global.
- Feed first content paint < 1.5s mobile.
- Crash-free sessions > 99.8%.
- Abuse response SLA < 5 minutes for critical incidents.

## 20. Delivery Roadmap
1. **Phase 1**: identity, profiles, chat, feed, notifications, baseline moderation.
2. **Phase 2**: stories, short videos, live calls, recommendation improvements.
3. **Phase 3**: channels/live monetization, advanced creator tooling, communities.
4. **Phase 4**: federated expansion, partner ecosystem, programmable social extensions.
