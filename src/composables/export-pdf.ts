import { Dialog, useQuasar } from 'quasar'
import { exportFile as platformExportFile } from 'src/utils/platform-api'
import { ref } from 'vue'

/**
 * Export dialog as HTML or Markdown.
 * HTML: grabs rendered HTML from md-preview DOM AFTER user picks format.
 * Markdown: raw source for backup/Ai import.
 *
 * Key: Dialog always shows first. DOM capture only runs inside onOk callback.
 */
export function useExportPDF() {
  const $q = useQuasar()
  const exporting = ref(false)

  function timestampStr(): string {
    const now = new Date()
    const p = (n: number) => String(n).padStart(2, '0')
    return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`
  }

  function safeName(raw: string): string {
    return raw.replace(/[\/\\:*?"<>| \-]/g, '_').substring(0, 15) || 'Chat'
  }

  function getRenderedHtml(mdId: string, rawFallback: string): string {
    try {
      const el = document.getElementById(mdId)
      if (!el) return ''
      const preview = el.querySelector('.md-editor-preview') as HTMLElement | null
        || el.querySelector('.md-preview') as HTMLElement | null
      return preview?.innerHTML || ''
    } catch (e) {
      console.warn('[export] DOM capture failed:', e)
      return ''
    }
  }

  function buildHtml(renderedHtml: string, title: string): string {
    const dateStr = new Date().toLocaleString('zh-CN')
    const primaryColor = typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim() || '#1976D2'
      : '#1976D2'

    // Inline KaTeX CSS from loaded page for offline support
    let katexCss = ''
    if (typeof document !== 'undefined') {
      const sheets = document.querySelectorAll('link[rel="stylesheet"]')
      for (const s of sheets) {
        const href = (s as HTMLLinkElement).href || ''
        if (href.includes('katex')) {
          try {
            const sheet = (s as HTMLLinkElement).sheet
            if (sheet && sheet.cssRules) {
              katexCss = Array.from(sheet.cssRules).map(r => r.cssText).join('\n')
              break
            }
          } catch { /* cross-origin */ }
        }
      }
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
:root{--theme-color:${primaryColor}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.7;color:#1d2129;background:#f8f9fa;padding:24px 16px}
.wrap{background:#fff;max-width:820px;margin:0 auto;padding:32px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.04);border:1px solid #ebedf0}
h1{font-size:24px;color:#1a1a1a;margin-bottom:8px;font-weight:700}
.meta{color:#86909c;font-size:13px;margin-bottom:24px;display:flex;gap:12px}
hr{border:0;border-top:1px solid #e5e6eb;margin:20px 0}
.md-editor-preview{font-size:15px;word-break:break-word}
.md-editor-preview h1,.md-editor-preview h2,.md-editor-preview h3,.md-editor-preview h4{margin:16px 0 8px;color:#1d2129}
.md-editor-preview p{margin:8px 0}
.md-editor-preview pre{background:#f4f5f5;padding:16px;border-radius:8px;overflow-x:auto;font-family:"Fira Code",Consolas,Monaco,monospace;font-size:13px;margin:14px 0}
.md-editor-preview code{font-family:monospace;background:#f4f5f5;color:#d91d1d;padding:2px 6px;border-radius:4px;font-size:13px}
.md-editor-preview pre code{background:none;color:inherit;padding:0}
.md-editor-preview table{width:100%!important;border-collapse:collapse!important;margin:18px 0!important;overflow-x:auto;display:block}
.md-editor-preview th,.md-editor-preview td{border:1px solid #e5e6eb!important;padding:12px 16px!important;text-align:left;font-size:14px;line-height:1.6}
.md-editor-preview th{background:#f4f5f5!important;font-weight:600;color:#1d2129}
.md-editor-preview tr:nth-child(even){background:#fafafa}
.md-editor-preview blockquote{border-left:4px solid var(--theme-color);margin:16px 0;padding:4px 16px;color:#4e5969;background:#f7f8fa;border-radius:0 8px 8px 0}
.md-editor-preview img{max-width:100%;height:auto;border-radius:8px;margin:12px 0}
.md-editor-preview ul,.md-editor-preview ol{padding-left:24px;margin:8px 0}
.md-editor-preview li{margin:4px 0}
.md-editor-preview hr{border:0;border-top:1px solid #e5e6eb;margin:20px 0}
.katex{font-size:1.1em}
.katex-display{margin:12px 0;overflow-x:auto}
${katexCss}
</style>
</head>
<body>
<div class="wrap">
<h1>${title}</h1>
<div class="meta">
<span>\uD83D\uDCC4 HTML \u7F51\u9875\u683C\u5F0F</span>
<span>\uD83D\uDCC5 ${dateStr}</span>
</div>
<hr>
<div class="md-editor-preview">
${renderedHtml}
</div>
</div>
</body>
</html>`
  }

  function doExport(rawMarkdown: string, format: 'html' | 'md', mdId?: string) {
    if (exporting.value) return
    exporting.value = true

    try {
      if (!rawMarkdown.trim()) {
        $q.notify({ message: '没有可导出的内容', timeout: 1500 })
        exporting.value = false
        return
      }

      const ts = timestampStr()
      const displayTitle = rawMarkdown.trim().replace(/[#*\n\r]/g, '').substring(0, 8)
      const safe = safeName(displayTitle)
      const ext = format === 'html' ? 'html' : 'md'
      const fileName = `AIaW_${safe}_${ts}.${ext}`

      let output: string
      if (format === 'html') {
        let renderedHtml = ''
        if (mdId) {
          renderedHtml = getRenderedHtml(mdId, rawMarkdown)
        }
        // Fallback: if DOM capture failed, use raw markdown with basic escaping
        if (!renderedHtml) {
          renderedHtml = '<p>' + rawMarkdown.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</p>'
        }
        output = buildHtml(renderedHtml, `AIaW_${safe}`)
      } else {
        output = rawMarkdown
      }

      const encoder = new TextEncoder()
      const buffer = encoder.encode(output)

      platformExportFile(fileName, buffer).then(() => {
        const label = format === 'html' ? 'HTML网页' : 'Markdown'
        $q.notify({
          type: 'positive',
          message: `对话导出成功 (${label})`,
          caption: `已保存至: Documents/AiaW/${fileName}`,
          position: 'top',
          timeout: 1200,
        })
      }).catch((err: unknown) => {
        const errMsg = err instanceof Error ? err.message : String(err)
        $q.notify({
          type: 'negative',
          message: '对话导出失败',
          caption: errMsg,
          position: 'top',
          timeout: 2000,
        })
      }).finally(() => {
        exporting.value = false
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err)
      $q.notify({
        type: 'negative',
        message: '导出异常',
        caption: errMsg,
        position: 'top',
        timeout: 2000,
      })
      exporting.value = false
    }
  }

  function exportToPDF(rawMarkdown: string, mdId?: string) {
    if (exporting.value) return

    // Dialog shows FIRST — DOM capture only happens after user picks format
    Dialog.create({
      title: '选择导出格式',
      message: '请选择对话保存格式：',
      options: {
        type: 'radio',
        model: 'html',
        items: [
          { label: 'HTML 网页（推荐：浏览器秒开，公式表格完美保留）', value: 'html' },
          { label: 'Markdown 源码（专业：适合备份和导入其他工具）', value: 'md' },
        ],
      },
      cancel: { label: '取消', flat: true, color: 'grey' },
      ok: { label: '确认导出', color: 'primary', unelevated: true },
    }).onOk((format: 'html' | 'md') => {
      doExport(rawMarkdown, format, mdId)
    })
  }

  return { exportToPDF, exporting }
}
