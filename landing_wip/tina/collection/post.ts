import type { Collection } from 'tinacms';

// Mirrors the frontmatter that lib/blog.ts reads (gray-matter) and that
// app/blog/post-body.tsx renders. Field `name`s MUST match those keys, or
// the existing site stops reading them. Body stays standard markdown so
// react-markdown + remark-gfm keep rendering it unchanged.
const Post: Collection = {
  label: 'Posts del Blog',
  name: 'post',
  path: 'content/blog',
  format: 'md',
  ui: {
    // Preview link from the editor → strip the optional "NN-" filename prefix,
    // same rule as fileToSlug() in lib/blog.ts.
    router: ({ document }) =>
      `/blog/${document._sys.filename.replace(/^\d+-/, '')}`,
  },
  fields: [
    {
      type: 'string',
      label: 'Título',
      name: 'title',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      label: 'Bajada',
      name: 'dek',
      description: 'Subtítulo / resumen — se muestra bajo el título y en las tarjetas.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      label: 'Categoría',
      name: 'category',
    },
    {
      type: 'string',
      label: 'Autor',
      name: 'author',
    },
    {
      type: 'string',
      label: 'Rol del autor',
      name: 'authorRole',
    },
    {
      type: 'number',
      label: 'Orden',
      name: 'order',
      description: 'Controla el orden en el índice del blog (menor primero).',
    },
    {
      type: 'string',
      label: 'Tiempo de lectura',
      name: 'readTime',
      description: 'Opcional. Ej: "5 min".',
    },
    {
      type: 'string',
      label: 'Referencias',
      name: 'references',
      description: 'Cita(s) al pie del artículo.',
      ui: { component: 'textarea' },
    },
    {
      type: 'rich-text',
      label: 'Contenido',
      name: 'body',
      isBody: true,
    },
  ],
};

export default Post;
