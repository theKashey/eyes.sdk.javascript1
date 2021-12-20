function findImagePattern(image, pattern) {
  for (let pixel = 0; pixel < image.width * image.height; ++pixel) {
    if (isPattern(image, pixel, pattern)) {
      const patterOffset = pattern.offset * pattern.pixelRatio
      return {x: (pixel % image.width) - patterOffset, y: Math.floor(pixel / image.width) - patterOffset}
    }
  }
  return null
}

function isPattern(image, index, pattern) {
  const itemLength = pattern.size * pattern.pixelRatio
  for (const [itemIndex, itemColor] of pattern.mask.entries()) {
    for (let partOffset = itemIndex * itemLength; partOffset < (itemIndex + 1) * itemLength; ++partOffset) {
      const pixelColor = pixelColorAt(image, index + partOffset)
      if (pixelColor !== itemColor) return false
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

  return luminance < 128 ? /* black */ 1 : /* white */ 0
}

module.exports = findImagePattern
