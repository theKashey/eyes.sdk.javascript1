from os import chmod, mkdir, path, remove
from sys import platform

from setuptools import setup
from setuptools.command.build_py import build_py as _build_py
from setuptools.command.sdist import sdist as _sdist

try:
    from urllib.request import urlretrieve
except ImportError:
    from urllib import urlretrieve

try:
    from wheel.bdist_wheel import bdist_wheel as _bdist_wheel
except ImportError:
    _bdist_wheel = None

commands = set()


def current_platform_executable():
    if platform == "darwin":
        return "macos"
    elif platform == "win32":
        return "win"
    if platform in ("linux", "linux2"):
        if path.exists("/etc/alpine-release"):
            return "alpine"
        else:
            return "linux"
    else:
        raise Exception("Platform is not supported", platform)


# Download previously selected executable.
# It is downloaded to the source tree (so editable setup works). Added it to the
# package_data of the distribution to be installed or packed into wheel.
@commands.add
class build_py(_build_py):  # noqa
    def get_data_files(self):
        if download_executable:
            ext = ".exe" if download_executable == "win" else ""
            version = self.distribution.get_version()
            package_bin_name = "bin/eyes-universal" + ext
            relative_bin_name = "applitools/eyes_universal/" + package_bin_name
            url_template = (
                "https://github.com/applitools/eyes.sdk.javascript1/releases/download/"
                "%40applitools%2Feyes-universal%40{version}/eyes-universal-{exe}{ext}"
            )
            url = url_template.format(version=version, exe=download_executable, ext=ext)
            if not path.isdir(path.dirname(relative_bin_name)):
                mkdir(path.dirname(relative_bin_name))
            try:
                urlretrieve(url, relative_bin_name)
            except BaseException:
                if path.isfile(relative_bin_name):
                    remove(relative_bin_name)
                raise
            chmod(relative_bin_name, 0o755)
            self.package_data[""].append(package_bin_name)
        return _build_py.get_data_files(self)


# Prevent executable download and inclusion in source distributions.
@commands.add
class sdist(_sdist):  # noqa
    def finalize_options(self):
        global download_executable
        download_executable = None
        return _sdist.finalize_options(self)


if _bdist_wheel:
    # Override bdist_wheel to allow cross-building packages for other platforms by
    # supplying --plat-name argument. Download and include executable matching
    # target platform instead of current one.
    @commands.add
    class bdist_wheel(_bdist_wheel):  # noqa
        def finalize_options(self):
            global download_executable
            _bdist_wheel.finalize_options(self)
            # When plat-name argument is *not* provided to bdist_wheel, wheel is marked
            # with 'any' platform tag because it is also marked as "universal".
            # It has to be universal because it supports py2 and py3, but the executable
            # packaged is not cross-platform, so mark it with current platform's name.
            self.plat_name_supplied = True  # noqa
            if "macosx" in self.plat_name:
                download_executable = "macos"
            elif "manylinux" in self.plat_name:
                download_executable = "linux"
            elif "musllinux" in self.plat_name:
                download_executable = "alpine"
            elif "win" in self.plat_name:
                download_executable = "win"
            else:
                raise ValueError("Unsupported platform", self.plat_name)


download_executable = current_platform_executable()
setup(cmdclass={c.__name__: c for c in commands}, package_data={"": []})
