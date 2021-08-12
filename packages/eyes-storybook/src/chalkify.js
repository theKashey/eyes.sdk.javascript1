const Chalk = require('chalk').Instance;
const level = Number(process.env.STDOUT_LEVEL || 2);
const chalk = new Chalk({level});
module.exports = chalk;
