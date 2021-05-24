import {AccessibilityStatusLiteral} from '../enums/AccessibilityStatus'
import {AccessibilityLevelLiteral} from '../enums/AccessibilityLevel'
import {AccessibilityGuidelinesVersionLiteral} from '../enums/AccessibilityGuidelinesVersion'

export type TestAccessibilityStatus = {
  readonly status: AccessibilityStatusLiteral
  readonly level: AccessibilityLevelLiteral
  readonly version: AccessibilityGuidelinesVersionLiteral
}
