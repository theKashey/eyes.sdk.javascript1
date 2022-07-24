*** Settings ***
Resource    shared_variables.robot
Library     SeleniumLibrary
Library     EyesLibrary     runner=${RUNNER}      config=../applitools.yaml

Suite Setup    Open Browser                              ${URL}      ${BROWSER}        options=add_argument("--headless")
Suite Teardown    Close All Browsers


*** Test Cases ***
Check Window Suite 2
    Eyes Open
    Eyes Check Window
    Eyes Close Async


Test Must Raise Diff
    Go To      https://applitools.github.io/demo/TestPages/RandomizePage/?randomize
    Eyes Open
    Eyes Check Window
    Eyes Close Async
