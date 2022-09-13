from datetime import datetime

from mock import ANY
from selenium.webdriver.common.by import By

from applitools.common import (
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
    AndroidDeviceInfo,
    AndroidDeviceName,
    AndroidVersion,
    BatchInfo,
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    DeviceName,
    ExactMatchSettings,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    MatchLevel,
    MatchResult,
    ProxySettings,
    RectangleSize,
    Region,
    ScreenOrientation,
    ServerInfo,
    TestResults,
    VisualGridOption,
)
from applitools.common.accessibility import SessionAccessibilityStatus
from applitools.common.selenium import BrowserType, Configuration
from applitools.common.test_results import (
    SessionUrls,
    StepInfo,
    TestResultContainer,
    TestResultsStatus,
    TestResultsSummary,
)
from applitools.core import BatchClose, TextRegionSettings, VisualLocatorSettings
from applitools.core.cut import FixedCutProvider
from applitools.core.extract_text import OCRRegion
from applitools.selenium import TargetPath, schema
from applitools.selenium.fluent import SeleniumCheckSettings


class DummyElement(object):
    def __init__(self, id_):
        self._id = id_

    def __repr__(self):
        return "DummyElement({!r})".format(self._id)


def test_driver_marshal():
    serializer = schema.StaticDriver()

    class DummyCommands(object):
        _url = "https://url"

    class DummyDriver:
        session_id = "session id"
        command_executor = DummyCommands()
        capabilities = {"cap name": "cap value"}

    json, errors = serializer.dump(DummyDriver())

    assert errors == {}
    assert json == {
        "sessionId": "session id",
        "serverUrl": "https://url",
        "capabilities": {"cap name": "cap value"},
    }


def test_config_marshal(monkeypatch):
    monkeypatch.setenv("APPLITOOLS_BATCH_ID", "ID1")

    serializer = schema.EyesConfig()
    config = Configuration()
    config.api_key = "API KEY"
    config.set_agent_id("agent id")
    config.set_proxy(ProxySettings("host", 80, "user", "pass"))
    config.set_app_name("app name")
    config.set_test_name("test name")
    config.set_viewport_size(RectangleSize(800, 600))
    config.add_property("prop name", "prop value")
    config.set_batch(BatchInfo("batch name", datetime(2000, 1, 1), "sequence name"))
    config.batch.add_property("batch propname", "batch prop value")
    config.default_match_settings.exact = ExactMatchSettings(1, 2, 3, 4)
    config.default_match_settings.use_dom = True
    config.default_match_settings.enable_patterns = True
    config.default_match_settings.accessibility_settings = AccessibilitySettings(
        AccessibilityLevel.AA, AccessibilityGuidelinesVersion.WCAG_2_1
    )
    config.host_app = "host app"
    config.host_os = "host os"
    config.baseline_env_name = "baseline env name"
    config.environment_name = "env name"
    config.branch_name = "branch name"
    config.parent_branch_name = "parent branch name"
    config.baseline_branch_name = "baseline branch"
    config.save_diffs = True
    config.user_test_id = "user test id"
    config.force_full_page_screenshot = True
    config.wait_before_capture = 1
    config.hide_scrollbars = True
    config.stitch_overlap = 10
    config.cut_provider = FixedCutProvider(1, 2, 3, 4)
    config.rotation = 90
    config.scale_ratio = 50
    config.set_visual_grid_options(VisualGridOption("vo key", "vo value"))
    config.set_layout_breakpoints(1, 2, 3)
    config.add_browser(DesktopBrowserInfo(1200, 800, BrowserType.CHROME))
    config.add_browser(ChromeEmulationInfo(DeviceName.iPhone_X))
    config.add_mobile_device(
        AndroidDeviceInfo(
            AndroidDeviceName.Pixel_6, ScreenOrientation.PORTRAIT, AndroidVersion.LATEST
        )
    )
    config.add_mobile_device(
        IosDeviceInfo(
            IosDeviceName.iPhone_X, ScreenOrientation.PORTRAIT, IosVersion.LATEST
        )
    )

    json, errors = serializer.dump(config)

    assert errors == {}
    assert json == {
        "agentId": "agent id",
        "apiKey": "API KEY",
        "appName": "app name",
        "baselineBranchName": "baseline branch",
        "baselineEnvName": "baseline env name",
        "batch": {
            "id": "ID1",
            "name": "batch name",
            "notifyOnCompletion": False,
            "properties": [{"name": "batch propname", "value": "batch prop value"}],
            "sequenceName": "sequence name",
            "startedAt": "2000-01-01T00:00:00Z",
        },
        "branchName": "branch name",
        "browsersInfo": [
            {"height": 800.0, "name": "chrome", "width": 1200.0},
            {
                "chromeEmulationInfo": {
                    "deviceName": "iPhone X",
                    "screenOrientation": "portrait",
                }
            },
            {
                "androidDeviceInfo": {
                    "androidVersion": "latest",
                    "deviceName": "Pixel 6",
                    "screenOrientation": "portrait",
                }
            },
            {
                "iosDeviceInfo": {
                    "deviceName": "iPhone X",
                    "iosVersion": "latest",
                    "screenOrientation": "portrait",
                }
            },
        ],
        "connectionTimeout": 300000,
        "cut": {"bottom": 2.0, "left": 3.0, "right": 4.0, "top": 1.0},
        "debugScreenshots": {"path": "", "prefix": "screenshot_", "save": False},
        "defaultMatchSettings": {
            "accessibilitySettings": {"guidelinesVersion": "WCAG_2_1", "level": "AA"},
            "enablePatterns": True,
            "exact": {
                "matchThreshold": 4.0,
                "minDiffHeight": 3,
                "minDiffIntensity": 1,
                "minDiffWidth": 2,
            },
            "ignoreCaret": False,
            "ignoreDisplacements": False,
            "matchLevel": "Strict",
            "useDom": True,
        },
        "disableBrowserFetching": True,
        "dontCloseBatches": True,
        "environmentName": "env name",
        "forceFullPageScreenshot": True,
        "hideCaret": False,
        "hideScrollbars": True,
        "hostApp": "host app",
        "hostOS": "host os",
        "isDisabled": False,
        "layoutBreakpoints": [1, 2, 3],
        "matchTimeout": 2000.0,
        "parentBranchName": "parent branch name",
        "properties": [{"name": "prop name", "value": "prop value"}],
        "proxy": {
            "password": "pass",
            "url": "http://user:pass@host:80",
            "username": "user",
        },
        "rotation": 90,
        "saveDiffs": True,
        "saveFailedTests": False,
        "saveNewTests": True,
        "scaleRatio": 50.0,
        "sendDom": True,
        "serverUrl": "https://eyesapi.applitools.com",
        "sessionType": "SEQUENTIAL",
        "stitchMode": "Scroll",
        "stitchOverlap": 10,
        "testName": "test name",
        "userTestId": "user test id",
        "viewportSize": {"height": 600, "width": 800},
        "visualGridOptions": {"vo key": "vo value"},
        "waitBeforeCapture": 1,
        "waitBeforeScreenshots": 1000.0,
    }


def test_check_settings_marshal():
    serializer = schema.CheckSettings()
    check_settings = (
        SeleniumCheckSettings()
        .with_name("name")
        .disable_browser_fetching(True)
        .visual_grid_options(VisualGridOption("vo key", "vo value"))
    )
    check_settings.layout_breakpoints(True)
    check_settings.before_render_screenshot_hook("hook")
    check_settings.page_id("page id")
    check_settings.variation_group_id("vargroup id")
    check_settings.wait_before_capture(5)
    check_settings.lazy_load(1, 2, 3)
    check_settings.region("sel")
    check_settings.scroll_root_element("root scroll root selector")
    check_settings.frame([By.CSS_SELECTOR, "frame element selector"])
    check_settings.scroll_root_element("frame scroll root selector")
    check_settings.fully()
    check_settings.match_level(MatchLevel.LAYOUT)
    check_settings.send_dom(True)
    check_settings.use_dom(True)
    check_settings.enable_patterns(True)
    check_settings.ignore_caret(True)
    check_settings.ignore_displacements(True)
    check_settings.ignore("ignore selector", padding={"top": 5}, region_id="ignore id")
    check_settings.layout(Region(1, 2, 3, 4))
    check_settings.strict(TargetPath.region(DummyElement("dummy id 1")))
    check_settings.content("content selector", region_id="content id")
    check_settings.content(Region(10, 11, 12, 13))
    check_settings.floating(10, "floating selector")
    check_settings.floating(20, Region(20, 21, 22, 23))
    check_settings.accessibility(
        "accessibility selector", AccessibilityRegionType.BoldText
    )
    check_settings.accessibility(
        Region(30, 31, 32, 33), AccessibilityRegionType.LargeText
    )

    result, errors = serializer.dump(check_settings.values)
    assert errors == {}
    assert result == {
        "accessibilityRegions": [
            {
                "region": {
                    "selector": "accessibility selector",
                    "type": "css selector",
                },
                "type": "BoldText",
            },
            {
                "region": {"height": 33.0, "width": 32.0, "x": 30.0, "y": 31.0},
                "type": "LargeText",
            },
        ],
        "contentRegions": [
            {
                "region": {"selector": "content selector", "type": "css selector"},
                "regionId": "content id",
            },
            {"region": {"height": 13.0, "width": 12.0, "x": 10.0, "y": 11.0}},
        ],
        "disableBrowserFetching": True,
        "enablePatterns": True,
        "floatingRegions": [
            {
                "maxDownOffset": 10,
                "maxLeftOffset": 10,
                "maxRightOffset": 10,
                "maxUpOffset": 10,
                "region": {"selector": "floating selector", "type": "css selector"},
            },
            {
                "maxDownOffset": 20,
                "maxLeftOffset": 20,
                "maxRightOffset": 20,
                "maxUpOffset": 20,
                "region": {"height": 23.0, "width": 22.0, "x": 20.0, "y": 21.0},
            },
        ],
        "frames": [
            {
                "frame": {"selector": "frame element selector", "type": "css selector"},
                "scrollRootElement": {
                    "selector": "frame scroll root selector",
                    "type": "css selector",
                },
            }
        ],
        "fully": True,
        "hooks": {"beforeCaptureScreenshot": "hook"},
        "ignoreCaret": True,
        "ignoreDisplacements": True,
        "ignoreRegions": [
            {
                "padding": {"top": 5},
                "region": {"selector": "ignore selector", "type": "css selector"},
                "regionId": "ignore id",
            }
        ],
        "layoutBreakpoints": True,
        "layoutRegions": [
            {"region": {"height": 4.0, "width": 3.0, "x": 1.0, "y": 2.0}}
        ],
        "lazyLoad": {"maxAmountToScroll": 3, "scrollLength": 1, "waitingTime": 2},
        "matchLevel": "Layout",
        "name": "name",
        "pageId": "page id",
        "region": {"selector": "sel", "type": "css selector"},
        "scrollRootElement": {
            "selector": "root scroll root selector",
            "type": "css selector",
        },
        "sendDom": True,
        "strictRegions": [{"region": {"elementId": "dummy id 1"}}],
        "timeout": -1,
        "useDom": True,
        "variationGroupId": "vargroup id",
        "visualGridOptions": {"vo key": "vo value"},
        "waitBeforeCapture": 5,
    }


def test_visual_locator_settings_marshal():
    serializer = schema.LocateSettings()
    settings = VisualLocatorSettings("a", "b").first()

    result, errors = serializer.dump(settings.values)

    assert errors == {}
    assert result == {"firstOnly": True, "locatorNames": ["a", "b"]}


def test_text_region_settings_marshal():
    serializer = schema.OCRSearchSettings()
    settings = TextRegionSettings(["a", "b"]).ignore_case().first_only()

    results, errors = serializer.dump(settings)

    assert errors == {}
    assert results == {
        "firstOnly": True,
        "ignoreCase": True,
        "language": "eng",
        "patterns": ["a", "b"],
    }


def test_ocrregion_marshal():
    serializer = schema.OCRExtractSettings()
    settings_sel = OCRRegion("ocr selector").min_match(2).hint("hint")
    settings_region = OCRRegion(Region(1, 2, 3, 4))

    results, errors = serializer.dump(settings_sel)
    assert errors == {}
    assert results == {
        "hint": "hint",
        "language": "eng",
        "minMatch": 2.0,
        "target": {"selector": "ocr selector", "type": "css selector"},
    }

    results, errors = serializer.dump(settings_region)
    assert errors == {}
    assert results == {
        "language": "eng",
        "target": {"height": 4.0, "width": 3.0, "x": 1.0, "y": 2.0},
    }


def test_size_marshal():
    serializer = schema.Size()

    assert serializer.dump({"width": 1, "height": 2}) == ({"width": 1, "height": 2}, {})
    assert serializer.dump(RectangleSize(3, 4)) == ({"width": 3, "height": 4}, {})


def test_enabled_batch_close_marshal():
    serializer = schema.CloseBatchesSettings()
    settings = (
        BatchClose()
        .set_proxy(ProxySettings("host", 80, "user", "pass"))
        .set_api_key("api key")
        .set_batch_ids("batch id")
    )

    result, errors = serializer.dump(settings)
    assert errors == {}
    assert result == {
        "apiKey": "api key",
        "batchIds": ["batch id"],
        "proxy": {
            "password": "pass",
            "url": "http://user:pass@host:80",
            "username": "user",
        },
        "serverUrl": "https://eyesapi.applitools.com",
    }


def test_delete_test_settings_marshall():
    serializer = schema.DeleteTestSettings()
    results = TestResults()
    results.id = "results is"
    results.batch_id = "batch id"
    results.secret_token = "secret token"
    results.set_connection_config("server url", "api key", ProxySettings("proxy"))

    result, errors = serializer.dump(results)
    assert errors == {}
    assert result == {
        "apiKey": "api key",
        "batchId": "batch id",
        "proxy": {"url": "http://proxy:8888"},
        "secretToken": "secret token",
        "serverUrl": "server url",
        "testId": "results is",
    }


def test_match_result_demarshal():
    deserializer = schema.MatchResult()

    loaded, errors = deserializer.load({"asExpected": True, "windowId": "w"})

    assert errors == {}
    assert loaded == MatchResult(as_expected=True, window_id="w", screenshot=None)


def test_locate_result_demarshal():
    deserializer = schema.Region()

    loaded, errors = deserializer.load({"left": 1, "top": 2, "width": 3, "height": 4})

    assert errors == {}
    assert loaded == Region(left=1, top=2, width=3, height=4)


def test_locate_result_demarshal_aliases():
    deserializer = schema.Region()

    loaded, errors = deserializer.load({"x": 1, "y": 2, "width": 3, "height": 4})

    assert errors == {}
    assert loaded == Region(left=1, top=2, width=3, height=4)


def test_server_info_demarshal():
    deserializer = schema.ServerInfo()

    loaded, errors = deserializer.load({"logsDir": "/"})

    assert errors == {}
    assert loaded == ServerInfo(logs_dir="/")


def test_test_results_demarshal():
    deserializer = schema.TestResults()

    result, errors = deserializer.load(
        {
            "steps": 1,
            "matches": 2,
            "mismatches": 3,
            "missing": 4,
            "exactMatches": 5,
            "strictMatches": 6,
            "contentMatches": 7,
            "layoutMatches": 8,
            "noneMatches": 9,
            "isNew": False,
            "url": "a",
            "status": "Passed",
            "name": "b",
            "secretToken": "c",
            "id": "e",
            "appName": "f",
            "batchName": "g",
            "batchId": "h",
            "branchName": "i",
            "hostOS": "j",
            "hostApp": "k",
            "hostDisplaySize": {"width": 1, "height": 2},
            "startedAt": "l",
            "duration": 10,
            "isDifferent": True,
            "isAborted": False,
            "isEmpty": False,
            "appUrls": {"batch": "a", "session": "b"},
            "apiUrls": {"batch": "c", "session": "d"},
            "stepsInfo": [
                {
                    "name": "a",
                    "isDifferent": True,
                    "hasBaselineImage": True,
                    "hasCurrentImage": True,
                    "hasCheckpointImage": False,
                    "apiUrls": {
                        "baselineImage": "a",
                        "currentImage": "b",
                        "diffImage": "c",
                        "checkpointImage": "d",
                        "checkpointImageThumbnail": "e",
                    },
                    "appUrls": {"step": "a", "stepEditor": "b"},
                }
            ],
            "baselineId": "m",
            "defaultMatchSettings": {},
            "accessibilityStatus": {
                "status": "Passed",
                "level": "AA",
                "version": "WCAG_2_1",
            },
            "userTestId": "n",
        }
    )

    assert errors == {}
    assert result == TestResults(
        steps=1,
        matches=2,
        mismatches=3,
        missing=4,
        exact_matches=5,
        strict_matches=6,
        content_matches=7,
        layout_matches=8,
        none_matches=9,
        is_new=False,
        url="a",
        status=TestResultsStatus.Passed,
        name="b",
        secret_token="c",
        id="e",
        app_name="f",
        batch_name="g",
        batch_id="h",
        branch_name="i",
        host_os="j",
        host_app="k",
        host_display_size=RectangleSize(1, 2),
        started_at="l",
        duration=10,
        is_different=True,
        is_aborted=False,
        is_empty=False,
        steps_info=[
            StepInfo(
                name="a",
                is_different=True,
                has_baseline_image=True,
                has_current_image=True,
                has_checkpoint_image=False,
                api_urls=StepInfo.ApiUrls(
                    baseline_image="a",
                    current_image="b",
                    diff_image="c",
                    checkpoint_image="d",
                    checkpoint_image_thumbnail="e",
                ),
                app_urls=StepInfo.AppUrls(step="a", step_editor="b"),
            )
        ],
        app_urls=SessionUrls("a", "b"),
        api_urls=SessionUrls("c", "d"),
        baseline_id="m",
        accessibility_status=SessionAccessibilityStatus("Passed", "AA", "WCAG_2_1"),
        user_test_id="n",
    )


def test_test_results_summary_demarshal():
    deserializer = schema.TestResultsSummary()

    result, errors = deserializer.load(
        {
            "results": [
                {
                    "testResults": {},
                    "exception": None,
                    "userTestId": "user test id",
                    "browserInfo": {"width": 800, "name": "chrome", "height": 600},
                },
                {
                    "testResults": {},
                    "exception": {
                        "message": "error message",
                        "stack": "stack",
                        "reason": "test different",
                    },
                    "userTestId": "user test id",
                    "browserInfo": {"width": 640, "name": "firefox", "height": 480},
                },
            ],
            "passed": 1,
            "unresolved": 2,
            "failed": 3,
            "exceptions": 4,
            "mismatches": 5,
            "missing": 6,
            "matches": 7,
        }
    )

    assert errors == {}
    assert result == TestResultsSummary(
        passed=1,
        unresolved=2,
        failed=3,
        exceptions=4,
        mismatches=5,
        missing=6,
        matches=7,
        results=[
            TestResultContainer(
                test_results=TestResults(),
                exception=None,
                user_test_id="user test id",
                browser_info=DesktopBrowserInfo(800, 600, BrowserType.CHROME),
            ),
            TestResultContainer(
                test_results=TestResults(),
                exception=ANY,
                user_test_id="user test id",
                browser_info=DesktopBrowserInfo(640, 480, BrowserType.FIREFOX),
            ),
        ],
    )
    assert result[1].exception.args == ("error message",)
