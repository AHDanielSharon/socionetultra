export type Visibility = 'public' | 'friends' | 'close_friends' | 'private';

export type Profile = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  tier: 'public' | 'creator' | 'private';
  isPrivate: boolean;
};

export type Identity = {
  did: string;
  principal: string;
  createdAt: string;
  anonymousMode: boolean;
  profiles: Profile[];
  activeProfileId: string;
};

export type Post = {
  id: string;
  authorProfileId: string;
  text: string;
  visibility: Visibility;
  likes: string[];
  comments: { id: string; by: string; text: string }[];
  createdAt: string;
  updatedAt?: string;
};

export type Story = {
  id: string;
  by: string;
  text: string;
  createdAt: string;
  expiresAt: string;
  viewers: string[];
};

export type Message = {
  id: string;
  chatId: string;
  by: string;
  text: string;
  createdAt: string;
  reaction?: string;
  scheduledFor?: string;
  disappearsAt?: string;
  editedAt?: string;
};

export type Chat = {
  id: string;
  title: string;
  type: 'dm' | 'group' | 'channel';
  participants: string[];
  pinned: boolean;
};

export type NotificationPrefs = {
  push: boolean;
  silentMode: boolean;
  priorityOnly: boolean;
  messages: boolean;
  posts: boolean;
  calls: boolean;
};

export type AppState = {
  identity: Identity | null;
  posts: Post[];
  stories: Story[];
  chats: Chat[];
  messages: Message[];
  follows: Record<string, string[]>;
  friends: Record<string, string[]>;
  blocked: string[];
  muted: string[];
  notif: NotificationPrefs;
  location?: { lat: string; lng: string; visibleTo: Visibility };
};
