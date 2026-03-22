export const sections = [
  {
    title: '1) Product Foundation',
    items: [
      'SOCIONET is a decentralized social super app combining messaging, content, video, and creator tools in one identity-native platform.',
      'Default posture: private-by-default, user-owned data, cryptographic identity, and transparent controls.',
      'Deployment strategy: one Render deploy for the web application, with managed external services for blockchain identity validation, media processing, and push delivery.'
    ]
  },
  {
    title: '2) Internet Identity + Access Model',
    items: [
      'Primary login: Internet Identity + passkeys (WebAuthn) with multi-device credential binding.',
      'No passwords and no centralized account reset secrets.',
      'Users can create multiple profiles (public, creator, private) under one identity principal with isolated privacy preferences.',
      'Anonymous mode allows posting and browsing with temporary profile projection, while keeping legal security auditability through cryptographic signatures.'
    ]
  },
  {
    title: '3) Core Social Graph',
    items: [
      'Supports follow graph, mutual friends graph, and trust tiers: close, standard, restricted, blocked.',
      'Smart recommendations use federated personalization signals and explicit controls for what signals are used.',
      'Profiles can be fully private, followers-only, or public by module (posts, stories, live, location, contact).' 
    ]
  },
  {
    title: '4) Messaging, Calls, and Real-Time',
    items: [
      'Encrypted 1:1 and group chat, channels, reactions, edits, deletions, pinned chats, threads, scheduling, voice notes, media/files.',
      'Disappearing messages and screenshot alerts for protected media.',
      'Voice/video calls with adaptive bitrate, screen share, co-watch, and co-browse sessions.',
      'Real-time features: presence, typing, live reactions, read states, cross-device sync, and low-latency delivery routing.'
    ]
  },
  {
    title: '5) Content + Discovery + AI',
    items: [
      'Posts: text/image/video/carousel with edits, nested comments, likes, saves, shares, and permission-aware visibility.',
      'Short-form vertical feed, stories, channels, live streaming, playlists, subscriptions, and monetization rails.',
      'Explore and trending: hashtags, categories, interests, geo-safe discovery.',
      'Built-in AI: smart replies, assistant, creator drafting, moderation, translation, and voice interface.'
    ]
  },
  {
    title: '6) Privacy, Security, and Data Ownership',
    items: [
      'End-to-end encrypted private messages and key rotation across trusted devices.',
      'Verifiable content ownership signatures for creator authenticity and anti-impersonation.',
      'Granular visibility controls at account, post, story, chat, and location layers.',
      'Transparent activity logs and downloadable data vault with portability tooling.'
    ]
  },
  {
    title: '7) One-Deploy Render Architecture',
    items: [
      'Single Render Web Service runs this Next.js app and provides unified API routes for product operations.',
      'Use Render managed Postgres + Redis + Object Storage + background workers (optional) while still deploying from one render.yaml blueprint.',
      'Environment template includes DATABASE_URL, REDIS_URL, NEXT_PUBLIC_CHAIN_NETWORK, NEXT_PUBLIC_ENABLE_AI, STORAGE_BUCKET, and PUSH_PROVIDER keys.',
      'Build command: npm ci && npm run build | Start command: npm run start.'
    ]
  },
  {
    title: '8) Delivery Plan',
    items: [
      'Phase 1 (0-8 weeks): Identity, profiles, messaging, notifications, basic feed, Render production baseline.',
      'Phase 2 (8-16 weeks): stories, short videos, calls, recommendations, moderation AI.',
      'Phase 3 (16-28 weeks): long-form video, creator monetization, community systems, advanced blockchain attestations.',
      'Phase 4: federation, external app ecosystem, super-app integrations.'
    ]
  }
];
