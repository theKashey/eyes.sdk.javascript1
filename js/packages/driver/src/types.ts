export type Location = {x: number; y: number}

export type Size = {width: number; height: number}

export type Region = Location & Size

export type ScreenOrientation = 'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'

export type Cookie = {
  name: string
  value: string
  domain?: string
  path?: string
  expiry?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}
