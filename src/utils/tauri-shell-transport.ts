import { Command, Child } from '@tauri-apps/plugin-shell'
import { serializeMessage, deserializeMessage } from '@modelcontextprotocol/sdk/shared/stdio.js'
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js'

/**
 * 读取缓冲器（基于字符串实现），用于将连续的标准输出流数据按行分割，解析为 JSON-RPC 消息。
 */
class BrowserReadBuffer {
  private _buffer: string = ''

  /**
   * 追加数据到缓冲区，该数据应为字符串。
   */
  append(chunk: string): void {
    this._buffer += chunk
  }

  /**
   * 读取一条完整消息（以 "\n" 作为分隔），如果没有完整消息则返回 null。
   */
  readMessage(): JSONRPCMessage | null {
    const index = this._buffer.indexOf('\n')
    if (index === -1) {
      return null
    }
    const line = this._buffer.substring(0, index)
    this._buffer = this._buffer.substring(index + 1)
    return deserializeMessage(line)
  }

  /**
   * 清空缓冲区。
   */
  clear(): void {
    this._buffer = ''
  }
}

/**
 * 启动 Tauri Shell 进程的参数定义。
 */
export type TauriShellServerParameters = {
  /**
   * 要启动的可执行文件。
   */
  command: string;
  /**
   * 传递给可执行文件的命令行参数。
   */
  args?: string[];
  /**
   * 启动进程时使用的环境变量。
   */
  env?: Record<string, string>;
  /**
   * 进程的工作目录。
   */
  cwd?: string;
};

/**
 * 基于 @tauri-apps/plugin-shell 的 transport 实现 —— 用于在浏览器（前端）环境下调用后端进程。
 *
 * 该类按照 JSON-RPC 协议，与子进程通信。它通过 BrowserReadBuffer 缓存子进程的 stdout 输出，
 * 当检测到完整的以换行符结尾的消息时，便通过 onmessage 回调对外发布消息。
 */
export class TauriShellClientTransport implements Transport {
  private _child?: Child
  private _readBuffer: BrowserReadBuffer = new BrowserReadBuffer()
  private _serverParams: TauriShellServerParameters
  // 使用 TextDecoder 以便将 Uint8Array 转换为字符串。
  private _decoder: TextDecoder = new TextDecoder('utf-8')

  onclose?: () => void
  onerror?: (error: Error) => void
  onmessage?: (message: JSONRPCMessage) => void

  constructor(server: TauriShellServerParameters) {
    this._serverParams = server
  }

  /**
   * 启动子进程，并为 stdout、stderr 分别设置事件监听器，以便接收数据和错误信息。
   */
  async start(): Promise<void> {
    const command = Command.create(
      this._serverParams.command,
      this._serverParams.args ?? [],
      {
        cwd: this._serverParams.cwd,
        env: this._serverParams.env,
        encoding: 'utf-8'
      }
    )

    // 当命令执行出错时，调用 onerror 回调。
    command.on('error', (error: string) => {
      this.onerror?.(new Error(error))
    })

    // 当子进程关闭时，清理 child 对象并调用 onclose 回调。
    command.on('close', () => {
      this._child = undefined
      this.onclose?.()
    })

    // 处理子进程 stdout 输出的数据（可能为 string 或 Uint8Array）。
    command.stdout.on('data', (chunk: string | Uint8Array) => {
      try {
        let chunkText: string
        if (typeof chunk === 'string') {
          chunkText = chunk
        } else {
          // 如果是 Uint8Array，则使用 TextDecoder 转换为字符串
          chunkText = this._decoder.decode(chunk, { stream: true })
        }
        this._readBuffer.append(chunkText)
        this.processReadBuffer()
      } catch (error) {
        this.onerror?.(error as Error)
      }
    })

    // 处理 stderr 输出的数据，将其包装为 Error 传递给 onerror 回调。
    command.stderr.on('data', (chunk: string | Uint8Array) => {
      let errorText: string
      if (typeof chunk === 'string') {
        errorText = chunk
      } else {
        errorText = this._decoder.decode(chunk, { stream: true })
      }
      this.onerror?.(new Error(errorText))
    })

    // 启动子进程，后续的数据会通过 stdout/stderr 事件分发。
    this._child = await command.spawn()
  }

  /**
   * 将 JSON-RPC 消息发送到子进程。
   */
  async send(message: JSONRPCMessage): Promise<void> {
    if (!this._child) {
      throw new Error('Not connected')
    }
    const json = serializeMessage(message)
    await this._child.write(json)
  }

  /**
   * 关闭 transport，终止子进程，并清空缓冲区。
   */
  async close(): Promise<void> {
    if (this._child) {
      await this._child.kill()
      this._child = undefined
    }
    this._readBuffer.clear()
  }

  /**
   * 从缓冲区中提取完整的 JSON-RPC 消息，并通过 onmessage 回调传递出去。
   */
  private processReadBuffer(): void {
    while (true) {
      try {
        const message = this._readBuffer.readMessage()
        if (message === null) {
          break
        }
        console.log(message)
        this.onmessage?.(message)
      } catch (error) {
        this.onerror?.(error as Error)
      }
    }
  }
}
