import type { DocumentInitParameters, PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api'
import { webpSupported } from './image-process'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs'

export async function getDocumentProxy(
  data: DocumentInitParameters['data'],
  options: DocumentInitParameters = {}
) {
  const pdf: PDFDocumentProxy = await getDocument({
    data,
    isEvalSupported: false,
    // See: https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
    useSystemFonts: true,
    ...options
  }).promise

  return pdf
}

export function isPDFDocumentProxy(data: unknown): data is PDFDocumentProxy {
  return typeof data === 'object' && data !== null && '_pdfInfo' in data
}

GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs'

export function extractText(
  data: DocumentInitParameters['data'] | PDFDocumentProxy,
  options?: { mergePages?: false },
): Promise<{
  totalPages: number
  text: string[]
}>
export function extractText(
  data: DocumentInitParameters['data'] | PDFDocumentProxy,
  options: { mergePages: true },
): Promise<{
  totalPages: number
  text: string
}>
export async function extractText(
  data: DocumentInitParameters['data'] | PDFDocumentProxy,
  options?: { mergePages?: boolean }
) {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be used in a browser environment.')
  }

  const pdf = isPDFDocumentProxy(data) ? data : await getDocumentProxy(data)
  const texts = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) => getPageText(pdf, i + 1))
  )

  return {
    totalPages: pdf.numPages,
    text: options?.mergePages ? texts.join('\n').replace(/\s+/g, ' ') : texts
  }
}

async function getPageText(document: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await document.getPage(pageNumber)
  const content = await page.getTextContent()

  return (
    (content.items as TextItem[])
      .filter(item => item.str != null)
      .map(item => item.str + (item.hasEOL ? '\n' : ''))
      .join('')
  )
}

export async function renderPageAsImage(
  data: DocumentInitParameters['data'] | PDFDocumentProxy,
  pageNumber: number,
  options: {
    scale?: number;
    width?: number;
    height?: number;
  } = {}
): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be used in a browser environment.')
  }
  const pdf = isPDFDocumentProxy(data) ? data : await getDocumentProxy(data)
  const page = await pdf.getPage(pageNumber)

  const defaultViewport = page.getViewport({ scale: 1.0 })
  let scale = options.scale || 1.0

  if (options.width) {
    scale = options.width / defaultViewport.width
  } else if (options.height) {
    scale = options.height / defaultViewport.height
  }

  const viewport = page.getViewport({ scale: Math.max(0, scale) })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport
  }).promise

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, webpSupported ? 'image/webp' : 'image/png', 0.8)
  })
}
