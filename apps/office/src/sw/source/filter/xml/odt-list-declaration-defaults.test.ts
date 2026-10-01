/** @fileoverview Verifies native optional list-level defaults and index parsing through literal ODT packages. */
import { getWriterNumFormatKind, getWriterNumFormatBullet } from "../../core/doc/number";

import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Inserts literal declarations and two list depths in a genuine common or automatic package. @param bytes - Baseline. @param levels - Source declarations. @param common - Common styles selection. @returns Package bytes. */
async function input(bytes: Uint8Array, levels: string, common: boolean) {
  const zip = new ZipFile(bytes),
    output = new ZipOutputStream();
  const definition = `<text:list-style style:name="Defaults">${levels}</text:list-style>`;
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" && common) {
      const xml = (await zip.readTextEntry(entry)).replace(
        "</office:styles>",
        `${definition}</office:styles>`,
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else if (entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (!common)
        xml = xml.replace("</office:automatic-styles>", `${definition}</office:automatic-styles>`);
      xml = xml.replace(
        /<office:text>[\s\S]*?<\/office:text>/u,
        '<office:text><text:list text:style-name="Defaults"><text:list-item><text:p>a</text:p><text:list><text:list-item><text:p>b</text:p></text:list-item></text:list></text:list-item></text:list></office:text>',
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

it("retains native declaration defaults and skips invalid indices before reading properties", /** Checks manual common/automatic ODT states, markers, copied/snapshotted fields and reopen. @returns Completion. */ async () => {
  const original = writeOdtDocument(createWriterDocument(), { title: "Defaults" });
  const cases: readonly {
    source: string;
    applied: number;
    bullet: string | undefined;
    legacy?: boolean;
  }[] = [
    { source: "<text:list-level-style-number/>", applied: -1, bullet: undefined },
    {
      source: '<text:list-level-style-number style:num-format="i"/>',
      applied: -1,
      bullet: undefined,
    },
    {
      source: '<text:list-level-style-bullet text:level="11" text:bullet-char="■"/>',
      applied: -1,
      bullet: undefined,
    },
    {
      source: '<text:list-level-style-number text:level="2147483647" style:num-format="i"/>',
      applied: -1,
      bullet: undefined,
    },
    ...["", "0", "-7", "1.5", "2147483648", "-2147483649", "9223372036854775808", "&#x2003;2"].map(
      /** Builds present attributes that normalize to index zero. @param value - Source integer spelling. @returns Literal case. */
      (value) => ({
        source: `<text:list-level-style-bullet text:level="${value}"/>`,
        applied: 0,
        bullet: "",
      }),
    ),
    { source: '<text:list-level-style-number text:level="2junk"/>', applied: 1, bullet: undefined },
    {
      source: '<text:list-level-style-bullet text:level="+2" text:bullet-char="😀rest"/>',
      applied: 1,
      bullet: "😀",
    },
    {
      source: '<text:list-level-style-bullet text:level="10" text:bullet-char="■"/>',
      applied: 9,
      bullet: "■",
    },
    {
      source:
        '<style:list-level-properties><text:list-level-style-bullet text:level="1" text:bullet-char="■"/></style:list-level-properties>',
      applied: -1,
      bullet: undefined,
    },
    {
      source:
        '<foreign:list-level-style-image xmlns:foreign="urn:foreign"><text:list-level-style-bullet text:level="1" text:bullet-char="■"/></foreign:list-level-style-image>',
      applied: 0,
      bullet: "■",
    },
    {
      source: '<text:unknown><text:list-level-style-bullet text:level="1"/></text:unknown>',
      applied: 0,
      bullet: "",
    },
    {
      source:
        '<foreign:any xmlns:foreign="urn:foreign"><text:list-level-style-bullet text:level="1"/></foreign:any>',
      applied: 0,
      bullet: "",
    },
    {
      source:
        '<text:list-level-style-number text:level="1"><foreign:any xmlns:foreign="urn:foreign"><style:list-level-properties text:space-before="1mm"/></foreign:any><style:text-properties text:space-before="1mm" text:min-label-width="2mm"/></text:list-level-style-number>',
      applied: 0,
      bullet: undefined,
      legacy: true,
    },
  ];
  for (const common of [false, true])
    for (const testCase of cases) {
      const diagnostics: string[] = [];
      const document = (
        await readOdtDocument(
          await input(original, testCase.source, common),
          { title: "Defaults" },
          undefined,
          {
            /** Captures structural diagnostics while avoiding document content. @param diagnostic - Native adapter event. @returns Nothing. */
            onDiagnostic: (diagnostic) => {
              diagnostics.push(diagnostic.name);
            },
          },
        )
      ).document;
      const rule = document.FindNumRulePtr("Defaults");
      if (rule === undefined) throw new Error("Fixture lost its rule");
      const copied = rule.clone(),
        restored = decodeWriterDocument(encodeWriterDocument(document)).FindNumRulePtr("Defaults");
      if (restored === undefined) throw new Error("Fixture snapshot lost its rule");
      for (let level = 0; level < 10; level += 1) {
        const applied = level === testCase.applied,
          format = rule.Get(level);
        const kind = applied && testCase.bullet !== undefined ? "bullet" : "numbered";
        expect(getWriterNumFormatKind(format), testCase.source).toBe(kind);
        expect(format.GetSuffix()).toBe(applied ? "" : ".");
        expect(getWriterNumFormatBullet(format)).toBe(
          kind === "bullet" ? testCase.bullet : ["•", "◦", "▪"][level % 3],
        );
        const position = {
          positionAndSpaceMode: applied ? "label-width-and-position" : "label-alignment",
          absLSpace: applied && testCase.legacy ? 170 : 0,
          firstLineOffset: applied && testCase.legacy ? -113 : 0,
          charTextDistance: 0,
          firstLineIndent: applied ? 0 : -360,
          indentAt: applied ? 0 : 720 + level * 360,
          labelFollowedBy: "listtab",
          listTabPosition: applied ? 0 : 720 + level * 360,
        };
        expect(format.GetPositionProperties()).toEqual(position);
        expect(copied.Get(level).GetPositionProperties()).toEqual(position);
        expect(restored.Get(level).GetPositionProperties()).toEqual(position);
        expect(getWriterNumFormatBullet(restored.Get(level))).toBe(
          getWriterNumFormatBullet(format),
        );
      }
      expect(
        document.paragraphs.map(
          /** Reads native visible labels. @param paragraph - Writer node. @returns Label. */ (
            paragraph,
          ) => paragraph.GetListLabel(),
        ),
      ).toEqual(
        [0, 1].map(
          /** Supplies manual markers. @param level - List depth. @returns Label. */ (level) =>
            level === testCase.applied ? (testCase.bullet ?? "1") : "1.",
        ),
      );
      const exported = writeOdtDocument(document, { title: "Defaults" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      if (testCase.bullet === "") expect(xml).toContain('text:bullet-char=""');
      const reopened = (
        await readOdtDocument(exported, { title: "Defaults" })
      ).document.FindNumRulePtr("Defaults");
      if (reopened === undefined) throw new Error("Reopen lost its rule");
      for (let level = 0; level < 10; level += 1) {
        expect(getWriterNumFormatKind(reopened.Get(level))).toBe(
          getWriterNumFormatKind(rule.Get(level)),
        );
        expect(getWriterNumFormatBullet(reopened.Get(level))).toBe(
          getWriterNumFormatBullet(rule.Get(level)),
        );
        expect(reopened.Get(level).GetPositionProperties()).toEqual(
          rule.Get(level).GetPositionProperties(),
        );
      }
      if (testCase.source.includes("foreign:"))
        expect(
          diagnostics.some(
            /** Finds native unknown child diagnostics. @param name - Qualified name. @returns Match. */ (
              name,
            ) => name.startsWith("foreign:"),
          ),
        ).toBe(true);
    }
});
