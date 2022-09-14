import {req} from '@applitools/req'

export async function publishMessageRequest(options: {url: string; payload: any; proxy?: any}): Promise<any> {
  const response = await req(options.url, {
    method: 'POST',
    body: options.payload,
    headers: {'Content-Type': 'application/json'},
    proxy: options.proxy,
    hooks: {
      afterResponse: async (response: any) => {
        if (response.response.status != 200) return
        return req(options.url + '-response', {
          retry: [{statuses: [404]}],
        })
      },
    },
  })
  if (response.status !== 200) {
    throw new Error(
      `something went wrong when communicating with the mobile application, please try running your test again (error code: ${response.status})`,
    )
  }
  return response
}

type CommonSelector = {
  type: string
  selector: string
}

export type ScreenshotSettings = {
  name?: string // for debugging (could be a step name)
  screenshotMode?: 'FULL_RESIZE' | 'FULL_SCROLL' | 'VIEWPORT' | 'FULL_REGION' // default is FULL_RESIZE
  scrollRootElement?: CommonSelector
  selectorsToFindRegionsFor?: Array<CommonSelector>
  hideCaret?: boolean
  waitBeforeCapture?: number
  overlap?: {
    top: number // pixels, TBD for iOS and Android
    bottom: number // pixels
  }
}

export type SnapshotSettings = {
  name?: string // for debugging (could be a step name)
  deviceList?: any // this info is grabbed from the job-info API endpoint in the UFG
  resourceSeparation?: boolean // split VHS into resources and upload separately, default true
  waitBeforeCapture?: number // MS
}

export interface BrokerRequest {
  protocolVersion: '1.0'
  name: 'TAKE_SCREENSHOT' | 'TAKE_SNAPSHOT'
  key: string // uuid
  payload: ScreenshotSettings | SnapshotSettings
}

export async function broker(url: string, request: BrokerRequest, options?: any) {
  const response = await publishMessageRequest({
    url,
    payload: request,
    ...options,
  })
  const {payload} = await response.json()
  if (!payload || (payload && payload.error))
    throw new Error(
      `There was a problem when interacting with the mobile application. The provided error message was "${payload.error.message}" and had a stack trace of "${payload.error.stack}"`,
    )
  return payload.result
}
