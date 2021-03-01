const formatter = require('./lib/formatter');
const defaultFormatterFunction = require('./lib/default/formatResults')

function fancy(options = {}, customFormatter = defaultFormatterFunction) {

	const formatFunction = formatter(options);

	return {
		formatter: formatFunction,
		output: formatFunction.report(customFormatter)
	}
}

module.exports = fancy