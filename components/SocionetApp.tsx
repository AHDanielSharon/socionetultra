'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppState, Chat, Message, Post, Profile, Story, Visibility } from '@/lib/types';
import { loadState, saveState } from '@/lib/storage';

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

const json = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export default function SocionetApp() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [postText, setPostText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [search, setSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOut, setAiOut] = useState('');
  const [callLog, setCallLog] = useState<string[]>([]);
  const [error, setError] = useState('');

  const syncState = async () => {
    const s = (await json('/api/state')) as AppState;
    setState(s);
    if (!activeChatId && s.chats[0]?.id) setActiveChatId(s.chats[0].id);
    return s;
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const loaded = loadState();
        if (loaded?.identity) setState(loaded);
        await syncState();
      } catch (e) {
        setError((e as Error).message);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (state.identity) saveState(state);
  }, [state]);

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const nowTs = Date.now();
        return {
          ...prev,
          stories: prev.stories.filter((s) => new Date(s.expiresAt).getTime() > nowTs),
          messages: prev.messages.filter((m) => !m.disappearsAt || new Date(m.disappearsAt).getTime() > nowTs)
        };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeProfile = state.identity?.profiles.find((p) => p.id === state.identity?.activeProfileId) as Profile | undefined;
  const activeChat = state.chats.find((c) => c.id === activeChatId);
  const activeMessages = state.messages.filter((m) => m.chatId === activeChatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return {
      users: ['alice', 'bob', 'charlie', 'diana', 'eve'].filter((u) => u.includes(q)),
      posts: state.posts.filter((p) => p.text.toLowerCase().includes(q)),
      messages: state.messages.filter((m) => m.text.toLowerCase().includes(q))
    };
  }, [search, state.posts, state.messages]);

  const createIdentity = async () => {
    await json('/api/identity', { method: 'POST' });
    await syncState();
  };

  const createPost = async () => {
    if (!postText.trim()) return;
    await json('/api/posts', { method: 'POST', body: JSON.stringify({ text: postText, visibility }) });
    setPostText('');
    await syncState();
  };

  const patchPost = async (id: string, action: 'like' | 'comment' | 'edit', text?: string) => {
    await json(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ action, text }) });
    await syncState();
  };

  const createChat = async () => {
    const title = prompt('Chat title');
    if (!title) return;
    const chat = (await json('/api/chats', { method: 'POST', body: JSON.stringify({ title, type: 'group' }) })) as Chat;
    await syncState();
    if (chat?.id) setActiveChatId(chat.id);
  };

  const createStory = () => {
    if (!activeProfile) return;
    const text = prompt('Story text');
    if (!text) return;
    const story: Story = {
      id: crypto.randomUUID().slice(0, 8),
      by: activeProfile.id,
      text,
      createdAt: now(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      viewers: []
    };
    setState((s) => ({ ...s, stories: [story, ...s.stories] }));
  };

  const sendMessage = async (scheduledFor?: string) => {
    if (!activeChatId || !messageText.trim()) return;
    await json('/api/messages', { method: 'POST', body: JSON.stringify({ chatId: activeChatId, text: messageText, scheduledFor }) });
    setMessageText('');
    await syncState();
  };

  const patchMessage = async (id: string, action: 'edit' | 'reaction' | 'disappear', text?: string) => {
    await json(`/api/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ action, text, reaction: '🔥' }) });
    await syncState();
  };

  const deleteMessage = async (id: string) => {
    await json(`/api/messages/${id}`, { method: 'DELETE' });
    await syncState();
  };

  const aiAssist = async () => {
    const out = await json('/api/ai', { method: 'POST', body: JSON.stringify({ prompt: aiPrompt }) });
    setAiOut(out.output || 'No output');
  };

  const startCall = async (mode: 'voice' | 'video' | 'screen' | 'cowatch') => {
    const res = await json('/api/calls', { method: 'POST', body: JSON.stringify({ mode, chatId: activeChatId }) });
    setCallLog((l) => [`${mode.toUpperCase()} call created: ${res.callId}`, ...l]);
  };

  const serverSearch = async () => {
    if (!search.trim()) return;
    const res = await json(`/api/search?q=${encodeURIComponent(search)}`);
    setAiOut(`Search intelligence:\nUsers: ${res.users.length}\nPosts: ${res.posts.length}\nMessages: ${res.messages.length}`);
  };

  if (!state.identity) {
    return (
      <section className="panel">
        <h1>SOCIONET Internet Identity</h1>
        <p>No password. Create cryptographic identity and start instantly.</p>
        <button onClick={createIdentity}>Create Identity</button>
        {error && <p>{error}</p>}
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
        <button onClick={() => setState((s) => {
          if (!s.identity) return s;
          const profile: Profile = { id: crypto.randomUUID().slice(0, 8), handle: `profile_${Date.now().toString().slice(-4)}`, displayName: 'New Profile', bio: '', tier: 'private', isPrivate: true };
          return { ...s, identity: { ...s.identity, profiles: [...s.identity.profiles, profile], activeProfileId: profile.id } };
        })}>+ Add Profile</button>
        <button onClick={async () => {
          await json('/api/state', { method: 'DELETE' });
          setState(defaultState);
        }}>Reset Server State</button>
      </section>

      <section className="panel">
        <h2>Posts + Stories</h2>
        <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Text/Image/Video links" />
        <div className="row">
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
            <option value="public">Public</option><option value="friends">Friends</option><option value="close_friends">Close Friends</option><option value="private">Private</option>
          </select>
          <button onClick={createPost}>Publish</button>
          <button onClick={createStory}>New Story</button>
        </div>
        <div className="feed">
          {state.posts.map((p: Post) => (
            <article key={p.id} className="card">
              <small>{p.visibility} • {new Date(p.createdAt).toLocaleString()}</small>
              <p>{p.text}</p>
              <div className="row">
                <button onClick={() => patchPost(p.id, 'like')}>♥ {p.likes.length}</button>
                <button onClick={() => {
                  const c = prompt('Comment');
                  if (!c) return;
                  patchPost(p.id, 'comment', c);
                }}>💬 {p.comments.length}</button>
                <button onClick={() => {
                  const text = prompt('Edit post', p.text);
                  if (!text) return;
                  patchPost(p.id, 'edit', text);
                }}>Edit</button>
              </div>
            </article>
          ))}
          {state.stories.map((s) => <div className="story" key={s.id}>📸 {s.text} (24h story)</div>)}
        </div>
      </section>

      <section className="panel">
        <h2>Messaging + Communities</h2>
        <div className="row wrap">
          {state.chats.map((c) => <button key={c.id} onClick={() => setActiveChatId(c.id)}>{c.pinned ? '📌 ' : ''}{c.title}</button>)}
          <button onClick={createChat}>+ New Chat</button>
        </div>
        {activeChat && <small>Active chat: {activeChat.title}</small>}
        <div className="messages">
          {activeMessages.map((m: Message) => (
            <div key={m.id} className="msg">
              <strong>{m.by === state.identity?.activeProfileId ? 'You' : m.by}</strong>: {m.text} {m.reaction ? ` ${m.reaction}` : ''}
              <div className="row">
                <button onClick={() => patchMessage(m.id, 'reaction')}>🔥</button>
                <button onClick={() => {
                  const edited = prompt('Edit message', m.text);
                  if (!edited) return;
                  patchMessage(m.id, 'edit', edited);
                }}>Edit</button>
                <button onClick={() => patchMessage(m.id, 'disappear')}>Disappear 1m</button>
                <button onClick={() => deleteMessage(m.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type message" />
        <div className="row">
          <button onClick={() => sendMessage()}>Send</button>
          <button onClick={() => sendMessage(new Date(Date.now() + 60_000).toISOString())}>Schedule +1m</button>
        </div>
      </section>

      <section className="panel">
        <h2>Calling + Collaboration</h2>
        <div className="row wrap">
          <button onClick={() => startCall('voice')}>Voice</button>
          <button onClick={() => startCall('video')}>Video</button>
          <button onClick={() => startCall('screen')}>Screen Share</button>
          <button onClick={() => startCall('cowatch')}>Co-watch</button>
        </div>
        <div className="feed">{callLog.map((entry) => <div className="card" key={entry}>{entry}</div>)}</div>
      </section>

      <section className="panel">
        <h2>Discovery + Search</h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, messages, posts" />
        <div className="row">
          <button onClick={serverSearch}>AI Search</button>
        </div>
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
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask AI for replies/content/moderation" />
        <button onClick={aiAssist}>Generate</button>
        <pre>{aiOut}</pre>
      </section>

      <section className="panel">
        <h2>Location + Privacy</h2>
        <div className="row">
          <input placeholder="Latitude" onChange={(e) => setState((s) => ({ ...s, location: { lat: e.target.value, lng: s.location?.lng ?? '', visibleTo: s.location?.visibleTo ?? 'friends' } }))} />
          <input placeholder="Longitude" onChange={(e) => setState((s) => ({ ...s, location: { lat: s.location?.lat ?? '', lng: e.target.value, visibleTo: s.location?.visibleTo ?? 'friends' } }))} />
        </div>
        <small>Visibility: {state.location?.visibleTo ?? 'not shared'}</small>
      </section>

      <section className="panel">
        <h2>Notifications</h2>
        {Object.entries(state.notif).map(([k, v]) => (
          <label key={k}><input type="checkbox" checked={v} onChange={(e) => setState((s) => ({ ...s, notif: { ...s.notif, [k]: e.target.checked } }))} /> {k}</label>
        ))}
      </section>
    </div>
  );
}
