import { Dialog, useQuasar } from 'quasar'
import { exportFile as platformExportFile } from 'src/utils/platform-api'
import { ref } from 'vue'

/**
 * Export dialog as HTML or Markdown.
 * HTML = self-contained page with KaTeX CDN + basic styling.
 * Markdown = raw source for backup/AI import.
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

  function buildHtml(rawMarkdown: string, title: string): string {
    const mdJson = JSON.stringify(rawMarkdown)
    const dateStr = new Date().toLocaleString('zh-CN')
    const sc = 'script'
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<${sc} defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></${sc}>
<${sc} defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});"></${sc}>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;line-height:1.7;color:#333;max-width:800px;margin:0 auto;padding:20px;background:#f5f5f5}
.wrap{background:#fff;padding:24px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
h1{font-size:20px;margin-bottom:4px}
.meta{color:#999;font-size:12px;margin-bottom:16px}
pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px}
code{font-family:Menlo,monospace;background:#eee;padding:2px 4px;border-radius:3px;font-size:13px}
pre code{background:none;padding:0}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:14px}
th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
th{background:#f8f8f8;font-weight:600}
blockquote{border-left:3px solid #007bff;margin:8px 0;padding-left:14px;color:#666}
img{max-width:100%;border-radius:6px}
hr{border:0;border-top:1px solid #eee;margin:16px 0}
</style>
</head>
<body>
<div class="wrap">
<h1>${title}</h1>
<p class="meta">AIaW \u5BF9\u8BDD\u5BFC\u51FA \xB7 ${dateStr}</p>
<hr>
<div id="md-content"></div>
</div>
<${sc}>
(function(){
var md=${mdJson};
var el=document.getElementById('md-content');
var h=md
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g,'<pre><code>$1</code></pre>')
.replace(/\`([^\`]+)\`/g,'<code>$1</code>')
.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
.replace(/\\*(.+?)\\*/g,'<em>$1</em>')
.replace(/^### (.+)$/gm,'<h3>$1</h3>')
.replace(/^## (.+)$/gm,'<h2>$1</h2>')
.replace(/^# (.+)$/gm,'<h1>$1</h1>')
.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
.replace(/\\!\\[([^\\]]*)\\]\\(([^)]+)\\)/g,'<img alt="$1" src="$2">')
.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href="$2">$1</a>')
.replace(/^---$/gm,'<hr>');
el.innerHTML=h;
})();
</${sc}>
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

    const output = format === 'html'
      ? buildHtml(rawMarkdown, `AIaW_${safe}`)
      : rawMarkdown

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
      ok: { label: '确认导出', unelevated: true },
    }).onOk((format: 'html' | 'md') => {
      doExport(rawMarkdown, format)
    })
  }

  return { exportToPDF, exporting }
}
