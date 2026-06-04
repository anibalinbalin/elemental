import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPost } from "@/lib/blog";
import { PostBody } from "../post-body";
import { ReadingProgress } from "../_components/reading-progress";

/* ─────────────────────────────────────────────────────────────
 * ARTICLE STORYBOARD
 *   on mount  article fades + slides up (420ms, ease-out-quint)
 *   on scroll fixed progress bar tracks read position (scaleX, rAF)
 *   header → body → references, generous editorial rhythm
 * ───────────────────────────────────────────────────────────── */

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — MicroCore`, description: post.dek };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <ReadingProgress />
      <main className="blog-article-enter mx-auto w-full max-w-[720px] px-6 py-16 sm:py-24">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <span aria-hidden>←</span> Blog
        </Link>

        <article className="mt-10">
          <header className="border-b border-[var(--separator)] pb-10">
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {post.category}
              </span>
              <span aria-hidden className="text-[var(--separator)]">
                |
              </span>
              <span className="font-mono text-xs tabular-nums text-[var(--muted)]/70">
                POST {String(post.order).padStart(2, "0")}
              </span>
            </div>

            <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-[2.75rem]">
              {post.title}
            </h1>

            {post.dek && (
              <p className="mt-5 text-pretty text-xl italic leading-8 text-[var(--muted)]">
                {post.dek}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
              <span className="text-[var(--foreground)]">{post.author}</span>
              <span aria-hidden>·</span>
              <span>{post.authorRole}</span>
              {post.readTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.readTime}</span>
                </>
              )}
            </div>
          </header>

          <PostBody content={post.content} />

          {post.references && (
            <footer className="mt-16 border-t border-[var(--separator)] pt-8">
              <h2 className="mb-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                Referencias
              </h2>
              <p className="font-mono text-[0.8rem] leading-6 text-[var(--muted)]">
                {post.references}
              </p>
            </footer>
          )}
        </article>

        {/* Footer nav */}
        <div className="mt-16 border-t border-[var(--separator)] pt-8">
          <Link
            href="/blog"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ← Ver todos los artículos
          </Link>
        </div>
      </main>
    </>
  );
}
