from applitools.common import ProxySettings
from applitools.selenium import Eyes

API_KEY = "asd123"
SERVER_URL = "https://eyesapi.applitools.com"
PROXY_URL = "http://127.0.0.1:8888"
PROXY_SETTINGS = ProxySettings(PROXY_URL)
LIBRARY_PATH = "@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64/UFG_lib.framework/UFG_lib:@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib"


def test_android_nmg_capabilities():
    caps = {}
    eyes = Eyes()
    eyes.set_nmg_capabilities(caps, API_KEY, SERVER_URL, PROXY_SETTINGS)

    android_args = caps["optionalIntentArguments"]
    assert android_args

    android_envs = android_args["--es APPLITOOLS"]
    assert android_envs["NML_API_KEY"] == API_KEY
    assert android_envs["NML_SERVER_URL"] == SERVER_URL
    assert android_envs["NML_PROXY_URL"] == PROXY_SETTINGS.url


def test_ios_nmg_capabilities():
    caps = {}
    eyes = Eyes()
    eyes.set_nmg_capabilities(caps, API_KEY, SERVER_URL, PROXY_SETTINGS)

    ios_args = caps["processArguments"]
    assert ios_args
    assert ios_args["args"] == []

    ios_envs = ios_args["env"]
    assert ios_envs["NML_API_KEY"] == API_KEY
    assert ios_envs["NML_SERVER_URL"] == SERVER_URL
    assert ios_envs["NML_PROXY_URL"] == PROXY_SETTINGS.url
    assert (
        ios_envs["DYLD_INSERT_LIBRARIES"]
        == "@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib:@executable_path/Frameworks/UFG_lib.xcframework/ios-arm64/UFG_lib.framework/UFG_lib"
    )


def test_defaults_from_env(monkeypatch):
    monkeypatch.setenv("APPLITOOLS_API_KEY", API_KEY)
    monkeypatch.setenv("APPLITOOLS_SERVER_URL", SERVER_URL)
    monkeypatch.setenv("APPLITOOLS_HTTP_PROXY", PROXY_URL)

    caps = {}
    eyes = Eyes()
    eyes.set_nmg_capabilities(caps)

    ios_args = caps["processArguments"]
    assert ios_args
    assert ios_args["args"] == []

    ios_envs = ios_args["env"]
    assert ios_envs["NML_API_KEY"] == API_KEY
    assert ios_envs["NML_SERVER_URL"] == SERVER_URL
    assert ios_envs["NML_PROXY_URL"] == PROXY_SETTINGS.url
