import os

import pytest
from selenium import webdriver
from six import iteritems

from applitools.common import BatchInfo, Configuration, StdoutLogger

pytest_plugins = ("tests.functional.pytest_reporting",)


@pytest.fixture
def sauce_driver_url():
    return "https://{}:{}@ondemand.saucelabs.com:443/wd/hub".format(
        os.environ["SAUCE_USERNAME"], os.environ["SAUCE_ACCESS_KEY"]
    )


@pytest.fixture(scope="session")
def eyes_runner_class():
    return lambda: None


@pytest.fixture(scope="session")
def eyes_runner(eyes_runner_class):
    runner = eyes_runner_class()
    yield runner
    if runner:
        print(runner.get_all_test_results(False))


@pytest.fixture
def eyes_config_base():
    return Configuration().set_save_new_tests(False)


@pytest.fixture
def eyes_config(eyes_config_base):
    return eyes_config_base


@pytest.fixture(scope="session")
def batch_info():
    return BatchInfo(os.getenv("APPLITOOLS_BATCH_NAME", "Python SDK"))


@pytest.fixture(name="eyes", scope="function")
def eyes_setup(request, eyes_class, eyes_config, eyes_runner, batch_info):
    # TODO: allow to setup logger level through pytest option
    # in case eyes-images
    eyes = eyes_class()
    if eyes_runner:
        eyes = eyes_class(eyes_runner)

    # configure eyes options through @pytest.mark.eyes_config() marker
    config_mark_opts = request.node.get_closest_marker("eyes_config")
    config_mark_opts = config_mark_opts.kwargs if config_mark_opts else {}

    for key, val in iteritems(config_mark_opts):
        setattr(eyes_config, key, val)

    eyes.set_configuration(eyes_config)
    eyes.add_property("Agent ID", eyes.full_agent_id)

    yield eyes
    eyes.abort()


@pytest.fixture
def local_chrome_driver(request):
    test_page_url = request.node.get_closest_marker("test_page_url")
    test_page_url = test_page_url.args[-1] if test_page_url else None
    options = webdriver.ChromeOptions()
    options.headless = True
    with webdriver.Chrome(options=options) as driver:
        if test_page_url:
            driver.get(test_page_url)
        yield driver
