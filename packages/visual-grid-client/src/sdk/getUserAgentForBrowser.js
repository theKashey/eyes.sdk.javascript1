const userAgent = {
  IE:
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
  Chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
  Firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0',
  Safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  Edge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
  Edgechromium:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4501.0 Safari/537.36 Edg/91.0.866.0',
}

function getUserAgentForBrowser(browserName) {
  if (!browserName) return ''
  if (browserName === 'ie10' || browserName === 'ie11') return userAgent.IE
  else if (browserName.includes('chrome')) return userAgent.Chrome
  else if (browserName.includes('firefox')) return userAgent.Firefox
  else if (browserName.includes('safari')) return userAgent.Safari
  else if (browserName.includes('edgechromium')) return userAgent.Edgechromium
  else if (browserName.includes('edge')) return userAgent.Edge
}

module.exports = {getUserAgentForBrowser, userAgent}
