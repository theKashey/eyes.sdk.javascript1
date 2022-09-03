import nock from 'nock'

const urlBase = 'https://eyesapi.applitools.com'
const urlPath = `/api/messages/sessions/12345/67890` // /sessionId/messageId
export const brokerURL = urlBase + urlPath

export function fakePublishMessage(error?: {statusCode: number; message: string}) {
  if (error) {
    nock(urlBase).post(urlPath).reply(error.statusCode, {error: error.message})
  } else {
    nock(urlBase)
      .post(urlPath)
      .reply(200, (_uri, requestBody) => requestBody)
  }
}

export function fakePollMessageResult() {
  let index = 0
  nock(urlBase)
    .get(urlPath + '-response')
    .times(2)
    .reply(() => {
      return index++ > 0 ? [200, {hello: 'world'}] : [404]
    })
}

export function fakeBrokerRequests(response: any) {
  let index = 0
  nock(urlBase)
    .post(urlPath)
    .reply(200, (_uri, requestBody) => requestBody)
    .get(urlPath + '-response')
    .times(2)
    .reply(() => {
      return index++ > 0 ? [200, response] : [404]
    })
}
