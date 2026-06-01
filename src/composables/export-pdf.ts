import { useQuasar } from 'quasar'
import { IsCapacitor, exportFile as platformExportFile } from 'src/utils/platform-api'
import { ref } from 'vue'

/**
 * Export dialog content as text file.
 *
 * Why not PDF?
 * - html-to-image: crashes on mobile WebView (DOM clone death)
 * - jsPDF: no Chinese font support
 * - window.print(): no-op in Capacitor WebView
 * - @capgo/capacitor-printer: launches hidden WebView → deadlock
 *
 * .txt export is zero-dependency, instant, CJK-safe, and uses the same
 * exportFile() path that image download already proved works.
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
        $q.notify({ message: 'No content to export', timeout: 2000 })
        return
      }

      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      const output = `AIaW 对话导出\n导出时间: ${timestamp}\n${'─'.repeat(40)}\n\n${cleanText}`

      const encoder = new TextEncoder()
      const buffer = encoder.encode(output)

      await platformExportFile(`${filename}.txt`, buffer)

      $q.notify({ message: '导出成功', timeout: 2000 })
    } catch (err) {
      console.error('Export failed:', err)
      $q.notify({
        message: `Export failed: ${err instanceof Error ? err.message : String(err)}`,
        type: 'negative',
        timeout: 3000
      })
    } finally {
      exporting.value = false
    }
  }

  return { exportToPDF, exporting }
}
