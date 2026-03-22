import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <section className="panel">
        <h1>SOCIONET</h1>
        <p>The app is now an interactive installable prototype. Open the live super app workspace below.</p>
        <Link href="/socionet" className="btn">Launch SOCIONET App</Link>
      </section>
    </main>
  );
}
