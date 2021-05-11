import AccessibilityLevel from '../enums/AccessibilityLevel'
import AccessibilityGuidelinesVersion from '../enums/AccessibilityGuidelinesVersion'
import AccessibilityStatus from '../enums/AccessibilityStatus'

export type TestAccessibilityStatus = {
  readonly level: AccessibilityLevel
  readonly version: AccessibilityGuidelinesVersion
  readonly status: AccessibilityStatus
}
