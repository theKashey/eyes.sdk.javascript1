*** Settings ***
Resource    resources/setup.robot
Library     ${BACKEND_LIBRARY_NAME}
Library     EyesLibrary     runner=${RUNNER}

Test Setup       Setup
Test Teardown    Teardown
Suite Teardown   Eyes Get All Test Results

*** Variables ***
${FORM_XPATH}               //html/body/div/div/form
${FORM_USERNAME_XPATH}      //html/body/div/div/form/div[1]

*** Test Cases ***
Check Window
    Eyes Open    Check Window ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Window    Ignore Region By Coordinates    [12 22 2 2]

Check Window Fully
    Eyes Open    Check Window Fully ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Window       Fully

Check Region By Element
    Eyes Open    Check Region By Element ${RUNNER}  batch=${BATCH_NAME}
    ${element}=     Get WebElement          ${FORM_XPATH}
    Eyes Check Region By Element    ${element}

Check Region By Selector
    Eyes Open    Check Region By Selector ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Region By Selector    ${FORM_XPATH}

Check Region By Selector With Ignore
    Eyes Open   Check Region By Selector With Ignore ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Region By Selector    ${FORM_XPATH}
    ...     Ignore Region By Coordinates    [12 22 22 22]

Check Window Two Times
    Eyes Open    Check Window Two Times ${RUNNER}  batch=${BATCH_NAME}
    Eyes Check Window       first
    Eyes Check Window       second
