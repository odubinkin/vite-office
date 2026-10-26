/** @fileoverview Original Word style-name suffix allocation and finite stylesheet slot contracts. */
import { assert, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { RtfExport } from "./rtfexport";
import { MSWordStyles } from "./wrtw8sty";

it("allocates case-insensitive Word suffixes past existing numeric names", /** Checks the native style table rather than renaming the actual Writer collections. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    const parent = doc.GetDfltTextFormatColl();
    const numbered = doc.MakeTextFormatColl("Normal1", parent);
    const first = doc.MakeTextFormatColl("Normal", parent);
    const second = doc.MakeTextFormatColl("NORMAL", parent);
    const styles = new MSWordStyles(doc);
    expect(styles.GetWWName(numbered)).toBe("Normal1");
    expect(styles.GetWWName(first)).toBe("Normal2");
    expect(styles.GetWWName(second)).toBe("NORMAL3");
    expect(first.GetName()).toBe("Normal");
    expect(second.GetName()).toBe("NORMAL");
  } finally {
    doc.Dispose();
  }
});

it("retains the native 4091-slot bound and missing-style sentinel", /** Checks an actual overflow collection through the Word table and RTF export. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    const parent = doc.GetDfltTextFormatColl();
    for (let index = 0; index < 4092; index++) doc.MakeTextFormatColl(`Bounded ${index}`, parent);
    const overflow = doc.MakeTextFormatColl("Overflow style", parent);
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    paragraph.SetText("Overflow paragraph");
    paragraph.ChgFormatColl(overflow);
    const styles = new MSWordStyles(doc);
    expect(styles.GetStyles()).toHaveLength(4091);
    expect(styles.GetSlot(overflow)).toBe(0x0fff);
    expect(styles.GetSlot(undefined)).toBe(0x0fff);
    expect(styles.GetWWName(overflow)).toBe("Overflow style");
    const rtf = new TextDecoder().decode(new RtfExport().ExportDocument(doc));
    expect(rtf).not.toContain(" Overflow style;");
    const body = rtf.slice(rtf.lastIndexOf("\\pard"));
    expect(body).toContain("Overflow paragraph");
    expect(body).not.toMatch(/\\s\d+/u);
  } finally {
    doc.Dispose();
  }
});
