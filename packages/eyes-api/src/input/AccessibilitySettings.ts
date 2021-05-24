import {AccessibilityLevelLiteral} from '../enums/AccessibilityLevel'
import {AccessibilityGuidelinesVersionLiteral} from '../enums/AccessibilityGuidelinesVersion'

export type AccessibilitySettings = {
  level?: AccessibilityLevelLiteral
  guidelinesVersion?: AccessibilityGuidelinesVersionLiteral
}
