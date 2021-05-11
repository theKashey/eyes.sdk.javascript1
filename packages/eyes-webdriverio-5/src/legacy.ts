// @ts-nocheck
import * as utils from '@applitools/utils'
import type {Driver, Element} from './spec-driver'

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

export function wrapDriver(browser: Driver): Driver {
  const api = {
    get remoteWebDriver() {
      return browser
    },
    async executeScript(script, ...args) {
      if (utils.types.isFunction(script) || args.length > 1 || !utils.types.isArray(args[0])) {
        return browser.execute(script, ...args)
      } else {
        return browser.executeScript(script, args[0])
      }
    },
    async executeAsyncScript(script, ...args) {
      if (utils.types.isFunction(script) || args.length > 1 || !utils.types.isArray(args[0])) {
        return browser.executeAsync(script, ...args)
      } else {
        return browser.executeAsyncScript(script, args[0])
      }
    },
    async findElement(usingOrLocator, value) {
      if (usingOrLocator instanceof By) {
        const element: any = await browser.$(usingOrLocator.toString())
        return !element.error ? wrapElement(element, this) : null
      } else {
        return browser.findElement(usingOrLocator, value)
      }
    },
    async findElements(usingOrLocator, value) {
      if (usingOrLocator instanceof By) {
        const elements = await browser.$$(usingOrLocator.toString())
        return Array.from(elements, element => wrapElement(element, this))
      } else {
        return browser.findElements(usingOrLocator, value)
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
        defaultContent: () => browser.switchToFrame(null),
        frame: arg => browser.switchToFrame(arg),
        parentFrame: () => browser.switchToParentFrame(),
      }
    },
    async end() {
      return browser.deleteSession()
    },
    async close() {
      return browser.deleteSession()
    },
    async sleep(ms) {
      return browser.pause(ms)
    },
    async getCapabilities() {
      return browser.capabilities
    },
    async getCurrentUrl() {
      return browser.getUrl()
    },
    async getBrowserName() {
      return browser.capabilities.browserName
    },
  }
  return new Proxy(browser, {
    get(target, key, receiver) {
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}

export function wrapElement(element: Element, driver: Driver): Element {
  const api = {
    get element() {
      return element
    },
    get locator() {
      return this.selector
    },
    getDriver() {
      return driver
    },
    getId() {
      return this.elementId
    },
    async executeScript(script) {
      return driver.execute(script, this)
    },
    async findElement(locator) {
      const extendedParentElement = await this.$(this)
      const element = await extendedParentElement.$(locator instanceof By ? locator.toString() : locator)
      return !element.error ? wrapElement(element, driver) : null
    },
    async findElements(locator) {
      const elements = await this.$$(locator instanceof By ? locator.toString() : locator)
      return Array.from(elements, element => wrapElement(element, driver))
    },
    async sendKeys(keysToSend) {
      await driver.elementClick(this.elementId)
      return driver.keys(keysToSend)
    },
    async click() {
      return driver.elementClick(this.elementId)
    },
  }
  return new Proxy(element, {
    get(target, key, receiver) {
      if (Object.hasOwnProperty.call(api, key)) {
        return Reflect.get(api, key, receiver)
      }
      return Reflect.get(target, key)
    },
  })
}
