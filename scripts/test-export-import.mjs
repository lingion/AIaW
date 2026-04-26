import { JSDOM } from 'jsdom'
const dom = new JSDOM('', { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.self = globalThis
globalThis.FileReader = dom.window.FileReader
globalThis.Blob = dom.window.Blob

import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

const { exportDB, importInto } = await import('dexie-export-import')

function makeDb(name) {
  const db = new Dexie(name)
  db.version(1).stores({
    workspaces: 'id, type, parentId',
    dialogs: 'id, workspaceId',
    messages: 'id, type, dialogId',
    assistants: 'id, workspaceId',
    artifacts: 'id, workspaceId',
    installedPluginsV2: 'key, id',
    reactives: 'key',
    avatarImages: 'id',
    items: 'id, type, dialogId',
    providers: 'id'
  })
  return db
}

const TEST_DB = makeDb('stress-test-db')

function genId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function collectSampleFiles(root, maxFiles = 12) {
  const out = []
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (out.length >= maxFiles) return
      const full = join(dir, name)
      let st
      try { st = statSync(full) } catch { continue }
      if (st.isDirectory()) walk(full)
      else if (st.isFile() && st.size > 0 && st.size < 8 * 1024 * 1024) out.push(full)
      if (out.length >= maxFiles) return
    }
  }
  walk(root)
  return out
}

async function seed() {
  const sampleRoots = ['/Users/lingion_k/.openclaw/workspace', '/Users/lingion_k/.openclaw/media']
  let sampleFiles = []
  for (const r of sampleRoots) {
    try { sampleFiles = sampleFiles.concat(collectSampleFiles(r, 8)) } catch {}
  }
  sampleFiles = sampleFiles.slice(0, 12)

  const dialogIds = []
  for (let i = 0; i < 14; i++) {
    const wid = genId('ws')
    await TEST_DB.table('workspaces').add({
      id: wid,
      name: `Workspace ${i + 1}`,
      type: 'workspace',
      parentId: '$root',
      prompt: '',
      defaultAssistantId: genId('asst'),
      indexContent: '',
      vars: {},
      listOpen: { assistants: true, artifacts: false, dialogs: true }
    })
    await TEST_DB.table('assistants').add({
      id: genId('asst'),
      name: `Assistant ${i + 1}`,
      avatar: { type: 'text', text: 'AI' },
      workspaceId: wid,
      prompt: '',
      promptTemplate: '',
      promptVars: [],
      provider: null,
      model: null,
      modelSettings: {
        temperature: 0.6,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
        maxSteps: 4,
        maxRetries: 1
      },
      plugins: {},
      promptRole: 'system',
      stream: true
    })
    for (let j = 0; j < 4; j++) {
      const did = genId('dlg')
      dialogIds.push(did)
      await TEST_DB.table('dialogs').add({
        id: did,
        workspaceId: wid,
        title: `Dialog ${i + 1}-${j + 1}`,
        assistantId: null,
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        inputVars: {},
        msgRoute: []
      })
      for (let k = 0; k < 10; k++) {
        await TEST_DB.table('messages').add({
          id: genId('msg'),
          dialogId: did,
          type: k % 2 === 0 ? 'user' : 'assistant',
          contents: [{ type: 'text', text: `message ${i}-${j}-${k}` }],
          createdAt: new Date()
        })
      }
    }
  }

  let idx = 0
  for (const f of sampleFiles) {
    const buf = readFileSync(f)
    const arr = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    await TEST_DB.table('avatarImages').add({
      id: genId('img'),
      mimeType: extname(f).toLowerCase() === '.png' ? 'image/png' : 'application/octet-stream',
      contentBuffer: arr
    })
    await TEST_DB.table('items').add({
      id: genId('item'),
      type: 'file',
      dialogId: dialogIds[idx % dialogIds.length],
      name: basename(f),
      mimeType: 'application/octet-stream',
      contentBuffer: arr
    })
    idx++
  }
  return { sampleFilesCount: sampleFiles.length }
}

async function tableCounts(db) {
  const names = ['workspaces', 'dialogs', 'messages', 'assistants', 'artifacts', 'installedPluginsV2', 'reactives', 'avatarImages', 'items', 'providers']
  const out = {}
  for (const n of names) out[n] = await db.table(n).count()
  return out
}

async function run() {
  await TEST_DB.delete()
  await TEST_DB.open()
  const meta = await seed()
  const before = await tableCounts(TEST_DB)

  const lightBlob = await exportDB(TEST_DB, {
    numRowsPerChunk: 100,
    transform: (table, value) => ({
      value: (table === 'avatarImages' || table === 'items')
        ? { ...value, contentBuffer: undefined }
        : value
    })
  })

  const fullBlob = await exportDB(TEST_DB, {
    numRowsPerChunk: 100
  })

  const lightDb = makeDb('stress-test-db-light-import')
  await lightDb.open()
  await importInto(lightDb, lightBlob, {
    overwriteValues: true,
    clearTablesBeforeImport: true,
    acceptNameDiff: true
  })
  const lightCounts = await tableCounts(lightDb)
  const lightAvatar = await lightDb.table('avatarImages').toArray()
  const lightItems = await lightDb.table('items').toArray()

  const fullDb = makeDb('stress-test-db-full-import')
  await fullDb.open()
  await importInto(fullDb, fullBlob, {
    overwriteValues: true,
    clearTablesBeforeImport: true,
    acceptNameDiff: true
  })
  const fullCounts = await tableCounts(fullDb)
  const fullAvatar = await fullDb.table('avatarImages').toArray()
  const fullItems = await fullDb.table('items').toArray()

  const report = {
    meta,
    before,
    light: {
      size: lightBlob.size,
      counts: lightCounts,
      avatarBinaryStripped: lightAvatar.every(v => v.contentBuffer === undefined),
      itemBinaryStripped: lightItems.every(v => v.contentBuffer === undefined)
    },
    full: {
      size: fullBlob.size,
      counts: fullCounts,
      avatarBinaryPreserved: fullAvatar.some(v => v.contentBuffer != null),
      itemBinaryPreserved: fullItems.some(v => v.contentBuffer != null)
    }
  }

  console.log(JSON.stringify(report, null, 2))

  if (JSON.stringify(before) !== JSON.stringify(lightCounts)) throw new Error('Light import counts mismatch')
  if (JSON.stringify(before) !== JSON.stringify(fullCounts)) throw new Error('Full import counts mismatch')
  if (!report.light.avatarBinaryStripped || !report.light.itemBinaryStripped) throw new Error('Light export binary stripping failed')
  if (!report.full.avatarBinaryPreserved || !report.full.itemBinaryPreserved) throw new Error('Full export binary preservation failed')

  await TEST_DB.delete()
  await lightDb.delete()
  await fullDb.delete()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
