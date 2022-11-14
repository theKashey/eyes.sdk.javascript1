import {RectangleSize} from './RectangleSize'
import {Location} from './Location'

export type Image = {
  image: Buffer | URL | string
  name?: string
  dom?: string
  locationInViewport?: Location // location in the viewport
  locationInView?: Location // location in view/page
  fullViewSize?: RectangleSize // full size of the view/page
}
