import os
import subprocess
from os import path

import pytest
from robot.result import ExecutionResult

from EyesLibrary.test_results_manager import (
    METADATA_EYES_TEST_RESULTS_URL_NAME,
    METADATA_PATH_TO_EYES_RESULTS_NAME,
)

backend_to_backend_name = {
    "selenium": "SeleniumLibrary",
    "appium": "AppiumLibrary",
}


def run_robot(*args, output_file_path=None):
    test_dir = path.join(path.dirname(__file__), "robot_tests")
    call_args = (
        "python",
        "-m",
        "robot",
        "--output={}.xml".format(output_file_path),
        "--report={}.html".format(output_file_path),
        "--log={}-log.html".format(output_file_path),
    ) + args
    result = subprocess.run(
        call_args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=test_dir
    )
    return result.returncode, result.stdout.decode()


@pytest.mark.parametrize("runner", ["web", "web_ufg"])
@pytest.mark.parametrize(
    "with_propagation",
    [
        [
            "--prerebotmodifier",
            "EyesLibrary.PropagateEyesTestResults",
        ],
        [],
    ],
    ids=lambda d: "manual propagate" if d else "auto patched",
)
def test_suite_dir_with_results_propagation_and_one_diff_in_report(
    tmp_path, runner, with_propagation, local_chrome_driver
):
    output_file_path = os.path.join(tmp_path, "testsuite-dir")
    args = with_propagation + [
        "--variable",
        "RUNNER:{}".format(runner),
        "test_suite_dir",
    ]
    run_robot(*args, output_file_path=output_file_path)
    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [
        t for suite in result.suite.suites for t in suite.tests if t.status != "PASS"
    ]
    assert not_passed == []
    assert METADATA_PATH_TO_EYES_RESULTS_NAME in result.suite.suites[0].metadata
    assert METADATA_PATH_TO_EYES_RESULTS_NAME in result.suite.suites[1].metadata

    # check that report html is containing 1 failed test
    # need browser here to display js based content
    local_chrome_driver.get("file://" + output_file_path + ".html")
    assert METADATA_EYES_TEST_RESULTS_URL_NAME in local_chrome_driver.page_source
    assert "1 test failed" in local_chrome_driver.page_source


@pytest.mark.parametrize(
    "data",
    [
        ("web", "appium", "android"),
        ("web", "appium", "ios"),
        ("web", "selenium", "android"),
        ("web", "selenium", "ios"),
        ("web_ufg", "selenium", "desktop"),
    ],
    ids=lambda d: str(d),
)
def test_suite_web(data, tmp_path):
    runner, backend, platform = data
    output_file_path = os.path.join(
        tmp_path, "{}-{}-{}".format(runner, backend, platform)
    )
    run_robot(
        "--variablefile",
        "variables_test.py:{runner}:{backend}:{platform}".format(
            runner=runner, backend=backend, platform=platform
        ),
        "web_only.robot",
        output_file_path=output_file_path,
    )
    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == []


def test_web_desktop(
    tmp_path,
):
    runner, backend, platform = "web", "selenium", "desktop"
    output_file_path = os.path.join(
        tmp_path, "{}-{}-{}".format(runner, backend, platform)
    )
    run_robot(
        "--variablefile",
        "variables_test.py:{runner}:{backend}:{platform}".format(
            runner=runner, backend=backend, platform=platform
        ),
        "web_desktop_only.robot",
        "web_only.robot",
        output_file_path=output_file_path,
    )
    result = ExecutionResult(output_file_path + ".xml")

    not_passed = [
        t for suite in result.suite.suites for t in suite.tests if t.status != "PASS"
    ]
    assert not_passed == []


@pytest.mark.parametrize(
    "data",
    [
        ["android", "mobile_native"],
        ["ios", "mobile_native"],
        ["ios", "native_mobile_grid"],
    ],
    ids=lambda d: str(d),
)
def test_suite_mobile_native(data, tmp_path):
    backend = "appium"
    platform, runner = data
    output_file_path = os.path.join(
        tmp_path, "{}-{}-{}".format(runner, backend, platform)
    )
    run_robot(
        "--variablefile",
        "variables_test.py:{runner}:{backend}:{platform}".format(
            runner=runner, backend=backend, platform=platform
        ),
        "mobile_native.robot",
        output_file_path=output_file_path,
    )

    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == []
