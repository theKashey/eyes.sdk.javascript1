from __future__ import absolute_import

import logging
from enum import Enum
from os import getcwd
from threading import Lock
from typing import Any, List, Optional, Text

from ..common.errors import USDKFailure
from .connection import USDKConnection
from .schema import demarshal_error

logger = logging.getLogger(__name__)

Failure = USDKFailure  # backward compatibility with eyes-selenium==5.0.0


class ManagerType(Enum):
    UFG = "ufg"
    CLASSIC = "classic"


class CommandExecutor(object):
    @classmethod
    def create(cls, name, version):
        # type: (Text, Text) -> CommandExecutor
        commands = cls(USDKConnection.create())
        commands.make_core(name, version, getcwd())
        return commands

    @classmethod
    def get_instance(cls, name, version):
        # type: (Text, Text) -> CommandExecutor
        with _instances_lock:
            key = (name, version)
            if key in _instances:
                return _instances[key]
            else:
                return _instances.setdefault(key, cls.create(name, version))

    def __init__(self, connection):
        # type: (USDKConnection) -> None
        self._connection = connection

    def make_core(self, name, version, cwd):
        # type: (Text, Text, Text) -> None
        self._connection.notification(
            "Core.makeCore",
            {"name": name, "version": version, "cwd": cwd, "protocol": "webdriver"},
        )

    def core_make_manager(
        self, manager_type, concurrency=None, legacy_concurrency=None, agent_id=None
    ):
        # type: (ManagerType, Optional[int], Optional[int], Optional[Text]) -> dict
        payload = {"type": manager_type.value}
        if concurrency is not None:
            payload["concurrency"] = concurrency
        if legacy_concurrency is not None:
            payload["legacyConcurrency"] = legacy_concurrency
        if agent_id is not None:
            payload["agentId"] = agent_id
        return self._checked_command("Core.makeManager", payload)

    def core_get_viewport_size(self, target):
        # type: (dict) -> dict
        return self._checked_command("Core.getViewportSize", {"target": target})

    def core_set_viewport_size(self, target, size):
        # type: (dict, dict) -> None
        self._checked_command("Core.setViewportSize", {"target": target, "size": size})

    def core_close_batch(self, close_batch_settings):
        # type: (dict) -> None
        self._checked_command("Core.closeBatch", {"settings": close_batch_settings})

    def core_delete_test(self, close_test_settings):
        # type: (dict) -> None
        self._checked_command("Core.deleteTest", {"settings": close_test_settings})

    def manager_open_eyes(self, manager, target=None, settings=None, config=None):
        # type: (dict, Optional[dict], Optional[dict], Optional[dict]) -> dict
        payload = {"manager": manager}
        if target is not None:
            payload["target"] = target
        if settings is not None:
            payload["settings"] = settings
        if config is not None:
            payload["config"] = config
        return self._checked_command("EyesManager.openEyes", payload)

    def manager_close_manager(self, manager, raise_ex, timeout):
        # type: (dict, bool, float) -> List[dict]
        return self._checked_command(
            "EyesManager.closeManager",
            {"manager": manager, "settings": {"throwErr": raise_ex}},
            wait_timeout=timeout,
        )

    def eyes_check(self, eyes, target=None, settings=None, config=None):
        # type: (dict, Optional[dict], Optional[dict], Optional[dict]) -> dict
        payload = {"eyes": eyes}
        if target is not None:
            payload["target"] = target
        if settings is not None:
            payload["settings"] = settings
        if config is not None:
            payload["config"] = config
        return self._checked_command("Eyes.check", payload)

    def core_locate(self, target, settings, config=None):
        # type: (dict, dict, Optional[dict]) -> dict
        payload = {"target": target, "settings": settings}
        if config:
            payload["config"] = config
        return self._checked_command("Core.locate", payload)

    def eyes_extract_text(self, eyes, target, settings, config=None):
        # type: (dict, dict, dict, Optional[dict]) -> List[Text]
        payload = {"eyes": eyes}
        if target:
            payload["target"] = target
        if settings:
            payload["settings"] = settings
        if config:
            payload["config"] = config
        return self._checked_command("Eyes.extractText", payload)

    def eyes_locate_text(self, eyes, target=None, settings=None, config=None):
        # type: (dict, Optional[dict], Optional[dict], Optional[dict]) -> dict
        payload = {"eyes": eyes}
        if target:
            payload["target"] = target
        if settings:
            payload["settings"] = settings
        if config:
            payload["config"] = config
        return self._checked_command("Eyes.locateText", payload)

    def eyes_close_eyes(self, eyes, settings, config, wait_result):
        # type: (dict, dict, dict, bool) -> List[dict]
        payload = {"eyes": eyes, "settings": settings, "config": config}
        return self._checked_command("Eyes.close", payload, wait_result)

    def eyes_abort_eyes(self, eyes, wait_result):
        # type: (dict, bool) -> List[dict]
        return self._checked_command("Eyes.abort", {"eyes": eyes}, wait_result)

    def server_get_info(self):
        # type: () -> dict
        return self._checked_command("Server.getInfo", {})

    def _checked_command(self, name, payload, wait_result=True, wait_timeout=9 * 60):
        # type: (Text, dict, bool, float) -> Optional[Any]
        response = self._connection.command(name, payload, wait_result, wait_timeout)
        if wait_result:
            response_payload = response["payload"]
            _check_error(response_payload)
            return response_payload.get("result")
        else:
            return None


def _check_error(payload):
    # type: (dict) -> None
    error = payload.get("error")
    if error:
        usdk_error = demarshal_error(error)
        logger.error("Re-raising an error received from SDK server: %r", usdk_error)
        raise usdk_error


_instances = {}
_instances_lock = Lock()
