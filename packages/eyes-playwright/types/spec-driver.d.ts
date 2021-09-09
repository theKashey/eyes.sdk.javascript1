/// <reference types="node" />
import type * as Playwright from 'playwright';
export declare type Driver = Playwright.Page;
export declare type Context = Playwright.Frame;
export declare type Element = Playwright.ElementHandle;
export declare type Selector = string;
declare type CommonSelector = string | {
    selector: Selector | string;
    type?: string;
};
export declare function isDriver(page: any): page is Driver;
export declare function isContext(frame: any): frame is Context;
export declare function isElement(element: any): element is Element;
export declare function isSelector(selector: any): selector is Selector;
export declare function transformSelector(selector: Selector | CommonSelector): Selector;
export declare function extractContext(page: Driver | Context): Context;
export declare function isStaleElementError(err: any): boolean;
export declare function executeScript(frame: Context, script: ((arg: any) => any) | string, arg: any): Promise<any>;
export declare function mainContext(frame: Context): Promise<Context>;
export declare function parentContext(frame: Context): Promise<Context>;
export declare function childContext(_frame: Context, element: Element): Promise<Context>;
export declare function findElement(frame: Context, selector: Selector, parent?: Element): Promise<Element>;
export declare function findElements(frame: Context, selector: Selector, parent?: Element): Promise<Element[]>;
export declare function getViewportSize(page: Driver): Promise<{
    width: number;
    height: number;
}>;
export declare function setViewportSize(page: Driver, size: {
    width: number;
    height: number;
}): Promise<void>;
export declare function getTitle(page: Driver): Promise<string>;
export declare function getUrl(page: Driver): Promise<string>;
export declare function visit(page: Driver, url: string): Promise<void>;
export declare function takeScreenshot(page: Driver): Promise<Buffer>;
export declare function click(frame: Context, element: Element | Selector): Promise<void>;
export declare function type(frame: Context, element: Element | Selector, keys: string): Promise<void>;
export declare function hover(frame: Context, element: Element | Selector): Promise<void>;
export declare function scrollIntoView(frame: Context, element: Element | Selector, align?: boolean): Promise<void>;
export declare function waitUntilDisplayed(frame: Context, selector: Selector): Promise<void>;
export declare function build(env: any): Promise<[Driver, () => Promise<void>]>;
export {};
