/** @fileoverview Checks real RTF chapter selection and native style/Worker ownership. */
import { afterEach, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { SwDoc } from "../../core/doc/doc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases native document graphs. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Parses real RTF with the original list-level style reference. @param id - Concrete list ID. @returns Native document. */
function read(id: number) {
  const source = String.raw`{\rtf1{\stylesheet{\s12\outlinelevel0\ls${id}\ilvl0 Heading One;}{\s13\sbasedon12 Child;}}{\*\listtable{\list{\listlevel\levelnfc0\s12{\leveltext\'02\'00.;}{\levelnumbers\'01;}}\listid7}}{\*\listoverridetable{\listoverride\listid7\ls${id}}}\s12\ls${id}\ilvl0 Heading\par\s13 Child\par}`;
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
it("selects the weighted numId1 candidate as the actual outline rule and restores inherited styles", /** Weight9 passes the native threshold; the RTF default numId0 cancels child numbering while outline inheritance is restored. @returns Nothing. */ () => {
  const doc = read(1),
    heading = doc.paragraphs[0]?.GetTextFormatColl(),
    child = doc.paragraphs[1]?.GetTextFormatColl();
  expect(heading?.IsAssignedToListLevelOfOutlineStyle()).toBe(true);
  expect(heading?.GetAssignedOutlineStyleLevel()).toBe(0);
  expect(heading?.GetNumRule().GetValue()).toBe("Outline");
  expect(child?.GetAttrOutlineLevel()).toBe(1);
  expect(child?.GetNumRule().GetValue()).toBe("");
  expect(doc.paragraphs[0]?.GetNumRule()).toBe(doc.GetOutlineNumRule());
  expect(doc.FindNumRulePtr("WWNum1")).toBeUndefined();
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetNumRule()).toBe(restored.GetOutlineNumRule());
  expect(restored.paragraphs[0]?.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle()).toBe(
    true,
  );
});
it("leaves the low-weight candidate as an ordinary named rule", /** A single other-ID Heading style scores2, below the native threshold. @returns Nothing. */ () => {
  const doc = read(4);
  expect(doc.paragraphs[0]?.GetNumRule()?.GetName()).toBe("WWNum4");
  expect(doc.paragraphs[0]?.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle()).toBe(false);
});

it.each([
  [5, false],
  [6, true],
] as const)(
  "retains the strict chapter threshold for weight%i",
  /** Each ordinary-ID custom style contributes one source weight. @param count - Weight and level count. @param selected - Native decision. @returns Nothing. */ (
    count,
    selected,
  ) => {
    let styles = "",
      levels = "";
    for (let level = 0; level < count; level++) {
      styles += `{\\s${level + 20}\\outlinelevel${level}\\ls4\\ilvl${level} Custom ${level};}`;
      levels += `{\\listlevel\\levelnfc0\\s${level + 20}{\\leveltext\\'02\\'0${level}.;}{\\levelnumbers\\'01;}}`;
    }
    const source = `{\\rtf1{\\stylesheet${styles}}{\\*\\listtable{\\list${levels}\\listid7}}{\\*\\listoverridetable{\\listoverride\\listid7\\ls4}}\\s20\\ls4\\ilvl0 Heading\\par}`;
    const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
    docs.push(doc);
    expect(doc.paragraphs[0]?.GetNumRule()?.GetName()).toBe(selected ? "Outline" : "WWNum4");
    expect(doc.paragraphs[0]?.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle()).toBe(
      selected,
    );
  },
);
