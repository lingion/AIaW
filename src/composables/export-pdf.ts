import { useQuasar } from 'quasar'
import { IsCapacitor, exportFile as platformExportFile } from 'src/utils/platform-api'
import { ref } from 'vue'

/**
 * Export dialog content as text file.
 * Unified with image save: AIaW_Chat_<title>_<timestamp>.txt → Documents/AiaW/
 */
export function useExportPDF() {
  const $q = useQuasar()
  const exporting = ref(false)

  async function exportToPDF(
    element: HTMLElement,
    filename = 'dialog-export'
  ) {
    if (exporting.value) return
    exporting.value = true

    try {
      const cleanText = element.innerText || ''
      if (!cleanText.trim()) {
        $q.notify({ message: '没有可导出的内容', timeout: 1500 })
        return
      }

      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      const output = `AIaW 对话导出\n导出时间: ${timestamp}\n${'─'.repeat(40)}\n\n${cleanText}`

      const encoder = new TextEncoder()
      const buffer = encoder.encode(output)

      // Unified timestamp filename
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
      const safeTitle = (filename || 'Chat').replace(/[\/\\:*?"<>| ]/g, '_').substring(0, 20)
      const txtName = `AIaW_${safeTitle}_${ts}.txt`

      await platformExportFile(txtName, buffer)

      $q.notify({
        type: 'positive',
        message: '文本导出成功',
        caption: `已保存至: Documents/AiaW/${txtName}`,
        position: 'top',
        timeout: 1200,
      })
    } catch (err) {
      console.error('Export failed:', err)
      $q.notify({
        type: 'negative',
        message: '文本导出失败',
        caption: err instanceof Error ? err.message : String(err),
        position: 'top',
        timeout: 2000,
      })
    } finally {
      exporting.value = false
    }
  }

  return { exportToPDF, exporting }
}
