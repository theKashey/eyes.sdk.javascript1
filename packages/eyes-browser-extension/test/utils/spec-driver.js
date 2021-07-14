/* eslint-disable */

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.waitUntilDisplayed = exports.scrollIntoView = exports.hover = exports.type = exports.click = exports.takeScreenshot = exports.visit = exports.getUrl = exports.getTitle = exports.setViewportSize = exports.getViewportSize = exports.findElements = exports.findElement = exports.childContext = exports.parentContext = exports.mainContext = exports.executeScript = exports.isEqualElements = exports.isStaleElementError = exports.extractContext = exports.isSelector = exports.isElement = exports.isDriver = void 0;
const utils = require("@applitools/utils");
const fs = require('fs')
const os = require('os')
const path = require('path')
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
function transformSelector(selector) {
    if (utils.types.has(selector, ['type', 'selector'])) {
        if (selector.type === 'css')
            return `css=${selector.selector}`;
        else if (selector.type === 'xpath')
            return `xpath=${selector.selector}`;
    }
    return selector;
}
function isDriver(page) {
    return page.constructor.name === 'Page';
}
exports.isDriver = isDriver;
function isElement(element) {
    if (!element)
        return false;
    return element.constructor.name === 'ElementHandle';
}
exports.isElement = isElement;
function isSelector(selector) {
    return utils.types.isString(selector) || utils.types.has(selector, ['type', 'selector']);
}
exports.isSelector = isSelector;
function extractContext(page) {
    return isDriver(page) ? page.mainFrame() : page;
}
exports.extractContext = extractContext;
function isStaleElementError(err) {
    return err && err.message && err.message.includes('Protocol error (DOM.describeNode)');
}
exports.isStaleElementError = isStaleElementError;
async function isEqualElements(frame, element1, element2) {
    return frame.evaluate(([element1, element2]) => element1 === element2, [element1, element2]).catch(() => false);
}
exports.isEqualElements = isEqualElements;
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
async function findElement(frame, selector) {
    return frame.$(transformSelector(selector));
}
exports.findElement = findElement;
async function findElements(frame, selector) {
    return frame.$$(transformSelector(selector));
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
    await frame.waitForSelector(transformSelector(selector));
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
    const extensionPath = path.resolve(process.cwd(), './build')
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