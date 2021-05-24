export enum AccessibilityStatus {
  Passed = 'Passed',
  Failed = 'Failed',
}

export type AccessibilityStatusLiteral = AccessibilityStatus | `${AccessibilityStatus}`
