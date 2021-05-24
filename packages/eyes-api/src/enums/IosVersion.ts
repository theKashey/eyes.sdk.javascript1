export enum IosVersion {
  LATEST = 'latest',
  ONE_VERSION_BACK = 'latest-1',
  /** @deprecated */
  LATEST_ONE_VERSION_BACK = 'latest-1',
}

export type IosVersionLiteral = IosVersion | `${IosVersion}`
