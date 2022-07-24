from __future__ import absolute_import, unicode_literals

from robot.running.model import TestSuite

from .base import LibraryComponent

__all__ = ("LibraryListener",)

from .test_results_manager import EyesToRobotTestResultsManager


class LibraryListener(LibraryComponent):
    ROBOT_LISTENER_API_VERSION = 3

    def __init__(self, *args, **kwargs):
        super(LibraryListener, self).__init__(*args, **kwargs)
        self.test_results_manager = EyesToRobotTestResultsManager(self.ctx.configure)

    def start_suite(self, data, result):
        # type: (TestSuite, TestSuite) -> None
        self.create_eyes_runner_if_needed()
        self.debug("Runner created")
        self.test_results_manager.register_robot_suite_started(data, result)

    def close(self):
        # type: () -> None
        with self.eyes_runner_get_all_test_results() as test_results:
            self.test_results_manager.register_eyes_test_results_on_close(test_results)

    def start_test(self, data, result):
        # type: (TestSuite, TestSuite) -> None
        self.test_results_manager.register_robot_test_started(data, result)

    def end_test(self, data, result):
        # type: (TestSuite, TestSuite) -> None
        self.test_results_manager.register_robot_test_ended(data, result)
