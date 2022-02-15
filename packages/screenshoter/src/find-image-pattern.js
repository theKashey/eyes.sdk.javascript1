function findImagePattern(image, pattern) {
  for (let pixel = 0; pixel < image.width * image.height; ++pixel) {
    if (isPattern(image, pixel, pattern)) {
      const patterOffset = Math.round(pattern.offset * pattern.scale)
      return {x: (pixel % image.width) - patterOffset, y: Math.floor(pixel / image.width) - patterOffset}
    }
  }
  return null
}

function isPattern(image, offset, pattern) {
  const length = Math.round(pattern.size * pattern.scale)
  for (const [index, color] of pattern.mask.entries()) {
    const maxLength = index * pattern.size * pattern.scale // how many pixels actually could be occupied at this point
    const missedPixels = Math.abs(maxLength - Math.round(maxLength)) // how many pixels were missed due to rounding
    const skippedPixels = missedPixels >= 0.25 ? Math.ceil(missedPixels) : 0 // how many pixels should be skipped from checking in pattern (usually 1 or 0)
    for (let pixel = index * length; pixel < (index + 1) * length - skippedPixels; ++pixel) {
      const pixelColor = pixelColorAt(image, offset + pixel)
      if (pixelColor !== color) return false
    }
  }
  return true
}

function pixelColorAt(image, index) {
  const channels = 4
  const r = image.data[index * channels]
  const g = image.data[index * channels + 1]
  const b = image.data[index * channels + 2]

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  // if luminance is between black and white check the color of previous pixel
  if (luminance >= 112 && luminance <= 144) return pixelColorAt(image, index - 1)
  else if (luminance < 128) return /* black */ 1
  else return /* white*/ 0
}

module.exports = findImagePattern
