import { Dialog, useQuasar } from 'quasar'
import { exportFile as platformExportFile } from 'src/utils/platform-api'
import { ref } from 'vue'

/**
 * Export dialog as HTML or Markdown.
 * HTML: grabs already-rendered HTML from md-preview DOM + inlines styles.
 * Markdown: raw source for backup/AI import.
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

  function buildHtml(renderedHtml: string, title: string): string {
    const dateStr = new Date().toLocaleString('zh-CN')
    // Get app primary color for theming
    const primaryColor = typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim() || '#1976D2'
      : '#1976D2'

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
:root{--theme:${primaryColor}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.7;color:#222;background:#f8f9fa;padding:24px 16px}
.wrap{background:#fff;max-width:820px;margin:0 auto;padding:32px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.04);border:1px solid #ebedf0}
.header{margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid var(--theme)}
.header h1{font-size:22px;color:#1a1a1a;margin-bottom:4px}
.header .meta{color:#999;font-size:12px}
/* md-editor-v3 rendered content styles */
.md-editor-preview{font-size:15px;word-break:break-word}
.md-editor-preview h1,.md-editor-preview h2,.md-editor-preview h3,.md-editor-preview h4{margin:16px 0 8px;color:#1a1a1a}
.md-editor-preview p{margin:8px 0}
.md-editor-preview pre{background:#f6f8fa;padding:12px 16px;border-radius:8px;overflow-x:auto;font-size:13px;margin:12px 0}
.md-editor-preview code{font-family:Menlo,Consolas,monospace;background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:13px}
.md-editor-preview pre code{background:none;padding:0}
.md-editor-preview table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px}
.md-editor-preview th,.md-editor-preview td{border:1px solid #ddd;padding:8px 12px;text-align:left}
.md-editor-preview th{background:#f5f7fa;font-weight:600}
.md-editor-preview blockquote{border-left:4px solid var(--theme);margin:12px 0;padding:8px 16px;color:#666;background:#f9f9f9;border-radius:0 8px 8px 0}
.md-editor-preview img{max-width:100%;border-radius:8px;margin:8px 0}
.md-editor-preview hr{border:0;border-top:1px solid #eee;margin:16px 0}
.md-editor-preview ul,.md-editor-preview ol{padding-left:24px;margin:8px 0}
.md-editor-preview li{margin:4px 0}
/* KaTeX formula styles */
.katex{font-size:1.1em}
.katex-display{margin:12px 0;overflow-x:auto}
</style>
</head>
<body>
<div class="wrap">
<div class="header">
<h1>${title}</h1>
<div class="meta">AIaW \u5BF9\u8BDD\u5BFC\u51FA \xB7 ${dateStr}</div>
</div>
<div class="md-editor-preview">
${renderedHtml}
</div>
</div>
</body>
</html>`
  }

  function doExport(rawMarkdown: string, format: 'html' | 'md') {
    if (exporting.value) return
    exporting.value = true

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
      // Grab already-rendered HTML from md-preview DOM
      const previewEl = document.querySelector('.md-editor-preview') as HTMLElement | null
      const renderedHtml = previewEl?.innerHTML || '<p>' + rawMarkdown.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</p>'
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
  }

  function exportToPDF(rawMarkdown: string, _title?: string) {
    if (exporting.value) return

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
      cancel: { label: '取消', flat: true },
      ok: { label: '确认导出', color: 'primary', unelevated: true },
    }).onOk((format: 'html' | 'md') => {
      doExport(rawMarkdown, format)
    })
  }

  return { exportToPDF, exporting }
}
