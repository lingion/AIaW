import { config, MdPreviewProps, XSSPlugin } from 'md-editor-v3'
import { useQuasar } from 'quasar'
import router from 'src/router'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { computed } from 'vue'
import LinkAttr from 'markdown-it-link-attributes'
import Footnote from 'markdown-it-footnote'
import 'md-editor-v3/lib/preview.css'

function normalizeMathMiddleDot(mathContent: string) {
  let result = ''
  let index = 0

  while (index < mathContent.length) {
    if (mathContent.startsWith('\\text{', index)) {
      const textStart = index + 6
      let cursor = textStart
      let depth = 1

      while (cursor < mathContent.length && depth > 0) {
        const current = mathContent[cursor]
        if (current === '{') {
          depth += 1
        } else if (current === '}') {
          depth -= 1
        }
        cursor += 1
      }

      if (depth > 0) {
        result += mathContent.slice(index)
        break
      }

      const textContent = mathContent.slice(textStart, cursor - 1)
      result += textContent
        .split('·')
        .map(segment => `\\text{${segment}}`)
        .join('\\cdot ')
      index = cursor
      continue
    }

    const current = mathContent[index]
    if (current === '·') {
      result += '\\cdot '
      index += 1
      continue
    }

    result += current
    index += 1
  }

  return result
}

function replaceMathMiddleDot(source: string) {
  let result = ''
  let index = 0
  const patterns = [
    { open: '$$', close: '$$' },
    { open: '\\[', close: '\\]' },
    { open: '\\(', close: '\\)' },
    { open: '$', close: '$' }
  ]

  while (index < source.length) {
    const matched = patterns.find(({ open }) => source.startsWith(open, index))
    if (!matched) {
      result += source[index]
      index += 1
      continue
    }

    const { open, close } = matched
    const end = source.indexOf(close, index + open.length)
    if (end === -1) {
      result += source[index]
      index += 1
      continue
    }

    const mathContent = normalizeMathMiddleDot(source.slice(index + open.length, end))
    result += `${open}${mathContent}${close}`
    index = end + close.length
  }

  return result
}

config({
  editorConfig: {
    languageUserDefined: {
      'zh-CN': {
        copyCode: {
          text: 'content_copy',
          successTips: 'check',
          failTips: 'error'
        }
      }
    }
  },
  markdownItConfig(md) {
    md.set({ breaks: true })
    const originalRender = md.render.bind(md)
    md.render = (source, env) => originalRender(replaceMathMiddleDot(source), env)
  },
  katexConfig(baseConfig) {
    return {
      ...baseConfig,
      strict(errorCode) {
        if (errorCode === 'unicodeTextInMathMode') {
          return 'ignore'
        }
        return 'warn'
      }
    }
  },
  markdownItPlugins(plugins) {
    return [
      ...plugins,
      {
        type: 'xss',
        plugin: XSSPlugin,
        options: {}
      },
      {
        type: 'linkAttr',
        plugin: LinkAttr,
        options: {
          matcher(href: string) {
            // 如果使用了markdown-it-anchor
            // 应该忽略标题头部的锚点链接
            return !href.startsWith('#')
          },
          attrs: {
            target: '_blank'
          }
        }
      },
      {
        type: 'footnote',
        plugin: Footnote,
        options: {}
      }
    ]
  },
  editorExtensions: {
    mermaid: {
      js: 'https://unpkg.com/mermaid@11.12.0/dist/mermaid.min.js'
    }
  }
})

class RouterLink extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = '<span><slot></slot></span>'
  }

  connectedCallback() {
    this.shadowRoot.querySelector('span').addEventListener('click', this.onClick.bind(this))
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('span').removeEventListener('click', this.onClick.bind(this))
  }

  onClick(event) {
    event.preventDefault()
    const path = this.getAttribute('to')
    router.push(path)
  }
}

customElements.define('router-link', RouterLink)

export function useMdPreviewProps() {
  const $q = useQuasar()
  const { perfs } = useUserPerfsStore()
  return computed<Partial<MdPreviewProps>>(() => ({
    theme: $q.dark.isActive ? 'dark' : 'light',
    previewTheme: perfs.mdPreviewTheme,
    codeTheme: perfs.mdCodeTheme,
    autoFoldThreshold: perfs.mdAutoFoldThreshold ?? Infinity,
    noMermaid: perfs.mdNoMermaid,
    mdHeadingId: (text, level, index) => `${text}-${level}-${index}`
  }))
}
