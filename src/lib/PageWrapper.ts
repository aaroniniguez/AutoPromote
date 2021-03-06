import { Page } from "puppeteer";

// Wrapper for the Page Class
export default class PageWrapper {
    constructor(public page: Page) {}
    async init() {
        await this.page.setViewport({width: 1000, height: 1000, isMobile: false});
    }

    async findSingleXPathElement(selector: string) {
        return await this.page.waitForXPath(selector).catch(() => {
            throw new Error(`could not find xpath selector ${selector}`);
        });
    }

    async findSingleElement(selector: string) {
        await this.page.waitForSelector(selector);
        const EH = await this.page.$$(selector);
        if(EH.length === 0) {
            throw new Error(`could not find selector ${selector}`);
        } else {
            return EH[0];
        }
    }
}