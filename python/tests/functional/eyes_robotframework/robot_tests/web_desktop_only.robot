*** Settings ***
Resource    resources/setup.robot
Library     SeleniumLibrary
Library     EyesLibrary     runner=${RUNNER}

Test Setup       Setup
Test Teardown    Teardown
Suite Teardown   Eyes Get All Test Results

*** Test Cases ***
Check Shadow Dom
    Eyes Open    Check Window Two Times ${RUNNER}  batch=${BATCH_NAME}
    Go To        https://applitools.github.io/demo/TestPages/ShadowDOM/index.html
    Eyes Check Region By Target Path
    ...     Shadow By Selector    css:#has-shadow-root
    ...     Region By Selector   css:h1
    ...     Ignore Region By Coordinates    [12 22 22 22]
