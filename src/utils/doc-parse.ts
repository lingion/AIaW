import { DocParseBaseURL } from './config'
import { fetch } from './platform-api'

interface ParsedDoc {
  meta: Record<string, any>
  text: string
}

interface ParseResult {
  success: boolean
  content?: ParsedDoc[]
}

async function parseDoc(file: Blob, { language, targetPages }) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    language && formData.append('language', language)
    targetPages && formData.append('target_pages', targetPages)

    const response = await fetch(`${DocParseBaseURL}/parse`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: ParseResult = await response.json()
    if (!data.success) {
      throw new Error('Failed to parse document')
    }
    return data.content
  } catch (error) {
    console.error('Error parsing document:', error)
    throw error
  }
}

export { parseDoc }
export type { ParsedDoc }
