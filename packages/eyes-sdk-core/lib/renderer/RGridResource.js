'use strict'

const crypto = require('crypto')
const ArgumentGuard = require('../utils/ArgumentGuard')
const GeneralUtils = require('../utils/GeneralUtils')
const getBrowserKeyForUserAgent = require('../utils/getBrowserKeyForUserAgent')
const {URL} = require('url')

const VISUAL_GRID_MAX_BUFFER_SIZE = 34.5 * 1024 * 1024

class RGridResource {
  /**
   * @param data
   * @param {string} [data.url]
   * @param {string} [data.contentType]
   * @param {Buffer} [data.content]
   */
  constructor({url, contentType, content, errorStatusCode, browserName} = {}) {
    this._url = url
    this._contentType = contentType
    this._content = content
    this._errorStatusCode = errorStatusCode
    this._browserName = browserName

    /** @type {string} */
    this._sha256hash = undefined

    if (contentType != 'x-applitools-html/cdt') this._trimContent()

    this.setCacheKey()
  }

  /**
   * @return {string} - The url of the current resource.
   */
  getUrl() {
    return this._url
  }

  /**
   * @param {string} value - The resource's url
   */
  setUrl(value) {
    ArgumentGuard.notNull(value, 'url')
    this._url = value
    this.setCacheKey()
  }

  /**
   * @return {string} - The contentType of the current resource.
   */
  getContentType() {
    return this._contentType
  }

  /**
   * @param {string} value - The resource's contentType
   */
  setContentType(value) {
    ArgumentGuard.notNull(value, 'contentType')
    this._contentType = value
  }

  /**
   * @return {Buffer} - The content of the current resource.
   */
  getContent() {
    return this._content
  }

  /**
   * @param {Buffer} value - The resource's content
   */
  setContent(value) {
    ArgumentGuard.notNull(value, this._url ? `content (of ${this._url})` : 'content')
    this._content = value
    this._sha256hash = undefined
    if (this._contentType != 'x-applitools-html/cdt') this._trimContent()
  }

  /**
   * set the cacheKey
   * @private
   */
  setCacheKey() {
    if (!this._cacheKey) {
      this._cacheKey = this._url
      if (this.isGoogleFont() && this._browserName) this._cacheKey += '~' + getBrowserKeyForUserAgent(this._browserName)
    }
  }

  _trimContent() {
    if (this._content && this._content.length > VISUAL_GRID_MAX_BUFFER_SIZE) {
      this._content = this._content.slice(0, VISUAL_GRID_MAX_BUFFER_SIZE - 100000)
    }
  }

  getErrorStatusCode() {
    return this._errorStatusCode
  }

  setErrorStatusCode(errorStatusCode) {
    this._errorStatusCode = errorStatusCode
  }

  getSha256Hash() {
    if (!this._sha256hash) {
      this._sha256hash = crypto
        .createHash('sha256')
        .update(this._content)
        .digest('hex')
    }

    return this._sha256hash
  }

  // TODO: now that there's errorStatusCode, this function should be renamed to toPlainObject or prepareToSerialize or something
  getHashAsObject() {
    if (this._errorStatusCode) {
      return {errorStatusCode: this._errorStatusCode}
    } else {
      return {
        hashFormat: 'sha256',
        hash: this.getSha256Hash(),
        contentType: this.getContentType(),
      }
    }
  }

  getCacheKey() {
    return this._cacheKey
  }

  isGoogleFont() {
    return /https:\/\/fonts.googleapis.com/.test(this._url)
  }

  getBrowserName() {
    return this._browserName
  }

  isHttp() {
    return /^https?:$/i.test(new URL(this._url).protocol)
  }

  /**
   * @override
   */
  toJSON() {
    return GeneralUtils.toPlain(this, ['_sha256hash', '_cacheKey', '_browserName'])
  }

  /**
   * @override
   */
  toString() {
    return `RGridResource { ${JSON.stringify(this)} }`
  }
}

module.exports = RGridResource
