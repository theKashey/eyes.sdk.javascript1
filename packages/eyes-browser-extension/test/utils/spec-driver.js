/* eslint-disable */

"use strict";
const utils = require("@applitools/utils");
const fs = require('fs')
const os = require('os')
const path = require('path')
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.waitUntilDisplayed = exports.scrollIntoView = exports.hover = exports.type = exports.click = exports.takeScreenshot = exports.visit = exports.getUrl = exports.getTitle = exports.setViewportSize = exports.getViewportSize = exports.findElements = exports.findElement = exports.childContext = exports.parentContext = exports.mainContext = exports.executeScript = exports.isStaleElementError = exports.extractContext = exports.transformSelector = exports.isSelector = exports.isElement = exports.isContext = exports.isDriver = void 0;
async function handleToObject(handle) {
    const [, type] = handle.toString().split('@');
    if (type === 'array') {
        const map = await handle.getProperties();
        return Promise.all(Array.from(map.values(), handleToObject));
    }
    else if (type === 'object') {
        const map = await handle.getProperties();
        const chunks = await Promise.all(Array.from(map, async ([key, handle]) => ({ [key]: await handleToObject(handle) })));
        return chunks.length > 0 ? Object.assign(...chunks) : {};
    }
    else if (type === 'node') {
        return handle.asElement();
    }
    else {
        return handle.jsonValue();
    }
}
function isDriver(page) {
    if (!page)
        return false;
    return utils.types.instanceOf(page, 'Page');
}
exports.isDriver = isDriver;
function isContext(frame) {
    if (!frame)
        return false;
    return utils.types.instanceOf(frame, 'Frame');
}
exports.isContext = isContext;
function isElement(element) {
    if (!element)
        return false;
    return utils.types.instanceOf(element, 'ElementHandle');
}
exports.isElement = isElement;
function isSelector(selector) {
    return utils.types.isString(selector);
}
exports.isSelector = isSelector;
function transformSelector(selector) {
    if (utils.types.has(selector, 'selector')) {
        if (!utils.types.has(selector, 'type'))
            return selector.selector;
        else
            return `${selector.type}=${selector.selector}`;
    }
    return selector;
}
exports.transformSelector = transformSelector;
function extractContext(page) {
    return isDriver(page) ? page.mainFrame() : page;
}
exports.extractContext = extractContext;
function isStaleElementError(err) {
    return err && err.message && err.message.includes('Protocol error (DOM.describeNode)');
}
exports.isStaleElementError = isStaleElementError;
async function executeScript(frame, script, arg) {
    script = utils.types.isString(script) ? new Function(script) : script;
    const result = await frame.evaluateHandle(script, arg);
    return handleToObject(result);
}
exports.executeScript = executeScript;
async function mainContext(frame) {
    frame = extractContext(frame);
    let mainFrame = frame;
    while (mainFrame.parentFrame()) {
        mainFrame = mainFrame.parentFrame();
    }
    return mainFrame;
}
exports.mainContext = mainContext;
async function parentContext(frame) {
    frame = extractContext(frame);
    return frame.parentFrame();
}
exports.parentContext = parentContext;
async function childContext(_frame, element) {
    return element.contentFrame();
}
exports.childContext = childContext;
async function findElement(frame, selector, parent) {
    const root = parent !== null && parent !== void 0 ? parent : frame;
    return root.$(selector);
}
exports.findElement = findElement;
async function findElements(frame, selector, parent) {
    const root = parent !== null && parent !== void 0 ? parent : frame;
    return root.$$(selector);
}
exports.findElements = findElements;
async function getViewportSize(page) {
    return page.viewportSize();
}
exports.getViewportSize = getViewportSize;
async function setViewportSize(page, size) {
    return page.setViewportSize(size);
}
exports.setViewportSize = setViewportSize;
async function getTitle(page) {
    return page.title();
}
exports.getTitle = getTitle;
async function getUrl(page) {
    return page.url();
}
exports.getUrl = getUrl;
async function visit(page, url) {
    await page.goto(url);
}
exports.visit = visit;
async function takeScreenshot(page) {
    return page.screenshot();
}
exports.takeScreenshot = takeScreenshot;
async function click(frame, element) {
    if (isSelector(element))
        element = await findElement(frame, element);
    await element.click();
}
exports.click = click;
async function type(frame, element, keys) {
    if (isSelector(element))
        element = await findElement(frame, element);
    await element.type(keys);
}
exports.type = type;
async function hover(frame, element) {
    if (isSelector(element))
        element = await findElement(frame, element);
    await element.hover();
}
exports.hover = hover;
async function scrollIntoView(frame, element, align = false) {
    if (isSelector(element))
        element = await findElement(frame, element);
    await frame.evaluate(([element, align]) => element.scrollIntoView(align), [element, align]);
}
exports.scrollIntoView = scrollIntoView;
async function waitUntilDisplayed(frame, selector) {
    await frame.waitForSelector(selector);
}
exports.waitUntilDisplayed = waitUntilDisplayed;

const browserNames = {
    chrome: 'chromium',
    safari: 'webkit',
    firefox: 'firefox',
};
async function build(env) {
    const playwright = require('playwright');
    const parseEnv = require('@applitools/test-utils/src/parse-env');
    const { browser, device, proxy, args = [] } = parseEnv(env, 'cdp');
    const launcher = playwright[browserNames[browser] || browser];
    if (!launcher)
        throw new Error(`Browser "${browser}" is not supported.`);

    const userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-user-data-dir'))
    const extensionPath = path.resolve(process.cwd(), './dist')
    const options = {
        headless: false,
        args: [`--load-extension=${extensionPath}`, `--disable-extensions-except=${extensionPath}`, ...args],
        ignoreDefaultArgs: [`--hide-scrollbars`],
        viewport: null,
        ...(device ? playwright.devices[device] : {})
    };
    if (proxy) {
        options.proxy = {
            server: proxy.https || proxy.http || proxy.server,
            bypass: proxy.bypass.join(','),
        };
    }
    const context = await launcher.launchPersistentContext(userDataPath, options);
    // const backgroundPage = await context.waitForEvent('backgroundpage')
    
    // backgroundPage.on('console', async msg => {
    //     for (let i = 0; i < msg.args().length; ++i)
    //         console.log(`${i}: ${JSON.stringify(await msg.args()[i].jsonValue())}`);
    // });

    const page = await context.newPage();
    return [page, () => context.close()];
}
exports.build = build;
//# sourceMappingURL=spec-driver.js.map