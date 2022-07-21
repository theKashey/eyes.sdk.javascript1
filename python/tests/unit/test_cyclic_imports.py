from os import path, walk
from subprocess import check_call
from sys import executable

import pytest

import EyesLibrary
from applitools import common, core, eyes_universal, selenium


def enum_modules(package):
    package_root = path.dirname(package.__file__)
    for root, dirs, files in walk(package_root):
        rel_path = path.relpath(root, package_root)
        if rel_path == ".":
            rel_path = ""
        for file in files:
            if file.endswith(".py"):
                module_path = path.join(rel_path, file).replace(path.sep, ".")
                yield package.__name__ + "." + module_path[:-3]


@pytest.mark.parametrize("pkg", [common, core, selenium, eyes_universal, EyesLibrary])
def test_cyclic_imports(pkg):
    for module in enum_modules(pkg):
        if module.endswith("__main__"):
            continue
        check_call([executable, "-c", "import " + module])
