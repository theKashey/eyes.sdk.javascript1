const assert = require('assert')
const calculateScreenshotRegion = require('../../src/calculate-screenshot-region')

describe('calculate-screenshot-region', () => {
  it('respects x, y values when pre and post move offsets are equal', () => {
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 0, y: 0},
        postMoveOffset: {x: 0, y: 0},
        cropRegion: {x: 0, y: 0, width: 700, height: 460},
        stitchedImage: {size: {width: 958, height: 3540}},
      }),
      {
        x: 0,
        y: 0,
        width: 958,
        height: 3540,
      },
    )
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 246, y: 1030},
        postMoveOffset: {x: 246, y: 1030},
        cropRegion: {x: 390, y: 262, width: 310, height: 198},
        stitchedImage: {size: {width: 310, height: 198}},
      }),
      {
        x: 390,
        y: 262,
        width: 310,
        height: 198,
      },
    )
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 0, y: 0},
        postMoveOffset: {x: 0, y: 0},
        cropRegion: {x: 10, y: 15, width: 200, height: 150},
        stitchedImage: {size: {width: 200, height: 150}},
      }),
      {
        x: 10,
        y: 15,
        width: 200,
        height: 150,
      },
    )
  })
  it('compensates x, y values when pre and post move offsets differ', () => {
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 246, y: 1030},
        postMoveOffset: {x: 258, y: 1292},
        cropRegion: {x: 378, y: 0, width: 310, height: 197.875},
        stitchedImage: {size: {width: 310, height: 198}},
      }),
      {
        x: 390,
        y: 262,
        width: 310,
        height: 198,
      },
    )
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 0, y: 0},
        postMoveOffset: {x: 10, y: 15},
        cropRegion: {x: 0, y: 0, width: 200, height: 150},
        stitchedImage: {size: {width: 200, height: 150}},
      }),
      {
        x: 10,
        y: 15,
        width: 200,
        height: 150,
      },
    )
    assert.deepStrictEqual(
      calculateScreenshotRegion({
        preMoveOffset: {x: 0, y: 8},
        postMoveOffset: {x: 58, y: 8},
        cropRegion: {x: 0, y: 0, width: 602, height: 600},
        stitchedImage: {size: {width: 602, height: 2002}},
      }),
      {
        x: 58,
        y: 0,
        width: 602,
        height: 2002,
      },
    )
  })
})
