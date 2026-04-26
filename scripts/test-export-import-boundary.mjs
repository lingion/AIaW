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
    workspaces: 'id, type, parentId', dialogs: 'id, workspaceId', messages: 'id, type, dialogId', assistants: 'id, workspaceId',
    artifacts: 'id, workspaceId', installedPluginsV2: 'key, id', reactives: 'key', avatarImages: 'id', items: 'id, type, dialogId', providers: 'id'
  })
  return db
}
function genId(prefix='id'){ return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}_${Math.random().toString(36).slice(2)}` }
function collectSampleFiles(root,maxFiles=20){
  const out=[]
  function walk(dir){
    for(const name of readdirSync(dir)){
      if(out.length>=maxFiles) return
      const full=join(dir,name)
      let st; try{ st=statSync(full) }catch{ continue }
      if(st.isDirectory()) walk(full)
      else if(st.isFile() && st.size>0 && st.size<12*1024*1024) out.push(full)
      if(out.length>=maxFiles) return
    }
  }
  walk(root); return out
}
async function counts(db){
  const tables=['workspaces','dialogs','messages','assistants','artifacts','installedPluginsV2','reactives','avatarImages','items','providers']
  const obj={}; for(const t of tables) obj[t]=await db.table(t).count(); return obj
}
function same(a,b){ return JSON.stringify(a)===JSON.stringify(b) }

const ROOTS=['/Users/lingion_k/.openclaw/workspace','/Users/lingion_k/.openclaw/media']
let files=[]
for(const r of ROOTS){ try{ files=files.concat(collectSampleFiles(r,12)) }catch{} }
files=files.slice(0,12)

const source = makeDb('stress-boundary-source')
await source.delete(); await source.open()
const dialogIds=[]
for(let i=0;i<25;i++){
  const wid=genId('ws')
  await source.table('workspaces').add({ id:wid,name:`WS ${i+1}`,type:'workspace',parentId:'$root',prompt:'',defaultAssistantId:genId('asst'),indexContent:'',vars:{},listOpen:{assistants:true,artifacts:false,dialogs:true} })
  await source.table('assistants').add({ id:genId('asst'),name:`A ${i+1}`,avatar:{type:'text',text:'AI'},workspaceId:wid,prompt:'',promptTemplate:'',promptVars:[],provider:null,model:null,modelSettings:{temperature:0.6,topP:1,presencePenalty:0,frequencyPenalty:0,maxSteps:4,maxRetries:1},plugins:{},promptRole:'system',stream:true })
  for(let j=0;j<6;j++){
    const did=genId('dlg'); dialogIds.push(did)
    await source.table('dialogs').add({ id:did,workspaceId:wid,title:`Dialog ${i+1}-${j+1}`,assistantId:null,pinned:false,createdAt:new Date(),updatedAt:new Date(),inputVars:{},msgRoute:[] })
    for(let k=0;k<20;k++){
      await source.table('messages').add({ id:genId('msg'),dialogId:did,type:k%2===0?'user':'assistant',contents:[{type:'text',text:`msg ${i}-${j}-${k} `.repeat((k%5)+1)}],createdAt:new Date() })
    }
  }
}
for(let i=0;i<40;i++){
  const f=files[i % files.length]
  const buf=readFileSync(f)
  const arr=buf.buffer.slice(buf.byteOffset, buf.byteOffset+buf.byteLength)
  await source.table('avatarImages').add({ id:genId('img'), mimeType: extname(f).toLowerCase()==='.png'?'image/png':'application/octet-stream', contentBuffer: arr })
  await source.table('items').add({ id:genId('item'), type:'file', dialogId: dialogIds[i % dialogIds.length], name: basename(f), mimeType:'application/octet-stream', contentBuffer: arr })
}
const before=await counts(source)

const lightBlob=await exportDB(source,{ numRowsPerChunk:50, transform:(table,val)=>({ value:(table==='avatarImages'||table==='items')?{...val,contentBuffer:undefined}:val }) })
const fullBlob=await exportDB(source,{ numRowsPerChunk:50 })

const importLight=makeDb('stress-boundary-light')
await importLight.delete(); await importLight.open()
await importInto(importLight, lightBlob, { overwriteValues:true, clearTablesBeforeImport:true, acceptNameDiff:true })
const lightCounts=await counts(importLight)
const lightAvatar=await importLight.table('avatarImages').toArray()
const lightItems=await importLight.table('items').toArray()

const importFull=makeDb('stress-boundary-full')
await importFull.delete(); await importFull.open()
// seed noise rows to test overwrite into non-empty db
await importFull.table('workspaces').add({ id:'noise', name:'noise', type:'workspace', parentId:'$root' })
await importInto(importFull, fullBlob, { overwriteValues:true, clearTablesBeforeImport:true, acceptNameDiff:true })
const fullCounts=await counts(importFull)
const fullAvatar=await importFull.table('avatarImages').toArray()
const fullItems=await importFull.table('items').toArray()

const report={
  sampleFiles: files.length,
  before,
  light:{ size: lightBlob.size, counts: lightCounts, avatarBinaryStripped: lightAvatar.every(v=>v.contentBuffer===undefined), itemBinaryStripped: lightItems.every(v=>v.contentBuffer===undefined) },
  full:{ size: fullBlob.size, counts: fullCounts, avatarBinaryPreserved: fullAvatar.some(v=>v.contentBuffer!=null), itemBinaryPreserved: fullItems.some(v=>v.contentBuffer!=null) },
  assertions:{
    countsMatchLight: same(before, lightCounts),
    countsMatchFull: same(before, fullCounts),
    lightBinaryOk: lightAvatar.every(v=>v.contentBuffer===undefined)&&lightItems.every(v=>v.contentBuffer===undefined),
    fullBinaryOk: fullAvatar.some(v=>v.contentBuffer!=null)&&fullItems.some(v=>v.contentBuffer!=null)
  }
}
console.log(JSON.stringify(report,null,2))
if(!report.assertions.countsMatchLight) throw new Error('countsMatchLight failed')
if(!report.assertions.countsMatchFull) throw new Error('countsMatchFull failed')
if(!report.assertions.lightBinaryOk) throw new Error('lightBinaryOk failed')
if(!report.assertions.fullBinaryOk) throw new Error('fullBinaryOk failed')
await source.delete(); await importLight.delete(); await importFull.delete()
