import pytest
import six

from applitools.common import MatchLevel, RectangleSize, Region
from EyesLibrary.utils import (
    get_enum_by_name,
    get_enum_by_upper_name,
    parse_padding,
    parse_padding_dict,
    parse_region,
    parse_viewport_size,
    unicode_yaml_load,
)


@pytest.mark.parametrize(
    "to_parse,result",
    [
        ("[34 65]", RectangleSize(width=34, height=65)),
        ("[34 6.6]", RectangleSize(width=34, height=7)),
    ],
)
def test_parse_viewport_size_success(to_parse, result):
    assert parse_viewport_size(to_parse) == result


@pytest.mark.parametrize("to_parse", ["[34", "[432 234", "234 234", "324 455]"])
def test_parse_viewport_size_failed(to_parse):
    with pytest.raises(ValueError):
        assert parse_viewport_size(to_parse)


@pytest.mark.parametrize(
    "to_parse,result",
    [
        ("[400 200 344 555]", Region(400, 200, 344, 555)),
        ("[0 0.0 0 3.6]", Region(0, 0, 0, 4)),
    ],
)
def test_parse_region_success(to_parse, result):
    assert parse_region(to_parse) == result


@pytest.mark.parametrize("to_parse", ["[34 34 56", "432 234", "[33 324 455]"])
def test_parse_region_failed(to_parse):
    with pytest.raises(ValueError):
        assert parse_region(to_parse)


def test_parse_padding_dict():
    assert parse_padding_dict("left: 10") == {"left": 10}
    assert parse_padding_dict("left: -10") == {"left": -10}
    assert parse_padding_dict("left: 10 right: 20") == {"left": 10, "right": 20}
    assert parse_padding_dict("left: 1 right: 2 top: 3 bottom: 4") == {
        "left": 1,
        "right": 2,
        "top": 3,
        "bottom": 4,
    }


def test_parse_padding_dict_failure():
    with pytest.raises(ValueError):
        parse_padding_dict("5")

    with pytest.raises(ValueError):
        parse_padding_dict("left: 10a")

    with pytest.raises(ValueError):
        parse_padding_dict("wrong: 1")


def test_parse_padding():
    assert parse_padding(None) is None
    assert parse_padding("left: 10") == {"left": 10}
    assert parse_padding("10") == 10
    assert parse_padding("-10") == -10


def test_parse_padding_failure():
    with pytest.raises(ValueError):
        parse_padding("abc")


def test_get_enum_by_upper_name():
    assert get_enum_by_upper_name("LAYOUT", MatchLevel) == MatchLevel.LAYOUT
    assert get_enum_by_upper_name("LayouT", MatchLevel) == MatchLevel.LAYOUT
    assert get_enum_by_upper_name("layout", MatchLevel) == MatchLevel.LAYOUT


def test_get_enum_by_name():
    assert get_enum_by_name("LAYOUT", MatchLevel) == MatchLevel.LAYOUT


def test_get_enum_by_name_failed():
    with pytest.raises(
        ValueError, match="`<enum 'MatchLevel'>` does not contain `Not present`"
    ):
        get_enum_by_name("Not present", MatchLevel)


def test_unicode_yaml_load_produces_unicode_strings():
    result = unicode_yaml_load("abc: def")
    key, value = next(iter(result.items()))

    assert isinstance(key, six.text_type)
    assert isinstance(value, six.text_type)
