import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { TransportConf } from './types'
import { JSONEqual } from './functions'
import { version } from 'src/version.json'
import { TauriShellClientTransport } from './tauri-shell-transport'
import { platform } from '@tauri-apps/plugin-os'
import { fetch } from './platform-api'
import { Notify } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { SSEClientTransport } from './mcp-sse-transport'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const KeepAliveTimeout = 300e3

const pool = new Map<string, {
  conf: TransportConf
  client: Client
  timeoutId: number
}>()

type Settings = TransportConf & { timeout?: number }

function parseSettings(settings: Settings): {
  transportConf: TransportConf
  timeout?: number
} {
  const timeout = settings.timeout
  delete settings.timeout
  return {
    transportConf: settings,
    timeout
  }
}

const { t } = i18n.global

export async function getClient(key: string, settings: Settings) {
  const { transportConf, timeout } = parseSettings(settings)
  const clientTimeout = Math.max(timeout ? timeout * 1000 : 0, KeepAliveTimeout)
  if (pool.has(key)) {
    const item = pool.get(key)
    const { conf, client, timeoutId } = item
    if (JSONEqual(conf, transportConf)) {
      window.clearTimeout(timeoutId)
      item.timeoutId = window.setTimeout(() => {
        client.close()
      }, clientTimeout)
      return client
    } else {
      await client.close()
    }
  }
  const client = new Client({
    name: 'aiaw',
    version
  })
  Notify.create({
    message: t('mcpClient.connectingMcpServer')
  })
  if (transportConf.type === 'stdio') {
    const pf = platform()
    await client.connect(new TauriShellClientTransport({
      command: pf === 'windows' ? 'cmd' : 'sh',
      args: [pf === 'windows' ? '/c' : '-c', transportConf.command],
      env: transportConf.env,
      cwd: transportConf.cwd
    }))
  } else if (transportConf.type === 'http') {
    await client.connect(new StreamableHTTPClientTransport(new URL(transportConf.url), {
      fetch,
      requestInit: { headers: transportConf.headers }
    })).catch(err => {
      client.close()
      throw err
    })
  } else {
    await client.connect(new SSEClientTransport(new URL(transportConf.url), {
      fetch
    })).catch(err => {
      client.close()
      throw err
    })
  }
  const timeoutId = window.setTimeout(() => {
    client.close()
  }, clientTimeout)
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
