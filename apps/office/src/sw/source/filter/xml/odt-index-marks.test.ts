/** @fileoverview Original LibreOffice point and ranged index markers through ODT and the Writer Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { TOXTypes } from "../../core/tox/tox";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Index marks" };
const fixtureRoot = "../../vendor/libreoffice-reference/sw/qa/extras";

/** Returns the native text nodes and owned TOX marks. @param document - Writer model. @returns Marks grouped by paragraph. */
function markParagraphs(document: SwDoc) {
  const paragraphs = [];
  for (const node of document.GetNodes().entries()) {
    const paragraph = node.GetTextNode();
    const marks = paragraph?.GetpSwpHints()?.GetIndexMarks();
    if (paragraph && marks?.length) paragraphs.push({ paragraph, marks });
  }
  return paragraphs;
}

/** Checks one case at each of the existing file and graph boundaries. @param fixture - Pinned LibreOffice file. @param check - Assertions over original nodes. @returns Completion. */
async function checkRoundTrip(fixture: string, check: (document: SwDoc) => void): Promise<void> {
  const original = (
    await readOdtDocument(new Uint8Array(readFileSync(`${fixtureRoot}/${fixture}`)), metadata)
  ).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    check(original);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(original)));
    check(worker);
    const file = await writeOdtDocument(worker, metadata);
    const archive = await DocumentArchive.open(file);
    expect(await archive.readTextEntry("content.xml")).not.toContain(CH_TXTATR_INWORD);
    reopened = (await readOdtDocument(file, metadata)).document;
    check(reopened);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    original.Dispose();
  }
}

it("retains nested alphabetical marks from tdf149248.odt", /** Checks original range pairs. @returns Completion. */ () =>
  checkRoundTrip("odfexport/data/tdf149248.odt", (document) => {
    const groups = markParagraphs(document);
    expect(groups.flatMap(({ marks }) => marks)).toHaveLength(24);
    for (const { paragraph, marks } of groups) {
      for (const mark of marks) {
        expect(mark.GetAttr().type).toBe(document.GetTOXType(TOXTypes.Index));
        expect(mark.GetAttr().GetTextTOXMark()).toBe(mark);
        expect(mark.GetTextNode()).toBe(paragraph);
        expect(mark.GetEnd()).toBeGreaterThan(mark.GetStart());
      }
    }
  }));

it("preserves point and range whitespace from the original testWhitespace document", /** Ports the original point and ranged index mark whitespace assertions. @returns Completion. */ () =>
  checkRoundTrip("odfexport/data/whitespace.odt", (document) => {
    const groups = markParagraphs(document);
    expect(groups).toHaveLength(2);
    const [point, range] = groups;
    assert(point && range);
    expect(point.paragraph.GetText()).toBe(`X ${CH_TXTATR_INWORD} X`);
    expect(point.marks).toHaveLength(1);
    expect(point.marks[0]?.GetStart()).toBe(2);
    expect(point.marks[0]?.GetEnd()).toBeUndefined();
    expect(point.marks[0]?.GetAttr().alternativeText).toBe("foo");
    expect(range.paragraph.GetText()).toBe("X   X");
    expect(range.marks).toHaveLength(1);
    expect(range.marks[0]?.GetStart()).toBe(2);
    expect(range.marks[0]?.GetEnd()).toBe(3);
  }));

it("restores native user and contents mark types in the testToxmarkLinks fixture", /** Ports the original attached text-node assertion and checks restored type ownership. @returns Completion. */ () =>
  checkRoundTrip("uiwriter/data/udindex3.odt", (document) => {
    const groups = markParagraphs(document);
    const contents = groups.find(({ marks }) =>
      marks.some((mark) => mark.GetAttr().type?.type === TOXTypes.Content),
    );
    assert(contents);
    expect(contents.paragraph.GetText()).toBe(`${CH_TXTATR_INWORD}tocmark`);
    expect(contents.marks[0]?.GetAttr().alternativeText).toBe("the tocmark");
    const users = groups
      .flatMap(({ marks }) => marks)
      .filter((hint) => hint.GetAttr().type?.type === TOXTypes.User);
    expect(users).toHaveLength(3);
    expect(users.filter((hint) => hint.HasDummyChar()).map((hint) => hint.GetAttr().type)).toEqual([
      document.GetTOXType(TOXTypes.User),
      document.GetTOXType(TOXTypes.User),
    ]);
    expect(users.find((hint) => !hint.HasDummyChar())?.GetAttr().type).toBe(
      document.GetTOXType(TOXTypes.User, "NewUD!|"),
    );
  }));
