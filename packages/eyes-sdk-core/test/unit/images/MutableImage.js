const MutableImage = require('../../../lib/images/MutableImage')
const fs = require('fs')
const path = require('path')
const Region = require('../../../lib/geometry/Region')
const Location = require('../../../lib/geometry/Location')
const RectangleSize = require('../../../lib/geometry/RectangleSize')
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

      // without Math.round the resulting image is blank
      await stitched.copyRasterData(11.1, 22.2, image)

      const cropped = await stitched.crop(
        new Region(
          new Location(100, 200),
          new RectangleSize(image.getWidth() - 200, image.getHeight() - 200),
        ),
      )

      const croppedBuffer = await cropped.getImageBuffer()
      const stitchedBuffer = await stitched.getImageBuffer()
      const diff = Buffer.compare(croppedBuffer, stitchedBuffer)
      expect(diff).to.equal(0)
    } catch (error) {
      throw error
    }
  })
})
