from __future__ import absolute_import

import logging
import os
import re
import sys

import pytest
from selenium import webdriver

from applitools.selenium import Configuration, Eyes
from applitools.selenium.__version__ import __version__

try:
    from typing import TYPE_CHECKING, Generator, Iterable, Optional, Text
except ImportError:
    TYPE_CHECKING = False
    pass


logger = logging.getLogger(__name__)


@pytest.fixture
def eyes_class():
    return Eyes


@pytest.fixture
def eyes_config_base():
    return (
        Configuration()
        .set_hide_scrollbars(True)
        .set_save_new_tests(False)
        .set_hide_caret(True)
        .set_parent_branch_name("master")
    )


def pytest_generate_tests(metafunc):
    os.environ["APPLITOOLS_BATCH_NAME"] = "Py{}.{}|Sel|{}|{}".format(
        sys.version_info.major,
        sys.version_info.minor,
        __version__,
        sys.platform,
    )


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    # this sets the result as a test attribute for SauceLabs reporting.
    # execute all other hooks to obtain the report object
    outcome = yield
    rep = outcome.get_result()

    # set an report attribute for each phase of a call, which can
    # be "setup", "call", "teardown"
    setattr(item, "rep_" + rep.when, rep)
