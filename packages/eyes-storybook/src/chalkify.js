const Chalk = require('chalk').Instance;
const level = process.env.STDOUT_LEVEL || 2;
const chalk = new Chalk({level});
module.exports = chalk;
