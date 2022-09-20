from __future__ import absolute_import

import typing as t

from marshmallow import Schema, post_dump, post_load
from marshmallow.fields import (
    Boolean,
    DateTime,
    Dict,
    Field,
    Float,
    Integer,
    List,
    Nested,
    String,
)
from marshmallow.schema import BaseSchema, SchemaMeta, with_metaclass

from .. import common
from ..common import (
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AndroidDeviceName,
    AndroidVersion,
    DeviceName,
    IosDeviceName,
    IosVersion,
    MatchLevel,
    ScreenOrientation,
    SessionType,
    StitchMode,
)
from ..common.accessibility import AccessibilityStatus
from ..common.selenium import BrowserType
from ..common.test_results import TestResultsStatus
from .schema_fields import demarshal_error  # noqa
from .schema_fields import (
    BrowserInfo,
    DebugScreenshots,
    ElementReference,
    Enum,
    Error,
    FrameReference,
    RegionReference,
    TargetReference,
    VisualGridOptions,
    check_error,
)

if t.TYPE_CHECKING:
    from selenium.webdriver.remote.webdriver import WebDriver

    from applitools.common import config
    from applitools.common.utils.custom_types import ViewPort
    from applitools.core import extract_text, locators
    from applitools.selenium.fluent import selenium_check_settings as cs

    from ..core import batch_close


# Default marshmallow.Schema has no option to skip attributes with None value
# or empty lists / dicts. Because it uses metaclass, it should be re-defined
# instead of simple subclassing
class USDKSchema(with_metaclass(SchemaMeta, BaseSchema)):
    __doc__ = BaseSchema.__doc__
    _always_skip_values = (None, [])
    _keep_empty_objects = ("lazyLoad",)  # fields that are allowed to have {} value

    @classmethod
    def should_keep(cls, key, value):
        # type: (t.Text, t.Any) -> bool
        if value in cls._always_skip_values:
            return False
        if value == {} and key not in cls._keep_empty_objects:
            return False
        return True

    @post_dump
    def remove_none_values_empty_lists(self, data, **_):
        # type: (dict, **t.Any) -> dict
        return {k: v for k, v in data.items() if self.should_keep(k, v)}


class DebugScreenshotHandler(USDKSchema):
    save_debug_screenshots = Boolean(dump_to="save", required=True)
    debug_screenshots_path = String(dump_to="path")
    debug_screenshots_prefix = String(dump_to="prefix")


class DesktopBrowserRenderer(USDKSchema):
    width = Float()
    height = Float()
    browser_type = Enum(BrowserType, dump_to="name", load_from="name")

    @post_load
    def to_python(self, data, **_):
        return common.DesktopBrowserInfo(**data)


class ChromeEmulationRenderer(USDKSchema):
    device_name = Enum(DeviceName, dump_to="deviceName", load_from="deviceName")
    screen_orientation = Enum(
        ScreenOrientation, dump_to="screenOrientation", load_from="screenOrientation"
    )

    @post_load
    def to_python(self, data, **_):
        return common.ChromeEmulationInfo(**data)


class AndroidDeviceRenderer(USDKSchema):
    device_name = Enum(AndroidDeviceName, dump_to="deviceName", load_from="deviceName")
    screen_orientation = Enum(
        ScreenOrientation, dump_to="screenOrientation", load_from="screenOrientation"
    )
    android_version = Enum(
        AndroidVersion, dump_to="androidVersion", load_from="androidVersion"
    )

    @post_load
    def to_python(self, data, **_):
        return common.AndroidDeviceInfo(**data)


class IosDeviceRenderer(USDKSchema):
    device_name = Enum(IosDeviceName, dump_to="deviceName", load_from="deviceName")
    screen_orientation = Enum(
        ScreenOrientation, dump_to="screenOrientation", load_from="screenOrientation"
    )
    ios_version = Enum(IosVersion, dump_to="iosVersion", load_from="iosVersion")

    @post_load
    def to_python(self, data, **_):
        return common.IosDeviceInfo(**data)


class Region(USDKSchema):
    left = Float(dump_to="x", load_from="x")  # this allows both x and left when loading
    top = Float(dump_to="y", load_from="y")  # this allows both x and top when loading
    width = Float()
    height = Float()

    @post_load
    def to_python(self, data, **_):
        return common.geometry.Region.from_(data)


class ContextReference(USDKSchema):
    frame = FrameReference()
    scroll_root_locator = ElementReference(dump_to="scrollRootElement")


class ImageCropRect(USDKSchema):
    header = Float(dump_to="top")
    right = Float()
    footer = Float(dump_to="bottom")
    left = Float()


class Size(USDKSchema):
    width = Integer()
    height = Integer()


class Batch(USDKSchema):
    id = String()
    name = String()
    sequence_name = String(dump_to="sequenceName")
    started_at = DateTime("%Y-%m-%dT%H:%M:%SZ", dump_to="startedAt")
    notify_on_completion = Boolean(dump_to="notifyOnCompletion")
    properties = List(Dict())


class Proxy(USDKSchema):
    url = String(required=True)
    username = String()
    password = String()


class StaticDriver(Schema):
    session_id = String(dump_to="sessionId")
    server_url = String(attribute="command_executor._url", dump_to="serverUrl")
    capabilities = Dict()


class AccessibilitySettings(USDKSchema):
    level = Enum(AccessibilityLevel)
    guidelines_version = Enum(
        AccessibilityGuidelinesVersion, dump_to="guidelinesVersion"
    )


class CodedRegionReference(USDKSchema):
    region = RegionReference()
    padding = Field()
    region_id = String(dump_to="regionId")


class FloatingRegionReference(USDKSchema):
    _target_path = RegionReference(dump_to="region")
    max_up = Integer(attribute="_bounds.max_up_offset", dump_to="maxUpOffset")
    max_down = Integer(attribute="_bounds.max_down_offset", dump_to="maxDownOffset")
    max_left = Integer(attribute="_bounds.max_left_offset", dump_to="maxLeftOffset")
    max_right = Integer(attribute="_bounds.max_right_offset", dump_to="maxRightOffset")


class AccessibilityRegionReference(USDKSchema):
    _target_path = RegionReference(dump_to="region")
    _type = Enum(AccessibilityRegionType, dump_to="type")


class ExactMatchSettings(USDKSchema):
    min_diff_intensity = Integer(dump_to="minDiffIntensity")
    min_diff_width = Integer(dump_to="minDiffWidth")
    min_diff_height = Integer(dump_to="minDiffHeight")
    match_threshold = Float(dump_to="matchThreshold")


class LazyLoadOptions(USDKSchema):
    scroll_length = Integer(dump_to="scrollLength")
    waiting_time = Integer(dump_to="waitingTime")
    max_amount_to_scroll = Integer(dump_to="maxAmountToScroll")


class MatchSettings(USDKSchema):
    exact = Nested(ExactMatchSettings)
    match_level = Enum(MatchLevel, dump_to="matchLevel")
    use_dom = Boolean(dump_to="useDom")
    enable_patterns = Boolean(dump_to="enablePatterns")
    ignore_caret = Boolean(dump_to="ignoreCaret")
    ignore_displacements = Boolean(dump_to="ignoreDisplacements")
    accessibility_settings = Nested(
        AccessibilitySettings, dump_to="accessibilitySettings"
    )
    ignore_regions = List(Nested(CodedRegionReference), dump_to="ignoreRegions")
    layout_regions = List(Nested(CodedRegionReference), dump_to="layoutRegions")
    strict_regions = List(Nested(CodedRegionReference), dump_to="strictRegions")
    content_regions = List(Nested(CodedRegionReference), dump_to="contentRegions")
    floating_match_settings = List(
        Nested(FloatingRegionReference), dump_to="floatingRegions"
    )
    accessibility = List(
        Nested(AccessibilityRegionReference), dump_to="accessibilityRegions"
    )


class EyesConfig(USDKSchema):
    # EyesBaseConfig
    save_debug_screenshots = DebugScreenshots(dump_to="debugScreenshots")
    agent_id = String(dump_to="agentId")
    api_key = String(dump_to="apiKey")
    server_url = String(dump_to="serverUrl")
    proxy = Nested(Proxy)
    is_disabled = Boolean(dump_to="isDisabled")
    _timeout = Integer(dump_to="connectionTimeout")
    # EyesOpenConfig
    app_name = String(dump_to="appName")
    test_name = String(dump_to="testName")
    viewport_size = Nested(Size, dump_to="viewportSize")
    session_type = Enum(SessionType, dump_to="sessionType")
    properties = List(Dict())
    batch = Nested(Batch)
    default_match_settings = Nested(MatchSettings, dump_to="defaultMatchSettings")
    host_app = String(dump_to="hostApp")
    host_os = String(dump_to="hostOS")
    baseline_env_name = String(dump_to="baselineEnvName")
    environment_name = String(dump_to="environmentName")
    branch_name = String(dump_to="branchName")
    parent_branch_name = String(dump_to="parentBranchName")
    baseline_branch_name = String(dump_to="baselineBranchName")
    save_failed_tests = Boolean(dump_to="saveFailedTests")
    save_new_tests = Boolean(dump_to="saveNewTests")
    save_diffs = Boolean(dump_to="saveDiffs")
    dont_close_batches = Boolean(dump_to="dontCloseBatches")
    user_test_id = String(dump_to="userTestId")
    # EyesCheckConfig
    send_dom = Boolean(dump_to="sendDom")
    match_timeout = Float(dump_to="matchTimeout")
    force_full_page_screenshot = Boolean(dump_to="forceFullPageScreenshot")
    # EyesClassicConfig
    wait_before_screenshots = Float(dump_to="waitBeforeScreenshots")
    wait_before_capture = Integer(dump_to="waitBeforeCapture")
    stitch_mode = Enum(StitchMode, dump_to="stitchMode")
    hide_scrollbars = Boolean(dump_to="hideScrollbars")
    hide_caret = Boolean(dump_to="hideCaret")
    stitch_overlap = Integer(dump_to="stitchOverlap")
    cut_provider = Nested(ImageCropRect, dump_to="cut")
    rotation = Integer()
    scale_ratio = Float(dump_to="scaleRatio")
    # EyesUFGConfig
    browsers_info = List(BrowserInfo(), dump_to="browsersInfo")
    visual_grid_options = VisualGridOptions(dump_to="visualGridOptions")
    layout_breakpoints = Field(dump_to="layoutBreakpoints")
    disable_browser_fetching = Boolean(dump_to="disableBrowserFetching")


class CheckSettings(USDKSchema):
    name = String()
    disable_browser_fetching = Boolean(dump_to="disableBrowserFetching")
    layout_breakpoints = Field(dump_to="layoutBreakpoints")
    visual_grid_options = VisualGridOptions(dump_to="visualGridOptions")
    script_hooks = Dict(dump_to="hooks")
    page_id = String(dump_to="pageId")
    variation_group_id = String(dump_to="variationGroupId")
    timeout = Integer()
    wait_before_capture = Integer(dump_to="waitBeforeCapture")
    lazy_load = Nested(LazyLoadOptions, dump_to="lazyLoad")
    # ScreenshotSettings
    region = TargetReference()
    frame_chain = List(Nested(ContextReference), dump_to="frames")
    scroll_root_locator = ElementReference(dump_to="scrollRootElement")
    stitch_content = Boolean(dump_to="fully")
    # MatchSettings
    match_level = Enum(MatchLevel, dump_to="matchLevel")
    send_dom = Boolean(dump_to="sendDom")
    use_dom = Boolean(dump_to="useDom")
    enable_patterns = Boolean(dump_to="enablePatterns")
    ignore_caret = Boolean(dump_to="ignoreCaret")
    ignore_displacements = Boolean(dump_to="ignoreDisplacements")
    ignore_regions = List(Nested(CodedRegionReference), dump_to="ignoreRegions")
    layout_regions = List(Nested(CodedRegionReference), dump_to="layoutRegions")
    strict_regions = List(Nested(CodedRegionReference), dump_to="strictRegions")
    content_regions = List(Nested(CodedRegionReference), dump_to="contentRegions")
    floating_regions = List(Nested(FloatingRegionReference), dump_to="floatingRegions")
    accessibility_regions = List(
        Nested(AccessibilityRegionReference), dump_to="accessibilityRegions"
    )


class LocateSettings(USDKSchema):
    names = List(String(), dump_to="locatorNames")
    first_only = Boolean(dump_to="firstOnly")


class OCRSearchSettings(USDKSchema):
    _patterns = List(String(), dump_to="patterns")
    _ignore_case = Boolean(dump_to="ignoreCase")
    _first_only = Boolean(dump_to="firstOnly")
    _language = String(dump_to="language")


class OCRExtractSettings(USDKSchema):
    target = RegionReference()
    _hint = String(dump_to="hint")
    _min_match = Float(dump_to="minMatch")
    _language = String(dump_to="language")


class CloseBatchesSettings(USDKSchema):
    _ids = List(String(), dump_to="batchIds")
    server_url = String(dump_to="serverUrl")
    api_key = String(dump_to="apiKey")
    proxy = Nested(Proxy)


class DeleteTestSettings(USDKSchema):
    id = String(dump_to="testId")
    batch_id = String(dump_to="batchId")
    secret_token = String(dump_to="secretToken")
    server_url = String(attribute="_connection_config.server_url", dump_to="serverUrl")
    api_key = String(attribute="_connection_config.api_key", dump_to="apiKey")
    proxy = Nested(Proxy, attribute="_connection_config.proxy")


# De-marshaling schema
class RectangleSize(Schema):
    width = Integer()
    height = Integer()

    @post_load
    def to_python(self, data, **_):
        return common.RectangleSize(**data)


class ServerInfo(Schema):
    logs_dir = String(load_from="logsDir")

    @post_load
    def to_python(self, data, **_):
        return common.ServerInfo(**data)


class SessionUrls(Schema):
    batch = String()
    session = String()

    @post_load
    def to_python(self, data, **_):
        return common.test_results.SessionUrls(**data)


class ApiUrls(Schema):
    baseline_image = String(load_from="baselineImage")
    current_image = String(load_from="currentImage")
    diff_image = String(load_from="diffImage")
    checkpoint_image = String(load_from="checkpointImage")
    checkpoint_image_thumbnail = String(load_from="checkpointImageThumbnail")

    @post_load
    def to_python(self, data, **_):
        return common.test_results.StepInfo.ApiUrls(**data)


class AppUrls(Schema):
    step = String(load_from="step")
    step_editor = String(load_from="stepEditor")

    @post_load
    def to_python(self, data, **_):
        return common.test_results.StepInfo.AppUrls(**data)


class SessionAccessibilityStatus(Schema):
    level = Enum(AccessibilityLevel)
    version = Enum(AccessibilityGuidelinesVersion)
    status = Enum(AccessibilityStatus)

    @post_load
    def to_python(self, data, **_):
        return common.accessibility.SessionAccessibilityStatus(**data)


class StepInfo(Schema):
    name = String()
    is_different = Boolean(load_from="isDifferent")
    has_baseline_image = Boolean(load_from="hasBaselineImage")
    has_current_image = Boolean(load_from="hasCurrentImage")
    has_checkpoint_image = Boolean(load_from="hasCheckpointImage")
    api_urls = Nested(ApiUrls, load_from="apiUrls")
    app_urls = Nested(AppUrls, load_from="appUrls")

    @post_load
    def to_python(self, data, **_):
        return common.test_results.StepInfo(**data)


class MatchResult(Schema):
    as_expected = Boolean(load_from="asExpected")
    window_id = String(load_from="windowId")

    @post_load
    def to_python(self, data, **_):
        return common.MatchResult(**data)


class TestResults(Schema):
    steps = Integer()
    matches = Integer()
    mismatches = Integer()
    missing = Integer()
    exact_matches = Integer(load_from="exactMatches")
    strict_matches = Integer(load_from="strictMatches")
    content_matches = Integer(load_from="contentMatches")
    layout_matches = Integer(load_from="layoutMatches")
    none_matches = Integer(load_from="noneMatches")
    is_new = Boolean(load_from="isNew")
    url = String()
    status = Enum(TestResultsStatus)
    name = String()
    secret_token = String(load_from="secretToken")
    id = String()
    app_name = String(load_from="appName")
    batch_name = String(load_from="batchName")
    batch_id = String(load_from="batchId")
    branch_name = String(load_from="branchName")
    host_os = String(load_from="hostOS")
    host_app = String(load_from="hostApp")
    host_display_size = Nested(RectangleSize, load_from="hostDisplaySize")
    started_at = String(load_from="startedAt")
    duration = Integer()
    is_different = Boolean(load_from="isDifferent")
    is_aborted = Boolean(load_from="isAborted")
    is_empty = Boolean(load_from="isEmpty")
    app_urls = Nested(SessionUrls, load_from="appUrls")
    api_urls = Nested(SessionUrls, load_from="apiUrls")
    steps_info = List(Nested(StepInfo), load_from="stepsInfo")
    baseline_id = String(load_from="baselineId")
    accessibility_status = Nested(
        SessionAccessibilityStatus, load_from="accessibilityStatus"
    )
    user_test_id = String(load_from="userTestId")

    @post_load
    def to_python(self, data, **_):
        return common.TestResults(**data)


class TestResultContainer(Schema):
    test_results = Nested(TestResults, load_from="testResults")
    browser_info = BrowserInfo(load_from="browserInfo")
    exception = Error(allow_none=True)
    user_test_id = String(load_from="userTestId")

    @post_load
    def to_python(self, data, **_):
        return common.TestResultContainer(**data)


class TestResultsSummary(Schema):
    results = List(Nested(TestResultContainer))
    exceptions = Integer()
    passed = Integer()
    unresolved = Integer()
    failed = Integer()
    # these attributes get None value when Eyes.locate call fails
    mismatches = Integer(allow_none=True)
    missing = Integer(allow_none=True)
    matches = Integer(allow_none=True)

    @post_load
    def to_python(self, data, **_):
        return common.TestResultsSummary(**data)


def marshal_webdriver_ref(driver):
    # type: (WebDriver) -> dict
    return check_error(StaticDriver().dump(driver))


def marshal_configuration(configuration):
    # type: (config.Configuration) -> dict
    return check_error(EyesConfig().dump(configuration))


def marshal_check_settings(check_settings):
    # type: (cs.SeleniumCheckSettings) -> dict
    return check_error(CheckSettings().dump(check_settings.values))


def marshal_locate_settings(locate_settings):
    # type: (locators.VisualLocatorSettings) -> dict
    return check_error(LocateSettings().dump(locate_settings.values))


def marshal_ocr_search_settings(search_settings):
    # type: (extract_text.TextRegionSettings) -> dict
    return check_error(OCRSearchSettings().dump(search_settings))


def marshal_ocr_extract_settings(extract_settings):
    # type: (t.Tuple[extract_text.OCRRegion]) -> t.List[dict]
    return [check_error(OCRExtractSettings().dump(s)) for s in extract_settings]


def marshal_viewport_size(viewport_size):
    # type: (ViewPort) -> dict
    return check_error(Size().dump(viewport_size))


def marshal_enabled_batch_close(close_batches):
    # type: (batch_close._EnabledBatchClose) -> dict # noqa
    return check_error(CloseBatchesSettings().dump(close_batches))


def marshal_delete_test_settings(test_results):
    # type: (common.TestResults) -> dict
    return check_error(DeleteTestSettings().dump(test_results))


def demarshal_match_result(results_dict):
    # type: (dict) -> MatchResult
    return check_error(MatchResult().load(results_dict))


def demarshal_locate_result(results):
    # type: (dict) -> t.Dict[t.Text, t.List[common.Region]]
    return {
        locator_id: [check_error(Region().load(r)) for r in regions] if regions else []
        for locator_id, regions in results.items()
    }


def demarshal_test_results(results_list, conf):
    # type: (t.List[dict], config.Configuration) -> t.List[common.TestResults]
    # When locating visual locators, result might be None
    results = [check_error(TestResults().load(r)) for r in results_list if r]
    for result in results:
        result.set_connection_config(conf.server_url, conf.api_key, conf.proxy)
    return results


def demarshal_close_manager_results(close_manager_result_dict, conf):
    # type: (dict, config.Configuration) -> common.TestResultsSummary
    results = check_error(TestResultsSummary().load(close_manager_result_dict))
    for container in results:
        if container.test_results:
            container.test_results.set_connection_config(
                conf.server_url, conf.api_key, conf.proxy
            )
    return results


def demarshal_server_info(info_dict):
    # type: (dict) -> common.ServerInfo
    return check_error(ServerInfo().loads(info_dict))