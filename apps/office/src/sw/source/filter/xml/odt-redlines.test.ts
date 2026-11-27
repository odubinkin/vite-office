/** @fileoverview LibreOffice ODT redline fixtures through native Writer nodes and Worker transfer. */
import { GetRedlineAuthor } from "../../core/doc/docredln";
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { RedlineType } from "../../../../svx/inc/ctredlin";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { importWriterXml } from "./xmlimp";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Writer tracked changes" };
const fixtures = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";

/** Checks the original model, the Worker result and the next ODT import. @param document - Imported fixture. @param check - Original core assertion. @returns Saved content stream. */
async function roundTrip(document: SwDoc, check: (document: SwDoc) => void): Promise<string> {
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    check(document);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    check(worker);
    const output = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(output, metadata)).document;
    check(reopened);
    const archive = await DocumentArchive.open(output);
    return await archive.readTextEntry("content.xml");
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
}

it("exports a full midnight datetime from testMidnightRedlineDatetime", /** Ports the original dateTime assertion through ODT. @returns Completion. */ async () => {
  const fixture = readFileSync(`${fixtures}/midnight_redline.fodt`, "utf8");
  const content = fixture.replaceAll("office:document", "office:document-content");
  const { document } = importWriterXml(undefined, content, metadata);
  const saved = await roundTrip(document, (model) => {
    const owner = model.GetIDocumentRedlineAccess();
    const ranges = owner.GetRedlineTable().entries();
    expect(ranges).toHaveLength(1);
    const [range] = ranges;
    assert(range);
    expect(range.GetRedlineData().GetType()).toBe(RedlineType.Delete);
    expect(GetRedlineAuthor(range.GetRedlineData().GetAuthor())).toBe("John Doe");
    expect(range.Start().GetNode().GetTextNode()?.GetText()).toBe("Deleted text");
    expect([range.Start().GetContentIndex(), range.End().GetContentIndex()]).toEqual([0, 12]);
  });
  expect(saved).toContain("<dc:date>2001-01-01T00:00:00</dc:date>");
  expect(saved).toContain('text:track-changes="false"');
});

it("retains the two change portions around a single space in testWhitespace", /** Ports the two original redline portion sequences. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${fixtures}/whitespace.odt`)),
    metadata,
  );
  await roundTrip(document, (model) => {
    const ranges = model.GetIDocumentRedlineAccess().GetRedlineTable().entries();
    expect(ranges).toHaveLength(2);
    for (const range of ranges) {
      const start = range.Start();
      const end = range.End();
      expect(start.GetNode()).toBe(end.GetNode());
      const text = start.GetNode().GetTextNode()?.GetText();
      assert(text);
      const from = start.GetContentIndex();
      const to = end.GetContentIndex();
      expect([text.slice(0, from), text.slice(from, to), text.slice(to)]).toEqual([
        "X ",
        " ",
        " X",
      ]);
    }
  });
});

it("restores same-position deletions in their original order from testTdf107292", /** Ports the original paragraph assertion after saved deletes are shown. @returns Completion. */ async () => {
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(`${fixtures}/tdf107292.odt`)),
    metadata,
  );
  await roundTrip(document, (model) => {
    const ranges = model.GetIDocumentRedlineAccess().GetRedlineTable().entries();
    expect(ranges).toHaveLength(3);
    expect(model.paragraphs[0]?.GetText()).toBe("Lorem ipsum dolor sit...");
    expect(
      ranges.map((range) => [range.Start().GetContentIndex(), range.End().GetContentIndex()]),
    ).toEqual([
      [0, 6],
      [6, 11],
      [11, 18],
    ]);
  });
});
