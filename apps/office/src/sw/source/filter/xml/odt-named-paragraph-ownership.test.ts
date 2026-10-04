/** @fileoverview Checks actual named paragraph owners, automatic deltas and Writer graph/history/package boundaries. */
import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/source/items/frmitems";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxRequest, createRequestArguments } from "../../../../sfx2/source/control/request";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { exportTextParagraphs } from "../../../../xmloff/source/text/txtparae";
import { resolveParagraphStyle } from "../../../../xmloff/source/text/txtparai";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_NUMRULE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_FONTSIZE,
} from "../../../inc/hintids";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument } from "../../core/doc/doc";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwNumRuleItem } from "../../core/para/paratr";
import { resolveSwListParagraphIndents } from "../../core/txtnode/ndtxt-list-indent";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { importWriterXml } from "./xmlimp";
import { exportStylesXml, exportContentXml } from "./xmlexp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = createDocument({ id: "named-owners", suiteId: "writer", title: "Named owners" });
const namespaces = Object.entries(ODF_NAMESPACES)
  .map(
    /** Encodes test stream namespaces. @param entry - Prefix and URI. @returns Attribute. */ ([
      prefix,
      uri,
    ]) => `xmlns:${prefix}="${uri}"`,
  )
  .join(" ");
const rule =
  '<text:list-style style:name="R"><text:list-level-style-number text:level="1" style:num-format="1" style:num-suffix="."><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="0.5in" fo:text-indent="-0.25in" fo:margin-left="0.5in"/></style:list-level-properties></text:list-level-style-number></text:list-style>';
const parentProperties =
  '<style:paragraph-properties fo:margin-left="72pt" fo:text-indent="-12pt"/><style:text-properties fo:font-weight="bold" fo:font-size="14pt"/>';
const common =
  '<style:style style:name="Standard" style:family="paragraph"/>' +
  `<style:style style:name="Parent" style:display-name="Owned parent" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="RuleChild" style:list-style-name="R">${parentProperties}</style:style>` +
  '<style:style style:name="RuleChild" style:display-name="Owned child" style:family="paragraph" style:parent-style-name="Parent" style:next-style-name="Parent" style:list-style-name="R"/>' +
  `<style:style style:name="PlainParent" style:family="paragraph" style:parent-style-name="Standard">${parentProperties}</style:style>` +
  '<style:style style:name="OtherRule" style:family="paragraph" style:parent-style-name="PlainParent" style:list-style-name="S"/>';

/** Requires present actual test graph state. @param value - Owned state. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing named owner fixture");
  return value;
}

/** Imports literal common/automatic ownership into the real Writer bridge. @param name - Body style. @param automatic - Automatic declarations. @param listed - Whether body is in a list. @param named - Common declarations. @param defaults - Default declarations. @returns Actual graph. */
function input(name = "RuleChild", automatic = "", listed = true, named = common, defaults = "") {
  const styles = `<office:document-styles ${namespaces}><office:styles>${defaults}${named}${rule}${rule.replace('style:name="R"', 'style:name="S"')}</office:styles></office:document-styles>`;
  const paragraph = `<text:p text:style-name="${name}">NamedOwnershipProof</text:p>`;
  const body = listed
    ? `<text:list text:style-name="R" xml:id="OwnedList"><text:list-item>${paragraph}</text:list-item></text:list>`
    : paragraph;
  const content = `<office:document-content ${namespaces}><office:automatic-styles>${automatic}</office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
  return importWriterXml(styles, content, metadata).document;
}

describe("Writer document-owned named paragraph hierarchy", /** Groups literal native ownership and actual transport evidence. @returns Nothing. */ () => {
  it("retains legacy resolver ports and detached copy/default creation boundaries", /** Checks real ownership lookup boundaries and the generic port without an owned-style resolver. @returns Nothing. */ function retainsLookupBoundaries() {
    const resolved = resolveParagraphStyle("Standard", false, {
      getAutoStyle: /** Has no automatic styles. @returns Undefined. */ () => undefined,
      getStyle: /** Returns one supported common definition. @returns Definition. */ () => ({
        family: "paragraph",
        alignment: "center",
      }),
    });
    expect(resolved.alignment).toBe("center");
    const inherited = resolveParagraphStyle("AliasChild", false, {
      getAutoStyle: /** Has no automatic styles. @returns Undefined. */ () => undefined,
      /** Reads common legacy owners. @param _family - Family. @param name - Identity. @returns Definition. */
      getStyle: (_family, name) =>
        name === "Standard"
          ? { family: "paragraph", alignment: "center" }
          : { family: "paragraph", parentStyleName: "Standard" },
      /** Resolves the legacy alias. @param name - Identity. @returns Bounded builtin. */
      resolveBuiltInParagraphStyle: (name) => (name === "AliasChild" ? "title" : undefined),
    });
    expect(inherited.alignment).toBe("center");
    const source = createWriterDocument(),
      dest = createWriterDocument();
    const detached = new SwTextFormatColl(source.GetAttrPool(), "Detached", "Detached display");
    expect(dest.CopyTextColl(detached).DerivedFrom()).toBe(dest.GetDfltTextFormatColl());
    expect(dest.MakeTextFormatColl("Default named identity").id).toBe("Default named identity");
    const record = encodeWriterDocument(dest),
      invalid = { ...required(record.textFormatCollections[1]) };
    Reflect.set(invalid, "id", 42);
    expect(
      /** Rejects a non-string identity. @returns Invalid graph. */ () =>
        decodeWriterDocument({
          ...record,
          textFormatCollections: [required(record.textFormatCollections[0]), invalid],
        }),
    ).toThrow("style is invalid");
    const unknown = input(
      "UnknownRule",
      "",
      false,
      '<style:style style:name="Standard" style:family="paragraph"/><style:style style:name="UnknownRule" style:family="paragraph" style:parent-style-name="Standard" style:list-style-name="Missing"/>',
    );
    expect(
      unknown.GetTextFormatColl("UnknownRule").GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false),
    ).toBeUndefined();
    const empty = input(
      "EmptyRule",
      "",
      false,
      '<style:style style:name="Standard" style:family="paragraph"/><style:style style:name="EmptyRule" style:family="paragraph" style:parent-style-name="Standard" style:list-style-name=""/>',
    );
    expect(
      empty.GetTextFormatColl("EmptyRule").GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false),
    ).toBeDefined();
  });
  it("rejects an undeclared direct export rule instead of dropping its ownership", /** Checks a malformed neutral export port. @returns Nothing. */ function rejectsDirectRuleLoss() {
    expect(
      /** Emits invalid ownership. @returns Invalid export. */ () =>
        exportTextParagraphs({
          paragraphs: /** Iterates an undeclared rule reference. @returns Paragraphs. */ () =>
            [{ style: "Standard", directListRule: "Undeclared", runs: [] }].values(),
        }),
    ).toThrow("Missing ODF direct list style: Undeclared");
  });
  for (const profile of [
    {
      name: "RuleChild",
      parent: "RuleChild",
      attrs: "",
      props: "",
      mask: 3,
      rawLeft: 1440,
      rawFirst: -240,
      left: 720,
      first: -360,
    },
    {
      name: "FirstZero",
      parent: "RuleChild",
      attrs: "",
      props: 'fo:text-indent="0pt"',
      mask: 2,
      rawLeft: 1440,
      rawFirst: 0,
      left: 720,
      first: 0,
    },
    {
      name: "LeftZero",
      parent: "RuleChild",
      attrs: "",
      props: 'fo:margin-left="0pt"',
      mask: 1,
      rawLeft: 0,
      rawFirst: -240,
      left: 0,
      first: -360,
    },
    {
      name: "Both",
      parent: "RuleChild",
      attrs: "",
      props: 'fo:margin-left="24pt" fo:text-indent="6pt"',
      mask: 0,
      rawLeft: 480,
      rawFirst: 120,
      left: 480,
      first: 120,
    },
    {
      name: "Parent",
      parent: "Parent",
      attrs: "",
      props: "",
      mask: 0,
      rawLeft: 1440,
      rawFirst: -240,
      left: 1440,
      first: -240,
    },
    {
      name: "RuleOverride",
      parent: "Parent",
      attrs: 'style:list-style-name="R"',
      props: "",
      mask: 3,
      rawLeft: 1440,
      rawFirst: -240,
      left: 720,
      first: -360,
    },
    {
      name: "PlainOverride",
      parent: "PlainParent",
      attrs: 'style:list-style-name="R"',
      props: "",
      mask: 3,
      rawLeft: 1440,
      rawFirst: -240,
      left: 720,
      first: -360,
    },
    {
      name: "OtherRule",
      parent: "OtherRule",
      attrs: "",
      props: "",
      mask: 3,
      rawLeft: 1440,
      rawFirst: -240,
      left: 720,
      first: -360,
    },
    {
      name: "Inherited",
      parent: "Parent",
      attrs: "",
      props: "",
      mask: 0,
      rawLeft: 1440,
      rawFirst: -240,
      left: 1440,
      first: -240,
    },
  ])
    it(`keeps common owner and automatic mask ${profile.name}`, /** Checks independent literals, exact direct absence and graph/package cycles. @returns Completion. */ async function retainsNamedOwnership() {
      const automatic =
        profile.name === profile.parent
          ? ""
          : `<style:style style:name="${profile.name}" style:family="paragraph" style:parent-style-name="${profile.parent}" ${profile.attrs}>${profile.props === "" ? "" : `<style:paragraph-properties ${profile.props}/>`}</style:style>`;
      let doc = input(profile.name, automatic);
      for (let cycle = 0; cycle < 3; cycle++) {
        const node = required(doc.paragraphs[0]);
        expect(node.GetParagraphStyle()).toBe(profile.parent);
        expect(node.GetParagraphTextLeftMargin()).toBe(profile.rawLeft);
        expect(node.GetParagraphFirstLineIndent()).toBe(profile.rawFirst);
        expect(node.AreListLevelIndentsApplicable()).toBe(profile.mask);
        expect(resolveSwListParagraphIndents(node)).toEqual({
          textLeft: profile.left,
          firstLine: profile.first,
          listLevelIndents: profile.mask,
        });
        expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false) !== undefined).toBe(
          profile.props.includes("margin-left"),
        );
        expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false) !== undefined).toBe(
          profile.props.includes("text-indent"),
        );
        expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeUndefined();
        expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_FONTSIZE, false)).toBeUndefined();
        expect((node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetBoolValue()).toBe(true);
        const parent = doc.GetTextFormatColl("Parent"),
          child = doc.GetTextFormatColl("RuleChild");
        expect(child.DerivedFrom()).toBe(parent);
        expect(child.GetNextTextFormatColl()).toBe(parent);
        expect(parent.GetNextTextFormatColl()).toBe(child);
        expect(child.GetAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
        expect(child.GetAttrSet().GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
        expect(encodeWriterDocument(decodeWriterDocument(encodeWriterDocument(doc)))).toEqual(
          encodeWriterDocument(doc),
        );
        doc = (await readOdtDocument(writeOdtDocument(doc, metadata), metadata)).document;
      }
    });

  for (const alignment of ["left", "right", "center", "justify"])
    it(`keeps default root and named own ${alignment}`, /** Checks default inheritance does not become an own item on each named child. @returns Nothing. */ function retainsDefaultRoot() {
      const defaults =
        '<style:default-style style:family="paragraph"><style:paragraph-properties fo:margin-left="0pt" fo:text-indent="0pt"/><style:text-properties fo:font-style="italic"/></style:default-style>';
      const named = `<style:style style:name="Standard" style:family="paragraph"/><style:style style:name="Aligned" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="${alignment}"/></style:style>`;
      const doc = input("Aligned", "", false, named, defaults),
        node = required(doc.paragraphs[0]);
      expect(node.GetParagraphAlignment()).toBe(alignment);
      expect(
        doc.GetTextFormatColl("Aligned").GetAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false),
      ).toBeUndefined();
      expect(
        doc.GetDfltTextFormatColl().GetAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false),
      ).toBeDefined();
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
    });

  it("restores raw custom names and links without separator or XML escaping loss", /** Checks structured automatic keys and exact graph links with literal punctuation. @returns Completion. */ async function transportsCustomNames() {
    const doc = createWriterDocument(),
      parent = doc.MakeTextFormatColl(
        "Parent display",
        doc.GetDfltTextFormatColl(),
        'Own:Parent&"',
      ),
      child = doc.MakeTextFormatColl("Child display", parent, "Own:Child");
    parent.SetFormatAttr(new SvxTextLeftMarginItem(1200, RES_MARGIN_TEXTLEFT));
    child.SetNextTextFormatColl(parent);
    parent.SetNextTextFormatColl(child);
    const node = required(doc.paragraphs[0]);
    node.ChgFormatColl(child);
    node.SetAttr(new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE));
    node.SetText("EscapedOwnProof");
    expect(exportContentXml(doc)).toContain('style:parent-style-name="Own:Child"');
    expect(exportStylesXml(doc)).toContain('style:parent-style-name="Own:Parent&amp;&quot;"');
    const reopened = (await readOdtDocument(writeOdtDocument(doc, metadata), metadata)).document;
    const restored = reopened.GetTextFormatColl("Own:Child");
    expect(restored.DerivedFrom()).toBe(reopened.GetTextFormatColl('Own:Parent&"'));
    expect(restored.GetNextTextFormatColl()).toBe(reopened.GetTextFormatColl('Own:Parent&"'));
    expect(required(reopened.paragraphs[0]).GetParagraphFirstLineIndent()).toBe(120);
    expect(required(reopened.paragraphs[0]).GetParagraphTextLeftMargin()).toBe(1200);
  });

  it("recomputes real tdf114287 independent applicability from imported owners", /** Checks the existing project fixture without native source access. @returns Completion. */ async function retainsNativeTdfOwnership() {
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Ignores unrelated supported-slice fixture diagnostics. @returns Nothing. */ () =>
          undefined,
      );
    try {
      const doc = (
        await readOdtDocument(
          new Uint8Array(fs.readFileSync("src/sw/qa/extras/odfexport/data/tdf114287.odt")),
          metadata,
        )
      ).document;
      const a = required(doc.paragraphs[1]),
        b = required(doc.paragraphs[8]),
        c = required(doc.paragraphs[15]);
      expect([
        a.AreListLevelIndentsApplicable(),
        b.AreListLevelIndentsApplicable(),
        c.AreListLevelIndentsApplicable(),
      ]).toEqual([0, 0, 3]);
      expect(a.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeDefined();
      expect(b.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
      expect(c.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
      expect(c.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeDefined();
      expect([b.GetParagraphFirstLineIndent(), c.GetParagraphFirstLineIndent()]).toEqual([
        -567, -567,
      ]);
    } finally {
      warn.mockRestore();
    }
  });

  it("preserves custom graph ownership through shell no-op and Undo/Redo", /** Checks native existing commands and complete direct absence history. @returns Nothing. */ function restoresNamedHistory() {
    const doc = input(),
      shellDoc = new SwDocShell(doc, metadata),
      view = new SwView(shellDoc),
      shell = view.GetWrtShell();
    try {
      const before = encodeWriterDocument(doc);
      expect(shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)])).toBe(
        true,
      );
      const edited = encodeWriterDocument(doc);
      expect(shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)])).toBe(
        false,
      );
      expect(shell.Undo()).toBe(true);
      expect(encodeWriterDocument(doc)).toEqual(before);
      expect(shell.Redo()).toBe(true);
      expect(encodeWriterDocument(doc)).toEqual(edited);
      expect(shell.SetParagraphStyle("PlainParent")).toBe(true);
      expect(shell.SetParagraphStyle("PlainParent")).toBe(false);
      const slot = required(
        shellDoc.GetCommandShell().GetInterface().GetSlot(WRITER_COMMAND_IDS.styleApply),
      );
      const resolved = required(shellDoc.GetCommandShell().ResolveSlot(slot.slotId));
      expect(
        resolved.execute(
          new SfxRequest(
            slot.slotId,
            createRequestArguments(slot.slotId, { Template: "Owned child", Family: 2 }),
          ),
        ).status,
      ).toBe("executed");
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("RuleChild");
      expect(shell.Undo()).toBe(true);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("PlainParent");
      expect(shell.Redo()).toBe(true);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("RuleChild");
    } finally {
      view.Close();
    }
  });

  for (const kind of ["none", "empty", "missing", "automatic", "manual", "existing"] as const)
    it(`copies custom destination ownership and ${kind} rule`, /** Checks native absent-style copies, follow cycles and manual-rule destination policy. @returns Nothing. */ function copiesNamedStyle() {
      const source = createWriterDocument(),
        dest = createWriterDocument();
      const parent = source.MakeTextFormatColl(
          "Copy parent",
          source.GetDfltTextFormatColl(),
          "CopyParent",
        ),
        child = source.MakeTextFormatColl("Copy child", parent, "CopyChild");
      parent.SetFormatAttr(new SvxTextLeftMarginItem(1440, RES_MARGIN_TEXTLEFT));
      child.SetNextTextFormatColl(parent);
      parent.SetNextTextFormatColl(child);
      child.AssignToListLevelOfOutlineStyle(2);
      if (kind !== "none")
        child.SetFormatAttr(new SwNumRuleItem(kind === "empty" ? "" : "CopiedRule"));
      if (["automatic", "manual", "existing"].includes(kind))
        source.EnsureNumRule("CopiedRule", "numbered").SetAutoRule(kind === "automatic");
      if (kind === "existing") dest.EnsureNumRule("CopiedRule", "numbered").SetAutoRule(false);
      const node = required(source.paragraphs[0]);
      node.ChgFormatColl(child);
      node.SetText("CopyOwnedProof");
      const clone = node.CloneTo(dest.GetNodes()),
        copied = clone.GetTextFormatColl();
      expect(copied).not.toBe(child);
      expect(copied.DerivedFrom()).toBe(dest.GetTextFormatColl("CopyParent"));
      expect(copied.GetNextTextFormatColl()).toBe(dest.GetTextFormatColl("CopyParent"));
      expect(dest.GetTextFormatColl("CopyParent").GetNextTextFormatColl()).toBe(copied);
      expect(copied.IsAssignedToListLevelOfOutlineStyle()).toBe(true);
      expect(dest.FindNumRulePtr("CopiedRule") !== undefined).toBe(
        kind === "manual" || kind === "existing",
      );
      parent.SetFormatAttr(new SvxTextLeftMarginItem(2400, RES_MARGIN_TEXTLEFT));
      expect(clone.GetParagraphTextLeftMargin()).toBe(1440);
      const reused = dest.MakeTextFormatColl(
        "Existing source name",
        undefined,
        "DestinationIdentity",
      );
      const sameName = source.MakeTextFormatColl(
        "Existing source name",
        undefined,
        "SourceIdentity",
      );
      expect(dest.CopyTextColl(sameName)).toBe(reused);
      expect(
        /** Attempts duplicate registration. @returns Unexpected collection. */ () =>
          dest.MakeTextFormatColl("Duplicate", undefined, "DestinationIdentity"),
      ).toThrow(/Duplicate SwTextFormatColl/);
    });

  it("keeps no-list suppression, outline exception and declared graph validation", /** Checks real imported rule removal and graph default-root/declared-style admission. @returns Nothing. */ function retainsDeclaredGraph() {
    const doc = input("RuleChild", "", false);
    expect(required(doc.paragraphs[0]).GetNumRuleName()).toBe("");
    const own = doc.GetTextFormatColl("RuleChild");
    expect(own.GetNumRule().GetValue()).toBe("R");
    const current = encodeWriterDocument(doc);
    expect(
      /** Rejects an empty identity. @returns Invalid graph. */ () =>
        decodeWriterDocument({
          ...current,
          textFormatCollections: [
            ...current.textFormatCollections,
            { ...required(current.textFormatCollections[0]), id: "" },
          ],
        }),
    ).toThrow("style is invalid");
    expect(
      /** Rejects an undeclared node identity. @returns Invalid graph. */ () =>
        decodeWriterDocument({
          ...current,
          textNodes: [{ ...required(current.textNodes[0]), formatCollId: "Undeclared" }],
        }),
    ).toThrow("paragraph style is invalid");
    const outline = input(
      "OutlineOwner",
      "",
      false,
      '<style:style style:name="Standard" style:family="paragraph"/><style:style style:name="OutlineOwner" style:family="paragraph" style:parent-style-name="Standard" style:list-style-name="Outline"/>',
    );
    expect(required(outline.paragraphs[0]).GetNumRuleName()).toBe("Outline");
    const local = new SwTextFormatColl(doc.GetAttrPool(), "DetachedOwn", "Detached own");
    local.SetFormatAttr(new SwNumRuleItem("R"));
    required(doc.FindNumRulePtr("R")).SetAutoRule(false);
    expect(doc.CopyTextColl(local).GetNumRule().GetValue()).toBe("R");
  });
});
