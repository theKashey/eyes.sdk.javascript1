exports.create = function ({userAgent}) {
  return (req, res, next) => {
    if (req.url.endsWith('.jpg')) {
      if (req.headers['user-agent'] !== userAgent) {
        res.status(404).send('Not found')
      } else {
        next()
      }
    } else {
      next()
    }
  }
}
