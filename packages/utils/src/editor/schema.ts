import { Schema, MarkSpec } from '@tiptap/pm/model';

/// Document schema for the data model used by CommonMark.
export const schema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },

    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },

    blockquote: {
      content: 'block+',
      group: 'block',
      parseDOM: [{ tag: 'blockquote' }],
      toDOM() {
        return ['blockquote', 0];
      },
    },

    horizontalRule: {
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM() {
        return ['div', ['hr']];
      },
    },

    heading: {
      attrs: { level: { default: 1 } },
      content: '(text | image)*',
      group: 'block',
      defining: true,
      parseDOM: [
        { tag: 'h1', attrs: { level: 1 } },
        { tag: 'h2', attrs: { level: 2 } },
        { tag: 'h3', attrs: { level: 3 } },
        { tag: 'h4', attrs: { level: 4 } },
        { tag: 'h5', attrs: { level: 5 } },
        { tag: 'h6', attrs: { level: 6 } },
      ],
      toDOM(node) {
        return [`h${node.attrs.level}`, 0];
      },
    },

    codeBlock: {
      content: 'text*',
      group: 'block',
      code: true,
      defining: true,
      marks: '',
      attrs: { params: { default: '' } },
      parseDOM: [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (node) => ({
            params: (node as HTMLElement).getAttribute('data-params') || '',
          }),
        },
      ],
      toDOM(node) {
        return ['pre', node.attrs.params ? { 'data-params': node.attrs.params } : {}, ['code', 0]];
      },
    },

    orderedList: {
      content: 'listItem+',
      group: 'block',
      attrs: { order: { default: 1 }, tight: { default: false } },
      parseDOM: [
        {
          tag: 'ol',
          getAttrs(dom) {
            return {
              order: (dom as HTMLElement).hasAttribute('start')
                ? +(dom as HTMLElement).getAttribute('start')!
                : 1,
              tight: (dom as HTMLElement).hasAttribute('data-tight'),
            };
          },
        },
      ],
      toDOM(node) {
        return [
          'ol',
          {
            start: node.attrs.order === 1 ? null : node.attrs.order,
            'data-tight': node.attrs.tight ? 'true' : null,
          },
          0,
        ];
      },
    },

    bulletList: {
      content: 'listItem+',
      group: 'block',
      attrs: { tight: { default: false } },
      parseDOM: [
        {
          tag: 'ul',
          getAttrs: (dom) => ({
            tight: (dom as HTMLElement).hasAttribute('data-tight'),
          }),
        },
      ],
      toDOM(node) {
        return ['ul', { 'data-tight': node.attrs.tight ? 'true' : null }, 0];
      },
    },

    listItem: {
      content: 'block+',
      defining: true,
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0];
      },
    },

    taskList: {
      content: 'taskItem+',
      group: 'block list',
      attrs: { tight: { default: false } },
      parseDOM: [
        {
          tag: 'ul',
          getAttrs: (dom) => ({
            tight: (dom as HTMLElement).hasAttribute('data-tight'),
          }),
        },
      ],
      toDOM(node) {
        return ['ul', { 'data-tight': node.attrs.tight ? 'true' : null }, 0];
      },
    },

    taskItem: {
      content: 'block+',
      defining: true,
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0];
      },
    },

    text: {
      group: 'inline',
    },

    image: {
      inline: true,
      attrs: {
        src: {},
        alt: { default: null },
        title: { default: null },
        width: { default: null },
        height: { default: null },
      },
      group: 'inline',
      draggable: true,
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs(dom) {
            return {
              src: (dom as HTMLElement).getAttribute('src'),
              title: (dom as HTMLElement).getAttribute('title'),
              alt: (dom as HTMLElement).getAttribute('alt'),
              width: (dom as HTMLElement).getAttribute('width'),
              height: (dom as HTMLElement).getAttribute('height'),
            };
          },
        },
      ],
      toDOM(node) {
        return ['img', node.attrs];
      },
    },

    hardBreak: {
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM() {
        return ['br'];
      },
    },

    table: {
      content: 'tableRow+',
      group: 'block',
      tableRole: 'table',
      isolating: true,
      parseDOM: [{ tag: 'table' }],
      toDOM() {
        return ['table', 0];
      },
    },

    tableRow: {
      content: '(tableCell | tableHeader)*',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr' }],
      toDOM() {
        return ['tr', 0];
      },
    },

    tableHeader: {
      content: 'block+',
      tableRole: 'header_cell',
      isolating: true,
      parseDOM: [{ tag: 'th' }],
      toDOM() {
        return ['th', 0];
      },
    },

    tableCell: {
      content: 'block+',
      tableRole: 'cell',
      isolating: true,
      attrs: {
        header: { default: false },
        align: { default: null },
      },
      parseDOM: [{ tag: 'td' }],
      toDOM(node) {
        return [node.attrs.header ? 'th' : 'td', 0];
      },
    },
  },

  marks: {
    italic: {
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
        { style: 'font-style=normal', clearMark: (m) => m.type.name === 'em' },
      ],
      toDOM() {
        return ['em'];
      },
    },

    bold: {
      parseDOM: [
        { tag: 'strong' },
        {
          tag: 'b',
          getAttrs: (node) => node.style.fontWeight !== 'normal' && null,
        },
        { style: 'font-weight=400', clearMark: (m) => m.type.name === 'strong' },
        {
          style: 'font-weight',
          getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        },
      ],
      toDOM() {
        return ['strong'];
      },
    } as MarkSpec,

    link: {
      attrs: {
        href: {},
        title: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom) {
            return {
              href: (dom as HTMLElement).getAttribute('href'),
              title: dom.getAttribute('title'),
            };
          },
        },
      ],
      toDOM(node) {
        return ['a', node.attrs];
      },
    },

    code: {
      parseDOM: [{ tag: 'code' }],
      toDOM() {
        return ['code'];
      },
    },
  },
});
