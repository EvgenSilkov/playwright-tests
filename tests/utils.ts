/* some utils function to use acros selector pages */

import { Locator, Page } from "@playwright/test";

function getPosition(bbox: { x: number; y: number; height: number; width: number } | null) {
  return {
    xm: bbox!.x + bbox!.width / 2,
    ym: bbox!.y + bbox!.height / 2,
    l: bbox!.x,
    r: bbox!.x + bbox!.width,
    t: bbox!.y,
    b: bbox!.y + bbox!.height,
  };
}
export function getSwiper({ page, swiper, handle }: { page: Page; swiper: Locator; handle: Locator }) {
  const { width } = page.viewportSize()!;
  return {
    swipeRight: async () => {
      const { r, ym } = getPosition(await swiper.boundingBox());
      const { xm: hXm, ym: hYm } = getPosition(await handle.boundingBox());
      await page.mouse.move(hXm, hYm);
      await page.mouse.down();
      await page.mouse.move(Math.min(r, width) - 10, ym, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(100);
    },
  };
}
