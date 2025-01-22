import { config, MdPreviewProps } from 'md-editor-v3'
import { useQuasar } from 'quasar'
import router from 'src/router'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { computed } from 'vue'

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
