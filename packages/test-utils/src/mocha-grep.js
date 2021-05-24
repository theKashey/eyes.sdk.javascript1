function mochaGrep({name = process.env.MOCHA_GREP, tags = []} = {}) {
  return new RegExp(`^${name ? `.*?${name}.*?` : '[^(]*?'}(\\((?:@(${tags.join('|')}) ?)+\\))?$`, 'i')
}

module.exports = mochaGrep
