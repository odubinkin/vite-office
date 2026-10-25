/** @fileoverview Verifies the connected native page offset XML/property/worker contracts and source scalar discontinuities. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { RES_PAGEDESC } from "../../../inc/hintids";
import { importWriterXml } from "./xmlimp";
import { exportContentXml, exportStylesXml } from "./xmlexp";
import { createOdtFilterDocument } from "./odt-filter-service";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocument,
  createOdtWorkerDocumentAsync,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
it("preserves zero,absence and high offsets through actual synchronous and asynchronous worker envelopes", /** Real document ownership remains with existing codecs. @returns Completion. */ async () => {
  for (const offset of [undefined, 0, 32767, 32768, 55535, 65535]) {
    const doc = new SwDoc();
    doc.paragraphs[0]?.SetAttr(new SwFormatPageDesc("Standard", offset));
    const filter = createOdtFilterDocument(doc, "Offsets");
    const sync = restoreOdtWorkerDocument(structuredClone(createOdtWorkerDocument(filter)));
    const async = await restoreOdtWorkerDocumentAsync(
      structuredClone(
        await createOdtWorkerDocumentAsync(
          filter,
          /** Keeps the real worker operation current. @returns False. */ () => false,
        ),
      ),
      undefined,
      /** Keeps the real worker operation current. @returns False. */ () => false,
    );
    for (const result of [sync, async])
      expect(
        (result.document.paragraphs[0]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
      ).toBe(offset);
  }
});
it("uses native signed16 saturation and invalid-property fallback at actual ODT style import", /** Explicit source saturation is distinct from unsigned16 internal reinterpretation. @returns Nothing. */ () => {
  const doc = new SwDoc();
  doc.paragraphs[0]?.SetAttr(new SwFormatPageDesc("Standard", 3));
  const styles = exportStylesXml(doc),
    content = exportContentXml(doc);
  for (const [input, offset] of [
    ["0", 0],
    ["32767", 32767],
    ["32768", 32767],
    ["65535", 32767],
    ["-1", 65535],
    ["-32768", 32768],
    ["-32769", 32768],
    ["2147483648", 32767],
    ["auto", undefined],
    ["bad", undefined],
    ["AUTO", undefined],
    ["", 0],
  ] as const) {
    const result = importWriterXml(
      styles,
      content.replace('style:page-number="3"', `style:page-number="${input}"`),
      { title: "Offsets" },
    );
    expect(
      (result.document.paragraphs[0]?.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
      input,
    ).toBe(offset);
  }
});
