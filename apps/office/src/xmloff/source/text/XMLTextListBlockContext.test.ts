/** @fileoverview Verifies actual source-owned block/item references and empty-sublist restart return. */
import { expect, it } from "vitest";
import { FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import type { XMLTextImportTarget } from "./txtparai";
import { XMLTextListsHelper, type XMLTextListImportState } from "./txtlists";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";
import { XMLTextListItemContext } from "./XMLTextListItemContext";

it("retains native block references and returns pending restart from empty sublists", /** Verifies ownership independent of paragraph counter materialization. @returns Nothing. */ () => {
  const rule = { name: "L", levelCount: 10, levels: [] };
  const target: XMLTextImportTarget = {
    createParagraph:
      /** Rejects accidental paragraph construction in this ownership test. @returns Never. */ () => {
        throw new Error("No paragraph expected");
      },
    getListRule: /** Returns the existing rule reference. @returns Rule. */ () => rule,
    getStyle: /** Has no common style. @returns Nothing. */ () => undefined,
    getAutoStyle: /** Has no automatic style. @returns Nothing. */ () => undefined,
  };
  const state: XMLTextListImportState = {
    generatedListId: 0,
    listIds: new Map(),
    textLists: new XMLTextListsHelper(),
  };
  const empty = new FastAttributeList([]);
  const root = new XMLTextListBlockContext(
    target,
    new FastAttributeList([
      {
        name: "text:style-name",
        prefix: "text",
        local: "style-name",
        uri: ODF_NAMESPACES.text,
        value: "L",
      },
    ]),
    state,
  );
  expect(state.textLists.ListContextTop()?.block).toBe(root);
  expect(root.rule).toBe(rule);
  const item = root.createFastChildContext(
    XMLToken.TEXT_LIST_ITEM,
    empty,
  ) as XMLTextListItemContext;
  expect(item).toBeInstanceOf(XMLTextListItemContext);
  expect(state.textLists.ListContextTop()?.item).toBe(item);
  const first = item.createFastChildContext(XMLToken.TEXT_LIST, empty) as XMLTextListBlockContext;
  expect(first).toBeInstanceOf(XMLTextListBlockContext);
  expect(state.textLists.ListContextTop()?.block).toBe(first);
  expect(first.rule).toBe(rule);
  expect(first.IsRestartNumbering()).toBe(false);
  first.endFastElement();
  expect(state.textLists.ListContextTop()?.block).toBe(root);
  expect(state.textLists.ListContextTop()?.item).toBeUndefined();
  const second = item.createFastChildContext(XMLToken.TEXT_LIST, empty) as XMLTextListBlockContext;
  expect(second.IsRestartNumbering()).toBe(true);
  const nestedItem = second.createFastChildContext(
    XMLToken.TEXT_LIST_ITEM,
    empty,
  ) as XMLTextListItemContext;
  const deep = nestedItem.createFastChildContext(
    XMLToken.TEXT_LIST,
    empty,
  ) as XMLTextListBlockContext;
  expect(deep.IsRestartNumbering()).toBe(true);
  deep.endFastElement();
  nestedItem.endFastElement();
  second.endFastElement();
  expect(root.IsRestartNumbering()).toBe(true);
  root.ResetRestartNumbering();
  expect(root.IsRestartNumbering()).toBe(false);
  item.endFastElement();
  root.endFastElement();
  expect(state.textLists.ListContextTop()).toBeUndefined();
});

it("narrows repeated-sublist count to the native signed16 field", /** Verifies primary factory boundary states independently of the restart flag returned by empty lists. @returns Nothing. */ () => {
  const target: XMLTextImportTarget = {
    createParagraph: /** Has no paragraph in this counter test. @returns Never. */ () => {
      throw new Error("No paragraph expected");
    },
    getListRule: /** Returns an existing rule. @returns Rule. */ () => ({
      name: "L",
      levelCount: 10,
      levels: [],
    }),
    getStyle: /** Has no common style. @returns Nothing. */ () => undefined,
    getAutoStyle: /** Has no automatic style. @returns Nothing. */ () => undefined,
  };
  const state: XMLTextListImportState = {
    generatedListId: 0,
    listIds: new Map(),
    textLists: new XMLTextListsHelper(),
  };
  const empty = new FastAttributeList([]);
  const root = new XMLTextListBlockContext(
    target,
    new FastAttributeList([
      {
        name: "text:style-name",
        prefix: "text",
        local: "style-name",
        uri: ODF_NAMESPACES.text,
        value: "L",
      },
    ]),
    state,
  );
  const item = root.createFastChildContext(
    XMLToken.TEXT_LIST_ITEM,
    empty,
  ) as XMLTextListItemContext;
  const boundaries = new Set([1, 2, 32767, 32768, 32769, 65535, 65536, 65537, 65538]);
  const signals: [number, boolean][] = [];
  for (let count = 1; count <= 65538; count++) {
    const child = item.createFastChildContext(XMLToken.TEXT_LIST, empty) as XMLTextListBlockContext;
    if (boundaries.has(count)) signals.push([count, child.IsRestartNumbering()]);
    child.endFastElement();
    // Isolate the next child's count signal from inherited pending restart.
    root.ResetRestartNumbering();
  }
  expect(signals).toEqual([
    [1, false],
    [2, true],
    [32767, true],
    [32768, false],
    [32769, false],
    [65535, false],
    [65536, false],
    [65537, false],
    [65538, true],
  ]);
  item.endFastElement();
  root.endFastElement();
  expect(state.textLists.ListContextTop()).toBeUndefined();
});
