exports.deserializeDomSnapshotResult = require('../lib/utils/deserializeDomSnapshotResult')

exports.DiffsFoundError = require('../lib/errors/DiffsFoundError')
exports.TestResults = require('../lib/TestResults')
exports.TestResultsError = require('../lib/TestResultsError')
exports.TestResultsStatus = require('../lib/TestResultsStatus')
exports.TestResultsFormatter = require('../lib/TestResultsFormatter')

exports.RectangleSize = require('../lib/geometry/RectangleSize')
exports.Location = require('../lib/geometry/Location')

exports.Region = require('../lib/geometry/Region')
exports.AccessibilityRegionType = require('../lib/config/AccessibilityRegionType')

exports.RenderingInfo = require('../lib/server/RenderingInfo')
exports.RenderStatus = require('../lib/renderer/RenderStatus')
exports.RenderStatusResults = require('../lib/renderer/RenderStatusResults')

exports.EyesBase = require('../lib/sdk/EyesBase')

exports.getTunnelAgentFromProxy = require('../lib/server/getTunnelAgentFromProxy')
exports.BatchInfo = require('../lib/config/BatchInfo')
exports.BrowserType = require('../lib/config/BrowserType')
exports.TypeUtils = require('../lib/utils/TypeUtils')
exports.GeneralUtils = require('../lib/utils/GeneralUtils')
exports.ConfigUtils = require('../lib/utils/ConfigUtils')

exports.ImageMatchSettings = require('../lib/config/ImageMatchSettings')

exports.RunnerStartedEvent = require('../lib/logging/RunnerStartedEvent')
exports.MatchResult = require('../lib/match/MatchResult')

exports.ProxySettings = require('../lib/config/ProxySettings')

exports.getBrowserKeyForUserAgent = require('../lib/utils/getBrowserKeyForUserAgent')
