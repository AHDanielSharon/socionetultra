import { sections } from '@/lib/product-spec';

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">SOCIONET</p>
        <h1>Complete Product Definition + Render-Ready Deployment Blueprint</h1>
        <p>
          This implementation provides a deployable foundation and a complete functional product blueprint covering
          identity, social graph, messaging, calls, content, AI, privacy, and scale.
        </p>
      </header>

      <section className="grid">
        {sections.map((section) => (
          <article key={section.title} className="card">
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
