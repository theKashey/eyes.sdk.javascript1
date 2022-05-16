import {type IncomingMessage} from 'http'
import getRawBody from 'raw-body'

export async function parseBody(request: IncomingMessage): Promise<Record<string, any> | undefined> {
  const body = await getRawBody(request, 'utf8')
  if (!body) return undefined
  try {
    return JSON.parse(body)
  } catch {
    return undefined
  }
}
