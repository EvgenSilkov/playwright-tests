/*
this test pursues simplicity and staightforwardness each line is a new action.
If error is thrown in test it always points at the line in test
with ../requirements.yaml tracking coverage of the functionality this test is deliberatly not split into test.steps
it is easy to read and easy to modify. This approach may stumble in overcomplicated UI frameworks with hellish setup
*/
import { expect, test } from "../extended-playwright";
test.afterEach(async ({ api }) => {
  await api.back.favorites.deleteAll();
});

test(
  "favorites list",
  { tag: "@STAGE" },
  async ({ api, page, categoryFromFixtures, siteHeader, productGrid, favoritesPage, sidebarMenu, isMobile }) => {
    await page.goto(`categories/${categoryFromFixtures.id}`);
    await api.back.favorites.deleteAll();

    const headerFavBtn = siteHeader.favorite;

    await productGrid.tile.default.locator.first().waitFor();
    await productGrid.tile.default.consume(0).favBtn.click();

    // text on this error message is linked in ../requirements.yaml
    await expect(siteHeader.favorite.badge, "user CAN add product to favorites from a list view").toHaveText("1");

    await productGrid.tile.default.consume(1).favBtn.click();

    await expect(siteHeader.favorite.badge).toHaveText("2");

    if (isMobile) {
      await sidebarMenu.linksCard.consume(0).link.byHref("/profile/favorites").click();
    }
    await siteHeader.sidebarButton.click();

    await expect(page).toHaveURL(/.*\/favorites/);

    await expect(productGrid.tile.default.locator).toHaveCount(2);
    await productGrid.tile.default.consume(0).favBtn.click();
    await page.reload();

    // text on this error message is linked in ../requirements.yaml
    await expect(productGrid.tile.default.locator, "user CAN remove product from favorites list").toHaveCount(1);
    await favoritesPage.header.clearFavoritesBtn.click();
    await expect(favoritesPage.emptyStub.locator).toBeVisible();
    await favoritesPage.emptyStub.returnButton.click();

    await expect(page).toHaveURL("");
    await expect(headerFavBtn.badge).not.toBeVisible();
  },
);
