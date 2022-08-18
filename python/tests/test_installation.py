import os.path
from subprocess import call, check_call, check_output

import pytest

from applitools.eyes_universal import __version__ as eyes_universal_version
from applitools.selenium.__version__ import __version__ as eyes_selenium_version
from EyesLibrary.__version__ import __version__ as eyes_robotframework_version

here = os.path.dirname(__file__)
root_dir = os.path.normpath(os.path.join(here, os.pardir))

env = dict(os.environ)
env.pop("PYTHONPATH", None)


def _get_venv_package_license(venv, package):
    # strip all non-ascii charters to avoid console encoding error on windows
    cmd = [
        venv.python,
        "-c",
        "from pkg_resources import get_distribution;"
        "from sys import version_info;"
        "py2 = version_info < (3,);"
        'license = get_distribution("{package}").get_metadata("LICENSE");'
        'license = license.decode("utf-8") if py2 else license;'
        'print(license.encode("ascii", "ignore"))'.format(package=package),
    ]
    return check_output(cmd, env=env).decode("ascii")


@pytest.fixture
def eyes_universal_installed(venv):
    call([venv.python, "-m", "pip", "uninstall", "-y", "wheel"], env=env)
    wheels = os.path.join(root_dir, "eyes_universal", "dist")
    pip = [venv.python, "-m", "pip", "install", "--no-index", "--find-links", wheels]
    check_call(pip + ["eyes_universal==" + eyes_universal_version], env=env)


@pytest.fixture
def eyes_selenium_installed(venv, eyes_universal_installed):
    file_name = "eyes_selenium-{}-py2.py3-none-any.whl".format(eyes_selenium_version)
    eyes_selenium = os.path.join(root_dir, "eyes_selenium", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    check_call(pip + [eyes_selenium], env=env)


@pytest.fixture
def eyes_robotframework_installed(venv, eyes_universal_installed):
    file_name = "eyes_selenium-{}-py2.py3-none-any.whl".format(eyes_selenium_version)
    eyes_selenium = os.path.join(root_dir, "eyes_selenium", "dist", file_name)
    file_name = "eyes_robotframework-{}-py2.py3-none-any.whl".format(
        eyes_robotframework_version
    )
    eyes_robot = os.path.join(root_dir, "eyes_robotframework", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    check_call(pip + [eyes_selenium, eyes_robot], env=env)


def test_setup_eyes_universal(venv, eyes_universal_installed):
    assert str(venv.get_version("eyes-universal")) == eyes_universal_version
    get_version = [venv.python, "-m", "applitools.eyes_universal", "--version"]
    # drop post-version part, that might only be present in package version
    binary_version = ".".join(eyes_universal_version.split(".")[:3])
    assert binary_version.encode() == check_output(get_version, env=env).rstrip()


def test_eyes_universal_has_license(venv, eyes_universal_installed):
    license = _get_venv_package_license(venv, "eyes-universal")
    assert "SDK LICENSE AGREEMENT" in license


def test_setup_eyes_selenium(venv, eyes_selenium_installed):
    assert str(venv.get_version("eyes-selenium")) == eyes_selenium_version
    check_call([venv.python, "-c", "from applitools.selenium import *"], env=env)


def test_eyes_selenium_has_license(venv, eyes_selenium_installed):
    license = _get_venv_package_license(venv, "eyes-selenium")
    assert "SDK LICENSE AGREEMENT" in license


def test_setup_eyes_robot(venv, eyes_robotframework_installed):
    assert str(venv.get_version("eyes-robotframework")) == eyes_robotframework_version
    check_call([venv.python, "-c", "from EyesLibrary import *"], env=env)


def test_eyes_robotframework_has_license(venv, eyes_robotframework_installed):
    license = _get_venv_package_license(venv, "eyes-robotframework")
    assert "SDK LICENSE AGREEMENT" in license
