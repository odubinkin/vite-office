/** @fileoverview Native ODT import integration through the actual shared text/property/style/cursor APIs, including body/cell ownership. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { exportContentXml, exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { SwXText } from "../../core/unocore/unotext";
import { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXStyle } from "../../core/unocore/unostyle";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import { SwXBookmark } from "../../core/unocore/unobkm";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text } from "../../core/unocore/unocrsrhelper";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { RES_CHRATR_WEIGHT, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import type { SvxRightMarginItem } from "../../../../editeng/inc/lrspitem";
/** Creates package streams using the actual native exporter and explicit literal imported content. @param body - ODF body. @param automatic - ODF automatic declarations. @param common - ODF common declarations. @returns Canonical imported graph. */
function open(body: string, automatic = "", common = "") {
  const doc = createWriterDocument();
  const content = exportContentXml(doc)
    .replace("</office:automatic-styles>", automatic + "</office:automatic-styles>")
    .replace(/<office:text>[\s\S]*?<\/office:text>/u, "<office:text>" + body + "</office:text>");
  const styles = exportStylesXml(doc).replace("</office:styles>", common + "</office:styles>");
  return importWriterXml(styles, content, { title: "Native ODT API" }).document;
}
afterEach(
  /** Restores actual API owners after observation. @returns Nothing. */ () => vi.restoreAllMocks(),
);
it("inserts text and paragraph controls through XText and applies native ranges in body and cells", /** Verifies actual API calls and independently specified canonical model results. @returns Nothing. */ () => {
  const inserted: string[] = [],
    propertyNames: string[][] = [],
    originalInsert = SwXText.prototype.insertString,
    originalProperties = SwXTextCursor.prototype.setPropertyValues;
  vi.spyOn(SwXText.prototype, "insertString").mockImplementation(
    /** Executes this bounded native operation. @param this - Actual API owner. @param args - Native operation input. @returns Native operation result. */ function (
      this: SwXText,
      ...args
    ) {
      inserted.push(text(args[1]));
      return originalInsert.apply(this, args);
    },
  );
  vi.spyOn(SwXTextCursor.prototype, "setPropertyValues").mockImplementation(
    /** Executes this bounded native operation. @param this - Actual API owner. @param args - Native operation input. @returns Native operation result. */ function (
      this: SwXTextCursor,
      ...args
    ) {
      propertyNames.push(args[0].map(text));
      return originalProperties.apply(this, args);
    },
  );
  const controls = vi.spyOn(SwXText.prototype, "insertControlCharacter"),
    bookmarks = vi.spyOn(SwXBookmark.prototype, "attach");
  const doc = open(
    '<text:p text:style-name="P">a<text:span text:style-name="B">b</text:span>c<text:bookmark text:name="Mark"/>d<text:line-break/>e<text:soft-page-break/></text:p><table:table table:name="Grid"><table:table-column/><table:table-row><table:table-cell><text:p>cell</text:p></table:table-cell></table:table-row></table:table><text:p>tail</text:p>',
    '<style:style style:name="B" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style><style:style style:name="P" style:family="paragraph"><style:paragraph-properties fo:margin-right="0.127cm"/></style:style>',
  );
  expect(inserted).toContain("cell");
  expect(
    controls.mock.calls.filter(
      /** Executes this bounded native operation. @param value - Native operation input. @returns Native operation result. */ ([
        ,
        value,
      ]) => value === 5,
    ),
  ).toHaveLength(3);
  expect(
    propertyNames.some(
      /** Executes this bounded native operation. @param this - Actual API owner. @param names - Native operation input. @returns Native operation result. */ (
        names,
      ) => names.includes("ParaRightMargin"),
    ),
  ).toBe(true);
  expect(bookmarks).toHaveBeenCalledTimes(1);
  expect(
    doc.paragraphs.map(
      /** Executes this bounded native operation. @param node - Native operation input. @returns Native operation result. */ (
        node,
      ) => node.GetText(),
    ),
  ).toEqual(["abcd\ne", "tail"]);
  const first = doc.paragraphs[0];
  if (!first) throw new Error("Missing imported paragraph");
  expect((first.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight()).toBe(72);
  expect(
    projectWriterTextRuns(first).map(
      /** Executes this bounded native operation. @param run - Native operation input. @returns Native operation result. */ (
        run,
      ) => [run.text, run.attributes.bold],
    ),
  ).toEqual([
    ["a", false],
    ["b", true],
    ["cd\ne", false],
  ]);
  const box = doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0];
  expect(
    box
      ?.GetParagraphs()
      .map(
        /** Executes this bounded native operation. @param node - Native operation input. @returns Native operation result. */ (
          node,
        ) => node.GetText(),
      ),
  ).toEqual(["cell"]);
  expect(doc.GetIDocumentMarkAccess().FindMark("Mark")?.GetMarkPos().GetContentIndex()).toBe(3);
  expect(doc.GetIDocumentMarkAccess().GetSoftPageBreaks()).toHaveLength(0);
});
it("keeps common style properties inherited instead of copying them into paragraph runs", /** Verifies style service calls and absence of flattened direct attributes. @returns Nothing. */ () => {
  const names: string[] = [],
    original = SwXStyle.prototype.setPropertyValue;
  vi.spyOn(SwXStyle.prototype, "setPropertyValue").mockImplementation(
    /** Executes this bounded native operation. @param this - Actual API owner. @param name - Native operation input. @param value - Native operation input. @returns Native operation result. */ function (
      this: SwXStyle,
      name,
      value,
    ) {
      names.push(text(name));
      return original.call(this, name, value);
    },
  );
  const doc = open(
    '<text:p text:style-name="Parent">inherited</text:p>',
    "",
    '<style:style style:name="Parent" style:family="paragraph" style:parent-style-name="Standard"><style:text-properties fo:font-weight="bold"/></style:style>',
  );
  expect(names).toContain("CharWeight");
  const node = doc.paragraphs[0];
  if (!node) throw new Error("Missing imported paragraph");
  expect(node.GetTextFormatColl().GetName()).toBe("Parent");
  expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeUndefined();
  expect(node.GetpSwpHints()?.Count() ?? 0).toBe(0);
  expect(projectWriterTextRuns(node)[0]?.attributes.bold).toBe(true);
});
it("fills independent common and automatic numbering via native Any property sequences", /** Verifies native automatic rule identity and service assignment without ODF-name aliases in SwDoc. @returns Nothing. */ () => {
  const levels = vi.spyOn(SwXNumberingRules.prototype, "replaceByIndex"),
    assignments: string[] = [],
    original = SwXTextCursor.prototype.setPropertyValue;
  vi.spyOn(SwXTextCursor.prototype, "setPropertyValue").mockImplementation(
    /** Executes this bounded native operation. @param this - Actual API owner. @param name - Native operation input. @param value - Native operation input. @returns Native operation result. */ function (
      this: SwXTextCursor,
      name,
      value,
    ) {
      if (value instanceof Any) assignments.push(text(name));
      return original.call(this, name, value);
    },
  );
  const doc = open(
    '<text:list text:style-name="Shared"><text:list-item><text:p>one</text:p></text:list-item></text:list>',
    '<text:list-style style:name="Shared"><text:list-level-style-number text:level="1" style:num-format="1" style:num-suffix="."/></text:list-style>',
    '<text:list-style style:name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"/></text:list-style>',
  );
  expect(
    levels.mock.calls.every(
      /** Executes this bounded native operation. @param value - Native operation input. @returns Native operation result. */ ([
        ,
        value,
      ]) => value instanceof Any,
    ),
  ).toBe(true);
  expect(levels.mock.calls).toHaveLength(2);
  expect(assignments).toContain("NumberingRules");
  const node = doc.paragraphs[0],
    actual = node?.GetNumRule(),
    common = doc.FindNumRulePtr("Shared");
  expect(common?.IsAutoRule()).toBe(false);
  expect(actual?.IsAutoRule()).toBe(true);
  expect(actual).not.toBe(common);
  expect(actual?.GetName()).not.toBe("Shared");
  expect(node?.GetListLabel()).toBe("1.");
  expect(actual?.GetDefaultListId()).not.toBe("");
});
