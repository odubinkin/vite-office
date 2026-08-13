/** @fileoverview Verifies Writer list serialization and legacy normalization at the `list.cxx`-derived document boundary. */

import { describe, expect, it } from "vitest";

import {
  createDefaultWriterParagraphList,
  isWriterParagraphListKind,
  normalizeWriterParagraphList,
} from "./list";

describe("Writer list state" /** Groups serializable list-state tests. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterListTests(): void {
  it("creates and recognizes the bounded default Writer list kinds" /** Verifies the executable list enum accepts only current commands. @returns Nothing; assertions cover valid and invalid runtime values. */, function createsAndRecognizesKinds(): void {
    expect(createDefaultWriterParagraphList()).toEqual({ kind: "none", level: 0 });
    expect(isWriterParagraphListKind("none")).toBe(true);
    expect(isWriterParagraphListKind("bullet")).toBe(true);
    expect(isWriterParagraphListKind("numbered")).toBe(true);
    expect(isWriterParagraphListKind("outline")).toBe(false);
    expect(isWriterParagraphListKind(undefined)).toBe(false);
  });

  it("normalizes legacy and malformed list metadata without losing valid future fields" /** Verifies browser-local snapshots retain serializable valid fields and default invalid candidates. @returns Nothing; assertions cover normalization branches. */, function normalizesListMetadata(): void {
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
});
