const statuses = require('./statuses');

function formatTestResults(format, { body }) {
	if (body.passed) {
		const [_newArray, passedArray] = body.passed.reduce((acc, test) => {
			if (test.getIsNew()) {
				acc[0].push(test);
			} else {
				acc[1].push(test);
			}
			return acc;
		}, [[], []]);

		body.passed = passedArray;
		body._new = _newArray;
	}

	const { passed, failed, unresolved, _new } = body;
	const testsMeta = {
		passedResults: { name: 'Passed', results: passed },
		failedResults: { name: 'Failed', results: failed },
		unresolvedResults: { name: 'Unresolved', results: unresolved },
		newResults: { name: '_New', results: _new }
	}

	function testInfo(result) {
		const hostDisplaySize = result.getHostDisplaySize();
		const viewport = hostDisplaySize ? `[${hostDisplaySize}]` : '';
		return format.dim(`${result.getName()} ${viewport}`, 'gray');
	}

	function errorResult(result) {
		return format.dim(result.error || `[Eyes test not started] : ${result}`, 'red');
	}

	function hasError(result) {
		return result.error || result instanceof Error;
	}

	const allTestResults = Object.values(testsMeta).filter(({ results }) => results && results.length);
	allTestResults.forEach(testResults => {
		const { color, title, symbol } = statuses[testResults.name];
		const formattedTests = testResults.results.reduce((acc, result) => {
			if (!result.isEmpty) {
				const error = hasError(result) ? errorResult(result) : undefined;
				acc.push(`  ${format.color(symbol, color)} ${(error || testInfo(result))}`);
			}
			return acc;
		}, []);

		const formattedTitle = formattedTests.length ? format.color(title(formattedTests.length), color) : '';
		const name = testResults.name.toLowerCase();
		format.section(formattedTitle, formattedTests, name);
	})

	format.body(body);
}

module.exports = formatTestResults;