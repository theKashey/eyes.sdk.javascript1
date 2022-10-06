def test_create_batch_info(configuration_keyword):
    batch_id = configuration_keyword.create_batch_info(
        name="Batch Name", batch_sequence_name="Sequence Name"
    )
    batch = configuration_keyword.ctx._batch_registry[batch_id]
    assert batch.name == "Batch Name"
    assert batch.id == batch_id
    assert batch.sequence_name == "Sequence Name"


def test_set_nmg_capabilities_no_data_should_added(
    configuration_keyword,
):
    caps = {
        "platformName": "iOS",
        "platformVersion": "15.4",
        "deviceName": "iPhone 13 Simulator",
    }
    configuration_keyword.eyes_set_nmg_capabilities(caps)
    assert "processArguments" not in caps
    assert "optionalIntentArguments" not in caps


def test_set_nmg_capabilities(configuration_keyword_with_native_mobile_grid):
    caps = {
        "platformName": "iOS",
        "platformVersion": "15.4",
        "deviceName": "iPhone 13 Simulator",
    }
    configuration_keyword_with_native_mobile_grid.eyes_set_nmg_capabilities(caps)
    assert caps["processArguments"]
    assert caps["optionalIntentArguments"]


def test_create_nmg_capabilities(configuration_keyword_with_native_mobile_grid):
    res = configuration_keyword_with_native_mobile_grid.eyes_create_nmg_capabilities(
        platformName="iOS", platformVersion="15.4", deviceName="iPhone 13 Simulator"
    )
    assert res["platformName"] == "iOS"
    assert res["platformVersion"] == "15.4"
    assert res["deviceName"] == "iPhone 13 Simulator"
    assert res["processArguments"]
    assert res["optionalIntentArguments"]
