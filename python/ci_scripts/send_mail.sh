#!/bin/sh
set -eu
SDK_NAME="$1"
SDK_VERSION="$2"
CHANGELOG_FILE="$3"
CI_SCRIPTS=$(dirname "$0")
CHANGELOG=$(bash "$CI_SCRIPTS/extract_changelog.sh" "${SDK_VERSION}" "$CHANGELOG_FILE")
TEST_COVERAGE_GAP=$(cat "$CI_SCRIPTS/testCoverageGap.txt")
curl http://sdk-test-results.herokuapp.com/send_mail -X POST -H "Content-Type: application/json" -d "{\"sdk\":\"$SDK_NAME\", \"version\":\"$SDK_VERSION\", \"changeLog\":\"$CHANGELOG\", \"testCoverageGap\":\"$TEST_COVERAGE_GAP\"}"
