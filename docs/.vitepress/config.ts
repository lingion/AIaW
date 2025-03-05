import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "AI as Workspace",
  description: "新一代 LLM 客户端",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '使用文档', link: '/usage/' },
      { text: '自部署指南', link: '/self-host/' },
      { text: '开始使用', link: 'https://aiaw.app' }
    ],

    sidebar: [
      {
        text: '使用文档',
        items: [
          { text: '功能概览', link: '/usage/' },
          { text: 'Artifacts', link: '/usage/artifacts' },
          { text: '文件解析', link: '/usage/file-parse' },
          { text: '多模态', link: '/usage/multimodal' },
          { text: '跨平台', link: '/usage/cross-platform' },
          { text: '插件系统', link: '/usage/plugins' },
          { text: 'MCP 插件', link: '/usage/mcp' },
          { text: '插件配置与开发', link: '/usage/plugin-dev' },
          { text: '提示词变量', link: '/usage/prompt-vars' },
          { text: '工作区', link: '/usage/workspaces' },
          { text: '助手', link: '/usage/assistants' },
          { text: '个性化设置', link: '/usage/personalization' },
          { text: '数据与同步', link: '/usage/data-sync' },
          { text: '模型服务', link: '/usage/model-service' },
          { text: '中转站对接', link: '/usage/share-link' },
          { text: '常见问题', link: '/usage/common-issues' }
        ]
      },
      {
        text: '自部署指南',
        items: [
          { text: 'Docker 快速部署', link: '/self-host/' },
          { text: '进阶部署', link: '/self-host/advanced' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NitroRCr/AIaW' }
    ],
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          /**
           * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
           */
          options: {
            /* ... */
          },
          /**
           * @type {import('minisearch').SearchOptions}
           * @default
           * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
           */
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },
        detailedView: true
      }
    },
    outline: {
      level: [2, 3]
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/icon-256x256.png' }]
  ]
})
