import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { TransportConf } from './types'
import { JSONEqual } from './functions'
import { version } from 'src/version.json'
import { TauriShellClientTransport } from './tauri-shell-transport'
import { platform } from '@tauri-apps/plugin-os'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { fetch } from './platform-api'
import { Notify } from 'quasar'

const KeepAliveTimeout = 300e3

const pool = new Map<string, {
  conf: TransportConf
  client: Client
  timeoutId: number
}>()

export async function getClient(key: string, transportConf: TransportConf) {
  if (pool.has(key)) {
    const item = pool.get(key)
    const { conf, client, timeoutId } = item
    if (JSONEqual(conf, transportConf)) {
      window.clearTimeout(timeoutId)
      item.timeoutId = window.setTimeout(() => {
        client.close()
      }, KeepAliveTimeout)
      return client
    } else {
      await client.close()
    }
  }
  const client = new Client({
    name: 'aiaw',
    version
  }, {
    capabilities: {
      tools: {},
      resources: {}
    }
  })
  Notify.create({
    message: '正在连接 MCP 服务器...'
  })
  if (transportConf.type === 'stdio') {
    const pf = platform()
    await client.connect(new TauriShellClientTransport({
      command: pf === 'windows' ? 'cmd' : 'sh',
      args: [pf === 'windows' ? '/c' : '-c', transportConf.command],
      env: transportConf.env,
      cwd: transportConf.cwd
    }))
  } else {
    await client.connect(new SSEClientTransport(new URL(transportConf.url), { eventSourceInit: { fetch } }))
  }
  const timeoutId = window.setTimeout(() => {
    client.close()
  }, 300e3)
  pool.set(key, { conf: transportConf, client, timeoutId })
  client.onclose = () => {
    window.clearTimeout(pool.get(key).timeoutId)
    pool.delete(key)
  }
  client.onerror = err => {
    console.error(err)
  }
  return client
}
