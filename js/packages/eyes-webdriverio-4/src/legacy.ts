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
