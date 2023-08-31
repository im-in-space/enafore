import { decode as decodeBlurHash } from 'blurhash'
import registerPromiseWorker from 'promise-worker/register.js'
import { BLURHASH_RESOLUTION as RESOLUTION } from '../_static/blurhash.js'
import { isChromePre82 } from '../_utils/userAgent/isChromePre82.js'

// Disabled in Chrome because convertToBlob() is slow
const OFFSCREEN_CANVAS = !isChromePre82() && typeof OffscreenCanvas === 'function'
  ? new OffscreenCanvas(RESOLUTION, RESOLUTION)
  : null
const OFFSCREEN_CANVAS_CONTEXT_2D = OFFSCREEN_CANVAS
  ? OFFSCREEN_CANVAS.getContext('2d')
  : null

registerPromiseWorker(async (encoded) => {
  const pixels = decodeBlurHash(encoded, RESOLUTION, RESOLUTION)

  if (!pixels) {
    throw new Error('decode did not return any pixels')
  }
  const imageData = new ImageData(pixels, RESOLUTION, RESOLUTION)

  if (OFFSCREEN_CANVAS) {
    OFFSCREEN_CANVAS_CONTEXT_2D.putImageData(imageData, 0, 0)
    const blob = await OFFSCREEN_CANVAS.convertToBlob()
    const decoded = await new Promise((resolve, reject) => {
      const reader = new self.FileReader()
      reader.addEventListener('error', () => {
        reject(reader.error)
      })
      reader.addEventListener('load', () => {
        resolve(reader.result)
      })
      reader.readAsDataURL(blob)
    })
    return { decoded, imageData: null }
  } else {
    return { imageData, decoded: null }
  }
})
