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
function collect(root,maxFiles=24){
  const out=[]
  function walk(dir){
    for(const name of readdirSync(dir)){
      if(out.length>=maxFiles) return
      const full=join(dir,name)
      let st; try{st=statSync(full)}catch{continue}
      if(st.isDirectory()) walk(full)
      else if(st.isFile() && st.size>0 && st.size<12*1024*1024) out.push(full)
    }
  }
  walk(root); return out
}
async function counts(db){ const names=['workspaces','dialogs','messages','assistants','artifacts','installedPluginsV2','reactives','avatarImages','items','providers']; const o={}; for(const n of names) o[n]=await db.table(n).count(); return o }

let files=[]
for(const root of ['/Users/lingion_k/.openclaw/workspace','/Users/lingion_k/.openclaw/media']){ try{ files=files.concat(collect(root,12)) }catch{} }
files=files.slice(0,16)

const source=makeDb('stress-extreme-source')
await source.delete(); await source.open()
const dialogIds=[]
for(let i=0;i<40;i++){
  const wid=genId('ws')
  await source.table('workspaces').add({ id:wid,name:`WS ${i+1}`,type:'workspace',parentId:'$root',prompt:'',defaultAssistantId:genId('asst'),indexContent:'',vars:{},listOpen:{assistants:true,artifacts:false,dialogs:true} })
  await source.table('assistants').add({ id:genId('asst'),name:`A ${i+1}`,avatar:{type:'text',text:'AI'},workspaceId:wid,prompt:'',promptTemplate:'',promptVars:[],provider:null,model:null,modelSettings:{temperature:0.6,topP:1,presencePenalty:0,frequencyPenalty:0,maxSteps:4,maxRetries:1},plugins:{},promptRole:'system',stream:true })
  for(let j=0;j<8;j++){
    const did=genId('dlg'); dialogIds.push(did)
    await source.table('dialogs').add({ id:did,workspaceId:wid,title:`Dialog ${i+1}-${j+1}`,assistantId:null,pinned:false,createdAt:new Date(),updatedAt:new Date(),inputVars:{},msgRoute:[] })
    for(let k=0;k<30;k++){
      await source.table('messages').add({ id:genId('msg'),dialogId:did,type:k%2===0?'user':'assistant',contents:[{type:'text',text:`msg ${i}-${j}-${k} `.repeat((k%7)+1)}],createdAt:new Date() })
    }
  }
}
for(let i=0;i<120;i++){
  const f=files[i % files.length]
  const buf=readFileSync(f)
  const arr=buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  await source.table('avatarImages').add({ id:genId('img'), mimeType: extname(f).toLowerCase()==='.png'?'image/png':'application/octet-stream', contentBuffer: arr })
  await source.table('items').add({ id:genId('item'), type:'file', dialogId:dialogIds[i % dialogIds.length], name:basename(f), mimeType:'application/octet-stream', contentBuffer: arr })
}
const before=await counts(source)
const lightBlob=await exportDB(source,{ numRowsPerChunk:25, transform:(table,val)=>({ value:(table==='avatarImages'||table==='items')?{...val,contentBuffer:undefined}:val }) })
const fullBlob=await exportDB(source,{ numRowsPerChunk:25 })

const light=makeDb('stress-extreme-light'); await light.delete(); await light.open();
await importInto(light, lightBlob, { overwriteValues:true, clearTablesBeforeImport:true, acceptNameDiff:true })
const lightCounts=await counts(light)
const lightAvatar=await light.table('avatarImages').toArray(); const lightItems=await light.table('items').toArray()

const full=makeDb('stress-extreme-full'); await full.delete(); await full.open();
await full.table('workspaces').add({ id:'noise', name:'noise', type:'workspace', parentId:'$root' })
await importInto(full, fullBlob, { overwriteValues:true, clearTablesBeforeImport:true, acceptNameDiff:true })
const fullCounts=await counts(full)
const fullAvatar=await full.table('avatarImages').toArray(); const fullItems=await full.table('items').toArray()

const report={
  before,
  light:{ size: lightBlob.size, counts: lightCounts, avatarBinaryStripped: lightAvatar.every(v=>v.contentBuffer===undefined), itemBinaryStripped: lightItems.every(v=>v.contentBuffer===undefined) },
  full:{ size: fullBlob.size, counts: fullCounts, avatarBinaryPreserved: fullAvatar.some(v=>v.contentBuffer!=null), itemBinaryPreserved: fullItems.some(v=>v.contentBuffer!=null) }
}
console.log(JSON.stringify(report,null,2))
if(JSON.stringify(before)!==JSON.stringify(lightCounts)) throw new Error('Light mismatch')
if(JSON.stringify(before)!==JSON.stringify(fullCounts)) throw new Error('Full mismatch')
if(!report.light.avatarBinaryStripped || !report.light.itemBinaryStripped) throw new Error('Light strip failed')
if(!report.full.avatarBinaryPreserved || !report.full.itemBinaryPreserved) throw new Error('Full preserve failed')
await source.delete(); await light.delete(); await full.delete()
