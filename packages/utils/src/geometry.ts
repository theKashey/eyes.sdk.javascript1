import * as types from './types'
import * as guard from './guard'

type Location = {x: number; y: number}
type RectangleSize = {width: number; height: number}
type Region = Location & RectangleSize

export function location(region: Region): Location {
  return {x: region.x, y: region.y}
}

export function size(region: Region): RectangleSize {
  return {width: region.width, height: region.height}
}

export function region(location: Location, size: RectangleSize) {
  if (!location) location = {x: 0, y: 0}
  return {x: location.x, y: location.y, width: size.width, height: size.height}
}

export function isEmpty(size: RectangleSize): boolean
export function isEmpty(region: Region): boolean
export function isEmpty(sizeOrRegion: RectangleSize | Region): boolean {
  return sizeOrRegion.width === 0 || sizeOrRegion.height === 0
}

export function round(region: Region): Region
export function round(region: RectangleSize): RectangleSize
export function round(region: Location): Location
export function round(target: Region | RectangleSize | Location): typeof target {
  const result = {...target} as any
  if (types.has(target, ['x', 'y'])) {
    result.x = Math.round(target.x)
    result.y = Math.round(target.y)
  }
  if (types.has(target, ['width', 'height'])) {
    result.width = Math.round(target.width)
    result.height = Math.round(target.height)
  }
  return result
}

export function ceil(region: Region): Region
export function ceil(region: RectangleSize): RectangleSize
export function ceil(region: Location): Location
export function ceil(target: Region | RectangleSize | Location): typeof target {
  const result = {...target} as any
  if (types.has(target, ['x', 'y'])) {
    // intentionally using Math.round and not Math.ceil here, because the point is that for width and height it makes sense to use ceil, but not for x and y
    result.x = Math.round(target.x)
    result.y = Math.round(target.y)
  }
  if (types.has(target, ['width', 'height'])) {
    result.width = Math.ceil(target.width)
    result.height = Math.ceil(target.height)
  }
  return result
}

export function rotate(size: RectangleSize, degrees: number): RectangleSize
export function rotate(region: Region, degrees: number, size: RectangleSize): Region
export function rotate(location: Location, degrees: number, size: RectangleSize): RectangleSize
export function rotate(
  target: Region | RectangleSize | Location,
  degrees: number,
  size?: RectangleSize,
): typeof target {
  degrees = (360 + degrees) % 360
  const result = {} as any
  if (types.has(target, ['width', 'height'])) {
    // rotate size
    if (degrees === 90 || degrees === 270) {
      result.width = target.height
      result.height = target.width
    } else {
      result.width = target.width
      result.height = target.height
    }
  }
  if (types.has(target, ['x', 'y'])) {
    const hasSize = types.has(target, ['width', 'height'])
    // rotate coordinate system around a target
    if (degrees === 0) {
      result.x = target.x
      result.y = target.y
    } else if (degrees === 90) {
      result.x = size.height - target.y
      result.y = target.x
      if (hasSize) result.x -= result.width
    } else if (degrees === 180) {
      result.x = size.width - target.x
      result.y = size.height - target.y
      if (hasSize) {
        result.x -= result.width
        result.y -= result.height
      }
    } else if (degrees === 270) {
      result.x = target.y
      result.y = size.width - target.x
      if (hasSize) result.y -= result.height
    }
  }
  return result
}

export function scale(region: Region, scaleRatio: number): Region
export function scale(size: RectangleSize, scaleRatio: number): RectangleSize
export function scale(location: Location, scaleRatio: number): Location
export function scale(target: Region | RectangleSize | Location, scaleRatio: number): typeof target {
  const result = {...target} as any
  if (types.has(target, ['x', 'y'])) {
    result.x = target.x * scaleRatio
    result.y = target.y * scaleRatio
  }
  if (types.has(target, ['width', 'height'])) {
    result.width = target.width * scaleRatio
    result.height = target.height * scaleRatio
  }
  return result
}

export function offset(region: Region, offset: Location): Region
export function offset(location: Location, offset: Location): Location
export function offset(target: Location | Region, offset: Location): typeof target {
  const result = {...target}
  result.x += offset.x
  result.y += offset.y
  return result
}

export function offsetNegative(region: Region, offset: Location): Region
export function offsetNegative(location: Location, offset: Location): Location
export function offsetNegative(target: Location | Region, offset: Location): typeof target {
  const result = {...target}
  result.x -= offset.x
  result.y -= offset.y
  return result
}

export function intersect(region1: Region, region2: Region): Region {
  if (!isIntersected(region1, region2)) return {x: 0, y: 0, width: 0, height: 0}
  const result = {} as Region
  result.x = Math.max(region1.x, region2.x)
  result.y = Math.max(region1.y, region2.y)
  result.width = Math.min(region1.x + region1.width, region2.x + region2.width) - result.x
  result.height = Math.min(region1.y + region1.height, region2.y + region2.height) - result.y

  return result
}

export function isIntersected(region1: Region, region2: Region): boolean {
  return (
    (region1.x <= region2.x ? region2.x < region1.x + region1.width : region1.x < region2.y + region2.width) &&
    (region1.y <= region2.y ? region2.y < region1.y + region1.height : region1.y < region2.y + region2.height)
  )
}

export function contains(region: Region, location: Location): boolean
export function contains(region: Region, innerRegion: Region): boolean
export function contains(region: Region, locationOrRegion: Location | Region): boolean {
  if (region.x <= locationOrRegion.x && region.y <= locationOrRegion.y) {
    if (types.has(locationOrRegion, ['width', 'height'])) {
      return (
        region.x + region.width >= locationOrRegion.x + locationOrRegion.width &&
        region.y + region.height >= locationOrRegion.y + locationOrRegion.height
      )
    }
    return true
  }
  return false
}

export function equals(region1: Region, region2: Region): boolean
export function equals(location1: Location, location2: Location): boolean
export function equals(size1: RectangleSize, size2: RectangleSize): boolean
export function equals(
  locationOrSizeOrRegion1: Location | RectangleSize | Region,
  locationOrSizeOrRegion2: Location | RectangleSize | Region,
): boolean {
  if (types.has(locationOrSizeOrRegion1, ['x', 'y', 'width', 'height'])) {
    if (types.has(locationOrSizeOrRegion2, ['x', 'y', 'width', 'height'])) {
      return (
        locationOrSizeOrRegion1.x === locationOrSizeOrRegion2.x &&
        locationOrSizeOrRegion1.y === locationOrSizeOrRegion2.y &&
        locationOrSizeOrRegion1.width === locationOrSizeOrRegion2.width &&
        locationOrSizeOrRegion1.height === locationOrSizeOrRegion2.height
      )
    }
    return false
  }
  if (types.has(locationOrSizeOrRegion1, ['x', 'y'])) {
    if (types.has(locationOrSizeOrRegion2, ['x', 'y'])) {
      return (
        locationOrSizeOrRegion1.x === locationOrSizeOrRegion2.x &&
        locationOrSizeOrRegion1.y === locationOrSizeOrRegion2.y
      )
    }
    return false
  }
  if (types.has(locationOrSizeOrRegion1, ['width', 'height'])) {
    if (types.has(locationOrSizeOrRegion2, ['width', 'height'])) {
      return (
        locationOrSizeOrRegion1.width === locationOrSizeOrRegion2.width &&
        locationOrSizeOrRegion1.height === locationOrSizeOrRegion2.height
      )
    }
    return false
  }
}

export function divide(region: Region, size: RectangleSize, padding: {top?: number; bottom?: number} = {}): Region[] {
  guard.notNull(region, {name: 'region'})
  guard.notNull(size, {name: 'size'})
  guard.isNumber(size.width, {name: 'size.width', gt: 0})
  guard.isNumber(size.height, {name: 'size.height', gt: 0})

  padding.top ??= 0
  padding.bottom ??= 0

  const subRegions = []

  const maxX = region.x + region.width
  const maxY = region.y + region.height

  const stepX = size.width
  const stepY = padding.top + padding.bottom < size.height ? size.height - (padding.top + padding.bottom) : size.height

  let currentY = region.y
  while (currentY < maxY) {
    let nextY = Math.min(currentY + stepY, maxY)
    // first region
    if (currentY === region.y) nextY += padding.top
    // last region
    else if (nextY < maxY && nextY + padding.top >= maxY) nextY = maxY

    const currentHeight = nextY - currentY

    let currentX = region.x
    while (currentX < maxX) {
      const nextX = Math.min(currentX + stepX, maxX)
      const currentWidth = nextX - currentX
      subRegions.push({x: currentX, y: currentY, width: currentWidth, height: currentHeight})
      currentX = nextX
    }

    currentY = nextY
  }
  return subRegions
}
