const MutableImage = require('../../../lib/images/MutableImage')
const fs = require('fs')
const path = require('path')

describe('MutableImage', () => {
  it('should copy raster data', async () => {
    try {
      const image = new MutableImage(
        fs.readFileSync(path.join(__dirname, '../../fixtures/SrcImage.png')),
      )
      const width = image.getWidth()
      const height = image.getHeight()
      const stitchedImage = MutableImage.newImage(width, height)
      await stitchedImage.copyRasterData(11.11, 33.444, image)
      Buffer.compare(await image.getImageBuffer(), await stitchedImage.getImageBuffer())
    } catch (error) {
      throw error
    }
  })
})
