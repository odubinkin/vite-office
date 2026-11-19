/** @fileoverview Original tdf161509 style-ID witnesses and genuine Word style/heading slot allocation. Full DOCX fixture save/reload is not certified by value tests. */
import { assert, expect, it } from "vitest";
import { CreateDOCXStyleId } from "../../../../filter/source/msfilter/util";
import { MSWordStyles } from "./wrtw8sty";
import { DocxExport } from "./docxexport";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
/** Counted actual UTF16 view, including embedded NUL. @param text - Input. @returns Units. */
function units(text: string): Uint16Array {
  const result = new Uint16Array(text.length);
  for (let index = 0; index < text.length; ++index) result[index] = text.charCodeAt(index);
  return result;
}
/** Reads the actual native value before releasing the by-value result. @param text - Input name. @returns Canonical ID. */
function id(text: string): string {
  const result = CreateDOCXStyleId(units(text));
  try {
    return String.fromCharCode(...result.getStr().subarray(0, result.getLength()));
  } finally {
    result.dispose();
  }
}
it.each([
  ["Normal", "Normal"],
  ["heading 1", "Heading1"],
  ["heading 2", "Heading2"],
  ["heading 3", "Heading3"],
  ["heading 4", "Heading4"],
  ["heading 5", "Heading5"],
  ["heading 6", "Heading6"],
  ["heading 7", "Heading7"],
  ["heading 8", "Heading8"],
  ["heading 9", "Heading9"],
  ["index 1", "Index1"],
  ["index 2", "Index2"],
  ["index 3", "Index3"],
  ["index 4", "Index4"],
  ["index 5", "Index5"],
  ["index 6", "Index6"],
  ["index 7", "Index7"],
  ["index 8", "Index8"],
  ["index 9", "Index9"],
  ["toc 1", "TOC1"],
  ["toc 2", "TOC2"],
  ["toc 3", "TOC3"],
  ["toc 4", "TOC4"],
  ["toc 5", "TOC5"],
  ["toc 6", "TOC6"],
  ["toc 7", "TOC7"],
  ["toc 8", "TOC8"],
  ["toc 9", "TOC9"],
  ["Normal Indent", "NormalIndent"],
  ["footnote text", "FootnoteText"],
  ["annotation text", "CommentText"],
  ["header", "Header"],
  ["footer", "Footer"],
  ["index heading", "IndexHeading"],
  ["caption", "Caption"],
  ["table of figures", "TableofFigures"],
  ["envelope address", "EnvelopeAddress"],
  ["envelope return", "EnvelopeReturn"],
  ["footnote reference", "FootnoteReference"],
  ["annotation reference", "CommentReference"],
  ["line number", "LineNumber"],
  ["page number", "PageNumber"],
  ["endnote reference", "EndnoteReference"],
  ["endnote text", "EndnoteText"],
  ["table of authorities", "TableofAuthorities"],
  ["macro", "MacroText"],
  ["TOC Heading", "TOCHeading"],
  ["List", "List"],
  ["List Bullet", "ListBullet"],
  ["List Number", "ListNumber"],
  ["List 2", "List2"],
  ["List 3", "List3"],
  ["List 4", "List4"],
  ["List 5", "List5"],
  ["List Bullet 2", "ListBullet2"],
  ["List Bullet 3", "ListBullet3"],
  ["List Bullet 4", "ListBullet4"],
  ["List Bullet 5", "ListBullet5"],
  ["List Number 2", "ListNumber2"],
  ["List Number 3", "ListNumber3"],
  ["List Number 4", "ListNumber4"],
  ["List Number 5", "ListNumber5"],
  ["Title", "Title"],
  ["Closing", "Closing"],
  ["Signature", "Signature"],
  ["Default Paragraph Font", "DefaultParagraphFont"],
  ["Body Text", "BodyText"],
  ["Body Text Indent", "BodyTextIndent"],
  ["List Continue", "ListContinue"],
  ["List Continue 2", "ListContinue2"],
  ["List Continue 3", "ListContinue3"],
  ["List Continue 4", "ListContinue4"],
  ["List Continue 5", "ListContinue5"],
  ["Message Header", "MessageHeader"],
  ["Subtitle", "Subtitle"],
  ["Salutation", "Salutation"],
  ["Date", "Date"],
  ["Body Text First Indent", "BodyTextFirstIndent"],
  ["Body Text First Indent 2", "BodyTextFirstIndent2"],
  ["Note Heading", "NoteHeading"],
  ["Body Text 2", "BodyText2"],
  ["Body Text 3", "BodyText3"],
  ["Body Text Indent 2", "BodyTextIndent2"],
  ["Body Text Indent 3", "BodyTextIndent3"],
  ["Block Text", "BlockText"],
  ["Hyperlink", "Hyperlink"],
  ["FollowedHyperlink", "FollowedHyperlink"],
  ["Strong", "Strong"],
  ["Emphasis", "Emphasis"],
  ["Document Map", "DocumentMap"],
  ["Plain Text", "PlainText"],
] as const)(
  "replays tdf161509 ID assertion %s",
  /** Original XPath witness checked at the actual native conversion boundary. @param name - Original source name. @param expected - Original source ID. @returns Nothing. */ (
    name,
    expected,
  ) => {
    expect(id(name)).toBe(expected);
  },
);
it.each([
  ["123 custom - Style", "123custom-Style"],
  ["lower case", "lowercase"],
  ["Heading 1", "Heading1"],
  ["HEADING 1", "HEADING1"],
  ["字😀é_\u0000A-b", "A-b"],
  ["字😀", ""],
  ["", ""],
] as const)(
  "retains source ASCII filtering without arbitrary capitalization for %s",
  /** Does not add an XML-name sanitizer or fallback to the shared utility. @param name - Actual UTF16 name. @param expected - Source result. @returns Nothing. */ (
    name,
    expected,
  ) => expect(id(name)).toBe(expected),
);

it("allocates case-insensitive IDs in native slot order including empty reserved entries and stable heading references", /** No synthetic style resolver is supplied. @returns Nothing. */ () => {
  const document = new SwDoc(),
    position = new SwPosition(document.GetNodes().GetEndOfContent()),
    range = new SwPaM(position),
    owner = new DocxExport(
      new XmlFilterBase(new ZipStorage()),
      document,
      range,
      range,
      false,
      false,
    );
  try {
    const parent = document.GetDfltTextFormatColl(),
      first = document.MakeTextFormatColl("A B", parent),
      second = document.MakeTextFormatColl("A_B", parent),
      numbered = document.MakeTextFormatColl("AB1", parent),
      collision = document.MakeTextFormatColl("AB", parent),
      unicode = document.MakeTextFormatColl("字", parent),
      heading = document.MakeTextFormatColl("heading 1", parent),
      lastHeading = document.MakeTextFormatColl("Last assigned", parent);
    heading.AssignToListLevelOfOutlineStyle(0);
    lastHeading.AssignToListLevelOfOutlineStyle(0);
    const styles = new MSWordStyles(owner),
      firstSlot = styles.GetSlot(first),
      secondSlot = styles.GetSlot(second);
    expect(styles.GetStyleId(firstSlot)).toBe("AB");
    expect(styles.GetStyleId(secondSlot)).toBe("AB1");
    expect(styles.GetStyleId(styles.GetSlot(numbered))).toBe("AB11");
    expect(styles.GetStyleId(styles.GetSlot(collision))).toBe("AB2");
    expect(styles.GetStyleId(styles.GetSlot(unicode))).toMatch(/^Style[0-9]+$/);
    expect(styles.GetStyleId(styles.GetSlot(heading))).toBe("Heading1");
    expect(styles.GetHeadingParagraphStyleId(0)).toBe(styles.GetSlot(lastHeading));
    expect(styles.GetHeadingParagraphStyleId(9)).toBe(65535);
    expect(styles.GetStyleId(0)).toBe("Normal");
    expect(
      /** Uses the original invalid-slot diagnostic. @returns ID. */ () => styles.GetStyleId(65535),
    ).toThrow("assert(nonempty style ID)");
    styles.BuildStyleIds();
    expect(styles.GetStyleId(secondSlot)).toBe("AB1");
    assert(first.GetName() === "A B" && second.GetName() === "A_B");
  } finally {
    owner.dispose();
    range.Dispose();
    position.Dispose();
    document.Dispose();
  }
});
