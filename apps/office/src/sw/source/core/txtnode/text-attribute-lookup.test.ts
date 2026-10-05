/** @fileoverview Checks literal native ranged lookup contracts,mutable owners and valid internet integration without upstream execution. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import { projectWriterTextRuns } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { GetTextAttrAt } from "./ndtxt-attribute-query";
import { GetTextAttrMode } from "../../../inc/swtypes";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { createWriterCharacterItemSet, SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { setTestCursor } from "../../../../test/wrtsh-test-helpers";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

/** Requires an actual owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing attribute lookup owner");
  return value;
}
/** Builds a concrete hint in one existing family. @param doc - Pool owner. @param which - Literal family. @param start - Inclusive start. @param end - Exclusive end. @param name - Internet identity. @returns Independent input hint. */
function hint(
  doc: SwDoc,
  which: number,
  start: number,
  end: number,
  name = "link",
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  if (which === 53)
    return new SwTextAttrEnd(
      new SwFormatAutoFormat(
        createWriterCharacterItemSet(doc.GetAttrPool(), {
          bold: true,
          italic: false,
          underline: false,
        }),
      ),
      start,
      end,
    );
  const item = new SwFormatINetFormat(name, "target");
  item.SetName(name);
  item.SetINetFormatAndId("normal", 65000 as SwPoolFormatId);
  item.SetVisitedFormatAndId("visited", 65535 as SwPoolFormatId);
  return new SwTextINetFormat(item, start, end);
}
/** Creates a real document with adjacent internet ranges; native insertion forbids nested hyperlinks. @returns Document and node. */
function linkedRanges(): { doc: SwDoc; node: SwTextNode } {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdefghij");
  node.SetTextHints(
    new SwpHints(doc.GetAttrPool(), [hint(doc, 54, 1, 3, "outer"), hint(doc, 54, 3, 6, "inner")]),
  );
  return { doc, node };
}

describe.each([53, 54])(
  "native ranged attribute lookup family %s",
  /** Registers literal endpoint contracts. @param which - Existing family. @returns Nothing. */ function familyCases(
    which,
  ): void {
    it.each([
      [0, -1, false],
      [0, 1, false],
      [0, 2, true],
      [0, 3, true],
      [0, 5, false],
      [0, 6, false],
      [0, 10, false],
      [1, -1, false],
      [1, 1, false],
      [1, 2, false],
      [1, 3, true],
      [1, 5, true],
      [1, 6, false],
      [1, 10, false],
      [2, -1, false],
      [2, 1, false],
      [2, 2, false],
      [2, 3, true],
      [2, 5, false],
      [2, 6, false],
      [2, 10, false],
    ] as const)(
      "mode %s at %s has literal membership %s",
      /** Checks actual identity without deriving expected membership from implementation. @param mode - Native literal. @param offset - Native offset. @param contained - Literal oracle. @returns Nothing. */ function boundaryCase(
        mode,
        offset,
        contained,
      ): void {
        const doc = new SwDoc(),
          node = required(doc.paragraphs[0]);
        node.SetText("abcdefghij");
        node.SetTextHints(new SwpHints(doc.GetAttrPool(), [hint(doc, which, 2, 5)]));
        const hints = required(node.GetpSwpHints()),
          actual = hints.GetSortedByWhichAndStart(0);
        expect(node.GetTextAttrAt(offset, which, mode)).toBe(contained ? actual : undefined);
        expect(actual.m_pHints).toBe(hints);
        expect(hints.Get(0)).toBe(actual);
        expect(hints.GetSortedByEnd(0)).toBe(actual);
      },
    );
  },
);

describe("native ranged pointer query ownership", /** Registers real integration boundaries. @returns Nothing. */ function ownerCases(): void {
  it("retains native mode numbers and null-before-mode behavior without allocation", /** Checks optional and allocated empty maps. @returns Nothing. */ function emptyCases(): void {
    expect([GetTextAttrMode.Default, GetTextAttrMode.Expand, GetTextAttrMode.Parent]).toEqual([
      0, 1, 2,
    ]);
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    expect(node.GetTextAttrAt(0, 54)).toBeUndefined();
    expect(node.GetTextAttrAt(0, 54, 99 as GetTextAttrMode)).toBeUndefined();
    expect(node.GetpSwpHints()).toBeUndefined();
    const empty = node.GetOrCreateSwpHints();
    expect(node.GetTextAttrAt(0, 54)).toBeUndefined();
    expect(
      /** Checks native mode assertion boundary. @returns Query result. */ () =>
        node.GetTextAttrAt(0, 54, 99 as GetTextAttrMode),
    ).toThrow("query mode");
    expect(
      /** Rejects unimplemented pointer families. @returns Query result. */ () =>
        GetTextAttrAt(undefined, 0, 52, GetTextAttrMode.Default),
    ).toThrow("query family");
    expect(node.GetpSwpHints()).toBe(empty);
  });
  it("skips expired and future ranges and stops on a later family", /** Checks the actual sorted map rather than a fake query provider. @returns Nothing. */ function sortedCases(): void {
    const doc = new SwDoc(),
      hints = new SwpHints(doc.GetAttrPool(), [
        hint(doc, 54, 1, 9),
        hint(doc, 53, 2, 4),
        hint(doc, 53, 6, 8),
      ]);
    expect(GetTextAttrAt(hints, 1, 53, GetTextAttrMode.Default)).toBeUndefined();
    expect(GetTextAttrAt(hints, 9, 53, GetTextAttrMode.Default)).toBeUndefined();
    expect(GetTextAttrAt(hints, 7, 53, GetTextAttrMode.Default)).toBe(
      hints.GetSortedByWhichAndStart(1),
    );
    expect(GetTextAttrAt(hints, 20, 54, GetTextAttrMode.Default)).toBeUndefined();
  });
  it("overwrites outer matches while preserving both internet IDs and owned backlinks", /** Checks all native interval modes on inner endpoints. @returns Nothing. */ function nestedCases(): void {
    const { node } = linkedRanges(),
      hints = required(node.GetpSwpHints()),
      outer = hints.GetSortedByWhichAndStart(0),
      inner = hints.GetSortedByWhichAndStart(1) as SwTextINetFormat;
    // Exercise the pointer traversal directly on actual mutable ranges, then restore valid nesting before projections.
    outer.SetEnd(9);
    for (const [offset, mode, expected] of [
      [3, 0, inner],
      [3, 1, outer],
      [3, 2, outer],
      [4, 0, inner],
      [6, 0, outer],
      [6, 1, inner],
      [6, 2, outer],
    ] as const)
      expect(node.GetTextAttrAt(offset, 54, mode)).toBe(expected);
    expect(node.GetTextAttrAt(4, 54)).toBe(inner);
    outer.SetEnd(3);
    expect(inner.GetTextNode()).toBe(node);
    expect(inner.format.GetTextINetFormat()).toBe(inner);
    expect(inner.format.GetHyperlink()).toEqual({
      url: "inner",
      targetFrame: "target",
      name: "inner",
      styleName: "normal",
      visitedStyleName: "visited",
    });
    expect([inner.format.GetINetFormatId(), inner.format.GetVisitedFormatId()]).toEqual([
      65000, 65535,
    ]);
    expect(node.getHyperlinkAt(5)?.url).toBe("inner");
    expect(
      projectWriterTextRuns(node).map(
        /** Reads only projected segment identity. @param run - Segment. @returns Text and active URL. */ (
          run,
        ) => [run.text, run.hyperlink?.url],
      ),
    ).toEqual([
      ["a", undefined],
      ["bc", "outer"],
      ["def", "inner"],
      ["ghij", undefined],
    ]);
  });
  it("selects opposite adjacent ranges for default and expansion boundaries", /** Checks last-match behavior at an adjacent edge. @returns Nothing. */ function adjacentCases(): void {
    const doc = new SwDoc(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcdef");
    node.SetTextHints(
      new SwpHints(doc.GetAttrPool(), [hint(doc, 54, 0, 3, "left"), hint(doc, 54, 3, 6, "right")]),
    );
    const hints = required(node.GetpSwpHints());
    expect(node.GetTextAttrAt(3, 54)).toBe(hints.GetSortedByWhichAndStart(1));
    expect(node.GetTextAttrAt(3, 54, GetTextAttrMode.Expand)).toBe(
      hints.GetSortedByWhichAndStart(0),
    );
    expect(node.GetTextAttrAt(3, 54, GetTextAttrMode.Parent)).toBeUndefined();
  });
  it("uses the inner link through the real Writer shell", /** Checks metadata and projection agree at the existing caret convention. @returns Nothing. */ function shellCase(): void {
    const { doc } = linkedRanges(),
      shell = new SwWrtShell(
        new SwDocShell(doc, createDocument({ id: "lookup", suiteId: "writer", title: "Lookup" })),
      );
    setTestCursor(shell, "p-1", 5);
    expect(shell.GetHyperlinkAtCursor()?.url).toBe("inner");
    setTestCursor(shell, "p-1", 2);
    expect(shell.GetHyperlinkAtCursor()?.url).toBe("outer");
  });
  it("restores adjacent actual owners through node copies, graph16 and Worker5", /** Checks existing transport paths retain query identities. @returns Nothing. */ function transportCase(): void {
    const { doc, node } = linkedRanges(),
      copiedDoc = new SwDoc(),
      copy = required(copiedDoc.paragraphs[0]),
      fragment = node.CaptureTextFragment(0, node.Len());
    copy.SetText(fragment.text);
    copy.SetTextHints(fragment.hints);
    for (const restored of [
      copy,
      required(decodeWriterDocument(structuredClone(encodeWriterDocument(doc))).paragraphs[0]),
      required(
        restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))).paragraphs[0],
      ),
    ]) {
      const inner = restored.GetTextAttrAt(4, 54) as SwTextINetFormat;
      expect(inner.format.GetValue()).toBe("inner");
      expect(inner.GetTextNode()).toBe(restored);
      expect(inner).not.toBe(node.GetTextAttrAt(4, 54));
      expect([inner.format.GetINetFormatId(), inner.format.GetVisitedFormatId()]).toEqual([
        65000, 65535,
      ]);
      expect(restored.getHyperlinkAt(5)?.url).toBe("inner");
    }
  });
});
