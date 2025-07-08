import { expect, test } from "../../extended-playwright";

test.afterEach(async ({ api }) => {
  await api.back.favorites.deleteAll();
});

test("favorite list", { tag: ["@API", "@STAGE"] }, async ({ api, stage10Taps }) => {
  await api.back.favorites.deleteAll();
  const {
    data: { bookmarkProducts: favorites },
  } = await api.back.favorites.get();
  expect(favorites, "flush favorite list").toEqual([]);

  const [firstItem, secondItem, thirdItem] = stage10Taps;
  await api.back.favorites.add({ id: firstItem.id });
  await api.back.favorites.add({ id: secondItem.id });
  await api.back.favorites.add({ id: thirdItem.id });
  const {
    data: { bookmarkProducts: addedThree },
  } = await api.back.favorites.get();
  expect(addedThree, "add 3 items to the favorite list").toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({ productId: firstItem.id }),
      expect.objectContaining({ productId: secondItem.id }),
      expect.objectContaining({ productId: thirdItem.id }),
    ]),
  );

  await api.back.favorites.delete({ id: thirdItem.id });
  const {
    data: { bookmarkProducts: deletedOne },
  } = await api.back.favorites.get();
  expect(deletedOne, "third item is deleted").not.toMatchObject(
    expect.arrayContaining([expect.objectContaining({ productId: thirdItem.id })]),
  );
  expect(deletedOne, "two items is left in the favorite list").toMatchObject(
    expect.arrayContaining([
      expect.objectContaining({ productId: firstItem.id }),
      expect.objectContaining({ productId: secondItem.id }),
    ]),
  );
  await api.back.favorites.deleteAll({ id: thirdItem.id });
  const {
    data: { bookmarkProducts: deletedAll },
  } = await api.back.favorites.get();
  expect(deletedAll, "all items are delted from the favorite list").toEqual([]);
});
