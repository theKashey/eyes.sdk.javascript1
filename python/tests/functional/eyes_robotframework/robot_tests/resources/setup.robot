*** Variables ***
${URL}                          https://demo.applitools.com/
${BROWSER_NAME}                 Chrome

*** Keywords ***
Setup
    IF  '${BACKEND_LIBRARY_NAME}' == 'AppiumLibrary'
        Open Application        ${REMOTE_URL}    &{DESIRED_CAPS}
        IF  '${RUNNER}' == 'web'
            Go To Url   ${URL}
        END
    ELSE IF  '${BACKEND_LIBRARY_NAME}' == 'SeleniumLibrary'
        Open Browser   ${URL}   ${BROWSER_NAME}   remote_url=${REMOTE_URL}   desired_capabilities=${DESIRED CAPS}
    END
    Eyes Configure Add Property     RUNNER    ${RUNNER}
    Eyes Configure Add Property     BACKEND_LIBRARY_NAME    ${RUNNER}


Teardown
    IF  '${BACKEND_LIBRARY_NAME}' == 'AppiumLibrary'
        Close Application
    ELSE IF  '${BACKEND_LIBRARY_NAME}' == 'SeleniumLibrary'
        Close All Browsers
    END
    Eyes Close Async
