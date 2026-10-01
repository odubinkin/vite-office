/** @fileoverview Verifies native list-context item consumption and enclosing-context restoration. */
import { expect, it, vi } from "vitest";
import { XMLTextListsHelper, type XMLTextListBlock } from "./txtlists";
it("restores outer item state and accepts native clearing outside lists", /** Verifies source-owned push/pop/top/set behavior and explicit nested-return clearing. @returns Nothing. */ () => {
  const helper = new XMLTextListsHelper();
  const block: XMLTextListBlock = {
    level: 0,
    listId: "L",
    GetListId: /** Returns own ID. @returns ID. */ () => "L",
    GetContinueListId: /** Has no continuation. @returns Empty. */ () => "",
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

it("retains processed roots, first style defaults and independent paragraph identity projection", /** Verifies native query defaults and record ownership independently of parsing. @returns Nothing. */ () => {
  const helper = new XMLTextListsHelper();
  /** Creates raw block getters for the native projection contract. @param id - Own ID. @param continuation - Master ID. @returns Raw getters. */
  function block(id: string, continuation = "") {
    return {
      GetListId: /** Returns own ID. @returns ID. */ () => id,
      GetContinueListId: /** Returns master ID. @returns ID. */ () => continuation,
    };
  }
  expect(helper.IsListProcessed("A")).toBe(false);
  expect(helper.GetListStyleOfProcessedList("A")).toBe("");
  expect(helper.GetContinueListIdOfProcessedList("A")).toBe("");
  expect(helper.GetLastIdOfStyleName("S")).toBe("");
  expect(helper.GetLastProcessedListId()).toBe("");
  expect(helper.GetListStyleOfLastProcessedList()).toBe("");
  expect(helper.GetListIdForListBlock(block("A"))).toBe("A");
  helper.KeepListAsProcessed("A", "S", "", "DS");
  helper.KeepListAsProcessed("B", "S", "A", "ignored-later-default");
  expect(helper.GetLastProcessedListId()).toBe("B");
  expect(helper.GetListStyleOfLastProcessedList()).toBe("S");
  expect(helper.GetLastIdOfStyleName("S")).toBe("B");
  expect(helper.GetLastIdOfStyleName("missing")).toBe("");
  expect(helper.GetListStyleOfProcessedList("missing")).toBe("");
  expect(helper.GetContinueListIdOfProcessedList("missing")).toBe("");
  expect(helper.GetListIdForListBlock(block("A"))).toBe("DS");
  expect(helper.GetListIdForListBlock(block("B"))).toBe("B");
  expect(helper.GetListIdForListBlock(block("B", "A"))).toBe("DS");
  expect(helper.GetListIdForListBlock(block("", ""))).toBe("");
  expect(helper.GetListIdForListBlock(block("unknown"))).toBe("unknown");
  helper.KeepListAsProcessed("A", "T", "B", "replacement");
  expect(helper.GetListStyleOfProcessedList("A")).toBe("S");
  expect(helper.GetContinueListIdOfProcessedList("A")).toBe("");
  expect(helper.GetLastProcessedListId()).toBe("B");
  helper.KeepListAsProcessed("C", "T", "B", "DT");
  expect(helper.GetListIdForListBlock(block("C"))).toBe("DT");
  // The block constructor resolves chains; this projection uses its supplied master.
  expect(helper.GetListIdForListBlock(block("C", "B"))).toBe("B");
  const noDefaults = new XMLTextListsHelper();
  noDefaults.KeepListAsProcessed("A", "S", "");
  expect(noDefaults.GetListIdForListBlock(block("A"))).toBe("A");
  noDefaults.KeepListAsProcessed("B", "S", "", "DB");
  expect(noDefaults.GetListIdForListBlock(block("A"))).toBe("A");
  expect(noDefaults.GetListIdForListBlock(block("B"))).toBe("DB");
});

it("generates native time date random IDs and tests collisions only against processed roots", /** Verifies primary fixed-clock/RNG arithmetic and collision suffix ownership. @returns Nothing. */ () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 1, 12, 34, 56, 789));
  const random = vi.spyOn(crypto, "getRandomValues").mockImplementation(
    /** Supplies the uniform31bit minimum through the browser RNG adapter. @param array - Random output. @returns Array. */ (
      array,
    ) => {
      (array as Uint32Array).fill(0);
      return array;
    },
  );
  try {
    const helper = new XMLTextListsHelper();
    expect(helper.GenerateNewListId()).toBe("list123456809261001");
    // Generation alone does not reserve an ID.
    expect(helper.GenerateNewListId()).toBe("list123456809261001");
    helper.KeepListAsProcessed("list123456809261001", "S", "");
    expect(helper.GenerateNewListId()).toBe("list1234568092610011");
    helper.KeepListAsProcessed("list1234568092610011", "S", "");
    expect(helper.GenerateNewListId()).toBe("list1234568092610012");
    random.mockImplementation(
      /** Supplies the uniform31bit maximum through the high-bit mask. @param array - Random output. @returns Array. */ (
        array,
      ) => {
        (array as Uint32Array).fill(0xffffffff);
        return array;
      },
    );
    expect(helper.GenerateNewListId()).toBe("list123458956744648");
  } finally {
    random.mockRestore();
    vi.useRealTimers();
  }
});
