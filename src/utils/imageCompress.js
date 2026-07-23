/**
 * Fast client-side image compression before upload.
 * Shrinks large files in the browser so uploads finish quicker.
 */
export async function compressImageFile(
  file,
  {
    maxBytes = 1024 * 1024,
    maxDimension = 1200,
    quality = 0.82,
    minQuality = 0.5,
  } = {},
) {
  if (!file || !file.type?.startsWith('image/')) return file
  if (file.size <= maxBytes) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file.size <= maxBytes ? file : null
  }

  const toBlob = (canvas, q) => new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', q)
  })

  let dim = maxDimension
  let blob = null

  while (dim >= 480) {
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale = longest > dim ? dim / longest : 1
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) break

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    let q = quality
    blob = await toBlob(canvas, q)
    while (blob && blob.size > maxBytes && q > minQuality) {
      q = Math.max(minQuality, q - 0.1)
      blob = await toBlob(canvas, q)
    }

    if (blob && blob.size <= maxBytes) break
    dim = Math.round(dim * 0.75)
  }

  bitmap.close?.()

  if (!blob) return file.size <= maxBytes ? file : null

  const stem = (file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${stem}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}
