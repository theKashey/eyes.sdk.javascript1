*** Settings ***
Resource    resources/setup.robot
Library     ${BACKEND_LIBRARY_NAME}
Library     EyesLibrary     runner=${RUNNER}

Test Setup       Setup
Test Teardown    Teardown

*** Test Cases ***
Check Window
    Eyes Open    Check Window ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Window    Ignore Region By Coordinates    [12 22 2 2]

Check Window Fully
    Eyes Open    Check Window Fully ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Window       Fully

Check Region By Selector With Ignore
    Eyes Open   Check Region By Selector With Ignore ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Region By Selector    ${FORM_XPATH}
    ...     Ignore Region By Coordinates    [12 22 22 22]
