import { Locator, Page } from "@playwright/test";
import { getBreadcrumbs, getTile } from "./shared";
import { getSwiper } from "../tests/utils";

// special page structure on mobile view
export function getMobileProductFilters({ page }: { page: Page }) {
  const modal = page.locator(".filter-modal");
  const chips = getChips({ page });

  return {
    openFiltersButton: page.getByTestId("open_mobile_filters"),
    filtersView: {
      cancelAll: modal.getByText("cancel all"),
      showAll: modal.getByText("show all"),
      backArrowButton: modal.locator(".button-clear"),
      specItem: {
        locator: modal.locator(".filter-item"),
        consume: function (i: number) {
          return {
            label: this.locator.nth(i).locator("label") as Locator,
            active: this.locator.nth(i).locator("note") as Locator,
          };
        },
        consumeByName: function (name: string) {
          return {
            label: this.locator.filter({ hasText: name }).locator("label") as Locator,
            activeText: this.locator.filter({ hasText: name }).locator("note") as Locator,
          };
        },
      },
      price: {
        backArrowButton: modal.locator(".button-clear"),
        backButton: modal.locator(".filter-modal__control-buttons").getByText("Back"),
        showButton: modal.locator(".filter-modal__control-buttons").getByText("Show"),
        start: modal.locator(".range-filter__input-start input"),
        end: modal.locator(".range-filter__input-end input"),
        getMinMaxValues: async function () {
          return Promise.all([this.start.inputValue(), this.end.inputValue()]);
        },
        rangeSlider: {
          input: modal.locator("range input"),
          locator: modal.locator(".range-slider"),
          rangeA: modal.locator(".range-knob-a"),
          rangeB: modal.locator(".range-knob-b"),
        },
      },
      checkboxView: {
        backArrowButton: modal.locator(".button-clear"),
        backButton: modal.locator(".filter-modal__control-buttons").getByText("Back"),
        showButton: modal.locator(".filter-modal__control-buttons").getByText("Show"),
        option: {
          locator: modal.locator(".checkbox-filter__item"),
          consume: function (i: number) {
            return {
              label: this.locator.nth(i).locator(".label-text-wrapper") as Locator,
              input: this.locator.nth(i).locator("input") as Locator,
              count: this.locator.nth(i).locator(".label-text-wrapper text") as Locator,
            };
          },
          consumeByName: function (name: string) {
            return {
              chip: chips.chip(name),
              label: this.locator.filter({ hasText: name }).locator(".label-text-wrapper") as Locator,
              input: this.locator.filter({ hasText: name }).locator("input") as Locator,
              addMoreText: this.locator.filter({ hasText: name }).locator(".label-text-wrapper text") as Locator,
            };
          },
        },
      },
    },
  };
}

export function getChips({ page }: { page: Page }) {
  const chipsHolder = page.locator(".filter-values");
  return {
    chipsHolder,
    chip: function (header: string) {
      return {
        locator: chipsHolder.locator(`chip:has-text("${header}")`) as Locator,
        remove: chipsHolder.locator(`chip:has-text("${header}") icon`) as Locator,
      };
    },
    clearAll: chipsHolder.locator(`chip:has-text("Clear all")`) as Locator,
  };
}

// desktop view filters
export function getProductFilters({ page }: { page: Page }) {
  const filtersContainer = page.locator(".filters-holder");
  const chips = getChips({ page });

  const priceFilterContainer = filtersContainer.locator(".price-filter");
  const price = {
    header: priceFilterContainer.locator(".price-filter__header"),
    start: priceFilterContainer.locator(".price-filter__input-start input"),
    end: priceFilterContainer.locator(".range-filter__input-end input"),
    getMinMaxValues: async function () {
      return Promise.all([this.start.inputValue(), this.end.inputValue()]);
    },
    rangeSlider: {
      input: priceFilterContainer.locator("range input"),
      locator: priceFilterContainer.locator(".range-slider"),
      rangeA: priceFilterContainer.locator(".range-knob-a"),
      rangeB: priceFilterContainer.locator(".range-knob-b"),
    },
  };
  const booleanFilterHolder = filtersContainer.locator(".boolean-filters");
  const booleanFilters = {
    container: booleanFilterHolder,
    item: (label: string) => {
      const boolFilter = booleanFilterHolder.locator(`.boolean-filter__item:has-text("${label}")`);
      const labelAndCount = boolFilter.locator(`.label-text-wrapper`);
      return {
        providedLabel: label,
        chip: chips.chip(label),
        locator: boolFilter,
        labelAndCount,
        hiddenInput: boolFilter.locator(`input[type="checkbox"]`),
        count: labelAndCount.locator(`text`),
      };
    },
  };

  const details = {
    locator: filtersContainer,
    filter: (title: string) => {
      const detail = filtersContainer.locator(`details:has-text("${title}")`);

      return {
        locator: detail,
        title: detail.locator("summary .accorditem__summary-title"),
        option: (label: string) => {
          const option = detail.locator(`.checkbox:has-text("${label}")`);
          const labelAndCount = option.locator(`.label-text-wrapper`);
          return {
            providedLabel: label,
            chip: chips.chip(label),
            locator: option,
            labelAndCount,
            hiddenInput: option.locator(`input[type="checkbox"]`),
            count: labelAndCount.locator(`text`),
          };
        },
      };
    },
  };

  return { price, chips, details, booleanFilters };
}

export function getSorting({ page, isMobile }: { page: Page; isMobile: boolean }) {
  const gridHeaderHolder = page.locator(".products__wrapper");
  const sortingContainer = isMobile
    ? gridHeaderHolder.locator("section.products")
    : gridHeaderHolder.locator("section.filter");

  // values are set by devs in their project, hardcoded them here but they can be imported
  enum optionsEnum {
    abc = "BY_Abc",
    price_DROP_ASC = "DROP_ASC ",
    price_DROP_DESC = "DROP_DESC ",
    price_WHOLE_ASC = "WHOLE_ASC ",
    price_WHOLE_DESC = "WHOLE_DESC ",
    price_REC_ASC = "REC_ASC ",
    price_REC_DESC = "REC_DESC ",
  }
  const modalHolder = page.locator('.menu[role="listbox"]');
  const abc = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.abc}")`);
  const priceDropASC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_DROP_ASC}")`);
  const priceDropDESC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_DROP_DESC}")`);
  const priceWholeASC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_WHOLE_ASC}")`);
  const priceWholeDESC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_WHOLE_DESC}")`);
  const priceRecASC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_REC_ASC}")`);
  const priceRecDESC = modalHolder.locator(`[role="option"] p:text-is("${optionsEnum.price_REC_DESC}")`);

  const selected = modalHolder.locator('[role="option"][aria-selected="true"]');

  return {
    get foundAmount() {
      if (isMobile) {
        return gridHeaderHolder.locator(".view-type__controls-wrapper h4");
      }
      return gridHeaderHolder.locator("section.filter h3");
    },
    sort: {
      optionsEnum,
      field: sortingContainer.locator(".order-select"),
      option: {
        locator: modalHolder.locator('[role="option"]'),
        abc,
        priceDropASC,
        priceDropDESC,
        priceWholeASC,
        priceWholeDESC,
        priceRecASC,
        priceRecDESC,
        selected,
      },
    },
  };
}
export function getTileViewSwitch({ page }: { page: Page }) {
  const container = page.locator(".tile-view-switcher");
  const button = container.locator(".tile-view-switcher__btn");
  return {
    locator: container,
    isCurrent: (button: Locator) => button.and(page.locator(".current:visible")),
    small: button.and(page.locator('[data-gtm="tile-view-row-small"]:visible')),
    default: button.and(page.locator('[data-gtm="tile-view-default"]:visible')),
    row: button.and(page.locator('[data-gtm="tile-view-row"]:visible')),
  };
}

export function getProductGrid({ page }: { page: Page }) {
  const productGrid = page.locator(".grid-goods");

  const tile = productGrid.locator(".grid-goods__cell .tile");

  return {
    loader: page.locator(".simple-loader"),
    emptyStub: page.locator("section.products .empty-stub"),
    tile: {
      row: { consume: getTile.row, locator: tile.locator(".tile-row") },
      small: { consume: getTile.small, locator: tile.locator(".tile-row-small") },
      default: { consume: getTile.default, locator: tile.locator(".tile-default") },
    },
  };
}

export function getPagination({ page }: { page: Page }) {
  const paginationHolder = page.locator("section.pagination");
  const paginataionContainer = paginationHolder.locator(".paginatcontainer");
  const paginationButton = paginataionContainer.locator(".paginate-buttons");
  return {
    showMore: paginationHolder.locator("button.pagination__show-more"),
    buttons: {
      locator: paginationButton,
      getAllText: async () =>
        Promise.all([
          ...(await paginationButton.all()).map(async (button) => {
            if (await button.and(page.locator(".back-button")).isVisible()) {
              return "back";
            }
            if (await button.and(page.locator(".next-button")).isVisible()) {
              return "next";
            }
            return button.innerText();
          }),
          "|active>",
          paginataionContainer.locator(".paginate-buttons.active-page").innerText(),
        ]),
      active: paginataionContainer.locator(".paginate-buttons.active-page"),
      getNumbered: (number: string) => paginataionContainer.locator(`.paginate-buttons:text("${number}")`),
      next: paginataionContainer.locator(".paginate-buttons.next-button"),
      back: paginataionContainer.locator(".paginate-buttons.back-button"),
      startingDots: paginataionContainer.locator(".starting-breakpoint-button.paginate-buttons"),
      endingDots: paginataionContainer.locator(".ending-breakpoint-button.paginate-buttons"),
    },
  };
}

export function getCategoryHeader({ page }: { page: Page }) {
  const headerHolder = page.locator(".category-page__header");
  const subcategories = page.locator("section.subcategories");

  return {
    breadcrumbs: getBreadcrumbs({ selector: headerHolder }),
    h2: headerHolder.locator("h2"),
    subcategories: {
      swiper: getSwiper({
        page,
        swiper: subcategories.locator(".subcategories__swiper-wrapper"),
        handle: subcategories.locator(".swiper-slide.swiper-slide-active"),
      }),
      prev: subcategories.locator(".subcategories__swiper-button--prev"),
      next: subcategories.locator(".subcategories__swiper-button--next"),
      card: {
        locator: subcategories.locator(".category-card"),
        consume: function (nth: number) {
          return {
            locator: this.locator.nth(nth) as Locator,
            img: this.locator.nth(nth).locator(".tile__picture img") as Locator,
            imgLink: this.locator.nth(nth).locator(".tile__picture a") as Locator,
            titleLink: this.locator.nth(nth).locator(".category-card__name") as Locator,
          };
        },
      },
    },
  };
}
