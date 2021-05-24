export enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export type ScreenOrientationLiteral = ScreenOrientation | `${ScreenOrientation}`
