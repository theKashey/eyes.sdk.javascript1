// in order to support the refer in the snippet
// this loader warp the snippet functions with
// `refer.ref` for the arguments and `refer.deref`
// for the return values
module.exports = function () {
  return Object.entries(require(this.resourcePath)).reduce(
    (str, [name, func]) =>
      str +
      `exports.${name}=function(arg){
        try {
          return refer.ref((${func.toString()})(refer.deref(arg)))
        } catch (error) {
          return {error: error instanceof Error ? {message: error.message, stack: error.stack} : error}
        }
      }\n`,
    '',
  )
}
