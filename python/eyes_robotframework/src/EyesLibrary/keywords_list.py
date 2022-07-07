from __future__ import absolute_import, unicode_literals

__all__ = [
    "register_check_settings_keyword",
    "register_check_keyword",
    "register_target_path_keyword",
]

CHECK_KEYWORDS_LIST = []
CHECK_SETTINGS_KEYWORDS_LIST = []
TARGET_PATH_KEYWORDS_LIST = []


def register_check_settings_keyword(keyword):
    CHECK_SETTINGS_KEYWORDS_LIST.append(keyword)
    return keyword


def register_check_keyword(keyword):
    CHECK_KEYWORDS_LIST.append(keyword)
    return keyword


def register_target_path_keyword(keyword):
    TARGET_PATH_KEYWORDS_LIST.append(keyword)
    return keyword
