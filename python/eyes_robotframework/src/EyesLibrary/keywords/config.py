from __future__ import absolute_import, unicode_literals

from copy import deepcopy
from datetime import datetime
from typing import Dict, Optional, Text, Union

from robot.api import logger as robot_logger
from robot.api.deco import keyword
from six import string_types as basestring

from applitools.common import deprecated
from applitools.selenium import BatchInfo, Eyes

from ..base import LibraryComponent
from ..config_parser import SelectedRunner


class ConfigurationKeywords(LibraryComponent):
    @keyword(
        "Create Batch Info",
        types={
            "name": str,
            "started_at": (datetime, str, None),
            "batch_sequence_name": (str, None),
            "batch_id": (str, None),
        },
    )
    def create_batch_info(
        self,
        name,  # type: Text
        started_at=None,  # type: Optional[Union[datetime,Text]]
        batch_sequence_name=None,  # type: Optional[Text]
        batch_id=None,  # type: Optional[Text]
    ):
        # type: (...) -> Text
        """
        Returns a BatchInfo ID string that may be used as batch argument on `Eyes Open`.

            | =Arguments=                  | =Description=                                                                              |
            | Name                         | The name of the batch                                                                      |
            | Started At                   | The date and time that will be displayed in the Test Manager as the batch start time *(*)* |
            | Batch ID                     | This argument groups together tests ran in different executions                            |

        The *Started At* argument may be passed as:
        - String: YYYY-mm-dd HH:MM:SS
        - Datetime variable: See [https://robotframework.org/robotframework/latest/libraries/DateTime.html|DateTime library]

        *Example:*
            | ${batch_id}= | Create Eyes Batch |
        """

        if started_at:
            if isinstance(started_at, basestring):
                started_at = datetime.strptime(started_at, "%Y-%m-%d %H:%M:%S")
            elif not isinstance(started_at, datetime):
                raise TypeError("BatchInfo started_at should be `str` or `datetime`")
        batch = BatchInfo(
            name, started_at=started_at, batch_sequence_name=batch_sequence_name
        )
        if batch_id:
            batch = batch.with_batch_id(batch_id)
        self.ctx.register_or_get_batch(batch)
        return batch.id

    @keyword("Get Eyes Configure Property", types=(str,))
    def get_eyes_configure_property(self, name):
        # type: (Text) -> Dict[Text,Text]
        result = [p for p in self.ctx.configure.properties if p.get("name") == name]
        if result:
            return result[0]
        return {}

    @keyword("Set Eyes Configure Property", types=(str, str))
    @deprecated.attribute("use `Eyes Configure Add Property` instead")
    def set_eyes_configure_property(self, name, value):
        # type: (Text, Text) -> None
        self.eyes_configure_add_property(name, value)

    @keyword("Eyes Configure Add Property", types=(str, str))
    def eyes_configure_add_property(self, name, value):
        # type: (Text, Text) -> None
        self.ctx.configure.add_property(name, value)

    @keyword("Eyes Set NMG Capabilities", types=(dict,))
    def eyes_set_nmg_capabilities(self, capabilities):
        # type:  (Dict) -> None
        """Inplace update desired capabilities with NMG required parameters.

            | =Arguments=                  | =Description=                                                                              |
            | Capabilities                 | The capabilities for mobile device

        *Example:*
            | Eyes Set NMG Capabilities | ${DESIRED_CAPS}  |
        """
        if self.selected_runner is not SelectedRunner.native_mobile_grid:
            robot_logger.warn(
                "Add NMG capabilities make sense use only with `native_mobile_grid` runner. Skipping..."
            )
            return
        config = self.get_configuration()
        Eyes.set_nmg_capabilities(
            capabilities, config.api_key, config.server_url, config.proxy
        )

    @keyword("Eyes Create NMG Capabilities")
    def eyes_create_nmg_capabilities(self, **kwargs):
        # type:  (**Dict)-> Dict
        """Creates new capabilities with NMG related fields.

        Capabilities of appium server, Android and iOS,
        Please check https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/server-args.md

        Examples:
        | ${CAPS}=| Eyes Create NMG Capabilities | platformName=iOS      | platformVersion=7.0            | deviceName='iPhone Simulator'           | app=your.app                         |
        | ${CAPS}=| Eyes Create NMG Capabilities | platformName=Android | platformVersion=4.2.2 | deviceName=192.168.56.101:5555 | app=${CURDIR}/demoapp/OrangeDemoApp.apk | appPackage=com.netease.qa.orangedemo | appActivity=MainActivity |
        """
        capabilities = deepcopy(kwargs)
        self.eyes_set_nmg_capabilities(capabilities)
        return capabilities
