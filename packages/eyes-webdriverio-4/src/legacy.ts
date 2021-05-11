// @ts-nocheck

export class By {
  static css(css: string): By {
    return new By(css)
  }
  static cssSelector(css: string): By {
    return By.css(css)
  }
  static id(id: string): By {
    return new By(`*[id="${id}"]`)
  }
  static className(className: string): By {
    return new By(`.${className}`)
  }
  static attributeValue(attr: string, value: string): By {
    return new By(`*[${attr}="${value}"]`)
  }
  // @ts-ignore
  static name(name: string): By {
    return By.attributeValue('name', name)
  }
  static tagName(tagName: string): By {
    return new By(tagName)
  }
  static xpath(xpath: string): By {
    return new By(xpath, 'xpath')
  }
  static xPath(xpath: string): By {
    return By.xpath(xpath)
  }

  constructor(readonly value: string, readonly using: string = 'css selector') {}

  toString(): string {
    return `${this.using}:${this.value}`
  }
}

export function wrapDriver(browser) {
  const api = {
    get remoteWebDriver() {
      return browser
    },
    async executeScript(script, ...args) {
      const {value} = await browser.execute(script, ...args)
      return value
    },
    async executeAsyncScript(script, ...args) {
      const {value} = await browser.executeAsync(script, ...args)
      return value
    },
    async findElement(selector) {
      if (selector instanceof By) {
        const element = await browser.element(selector.toString())
        return element ? wrapElement(element, this) : null
      }
    },
    async findElements(selector) {
      if (selector instanceof By) {
        const {value} = await browser.elements(selector.toString())
        return value ? value.map(element => wrapElement(element, this)) : []
      }
    },
    async findElementById(id) {
      return this.findElement(By.id(id))
    },
    async findElementsById(id) {
      return this.findElements(By.id(id))
    },
    async findElementByName(name) {
      return this.findElement(By.name(name))
    },
    async findElementsByName(name) {
      return this.findElements(By.name(name))
    },
    async findElementByCssSelector(cssSelector) {
      return this.findElement(By.cssSelector(cssSelector))
    },
    async findElementsByCssSelector(cssSelector) {
      return this.findElements(By.cssSelector(cssSelector))
    },
    async findElementByClassName() {
      throw new TypeError('findElementByClassName method is not implemented!')
    },
    async findElementsByClassName() {
      throw new TypeError('findElementsByClassName method is not implemented!')
    },
    async findElementByLinkText() {
      throw new TypeError('findElementByLinkText method is not implemented!')
    },
    async findElementsByLinkText() {
      throw new TypeError('findElementsByLinkText method is not implemented!')
    },
    async findElementByPartialLinkText() {
      throw new TypeError('findElementByPartialLinkText method is not implemented!')
    },
    async findElementsByPartialLinkText() {
      throw new TypeError('findElementsByPartialLinkText method is not implemented!')
    },
    async findElementByTagName(tagName) {
      return this.findElement(By.tagName(tagName))
    },
    async findElementsByTagName(tagName) {
      return this.findElements(By.tagName(tagName))
    },
    async findElementByXPath(xpath) {
      return this.findElement(By.xPath(xpath))
    },
    async findElementsByXPath(xpath) {
      return this.findElements(By.xPath(xpath))
    },
    switchTo() {
      return {
        defaultContent: () => browser.frame(null),
        frame: arg => browser.frame(arg),
        parentFrame: () => browser.frameParent(),
      }
    },
    async takeScreenshot() {
      return browser.saveScreenshot()
    },
    async close() {
      return browser.end()
    },
    async sleep(ms) {
      return browser.pause(ms)
    },
    async getCapabilities() {
      return browser.desiredCapabilities
    },
    async getCurrentUrl() {
      return browser.getUrl()
    },
    async getBrowserName() {
      return browser.desiredCapabilities.browserName
    },
    async click(selector) {
      return browser.click(selector instanceof By ? selector.toString() : selector)
    },
  }
  return new Proxy(browser, {
    get(target, key, receiver) {
      if (key === 'then') return
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}

export function wrapElement(element, driver) {
  const api = {
    get element() {
      return element.value || element
    },
    get locator() {
      return element.selector
    },
    getDriver() {
      return driver
    },
    getId() {
      return element.value ? element.value.ELEMENT : element.ELEMENT
    },
    async executeScript(script) {
      const {value} = await driver.execute(script, this.element)
      return value
    },
    async findElement(selector) {
      const {value} = await driver.elementIdElement(this.getId(), selector.toString())
      return value ? wrapElement(value, driver) : null
    },
    async findElements(selector) {
      const {value} = await driver.elementIdElement(this.getId(), selector.toString())
      return value ? value.map(element => wrapElement(element, driver)) : []
    },
    async sendKeys(keysToSend) {
      return driver.elementIdValue(this.getId(), keysToSend)
    },
    async click() {
      return driver.elementIdClick(this.getId())
    },
  }
  return new Proxy(element, {
    get(target, key, receiver) {
      if (key in api) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}
