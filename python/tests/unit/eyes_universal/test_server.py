from io import BytesIO

import pytest
from mock import Mock

from applitools.eyes_universal.server import SDKServer


@pytest.fixture
def popen_mock(monkeypatch):
    popen_mock = Mock()
    popen_mock.stdout = BytesIO(b"1\n")

    def constructor(_, stdout, stdin):
        return popen_mock

    monkeypatch.setattr("applitools.eyes_universal.server.Popen", constructor)
    return popen_mock


def test_sdk_server_parses_port(popen_mock):
    server = SDKServer()

    assert server.port == 1
