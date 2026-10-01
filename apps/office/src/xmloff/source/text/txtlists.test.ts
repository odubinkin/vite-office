/** @fileoverview Verifies native list-context item consumption and enclosing-context restoration. */
import { expect, it } from "vitest";
import { XMLTextListsHelper, type XMLTextListBlock } from "./txtlists";
it("restores outer item state and accepts native clearing outside lists", /** Verifies source-owned push/pop/top/set behavior and explicit nested-return clearing. @returns Nothing. */ () => {
  const helper = new XMLTextListsHelper();
  const block: XMLTextListBlock = {
    level: 0,
    listId: "L",
    styleName: "Counters",
    rule: { name: "Counters", levels: [], levelCount: 10 },
  };
  const item = { GetStartValue: /** Supplies a numbered item restart. @returns Start. */ () => 0 };
  expect(helper.ListContextTop()).toBeUndefined();
  helper.SetListItem(undefined);
  helper.PopListContext();
  helper.PushListContext(block);
  expect(helper.ListContextTop()?.item).toBeUndefined();
  helper.SetListItem(item);
  helper.PushListContext({ ...block, level: 1 });
  expect(helper.ListContextTop()?.item).toBeUndefined();
  helper.PopListContext();
  expect(helper.ListContextTop()).toEqual({ block, item });
  helper.SetListItem(undefined);
  expect(helper.ListContextTop()?.item).toBeUndefined();
  helper.PopListContext();
  expect(helper.ListContextTop()).toBeUndefined();
});
