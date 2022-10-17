import type {ImageSettings} from '../types'
import {promises as fs} from 'fs'
import {req} from '@applitools/req'
import {makeImage} from '@applitools/image'
import * as utils from '@applitools/utils'

export async function transformImage({
  image,
  settings,
}: {
  image: Buffer | URL | string
  settings: ImageSettings
}): Promise<Buffer> {
  if (image instanceof URL) image = image.href

  if (utils.types.isString(image)) {
    const str = image // we need this var because ts-wise all our string formats checkers (isHttpUrl/isBase64) are string type guards
    if (utils.types.isHttpUrl(str)) {
      const response = await req(image)
      image = await response.buffer()
    } else if (!utils.types.isBase64(str) /* is file path/file protocol url */) {
      image = await fs.readFile(image.startsWith('file:') ? new URL(image) : image)
    }
  }
  const mutableImage = makeImage(image)
  if (settings.normalization || settings.region) {
    await mutableImage.debug({...settings.debugImages, suffix: 'original'})
    if (settings.normalization.scaleRatio) mutableImage.scale(settings.normalization.scaleRatio)
    if (settings.normalization.rotation) mutableImage.scale(settings.normalization.rotation)
    if (settings.normalization.cut) mutableImage.crop(settings.normalization.cut)
    await mutableImage.debug({...settings.debugImages, suffix: 'normalized'})
    if (settings.region) {
      mutableImage.crop(settings.region)
      await mutableImage.debug({...settings.debugImages, suffix: 'region'})
    }
  }
  return await mutableImage.toPng()
}
