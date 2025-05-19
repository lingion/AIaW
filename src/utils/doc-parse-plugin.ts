import { i18n } from 'src/boot/i18n'
import { Plugin, ApiResultItem, PluginData } from './types'
import { Object as TObject, String as TString } from '@sinclair/typebox'

import { DocParseBaseURL } from './config'
import { unzipSync, strFromU8 } from 'fflate'
import { parsePageRange } from './functions'
import { Dialog } from 'quasar'

async function parseDoc(file: Blob, { language, targetPages }): Promise<ApiResultItem[]> {
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

    const data = await response.json()
    if (!data.success) {
      throw new Error('Failed to parse document')
    }
    return [{
      type: 'text',
      contentText: data.content.map(c => c.text).join('\n---\n')
    }]
  } catch (error) {
    console.error('Error parsing document:', error)
    throw error
  }
}

async function extractPdfText(file: Blob, { targetPages }): Promise<ApiResultItem[]> {
  const { extractText } = await import('./pdf')
  const { text } = await extractText(await file.arrayBuffer())
  if (text.filter(t => t.trim()).length < text.length / 2) {
    Dialog.create({
      title: t('docParsePlugin.emptyPagesDialog.title'),
      message: t('docParsePlugin.emptyPagesDialog.message')
    })
  }
  const result = (targetPages ? targetPages.map(i => text[i]) : text).join('\n\n')
  return result.trim() ? [{
    type: 'text',
    contentText: result
  }] : []
}

const pagesLimit = 30
async function renderPdfImages(file: Blob, { targetPages }): Promise<ApiResultItem[]> {
  const { getDocumentProxy, renderPageAsImage } = await import('./pdf')
  const pdf = await getDocumentProxy(await file.arrayBuffer())
  const images: ApiResultItem[] = []
  const pages = targetPages ?? Array.from({ length: pdf.numPages }, (_, i) => i)
  if (!targetPages && pages.length > pagesLimit) {
    const continueRender = await new Promise((resolve) => {
      Dialog.create({
        title: t('docParsePlugin.pagesLimitDialog.title'),
        message: t('docParsePlugin.pagesLimitDialog.message', { limit: pagesLimit }),
        cancel: t('docParsePlugin.pagesLimitDialog.cancel'),
        ok: {
          flat: true,
          label: t('docParsePlugin.pagesLimitDialog.continue'),
          color: 'err'
        }
      }).onOk(() => resolve(true)).onCancel(() => resolve(false))
    })
    if (!continueRender) return []
  }
  for (const i of pages) {
    const image = await renderPageAsImage(pdf, i + 1, { height: 1440 })
    images.push({
      type: 'file',
      mimeType: image.type,
      contentBuffer: await image.arrayBuffer()
    })
  }
  return images
}

async function parseDocx(file: Blob): Promise<ApiResultItem[]> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const images: ApiResultItem[] = []
  let count = 0
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    convertImage: mammoth.images.imgElement(async (image) => {
      images.push({
        type: 'file',
        mimeType: image.contentType,
        contentBuffer: await image.readAsArrayBuffer()
      })
      return { src: '#', title: `image-${++count}` }
    })
  })
  return [{
    type: 'text',
    contentText: result.value
  }, ...images]
}

function rowsToMarkdown(rows) {
  if (!rows.length) return ''
  const head = rows[0].map(c => c == null ? '' : String(c))
  const body = rows.slice(1).map(r =>
    r.map(c => c == null ? '' : String(c))
  )
  const headerLine = '| ' + head.join(' | ') + ' |'
  const sepLine = '| ' + head.map(() => '---').join(' | ') + ' |'
  const bodyLines = body.map(r => '| ' + r.join(' | ') + ' |')
  return [headerLine, sepLine].concat(bodyLines).join('\n')
}

async function parseXlsx(file: Blob): Promise<ApiResultItem[]> {
  const { read, utils } = await import('xlsx-republish')
  const workbook = read(await file.arrayBuffer())
  const result = workbook.SheetNames.map(name => {
    const markdown = rowsToMarkdown(utils.sheet_to_json(workbook.Sheets[name], { header: 1 }))
    return `**${name}:**\n${markdown}`
  }).join('\n\n')
  return [{
    type: 'text',
    contentText: result
  }]
}

async function parsePptx(file: Blob, { targetPages }): Promise<ApiResultItem[]> {
  const uint8 = new Uint8Array(await file.arrayBuffer())
  const files = unzipSync(uint8)

  const slideFileNames = Object.keys(files).filter(name =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name)
  ).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]))

  const texts = slideFileNames.map(name => {
    const xmlStr = strFromU8(files[name])
    const doc = new DOMParser().parseFromString(xmlStr, 'application/xml')
    const textNodes = Array.from(doc.getElementsByTagName('a:p'))
    return textNodes.map(node => node.textContent).join('\n')
  })

  return [{
    type: 'text',
    contentText: (targetPages ? targetPages.map(i => texts[i]) : texts).join('\n\n---\n\n')
  }]
}

const { t } = i18n.global

const pluginId = 'aiaw-doc-parse-v2'

const plugin: Plugin = {
  id: pluginId,
  type: 'builtin',
  available: true,
  apis: [],
  fileparsers: [{
    name: 'pdf-extract-text',
    label: t('docParsePlugin.pdfExtractTextLabel'),
    description: t('docParsePlugin.pdfExtractTextDescription'),
    async execute({ file, range }) {
      return await extractPdfText(file, { targetPages: range ? parsePageRange(range) : undefined })
    },
    rangeInput: {
      label: t('docParsePlugin.rangeInput.label'),
      hint: t('docParsePlugin.rangeInput.hint')
    }
  }, {
    name: 'pdf-screenshot',
    label: t('docParsePlugin.pdfScreenshotLabel'),
    description: t('docParsePlugin.pdfScreenshotDescription'),
    async execute({ file, range }) {
      return await renderPdfImages(file, { targetPages: range ? parsePageRange(range) : undefined })
    },
    rangeInput: {
      label: t('docParsePlugin.rangeInput.label'),
      hint: t('docParsePlugin.rangeInput.hint')
    }
  }, {
    name: 'docx-parse',
    label: t('docParsePlugin.docxParseLabel'),
    description: t('docParsePlugin.docxParseDescription'),
    async execute({ file }) {
      return await parseDocx(file)
    }
  }, {
    name: 'xlsx-parse',
    label: t('docParsePlugin.xlsxParseLabel'),
    description: t('docParsePlugin.xlsxParseDescription'),
    async execute({ file }) {
      return await parseXlsx(file)
    }
  }, {
    name: 'pptx-parse',
    label: t('docParsePlugin.pptxParseLabel'),
    description: t('docParsePlugin.pptxParseDescription'),
    async execute({ file, range }) {
      return await parsePptx(file, { targetPages: range ? parsePageRange(range) : undefined })
    },
    rangeInput: {
      label: t('docParsePlugin.rangeInput.label'),
      hint: t('docParsePlugin.rangeInput.hint')
    }
  }, {
    name: 'llama-parse',
    description: t('docParsePlugin.llamaParseDescription'),
    async execute({ file, range }, settings) {
      return await parseDoc(file, {
        language: settings.ocrLanguage,
        targetPages: range ? parsePageRange(range).join(',') : undefined
      })
    },
    rangeInput: {
      label: t('docParsePlugin.rangeInput.label'),
      hint: t('docParsePlugin.rangeInput.hint')
    }
  }],
  settings: TObject({
    ocrLanguage: TString({ title: t('docParsePlugin.ocrLanguage'), description: t('docParsePlugin.ocrLanguageDescription') })
  }),
  title: t('docParsePlugin.title'),
  description: t('docParsePlugin.description')
}

const defaultData: PluginData = {
  settings: { ocrLanguage: 'en' },
  avatar: { type: 'icon', icon: 'sym_o_description', hue: 190 },
  fileparsers: {
    'pdf-extract-text': { enabled: true, mimeTypes: ['application/pdf'] },
    'pdf-screenshot': { enabled: true, mimeTypes: ['application/pdf'] },
    'docx-parse': { enabled: true, mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
    'xlsx-parse': { enabled: true, mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
    'pptx-parse': { enabled: true, mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'] },
    'llama-parse': { enabled: true, mimeTypes: ['application/*'] }
  }
}

export default {
  pluginId,
  plugin,
  defaultData
}
