export enum MatchLevelEnum {
  None = 'None',
  LegacyLayout = 'Layout1',
  Layout = 'Layout',
  Layout2 = 'Layout2',
  Content = 'Content',
  IgnoreColor = 'IgnoreColor',
  Strict = 'Strict',
  Exact = 'Exact',
}

export type MatchLevel = `${MatchLevelEnum}`
