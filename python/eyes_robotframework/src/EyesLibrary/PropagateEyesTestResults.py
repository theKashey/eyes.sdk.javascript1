from robot.api import SuiteVisitor
from robot.api import logger as robot_logger
from robot.model import TestSuite

from EyesLibrary.test_results_manager import SuitePostProcessManager


class PropagateEyesTestResults(SuiteVisitor):
    """Post-propagate eyes test results to robot report. The original `output.xml` file
    won't change, only `report.html` and `logs.html` are affected."""

    def start_suite(self, suite):
        # type: (TestSuite) -> None
        manager = SuitePostProcessManager(suite)

        try:
            manager.import_suite_data()
        except (KeyError, FileNotFoundError) as e:
            robot_logger.debug(
                "Failed to post-process suite: {} with error: {}".format(suite.name, e)
            )
            return
        manager.process_suite()
