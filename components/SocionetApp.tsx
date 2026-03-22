'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppState, Chat, Identity, Message, Post, Profile, Story, Visibility } from '@/lib/types';
import { loadState, resetState, saveState } from '@/lib/storage';

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const defaultState: AppState = {
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
};

const makeIdentity = (): Identity => {
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

const allUsers = ['alice', 'bob', 'charlie', 'diana', 'eve'];

export default function SocionetApp() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [postText, setPostText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [search, setSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOut, setAiOut] = useState('');

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState(loaded);
      setActiveChatId(loaded.chats[0]?.id ?? '');
      return;
    }

    const identity = makeIdentity();
    const initialChat: Chat = {
      id: id(),
      title: 'Global Builders',
      type: 'group',
      participants: [identity.activeProfileId, 'alice', 'bob', 'charlie'],
      pinned: true
    };
    const welcome: Message = {
      id: id(),
      chatId: initialChat.id,
      by: 'alice',
      text: 'Welcome to SOCIONET. End-to-end privacy mode enabled by default.',
      createdAt: now()
    };

    const seeded: AppState = { ...defaultState, identity, chats: [initialChat], messages: [welcome] };
    setState(seeded);
    setActiveChatId(initialChat.id);
  }, []);

  useEffect(() => {
    if (!state.identity) return;
    saveState(state);
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const nowTs = Date.now();
        const filteredStories = prev.stories.filter((s) => new Date(s.expiresAt).getTime() > nowTs);
        const filteredMsgs = prev.messages.filter((m) => !m.disappearsAt || new Date(m.disappearsAt).getTime() > nowTs);
        if (filteredStories.length === prev.stories.length && filteredMsgs.length === prev.messages.length) return prev;
        return { ...prev, stories: filteredStories, messages: filteredMsgs };
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeProfile = state.identity?.profiles.find((p) => p.id === state.identity?.activeProfileId) as Profile | undefined;
  const activeChat = state.chats.find((c) => c.id === activeChatId);
  const activeMessages = state.messages.filter((m) => m.chatId === activeChatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return {
      users: allUsers.filter((u) => u.includes(q)),
      posts: state.posts.filter((p) => p.text.toLowerCase().includes(q)),
      messages: state.messages.filter((m) => m.text.toLowerCase().includes(q))
    };
  }, [search, state.posts, state.messages]);

  const createPost = () => {
    if (!activeProfile || !postText.trim()) return;
    const p: Post = {
      id: id(),
      authorProfileId: activeProfile.id,
      text: postText.trim(),
      visibility,
      likes: [],
      comments: [],
      createdAt: now()
    };
    setState((s) => ({ ...s, posts: [p, ...s.posts] }));
    setPostText('');
  };

  const sendMessage = () => {
    if (!activeProfile || !activeChatId || !messageText.trim()) return;
    const m: Message = { id: id(), chatId: activeChatId, by: activeProfile.id, text: messageText.trim(), createdAt: now() };
    setState((s) => ({ ...s, messages: [...s.messages, m] }));
    setMessageText('');
  };

  const sendScheduled = (minutes: number) => {
    if (!activeProfile || !activeChatId || !messageText.trim()) return;
    const sendAt = new Date(Date.now() + minutes * 60_000).toISOString();
    const m: Message = {
      id: id(),
      chatId: activeChatId,
      by: activeProfile.id,
      text: `[Scheduled] ${messageText.trim()}`,
      createdAt: now(),
      scheduledFor: sendAt
    };
    setState((s) => ({ ...s, messages: [...s.messages, m] }));
    setMessageText('');
  };

  const createStory = () => {
    if (!activeProfile) return;
    const text = prompt('Story text (expires in 24h)');
    if (!text) return;
    const story: Story = {
      id: id(),
      by: activeProfile.id,
      text,
      createdAt: now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      viewers: []
    };
    setState((s) => ({ ...s, stories: [story, ...s.stories] }));
  };

  const aiAssist = () => {
    const promptTxt = aiPrompt.trim();
    if (!promptTxt) return;
    const out = [
      'AI Assistant plan:',
      '- Suggestion 1: Publish a short update and a story together for max reach.',
      '- Suggestion 2: Enable close-friends visibility for sensitive content.',
      '- Suggestion 3: Start a community channel and schedule a live Q&A.',
      `- Generated response for: "${promptTxt}"`
    ].join('\n');
    setAiOut(out);
  };

  const loginNewIdentity = () => setState((s) => ({ ...s, identity: makeIdentity(), posts: [], stories: [], messages: [], chats: [] }));

  if (!state.identity) {
    return (
      <section className="panel">
        <h1>SOCIONET Internet Identity</h1>
        <p>Create a decentralized identity locally on your device. No password required.</p>
        <button onClick={loginNewIdentity}>Create Identity</button>
      </section>
    );
  }

  return (
    <div className="supergrid">
      <section className="panel">
        <h2>Identity & Access</h2>
        <p><strong>DID:</strong> {state.identity.did}</p>
        <p><strong>Principal:</strong> {state.identity.principal}</p>
        <label>
          <input
            type="checkbox"
            checked={state.identity.anonymousMode}
            onChange={(e) => setState((s) => ({ ...s, identity: s.identity ? { ...s.identity, anonymousMode: e.target.checked } : null }))}
          /> Anonymous mode
        </label>
        <button onClick={() => {
          if (!state.identity) return;
          const profile: Profile = { id: id(), handle: `profile_${id()}`, displayName: 'New Profile', bio: '', tier: 'private', isPrivate: true };
          setState((s) => s.identity ? { ...s, identity: { ...s.identity, profiles: [...s.identity.profiles, profile], activeProfileId: profile.id } } : s);
        }}>+ Add Profile</button>
        <button onClick={() => resetState()}>Reset App</button>
      </section>

      <section className="panel">
        <h2>Posts + Stories</h2>
        <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Share text/image/video links..." />
        <div className="row">
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
            <option value="public">Public</option><option value="friends">Friends</option><option value="close_friends">Close Friends</option><option value="private">Private</option>
          </select>
          <button onClick={createPost}>Publish</button>
          <button onClick={createStory}>New Story</button>
        </div>
        <div className="feed">
          {state.posts.map((p) => (
            <article key={p.id} className="card">
              <small>{p.visibility} • {new Date(p.createdAt).toLocaleString()}</small>
              <p>{p.text}</p>
              <div className="row">
                <button onClick={() => setState((s) => ({ ...s, posts: s.posts.map((x) => x.id === p.id ? { ...x, likes: x.likes.includes(activeProfile!.id) ? x.likes.filter((l) => l !== activeProfile!.id) : [...x.likes, activeProfile!.id] } : x) }))}>♥ {p.likes.length}</button>
                <button onClick={() => {
                  const comment = prompt('Comment');
                  if (!comment) return;
                  setState((s) => ({ ...s, posts: s.posts.map((x) => x.id === p.id ? { ...x, comments: [...x.comments, { id: id(), by: activeProfile!.id, text: comment }] } : x) }));
                }}>💬 {p.comments.length}</button>
              </div>
            </article>
          ))}
          {state.stories.map((s) => <div className="story" key={s.id}>📸 {s.text} (expires {new Date(s.expiresAt).toLocaleString()})</div>)}
        </div>
      </section>

      <section className="panel">
        <h2>Messaging + Channels</h2>
        <div className="row wrap">
          {state.chats.map((c) => <button key={c.id} onClick={() => setActiveChatId(c.id)}>{c.pinned ? '📌 ' : ''}{c.title}</button>)}
          <button onClick={() => {
            const title = prompt('Chat title');
            if (!title || !activeProfile) return;
            const chat: Chat = { id: id(), title, type: 'group', participants: [activeProfile.id], pinned: false };
            setState((s) => ({ ...s, chats: [...s.chats, chat] }));
            setActiveChatId(chat.id);
          }}>+ New Chat</button>
        </div>
        {activeChat && <small>Active: {activeChat.title}</small>}
        <div className="messages">
          {activeMessages.map((m) => (
            <div key={m.id} className="msg">
              <strong>{m.by === activeProfile?.id ? 'You' : m.by}</strong>: {m.text}
              {m.scheduledFor && <em> (scheduled {new Date(m.scheduledFor).toLocaleTimeString()})</em>}
              <div className="row">
                <button onClick={() => setState((s) => ({ ...s, messages: s.messages.map((x) => x.id === m.id ? { ...x, reaction: '🔥' } : x) }))}>🔥</button>
                <button onClick={() => {
                  const edited = prompt('Edit message', m.text);
                  if (!edited) return;
                  setState((s) => ({ ...s, messages: s.messages.map((x) => x.id === m.id ? { ...x, text: edited, editedAt: now() } : x) }));
                }}>Edit</button>
                <button onClick={() => setState((s) => ({ ...s, messages: s.messages.filter((x) => x.id !== m.id) }))}>Delete</button>
                <button onClick={() => setState((s) => ({ ...s, messages: s.messages.map((x) => x.id === m.id ? { ...x, disappearsAt: new Date(Date.now() + 60_000).toISOString() } : x) }))}>Disappear 1m</button>
              </div>
            </div>
          ))}
        </div>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type message..." />
        <div className="row">
          <button onClick={sendMessage}>Send</button>
          <button onClick={() => sendScheduled(1)}>Schedule +1m</button>
        </div>
      </section>

      <section className="panel">
        <h2>Calls + Collaboration</h2>
        <p>Voice/video/screen-share simulation with presence controls.</p>
        <div className="row">
          <button onClick={() => alert('Voice call started')}>Voice Call</button>
          <button onClick={() => alert('Video call started')}>Video Call</button>
          <button onClick={() => alert('Screen sharing started')}>Share Screen</button>
          <button onClick={() => alert('Co-watch room opened')}>Co-watch</button>
        </div>
      </section>

      <section className="panel">
        <h2>Discovery + Search</h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, posts, messages" />
        {searchResults && (
          <div>
            <p><strong>Users:</strong> {searchResults.users.join(', ') || 'none'}</p>
            <p><strong>Posts:</strong> {searchResults.posts.length}</p>
            <p><strong>Messages:</strong> {searchResults.messages.length}</p>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>AI Assistant</h2>
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask for smart replies, content ideas, moderation guidance..." />
        <button onClick={aiAssist}>Generate</button>
        <pre>{aiOut}</pre>
      </section>

      <section className="panel">
        <h2>Location + Privacy</h2>
        <div className="row">
          <input placeholder="Latitude" onChange={(e) => setState((s) => ({ ...s, location: { lat: e.target.value, lng: s.location?.lng ?? '', visibleTo: s.location?.visibleTo ?? 'friends' } }))} />
          <input placeholder="Longitude" onChange={(e) => setState((s) => ({ ...s, location: { lat: s.location?.lat ?? '', lng: e.target.value, visibleTo: s.location?.visibleTo ?? 'friends' } }))} />
          <select onChange={(e) => setState((s) => ({ ...s, location: { lat: s.location?.lat ?? '', lng: s.location?.lng ?? '', visibleTo: e.target.value as Visibility } }))}>
            <option value="friends">Friends</option>
            <option value="close_friends">Close Friends</option>
            <option value="private">Private</option>
          </select>
        </div>
        <small>Live location visibility: {state.location?.visibleTo ?? 'not shared'}</small>
      </section>

      <section className="panel">
        <h2>Notification Controls</h2>
        {Object.entries(state.notif).map(([k, v]) => (
          <label key={k}><input type="checkbox" checked={v} onChange={(e) => setState((s) => ({ ...s, notif: { ...s.notif, [k]: e.target.checked } }))} /> {k}</label>
        ))}
      </section>
    </div>
  );
}
