from __future__ import absolute_import, unicode_literals

import json
import os
import tempfile
import uuid
from collections import defaultdict
from typing import TYPE_CHECKING, Generator, Optional, Text

from robot.api import logger as robot_logger
from robot.utils import get_timestamp

from applitools.common.test_results import TestResultsStatus

from .keywords_list import CHECK_KEYWORDS_LIST

if TYPE_CHECKING:
    from robot.running import TestSuite

    from applitools.common import TestResults, TestResultsSummary
    from EyesLibrary.config import RobotConfiguration

__all__ = ["EyesToRobotTestResultsManager", "SuitePostProcessManager"]

EYES_STATUS_TO_ROBOT_STATUS = {
    TestResultsStatus.Passed: "PASS",
    TestResultsStatus.Failed: "FAIL",
    TestResultsStatus.Unresolved: "FAIL",
}
METADATA_PATH_TO_EYES_RESULTS_NAME = "Applitools TestResults Path"
METADATA_EYES_TEST_RESULTS_URL_NAME = "Applitools Test Results Url"
EYES_TEST_JSON_NAME = "EyesTestResults"


def save_suites(path_to_test_results, suites):
    # type: (Text, dict[list[dict]]) -> None
    results = json.dumps(suites)
    with open(path_to_test_results, "w") as f:
        f.write(results)


def restore_suite(path_to_test_results):
    # type: (Text) -> dict[list[dict]]
    with open(path_to_test_results, "r") as f:
        return json.load(f)


class SuitePostProcessManager(object):
    """Update Suite with data from json saved by `EyesToRobotTestResultsManager`"""

    def __init__(self, robot_suite):
        # type: (TestSuite) -> None
        self.robot_test_suite = robot_suite
        self.current_suite = None  # type: Optional[list[dict]]

    def import_suite_data(self):
        # type: () -> None
        path_to_test_results = self.robot_test_suite.metadata.get(
            METADATA_PATH_TO_EYES_RESULTS_NAME
        )
        if path_to_test_results is None:
            raise KeyError(
                "No `{}` found in metadata".format(METADATA_PATH_TO_EYES_RESULTS_NAME)
            )
        if not os.path.exists(path_to_test_results):
            raise FileNotFoundError("File `{}` not found".format(path_to_test_results))
        suites_results_data = restore_suite(path_to_test_results)
        self.current_suite = suites_results_data[self.robot_test_suite.name]

    def process_suite(self):
        # type: () -> None
        if not self.current_suite:
            robot_logger.debug(
                "No tests found. Skip updating of test results of {}".format(
                    self.robot_test_suite
                )
            )
            return
        robot_test_name_to_status = {
            t["test_name"]: (t["test_status"], t["steps"]) for t in self.current_suite
        }
        for robot_test in self.robot_test_suite.tests:
            robot_test_status, steps_info = robot_test_name_to_status[robot_test.name]
            robot_test.status = robot_test_status
            check_keywords = (
                kw
                for kw in robot_test.body
                if kw.libname == "EyesLibrary" and kw.kwname in CHECK_KEYWORDS_LIST
            )
            for check_keyword, step_info in zip(check_keywords, steps_info):
                if step_info["is_different"]:
                    check_keyword.status = "FAIL"
                check_keyword.body.create_message(
                    message="Check result url: " + step_info["url"],
                    timestamp=get_timestamp(),
                )

        self.robot_test_suite.metadata[
            METADATA_EYES_TEST_RESULTS_URL_NAME
        ] = self.current_suite[0]["test_results_url"]


class EyesToRobotTestResultsManager(object):
    """Collects test results from the Eyes,
    map them to the robot tests and save to the json file.
    Path to file is stored inside Suite metadata"""

    def __init__(self, configure):
        # type: (Optional[RobotConfiguration]) -> None
        self.configure = configure
        if not self.configure.propagate_eyes_test_results:
            return
        self.test_id_to_suite = {}  # type: dict[Text, TestSuite]
        output_dir = tempfile.mkdtemp()
        self.path_to_test_results = os.path.join(
            output_dir, "{}-{}.json".format(EYES_TEST_JSON_NAME, uuid.uuid4().hex)
        )

    def register_robot_suite_started(self, data, result):
        # type: (TestSuite,TestSuite) -> None
        if not self.configure.propagate_eyes_test_results:
            return
        result.metadata[METADATA_PATH_TO_EYES_RESULTS_NAME] = self.path_to_test_results

    def register_robot_test_started(self, data, result):
        # type: (TestSuite,TestSuite) -> None
        if not self.configure.propagate_eyes_test_results:
            return
        self.configure.user_test_id = str(uuid.uuid4())

    def register_robot_test_ended(self, data, result):
        # type: (TestSuite,TestSuite) -> None
        if not self.configure.propagate_eyes_test_results:
            return
        self.test_id_to_suite[self.configure.user_test_id] = result
        self.configure.user_test_id = None

    def register_eyes_test_results_on_close(self, test_results_summary):
        # type: (TestResultsSummary) -> None
        if not self.configure.propagate_eyes_test_results:
            return
        suites = defaultdict(list)

        for test_results in self.process_test_results(test_results_summary):
            robot_test_name = self.test_id_to_suite[test_results.user_test_id].name
            robot_test_suite_name = self.test_id_to_suite[
                test_results.user_test_id
            ].parent.name
            suites[robot_test_suite_name].append(
                dict(
                    test_name=robot_test_name,
                    test_status=EYES_STATUS_TO_ROBOT_STATUS[test_results.status],
                    test_results_url=test_results.url,
                    steps=[
                        dict(
                            is_different=step.is_different,
                            url=step.app_urls.step,
                        )
                        for step in test_results.steps_info
                    ],
                )
            )
        save_suites(self.path_to_test_results, suites)

    @staticmethod
    def process_test_results(test_results_summary):
        # type: (TestResultsSummary) -> Generator[TestResults]
        test_id_to_test_results = defaultdict(list)  # type: dict[list[TestResults]]
        for test_result_container in test_results_summary:
            test_id_to_test_results[test_result_container.user_test_id].append(
                test_result_container.test_results
            )
        for test_results_list in test_id_to_test_results.values():
            for test_result in test_results_list:
                if test_result.status in [
                    TestResultsStatus.Failed,
                    TestResultsStatus.Unresolved,
                ]:
                    yield test_result
                    break
            else:
                yield test_results_list[0]
