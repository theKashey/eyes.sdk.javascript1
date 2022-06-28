export enum AndroidVersionEnum {
  LATEST = 'latest',
  ONE_VERSION_BACK = 'latest-1',
  TWO_VERSIONS_BACK = 'latest-2',
}

export type AndroidVersion = `${AndroidVersionEnum}`
