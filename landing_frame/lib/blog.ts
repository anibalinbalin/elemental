import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const BLOG_DIR = join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  dek: string;
  category: string;
  author: string;
  authorRole: string;
  readTime?: string;
  order: number;
  references: string;
};

export type Post = PostMeta & { content: string };

function fileToSlug(file: string): string {
  // strip leading "NN-" and ".md"
  return file.replace(/\.md$/, "").replace(/^\d+-/, "");
}

export function getAllPosts(): Post[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = readFileSync(join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);
    return {
      slug: fileToSlug(file),
      title: data.title ?? "",
      dek: data.dek ?? "",
      category: data.category ?? "",
      author: data.author ?? "",
      authorRole: data.authorRole ?? "",
      readTime: data.readTime || undefined,
      order: data.order ?? 0,
      references: data.references ?? "",
      content: content.trim(),
    } satisfies Post;
  });
  return posts.sort((a, b) => a.order - b.order);
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
