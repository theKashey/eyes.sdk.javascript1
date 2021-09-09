"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_1 = require("../../src/index");
describe('context', () => {
    let mock, driver, context;
    const logger = { log: () => null, warn: () => null, error: () => null };
    beforeEach(() => {
        mock = new index_1.MockDriver();
        mock.mockElements([
            {
                selector: 'element-scroll',
                scrollPosition: { x: 21, y: 22 },
                children: [
                    {
                        selector: 'frame1',
                        frame: true,
                        children: [
                            {
                                selector: 'frame1-1',
                                frame: true,
                                rect: { x: 1, y: 2, width: 101, height: 102 },
                                children: [{ selector: 'frame1-1--element1', name: 'element within frame' }],
                            },
                        ],
                    },
                    {
                        selector: 'frame2',
                        frame: true,
                        children: [{ selector: 'frame2--element1' }],
                    },
                    {
                        selector: 'shadow1',
                        shadow: true,
                        children: [
                            { selector: 'shadow1--element1' },
                            {
                                selector: 'shadow1-1',
                                shadow: true,
                                children: [{ selector: 'shadow1-1--element1', name: 'element within shadow' }],
                            },
                        ],
                    },
                ],
            },
        ]);
        driver = new index_1.Driver({ logger, spec: index_1.fake.spec, driver: mock });
        context = driver.currentContext;
    });
    it('constructor(logger, context, {driver})', async () => {
        assert_1.default.ok(context.isMain);
        assert_1.default.ok(context.target);
    });
    it('context(element)', async () => {
        const element = await mock.findElement('frame1');
        const childContext = await context.context(element);
        assert_1.default.strictEqual(childContext.parent, context);
        assert_1.default.strictEqual(childContext.main, context);
    });
    it('init()', async () => {
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.init();
        assert_1.default.strictEqual((await childContext1.getContextElement()).target.selector, 'frame1');
        assert_1.default.strictEqual((await childContext11.getContextElement()).target.selector, 'frame1-1');
        assert_1.default.strictEqual(driver.currentContext, childContext1);
    });
    it('focus()', async () => {
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.focus();
        assert_1.default.strictEqual(driver.currentContext, childContext11);
    });
    it('element(selector)', async () => {
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.focus();
        const element = await childContext11.element('frame1-1--element1');
        assert_1.default.strictEqual(element.target.name, 'element within frame');
    });
    it('element(shadow-selector)', async () => {
        const element = await context.element({
            selector: 'shadow1',
            shadow: { selector: 'shadow1-1', shadow: { selector: 'shadow1-1--element1' } },
        });
        assert_1.default.deepStrictEqual(element.target.name, 'element within shadow');
    });
    it('element(frame-selector)', async () => {
        const element = await context.element({
            selector: 'frame1',
            frame: { selector: 'frame1-1', frame: { selector: 'frame1-1--element1' } },
        });
        assert_1.default.deepStrictEqual(element.target.name, 'element within frame');
    });
    it('element(non-existent)', async () => {
        const element = await context.element('non-existent');
        assert_1.default.strictEqual(element, null);
    });
    it('element(non-existent-shadow)', async () => {
        const element = await context.element({
            selector: 'shadow1',
            shadow: { selector: 'shadow1-non-existent', shadow: { selector: 'shadow1-non-existent--element1' } },
        });
        assert_1.default.strictEqual(element, null);
    });
    it('element(non-existent-frame)', async () => {
        const element = await context.element({
            selector: 'frame1',
            frame: { selector: 'frame1-non-existent', frame: { selector: 'frame1-non-existent--element1' } },
        });
        assert_1.default.strictEqual(element, null);
    });
    it('elements(selector)', async () => {
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.focus();
        const elements = await childContext11.elements('frame1-1--element1');
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 1);
        assert_1.default.strictEqual(elements[0].target.name, 'element within frame');
    });
    it('elements(shadow-selector)', async () => {
        const elements = await context.elements({
            selector: 'shadow1',
            shadow: { selector: 'shadow1-1', shadow: { selector: 'shadow1-1--element1' } },
        });
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 1);
        assert_1.default.strictEqual(elements[0].target.name, 'element within shadow');
    });
    it('elements(shadow-selector)', async () => {
        const elements = await context.elements({
            selector: 'frame1',
            frame: { selector: 'frame1-1', frame: { selector: 'frame1-1--element1' } },
        });
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 1);
        assert_1.default.strictEqual(elements[0].target.name, 'element within frame');
    });
    it('elements(non-existent)', async () => {
        const elements = await context.elements('non-existent');
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 0);
    });
    it('elements(non-existent-shadow)', async () => {
        const elements = await context.elements({
            selector: 'shadow1',
            shadow: { selector: 'shadow1-non-existent', shadow: { selector: 'shadow1-non-existent--element1' } },
        });
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 0);
    });
    it('elements(non-existent-frame)', async () => {
        const elements = await context.elements({
            selector: 'frame1',
            frame: { selector: 'frame1-non-existent', frame: { selector: 'frame1-non-existent--element1' } },
        });
        assert_1.default.ok(Array.isArray(elements));
        assert_1.default.strictEqual(elements.length, 0);
    });
    it('getContextElement()', async () => {
        const mainContext = context;
        const childContext = await context.context('frame1');
        assert_1.default.strictEqual(await mainContext.getContextElement(), null);
        assert_1.default.strictEqual((await childContext.getContextElement()).target.selector, 'frame1');
    });
    it('getScrollingElement()', async () => {
        const mainContext = context;
        await mainContext.setScrollingElement(await mock.findElement('element-scroll'));
        const childContext = await context.context('frame1');
        assert_1.default.strictEqual((await mainContext.getScrollingElement()).target.selector, 'element-scroll');
        assert_1.default.strictEqual((await childContext.getScrollingElement()).target.selector, 'html');
    });
    it('getClientRect()', async () => {
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.init();
        const rectContext11 = await childContext11.getClientRegion();
        assert_1.default.deepStrictEqual(rectContext11, {
            x: 1,
            y: 2,
            width: 101,
            height: 102,
        });
        assert_1.default.strictEqual(driver.currentContext, childContext11.parent);
        const rectContext1 = await childContext1.getClientRegion();
        assert_1.default.deepStrictEqual(rectContext1, {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
        });
        assert_1.default.strictEqual(driver.currentContext, childContext11.parent);
    });
    it('getLocationInViewport()', async () => {
        await context.setScrollingElement('element-scroll');
        const childContext1 = await context.context('frame1');
        const childContext11 = await childContext1.context('frame1-1');
        await childContext11.focus();
        const locationContext11 = await childContext11.getLocationInViewport();
        assert_1.default.deepStrictEqual(locationContext11, { x: -20, y: -20 });
    });
});
