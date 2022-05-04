'use strict'
/* eslint-disable max-len */

exports.checkSpecDriver = require('@applitools/driver/dist/debug').checkSpecDriver
exports.makeSDK = require('./lib/new/sdk')
exports.makeExecutionGridClient = require('@applitools/execution-grid-client').makeServer

// config
exports.AccessibilityLevel = require('./lib/config/AccessibilityLevel')
exports.AccessibilityGuidelinesVersion = require('./lib/config/AccessibilityGuidelinesVersion')
exports.AccessibilityMatchSettings = require('./lib/config/AccessibilityMatchSettings')
exports.AccessibilityRegionType = require('./lib/config/AccessibilityRegionType')
exports.BatchInfo = require('./lib/config/BatchInfo')
exports.BrowserType = require('./lib/config/BrowserType')
exports.Configuration = require('./lib/config/Configuration')
exports.DeviceName = require('./lib/config/DeviceName')
exports.ExactMatchSettings = require('./lib/config/ExactMatchSettings')
exports.FloatingMatchSettings = require('./lib/config/FloatingMatchSettings')
exports.ImageMatchSettings = require('./lib/config/ImageMatchSettings')
exports.MatchLevel = require('./lib/config/MatchLevel')
exports.PropertyData = require('./lib/config/PropertyData')
exports.ProxySettings = require('./lib/config/ProxySettings')
exports.ScreenOrientation = require('./lib/config/ScreenOrientation')
exports.SessionType = require('./lib/config/SessionType')
exports.StitchMode = require('./lib/config/StitchMode')
exports.IosDeviceName = require('./lib/config/IosDeviceName')
exports.IosVersion = require('./lib/config/IosVersion')

// errors
exports.EyesError = require('./lib/errors/EyesError')
exports.DiffsFoundError = require('./lib/errors/DiffsFoundError')
exports.NewTestError = require('./lib/errors/NewTestError')
exports.TestFailedError = require('./lib/errors/TestFailedError')

// geometry
exports.CoordinatesType = require('./lib/geometry/CoordinatesType')
exports.Location = require('./lib/geometry/Location')
exports.RectangleSize = require('./lib/geometry/RectangleSize')
exports.Region = require('./lib/geometry/Region')

// handler
exports.PropertyHandler = require('./lib/handler/PropertyHandler')
exports.ReadOnlyPropertyHandler = require('./lib/handler/ReadOnlyPropertyHandler')
exports.SimplePropertyHandler = require('./lib/handler/SimplePropertyHandler')

// images
exports.ImageDeltaCompressor = require('./lib/images/ImageDeltaCompressor')

// utils
exports.ArgumentGuard = require('./lib/utils/ArgumentGuard')
exports.ConfigUtils = require('./lib/utils/ConfigUtils')
exports.DateTimeUtils = require('./lib/utils/DateTimeUtils')
exports.FileUtils = require('./lib/utils/FileUtils')
exports.GeneralUtils = require('./lib/utils/GeneralUtils')
exports.PerformanceUtils = require('./lib/utils/PerformanceUtils')
exports.StreamUtils = require('./lib/utils/StreamUtils')
exports.TypeUtils = require('./lib/utils/TypeUtils')
exports.deserializeDomSnapshotResult = require('./lib/utils/deserializeDomSnapshotResult')
exports.CorsIframeHandle = require('./lib/capture/CorsIframeHandles')
exports.CorsIframeHandler = require('./lib/capture/CorsIframeHandler')

const closeBatch = require('./lib/close/closeBatch')
const makeBatchClose = require('./lib/close/BatchClose')
exports.BatchClose = makeBatchClose(closeBatch)

exports.RemoteSessionEventHandler = require('./lib/events/RemoteSessionEventHandler')
exports.SessionEventHandler = require('./lib/events/SessionEventHandler')
exports.ValidationInfo = require('./lib/events/ValidationInfo')
exports.ValidationResult = require('./lib/events/ValidationResult')

exports.AppOutput = require('./lib/match/AppOutput')
exports.MatchResult = require('./lib/match/MatchResult')
exports.MatchWindowAndCloseData = require('./lib/match/MatchWindowAndCloseData')
exports.MatchWindowData = require('./lib/match/MatchWindowData')
exports.ImageMatchOptions = require('./lib/match/ImageMatchOptions')

exports.metadata = {
  ActualAppOutput: require('./lib/metadata/ActualAppOutput'),
  Annotations: require('./lib/metadata/Annotations'),
  BatchInfo: require('./lib/metadata/BatchInfo'),
  Branch: require('./lib/metadata/Branch'),
  ExpectedAppOutput: require('./lib/metadata/ExpectedAppOutput'),
  Image: require('./lib/metadata/Image'),
  ImageMatchSettings: require('./lib/metadata/ImageMatchSettings'),
  SessionResults: require('./lib/metadata/SessionResults'),
  StartInfo: require('./lib/metadata/StartInfo'),
}

exports.RenderStatus = require('./lib/renderer/RenderStatus')
exports.RenderStatusResults = require('./lib/renderer/RenderStatusResults')
exports.RunningRender = require('./lib/renderer/RunningRender')

exports.RenderingInfo = require('./lib/server/RenderingInfo')
exports.RunningSession = require('./lib/server/RunningSession')
exports.ServerConnector = require('./lib/server/ServerConnector')
exports.getTunnelAgentFromProxy = require('./lib/server/getTunnelAgentFromProxy')
exports.SessionStartInfo = require('./lib/server/SessionStartInfo')

exports.MouseTrigger = require('./lib/triggers/MouseTrigger')
exports.TextTrigger = require('./lib/triggers/TextTrigger')
exports.Trigger = require('./lib/triggers/Trigger')

exports.AppEnvironment = require('./lib/AppEnvironment')
exports.FailureReports = require('./lib/FailureReports')
exports.MatchWindowTask = require('./lib/MatchWindowTask')
exports.TestResults = require('./lib/TestResults')
exports.TestResultsError = require('./lib/TestResultsError')
exports.AccessibilityStatus = require('./lib/AccessibilityStatus')
exports.TestResultsFormatter = require('./lib/TestResultsFormatter')
exports.TestResultsStatus = require('./lib/TestResultsStatus')

exports.EyesBase = require('./lib/sdk/EyesBase')
exports.EyesClassic = require('./lib/sdk/EyesClassic')
exports.EyesVisualGrid = require('./lib/sdk/EyesVisualGrid')
exports.EyesFactory = require('./lib/sdk/EyesFactory')
exports.EyesSDK = require('./lib/sdk/EyesSDK')

exports.takeDomSnapshot = require('./lib/utils/takeDomSnapshot')
exports.takeDomSnapshots = require('./lib/utils/takeDomSnapshots')
exports.takeDomCapture = require('./lib/utils/takeDomCapture')

exports.EyesRunner = require('./lib/runner/EyesRunner')
exports.ClassicRunner = require('./lib/runner/ClassicRunner')
exports.VisualGridRunner = require('./lib/runner/VisualGridRunner')
exports.RunnerOptions = require('./lib/runner/RunnerOptions')
exports.LogEvent = require('./lib/logging/LogEvent')
exports.RunnerStartedEvent = require('./lib/logging/RunnerStartedEvent')
