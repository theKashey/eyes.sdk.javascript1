module.exports = function getDocumentScrollingElement() {
  let res = 'HTML'
  const scrollingElement = document.scrollingElement
  if (scrollingElement) {
    res = scrollingElement.tagName
  }
  return res.toLowerCase()
}
