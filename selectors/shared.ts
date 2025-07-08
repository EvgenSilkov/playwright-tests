/* 
  shared elements across different selectors page 
  better to do folder with separate files
*/
import { Locator, Page } from "@playwright/test";

export const getTile = {
  row: function (nth: number = 0) {
    const itemFooter = this.locator.nth(nth).locator("footer:visible") as Locator;
    const slideLocator = this.locator.locator(".product-swiper__swiper-main-slide") as Locator;
    const swiper = this.locator.nth(nth).locator(".product-swiper__main-swiper") as Locator;
    return {
      brand: this.locator.nth(nth).locator(".tile__picture.tile-row__card__wrapper__brand img"),
      code: this.locator.nth(nth).locator(".tile-row__card__details__header__code__value"),
      status: this.locator.nth(nth).locator(".tile-row__card__details__header__status"),
      swiper: {
        slide: {
          locator: slideLocator,
          consume: function (nth: number = 0) {
            return {
              locator: this.locator.nth(nth) as Locator,
              activeClassRegExp: /(^|\s)swiper-slide-active(\s|$)/,
              video: this.locator.nth(nth).locator(".video-viewer__video") as Locator,
              videoSource: this.locator.nth(nth).locator(".video-viewer__video source"),
              img: this.locator.nth(nth).locator(".tile__picture img") as Locator,
              zoomContainer: this.locator.nth(nth).locator(".swiper-zoom-container") as Locator,
            };
          },
        },
        settledSwiper: swiper.locator('.swiper-wrapper[style*="transitduration: 0ms;"]'),
        prev: swiper.locator(".swiper-button-prev"),
        next: swiper.locator(".swiper-button-next"),
      },
      prices: this.locator.nth(nth).locator(".tile-row__card__footer__prices"),
      favBtn: this.locator.nth(nth).locator('[aria-label="add to favorites"]:visible'),
      share: this.locator.nth(nth).locator("[data-testid='share_link_btn']:visible"),
      title: this.locator.nth(nth).locator(".tile-row__card__details__header__title"),
      locator: this.locator.nth(nth),
      selectAmount: dropdown({ parent: itemFooter }),
      addToCart: itemFooter.locator(".add-to-cart-btn:visible"),
    };
  },
  small: (item: Locator) => {
    const itemFooter = item.locator("footer:visible");
    return {
      code: item.locator(".tile-row-small__card__details__header__code__value"),
      status: item.locator(".tile-row-small__card__details__header__status"),
      img: item.locator(".tile-row-small__card__image img"),
      prices: item.locator(".tile-row-small__card__prices"),
      favBtn: item.locator('[aria-label="add to favorites"]:visible'),
      share: item.locator("[data-testid='share_link_btn']:visible"),
      title: item.locator(".tile-row-small__card__details__header__title"),
      locator: item,
      selectAmount: dropdown({ parent: itemFooter }),
      addToCart: itemFooter.locator(".add-to-cart-btn:visible"),
    };
  },
  default: function (nth: number) {
    const locator = this.locator.nth(nth);
    const itemFooter = locator.locator("footer:visible") as Locator;
    return {
      brandImage: locator.locator(".tile__picture.tile-default__card__header__brand img") as Locator,
      code: locator.locator(".tile-default__card__header__code__value") as Locator,
      status: locator.locator(".tile-default__card__details__header__status") as Locator,
      img: locator.locator(".tile-default__card__image img") as Locator,
      prices: locator.locator(".tile-default__card__details__prices") as Locator,
      favBtn: locator.getByTestId("add_favorite_btn") as Locator,
      share: locator.getByTestId("share_link_btn") as Locator,
      title: locator.locator(".tile-default__card__details__header__title") as Locator,
      addToCart: itemFooter.locator(".add-to-cart-btn") as Locator,
      locator,
      selectAmount: dropdown({ parent: itemFooter }),
    };
  },
};

export function dropdown({ parent }: { parent: Locator }) {
  const dropdown = parent.locator(".count-select:visible");
  const popover = dropdown.locator(".count-select__popover");
  return {
    locator: dropdown,
    popover: {
      locator: popover,
      listitem: popover.getByRole("listitem"),
      textInput: popover.locator('input[type="text"]'),
    },
  };
}

export function autoCompleteInput({ selector }: { selector: Locator }) {
  const button = selector.locator(".autocomplete-input__inner");
  const popover = selector.locator(".autocomplete-input__popover");

  return {
    locator: selector,
    button,
    popover: {
      textInput: popover.locator("input"),
      listitem: popover.getByRole("listitem"),
    },
  };
}

export function getDatePopover({ page }: { page: Page }) {
  const popover = page.locator("datetime");
  return {
    previousMonthBtn: popover.locator('button[aria-label="Previous month"]:visible'),
    nextMonthBtn: page.locator('button[aria-label="Next month"]:visible'),
    getDay: (day: number, month?: number) =>
      popover.locator(`button[data-day="${day}"]${Number.isInteger(month) ? `[data-month="${month}"]` : ""}:visible`),
  };
}

export function getBreadcrumbs({ selector }: { selector: Locator }) {
  const container = selector.locator("breadcrumbs");
  return {
    locator: container,
    mobileBackButton: selector.locator(".page-back-btn__wrapper"),
    breadcrumb: {
      locator: container.locator("breadcrumb"),
      consume: function (nth: number) {
        return {
          locator: this.locator.nth(nth) as Locator,
          link: this.locator.nth(nth).locator("a") as Locator,
          current: this.locator.nth(nth).and(container.locator(".breadcrumb-active")) as Locator,
        };
      },
    },
  };
}
