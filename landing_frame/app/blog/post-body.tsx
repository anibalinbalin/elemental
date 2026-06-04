import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-14 mb-4 text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[1.6rem]">
      {children}
    </h2>
  ),
  p: ({ children }) => (
    <p className="my-5 text-[1.0625rem] leading-8 text-[var(--foreground)]">
      {children}
    </p>
  ),
  // "Evidencia" blockquotes → editorial callouts. First <strong> is the label,
  // set in mono uppercase (monochrome — authority via type, not color).
  blockquote: ({ children }) => (
    <blockquote className="my-8 rounded-r-lg border-l-2 border-[var(--foreground)] bg-[var(--surface-secondary)] py-5 pl-6 pr-6 [&>p+p]:mt-3 [&>p]:my-0 [&>p]:text-[1rem] [&>p]:leading-7 [&>p]:text-[var(--foreground)] [&>p>strong:first-child]:mb-1.5 [&>p>strong:first-child]:block [&>p>strong:first-child]:font-mono [&>p>strong:first-child]:text-[0.68rem] [&>p>strong:first-child]:font-medium [&>p>strong:first-child]:uppercase [&>p>strong:first-child]:tracking-[0.16em] [&>p>strong:first-child]:text-[var(--muted)]">
      {children}
    </blockquote>
  ),
  ol: ({ children }) => (
    <ol className="my-6 list-decimal space-y-3 pl-6 marker:font-medium marker:text-[var(--muted)] [&>li]:pl-1.5 [&>li]:text-[1.0625rem] [&>li]:leading-7 [&>li]:text-[var(--foreground)]">
      {children}
    </ol>
  ),
  ul: ({ children }) => (
    <ul className="my-6 list-disc space-y-3 pl-6 marker:text-[var(--muted)] [&>li]:pl-1.5 [&>li]:text-[1.0625rem] [&>li]:leading-7 [&>li]:text-[var(--foreground)]">
      {children}
    </ul>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--foreground)]">{children}</strong>
  ),
  // Standalone italic lines in the source read as editorial pull-quotes.
  em: ({ children }) => <em className="italic text-[var(--muted)]">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="underline decoration-[var(--muted)] underline-offset-2 transition-colors hover:decoration-[var(--foreground)]"
    >
      {children}
    </a>
  ),
};

export function PostBody({ content }: { content: string }) {
  return (
    <div className="text-[var(--foreground)]">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
