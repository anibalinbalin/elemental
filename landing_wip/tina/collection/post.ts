import type { Collection } from 'tinacms';

// Keep these in sync with the categories actually used across the blog. A
// fixed list (vs. free text) keeps the tags consistent on the index/cards.
const CATEGORIES = ['Intestino', 'Cerebro', 'Piel', 'Ciencia', 'Deporte', 'Producto'];

// Field `name`s MUST stay flat and match what lib/blog.ts reads via gray-matter
// (title/dek/category/author/authorRole/order/readTime/references) + the md
// body. Do NOT wrap them in an `object` field — that nests the YAML and breaks
// both the existing posts and the frontend reader.
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
  // Pre-fill author + a sane order on NEW posts so the non-technical editor
  // doesn't retype boilerplate every time. (Collection-level, NOT ui — the
  // ui-level form is deprecated/untyped.)
  defaultItem: () => ({
    author: 'Lc. Laura Fuentes',
    authorRole: 'Nutricionista',
    order: 99,
  }),
  fields: [
    {
      type: 'string',
      label: 'Título',
      name: 'title',
      isTitle: true,
      required: true,
      description: 'El titular del post.',
    },
    {
      type: 'string',
      label: 'Bajada',
      name: 'dek',
      required: true,
      description:
        'Resumen de 1–2 líneas. Se muestra bajo el título y en las tarjetas del blog.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      label: 'Categoría',
      name: 'category',
      required: true,
      options: CATEGORIES,
      description:
        'Elegí una de la lista — mantiene las etiquetas consistentes en todo el blog.',
    },
    {
      type: 'number',
      label: 'Orden',
      name: 'order',
      required: true,
      description:
        'Posición en el índice: 1 aparece primero, los números más altos van después.',
    },
    {
      type: 'string',
      label: 'Tiempo de lectura',
      name: 'readTime',
      description: 'Opcional. Ej.: "5 min". Dejalo vacío para no mostrarlo.',
    },
    {
      type: 'string',
      label: 'Referencias',
      name: 'references',
      description: 'Cita(s) científicas que aparecen al pie del artículo.',
      ui: { component: 'textarea' },
    },
    {
      type: 'rich-text',
      label: 'Contenido',
      name: 'body',
      isBody: true,
      description:
        'El cuerpo del artículo. Usá los títulos (##) y la cita (>) para resaltar la evidencia.',
    },
    {
      type: 'string',
      label: 'Autor',
      name: 'author',
      description: 'Se completa solo en posts nuevos.',
    },
    {
      type: 'string',
      label: 'Rol del autor',
      name: 'authorRole',
    },
  ],
};

export default Post;
