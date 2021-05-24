export enum TestResultsStatus {
  Passed = 'Passed',
  Unresolved = 'Unresolved',
  Failed = 'Failed',
}

export type TestResultsStatusLiteral = TestResultsStatus | `${TestResultsStatus}`
