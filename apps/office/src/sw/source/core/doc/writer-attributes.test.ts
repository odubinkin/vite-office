/** @fileoverview Verifies Writer's document-owned pool, style collections, paragraph item sets, numbering rules, and current snapshots. */

import { describe, expect, it } from "vitest";
import { encodeSfxItemSet, encodeSfxPoolItem } from "./item-codec";
import {
  decodeWriterDocument,
  decodeWriterDocument as normalizeWriterParagraphFormatting,
  encodeWriterDocument,
  encodeWriterDocument as serializeWriterDocument,
} from "./writer-document-codec";
import { createWriterTextFragment, projectWriterTextRuns } from "../txtnode/text-run-projection";
import { applyWriterParagraphList, projectWriterParagraphList } from "./list";

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxLineSpacingItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import {
  RES_PARATR_ADJUST,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_LINESPACING,
  RES_UL_SPACE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
  RES_CHRATR_FONT,
  WRITER_TEXT_NODE_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwFormat } from "../attr/format";
import { SwAttrSet } from "../attr/swatrset";
import { SwContentNode } from "../docnode/node";
import type { SwStartNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import { SwNumRuleItem } from "../para/paratr";
import { SwFormatColl } from "./fmtcol";
import { SwNumFormat, SwNumRule } from "./number";
import { createSwFormatAutoFormat, SwFormatAutoFormat, SwTextAttr } from "../txtnode/txatbase";
import { SwpHints } from "../txtnode/ndhints";
import { createWriterDocument, SwDoc, type SwDoc as WriterDocument } from "./doc";

/** Creates one canonical Writer fixture. @param id - Document identity. @returns Writer graph. */
function createFixture(id = "writer-attrs"): WriterDocument {
  void id;
  return createWriterDocument();
}

/** Returns a deferred operation for rejection assertions. @param operation - Operation under test. @returns Same operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

/** Test-only content node registered in a non-text format collection. */
class GenericContentNode extends SwContentNode {
  /** Creates a generic content node. @param nodes - Owning node array. @param section - Content section. @param format - Generic format collection. @returns Nothing. */
  public constructor(nodes: SwNodes, section: SwStartNode, format: SwFormatColl) {
    super(nodes, section, format);
  }

  /** Returns its empty test content length. @returns Zero. */
  public Len(): number {
    return 0;
  }
}

describe("Writer attribute ownership" /** Groups SwAttrPool, SwAttrSet, and format inheritance tests. @returns Nothing; Vitest registers tests. */, function defineWriterAttributeTests(): void {
  it("owns pool defaults and resolves collection inheritance through lazy node deltas" /** Verifies the canonical SwDoc → style → content-node item path. @returns Nothing; assertions inspect ownership and state. */, function resolvesWriterAttributes(): void {
    const writer = createFixture();
    const pool = writer.GetAttrPool();
    const font = new SvxFontItem("Noto Serif", RES_CHRATR_FONT);
    expect(font.GetFamilyName()).toBe("Noto Serif");
    expect(font.Clone()).toEqual(font);
    expect(font.equals(new SvxFontItem("Noto Serif", RES_CHRATR_FONT))).toBe(true);
    expect(font.equals(new SvxFontItem("Noto Sans", RES_CHRATR_FONT))).toBe(false);
    expect(encodeSfxPoolItem(font)).toEqual({
      value: "Noto Serif",
      which: RES_CHRATR_FONT,
    });
    expect(pool.CreateItem(encodeSfxPoolItem(font))).toEqual(font);
    expect(pool.CreateItem({ value: true, which: RES_PARATR_LIST_ISRESTART })).toEqual(
      new SfxBoolItem(RES_PARATR_LIST_ISRESTART, true),
    );
    expect(pool.CreateItem({ value: 6, which: RES_PARATR_LIST_RESTARTVALUE })).toEqual(
      new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, 6),
    );
    expect(pool.CreateItem({ value: false, which: RES_PARATR_LIST_ISCOUNTED })).toEqual(
      new SfxBoolItem(RES_PARATR_LIST_ISCOUNTED, false),
    );
    expect(
      /** Rejects a blank font. @returns Invalid item. */ () => new SvxFontItem(" ", 1),
    ).toThrow("invalid");
    const defaultStyle = writer.GetDfltTextFormatColl();
    const heading = writer.GetTextFormatColl("heading-1");
    const headingBase = writer.GetTextFormatColl("heading");
    const textBody = writer.GetTextFormatColl("text-body");
    const node = writer.paragraphs[0];
    if (node === undefined) throw new Error("Writer fixture has no text node.");
    expect(pool.GetDoc()).toBe(writer);
    expect(writer.GetTextFormatColls()).toEqual([defaultStyle, headingBase, textBody, heading]);
    expect(writer.FindTextFormatColl("default")).toBe(defaultStyle);
    expect(writer.FindTextFormatColl("missing" as "default")).toBeUndefined();
    expect(
      throwing(
        /** Reads a missing style. @returns Missing style. */ () =>
          writer.GetTextFormatColl("missing" as "default"),
      ),
    ).toThrow("Unsupported SwTextFormatColl");
    expect(heading.DerivedFrom()).toBe(headingBase);
    expect(defaultStyle.IsAuto()).toBe(false);
    expect(node.GetFormatColl()).toBe(defaultStyle);
    expect(node.GetTextFormatColl()).toBe(defaultStyle);
    expect(node.GetSwAttrSet()).toBe(defaultStyle.GetAttrSet());
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(node.HasSwAttrSet()).toBe(false);
    expect(node.GetParagraphAlignment()).toBe("left");
    expect(defaultStyle.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST))).toBe(
      true,
    );
    expect(defaultStyle.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST))).toBe(
      false,
    );
    expect(node.GetParagraphAlignment()).toBe("center");
    node.ChgFormatColl(heading);
    expect(node.GetParagraphAlignment()).toBe("center");
    expect(node.SetAttr(new SvxAdjustItem(SvxAdjust.Right, RES_PARATR_ADJUST))).toBe(true);
    expect(node.SetAttr(new SvxAdjustItem(SvxAdjust.Right, RES_PARATR_ADJUST))).toBe(false);
    expect(node.HasSwAttrSet()).toBe(true);
    expect(node.GetpSwAttrSet()?.GetParent()).toBe(heading.GetAttrSet());
    expect(node.GetAttr(RES_PARATR_ADJUST)).toMatchObject({});
    expect(node.GetParagraphAlignment()).toBe("right");
    expect(node.ResetAttr(RES_PARATR_LIST_LEVEL)).toBe(false);
    expect(node.ResetAttr(RES_PARATR_ADJUST)).toBe(true);
    expect(node.HasSwAttrSet()).toBe(false);
    expect(node.GetParagraphAlignment()).toBe("center");
    expect(node.ResetAttr(RES_PARATR_ADJUST)).toBe(false);
    expect(node.ResetAllAttr()).toBe(0);
    expect(node.SetAttr(new SfxItemSet(pool, WRITER_TEXT_NODE_WHICH_RANGES))).toBe(false);
    expect(node.HasSwAttrSet()).toBe(true);
    expect(node.ResetAllAttr()).toBe(0);
    node.SetAttr(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 4));
    expect(node.ResetAllAttr()).toBe(1);
    expect(node.HasSwAttrSet()).toBe(false);
  });

  it("supports SwFormat mutation, derivation, cloning, and collection follow links" /** Covers format APIs and their ownership guards. @returns Nothing; assertions inspect direct deltas. */, function mutatesFormats(): void {
    const writer = createFixture();
    const pool = writer.GetAttrPool();
    const parent = writer.GetDfltTextFormatColl();
    const heading = writer.GetTextFormatColl("heading-1");
    const textBody = writer.GetTextFormatColl("text-body");
    const format = new SwFormat(pool, "Automatic", WRITER_TEXT_NODE_WHICH_RANGES, parent);
    expect(format.GetName()).toBe("Automatic");
    format.SetFormatName("Changed");
    expect(format.GetName()).toBe("Changed");
    expect(format.DerivedFrom()).toBe(parent);
    expect(format.SetDerivedFrom(parent)).toBe(false);
    expect(format.SetDerivedFrom(undefined)).toBe(true);
    expect(format.IsAuto()).toBe(true);
    format.SetAuto(false);
    expect(format.IsAuto()).toBe(false);
    expect(format.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Block, RES_PARATR_ADJUST))).toBe(true);
    const source = new SfxItemSet(pool, WRITER_TEXT_NODE_WHICH_RANGES);
    source.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, 3));
    expect(format.SetFormatAttrSet(source)).toBe(true);
    expect(format.SetFormatAttrSet(source)).toBe(false);
    expect(format.ResetFormatAttr(RES_PARATR_NUMRULE)).toBe(false);
    expect(format.ResetFormatAttr(RES_PARATR_ADJUST)).toBe(true);
    expect(format.ResetAllFormatAttr()).toBe(1);
    expect(format.ResetAllFormatAttr()).toBe(0);
    expect(
      throwing(
        /** Gives a format a blank name. @returns Nothing. */ () => format.SetFormatName(" "),
      ),
    ).toThrow("must not be blank");
    expect(
      throwing(
        /** Derives a format from itself. @returns Nothing. */ () => format.SetDerivedFrom(format),
      ),
    ).toThrow("itself");
    const other = createFixture("writer-other");
    expect(
      throwing(
        /** Derives across document pools. @returns Nothing. */ () =>
          format.SetDerivedFrom(other.GetDfltTextFormatColl()),
      ),
    ).toThrow("another pool");
    expect(heading.GetNextTextFormatColl()).toBe(textBody);
    heading.SetNextTextFormatColl(parent);
    expect(heading.GetNextTextFormatColl()).toBe(parent);
    expect(parent.DerivedFrom()).toBeUndefined();
    expect((heading.DerivedFrom() as SwFormatColl).GetName()).toBe("Heading");
  });

  it("specializes SwAttrSet and guards content-node collection ownership" /** Covers Writer typed accessors, clones, and content-format type checks. @returns Nothing; assertions inspect subtype behavior. */, function specializesWriterSets(): void {
    const writer = createFixture();
    const pool = writer.GetAttrPool();
    const set = new SwAttrSet(pool, WRITER_TEXT_NODE_WHICH_RANGES);
    expect(set.GetPool()).toBe(pool);
    expect(set.GetDoc()).toBe(writer);
    expect(set.GetAdjust().GetAdjust()).toBe(SvxAdjust.ParaStart);
    expect(set.GetAdjust(false).GetAdjust()).toBe(SvxAdjust.ParaStart);
    expect(set.GetNumRule().GetValue()).toBe("");
    expect(set.GetNumRule(false).GetValue()).toBe("");
    const numRuleItem = new SwNumRuleItem("Rule");
    expect(numRuleItem.Clone()).toEqual(numRuleItem);
    expect(numRuleItem.equals(new SwNumRuleItem("Rule"))).toBe(true);
    expect(numRuleItem.equals(new SfxStringItem(RES_PARATR_NUMRULE, "Rule"))).toBe(false);
    expect(pool.CreateItem({ value: 1134, which: RES_MARGIN_TEXTLEFT })).toEqual(
      new SvxTextLeftMarginItem(1134, RES_MARGIN_TEXTLEFT),
    );
    set.Put(new SwNumRuleItem("Rule"));
    const populated = set.CloneAsValue();
    const empty = set.CloneAsValue(false);
    expect(populated).toBeInstanceOf(SwAttrSet);
    expect(encodeSfxItemSet(populated)).toEqual(encodeSfxItemSet(set));
    expect(empty.Count()).toBe(0);
    const genericFormat = new SwFormatColl(pool, "Generic");
    const genericNode = new GenericContentNode(
      writer.nodes,
      writer.nodes.GetEndOfContent().StartOfSectionNode(),
      genericFormat,
    );
    expect(
      throwing(
        /** Reads a text collection from a generic node. @returns Missing text style. */ () =>
          genericNode.GetTextFormatColl(),
      ),
    ).toThrow("not registered");
    expect(genericNode.ChgFormatColl(genericFormat)).toBe(genericFormat);
    const other = createFixture("writer-other-node");
    expect(
      throwing(
        /** Registers a foreign style on a node. @returns Prior style. */ () =>
          genericNode.ChgFormatColl(other.GetDfltTextFormatColl()),
      ),
    ).toThrow("another document");
    expect(
      throwing(
        /** Constructs a node with a foreign style. @returns Invalid node. */ () =>
          new GenericContentNode(
            writer.nodes,
            writer.nodes.GetEndOfContent().StartOfSectionNode(),
            other.GetDfltTextFormatColl(),
          ),
      ),
    ).toThrow("another document");
  });

  it("inherits pooled character items and stores only range deltas in auto formats" /** Verifies style-to-node-to-hint character lookup. @returns Nothing. */, function inheritsCharacterItems(): void {
    const writer = createFixture();
    const style = writer.GetDfltTextFormatColl();
    const node = writer.paragraphs[0];
    if (node === undefined) throw new Error("Writer fixture has no text node.");
    style.SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    style.SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL, RES_CHRATR_POSTURE));
    style.SetFormatAttr(new SvxUnderlineItem(FontLineStyle.SINGLE, RES_CHRATR_UNDERLINE));
    expect(style.GetAttrSet().GetWeight().GetBoolValue()).toBe(true);
    expect(style.GetAttrSet().GetPosture().GetBoolValue()).toBe(true);
    expect(style.GetAttrSet().GetUnderline().GetBoolValue()).toBe(true);
    node.InsertText("ab", 0);
    expect(projectWriterTextRuns(node)).toEqual([
      { attributes: { bold: true, italic: true, underline: true }, text: "ab" },
    ]);
    expect(node.GetpSwpHints()).toBeUndefined();
    node.ReplaceRange(
      0,
      1,
      createWriterTextFragment(node, [
        { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      ]),
    );
    expect(projectWriterTextRuns(node)).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      { attributes: { bold: true, italic: true, underline: true }, text: "b" },
    ]);
    const format = node.GetpSwpHints()?.Get(0).format;
    expect(format).toBeInstanceOf(SwFormatAutoFormat);
    const handle = format instanceof SwFormatAutoFormat ? format.GetStyleHandle() : undefined;
    expect(handle?.Get(RES_CHRATR_WEIGHT)).toBeInstanceOf(SvxWeightItem);
    expect(handle?.Get(RES_CHRATR_POSTURE)).toBeInstanceOf(SvxPostureItem);
    expect(handle?.Get(RES_CHRATR_UNDERLINE)).toBeInstanceOf(SvxUnderlineItem);
    node.SetHyperlink(0, 1, { url: "https://example.test" });
    const restored = decodeWriterDocument(encodeWriterDocument(writer));
    expect(projectWriterTextRuns(restored.paragraphs[0])).toEqual(projectWriterTextRuns(node));
    expect(restored.paragraphs[0]?.GetpSwpHints()?.Get(0).format).not.toBe(
      node.GetpSwpHints()?.Get(0).format,
    );
    expect(
      /** Installs a hint beyond canonical text. @returns Invalid operation. */ () =>
        node.SetTextHints(
          new SwpHints(writer.GetAttrPool(), [
            new SwTextAttr(
              createSwFormatAutoFormat(writer.GetAttrPool(), {
                bold: true,
                italic: false,
                underline: false,
              }),
              0,
              node.Len() + 1,
            ),
          ]),
        ),
    ).toThrow("outside the text node");
  });
});

describe("Writer numbering rules and snapshots" /** Groups document tables and current-schema tests. @returns Nothing; Vitest registers tests. */, function defineWriterPersistenceTests(): void {
  it("owns numbering rules and stores list properties as paragraph items" /** Verifies rule-table and RES_PARATR_* relationships. @returns Nothing; assertions inspect table and item state. */, function storesNumberingRules(): void {
    const writer = createFixture();
    const node = writer.paragraphs[0];
    if (node === undefined) throw new Error("Writer fixture has no text node.");
    const rule = new SwNumRule("List 1", "numbered", "list-id-1");
    const stored = writer.AddNumRule(rule);
    expect(stored).not.toBe(rule);
    expect(stored.GetName()).toBe("List 1");
    expect(stored.GetKind()).toBe("numbered");
    expect(stored.GetDefaultListId()).toBe("list-id-1");
    expect(stored.clone()).not.toBe(stored);
    expect(stored.clone()).toMatchObject({});
    expect(stored.clone().GetDefaultListId()).toBe(stored.GetDefaultListId());
    expect(writer.FindNumRulePtr("List 1")).toBe(stored);
    expect(writer.FindNumRulePtr("missing")).toBeUndefined();
    expect(writer.GetNumRuleTable()).toEqual([stored]);
    expect(writer.EnsureNumRule("List 1", "numbered")).toBe(stored);
    expect(
      throwing(
        /** Resolves an incompatible existing rule. @returns Invalid rule. */ () =>
          writer.EnsureNumRule("List 1", "bullet"),
      ),
    ).toThrow("different format");
    expect(
      throwing(
        /** Adds a duplicate rule. @returns Duplicate rule. */ () =>
          writer.AddNumRule(new SwNumRule("List 1", "bullet")),
      ),
    ).toThrow("Duplicate");
    applyWriterParagraphList(node, { kind: "numbered", level: 2, styleId: "Outline" });
    expect(projectWriterParagraphList(node)).toEqual({
      kind: "numbered",
      level: 2,
      styleId: "Outline",
    });
    expect(node.GetSwAttrSet().GetItemState(RES_PARATR_NUMRULE)).toBe(SfxItemState.SET);
    expect((node.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue()).toBe("Outline");
    expect((node.GetAttr(RES_PARATR_LIST_LEVEL) as SfxInt16Item).GetValue()).toBe(2);
    applyWriterParagraphList(node, { kind: "none", level: 2, styleId: "Outline" });
    expect(projectWriterParagraphList(node)).toEqual({
      kind: "none",
      level: 2,
      styleId: "Outline",
    });
    applyWriterParagraphList(node, { kind: "none", level: 0 });
    expect(projectWriterParagraphList(node)).toEqual({ kind: "none", level: 0 });
    expect((node.GetAttr(RES_PARATR_NUMRULE) as SwNumRuleItem).GetValue()).toBe("");
    node.SetAttr(new SwNumRuleItem("Missing rule"));
    expect(projectWriterParagraphList(node)).toEqual({ kind: "none", level: 0 });
    applyWriterParagraphList(node, { kind: "numbered", level: 0, styleId: "Custom" });
    applyWriterParagraphList(node, { kind: "bullet", level: 0, styleId: "Custom" });
    const automaticRuleName = node.GetNumRuleName();
    expect(automaticRuleName).toBe("List 2");
    expect(writer.FindNumRulePtr(automaticRuleName)?.IsAutoRule()).toBe(true);
    node.SetListId("");
    expect(node.GetListId()).toBe("list1");
    node.SetNumRule("");
    expect(node.GetListId()).toBe("");
    expect(node.GetListItemNumber()).toBeUndefined();
    node.SetListId("orphan");
    expect(node.GetListItemNumber()).toBeUndefined();
    for (const level of [-1, 0.5, 10])
      expect(
        /** Assigns an invalid list level. @returns Nothing. */ () => node.SetAttrListLevel(level),
      ).toThrow("outside 0-9");
    expect(
      throwing(
        /** Creates a blank rule name. @returns Invalid rule. */ () => new SwNumRule(" ", "bullet"),
      ),
    ).toThrow("must not be blank");
    expect(
      throwing(
        /** Creates a blank list identity. @returns Invalid rule. */ () =>
          new SwNumRule("Rule", "bullet", " "),
      ),
    ).toThrow("must not be blank");
    expect(
      throwing(
        /** Creates an invalid rule kind. @returns Invalid rule. */ () =>
          new SwNumRule("Rule", "none" as "bullet"),
      ),
    ).toThrow("bullet or numbered");
    const mixedFormats = Array.from(
      { length: 10 },
      /** Creates a per-level numbering format. @param _unused - Unused array slot. @param level - Zero-based level. @returns Numbering format. */
      (_unused, level) => new SwNumFormat(level === 1 ? "bullet" : "numbered"),
    );
    const mixedRule = new SwNumRule("Mixed", mixedFormats, "mixed-id");
    expect(mixedRule.GetNumFormat(0).GetKind()).toBe("numbered");
    expect(mixedRule.GetNumFormat(1).GetKind()).toBe("bullet");
    expect(
      throwing(
        /** Reads a format beyond Writer's level table. @returns Invalid format. */ () =>
          mixedRule.GetNumFormat(10),
      ),
    ).toThrow("outside 0-9");
  });

  it("round-trips item-backed styles, direct attributes, and document rules" /** Verifies current snapshots preserve the canonical ownership graph. @returns Nothing; assertions inspect an independent clone. */, function roundTripsCurrentVersion(): void {
    const writer = createFixture();
    const node = writer.paragraphs[0];
    if (node === undefined) throw new Error("Writer fixture has no text node.");
    writer
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center, RES_PARATR_ADJUST));
    writer.GetTextFormatColl("heading-1").SetFormatName("Custom heading");
    node.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    node.SetParagraphAlignment("right");
    applyWriterParagraphList(node, { kind: "bullet", level: 1, styleId: "Bullets" });
    const snapshot = serializeWriterDocument(writer);
    expect(snapshot).toMatchObject({ swModelVersion: 14 });
    expect(snapshot.textNodes[0]).toMatchObject({
      formatCollId: "heading-1",
      hints: [],
      text: "",
    });
    expect(snapshot.textNodes[0]).not.toHaveProperty("alignment");
    const restored = normalizeWriterParagraphFormatting(snapshot);
    expect(restored).not.toBe(writer);
    expect(serializeWriterDocument(restored)).toEqual(snapshot);
    expect(restored.GetAttrPool()).not.toBe(writer.GetAttrPool());
    expect(restored.GetTextFormatColl("heading-1").GetName()).toBe("Custom heading");
    expect(restored.paragraphs[0]?.GetParagraphAlignment()).toBe("right");
    expect(restored.paragraphs[0]?.GetParagraphStyle()).toBe("heading-1");
    expect(
      projectWriterParagraphList(restored.paragraphs[0] as import("../txtnode/ndtxt").SwTextNode),
    ).toEqual({
      kind: "bullet",
      level: 1,
      styleId: "Bullets",
    });
    const copied = new SwDoc();
    copied.nodes.copyContentFrom(restored.nodes);
    expect(projectWriterTextRuns(copied.paragraphs[1])).toEqual(
      projectWriterTextRuns(restored.paragraphs[0]),
    );
    const copiedWithRule = new SwDoc();
    copiedWithRule.AddNumRule(restored.GetNumRuleTable()[0] as SwNumRule);
    copiedWithRule.nodes.copyContentFrom(restored.nodes);
    expect(
      projectWriterParagraphList(
        copiedWithRule.paragraphs[1] as import("../txtnode/ndtxt").SwTextNode,
      ),
    ).toEqual(
      projectWriterParagraphList(restored.paragraphs[0] as import("../txtnode/ndtxt").SwTextNode),
    );
  });

  it("persists contextual spacing and Writer line-spacing modes", /** Checks pooled item compatibility across snapshots. @returns Nothing. */ () => {
    const writer = createWriterDocument();
    const node = writer.paragraphs[0] as NonNullable<(typeof writer.paragraphs)[number]>;
    node.SetAttr(new SvxULSpaceItem(240, 120, RES_UL_SPACE, true));
    node.SetAttr(new SvxLineSpacingItem(360, RES_PARATR_LINESPACING, "fixed", true));
    const restored = decodeWriterDocument(encodeWriterDocument(writer))
      .paragraphs[0] as typeof node;
    expect((restored.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([240, 120, 1]);
    expect((restored.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).QueryValue()).toEqual([
      1, 360, 1,
    ]);
    const pool = writer.GetAttrPool();
    expect(
      (pool.CreateItem({ which: RES_UL_SPACE, value: [240, 120] }) as SvxULSpaceItem).GetContext(),
    ).toBe(false);
    expect(
      (
        pool.CreateItem({ which: RES_PARATR_LINESPACING, value: 115 }) as SvxLineSpacingItem
      ).GetPropLineSpace(),
    ).toBe(115);
    expect(
      /** Rejects an invalid stored line mode. @returns Invalid item. */ () =>
        pool.CreateItem({ which: RES_PARATR_LINESPACING, value: [9, 100, 0] }),
    ).toThrow("Stored Writer line-spacing mode is invalid");
  });

  it("rejects obsolete snapshot schemas instead of preserving pre-canonical models" /** Keeps the core contract limited to the current LO-shaped schema. @returns Nothing. */, function rejectsObsoleteSchemas(): void {
    for (const obsolete of [
      { document: {}, paragraphs: [] },
      { document: {}, swModelVersion: 1, textNodes: [] },
      { document: {}, numRules: [], swModelVersion: 2, textFormatCollections: [], textNodes: [] },
    ])
      expect(
        throwing(
          /** Restores an obsolete saved-document schema. @returns Invalid document. */ () =>
            normalizeWriterParagraphFormatting(obsolete),
        ),
      ).toThrow("schema is unsupported");
  });
});
