import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <section className="auth-card">
        <h1>SOCIONET</h1>
        <p>Legendary super app experience with internet identity login, social feed, messaging, calls, discovery, AI, and installable PWA.</p>
        <Link href="/socionet"><button>Open SOCIONET</button></Link>
      </section>
    </main>
  );
}
