/**
 * File System Plugin — stable full set.
 * Proven-good tools kept: read/write/append/copy/move/delete
 * Reworked conservatively: mkdir/list with maintained sandbox index.
 */
import { Object as TObject, String as TString, Optional as TOptional, Boolean as TBoolean } from '@sinclair/typebox'
import { Plugin, PluginApi, PluginData } from './types'
import { IsCapacitor } from './platform-api'
import { ShellExec } from 'capacitor-plugin-shell-exec'

const prompt = `<role>你是一个可以操作设备文件系统的 AI 助手。</role>

<tools>
<tool name="file-read"><description>读取设备上的文件内容</description></tool>
<tool name="file-write"><description>写入文件到设备。支持 append 追加。</description></tool>
<tool name="file-list"><description>列出目录内容（一层）</description></tool>
<tool name="file-delete"><description>删除文件或目录</description></tool>
<tool name="file-mkdir"><description>创建目录</description></tool>
<tool name="file-copy"><description>复制文件</description></tool>
<tool name="file-move"><description>移动/重命名文件</description></tool>
</tools>
`

type ResolvedPath = { dir: any, relativePath: string, displayPath: string }
type IndexEntry = { path: string, type: 'file' | 'directory' }
const SANDBOX_INDEX_KEY = 'aiaw_file_index_v2'

function normPath(p: string): string {
  return (p || '').replace(/\\/g, '/').replace(/\/+$/, '')
}

function loadIndex(): IndexEntry[] {
  try {
    const raw = localStorage.getItem(SANDBOX_INDEX_KEY)
    const arr = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr)) return []
    return arr
      .filter(x => x && typeof x.path === 'string' && (x.type === 'file' || x.type === 'directory'))
      .map(x => ({ path: normPath(x.path), type: x.type }))
  } catch {
    return []
  }
}
function saveIndex(entries: IndexEntry[]) {
  const uniq = new Map<string, IndexEntry>()
  for (const e of entries) uniq.set(`${e.type}:${normPath(e.path)}`, { path: normPath(e.path), type: e.type })
  localStorage.setItem(SANDBOX_INDEX_KEY, JSON.stringify(Array.from(uniq.values()).sort((a, b) => a.path.localeCompare(b.path))))
}
function addIndex(path: string, type: 'file' | 'directory') {
  const arr = loadIndex(); arr.push({ path: normPath(path), type }); saveIndex(arr)
}
function removeIndex(path: string) {
  const n = normPath(path)
  const arr = loadIndex().filter(e => e.path !== n && !e.path.startsWith(n + '/'))
  saveIndex(arr)
}
function ensureParentDirs(path: string) {
  const p = normPath(path)
  const parts = p.split('/').filter(Boolean)
  if (parts.length <= 1) return
  let acc = parts[0]
  for (let i = 1; i < parts.length; i++) {
    addIndex(acc, 'directory')
    acc += '/' + parts[i]
  }
  addIndex(parts.slice(0, -1).join('/'), 'directory')
}

function resolvePath(inputPath: string, Directory: any): ResolvedPath {
  const raw = normPath(inputPath || 'Documents')
  const path = raw || 'Documents'

  const prefixMap: [string, any][] = [
    ['Documents', Directory.Documents],
    ['Downloads', Directory.ExternalStorage ?? Directory.Documents],
    ['Pictures', Directory.ExternalStorage ?? Directory.Documents],
    ['Music', Directory.ExternalStorage ?? Directory.Documents],
    ['Movies', Directory.ExternalStorage ?? Directory.Documents],
    ['DCIM', Directory.ExternalStorage ?? Directory.Documents],
  ]

  for (const [prefix, dirValue] of prefixMap) {
    if (path === prefix) return { dir: dirValue, relativePath: '', displayPath: prefix }
    if (path.startsWith(prefix + '/')) {
      const sub = path.substring(prefix.length + 1)
      return { dir: dirValue, relativePath: sub, displayPath: path }
    }
  }

  return { dir: Directory.Documents, relativePath: path, displayPath: path }
}

function isExternalPath(path: string): boolean {
  const p = normPath(path)
  return p.startsWith('/sdcard/') || p === '/sdcard' || p.startsWith('/storage/')
}

async function getFs() {
  return await import('@capacitor/filesystem')
}

async function runShell(command: string): Promise<{ output: string, exitCode: number }> {
  return await ShellExec.execute({ command })
}

function shq(s: string): string {
  return `'${s.replace(/'/g, `'"'"'`)}'`
}

const fileReadApi: PluginApi = {
  type: 'tool',
  name: 'read',
  description: 'Read a file from device storage',
  prompt: 'Read file',
  parameters: TObject({ path: TString({ description: 'File path to read' }), encoding: TOptional(TString({ description: 'Encoding (default: utf-8)', default: 'utf-8' })) }),
  async execute(args) {
    try {
      if (isExternalPath(args.path)) {
        const res = await runShell(`cat ${shq(args.path)} 2>&1`)
        return [{ type: 'text' as const, contentText: res.output || '(empty)' }]
      }
      const { Filesystem, Encoding, Directory } = await getFs()
      const { dir, relativePath } = resolvePath(args.path, Directory)
      const result = await Filesystem.readFile({ path: relativePath, directory: dir, encoding: Encoding.UTF8 })
      const content = typeof result.data === 'string' ? result.data : '(binary file)'
      const maxLen = 50000
      const truncated = content.length > maxLen ? content.substring(0, maxLen) + `\n\n... (truncated, ${content.length} total chars)` : content
      return [{ type: 'text' as const, contentText: truncated }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error reading ${args.path}: ${e.message || String(e)}` }]
    }
  }
}

const fileWriteApi: PluginApi = {
  type: 'tool',
  name: 'write',
  description: 'Write content to a file on device (supports true append)',
  prompt: 'Write file',
  parameters: TObject({ path: TString({ description: 'File path to write' }), content: TString({ description: 'Content to write' }), append: TOptional(TBoolean({ description: 'Append mode (default: false)', default: false })) }),
  async execute(args) {
    try {
      if (isExternalPath(args.path)) {
        const dir = args.path.includes('/') ? args.path.substring(0, args.path.lastIndexOf('/')) : '/sdcard'
        const marker = '__AIAW_EOF__'
        const op = args.append ? '>>' : '>'
        const cmd = `mkdir -p ${shq(dir)} && cat <<'${marker}' ${op} ${shq(args.path)}\n${args.content}\n${marker}`
        const res = await runShell(cmd)
        return [{ type: 'text' as const, contentText: res.exitCode === 0 ? `✓ ${args.append ? 'Appended' : 'Written'} ${args.content.length} chars to ${args.path}` : `${res.output}\n[exit code: ${res.exitCode}]` }]
      }

      const { Filesystem, Encoding, Directory } = await getFs()
      const { dir, relativePath } = resolvePath(args.path, Directory)
      const parts = relativePath.split('/').filter(Boolean)
      if (parts.length > 1) {
        const parentDir = parts.slice(0, -1).join('/')
        if (parentDir) {
          try { await Filesystem.mkdir({ path: parentDir, directory: dir, recursive: true }) } catch {}
        }
      }

      if (args.append) {
        if (typeof (Filesystem as any).appendFile === 'function') {
          await (Filesystem as any).appendFile({ path: relativePath, data: args.content, directory: dir, encoding: Encoding.UTF8 })
        } else {
          let existing = ''
          try {
            const old = await Filesystem.readFile({ path: relativePath, directory: dir, encoding: Encoding.UTF8 })
            existing = typeof old.data === 'string' ? old.data : ''
          } catch {}
          await Filesystem.writeFile({ path: relativePath, data: existing + args.content, directory: dir, encoding: Encoding.UTF8, recursive: true })
        }
      } else {
        await Filesystem.writeFile({ path: relativePath, data: args.content, directory: dir, encoding: Encoding.UTF8, recursive: true })
      }
      ensureParentDirs(args.path)
      addIndex(args.path, 'file')
      return [{ type: 'text' as const, contentText: `✓ ${args.append ? 'Appended' : 'Written'} ${args.content.length} chars to ${args.path}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error writing ${args.path}: ${e.message || String(e)}` }]
    }
  }
}

const fileListApi: PluginApi = {
  type: 'tool',
  name: 'list',
  description: 'List exactly one directory level',
  prompt: 'List directory one level',
  parameters: TObject({ path: TOptional(TString({ description: 'Directory path (default: Documents)', default: 'Documents' })) }),
  async execute(args) {
    try {
      const path = normPath(args.path || 'Documents')
      if (isExternalPath(path)) {
        const res = await runShell(`ls -1Ap ${shq(path)} 2>&1`)
        const lines = res.output.split('\n').map(s => s.trim()).filter(Boolean)
        if (!lines.length) return [{ type: 'text' as const, contentText: `(empty directory: ${path})` }]
        const entries = lines.map(name => {
          const isDir = name.endsWith('/')
          const clean = isDir ? name.slice(0, -1) : name
          return `${isDir ? '📁' : '📄'} ${path}/${clean}`
        })
        return [{ type: 'text' as const, contentText: `${path}:\n${entries.join('\n')}` }]
      }

      const prefix = path
      const all = loadIndex().filter(e => e.path.startsWith(prefix + '/'))
      const oneLevel = new Map<string, 'file' | 'directory'>()
      for (const e of all) {
        const rest = e.path.substring(prefix.length + 1)
        if (!rest || rest.includes('/')) {
          const first = rest.split('/')[0]
          if (first) oneLevel.set(`${prefix}/${first}`, 'directory')
        } else {
          oneLevel.set(e.path, e.type)
        }
      }
      const entries = Array.from(oneLevel.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([p,t]) => `${t === 'directory' ? '📁' : '📄'} ${p}`)
      if (!entries.length) return [{ type: 'text' as const, contentText: `(empty or unknown directory: ${prefix})` }]
      return [{ type: 'text' as const, contentText: `${prefix}:\n${entries.join('\n')}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error listing ${args.path || 'Documents'}: ${e.message || String(e)}` }]
    }
  }
}

const fileDeleteApi: PluginApi = {
  type: 'tool',
  name: 'delete',
  description: 'Delete a file or directory',
  prompt: 'Delete file or directory',
  parameters: TObject({ path: TString({ description: 'Path to delete' }), recursive: TOptional(TBoolean({ description: 'Recursive delete for directories', default: false })) }),
  async execute(args) {
    try {
      if (isExternalPath(args.path)) {
        const cmd = args.recursive ? `rm -rf ${shq(args.path)} 2>&1` : `rm -f ${shq(args.path)} 2>&1`
        const res = await runShell(cmd)
        return [{ type: 'text' as const, contentText: res.exitCode === 0 ? `✓ Deleted ${args.path}` : `${res.output}\n[exit code: ${res.exitCode}]` }]
      }
      const { Filesystem, Directory } = await getFs()
      const { dir, relativePath } = resolvePath(args.path, Directory)
      let isDir = false
      try {
        const stat = await Filesystem.stat({ path: relativePath, directory: dir })
        isDir = stat.type === 'directory'
      } catch {}
      if (isDir) await Filesystem.rmdir({ path: relativePath, directory: dir, recursive: !!args.recursive })
      else await Filesystem.deleteFile({ path: relativePath, directory: dir })
      removeIndex(args.path)
      return [{ type: 'text' as const, contentText: `✓ Deleted ${args.path}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error deleting ${args.path}: ${e.message || String(e)}` }]
    }
  }
}

const fileMkdirApi: PluginApi = {
  type: 'tool',
  name: 'mkdir',
  description: 'Create directory',
  prompt: 'Create directory',
  parameters: TObject({ path: TString({ description: 'Directory path to create' }), recursive: TOptional(TBoolean({ description: 'Create parents too', default: true })) }),
  async execute(args) {
    try {
      if (isExternalPath(args.path)) {
        const cmd = args.recursive === false ? `mkdir ${shq(args.path)} 2>&1` : `mkdir -p ${shq(args.path)} 2>&1`
        const res = await runShell(cmd)
        return [{ type: 'text' as const, contentText: res.exitCode === 0 ? `✓ Created directory ${args.path}` : `${res.output}\n[exit code: ${res.exitCode}]` }]
      }
      const { Filesystem, Encoding, Directory } = await getFs()
      const { dir, relativePath } = resolvePath(args.path, Directory)
      const clean = relativePath.replace(/\/+$/, '')
      const marker = `${clean}/.aiaw_keep`
      await Filesystem.writeFile({ path: marker, data: '', directory: dir, encoding: Encoding.UTF8, recursive: true })
      await Filesystem.deleteFile({ path: marker, directory: dir })
      ensureParentDirs(args.path + '/dummy')
      addIndex(args.path, 'directory')
      return [{ type: 'text' as const, contentText: `✓ Created directory ${args.path}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error creating directory ${args.path}: ${e.message || String(e)}` }]
    }
  }
}

const fileCopyApi: PluginApi = {
  type: 'tool',
  name: 'copy',
  description: 'Copy file',
  prompt: 'Copy file',
  parameters: TObject({ from: TString({ description: 'Source path' }), to: TString({ description: 'Destination path' }) }),
  async execute(args) {
    try {
      if (isExternalPath(args.from) || isExternalPath(args.to)) {
        const dir = args.to.includes('/') ? args.to.substring(0, args.to.lastIndexOf('/')) : '/sdcard'
        const res = await runShell(`mkdir -p ${shq(dir)} && cp ${shq(args.from)} ${shq(args.to)} 2>&1`)
        return [{ type: 'text' as const, contentText: res.exitCode === 0 ? `✓ Copied ${args.from} -> ${args.to}` : `${res.output}\n[exit code: ${res.exitCode}]` }]
      }
      const { Filesystem, Directory } = await getFs()
      const src = resolvePath(args.from, Directory)
      const dst = resolvePath(args.to, Directory)
      await Filesystem.copy({ from: src.relativePath, to: dst.relativePath, directory: src.dir, toDirectory: dst.dir })
      ensureParentDirs(args.to)
      addIndex(args.to, 'file')
      return [{ type: 'text' as const, contentText: `✓ Copied ${args.from} -> ${args.to}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error copying ${args.from} -> ${args.to}: ${e.message || String(e)}` }]
    }
  }
}

const fileMoveApi: PluginApi = {
  type: 'tool',
  name: 'move',
  description: 'Move/rename file',
  prompt: 'Move or rename file',
  parameters: TObject({ from: TString({ description: 'Source path' }), to: TString({ description: 'Destination path' }) }),
  async execute(args) {
    try {
      if (isExternalPath(args.from) || isExternalPath(args.to)) {
        const dir = args.to.includes('/') ? args.to.substring(0, args.to.lastIndexOf('/')) : '/sdcard'
        const res = await runShell(`mkdir -p ${shq(dir)} && mv ${shq(args.from)} ${shq(args.to)} 2>&1`)
        return [{ type: 'text' as const, contentText: res.exitCode === 0 ? `✓ Moved ${args.from} -> ${args.to}` : `${res.output}\n[exit code: ${res.exitCode}]` }]
      }
      const { Filesystem, Directory } = await getFs()
      const src = resolvePath(args.from, Directory)
      const dst = resolvePath(args.to, Directory)
      await Filesystem.rename({ from: src.relativePath, to: dst.relativePath, directory: src.dir, toDirectory: dst.dir })
      removeIndex(args.from); ensureParentDirs(args.to); addIndex(args.to, 'file')
      return [{ type: 'text' as const, contentText: `✓ Moved ${args.from} -> ${args.to}` }]
    } catch (e: any) {
      return [{ type: 'text' as const, contentText: `Error moving ${args.from} -> ${args.to}: ${e.message || String(e)}` }]
    }
  }
}

const plugin: Plugin = {
  id: 'aiaw-file-ops',
  type: 'builtin',
  available: IsCapacitor,
  apis: [fileReadApi, fileListApi, fileWriteApi, fileDeleteApi, fileMkdirApi, fileCopyApi, fileMoveApi],
  fileparsers: [],
  settings: TObject({}),
  title: 'File Operations',
  description: 'Mobile file toolset: read/write/list/delete/mkdir/copy/move.',
  prompt
}

export const defaultData: PluginData = {
  settings: {},
  avatar: { type: 'icon', icon: 'sym_o_folder', hue: 40 },
  fileparsers: {}
}

export default { plugin, defaultData }
