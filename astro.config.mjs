import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://osrhyc.github.io',
  integrations: [
    starlight({
      title: '一手笔记',
      description: '面向长期阅读、量化学习和每日信息整理的知识库。',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/starlight.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/osrhyc/FirsthandNotes',
        },
      ],
      sidebar: [
        { slug: 'index', label: '首页' },
        {
          label: '每日简报',
          items: [{ autogenerate: { directory: 'daily', collapsed: false } }],
        },
        {
          label: '量化学堂',
          items: [{ autogenerate: { directory: 'quant', collapsed: true } }],
        },
        {
          label: '人物与事件',
          collapsed: true,
          items: [{ autogenerate: { directory: 'stories', collapsed: true } }],
        },
        {
          label: '读书笔记',
          collapsed: true,
          items: [{ autogenerate: { directory: 'books', collapsed: true } }],
        },
        {
          label: '名词手册',
          collapsed: true,
          items: [{ autogenerate: { directory: 'glossary', collapsed: true } }],
        },
      ],
    }),
  ],
});
