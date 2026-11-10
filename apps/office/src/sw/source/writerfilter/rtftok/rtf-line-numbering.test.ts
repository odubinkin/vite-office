/** @fileoverview Native RTF line number controls through the mapper and Writer document service. */
import { existsSync, readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_LINENUMBER } from "../../../inc/hintids";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwDoc } from "../../core/doc/doc";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { RtfDocumentImpl } from "./rtfdocumentimpl";

/** Reads a complete native RTF byte stream. @param source - Original source text. @returns Connected Writer document. */
function read(source: string): SwDoc {
  return new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
}

const fixture = "../../vendor/libreoffice-reference/sw/qa/extras/rtfexport/data/linenumbering.rtf";

it.skipIf(!existsSync(fixture))(
  "round trips the pinned RTF line numbering fixture",
  /** Uses the original file and asserts the represented native properties on both documents. @returns Nothing. */
  () => {
    const reader = new RtfDocumentImpl();
    const imported = reader.ResolveBytes(readFileSync(fixture));
    try {
      const data = RtfExport.WriteDocument(imported);
      expect(new TextDecoder().decode(data)).toContain(String.raw`\linemod5\linex283\linecont`);
      const reopened = new RtfDocumentImpl().ResolveBytes(data);
      try {
        for (const doc of [imported, reopened]) {
          const info = doc.GetLineNumberInfo();
          expect(info.IsPaintLineNumbers()).toBe(true);
          expect(info.GetCountBy()).toBe(5);
          expect(info.GetPosFromLeft()).toBe(283);
          expect(info.IsRestartEachPage()).toBe(false);
        }
      } finally {
        reopened.Dispose();
      }
    } finally {
      imported.Dispose();
    }
  },
);

it("uses the original explicit paragraph exclusion control and the reader's distance erasure", /** Retains the asymmetric NOLINE source behavior. @returns Nothing. */ () => {
  const source = new SwDoc();
  try {
    const info = source.GetLineNumberInfo();
    info.SetPaintLineNumbers(true);
    info.SetRestartEachPage(true);
    info.SetCountBy(7);
    info.SetPosFromLeft(420);
    source.SetLineNumberInfo(info);
    const paragraph = source.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("Excluded");
    const excluded = new SfxBoolItem(RES_LINENUMBER, false);
    try {
      paragraph.SetAttr(excluded);
    } finally {
      excluded.Dispose();
    }
    const data = RtfExport.WriteDocument(source);
    const syntax = new TextDecoder().decode(data);
    expect(syntax).toContain(String.raw`\linemod7\linex420`);
    expect(syntax).toContain(String.raw`\noline`);
    expect(syntax).not.toContain(String.raw`\linecont`);
    const reopened = new RtfDocumentImpl().ResolveBytes(data);
    try {
      const actual = reopened.GetLineNumberInfo();
      expect(actual.IsPaintLineNumbers()).toBe(true);
      expect(actual.IsRestartEachPage()).toBe(true);
      expect(actual.GetCountBy()).toBe(7);
      expect(actual.GetPosFromLeft()).toBe(283);
      expect((reopened.paragraphs[0]?.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(
        true,
      );
    } finally {
      reopened.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it.each([
  [8, true, 8],
  [0, false, 4],
] as const)(
  "updates the document-wide line number settings for a later interval %i",
  /** Later section resources override the count and retain shared settings when omitted. @param interval - Later interval. @param paint - Expected paint flag. @param count - Expected stored count. @returns Nothing. */
  (interval, paint, count) => {
    const doc = read(
      String.raw`{\rtf1\sectd\linemod4\linex420\linecont First\par\sect\sectd\linemod${interval} Second\par}`,
    );
    try {
      const info = doc.GetLineNumberInfo();
      expect(info.IsPaintLineNumbers()).toBe(paint);
      expect(info.GetCountBy()).toBe(count);
      expect(info.GetPosFromLeft()).toBe(420);
      expect(info.IsRestartEachPage()).toBe(false);
    } finally {
      doc.Dispose();
    }
  },
);

it("writes later section line numbering before the buffered section controls", /** Keeps the original stream and section buffer ordering. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const info = doc.GetLineNumberInfo();
    info.SetPaintLineNumbers(true);
    doc.SetLineNumberInfo(info);
    const page = doc.MakePageDesc("Second", doc.GetPageDesc());
    page.SetFollow(null);
    doc.paragraphs[0]?.SetText("First");
    const item = new SwFormatPageDesc("Second");
    try {
      doc.nodes.MakeTextNode("Second").SetAttr(item);
    } finally {
      item.Dispose();
    }
    const rtf = new TextDecoder().decode(RtfExport.WriteDocument(doc));
    expect(rtf).toContain(String.raw`\linemod5\linex283\linecont\sect\sectd`);
  } finally {
    doc.Dispose();
  }
});
