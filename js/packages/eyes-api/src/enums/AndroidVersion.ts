export enum AndroidVersionEnum {
  LATEST = 'latest',
  ONE_VERSION_BACK = 'latest-1',
}

export type AndroidVersion = `${AndroidVersionEnum}`
