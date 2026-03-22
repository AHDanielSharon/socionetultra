'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppState, Chat, Message, Post, Profile, Visibility } from '@/lib/types';
import InstallButton from '@/components/InstallButton';

type Tab = 'home' | 'reels' | 'chats' | 'calls' | 'explore' | 'ai' | 'profile';

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

const navItems: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'reels', label: 'Reels', icon: '🎬' },
  { key: 'chats', label: 'Chats', icon: '💬' },
  { key: 'calls', label: 'Calls', icon: '📞' },
  { key: 'explore', label: 'Explore', icon: '🔍' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'profile', label: 'You', icon: '👤' }
];

export default function SocionetApp() {
  const [state, setState] = useState<AppState>(defaultState);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeChatId, setActiveChatId] = useState('');
  const [composer, setComposer] = useState('');
  const [postText, setPostText] = useState('');
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOut, setAiOut] = useState('');
  const [callLog, setCallLog] = useState<string[]>([]);
  const [loginError, setLoginError] = useState('');

  const syncState = async () => {
    const s = (await json('/api/state')) as AppState;
    setState(s);
    if (!activeChatId && s.chats[0]?.id) setActiveChatId(s.chats[0].id);
  };

  useEffect(() => {
    syncState().catch((e) => setLoginError((e as Error).message));
  }, []);

  const activeProfile = state.identity?.profiles.find((p) => p.id === state.identity?.activeProfileId) as Profile | undefined;
  const activeMessages = state.messages.filter((m) => m.chatId === activeChatId);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { users: [], posts: [], messages: [] };
    return {
      users: ['alice', 'bob', 'charlie', 'diana', 'eve'].filter((u) => u.includes(q)),
      posts: state.posts.filter((p) => p.text.toLowerCase().includes(q)),
      messages: state.messages.filter((m) => m.text.toLowerCase().includes(q))
    };
  }, [search, state.posts, state.messages]);

  const createInternetIdentity = async () => {
    await json('/api/identity', { method: 'POST' });
    await syncState();
  };

  const passkeyLogin = async () => {
    try {
      if (!('credentials' in navigator)) throw new Error('Passkeys not supported on this browser/device');
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'SOCIONET Internet Identity' },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: `socionet-${Date.now()}@identity.local`,
            displayName: 'SOCIONET User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }
        }
      });
      await createInternetIdentity();
    } catch (e) {
      setLoginError((e as Error).message);
    }
  };

  const createPost = async () => {
    if (!postText.trim()) return;
    await json('/api/posts', { method: 'POST', body: JSON.stringify({ text: postText, visibility }) });
    setPostText('');
    await syncState();
  };

  const interactPost = async (postId: string, action: 'like' | 'comment') => {
    const text = action === 'comment' ? prompt('Comment') ?? '' : undefined;
    await json(`/api/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ action, text }) });
    await syncState();
  };

  const createChat = async () => {
    const title = prompt('Community / group name');
    if (!title) return;
    const chat = (await json('/api/chats', { method: 'POST', body: JSON.stringify({ title, type: 'group' }) })) as Chat;
    await syncState();
    if (chat.id) {
      setActiveChatId(chat.id);
      setActiveTab('chats');
    }
  };

  const sendMessage = async (scheduled = false) => {
    if (!activeChatId || !composer.trim()) return;
    await json('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        chatId: activeChatId,
        text: composer,
        scheduledFor: scheduled ? new Date(Date.now() + 60000).toISOString() : undefined
      })
    });
    setComposer('');
    await syncState();
  };

  const patchMessage = async (id: string, action: 'reaction' | 'disappear' | 'edit') => {
    const text = action === 'edit' ? prompt('Edit message') ?? '' : undefined;
    await json(`/api/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ action, text, reaction: '🔥' }) });
    await syncState();
  };

  const deleteMessage = async (id: string) => {
    await json(`/api/messages/${id}`, { method: 'DELETE' });
    await syncState();
  };

  const startCall = async (mode: 'voice' | 'video' | 'screen' | 'cowatch') => {
    const res = await json('/api/calls', { method: 'POST', body: JSON.stringify({ mode, chatId: activeChatId }) });
    setCallLog((x) => [`${mode.toUpperCase()} session ${res.callId}`, ...x]);
  };

  const runAI = async () => {
    const out = await json('/api/ai', { method: 'POST', body: JSON.stringify({ prompt: aiPrompt }) });
    setAiOut(out.output);
  };

  if (!state.identity) {
    return (
      <section className="auth-card">
        <h1>SOCIONET Internet Identity</h1>
        <p>Passwordless decentralized access. Create identity with passkey + cryptographic DID.</p>
        <div className="row wrap">
          <button onClick={passkeyLogin}>Continue with Internet Identity</button>
          <button onClick={createInternetIdentity}>Quick Demo Identity</button>
          <InstallButton />
        </div>
        {!!loginError && <p className="error">{loginError}</p>}
      </section>
    );
  }

  return (
    <div className="mobile-shell">
      <header className="topbar">
        <strong>SOCIONET</strong>
        <div className="row">
          <span className="badge">DID</span>
          <InstallButton />
        </div>
      </header>

      <main className="tab-content">
        {activeTab === 'home' && (
          <section>
            <div className="stories-row">
              {state.stories.slice(0, 8).map((s) => <div key={s.id} className="story-bubble">{s.text.slice(0, 14)}</div>)}
              <button className="story-bubble" onClick={() => {
                const t = prompt('Story text');
                if (!t || !activeProfile) return;
                setState((x) => ({ ...x, stories: [{ id: crypto.randomUUID().slice(0, 8), by: activeProfile.id, text: t, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), viewers: [] }, ...x.stories] }));
              }}>+ Story</button>
            </div>
            <div className="compose-card">
              <textarea value={postText} onChange={(e) => setPostText(e.target.value)} placeholder="Share update, image link, or video link..." />
              <div className="row">
                <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
                  <option value="public">Public</option><option value="friends">Friends</option><option value="close_friends">Close Friends</option><option value="private">Private</option>
                </select>
                <button onClick={createPost}>Post</button>
              </div>
            </div>
            <div className="feed-list">
              {state.posts.map((p: Post) => (
                <article key={p.id} className="post-card">
                  <small>{p.visibility} • {new Date(p.createdAt).toLocaleString()}</small>
                  <p>{p.text}</p>
                  <div className="row">
                    <button onClick={() => interactPost(p.id, 'like')}>♥ {p.likes.length}</button>
                    <button onClick={() => interactPost(p.id, 'comment')}>💬 {p.comments.length}</button>
                    <button onClick={() => setActiveTab('chats')}>Share ↗</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'reels' && (
          <section className="reels-view">
            {[...state.posts].slice(0, 12).map((p) => <div key={p.id} className="reel-card">🎬 {p.text}</div>)}
            {state.posts.length === 0 && <p>Create posts in Home. They appear in Reels stream too.</p>}
          </section>
        )}

        {activeTab === 'chats' && (
          <section>
            <div className="row wrap">
              {state.chats.map((c) => <button key={c.id} onClick={() => setActiveChatId(c.id)}>{c.title}</button>)}
              <button onClick={createChat}>+ Group</button>
            </div>
            <div className="chat-box">
              {activeMessages.map((m: Message) => (
                <div className="msg" key={m.id}>
                  <strong>{m.by === state.identity?.activeProfileId ? 'You' : m.by}</strong>: {m.text} {m.reaction ?? ''}
                  <div className="row wrap">
                    <button onClick={() => patchMessage(m.id, 'reaction')}>🔥</button>
                    <button onClick={() => patchMessage(m.id, 'edit')}>Edit</button>
                    <button onClick={() => patchMessage(m.id, 'disappear')}>Disappear</button>
                    <button onClick={() => deleteMessage(m.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Message..." />
            <div className="row">
              <button onClick={() => sendMessage(false)}>Send</button>
              <button onClick={() => sendMessage(true)}>Schedule</button>
            </div>
          </section>
        )}

        {activeTab === 'calls' && (
          <section>
            <div className="row wrap">
              <button onClick={() => startCall('voice')}>Voice</button>
              <button onClick={() => startCall('video')}>Video</button>
              <button onClick={() => startCall('screen')}>Screen</button>
              <button onClick={() => startCall('cowatch')}>Co-watch</button>
            </div>
            <div className="feed-list">{callLog.map((c) => <div key={c} className="post-card">{c}</div>)}</div>
          </section>
        )}

        {activeTab === 'explore' && (
          <section>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, posts, messages" />
            <div className="post-card">
              <p><strong>Users:</strong> {searchResults.users.join(', ') || 'none'}</p>
              <p><strong>Posts:</strong> {searchResults.posts.length}</p>
              <p><strong>Messages:</strong> {searchResults.messages.length}</p>
            </div>
          </section>
        )}

        {activeTab === 'ai' && (
          <section>
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask AI for replies, captions, moderation, feed strategy..." />
            <button onClick={runAI}>Generate</button>
            <pre>{aiOut}</pre>
          </section>
        )}

        {activeTab === 'profile' && (
          <section>
            <div className="post-card">
              <p><strong>Principal:</strong> {state.identity.principal}</p>
              <p><strong>DID:</strong> {state.identity.did}</p>
              <p><strong>Profiles:</strong> {state.identity.profiles.length}</p>
            </div>
            <button onClick={async () => {
              await json('/api/state', { method: 'DELETE' });
              setState(defaultState);
            }}>Reset Account</button>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button key={item.key} className={activeTab === item.key ? 'active' : ''} onClick={() => setActiveTab(item.key)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
