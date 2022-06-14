const EYES_NAMESPACE = '__EYES__APPLITOOLS__'
const LAZY_LOAD_KEY = 'lazyLoadResult'
window[EYES_NAMESPACE] = window[EYES_NAMESPACE] || {}
const currentScrollPosition = require('./getElementScrollOffset')
const scrollTo = require('./scrollTo')

// NOTE:
// This snippet uses `scrollTo`, which sets `scroll-behavior` to `auto`,
// and is called on each scrolling iteration.
function lazyLoad([{scrollLength, waitingTime, maxAmountToScroll} = {}] = []) {
  try {
    if (window[EYES_NAMESPACE][LAZY_LOAD_KEY]) {
      const state = window[EYES_NAMESPACE][LAZY_LOAD_KEY]
      if (state.status !== 'WIP') delete window[EYES_NAMESPACE][LAZY_LOAD_KEY]
      return JSON.stringify(state)
    } else {
      window[EYES_NAMESPACE][LAZY_LOAD_KEY] = {status: 'WIP'}
      const startingScrollPosition = currentScrollPosition()
      const log = []
      log.push({
        maxAmountToScroll,
        scrollLength,
        waitingTime,
        startingScrollPositionX: startingScrollPosition.x,
        startingScrollPositionY: startingScrollPosition.y,
      })
      const start = Date.now()

      function scrollAndWait({doneScrolling, previousScrollResult = {}} = {}) {
        setTimeout(() => {
          try {
            if (doneScrolling) {
              const {x, y} = scrollTo([undefined, startingScrollPosition])
              log.push({
                x,
                y,
                msSinceStart: Date.now() - start,
              })
              window[EYES_NAMESPACE][LAZY_LOAD_KEY] = {status: 'SUCCESS', value: log}
              return
            }
            const {x, y} = scrollTo([
              undefined,
              {
                x: startingScrollPosition.x,
                y: previousScrollResult.y + scrollLength,
              },
            ])
            log.push({
              x,
              y,
              msSinceStart: Date.now() - start,
            })
            scrollAndWait({
              doneScrolling: y === previousScrollResult.y || y === maxAmountToScroll,
              previousScrollResult: {x, y},
            })
          } catch (error) {
            window[EYES_NAMESPACE][LAZY_LOAD_KEY] = {status: 'ERROR', error}
          }
        }, waitingTime)
      }

      scrollAndWait()
      return JSON.stringify(window[EYES_NAMESPACE][LAZY_LOAD_KEY])
    }
  } catch (error) {
    window[EYES_NAMESPACE][LAZY_LOAD_KEY] = {status: 'ERROR', error}
    return JSON.stringify(window[EYES_NAMESPACE][LAZY_LOAD_KEY])
  }
}

module.exports = lazyLoad
