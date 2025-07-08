import { Page } from "@playwright/test";
import { getProductGrid } from "./product_list";

export const getFavoritesPage = ({ page, isMobile }: { page: Page; isMobile: boolean }) => {
  return {
    getFavoritesPage,
    header: {
      summaryText: page.locator(".heading h3"),
      get clearFavoritesBtn() {
        // some simple cases of dual viewport can be handled on selectors level
        return isMobile ? page.locator(".floating-clear") : page.locator(".sorting button");
      },
    },
    emptyStub: {
      locator: page.locator(".empty-stub"),
      returnButton: page.locator(".empty-stub").getByText("Go Back"),
    },
    grid: getProductGrid({ page }),
  };
};
