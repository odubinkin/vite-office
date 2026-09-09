/** @fileoverview Verifies Writer's document-owned pool, style collections, paragraph item sets, numbering rules, and current snapshots. */

import { describe, expect, it } from "vitest";

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import { createDocument } from "../../../../sfx2/source/doc/docfac";
import {
  RES_PARATR_ADJUST,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
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
import {
  createWriterDocument,
  normalizeWriterParagraphFormatting,
  serializeWriterDocument,
  SwDoc,
  type WriterDocument,
} from "./writer";

/** Creates one canonical Writer fixture. @param id - Document identity. @returns Writer graph. */
function createFixture(id = "writer-attrs"): WriterDocument {
  return createWriterDocument(
    createDocument({ id, suiteId: "writer", title: "Writer attributes" }),
    "p-1",
  );
}

/** Returns a deferred operation for rejection assertions. @param operation - Operation under test. @returns Same operation. */
function throwing(operation: () => unknown): () => unknown {
  return operation;
}

/** Test-only content node registered in a non-text format collection. */
class GenericContentNode extends SwContentNode {
  /** Creates a generic content node. @param nodes - Owning node array. @param section - Content section. @param format - Generic format collection. @returns Nothing. */
  public constructor(nodes: SwNodes, section: SwStartNode, format: SwFormatColl) {
    super(nodes, "generic", section, format);
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
    const defaultStyle = writer.GetDfltTextFormatColl();
    const heading = writer.GetTextFormatColl("heading-1");
    const node = writer.paragraphs[0];
    if (node === undefined) throw new Error("Writer fixture has no text node.");
    expect(pool.GetDoc()).toBe(writer);
    expect(writer.GetTextFormatColls()).toEqual([defaultStyle, heading]);
    expect(writer.FindTextFormatColl("default")).toBe(defaultStyle);
    expect(writer.FindTextFormatColl("missing" as "default")).toBeUndefined();
    expect(
      throwing(
        /** Reads a missing style. @returns Missing style. */ () =>
          writer.GetTextFormatColl("missing" as "default"),
      ),
    ).toThrow("Unknown SwTextFormatColl");
    expect(heading.DerivedFrom()).toBe(defaultStyle);
    expect(defaultStyle.IsAuto()).toBe(false);
    expect(node.GetFormatColl()).toBe(defaultStyle);
    expect(node.GetTextFormatColl()).toBe(defaultStyle);
    expect(node.GetSwAttrSet()).toBe(defaultStyle.GetAttrSet());
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(node.HasSwAttrSet()).toBe(false);
    expect(node.alignment).toBe("left");
    expect(defaultStyle.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center))).toBe(true);
    expect(defaultStyle.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center))).toBe(false);
    expect(node.alignment).toBe("center");
    node.ChgFormatColl(heading);
    expect(node.alignment).toBe("center");
    expect(node.SetAttr(new SvxAdjustItem(SvxAdjust.Right))).toBe(true);
    expect(node.SetAttr(new SvxAdjustItem(SvxAdjust.Right))).toBe(false);
    expect(node.HasSwAttrSet()).toBe(true);
    expect(node.GetpSwAttrSet()?.GetParent()).toBe(heading.GetAttrSet());
    expect(node.GetAttr(RES_PARATR_ADJUST)).toMatchObject({});
    expect(node.alignment).toBe("right");
    expect(node.ResetAttr(RES_PARATR_LIST_LEVEL)).toBe(false);
    expect(node.ResetAttr(RES_PARATR_ADJUST)).toBe(true);
    expect(node.HasSwAttrSet()).toBe(false);
    expect(node.alignment).toBe("center");
    expect(node.ResetAttr(RES_PARATR_ADJUST)).toBe(false);
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
    expect(format.SetFormatAttr(new SvxAdjustItem(SvxAdjust.Block))).toBe(true);
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
    expect(heading.GetNextTextFormatColl()).toBe(heading);
    heading.SetNextTextFormatColl(parent);
    expect(heading.GetNextTextFormatColl()).toBe(parent);
    expect(parent.toSnapshot()).not.toHaveProperty("parentId");
    expect(heading.toSnapshot()).toMatchObject({ id: "heading-1", parentId: "default" });
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
    set.Put(new SwNumRuleItem("Rule"));
    const populated = set.CloneAsValue();
    const empty = set.CloneAsValue(false);
    expect(populated).toBeInstanceOf(SwAttrSet);
    expect(populated.toSnapshot()).toEqual(set.toSnapshot());
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
    style.SetFormatAttr(new SvxWeightItem(FontWeight.BOLD));
    style.SetFormatAttr(new SvxPostureItem(FontItalic.NORMAL));
    style.SetFormatAttr(new SvxUnderlineItem(FontLineStyle.SINGLE));
    expect(style.GetAttrSet().GetWeight().GetBoolValue()).toBe(true);
    expect(style.GetAttrSet().GetPosture().GetBoolValue()).toBe(true);
    expect(style.GetAttrSet().GetUnderline().GetBoolValue()).toBe(true);
    node.InsertText("ab", 0);
    expect(node.runs).toEqual([
      { attributes: { bold: true, italic: true, underline: true }, text: "ab" },
    ]);
    expect(node.GetpSwpHints()).toBeUndefined();
    node.ReplaceRange(0, 1, [
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
    ]);
    expect(node.runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "a" },
      { attributes: { bold: true, italic: true, underline: true }, text: "b" },
    ]);
    const handle = node.GetpSwpHints()?.Get(0).format.GetStyleHandle();
    expect(handle?.Get(RES_CHRATR_WEIGHT)).toBeInstanceOf(SvxWeightItem);
    expect(handle?.Get(RES_CHRATR_POSTURE)).toBeInstanceOf(SvxPostureItem);
    expect(handle?.Get(RES_CHRATR_UNDERLINE)).toBeInstanceOf(SvxUnderlineItem);
    const restored = writer.clone();
    expect(restored.paragraphs[0]?.runs).toEqual(node.runs);
    expect(restored.paragraphs[0]?.GetpSwpHints()?.Get(0).format).not.toBe(
      node.GetpSwpHints()?.Get(0).format,
    );
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
    expect(stored.clone().toSnapshot()).toEqual(stored.toSnapshot());
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
    node.SetParagraphList({ kind: "numbered", level: 2, styleId: "Outline" });
    expect(node.list).toEqual({ kind: "numbered", level: 2, styleId: "Outline" });
    expect(node.GetSwAttrSet().GetItemState(RES_PARATR_NUMRULE)).toBe(SfxItemState.SET);
    expect((node.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue()).toBe("Outline");
    expect((node.GetAttr(RES_PARATR_LIST_LEVEL) as SfxInt16Item).GetValue()).toBe(2);
    node.SetParagraphList({ kind: "none", level: 2, styleId: "Outline" });
    expect(node.list).toEqual({ kind: "none", level: 2, styleId: "Outline" });
    node.SetParagraphList({ kind: "none", level: 0 });
    expect(node.list).toEqual({ kind: "none", level: 0 });
    expect((node.GetAttr(RES_PARATR_NUMRULE) as SwNumRuleItem).GetValue()).toBe("");
    node.SetAttr(new SwNumRuleItem("Missing rule"));
    expect(node.list).toEqual({ kind: "none", level: 0 });
    node.SetParagraphList({ kind: "numbered", level: 0, styleId: "Custom" });
    node.SetParagraphList({ kind: "bullet", level: 0, styleId: "Custom" });
    expect(node.GetNumRuleName()).toBe("__WriterDefaultBullet");
    node.SetListId("");
    expect(node.GetListId()).toBe("__WriterDefaultBullet");
    node.SetNumRule("");
    expect(node.GetListId()).toBe("");
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
    expect(
      throwing(
        /** Restores an invalid rule format. @returns Invalid rule. */ () =>
          SwNumRule.fromSnapshot({
            formats: Array.from(
              { length: 10 },
              /** Creates an invalid format snapshot. @returns Invalid format. */ () => ({
                kind: "none" as "bullet",
              }),
            ),
            listId: "id",
            name: "Rule",
          }),
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
    writer.GetDfltTextFormatColl().SetFormatAttr(new SvxAdjustItem(SvxAdjust.Center));
    writer.GetTextFormatColl("heading-1").SetFormatName("Custom heading");
    node.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    node.SetParagraphAlignment("right");
    node.SetParagraphList({ kind: "bullet", level: 1, styleId: "Bullets" });
    const snapshot = serializeWriterDocument(writer);
    expect(snapshot).toMatchObject({ swModelVersion: 3 });
    expect(snapshot.textNodes[0]).toMatchObject({ formatCollId: "heading-1", text: "" });
    expect(snapshot.textNodes[0]).not.toHaveProperty("alignment");
    const restored = normalizeWriterParagraphFormatting(snapshot);
    expect(restored).not.toBe(writer);
    expect(serializeWriterDocument(restored)).toEqual(snapshot);
    expect(restored.GetAttrPool()).not.toBe(writer.GetAttrPool());
    expect(restored.GetTextFormatColl("heading-1").GetName()).toBe("Custom heading");
    expect(restored.paragraphs[0]).toMatchObject({ alignment: "right", style: "heading-1" });
    expect(restored.paragraphs[0]?.list).toEqual({ kind: "bullet", level: 1, styleId: "Bullets" });
    const copied = new SwDoc(
      createDocument({ id: "writer-copy", suiteId: "writer", title: "Writer copy" }),
    );
    copied.nodes.copyContentFrom(restored.nodes);
    expect(copied.paragraphs[0]?.toSnapshot()).toEqual(restored.paragraphs[0]?.toSnapshot());
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
