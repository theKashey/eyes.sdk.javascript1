export enum AccessibilityRegionType {
  IgnoreContrast = 'IgnoreContrast',
  RegularText = 'RegularText',
  LargeText = 'LargeText',
  BoldText = 'BoldText',
  GraphicalObject = 'GraphicalObject',
}

export type AccessibilityRegionTypeLiteral = AccessibilityRegionType | `${AccessibilityRegionType}`
