const webpSupported = (function () {
  const elem = document.createElement('canvas')
  return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
}())

function imageFromFile(file: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function encodeFromUint8ClampedArray(data: Uint8ClampedArray, width: number, height: number, quality = 0.8) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  const imgData = new ImageData(data, width, height)
  ctx.putImageData(imgData, 0, 0)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, webpSupported ? 'image/webp' : 'image/jpeg', quality)
  })
}

function encodeBlob(img, drawOptions, quality) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const { sx, sy, sw, sh, dw, dh } = drawOptions
  canvas.width = dw
  canvas.height = dh
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, webpSupported ? 'image/webp' : 'image/jpeg', quality)
  })
}

async function scaleBlob(imageFile: Blob, maxPixelNum: number, quality = 0.8) {
  const img = await imageFromFile(imageFile)
  const ratio = img.height / img.width
  const dw = Math.min(img.width, Math.sqrt(maxPixelNum / ratio))
  const dh = dw * ratio
  return encodeBlob(img, { sx: 0, sy: 0, sw: img.width, sh: img.height, dw, dh }, quality)
}

async function cropSquareBlob(imageFile: Blob, dSize: number, quality = 0.8) {
  const img = await imageFromFile(imageFile)
  const sSize = Math.min(img.width, img.height)
  return encodeBlob(img, { sx: 0, sy: 0, sw: sSize, sh: sSize, dw: dSize, dh: dSize }, quality)
}

async function resizeBlob(imageFile: Blob, dw: number, dh: number, quality = 0.8) {
  const img = await imageFromFile(imageFile)
  return encodeBlob(img, { sx: 0, sy: 0, sw: img.width, sh: img.height, dw, dh }, quality)
}

export { webpSupported, cropSquareBlob, encodeFromUint8ClampedArray, scaleBlob, resizeBlob }
