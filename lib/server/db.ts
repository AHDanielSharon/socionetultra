import { promises as fs } from 'fs';
import path from 'path';
import { AppState, Chat, Identity, Message } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'socionet.json');

const now = () => new Date().toISOString();
const id = () => Math.random().toString(36).slice(2, 10);

const defaultState = (): AppState => ({
  identity: null,
  posts: [],
  stories: [],
  chats: [],
  messages: [],
  follows: {},
  friends: {},
  blocked: [],
  muted: [],
  notif: { push: true, silentMode: false, priorityOnly: false, messages: true, posts: true, calls: true }
});

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultState(), null, 2), 'utf8');
  }
}

export async function readState(): Promise<AppState> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(raw) as AppState;
}

export async function writeState(state: AppState): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

export async function mutateState(mutator: (state: AppState) => AppState | Promise<AppState>): Promise<AppState> {
  const current = await readState();
  const next = await mutator(current);
  await writeState(next);
  return next;
}

export const createIdentity = (): Identity => {
  const principal = `ii-${crypto.randomUUID()}`;
  const profileId = id();
  return {
    did: `did:socionet:${crypto.randomUUID()}`,
    principal,
    createdAt: now(),
    anonymousMode: false,
    activeProfileId: profileId,
    profiles: [
      {
        id: profileId,
        handle: `user_${principal.slice(3, 9)}`,
        displayName: 'Primary Profile',
        bio: 'Owner of this decentralized identity.',
        tier: 'public',
        isPrivate: false
      }
    ]
  };
};

export const seedWelcomeChat = (identity: Identity): { chat: Chat; message: Message } => {
  const chat: Chat = {
    id: id(),
    title: 'Global Builders',
    type: 'group',
    participants: [identity.activeProfileId, 'alice', 'bob', 'charlie'],
    pinned: true
  };
  const message: Message = {
    id: id(),
    chatId: chat.id,
    by: 'alice',
    text: 'Welcome to SOCIONET. Private-first protocol enabled.',
    createdAt: now()
  };
  return { chat, message };
};
