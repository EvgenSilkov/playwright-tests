import { test as setup } from "../extended-playwright";
import path from "path";
import { getLoginPage } from "../selectors/login";
import { getApiClient } from "../apiClient/apiclient";
import { getProductGrid } from "../selectors/product_list";

let page;
setup.afterAll(async () => {
  if (page) {
    await page.close();
  }
});

setup("authenticate", { tag: ["@PROD", "@STAGE"] }, async ({ browser, backURL }, testInfo) => {
  const authFile = path.join(__dirname, `../playwright/.auth/${testInfo.project.name}.json`);
  page = await browser.newPage();
  await page.goto("");

  // login page isn't taken from fixtures, because this "setup" project shouldn't have the state set
  const loginPage = getLoginPage({ page });
  await loginPage.login.fill("test@test.ua");
  await loginPage.pass.fill("test123");
  await loginPage.submitButton.click();

  const grid = getProductGrid({ page });
  await grid.tile.default.locator.first().waitFor();

  const api = await getApiClient({ context: page.context(), backURL });
  await api.back.favorites.deleteAll();
  await api.back.cart.deleteAll();
  await page.reload();

  await grid.tile.default.locator.first().waitFor();

  await page.context().storageState({ path: authFile });
});
