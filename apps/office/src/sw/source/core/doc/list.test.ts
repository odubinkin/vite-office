/** @fileoverview Verifies Writer list projection normalization at the `list.cxx`-derived document boundary. */

import { describe, expect, it } from "vitest";

import {
  createDefaultWriterParagraphList,
  isWriterParagraphListKind,
  normalizeWriterParagraphList,
} from "./list";
import { SwList } from "./list";
import { createWriterDocument } from "./doc";

describe("Writer list state" /** Groups serializable list-state tests. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterListTests(): void {
  it("creates and recognizes the bounded default Writer list kinds" /** Verifies the executable list enum accepts only current commands. @returns Nothing; assertions cover valid and invalid runtime values. */, function createsAndRecognizesKinds(): void {
    expect(createDefaultWriterParagraphList()).toEqual({ kind: "none", level: 0 });
    expect(isWriterParagraphListKind("none")).toBe(true);
    expect(isWriterParagraphListKind("bullet")).toBe(true);
    expect(isWriterParagraphListKind("numbered")).toBe(true);
    expect(isWriterParagraphListKind("outline")).toBe(false);
    expect(isWriterParagraphListKind(undefined)).toBe(false);
  });

  it("normalizes malformed command metadata without losing valid fields" /** Verifies browser command inputs retain valid fields and default invalid candidates. @returns Nothing; assertions cover normalization branches. */, function normalizesListMetadata(): void {
    expect(normalizeWriterParagraphList(undefined)).toEqual({ kind: "none", level: 0 });
    expect(normalizeWriterParagraphList(null)).toEqual({ kind: "none", level: 0 });
    expect(normalizeWriterParagraphList({ kind: "outline", level: -1, styleId: "  " })).toEqual({
      kind: "none",
      level: 0,
    });
    expect(normalizeWriterParagraphList({ kind: "bullet", level: 2, styleId: "List 1" })).toEqual({
      kind: "bullet",
      level: 2,
      styleId: "List 1",
    });
    expect(normalizeWriterParagraphList({ kind: "numbered", level: 0.5 })).toEqual({
      kind: "numbered",
      level: 0,
    });
    expect(normalizeWriterParagraphList({ kind: "bullet", level: 99 })).toEqual({
      kind: "bullet",
      level: 9,
    });
  });

  it("owns, invalidates, validates, and removes bounded SwNodeNum items", /** Verifies the supported SwList lifecycle. @returns Nothing. */ () => {
    const list = new SwList("list-a", "Numbering 1");
    const document = createWriterDocument("first");
    const first = document.paragraphs[0] as import("../txtnode/ndtxt").SwTextNode;
    const nested = document.nodes.MakeTextNode("nested");
    const missing = document.nodes.MakeTextNode("missing");
    expect(list.GetListId()).toBe("list-a");
    expect(list.GetDefaultListStyleName()).toBe("Numbering 1");
    expect(list.HasNodes()).toBe(false);
    list.SetDefaultListStyleName("Numbering 2");
    expect(list.GetDefaultListStyleName()).toBe("Numbering 2");
    expect(
      /** Inserts an invalid level. @returns Nothing. */ () => list.InsertListItem(first, 10),
    ).toThrow("outside 0-9");
    list.InsertListItem(first, 0);
    list.InsertListItem(nested, 1);
    list.ValidateListTree([missing, first, nested]);
    list.ValidateListTree([first, nested]);
    expect(list.GetListItemNumber(first)).toBe(1);
    expect(list.GetListItemNumber(nested)).toBe(1);
    expect(list.GetListItem(nested)?.GetParent()?.GetTextNode()).toBe(first);
    expect(list.GetListItem(first)?.GetChildren()).toEqual([list.GetListItem(nested)]);
    expect(list.HasNodes()).toBe(true);
    list.InvalidateListTree();
    list.RemoveListItem(nested);
    list.RemoveListItem(missing);
    list.ValidateListTree([first]);
    expect(list.GetListItemNumber(nested)).toBeUndefined();
  });
});
