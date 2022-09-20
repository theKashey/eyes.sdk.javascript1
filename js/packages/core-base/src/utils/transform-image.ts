import type {ImageSettings} from '@applitools/types/base'
import {makeImage} from '@applitools/image'
import * as utils from '@applitools/utils'

export async function transformImage({image, settings}: {image: Buffer | string; settings: ImageSettings}) {
  if (utils.types.isHttpUrl(image)) return image
  if (settings.normalization || settings.region) {
    const mutableImage = makeImage(image)
    await mutableImage.debug({...settings.debugImages, suffix: 'original'})
    if (settings.normalization.scaleRatio) mutableImage.scale(settings.normalization.scaleRatio)
    if (settings.normalization.rotation) mutableImage.scale(settings.normalization.rotation)
    if (settings.normalization.cut) mutableImage.crop(settings.normalization.cut)
    await mutableImage.debug({...settings.debugImages, suffix: 'normalized'})
    if (settings.region) {
      mutableImage.crop(settings.region)
      await mutableImage.debug({...settings.debugImages, suffix: 'region'})
    }
    return await mutableImage.toPng()
  } else {
    return image
  }
}
