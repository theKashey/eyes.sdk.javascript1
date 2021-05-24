export enum FailureReport {
  IMMEDIATE = 'IMMEDIATE',
  ON_CLOSE = 'ON_CLOSE',
}

export type FailureReportLiteral = FailureReport | `${FailureReport}`
