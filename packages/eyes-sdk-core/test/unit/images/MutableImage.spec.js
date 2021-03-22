const MutableImage = require('../../../lib/images/MutableImage')
const fs = require('fs')
const path = require('path')
const expect = require('chai').expect

describe('MutableImage', () => {
  it('should copy raster data with fractions', async () => {
    try {
      const image = new MutableImage(
        fs.readFileSync(path.join(__dirname, '../../fixtures/SrcImage.png')),
      )

      const width = image.getWidth()
      const height = image.getHeight()

      const stitched = MutableImage.newImage(width, height)

      await stitched.copyRasterData(11.1, 22.2, image)
      const stitchedBuffer = await stitched.getImageBuffer()
      const localStitchedBuffer = fs.readFileSync(
        path.join(__dirname, '../../fixtures/stitched.png'),
      )
      const diff = Buffer.compare(stitchedBuffer, localStitchedBuffer)
      expect(diff).to.equal(0)
    } catch (error) {
      throw error
    }
  })
})
