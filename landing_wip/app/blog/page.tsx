import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

/* ─────────────────────────────────────────────────────────────
 * INDEX STORYBOARD
 *    0ms   header is static (no entrance — it's the anchor)
 *   on mount, cards reveal staggered:
 *    0ms   card 1  ┐
 *   60ms   card 2  │ stagger 60ms · 560ms each
 *  120ms   card 3  │ opacity 0→1, y 12→0, scale .98→1
 *    …             ┘ ease-out-quint (calm, no bounce)
 *  hover   bg + border shift, arrow slides in (no transform on card)
 * ───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Blog Científico — MicroCore",
  description:
    "11 artículos respaldados por evidencia real. Por Lc. Laura Fuentes, Nutricionista.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      {/* Header */}
      <header className="mb-16 max-w-2xl sm:mb-20">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          MicroCore · Blog Científico
        </p>
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-6xl">
          Evidencia real, sin promesas mágicas.
        </h1>
        <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
          {posts.length} artículos sobre microbiota, eje intestino-cerebro, piel y
          nutrición — cada afirmación respaldada por estudios. Por{" "}
          <span className="text-[var(--foreground)]">Lc. Laura Fuentes</span>,
          Nutricionista.
        </p>
      </header>

      {/* Posts grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ "--card-index": i } as CSSProperties}
            className="blog-card group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition-[background-color,border-color] duration-200 ease-out hover:border-[var(--muted)]/40 hover:bg-[var(--surface-secondary)] sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {post.category}
              </span>
              <span className="font-mono text-xs tabular-nums text-[var(--muted)]/70">
                {String(post.order).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}
              </span>
            </div>

            <h2 className="text-pretty text-xl font-semibold leading-snug tracking-tight text-[var(--foreground)] sm:text-[1.6rem]">
              {post.title}
            </h2>
            <p className="mt-3 line-clamp-2 flex-1 text-[0.98rem] leading-7 text-[var(--muted)]">
              {post.dek}
            </p>

            <div className="mt-7 flex items-center gap-2 text-xs text-[var(--muted)]">
              <span>{post.author}</span>
              {post.readTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.readTime}</span>
                </>
              )}
              <span
                aria-hidden
                className="ml-auto translate-x-0 text-[var(--foreground)] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:opacity-100"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
