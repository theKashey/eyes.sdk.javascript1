import type * as types from '@applitools/types'
import * as utils from '@applitools/utils'
import {TestResultsStatus, TestResultsStatusEnum} from '../enums/TestResultsStatus'
import {RectangleSize, RectangleSizeData} from '../input/RectangleSize'
import {TestAccessibilityStatus} from './TestAccessibilityStatus'
import {SessionUrls, SessionUrlsData} from './SessionUrls'
import {StepInfo, StepInfoData} from './StepInfo'

export type TestResults = {
  readonly id?: string
  readonly name?: string
  readonly secretToken?: string
  readonly status?: TestResultsStatus
  readonly appName?: string
  readonly batchId?: string
  readonly batchName?: string
  readonly branchName?: string
  readonly hostOS?: string
  readonly hostApp?: string
  readonly hostDisplaySize?: RectangleSize
  readonly accessibilityStatus?: TestAccessibilityStatus
  readonly startedAt?: Date | string
  readonly duration?: number
  readonly isNew?: boolean
  readonly isDifferent?: boolean
  readonly isAborted?: boolean
  readonly appUrls?: SessionUrls
  readonly apiUrls?: SessionUrls
  readonly stepsInfo?: StepInfo[]
  readonly steps?: number
  readonly matches?: number
  readonly mismatches?: number
  readonly missing?: number
  readonly exactMatches?: number
  readonly strictMatches?: number
  readonly contentMatches?: number
  readonly layoutMatches?: number
  readonly noneMatches?: number
  readonly url?: string
}

export class TestResultsData implements Required<TestResults> {
  private _result: types.TestResult<'classic' | 'ufg'> = {}
  private readonly _deleteTest: types.Core<unknown, unknown, unknown>['deleteTest']

  /** @internal */
  constructor(options?: {
    result?: types.TestResult<'classic' | 'ufg'>
    deleteTest?: types.Core<unknown, unknown, unknown>['deleteTest']
  }) {
    if (!options) return this
    this._deleteTest = options.deleteTest
    this._result = options.result
  }

  get id(): string {
    return this._result.id
  }
  getId(): string {
    return this.id
  }
  /** @deprecated */
  setId(_id: string) {
    // DEPRECATED
  }

  get name(): string {
    return this._result.name
  }
  getName(): string {
    return this.name
  }
  /** @deprecated */
  setName(_name: string) {
    // DEPRECATED
  }

  get secretToken(): string {
    return this._result.secretToken
  }
  getSecretToken(): string {
    return this.secretToken
  }
  /** @deprecated */
  setSecretToken(_secretToken: string) {
    // DEPRECATED
  }

  get status(): TestResultsStatus {
    return this._result.status
  }
  getStatus(): TestResultsStatusEnum {
    return this.status as TestResultsStatusEnum
  }
  /** @deprecated */
  setStatus(_status: TestResultsStatusEnum) {
    // DEPRECATED
  }

  get appName(): string {
    return this._result.appName
  }
  getAppName(): string {
    return this.appName
  }
  /** @deprecated */
  setAppName(_appName: string) {
    // DEPRECATED
  }

  get batchName(): string {
    return this._result.batchName
  }
  getBatchName(): string {
    return this.batchName
  }
  /** @deprecated */
  setBatchName(_batchName: string) {
    // DEPRECATED
  }

  get batchId(): string {
    return this._result.batchId
  }
  getBatchId(): string {
    return this.batchId
  }
  /** @deprecated */
  setBatchId(_batchId: string) {
    // DEPRECATED
  }

  get branchName(): string {
    return this._result.batchName
  }
  getBranchName(): string {
    return this.branchName
  }
  /** @deprecated */
  setBranchName(_branchName: string) {
    // DEPRECATED
  }

  get hostOS(): string {
    return this._result.hostOS
  }
  getHostOS(): string {
    return this.hostOS
  }
  /** @deprecated */
  setHostOS(_hostOS: string) {
    // DEPRECATED
  }

  get hostApp(): string {
    return this._result.hostApp
  }
  getHostApp(): string {
    return this.hostApp
  }
  /** @deprecated */
  setHostApp(_hostApp: string) {
    // DEPRECATED
  }

  get hostDisplaySize(): RectangleSize {
    return this._result.hostDisplaySize
  }
  getHostDisplaySize(): RectangleSizeData {
    return new RectangleSizeData(this.hostDisplaySize)
  }
  /** @deprecated */
  setHostDisplaySize(_hostDisplaySize: RectangleSize) {
    // DEPRECATED
  }

  get accessibilityStatus(): TestAccessibilityStatus {
    return this._result.accessibilityStatus
  }
  getAccessibilityStatus(): TestAccessibilityStatus {
    return this.accessibilityStatus
  }
  /** @deprecated */
  setAccessibilityStatus(_accessibilityStatus: TestAccessibilityStatus) {
    // DEPRECATED
  }

  get startedAt(): Date | string {
    return this._result.startedAt
  }
  getStartedAt(): Date {
    return new Date(this.startedAt)
  }
  /** @deprecated */
  setStartedAt(_startedAt: Date | string) {
    // DEPRECATED
  }

  get duration(): number {
    return this._result.duration
  }
  getDuration(): number {
    return this.duration
  }
  /** @deprecated */
  setDuration(_duration: number) {
    // DEPRECATED
  }

  get isNew(): boolean {
    return this._result.isNew
  }
  getIsNew(): boolean {
    return this.isNew
  }
  /** @deprecated */
  setIsNew(_isNew: boolean) {
    // DEPRECATED
  }

  get isDifferent(): boolean {
    return this._result.isDifferent
  }
  getIsDifferent(): boolean {
    return this.isDifferent
  }
  /** @deprecated */
  setIsDifferent(_isDifferent: boolean) {
    // DEPRECATED
  }

  get isAborted(): boolean {
    return this._result.isAborted
  }
  getIsAborted(): boolean {
    return this.isAborted
  }
  /** @deprecated */
  setIsAborted(_isAborted: boolean) {
    // DEPRECATED
  }

  get appUrls(): SessionUrls {
    return this._result.appUrls
  }
  getAppUrls(): SessionUrlsData {
    return new SessionUrlsData(this.appUrls)
  }
  /** @deprecated */
  setAppUrls(_appUrls: SessionUrls) {
    // DEPRECATED
  }

  get apiUrls(): SessionUrls {
    return this._result.apiUrls
  }
  getApiUrls(): SessionUrlsData {
    return new SessionUrlsData(this.apiUrls)
  }
  /** @deprecated */
  setApiUrls(_apiUrls: SessionUrls) {
    // DEPRECATED
  }

  get stepsInfo(): StepInfo[] {
    return this._result.stepsInfo
  }
  getStepsInfo(): StepInfoData[] {
    return this.stepsInfo.map(info => new StepInfoData(info))
  }
  /** @deprecated */
  setStepsInfo(_stepInfo: StepInfo[]) {
    // DEPRECATED
  }

  get steps(): number {
    return this._result.steps
  }
  getSteps(): number {
    return this.steps
  }
  /** @deprecated */
  setSteps(_steps: number) {
    // DEPRECATED
  }

  get matches(): number {
    return this._result.matches
  }
  getMatches(): number {
    return this.matches
  }
  /** @deprecated */
  setMatches(_matches: number) {
    // DEPRECATED
  }

  get mismatches(): number {
    return this._result.mismatches
  }
  getMismatches(): number {
    return this.mismatches
  }
  /** @deprecated */
  setMismatches(_mismatches: number) {
    // DEPRECATED
  }

  get missing(): number {
    return this._result.missing
  }
  getMissing(): number {
    return this.missing
  }
  /** @deprecated */
  setMissing(_missing: number) {
    // DEPRECATED
  }

  get exactMatches(): number {
    return this._result.exactMatches
  }
  getExactMatches(): number {
    return this.exactMatches
  }
  /** @deprecated */
  setExactMatches(_exactMatches: number) {
    // DEPRECATED
  }

  get strictMatches(): number {
    return this._result.strictMatches
  }
  getStrictMatches(): number {
    return this.strictMatches
  }
  /** @deprecated */
  setStrictMatches(_strictMatches: number) {
    // DEPRECATED
  }

  get contentMatches(): number {
    return this._result.contentMatches
  }
  getContentMatches(): number {
    return this.contentMatches
  }
  /** @deprecated */
  setContentMatches(_contentMatches: number) {
    // DEPRECATED
  }

  get layoutMatches(): number {
    return this._result.layoutMatches
  }
  getLayoutMatches(): number {
    return this.layoutMatches
  }
  /** @deprecated */
  setLayoutMatches(_layoutMatches: number) {
    // DEPRECATED
  }

  get noneMatches(): number {
    return this._result.noneMatches
  }
  getNoneMatches(): number {
    return this.noneMatches
  }
  /** @deprecated */
  setNoneMatches(_noneMatches: number) {
    // DEPRECATED
  }

  get url(): string {
    return this._result.url
  }
  getUrl(): string {
    return this.url
  }
  /** @deprecated */
  setUrl(_url: string) {
    // DEPRECATED
  }

  isPassed(): boolean {
    return this._result.status === TestResultsStatusEnum.Passed
  }

  async delete(): Promise<void> {
    if (!this._deleteTest) return
    return this._deleteTest({
      settings: {serverUrl: '', apiKey: '', testId: this.id, batchId: this.batchId, secretToken: this.secretToken},
    })
  }
  /** @deprecated */
  async deleteSession(): Promise<void> {
    await this.delete()
  }

  /** @internal */
  toObject(): TestResults {
    return this._result
  }

  /** @internal */
  toJSON(): types.TestResult<'classic' | 'ufg'> {
    return this._result
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
