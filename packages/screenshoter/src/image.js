const fs = require('fs')
const stream = require('stream')
const png = require('png-async')
const utils = require('@applitools/utils')

function makeImage(data) {
  let image, size
  if (utils.types.isBase64(data)) {
    const buffer = Buffer.from(data, 'base64')
    image = fromBuffer(buffer)
    size = extractPngSize(buffer)
  } else if (utils.types.isString(data)) {
    const buffer = fs.readFileSync(data)
    image = fromBuffer(buffer)
    size = extractPngSize(buffer)
  } else if (Buffer.isBuffer(data)) {
    image = fromBuffer(data)
    size = extractPngSize(data)
  } else {
    image = fromSize(data)
    size = data
  }

  return {
    get width() {
      return image.width || size.width
    },
    get height() {
      return image.height || size.height
    },
    async scale(scaleRatio) {
      image = await scale(await image, scaleRatio)
      return this
    },
    async crop(region) {
      image = await crop(await image, region)
      return this
    },
    async rotate(degree) {
      image = await rotate(await image, degree)
      return this
    },
    async copy(image2, offset) {
      image = await copy(await image, image2, offset)
      return this
    },
    async toObject() {
      image = await image
      return image
    },
    async toBuffer() {
      image = await image
      return image.data
    },
    async toPng() {
      return toPng(await image)
    },
    async toFile(path) {
      return toFile(await image, path)
    },
  }
}

async function fromBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const image = new png.Image({filterType: 4})

    image.parse(buffer, (err, image) => {
      if (err) return reject(err)
      resolve(image)
    })
  })
}

async function fromSize(size) {
  return new png.Image({filterType: 4, width: size.width, height: size.height})
}

async function toPng(image) {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)

    const writable = new stream.Writable({
      write(chunk, _encoding, next) {
        buffer = Buffer.concat([buffer, chunk])
        next()
      },
    })

    image
      .pack()
      .pipe(writable)
      .on('finish', () => resolve(buffer))
      .on('error', err => reject(err))
  })
}

async function toFile(image, path) {
  const buffer = await toPng(image)
  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer, err => (err ? reject(err) : resolve()))
  })
}

function extractPngSize(buffer) {
  return buffer.slice(12, 16).toString('ascii') === 'IHDR'
    ? {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)}
    : {width: 0, height: 0}
}

async function scale(image, scaleRatio) {
  if (scaleRatio === 1) return image

  const ratio = image.height / image.width
  const scaledWidth = Math.ceil(image.width * scaleRatio)
  const scaledHeight = Math.ceil(scaledWidth * ratio)
  return resize(image, {width: scaledWidth, height: scaledHeight})
}

async function resize(image, size) {
  const dst = {
    data: Buffer.alloc(size.height * size.width * 4),
    width: size.width,
    height: size.height,
  }

  if (dst.width > image.width || dst.height > image.height) {
    _doBicubicInterpolation(image, dst)
  } else {
    _scaleImageIncrementally(image, dst)
  }

  image.data = dst.data
  image.width = dst.width
  image.height = dst.height

  return image
}

async function crop(image, region) {
  if (utils.types.has(region, ['left', 'right', 'top', 'bottom'])) {
    region = {
      x: region.left,
      y: region.top,
      width: image.width - region.left - region.right,
      height: image.height - region.top - region.bottom,
    }
  }

  const srcX = Math.max(0, Math.round(region.x))
  const srcY = Math.max(0, Math.round(region.y))
  const dstWidth = Math.round(Math.min(image.width - srcX, region.width))
  const dstHeight = Math.round(Math.min(image.height - srcY, region.height))

  if (srcX === 0 && dstWidth === image.width) {
    const srcOffset = srcY * image.width * 4
    const dstLength = dstWidth * dstHeight * 4
    image.data = image.data.subarray(srcOffset, srcOffset + dstLength)
    image.width = dstWidth
    image.height = dstHeight

    return image
  }

  const cropped = Buffer.alloc(dstWidth * dstHeight * 4)

  const chunkLength = dstWidth * 4
  for (let chunk = 0; chunk < dstHeight; ++chunk) {
    const srcOffset = ((srcY + chunk) * image.width + srcX) * 4
    cropped.set(image.data.subarray(srcOffset, srcOffset + chunkLength), chunk * chunkLength)
  }

  image.data = cropped
  image.width = dstWidth
  image.height = dstHeight

  return image
}

async function rotate(image, degrees) {
  degrees = (360 + degrees) % 360

  const dstImage = {
    data: Buffer.alloc(image.data.length),
  }
  if (degrees === 90) {
    dstImage.width = image.height
    dstImage.height = image.width
    for (let srcY = 0, dstX = image.height - 1; srcY < image.height; ++srcY, --dstX) {
      for (let srcX = 0, dstY = 0; srcX < image.width; ++srcX, ++dstY) {
        const pixel = image.data.readUInt32BE((srcY * image.width + srcX) * 4)
        dstImage.data.writeUInt32BE(pixel, (dstY * dstImage.width + dstX) * 4)
      }
    }
  } else if (degrees === 180) {
    dstImage.width = image.width
    dstImage.height = image.height
    for (let srcY = 0, dstY = image.height - 1; srcY < image.height; ++srcY, --dstY) {
      for (let srcX = 0, dstX = image.width - 1; srcX < image.width; ++srcX, --dstX) {
        const pixel = image.data.readUInt32BE((srcY * image.width + srcX) * 4)
        dstImage.data.writeUInt32BE(pixel, (dstY * dstImage.width + dstX) * 4)
      }
    }
  } else if (degrees === 270) {
    dstImage.width = image.height
    dstImage.height = image.width
    for (let srcY = 0, dstX = 0; srcY < image.height; ++srcY, ++dstX) {
      for (let srcX = 0, dstY = image.width - 1; srcX < image.width; ++srcX, --dstY) {
        const pixel = image.data.readUInt32BE((srcY * image.width + srcX) * 4)
        dstImage.data.writeUInt32BE(pixel, (srcX * dstImage.width + dstY) * 4)
      }
    }
  } else {
    return image
  }

  image.data = dstImage.data
  image.width = dstImage.width
  image.height = dstImage.height

  return image
}

async function copy(dstImage, srcImage, offset) {
  const dstX = Math.round(offset.x)
  const dstY = Math.round(offset.y)
  const srcWidth = Math.min(srcImage.width, dstImage.width - dstX)
  const srcHeight = Math.min(srcImage.height, dstImage.height - dstY)

  if (dstX === 0 && srcWidth === dstImage.width && srcWidth === srcImage.width) {
    const dstOffset = dstY * dstImage.width * 4
    dstImage.data.set(srcImage.data.subarray(0, srcWidth * srcHeight * 4), dstOffset)

    return dstImage
  }

  const chunkLength = srcWidth * 4
  for (let chunk = 0; chunk < srcHeight; ++chunk) {
    const srcOffset = chunk * srcImage.width * 4
    const dstOffset = ((dstY + chunk) * dstImage.width + dstX) * 4
    dstImage.data.set(srcImage.data.subarray(srcOffset, srcOffset + chunkLength), dstOffset)
  }

  return dstImage
}

function _interpolateCubic(x0, x1, x2, x3, t) {
  const a0 = x3 - x2 - x0 + x1
  const a1 = x0 - x1 - a0
  const a2 = x2 - x0

  return Math.ceil(Math.max(0, Math.min(255, a0 * (t * t * t) + a1 * (t * t) + (a2 * t + x1))))
}

function _interpolateRows(bufSrc, wSrc, hSrc, wDst) {
  const buf = Buffer.alloc(wDst * hSrc * 4)
  for (let i = 0; i < hSrc; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      const x = (j * (wSrc - 1)) / wDst
      const xPos = Math.floor(x)
      const t = x - xPos
      const srcPos = (i * wSrc + xPos) * 4
      const buf1Pos = (i * wDst + j) * 4
      for (let k = 0; k < 4; k += 1) {
        const kPos = srcPos + k
        const x0 = xPos > 0 ? bufSrc[kPos - 4] : 2 * bufSrc[kPos] - bufSrc[kPos + 4]
        const x1 = bufSrc[kPos]
        const x2 = bufSrc[kPos + 4]
        const x3 = xPos < wSrc - 2 ? bufSrc[kPos + 8] : 2 * bufSrc[kPos + 4] - bufSrc[kPos]
        buf[buf1Pos + k] = _interpolateCubic(x0, x1, x2, x3, t)
      }
    }
  }

  return buf
}

function _interpolateColumns(bufSrc, hSrc, wDst, hDst) {
  const buf = Buffer.alloc(wDst * hDst * 4)
  for (let i = 0; i < hDst; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      const y = (i * (hSrc - 1)) / hDst

      const yPos = Math.floor(y)
      const t = y - yPos
      const buf1Pos = (yPos * wDst + j) * 4
      const buf2Pos = (i * wDst + j) * 4
      for (let k = 0; k < 4; k += 1) {
        const kPos = buf1Pos + k
        const y0 = yPos > 0 ? bufSrc[kPos - wDst * 4] : 2 * bufSrc[kPos] - bufSrc[kPos + wDst * 4]
        const y1 = bufSrc[kPos]
        const y2 = bufSrc[kPos + wDst * 4]
        const y3 =
          yPos < hSrc - 2 ? bufSrc[kPos + wDst * 8] : 2 * bufSrc[kPos + wDst * 4] - bufSrc[kPos]

        buf[buf2Pos + k] = _interpolateCubic(y0, y1, y2, y3, t)
      }
    }
  }

  return buf
}

function _interpolateScale(bufColumns, wDst, hDst, wDst2, m, wM, hM) {
  const buf = Buffer.alloc(wDst * hDst * 4)
  for (let i = 0; i < hDst; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let realColors = 0
      for (let y = 0; y < hM; y += 1) {
        const yPos = i * hM + y
        for (let x = 0; x < wM; x += 1) {
          const xPos = j * wM + x
          const xyPos = (yPos * wDst2 + xPos) * 4
          const pixelAlpha = bufColumns[xyPos + 3]
          if (pixelAlpha) {
            r += bufColumns[xyPos]
            g += bufColumns[xyPos + 1]
            b += bufColumns[xyPos + 2]
            realColors += 1
          }
          a += pixelAlpha
        }
      }

      const pos = (i * wDst + j) * 4
      buf[pos] = realColors ? Math.round(r / realColors) : 0
      buf[pos + 1] = realColors ? Math.round(g / realColors) : 0
      buf[pos + 2] = realColors ? Math.round(b / realColors) : 0
      buf[pos + 3] = Math.round(a / m)
    }
  }

  return buf
}

function _doBicubicInterpolation(src, dst) {
  // The implementation was taken from
  // https://github.com/oliver-moran/jimp/blob/master/resize2.js

  // when dst smaller than src/2, interpolate first to a multiple between 0.5 and 1.0 src, then sum squares
  const wM = Math.max(1, Math.floor(src.width / dst.width))
  const wDst2 = dst.width * wM
  const hM = Math.max(1, Math.floor(src.height / dst.height))
  const hDst2 = dst.height * hM

  // Pass 1 - interpolate rows
  // bufRows has width of dst2 and height of src
  const bufRows = _interpolateRows(src.data, src.width, src.height, wDst2)

  // Pass 2 - interpolate columns
  // bufColumns has width and height of dst2
  const bufColumns = _interpolateColumns(bufRows, src.height, wDst2, hDst2)

  // Pass 3 - scale to dst
  const m = wM * hM
  if (m > 1) {
    dst.data = _interpolateScale(bufColumns, dst.width, dst.height, wDst2, m, wM, hM)
  } else {
    dst.data = bufColumns
  }

  return dst
}

function _scaleImageIncrementally(src, dst) {
  let currentWidth = src.width
  let currentHeight = src.height
  const targetWidth = dst.width
  const targetHeight = dst.height

  dst.data = src.data
  dst.width = src.width
  dst.height = src.height

  // For ultra quality should use 7
  const fraction = 2

  do {
    const prevCurrentWidth = currentWidth
    const prevCurrentHeight = currentHeight

    // If the current width is bigger than our target, cut it in half and sample again.
    if (currentWidth > targetWidth) {
      currentWidth -= currentWidth / fraction

      // If we cut the width too far it means we are on our last iteration. Just set it to the target width
      // and finish up.
      if (currentWidth < targetWidth) {
        currentWidth = targetWidth
      }
    }

    // If the current height is bigger than our target, cut it in half and sample again.
    if (currentHeight > targetHeight) {
      currentHeight -= currentHeight / fraction

      // If we cut the height too far it means we are on our last iteration. Just set it to the target height
      // and finish up.
      if (currentHeight < targetHeight) {
        currentHeight = targetHeight
      }
    }

    // Stop when we cannot incrementally step down anymore.
    if (prevCurrentWidth === currentWidth && prevCurrentHeight === currentHeight) {
      return dst
    }

    // Render the incremental scaled image.
    const incrementalImage = {
      data: Buffer.alloc(currentWidth * currentHeight * 4),
      width: currentWidth,
      height: currentHeight,
    }
    _doBicubicInterpolation(dst, incrementalImage)

    // Now treat our incremental partially scaled image as the src image
    // and cycle through our loop again to do another incremental scaling of it (if necessary).
    dst.data = incrementalImage.data
    dst.width = incrementalImage.width
    dst.height = incrementalImage.height
  } while (currentWidth !== targetWidth || currentHeight !== targetHeight)

  return dst
}

module.exports = makeImage
