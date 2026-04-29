/**
 * Code Execution Plugin — runs Python code via Pyodide (WebAssembly) entirely in the browser/WebView.
 * No backend required. Supports matplotlib, numpy, pandas via Pyodide packages.
 */
import { Object as TObject, String as TString, Optional as TOptional } from '@sinclair/typebox'
import { Plugin, PluginApi, PluginData } from './types'

let _pyodide: any = null
let _loadPromise: Promise<any> | null = null
let _scriptPromise: Promise<void> | null = null

function ensurePyodideScript(): Promise<void> {
  if ((window as any).loadPyodide) return Promise.resolve()
  if (_scriptPromise) return _scriptPromise

  _scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide="1"]') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Pyodide script')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
    script.async = true
    script.defer = true
    script.dataset.pyodide = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'))
    document.head.appendChild(script)
  })

  return _scriptPromise
}

async function getPyodide(): Promise<any> {
  if (_pyodide) return _pyodide
  if (_loadPromise) return _loadPromise

  _loadPromise = (async () => {
    await ensurePyodideScript()
    let retries = 0
    while (!(window as any).loadPyodide && retries < 40) {
      await new Promise(r => setTimeout(r, 250))
      retries++
    }
    if (!(window as any).loadPyodide) {
      throw new Error('Pyodide runtime not available after script load')
    }
    const pyodide = await (window as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    })
    _pyodide = pyodide
    return pyodide
  })()
  return _loadPromise
}

async function ensureCorePackages(pyodide: any, extra: string[] = []) {
  const wanted = ['micropip', 'numpy', 'matplotlib', ...extra].filter(Boolean)
  await pyodide.loadPackage(wanted)
}

const prompt = `<role>你是一个可以执行 Python 代码的 AI 助手。</role>

<tool name="aiaw-code-exec">
  <description>
    在本地执行 Python 代码并返回结果。基于 Pyodide (WebAssembly)，支持 matplotlib、numpy、pandas。
    代码在手机/浏览器本地执行，不需要服务器。
  </description>
  <guidelines>
    - 代码必须是完整的、可执行的 Python 代码
    - 如需画图：使用 matplotlib，调用 plt.show() 或保存图像
    - 首次执行会下载并初始化 Pyodide runtime，后续执行更快
    - 内置支持：numpy、matplotlib；其他内置包可通过 loadPackage 加载
    - 不支持：系统调用、真实 shell、原生 Python 扩展轮子
  </guidelines>
</tool>
`

const codeExecApi: PluginApi = {
  type: 'tool',
  name: 'exec',
  description: 'Execute Python code locally via Pyodide (WebAssembly). No server needed.',
  prompt,
  parameters: TObject({
    code: TString({ description: 'Python code to execute' }),
    packages: TOptional(TString({ description: 'Comma-separated extra built-in Pyodide packages', default: '' }))
  }),
  async execute(args) {
    try {
      const pyodide = await getPyodide()
      const extraPackages = (args.packages || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)

      await ensureCorePackages(pyodide, extraPackages)

      const wrappedCode = `
import sys, io, json, base64
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture

import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt

# --- User code ---
${args.code}
# --- End user code ---

sys.stdout = sys.__stdout__
_result_stdout = _stdout_capture.getvalue()
_result_images = []

for _i in plt.get_fignums():
    _fig = plt.figure(_i)
    _buf = io.BytesIO()
    _fig.savefig(_buf, format='png', dpi=150, bbox_inches='tight')
    _buf.seek(0)
    _img_b64 = base64.b64encode(_buf.read()).decode('ascii')
    _result_images.append({'name': f'plot_{_i}.png', 'data': _img_b64})

plt.close('all')
json.dumps({'stdout': _result_stdout, 'images': _result_images})
`

      const resultStr = await pyodide.runPythonAsync(wrappedCode)
      const result = JSON.parse(resultStr)
      const output: any[] = []

      if (result.stdout) {
        output.push({ type: 'text' as const, contentText: result.stdout })
      }

      if (result.images && result.images.length > 0) {
        for (const img of result.images) {
          output.push({
            type: 'file' as const,
            name: img.name,
            mimeType: 'image/png',
            contentBuffer: base64ToArrayBuffer(img.data)
          })
        }
      }

      return output.length > 0 ? output : [{ type: 'text' as const, contentText: '(no output)' }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error: ${e?.message || String(e)}` }]
    }
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

const plugin: Plugin = {
  id: 'aiaw-code-exec',
  type: 'builtin',
  available: true,
  apis: [codeExecApi],
  fileparsers: [],
  settings: TObject({}),
  title: 'Code Execution (Pyodide)',
  description: 'Execute Python code locally using Pyodide WebAssembly. Supports matplotlib for plotting. No server needed — runs entirely on device.',
  prompt
}

export const defaultData: PluginData = {
  settings: {},
  avatar: { type: 'icon', icon: 'sym_o_code', hue: 120 },
  fileparsers: {}
}

export default { plugin, defaultData }
