import { Object as TObject, Optional as TOptional, String as TString, Number as TNumber, Boolean as TBoolean } from '@sinclair/typebox'
import { Plugin, PluginApi, PluginData } from './types'
import { IsCapacitor } from './platform-api'
import { LocalFs, ensureMountedDir, getMountedDir, remountDir, unmountDir } from './local-fs-native'

const prompt = `<role>你是一个可以通过原生 Android 目录授权访问真实本地文件树的 AI 助手。</role>

<tools>
<tool name="mountDir"><description>弹出系统目录选择器，授权并挂载一个真实本地目录。</description></tool>
<tool name="getMountedDir"><description>查看当前已挂载目录。</description></tool>
<tool name="remountDir"><description>强制重新选择并替换当前挂载目录。</description></tool>
<tool name="unmountDir"><description>清除当前挂载目录。</description></tool>
<tool name="listDir"><description>列出已挂载目录下某个 URI 的直接子项。若不传 uri，则默认列出当前已挂载目录。</description></tool>
<tool name="readFile"><description>读取某个已授权 URI 对应文件的文本内容，支持 offset/maxChars 分段读取。</description></tool>
<tool name="writeFile"><description>向已授权文件 URI 写入内容，支持 append。</description></tool>
<tool name="mkdir"><description>在已授权目录 URI 下创建子目录；若不传 parentUri，则默认在当前已挂载目录下创建。</description></tool>
<tool name="createFile"><description>在已授权目录 URI 下创建文本文件；若不传 parentUri，则默认在当前已挂载目录下创建。</description></tool>
<tool name="delete"><description>删除已授权 URI 对应的文件或目录。</description></tool>
<tool name="rename"><description>重命名已授权文件或目录。</description></tool>
<tool name="copy"><description>复制文件到另一已授权目录。</description></tool>
<tool name="move"><description>移动文件到另一已授权目录。</description></tool>
</tools>
`

async function requireMountedDirUri(): Promise<string> {
  const mount = getMountedDir()
  if (!mount?.uri) throw new Error('No mounted directory. Call mountDir first.')
  return mount.uri
}

const mountDirApi: PluginApi = {
  type: 'tool', name: 'mountDir', description: 'Pick and mount a real local directory through Android native SAF', prompt: 'Mount a local directory', parameters: TObject({}),
  async execute() {
    try {
      const mount = await ensureMountedDir()
      return [{ type: 'text' as const, contentText: `Mounted directory: ${mount.name || '(unnamed)'}\nURI: ${mount.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error mounting directory: ${e.message || String(e)}` }] }
  }
}

const getMountedDirApi: PluginApi = {
  type: 'tool', name: 'getMountedDir', description: 'Get current mounted directory', prompt: 'Get current mounted directory', parameters: TObject({}),
  async execute() {
    const mount = getMountedDir()
    return [{ type: 'text' as const, contentText: mount ? `Mounted directory: ${mount.name || '(unnamed)'}\nURI: ${mount.uri}` : 'No directory mounted' }]
  }
}

const remountDirApi: PluginApi = {
  type: 'tool', name: 'remountDir', description: 'Force pick a new directory and replace the current mount', prompt: 'Remount local directory', parameters: TObject({}),
  async execute() {
    try {
      const mount = await remountDir()
      return [{ type: 'text' as const, contentText: `Remounted directory: ${mount.name || '(unnamed)'}\nURI: ${mount.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error remounting directory: ${e.message || String(e)}` }] }
  }
}

const unmountDirApi: PluginApi = {
  type: 'tool', name: 'unmountDir', description: 'Clear current mounted directory', prompt: 'Unmount local directory', parameters: TObject({}),
  async execute() {
    unmountDir()
    return [{ type: 'text' as const, contentText: 'Unmounted current directory' }]
  }
}

const listDirApi: PluginApi = {
  type: 'tool', name: 'listDir', description: 'List direct children of a mounted directory URI', prompt: 'List mounted directory children', parameters: TObject({ uri: TOptional(TString({ description: 'Directory URI to list. If omitted, uses the currently mounted directory.' })) }),
  async execute(args) {
    try {
      const uri = args.uri || await requireMountedDirUri()
      const res = await LocalFs.listChildren({ uri })
      const lines = res.items.map(item => `${item.isDirectory ? '📁' : '📄'} ${item.name || '(unnamed)'}\nURI: ${item.uri}`)
      return [{ type: 'text' as const, contentText: lines.length ? lines.join('\n\n') : '(empty directory)' }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error listing directory: ${e.message || String(e)}` }] }
  }
}

const readFileApi: PluginApi = {
  type: 'tool', name: 'readFile', description: 'Read text content from a mounted file URI with optional slicing', prompt: 'Read mounted file', parameters: TObject({ uri: TString({ description: 'File URI to read' }), offset: TOptional(TNumber({ description: 'Character offset to start reading from', default: 0 })), maxChars: TOptional(TNumber({ description: 'Maximum characters to return', default: 50000 })) }),
  async execute(args) {
    try {
      const res = await LocalFs.readText({ uri: args.uri, offset: args.offset || 0, maxChars: args.maxChars || 50000 })
      const header = `[offset=${res.offset}, returned=${res.returnedChars}, total=${res.totalChars}, hasMore=${res.hasMore}]\n`
      return [{ type: 'text' as const, contentText: header + res.content }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error reading file: ${e.message || String(e)}` }] }
  }
}

const writeFileApi: PluginApi = {
  type: 'tool', name: 'writeFile', description: 'Write text content to a mounted file URI', prompt: 'Write mounted file', parameters: TObject({ uri: TString({ description: 'File URI to write' }), content: TString({ description: 'Text content to write' }), append: TOptional(TBoolean({ description: 'Append instead of overwrite', default: false })) }),
  async execute(args) {
    try {
      await LocalFs.writeText({ uri: args.uri, content: args.content, append: !!args.append })
      return [{ type: 'text' as const, contentText: `✓ ${args.append ? 'Appended' : 'Written'} content` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error writing file: ${e.message || String(e)}` }] }
  }
}

const mkdirApi: PluginApi = {
  type: 'tool', name: 'mkdir', description: 'Create a directory under an authorized parent directory URI', prompt: 'Create directory in mounted tree', parameters: TObject({ parentUri: TOptional(TString({ description: 'Parent directory URI. If omitted, uses current mounted directory.' })), name: TString({ description: 'Directory name to create' }) }),
  async execute(args) {
    try {
      const parentUri = args.parentUri || await requireMountedDirUri()
      const res = await LocalFs.createDirectory({ parentUri, name: args.name })
      return [{ type: 'text' as const, contentText: `Created directory: ${res.name || args.name}\nURI: ${res.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error creating directory: ${e.message || String(e)}` }] }
  }
}

const createFileApi: PluginApi = {
  type: 'tool', name: 'createFile', description: 'Create a text file under an authorized parent directory URI', prompt: 'Create file in mounted tree', parameters: TObject({ parentUri: TOptional(TString({ description: 'Parent directory URI. If omitted, uses current mounted directory.' })), name: TString({ description: 'File name' }), content: TOptional(TString({ description: 'Initial text content', default: '' })) }),
  async execute(args) {
    try {
      const parentUri = args.parentUri || await requireMountedDirUri()
      const res = await LocalFs.createTextFile({ parentUri, name: args.name, content: args.content || '' })
      return [{ type: 'text' as const, contentText: `Created file: ${res.name || args.name}\nURI: ${res.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error creating file: ${e.message || String(e)}` }] }
  }
}

const deleteApi: PluginApi = {
  type: 'tool', name: 'delete', description: 'Delete an authorized file or directory URI', prompt: 'Delete mounted document', parameters: TObject({ uri: TString({ description: 'Document URI to delete' }) }),
  async execute(args) {
    try { await LocalFs.deleteDocument({ uri: args.uri }); return [{ type: 'text' as const, contentText: '✓ Deleted document' }] }
    catch (e: any) { return [{ type: 'text' as const, contentText: `Error deleting document: ${e.message || String(e)}` }] }
  }
}

const renameApi: PluginApi = {
  type: 'tool', name: 'rename', description: 'Rename an authorized file or directory URI', prompt: 'Rename mounted document', parameters: TObject({ uri: TString({ description: 'Document URI to rename' }), newName: TString({ description: 'New name' }) }),
  async execute(args) {
    try {
      const res = await LocalFs.renameDocument({ uri: args.uri, newName: args.newName })
      return [{ type: 'text' as const, contentText: `Renamed to: ${res.name || args.newName}\nURI: ${res.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error renaming document: ${e.message || String(e)}` }] }
  }
}

const copyApi: PluginApi = {
  type: 'tool', name: 'copy', description: 'Copy an authorized file to another authorized directory', prompt: 'Copy mounted document', parameters: TObject({ sourceUri: TString({ description: 'Source file URI' }), targetDirUri: TString({ description: 'Target directory URI' }), newName: TOptional(TString({ description: 'Optional new name' })) }),
  async execute(args) {
    try {
      const res = await LocalFs.copyDocument({ sourceUri: args.sourceUri, targetDirUri: args.targetDirUri, newName: args.newName })
      return [{ type: 'text' as const, contentText: `Copied to: ${res.name || '(unnamed)'}\nURI: ${res.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error copying document: ${e.message || String(e)}` }] }
  }
}

const moveApi: PluginApi = {
  type: 'tool', name: 'move', description: 'Move an authorized file to another authorized directory', prompt: 'Move mounted document', parameters: TObject({ sourceUri: TString({ description: 'Source file URI' }), targetDirUri: TString({ description: 'Target directory URI' }), newName: TOptional(TString({ description: 'Optional new name' })) }),
  async execute(args) {
    try {
      const res = await LocalFs.moveDocument({ sourceUri: args.sourceUri, targetDirUri: args.targetDirUri, newName: args.newName })
      return [{ type: 'text' as const, contentText: `Moved to: ${res.name || '(unnamed)'}\nURI: ${res.uri}` }]
    } catch (e: any) { return [{ type: 'text' as const, contentText: `Error moving document: ${e.message || String(e)}` }] }
  }
}

const plugin: Plugin = {
  id: 'aiaw-localfs-native',
  type: 'builtin',
  available: IsCapacitor,
  apis: [mountDirApi, getMountedDirApi, remountDirApi, unmountDirApi, listDirApi, readFileApi, writeFileApi, mkdirApi, createFileApi, deleteApi, renameApi, copyApi, moveApi],
  fileparsers: [],
  settings: TObject({}),
  title: 'Local FS Native',
  description: 'Android native Storage Access Framework bridge for real local directories and files.',
  prompt
}

export const defaultData: PluginData = {
  settings: {},
  avatar: { type: 'icon', icon: 'sym_o_folder_managed', hue: 180 },
  fileparsers: {}
}

export default { plugin, defaultData }
