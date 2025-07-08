import { test as base } from "@playwright/test";
import { expect as baseExpect } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { getApiClient } from "./apiClient/apiclient";
import { getMobileProductFilters, getProductFilters, getProductGrid, getSorting } from "./selectors/product_list";
import { getFavoritesPage } from "./selectors/favorites";

export * from "@playwright/test";
export type MyFixtures = {
  api: Awaited<ReturnType<typeof getApiClient>>;

  productGrid: ReturnType<typeof getProductGrid>;
  favoritesPage: ReturnType<typeof getFavoritesPage>;
  filters: ReturnType<typeof getProductFilters>;
  mobileFilters: ReturnType<typeof getMobileProductFilters>;
  sorting: ReturnType<typeof getSorting>;
};
export type MyOptions = {
  backURL: string;
};

const withApi = base.extend<MyOptions & MyFixtures>({
  backURL: ["NO_BACK_URL_SUPPLIED", { option: true }],
  api: async ({ context, backURL }, use) => {
    const apiClient = await getApiClient({ context, backURL });
    await use(apiClient);
  },
});

export const test = withApi.extend<MyOptions & MyFixtures>({
  // overwrite flush data between tests
  page: async ({ api, page }, use) => {
    await api.back.favorites.deleteAll();
    await api.back.cart.deleteAll();
    await use(page);
  },
  // provide new fixtures to use in tests
  productGrid: ({ page }, use) => {
    use(getProductGrid({ page }));
  },
  favoritesPage: ({ page, isMobile }, use) => {
    use(getFavoritesPage({ page, isMobile }));
  },
});

export const expect = baseExpect.extend({
  // had a problem with elements being rendered on top of each other, wrote this to catch the problem
  async toBeTopElement(locator: Locator, options?: { timeout?: number }) {
    const assertionName = "toBeTopElement";
    let pass: boolean;
    let matcherResult: any;
    const timeout = options?.timeout ?? this.timeout;
    try {
      const bbox = await locator.boundingBox();
      const handle = await locator.elementHandle();
      await locator.page().waitForFunction(
        ([locator, bbox, isNot]) => {
          const elemAtPosition = document.elementFromPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);

          return isNot ? locator != elemAtPosition : locator == elemAtPosition;
        },
        [handle, bbox!, this.isNot] as any,
        { timeout },
      );
      handle?.dispose();

      pass = true && !this.isNot;
    } catch (e: any) {
      matcherResult = e.matcherResult;
      pass = false && this.isNot;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          }) +
          "\n\n" +
          `Locator: ${locator}\n` +
          `Expected: not to be the top element\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : "")
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, {
            isNot: this.isNot,
          }) +
          "\n\n" +
          `Locator: ${locator}\n` +
          `Expected: to be the top element\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : "");

    return {
      message,
      pass,
      name: assertionName,
      actual: matcherResult?.actual,
    };
  },
});
