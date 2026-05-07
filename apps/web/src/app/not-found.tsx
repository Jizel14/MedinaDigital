import { fontVariables } from './fonts';
import './globals.css';

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <main className="grid min-h-screen place-items-center px-6">
          <div className="text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
              Médina Digital
            </p>
            <h1
              className="mb-4 italic"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-clay-700)',
              }}
            >
              Page not found
            </h1>
            <a href="/" className="inline-block border-b border-[color:var(--color-ink-900)] pb-1">
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
