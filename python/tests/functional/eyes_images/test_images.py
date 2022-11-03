import os

import pytest
import requests
import six
from PIL import Image

from applitools.common import MatchLevel, Region
from applitools.images import Eyes, OCRRegion, Target


def test_image_check_fluent(target, eyes):
    eyes.check(target)


def test_image_check_image(image, eyes):
    eyes.check_image(image)


def test_image_check_region(image, eyes, app_output):
    eyes.check_region(image, Region(50, 50, 50, 50))

    assert app_output()[0]["image"]["rectangle"] == "0, 0, 50, 50"


def test_image_check_fluent_ignore(png_target, eyes, app_output):
    eyes.check(png_target.ignore(Region(0, 0, 25, 25)))

    ignore_regions = app_output()[0]["imageMatchSettings"]["ignore"]
    assert ignore_regions == [{"width": 25, "top": 0, "height": 25, "left": 0}]


def test_image_check_fluent_floating(png_target, eyes, app_output):
    eyes.check(png_target.floating(Region(0, 0, 25, 25), 1, 2, 3, 4))

    floating_regions = app_output()[0]["imageMatchSettings"]["floating"]
    assert floating_regions == [
        {
            "top": 0,
            "left": 0,
            "width": 25,
            "height": 25,
            "maxUpOffset": 1,
            "maxDownOffset": 2,
            "maxLeftOffset": 3,
            "maxRightOffset": 4,
        }
    ]


@pytest.mark.parametrize("match_level", tuple(MatchLevel))
def test_image_check_fluent_match_level(match_level, png_target, eyes, app_output):
    eyes.check(png_target.match_level(match_level))

    expected = {
        MatchLevel.EXACT: "Exact",
        MatchLevel.LAYOUT2: "Layout2",
        MatchLevel.NONE: "None",
        MatchLevel.STRICT: "Strict",
        # Remapped
        MatchLevel.IGNORE_COLORS: "Content",
        MatchLevel.LAYOUT: "Layout2",
        MatchLevel.LAYOUT1: "Layout",
    }
    assert app_output()[0]["imageMatchSettings"]["matchLevel"] == expected[match_level]


@pytest.mark.parametrize("should_ignore", [True, False])
def test_image_check_fluent_ignore_displacements(
    png_target, should_ignore, eyes, app_output
):
    eyes.check(png_target.ignore_displacements(should_ignore))

    assert app_output()[0]["imageMatchSettings"]["ignoreDisplacements"] == should_ignore


@pytest.mark.parametrize("enable", [True, False])
def test_image_check_fluent_enable_patterns(png_target, enable, eyes, app_output):
    eyes.check(png_target.enable_patterns(enable))

    assert app_output()[0]["imageMatchSettings"]["enablePatterns"] == enable


#
def test_image_extract_text(ocr_image, eyes):
    text = eyes.extract_text(OCRRegion(ocr_image))

    assert text == ["This is the navigation bar"]


def test_image_extract_text_region(ocr_image, eyes):
    text = eyes.extract_text(OCRRegion(ocr_image, Region(55, 11, 214, 18)))

    assert text == ["s the navigation bar"]


def img_path(kind):
    img_dir = (
        os.path.abspath(os.path.dirname(__file__) + "/../../resources") + "/{0}.{0}"
    )
    return img_dir.format(kind)


@pytest.fixture(params=("png", "jpg", "bmp"))
def kind(request):
    return request.param


@pytest.fixture(params=("path", "pathlike", "url", "buffer", "pil_img"))
def image(kind, request):
    if request.param == "url":
        img_url = (
            "https://raw.githubusercontent.com/applitools/eyes.sdk.javascript1/"
            "master/python/tests/resources/{0}.{0}"
        )
        return img_url.format(kind)
    elif request.param == "path":
        return img_path(kind)
    elif request.param == "pathlike":
        if six.PY2:
            pytest.skip("No pathlike classes in python 2")
        from pathlib import Path

        return Path(img_path(kind))
    elif request.param == "buffer":
        if six.PY2:
            pytest.skip("No way to tell bytes from string in python 2")
        return open(img_path(kind), "rb").read()
    else:
        return Image.open(img_path(kind))


@pytest.fixture
def ocr_image():
    return os.path.abspath(os.path.dirname(__file__)) + "/resources/extractText.png"


@pytest.fixture(params=("image", "region"))
def target(request, image):
    if request.param == "image":
        return Target.image(image)
    else:
        return Target.region(image, Region(50, 50, 50, 50))


@pytest.fixture(params=("image", "region"))
def png_target(request):
    if request.param == "image":
        return Target.image(img_path("png"))
    else:
        return Target.region(img_path("png"), Region(50, 50, 50, 50))


@pytest.fixture
def eyes(request):
    eyes = Eyes()
    eyes.open("Eyes Images", request.node.name, dimension={"width": 150, "height": 150})
    try:
        yield eyes
        if eyes.is_open:
            eyes.close()
    finally:
        eyes.abort()


@pytest.fixture
def app_output(eyes):
    def get_test_info():
        results = eyes.close()
        r = requests.get(
            results.api_urls.session,
            params={
                "format": "json",
                "AccessToken": results.secret_token,
                "apiKey": eyes.configure.api_key,
            },
        )
        r.raise_for_status()
        return r.json()["actualAppOutput"]

    return get_test_info
