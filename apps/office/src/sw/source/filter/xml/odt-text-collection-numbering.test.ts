/** @fileoverview Exercises collection numbering transitions after real ODT import, through Worker graph transfer, undo and ODT reopen. */
import { expect, it, vi } from "vitest";
import { SwNumRuleType } from "../../core/doc/number";
import { SwDoc } from "../../core/doc/doc";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";

/** Returns the required fixture paragraph. @param document - Fixture graph. @returns First text node. */
function firstParagraph(document: SwDoc) {
  const node = document.paragraphs[0];
  if (node === undefined) throw new Error("Style fixture has no paragraph.");
  return node;
}

it("restores actual outline assignments and direct items while migrating absent legacy heading state", /** Verifies separate assignment and item ownership plus graph-v16 backward compatibility. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const heading = doc.GetTextFormatColl("heading-4");
  heading.DeleteAssignmentToListLevelOfOutlineStyle();
  const plain = doc.GetDfltTextFormatColl();
  plain.AssignToListLevelOfOutlineStyle(2);
  const record = encodeWriterDocument(doc),
    restored = decodeWriterDocument(record);
  expect(restored.GetTextFormatColl("heading-4").IsAssignedToListLevelOfOutlineStyle()).toBe(false);
  expect(restored.GetDfltTextFormatColl().IsAssignedToListLevelOfOutlineStyle()).toBe(true);
  expect(restored.GetDfltTextFormatColl().GetAssignedOutlineStyleLevel()).toBe(2);
  expect(encodeWriterDocument(restored)).toEqual(record);
  heading.AssignToListLevelOfOutlineStyle(3);
  heading.SetAttrOutlineLevel(0);
  expect(
    decodeWriterDocument(encodeWriterDocument(doc))
      .GetTextFormatColl("heading-4")
      .GetAssignedOutlineStyleLevel(),
  ).toBe(-1);
  heading.ResetFormatAttr(80);
  const absent = encodeWriterDocument(doc);
  expect(encodeWriterDocument(decodeWriterDocument(absent))).toEqual(absent);
  const defaults = new SwDoc();
  defaults.GetTextFormatColl("heading-4");
  const current = encodeWriterDocument(defaults);
  const legacy = {
    ...current,
    textFormatCollections: current.textFormatCollections.map(
      /** Models the prior graph before source-owned outline items or assignment fields. @param style - Current style. @returns Existing graph record. */
      ({ outlineAssignment, ...style }) => {
        void outlineAssignment;
        return {
          ...style,
          items: style.items.filter(
            /** Drops only the newly implemented outline item. @param item - Stored item. @returns Whether legacy. */
            (item) => item.which !== 80,
          ),
        };
      },
    ),
  };
  expect(
    decodeWriterDocument(legacy).GetTextFormatColl("heading-4").GetAssignedOutlineStyleLevel(),
  ).toBe(3);
  const retained = {
    ...current,
    textFormatCollections: current.textFormatCollections.map(
      /** Removes only the optional assignment field while retaining native outline items. @param style - Stored style. @returns Compatible record. */
      ({ outlineAssignment, ...style }) => {
        void outlineAssignment;
        return style;
      },
    ),
  };
  expect(
    decodeWriterDocument(retained).GetTextFormatColl("heading-4").GetAssignedOutlineStyleLevel(),
  ).toBe(3);
  expect(
    /** Rejects malformed assignment metadata at the graph boundary. @returns Restored document if unexpectedly accepted. */ () =>
      decodeWriterDocument({
        ...current,
        textFormatCollections: current.textFormatCollections.map(
          /** Supplies an invalid optional flag at the browser graph boundary. @param style - Stored style. @returns Invalid test value. */
          (style) => ({ ...style, outlineAssignment: "bad" }),
        ),
      }),
  ).toThrow("outline assignment is invalid");
});

it("preserves synthesized empty-list intent across copying and Worker transfer without inferring explicit suppression", /** Verifies the marker baseline and backward-compatible absent state. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = firstParagraph(doc);
  doc.EnsureNumRule("Counters", "numbered");
  doc.EnsureNumRule("Bullets", "bullet");
  const numbered = doc.GetTextFormatColl("text-body"),
    bullets = doc.GetTextFormatColl("heading");
  numbered.SetFormatAttr(new SwNumRuleItem("Counters"));
  bullets.SetFormatAttr(new SwNumRuleItem("Bullets"));
  node.ChgFormatColl(numbered);
  node.SetAttrOutlineLevel(4);
  node.ChgFormatColl(doc.GetDfltTextFormatColl());
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  const copied = node.CloneTo(doc.GetNodes());
  expect(copied.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  copied.ChgFormatColl(bullets);
  expect(copied.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  expect(node.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  const stored = encodeWriterDocument(doc);
  expect(stored.textNodes[0]?.emptyListStyle).toBe(true);
  const transferred = decodeWriterDocument(stored),
    restored = firstParagraph(transferred);
  expect(restored.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(true);
  restored.ChgFormatColl(transferred.GetTextFormatColl("heading"));
  expect(restored.GetListLabel()).toBe("•");
  const legacy = {
    ...stored,
    textNodes: stored.textNodes.map(
      /** Removes only the new optional marker to model an existing v16 graph. @param record - Stored node. @returns Legacy record. */
      ({ emptyListStyle, ...record }) => {
        void emptyListStyle;
        return record;
      },
    ),
  };
  const explicit = decodeWriterDocument(legacy),
    paragraph = firstParagraph(explicit);
  expect(paragraph.IsEmptyListStyleDueToSetOutlineLevelAttr()).toBe(false);
  paragraph.ChgFormatColl(explicit.GetTextFormatColl("heading"));
  expect(paragraph.GetNumRule()).toBeUndefined();
  expect(encodeWriterDocument(explicit).textNodes[0]?.emptyListStyle).toBeUndefined();
});

it("exports assigned heading levels without numbering and retains the direct source style attributes", /** Verifies the necessary heading export compatibility and unresolved native rule diagnostics. @returns Completion after ODT reopen. */ async () => {
  const doc = new SwDoc(),
    node = firstParagraph(doc);
  node.ChgFormatColl(doc.GetTextFormatColl("heading-4"));
  node.InsertText("Heading", 0);
  const bytes = writeOdtDocument(doc, { title: "Heading" });
  expect(await new ZipFile(bytes).readTextEntry("styles.xml")).toContain(
    'style:default-outline-level="4"',
  );
  const reopened = (await readOdtDocument(bytes, { title: "Heading" })).document;
  expect(firstParagraph(reopened).GetAttrListLevel()).toBe(3);
  expect(firstParagraph(reopened).GetAttrOutlineLevel()).toBe(4);
  expect(firstParagraph(reopened).IsInList()).toBe(false);
  doc.GetTextFormatColl("text-body").SetFormatAttr(new SwNumRuleItem("Unknown"));
  expect(
    /** Rejects an unresolved named numbering reference. @returns Package if unexpectedly accepted. */ () =>
      writeOdtDocument(doc, { title: "Heading" }),
  ).toThrow("cannot resolve style numbering rule Unknown");
});

it("uses the newly selected rule in genuine ODT and preserves style attributes through Worker transfer", /** Verifies concrete package labels and owned rule binding after the style-switch regression. @returns Completion after package reopen. */ async () => {
  const base = new SwDoc();
  firstParagraph(base).InsertText("Paragraph", 0);
  const metadata = createDocument({
    id: "style-odt",
    title: "Style transitions",
    suiteId: "writer",
  });
  const imported = await readOdtDocument(
    writeOdtDocument(base, { title: metadata.title }),
    metadata,
  );
  const doc = imported.document;
  doc.EnsureNumRule("Counters", "numbered");
  doc.EnsureNumRule("Bullets", "bullet");
  doc.GetTextFormatColl("text-body").SetFormatAttr(new SwNumRuleItem("Counters"));
  doc.GetTextFormatColl("heading").SetFormatAttr(new SwNumRuleItem("Bullets"));
  const shell = new SwWrtShell(new SwDocShell(doc, metadata));
  const node = firstParagraph(doc);
  shell.SetParagraphStyle("text-body");
  node.SetListId("Retained");
  node.SetAttrListLevel(2);
  node.SetListRestart(true, 7);
  expect(node.GetListLabel()).toBe("7.");
  shell.SetParagraphStyle("heading");
  expect(node.GetNum()?.GetNumRule()?.GetName()).toBe("Bullets");
  expect(node.GetListLabel()).toBe("▪");
  const stored = encodeWriterDocument(doc);
  expect(stored.swModelVersion).toBe(16);
  const transferred = decodeWriterDocument(stored);
  for (const current of [doc, transferred]) {
    const paragraph = firstParagraph(current);
    expect(paragraph.GetNum()?.GetNumRule()?.GetName()).toBe("Bullets");
    expect(paragraph.GetListId()).toBe("Retained");
    expect(paragraph.GetAttrListLevel()).toBe(2);
    expect(paragraph.GetListLabel()).toBe("▪");
    const bytes = writeOdtDocument(current, { title: metadata.title });
    const xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml).toContain('text:style-name="L1"');
    expect(xml).toContain('text:start-value="7"');
    const reopened = (await readOdtDocument(bytes, metadata)).document;
    expect(reopened.GetTextFormatColl("text-body").GetNumRule().GetValue()).toBe("Counters");
    expect(reopened.FindNumRulePtr("Counters")).toBeDefined();
    expect(firstParagraph(reopened).GetNum()?.GetNumRule()?.GetName()).toBe("Bullets");
    expect(firstParagraph(reopened).GetListLabel()).toBe("▪");
    expect(firstParagraph(reopened).GetAttrListLevel()).toBe(2);
    firstParagraph(reopened).ResetAttr(73);
    firstParagraph(reopened).ChgFormatColl(reopened.GetTextFormatColl("text-body"));
    expect(firstParagraph(reopened).GetListLabel()).toBe("7.");
  }
  expect(shell.Undo()).toBe(true);
  expect(node.GetParagraphStyle()).toBe("text-body");
  expect(node.GetListLabel()).toBe("7.");
  expect(node.GetListId()).toBe("Retained");
  expect(shell.Redo()).toBe(true);
  expect(node.GetListLabel()).toBe("▪");
});

it("retains assigned heading and direct unsigned outline attributes in existing Worker graph v16", /** Verifies the new source-owned item codec without changing the graph version. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = firstParagraph(doc);
  node.ChgFormatColl(doc.GetTextFormatColl("heading-4"));
  node.SetAttrOutlineLevel(5);
  expect(node.GetAttrListLevel()).toBe(3);
  expect(node.GetAttrOutlineLevel()).toBe(5);
  const restored = decodeWriterDocument(encodeWriterDocument(doc)),
    paragraph = firstParagraph(restored);
  expect(paragraph.GetParagraphStyle()).toBe("heading-4");
  expect(paragraph.GetAttrListLevel()).toBe(3);
  expect(paragraph.GetAttrOutlineLevel()).toBe(5);
  expect(restored.GetTextFormatColl("heading-4").GetAttrOutlineLevel()).toBe(4);
});

it("preserves explicit rule type through Worker16 without inferring the reserved name", /** Verifies typed metadata, cloned rules and absent legacy classification independently of ODT outline factories. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const chapter = doc.EnsureNumRule("Chapter", "numbered");
  chapter.SetRuleType(SwNumRuleType.OUTLINE_RULE);
  const named = doc.EnsureNumRule("Outline", "numbered");
  expect(named.IsOutlineRule()).toBe(false);
  const node = firstParagraph(doc);
  node.SetNumRule("Chapter");
  node.SetAttrOutlineLevel(2);
  const record = encodeWriterDocument(doc);
  const restored = decodeWriterDocument(record);
  expect(restored.FindNumRulePtr("Chapter")?.GetRuleType()).toBe(SwNumRuleType.OUTLINE_RULE);
  expect(restored.FindNumRulePtr("Outline")?.GetRuleType()).toBe(SwNumRuleType.NUM_RULE);
  expect(restored.nodes.GetOutLineNds().entries()).toEqual([firstParagraph(restored)]);
  expect(encodeWriterDocument(restored)).toEqual(record);
  const explicitNormal = {
    ...record,
    numRules: record.numRules.map(
      /** Exercises valid explicit normal classification at the boundary. @param rule - Stored rule. @returns Explicit normal record. */
      (rule) => ({ ...rule, ruleType: SwNumRuleType.NUM_RULE }),
    ),
  };
  expect(decodeWriterDocument(explicitNormal).FindNumRulePtr("Chapter")?.IsOutlineRule()).toBe(
    false,
  );
  expect(
    /** Rejects unknown classification without inventing a native factory. @returns Restored document if unexpectedly accepted. */
    () =>
      decodeWriterDocument({
        ...record,
        numRules: record.numRules.map(
          /** Supplies malformed primitive metadata. @param rule - Stored rule. @returns Invalid test record. */
          (rule) => ({ ...rule, ruleType: -1 }),
        ),
      }),
  ).toThrow("numbering rule type is invalid");
});

it("restores native reading state after successful import and malformed content", /** Verifies the same document phase brackets both import exits while preserving existing package semantics. @returns Completion. */ async () => {
  const zip = new ZipFile(writeOdtDocument(new SwDoc(), { title: "Reading" }));
  const styles = await zip.readTextEntry("styles.xml"),
    content = await zip.readTextEntry("content.xml");
  const phase = vi.spyOn(SwDoc.prototype, "SetInReading");
  try {
    const imported = importWriterXml(styles, content, { title: "Reading" });
    expect(imported.document.IsInReading()).toBe(false);
    expect(phase.mock.calls).toEqual([[true], [false]]);
    phase.mockClear();
    expect(
      /** Supplies malformed XML during the same native reading phase. @returns Import if unexpectedly accepted. */
      () => importWriterXml(styles, "<malformed", { title: "Reading" }),
    ).toThrow();
    expect(phase.mock.calls).toEqual([[true], [false]]);
    expect(phase.mock.contexts[0]).toBe(phase.mock.contexts[1]);
    expect((phase.mock.contexts[0] as SwDoc).IsInReading()).toBe(false);
  } finally {
    phase.mockRestore();
  }
});
