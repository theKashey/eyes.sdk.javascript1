module.exports = (req, res, next) => {
  const {query, cookies, method} = req
  const path = req.url.includes('/images')
  const requestingImage = req.url.includes(path) && method === 'GET'

  if (!requestingImage && Object.keys(query).length) {
    res.cookie(query.name, query.value, query)
  }

  if (requestingImage && !cookies['token']) {
    return res.sendStatus(403)
  }

  next()
}
