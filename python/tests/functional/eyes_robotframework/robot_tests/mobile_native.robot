*** Settings ***
Library     AppiumLibrary
Library     EyesLibrary     runner=${RUNNER}

Test Setup       Setup
Test Teardown    Teardown

*** Keywords ***
Setup
    ${DESIRED_CAPS}=   Eyes Create NMG Capabilities       &{DESIRED_CAPS}
    Open Application        ${REMOTE_URL}    &{DESIRED_CAPS}
    Eyes Configure Add Property     RUNNER    ${RUNNER}
    Eyes Configure Add Property     BACKEND_LIBRARY_NAME    ${RUNNER}


Teardown
    Close Application
    Eyes Close Async


*** Test Cases ***
Check Window Native
    Eyes Open    Check Window Native ${RUNNER}    batch=${BATCH_NAME}
    Sleep  10s
    Eyes Check Window    Ignore Region By Coordinates    [12 22 2 2]
