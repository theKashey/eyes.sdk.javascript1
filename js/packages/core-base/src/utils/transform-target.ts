import type {Target, ImageSettings} from '../types'
import {promises as fs} from 'fs'
import {req} from '@applitools/req'
import {makeImage} from '@applitools/image'
import * as utils from '@applitools/utils'

export async function transformTarget({target, settings}: {target: Target; settings?: ImageSettings}): Promise<Target> {
  if (target.image instanceof URL) target.image = target.image.href
  if (utils.types.isString(target.image)) {
    const str = target.image // we need this var because ts-wise all our string formats checkers (isHttpUrl/isBase64) are string type guards
    if (utils.types.isHttpUrl(str)) {
      const response = await req(target.image, {proxy: settings?.autProxy})
      target.image = await response.buffer()
    } else if (!utils.types.isBase64(str) /* is file path/file protocol url */) {
      target.image = await fs.readFile(target.image.startsWith('file:') ? new URL(target.image) : target.image)
    }
  }
  const image = makeImage(target.image)
  if (settings?.normalization || settings?.region) {
    await image.debug({...settings.debugImages, suffix: 'original'})
    if (settings.normalization) {
      if (settings.normalization.scaleRatio) image.scale(settings.normalization.scaleRatio)
      if (settings.normalization.rotation) image.rotate(settings.normalization.rotation)
      if (settings.normalization.cut) image.crop(settings.normalization.cut)
      await image.debug({...settings.debugImages, suffix: 'normalized'})
    }
    if (settings.region) {
      image.crop(settings.region)
      await image.debug({...settings.debugImages, suffix: 'region'})
    }
  }
  target.image = await image.toPng()

  if (!target.size || settings.normalization || settings.region) {
    target.size = image.size
  }

  return target
}
