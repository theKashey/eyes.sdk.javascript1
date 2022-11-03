from typing import TYPE_CHECKING, ByteString, Union, overload

from six import string_types

from applitools.common import (
    EyesError,
    FailureReports,
    Region,
    TestFailedError,
    deprecated,
)
from applitools.common.selenium import Configuration
from applitools.images.extract_text import OCRRegion, TextRegionSettings
from applitools.images.fluent import Image, ImagesCheckSettings, Target
from applitools.selenium import ClassicRunner
from applitools.selenium.runner import log_session_results_and_raise_exception
from applitools.selenium.schema import (
    demarshal_locate_text_result,
    demarshal_match_result,
    demarshal_test_results,
    marshal_check_settings,
    marshal_configuration,
    marshal_image_target,
    marshal_ocr_extract_settings,
    marshal_ocr_search_settings,
)

if TYPE_CHECKING:
    from typing import List, Optional, Text

    from applitools.common import TestResults
    from applitools.common.utils.custom_types import ViewPort

    from ..core.extract_text import PATTERN_TEXT_REGIONS


class Eyes(object):
    def __init__(self):
        self.configure = Configuration()
        self._runner = ClassicRunner()
        self._commands = self._runner._commands  # noqa
        self._eyes_ref = None

    def open(self, app_name, test_name, dimension=None):
        # type: (Text, Text, Optional[ViewPort]) -> None
        if app_name is not None:
            self.configure.app_name = app_name
        if test_name is not None:
            self.configure.test_name = test_name
        if dimension is not None:
            self.configure.viewport_size = dimension
        if self.configure.app_name is None:
            raise ValueError("app_name should be set via configuration or an argument")
        if self.configure.test_name is None:
            raise ValueError("test_name should be set via configuration or an argument")

        self._runner._set_connection_config(self.configure)  # noqa, friend
        self._eyes_ref = self._commands.manager_open_eyes(
            self._runner._ref,  # noqa
            config=marshal_configuration(self.configure),
        )

    @overload
    def check(self, name, check_settings):
        # type: (Text, ImagesCheckSettings) -> bool
        pass

    @overload
    def check(self, check_settings):
        # type: (ImagesCheckSettings) -> bool
        pass

    def check(self, check_settings, name=None):
        # type: (ImagesCheckSettings, Optional[Text]) -> bool
        if isinstance(name, ImagesCheckSettings) or isinstance(
            check_settings, string_types
        ):
            check_settings, name = name, check_settings
        if name:
            check_settings = check_settings.with_name(name)

        results = self._commands.eyes_check(
            self._eyes_ref,
            target=marshal_image_target(check_settings),
            settings=marshal_check_settings(check_settings),
            config=marshal_configuration(self.configure),
        )
        # Original API only returns one result
        results = demarshal_match_result(results[0])
        if (
            not results.as_expected
            and self.configure.failure_reports is FailureReports.IMMEDIATE
        ):
            raise TestFailedError(
                "Mismatch found in '{}' of '{}'".format(
                    self.configure.test_name, self.configure.app_name
                )
            )
        else:
            return results.as_expected

    def check_image(self, image, tag=None):
        # type: (Union[ByteString, Text, Image], Optional[Text]) -> bool
        return self.check(tag, Target.image(image))

    def check_region(self, image, region, tag=None):
        # type: (Union[ByteString, Text, Image], Region, Optional[Text]) -> bool
        return self.check(tag, Target.region(image, region))

    def extract_text(self, *regions):
        # type: (*OCRRegion) -> List[Text]
        image = regions[0].image
        assert all(r.image == image for r in regions), "All images same"
        return self._commands.eyes_extract_text(
            self._eyes_ref,
            target={"image": image},
            settings=marshal_ocr_extract_settings(regions),
            config=marshal_configuration(self.configure),
        )

    @deprecated.attribute(
        "The `extract_text_regions` is deprecated. Use `locate_text` instead"
    )
    def extract_text_regions(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        return self.locate_text(config)

    def locate_text(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        result = self._commands.eyes_locate_text(
            self._eyes_ref,
            target={"image": config._image},  # noqa
            settings=marshal_ocr_search_settings(config),
            config=marshal_configuration(self.configure),
        )
        return demarshal_locate_text_result(result)

    def close(self, raise_ex=True):
        # type: (bool) -> Optional[TestResults]
        """
        Ends the test.

        :param raise_ex: If true, an exception will be raised for failed/new tests.
        :return: The test results.
        """
        if not self.is_open:
            raise EyesError("Eyes not open")
        results = self._commands.eyes_close_eyes(
            self._eyes_ref,
            {"throwErr": raise_ex},
            marshal_configuration(self.configure),
            True,
        )
        self._eyes_ref = None
        results = demarshal_test_results(results, self.configure)
        if results:
            for r in results:
                log_session_results_and_raise_exception(False, r)
            return results[0]  # Original interface returns just one result
        else:  # eyes are already aborted by closed runner
            return None

    def abort(self):
        # type: () -> Optional[TestResults]
        if self.configure.is_disabled:
            return None
        elif self.is_open:
            results = self._commands.eyes_abort_eyes(self._eyes_ref, True)
            self._eyes_ref = None
            if results:  # abort after close does not return results
                results = demarshal_test_results(results, self.configure)
                for r in results:
                    log_session_results_and_raise_exception(False, r)
                return results[0]  # Original interface returns just one result
            else:
                return None

    @property
    def is_open(self):
        return self._eyes_ref is not None

    def __getattr__(self, item):
        return getattr(self.configure, item)

    def __setattr__(self, key, value):
        if "configure" in vars(self) and (
            key in vars(self.configure)
            or key in ("match_level", "ignore_displacements")
        ):
            return setattr(self.configure, key, value)
        else:
            return super(Eyes, self).__setattr__(key, value)
