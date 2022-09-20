import * as utils from '@applitools/utils'

export const config: any = {
  serverUrl: 'https://eyesapi.applitools.com',
  ...utils.config.getConfig({params: ['apiKey', 'serverUrl', 'proxy']}),
}
export function getProxyCurlArg() {
  // HTTP_PROXY and HTTPS_PROXY are read by cURL.
  let proxyUrl
  if (config.proxy) {
    proxyUrl = new URL(utils.types.isString(config.proxy) ? config.proxy : config.proxy.url)
    if (config.proxy.username) proxyUrl.username = config.proxy.username
    if (config.proxy.password) proxyUrl.password = config.proxy.password
  }
  return proxyUrl ? `-x ${proxyUrl.href}` : ''
}

export function presult(promise) {
  return promise.then(
    v => [undefined, v],
    err => [err],
  )
}

export async function ptimeoutWithError(promiseOrPromiseFunc, timeout, err) {
  let promiseResolved = false
  const hasAborted = () => promiseResolved

  const promise = promiseOrPromiseFunc.then ? promiseOrPromiseFunc : promiseOrPromiseFunc(hasAborted)

  let cancel
  const v = await Promise.race([
    promise.then(
      v => ((promiseResolved = true), cancel && clearTimeout(cancel), v),
      err => ((promiseResolved = true), cancel && clearTimeout(cancel), Promise.reject(err)),
    ),
    new Promise(
      res =>
        (cancel = setTimeout(() => {
          if (promiseResolved) res(undefined)
          else {
            cancel = undefined
            promiseResolved = true
            res(Promise.reject(err))
          }
        }, timeout)),
    ),
  ])
  return v
}
