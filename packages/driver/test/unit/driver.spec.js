"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_1 = require("../../src/index");
const logger = { log: () => null, warn: () => null, error: () => null };
describe('driver', () => {
    let mock, driver;
    before(async () => {
        mock = new index_1.MockDriver();
        mock.mockElements([
            { selector: 'frame0', frame: true },
            {
                selector: 'frame1',
                frame: true,
                isCORS: true,
                children: [
                    { selector: 'frame1-0', frame: true, isCORS: true },
                    { selector: 'frame1-1', frame: true },
                    { selector: 'frame1-2', frame: true, isCORS: true },
                ],
            },
            {
                selector: 'frame2',
                frame: true,
                isCORS: true,
                children: [
                    { selector: 'frame2-0', frame: true, isCORS: true },
                    {
                        selector: 'frame2-1',
                        frame: true,
                        isCORS: true,
                        children: [
                            { selector: 'frame2-1-0', frame: true, isCORS: true },
                            { selector: 'frame2-1-1', frame: true },
                            { selector: 'frame2-1-2', frame: true, isCORS: true },
                        ],
                    },
                    { selector: 'frame2-2', frame: true },
                ],
            },
        ]);
        driver = new index_1.Driver({ logger, spec: index_1.fake.spec, driver: mock });
        await driver.init();
    });
    afterEach(async () => {
        await driver.switchToMainContext();
    });
    it('getTitle()', async () => {
        assert_1.default.strictEqual(await driver.getTitle(), 'Default Page Title');
    });
    it('getUrl()', async () => {
        assert_1.default.strictEqual(await driver.getUrl(), 'http://default.url');
    });
    it('switchToChildContext(element)', async () => {
        const frameElement = await mock.findElement('frame0');
        await driver.switchToChildContext(frameElement);
        assert_1.default.strictEqual(driver.currentContext.path.length, 2);
        assert_1.default.ok(await driver.currentContext.equals(frameElement));
    });
    it('switchToChildContext(eyes-element)', async () => {
        const frameElement = await driver.element('frame0');
        await driver.switchToChildContext(frameElement);
        assert_1.default.strictEqual(driver.currentContext.path.length, 2);
        assert_1.default.ok(await driver.currentContext.equals(frameElement));
    });
    it('switchToMainContext()', async () => {
        const mainContextDocument = await driver.element('html');
        await driver.switchToChildContext('frame0');
        await driver.switchToMainContext();
        assert_1.default.strictEqual(driver.currentContext, driver.mainContext);
        const currentContextDocument = await driver.element('html');
        assert_1.default.ok(await mainContextDocument.equals(currentContextDocument));
    });
    it('switchToParentContext()', async () => {
        const mainContextDocument = await driver.element('html');
        await driver.switchToChildContext('frame1');
        const nestedContextDocument = await driver.element('html');
        await driver.switchToChildContext('frame1-1');
        assert_1.default.strictEqual(driver.currentContext.path.length, 3);
        await driver.switchToParentContext();
        assert_1.default.strictEqual(driver.currentContext.path.length, 2);
        const parentContextDocument = await driver.element('html');
        assert_1.default.ok(await parentContextDocument.equals(nestedContextDocument));
        await driver.switchToParentContext();
        assert_1.default.strictEqual(driver.currentContext, driver.mainContext);
        const grandparentContextDocument = await driver.element('html');
        assert_1.default.ok(await grandparentContextDocument.equals(mainContextDocument));
    });
    it('switchTo(context)', async () => {
        const contextDocuments = [];
        contextDocuments.unshift(await driver.element('html'));
        for (const frameSelector of ['frame2', 'frame2-1', 'frame2-1-0']) {
            await driver.switchToChildContext(frameSelector);
            contextDocuments.unshift(await driver.element('html'));
        }
        assert_1.default.strictEqual(driver.currentContext.path.length, 4);
        const requiredContext = driver.currentContext;
        await driver.switchToMainContext();
        assert_1.default.strictEqual(driver.currentContext, driver.mainContext);
        await driver.switchTo(requiredContext);
        assert_1.default.strictEqual(driver.currentContext, driver.currentContext);
        for (const contextDocument of contextDocuments) {
            const currentDocument = await driver.element('html');
            assert_1.default.ok(await currentDocument.equals(contextDocument));
            await driver.switchToParentContext();
        }
    });
    describe('refreshContexts()', () => {
        afterEach(async () => {
            await driver.switchToMainContext();
        });
        it('untracked same origin frame chain [(0-0)?]', () => {
            return untrackedFrameChainSameOrigin();
        });
        it('untracked cors frame chain [(0-1-2)?]', () => {
            return untrackedCorsFrameChain();
        });
        it('untracked mixed frame chain [(0-1-0)?]', () => {
            return untrackedMixedFrameChain1();
        });
        it('untracked mixed frame chain [(0-1-1)?]', () => {
            return untrackedMixedFrameChain2();
        });
        it('partially tracked frame chain [0-2-1-(2)?]', () => {
            return partiallyTrackedFrameChain1();
        });
        it('partially tracked frame chain [(0-2)?-1-2]', () => {
            return partiallyTrackedFrameChain2();
        });
        it('tracked frame chain [0-2-1-2]', () => {
            return trackedFrameChain();
        });
    });
    describe('refreshContexts() when parentContext not implemented', () => {
        before(() => {
            // unable to deep clone driver object atm
            // @ts-ignore
            delete driver._spec.parentContext;
        });
        afterEach(async () => {
            await driver.switchToMainContext();
        });
        it('untracked same origin frame chain [(0-0)?]', () => {
            return untrackedFrameChainSameOrigin();
        });
        it('untracked cors frame chain [(0-1-2)?]', () => {
            return untrackedCorsFrameChain();
        });
        it('untracked mixed frame chain [(0-1-0)?]', () => {
            return untrackedMixedFrameChain1();
        });
        it('untracked mixed frame chain [(0-1-1)?]', () => {
            return untrackedMixedFrameChain2();
        });
        it('partially tracked frame chain [0-2-1-(2)?]', () => {
            return partiallyTrackedFrameChain1();
        });
        it('partially tracked frame chain [(0-2)?-1-2]', () => {
            return partiallyTrackedFrameChain2();
        });
        it('tracked frame chain [0-2-1-2]', () => {
            return trackedFrameChain();
        });
    });
    async function untrackedFrameChainSameOrigin() {
        const frameElements = [null];
        const frameElement = await mock.findElement('frame0');
        frameElements.push(frameElement);
        await mock.switchToFrame(frameElement);
        assert_1.default.strictEqual(driver.mainContext, driver.currentContext);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function untrackedCorsFrameChain() {
        const frameElements = [null];
        const frameElement1 = await mock.findElement('frame1');
        frameElements.push(frameElement1);
        await mock.switchToFrame(frameElement1);
        const frameElement2 = await mock.findElement('frame1-2');
        frameElements.push(frameElement2);
        await mock.switchToFrame(frameElement2);
        assert_1.default.strictEqual(driver.mainContext, driver.currentContext);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function untrackedMixedFrameChain1() {
        const frameElements = [null];
        const frameElement1 = await mock.findElement('frame1');
        frameElements.push(frameElement1);
        await mock.switchToFrame(frameElement1);
        const frameElement0 = await mock.findElement('frame1-0');
        frameElements.push(frameElement0);
        await mock.switchToFrame(frameElement0);
        assert_1.default.strictEqual(driver.mainContext, driver.currentContext);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function untrackedMixedFrameChain2() {
        const frameElements = [null];
        const frameElement1 = await mock.findElement('frame1');
        frameElements.push(frameElement1);
        await mock.switchToFrame(frameElement1);
        const frameElement11 = await mock.findElement('frame1-1');
        frameElements.push(frameElement11);
        await mock.switchToFrame(frameElement11);
        assert_1.default.strictEqual(driver.mainContext, driver.currentContext);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function partiallyTrackedFrameChain1() {
        const frameElements = [null];
        const frameElement2 = await mock.findElement('frame2');
        frameElements.push(frameElement2);
        await driver.switchToChildContext(frameElement2);
        const frameElement1 = await mock.findElement('frame2-1');
        frameElements.push(frameElement1);
        await driver.switchToChildContext(frameElement1);
        const frameElement22 = await mock.findElement('frame2-1-2');
        frameElements.push(frameElement22);
        await mock.switchToFrame(frameElement22);
        assert_1.default.strictEqual(driver.currentContext.path.length, 3);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function partiallyTrackedFrameChain2() {
        const frameElements = [null];
        const frameElement2 = await mock.findElement('frame2');
        frameElements.push(frameElement2);
        await mock.switchToFrame(frameElement2);
        const frameElement1 = await mock.findElement('frame2-1');
        frameElements.push(frameElement1);
        await driver.switchToChildContext(frameElement1);
        const frameElement22 = await mock.findElement('frame2-1-2');
        frameElements.push(frameElement22);
        await driver.switchToChildContext(frameElement22);
        assert_1.default.strictEqual(driver.currentContext.path.length, 3);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
    async function trackedFrameChain() {
        const frameElements = [null];
        const frameElement2 = await mock.findElement('frame2');
        frameElements.push(frameElement2);
        await driver.switchToChildContext(frameElement2);
        const frameElement1 = await mock.findElement('frame2-1');
        frameElements.push(frameElement1);
        await driver.switchToChildContext(frameElement1);
        const frameElement22 = await mock.findElement('frame2-1-2');
        frameElements.push(frameElement22);
        await driver.switchToChildContext(frameElement22);
        assert_1.default.strictEqual(driver.currentContext.path.length, frameElements.length);
        await driver.refreshContexts();
        const contextPath = driver.currentContext.path;
        assert_1.default.strictEqual(contextPath.length, frameElements.length);
        for (const frameIndex of frameElements.keys()) {
            assert_1.default.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]));
        }
    }
});
describe('driver native', () => {
    let driver;
    before(async () => {
        driver = new index_1.Driver({ logger, spec: index_1.fake.spec, driver: new index_1.MockDriver({ device: { isNative: true } }) });
        await driver.init();
    });
    it('skip unnecessary method calls on native mode', async () => {
        const title = await driver.getTitle();
        const url = await driver.getUrl();
        assert_1.default.strictEqual(title, null);
        assert_1.default.strictEqual(url, null);
    });
    describe('from driver info', () => {
        let driver;
        before(async () => {
            driver = new index_1.Driver({
                logger,
                spec: index_1.fake.spec,
                driver: new index_1.MockDriver({
                    device: { isNative: true, name: 'MobilePhone' },
                    platform: { name: 'OS', version: 'V' },
                }),
            });
            await driver.init();
        });
        it('returns device name', () => {
            assert_1.default.strictEqual(driver.deviceName, 'MobilePhone');
        });
        it('returns platform name', () => {
            assert_1.default.strictEqual(driver.platformName, 'OS');
        });
        it('returns platform version', () => {
            assert_1.default.strictEqual(driver.platformVersion, 'V');
        });
        it('returns browser name', () => {
            assert_1.default.strictEqual(driver.browserName, null);
        });
        it('returns browser version', () => {
            assert_1.default.strictEqual(driver.browserVersion, null);
        });
    });
    describe('from no info', () => {
        before(async () => {
            driver = new index_1.Driver({
                logger,
                spec: index_1.fake.spec,
                driver: new index_1.MockDriver({ device: { isNative: true } }),
            });
            await driver.init();
        });
        it('returns device name', () => {
            assert_1.default.strictEqual(driver.deviceName, undefined);
        });
        it('returns platform name', () => {
            assert_1.default.strictEqual(driver.platformName, null);
        });
        it('returns platform version', () => {
            assert_1.default.strictEqual(driver.platformVersion, null);
        });
        it('returns browser name', () => {
            assert_1.default.strictEqual(driver.browserName, null);
        });
        it('returns browser version', () => {
            assert_1.default.strictEqual(driver.browserVersion, null);
        });
    });
});
describe('driver mobile', () => {
    let driver;
    before(async () => {
        driver = new index_1.Driver({ logger, spec: index_1.fake.spec, driver: new index_1.MockDriver({ device: { isNative: true } }) });
        await driver.init();
    });
    describe('from driver info', () => {
        before(async () => {
            driver = new index_1.Driver({
                logger,
                spec: index_1.fake.spec,
                driver: new index_1.MockDriver({
                    ua: null,
                    device: { isMobile: true, name: 'MobilePhone' },
                    platform: { name: 'OS', version: 'V' },
                    browser: { name: 'Browser', version: '3' },
                }),
            });
            await driver.init();
        });
        it('returns device name', () => {
            assert_1.default.strictEqual(driver.deviceName, 'MobilePhone');
        });
        it('returns platform name', () => {
            assert_1.default.strictEqual(driver.platformName, 'OS');
        });
        it('returns platform version', () => {
            assert_1.default.strictEqual(driver.platformVersion, 'V');
        });
        it('returns browser name', () => {
            assert_1.default.strictEqual(driver.browserName, 'Browser');
        });
        it('returns browser version', () => {
            assert_1.default.strictEqual(driver.browserVersion, '3');
        });
    });
    describe('from ua info', () => {
        before(async () => {
            driver = new index_1.Driver({
                logger,
                spec: index_1.fake.spec,
                driver: new index_1.MockDriver({
                    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
                }),
            });
            await driver.init();
        });
        it('returns device name', () => {
            assert_1.default.strictEqual(driver.deviceName, null);
        });
        it('returns platform name', () => {
            assert_1.default.strictEqual(driver.platformName, 'iOS');
        });
        it('returns platform version', () => {
            assert_1.default.strictEqual(driver.platformVersion, '12');
        });
        it('returns browser name', () => {
            assert_1.default.strictEqual(driver.browserName, 'Safari');
        });
        it('returns browser version', () => {
            assert_1.default.strictEqual(driver.browserVersion, '12');
        });
    });
});
