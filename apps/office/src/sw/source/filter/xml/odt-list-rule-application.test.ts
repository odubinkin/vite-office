/** @fileoverview Verifies native ordered list replacement, base defaults and failure retention in genuine ODT cycles. */
import {
  getWriterNumFormatKind,
  getWriterNumFormatBullet,
  type ConstSwNumFormat,
} from "../../core/doc/number";

import { expect, it, vi } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwXNumberingRules } from "../../core/unocore/unosett";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

/** Declares a literal supported level without deriving its values from production. @param level - One-based level. @param bullet - Bullet character or undefined for Arabic. @param properties - Literal property children. @returns Source declaration. */
function declaration(level: number, bullet?: string, properties = ""): string {
  const tag = bullet === undefined ? "number" : "bullet";
  const marker = bullet === undefined ? 'style:num-format="1"' : `text:bullet-char="${bullet}"`;
  return `<text:list-level-style-${tag} text:level="${level}" ${marker}>${properties}</text:list-level-style-${tag}>`;
}

/** Supplies manually source-derived modern NUM_RULE defaults. @param level - Zero-based level. @returns Base state. */
function base(level: number) {
  return {
    kind: "numbered",
    bullet: ["•", "◦", "▪"][level % 3],
    font: "",
    suffix: ".",
    position: {
      absLSpace: 0,
      firstLineOffset: 0,
      charTextDistance: 0,
      firstLineIndent: -360,
      indentAt: 720 + level * 360,
      labelFollowedBy: "listtab",
      listTabPosition: 720 + level * 360,
      positionAndSpaceMode: "label-alignment",
    },
  };
}

/** Supplies manually source-derived zero properties from a bare XML declaration. @param level - Zero-based level. @param bullet - Bullet or undefined for Arabic. @returns Applied state. */
function applied(level: number, bullet?: string) {
  return {
    ...base(level),
    kind: bullet === undefined ? "numbered" : "bullet",
    bullet: bullet ?? base(level).bullet,
    suffix: "",
    position: {
      absLSpace: 0,
      firstLineOffset: 0,
      charTextDistance: 0,
      firstLineIndent: 0,
      indentAt: 0,
      labelFollowedBy: "listtab",
      listTabPosition: 0,
      positionAndSpaceMode: "label-width-and-position",
    },
  };
}

/** Projects the fields under audit without calling a production default factory. @param format - Writer format. @returns Audited state. */
function state(format: ConstSwNumFormat) {
  return {
    kind: getWriterNumFormatKind(format),
    bullet: getWriterNumFormatBullet(format),
    font: format.GetBulletFont()?.GetFamilyName() ?? "",
    suffix: format.GetSuffix(),
    position: format.GetPositionProperties(),
  };
}

/** Injects source-ordered declarations in a common or automatic real ODT. @param bytes - Baseline package. @param levels - Literal declarations. @param common - Common styles selection. @returns Package bytes. */
async function input(bytes: Uint8Array, levels: string, common: boolean) {
  const zip = new ZipFile(bytes),
    output = new ZipOutputStream();
  const definition = `<text:list-style style:name="Ordered">${levels}</text:list-style>`;
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
        '<office:text><text:list text:style-name="Ordered"><text:list-item><text:p>a</text:p><text:list><text:list-item><text:p>b</text:p><text:list><text:list-item><text:p>c</text:p></text:list-item></text:list></text:list-item></text:list></text:list-item></text:list></office:text>',
      );
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}

it("applies list declarations in source order and stops at native property rejection", /** Checks complete manual state, markers, snapshots, copies, selected XML and reopen for both containers. @returns Completion. */ async () => {
  const original = writeOdtDocument(createWriterDocument(), { title: "Ordered" });
  for (const modern of [false, true]) {
    const mode = modern ? ' text:list-level-position-and-space-mode="label-alignment"' : "";
    // GetProperties narrows unsigned MM100 distance to sal_Int16 before Writer rejects it.
    const invalid = `<style:list-level-properties text:space-before="1.27mm" text:min-label-distance="327.68mm"${mode}/>`;
    const overflow = `<style:list-level-properties text:min-label-distance="655.35mm"${mode}/>`;
    const cases = [
      { levels: "", changes: new Map<number, ReturnType<typeof applied>>() },
      { levels: declaration(1, "●"), changes: new Map([[0, applied(0, "●")]]) },
      {
        levels: declaration(3, "■") + declaration(1),
        changes: new Map([
          [2, applied(2, "■")],
          [0, applied(0)],
        ]),
      },
      {
        levels: declaration(2, "●") + declaration(2),
        changes: new Map([[1, { ...applied(1), bullet: "●" }]]),
      },
      { levels: declaration(1) + declaration(1, "■"), changes: new Map([[0, applied(0, "■")]]) },
      {
        levels: declaration(2, "■", invalid) + declaration(1, "●"),
        changes: new Map<number, ReturnType<typeof applied>>(),
      },
      {
        levels: declaration(3, "■") + declaration(2, "●", invalid) + declaration(1),
        changes: new Map([[2, applied(2, "■")]]),
      },
      {
        levels: declaration(2, "●") + declaration(2, "■", invalid) + declaration(1),
        changes: new Map([[1, applied(1, "●")]]),
      },
      {
        levels: declaration(1, "●", overflow) + declaration(2, "■"),
        changes: new Map<number, ReturnType<typeof applied>>(),
      },
    ];
    for (const common of [false, true])
      for (const testCase of cases) {
        const document = (
          await readOdtDocument(await input(original, testCase.levels, common), {
            title: "Ordered",
          })
        ).document;
        const rule = document.FindNumRulePtr("Ordered");
        if (rule === undefined) throw new Error("Fixture has no native rule");
        expect(rule.IsAutoRule()).toBe(!common);
        const copied = rule.clone(),
          restored = decodeWriterDocument(encodeWriterDocument(document)).FindNumRulePtr("Ordered");
        if (restored === undefined) throw new Error("Fixture snapshot lost its rule");
        for (let level = 0; level < 10; level += 1) {
          const expected = testCase.changes.get(level) ?? base(level);
          expect(state(rule.Get(level)), testCase.levels).toEqual(expected);
          expect(state(copied.Get(level))).toEqual(expected);
          expect(state(restored.Get(level))).toEqual(expected);
        }
        const current = document.paragraphs[0];
        if (current === undefined) throw new Error("Fixture lost its current node");
        const projection = new WriterViewProjection().Project(
          document,
          current,
          new SwPaM(new SwPosition(current, 0)),
          createDocument({ id: "ordered", suiteId: "writer", title: "Ordered" }),
        ).paragraphs;
        expect(
          projection.map(
            /** Reads the primitive marker. @param paragraph - Projected paragraph. @returns Marker. */ (
              paragraph,
            ) => paragraph.listMarker,
          ),
        ).toEqual(
          [0, 1, 2].map(
            /** Reads the manual expected marker. @param level - Level. @returns Marker. */ (
              level,
            ) => {
              const expected = testCase.changes.get(level) ?? base(level);
              return expected.kind === "bullet" ? expected.bullet : `1${expected.suffix}`;
            },
          ),
        );
        const exported = writeOdtDocument(document, { title: "Ordered" });
        const xml = await new ZipFile(exported).readTextEntry("content.xml");
        expect(xml).not.toContain("327.68mm");
        const reopened = (
          await readOdtDocument(exported, { title: "Ordered" })
        ).document.FindNumRulePtr("Ordered");
        if (reopened === undefined) throw new Error("Reopened fixture lost its rule");
        for (let level = 0; level < 10; level += 1) {
          const expected = testCase.changes.get(level) ?? base(level);
          // Numeric XML does not export inactive bullet chars; reopening starts from the native base.
          expect(state(reopened.Get(level))).toEqual({
            ...expected,
            ...(expected.kind === "numbered" ? { bullet: base(level).bullet } : {}),
          });
        }
      }
  }
});

it("retains the native accepted distance boundary and its subsequent export rejection", /** Checks sal_Int16 input acceptance and native quantization crossing that boundary on reopen. @returns Completion. */ async () => {
  const original = writeOdtDocument(createWriterDocument(), { title: "Boundary" });
  const levels =
    declaration(1, "●", '<style:list-level-properties text:min-label-distance="327.67mm"/>') +
    declaration(2, "■");
  const document = (
    await readOdtDocument(await input(original, levels, false), { title: "Boundary" })
  ).document;
  expect(document.FindNumRulePtr("Ordered")?.Get(0).GetCharTextDistance()).toBe(18577);
  const exported = writeOdtDocument(document, { title: "Boundary" });
  const xml = await new ZipFile(exported).readTextEntry("content.xml");
  expect(xml).toContain('text:min-label-distance="32.768cm"');
  const reopened = (await readOdtDocument(exported, { title: "Boundary" })).document.FindNumRulePtr(
    "Ordered",
  );
  if (reopened === undefined) throw new Error("Boundary fixture lost its rule");
  for (let level = 0; level < 10; level += 1)
    expect(state(reopened.Get(level))).toEqual(base(level));
});

it("propagates unrelated application failures instead of treating them as a UNO rejection", /** Ensures programmer errors retain their import failure rather than a silent partial document. @returns Nothing. */ () => {
  const failure = vi.spyOn(SwXNumberingRules.prototype, "replaceByIndex").mockImplementation(
    /** Injects an unrelated failure. @returns Never. */ () => {
      throw new Error("Unrelated application failure");
    },
  );
  try {
    // Use the synchronous XML bridge so the spy's lifetime covers the complete call.
    const xml =
      '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.3"><office:automatic-styles><text:list-style style:name="Ordered">' +
      declaration(1) +
      "</text:list-style></office:automatic-styles><office:body><office:text><text:p/></office:text></office:body></office:document-content>";
    expect(
      /** Imports through the normal SAX wrapper. @returns Failed import. */ () =>
        importWriterXml(
          '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" office:version="1.3"><office:styles><style:style style:name="Standard" style:family="paragraph"/></office:styles></office:document-styles>',
          xml,
          { title: "Failure" },
        ),
    ).toThrow("ODF XML is malformed.");
  } finally {
    failure.mockRestore();
  }
});
