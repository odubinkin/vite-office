/** @fileoverview Verifies signed table LR geometry retains canonical ownership across ODF cycles. */
import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { importWriterXml } from "./xmlimp";
import { exportStylesXml } from "./xmlexp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";

/** Imports literal supported table properties. @param attributes - Authored ODF values. @returns Native document. */
function open(attributes: string) {
  const namespaces = Object.entries(ODF_NAMESPACES)
    .map(
      /** Emits literal namespace declarations. @param pair - Prefix and URI. @returns XML declaration. */ ([
        prefix,
        uri,
      ]) => `xmlns:${prefix}="${uri}"`,
    )
    .join(" ");
  return importWriterXml(
    exportStylesXml(createWriterDocument()),
    `<office:document-content ${namespaces} office:version="1.3"><office:automatic-styles><style:style style:name="T" style:family="table"><style:table-properties ${attributes}/></style:style><style:style style:name="C" style:family="table-column"><style:table-column-properties style:column-width="1in"/></style:style></office:automatic-styles><office:body><office:text><text:p>Before</text:p><table:table table:name="Geometry" table:style-name="T"><table:table-column table:style-name="C"/><table:table-column table:style-name="C"/><table:table-row><table:table-cell><text:p>A</text:p></table:table-cell><table:table-cell><text:p>B</text:p></table:table-cell></table:table-row></table:table></office:text></office:body></office:document-content>`,
    { title: "Geometry" },
    undefined,
    {
      onDiagnostic:
        /** Captures no unsupported diagnostics in valid fixtures. @returns Nothing. */ () =>
          undefined,
    },
  ).document;
}
describe("ODF native table print area", /** Registers native model/filter cases without upstream execution. @returns Nothing. */ () => {
  for (const [align, left, right, width] of [
    ["left", -360, 120, 2880],
    ["center", 360, 120, 2880],
    ["right", 360, -120, 2880],
    ["margins", -360, 120, 8240],
  ] as const)
    it(`retains ${align} signed LR and source geometry through two ODF cycles`, /** Checks values and actual canonical box/text identity. @returns Completion. */ async () => {
      let doc = open(
        `table:align="${align}" style:width="2in" fo:margin-left="${left / 1440}in" fo:margin-right="${right / 1440}in"`,
      );
      for (let cycle = 0; cycle < 3; cycle++) {
        const table = doc.GetTables()[0];
        if (table === undefined) throw new Error("Missing native table");
        expect(table.GetFormat()).toMatchObject({ align, width: 2880 });
        expect(table.GetFormat().marginLeft).toBe(
          cycle === 0 || align === "left" || align === "margins" ? left : undefined,
        );
        expect(table.GetFormat().marginRight).toBe(
          cycle === 0 || align === "margins" ? right : undefined,
        );
        expect(new SwTabFrame(table).Format(8000).width).toBe(width);
        expect(table.GetColumnWidths()).toEqual([1440, 1440]);
        expect(
          table
            .GetTabLines()[0]
            ?.GetTabBoxes()
            .map(
              /** Reads canonical cell text. @param box - Native cell. @returns Text. */ (box) =>
                box.GetParagraphs()[0]?.GetText(),
            ),
        ).toEqual(["A", "B"]);
        if (cycle < 2)
          doc = (
            await readOdtDocument(writeOdtDocument(doc, { title: "Geometry" }), {
              title: "Geometry",
            })
          ).document;
      }
    });
  it("retains omitted margins and default FULL without inventing direct properties", /** Checks authored absence remains absent in native model. @returns Nothing. */ () => {
    const table = open('style:width="2in"').GetTables()[0];
    if (table === undefined) throw new Error("Missing native table");
    expect(table.GetFormat()).toEqual({
      width: 2880,
      horiOrient: 6,
      align: "margins",
      headerRows: 0,
      repeatHeaderRows: false,
    });
    expect(new SwTabFrame(table).Format(8000)).toEqual({ left: 0, right: 0, width: 8000 });
  });
  it("rejects malformed right lengths rather than silently swallowing admitted geometry", /** Checks current strict filter diagnostics. @returns Nothing. */ () => {
    expect(
      /** Imports malformed authored geometry. @returns Document or error. */ () =>
        open('table:align="margins" fo:margin-right="bad"'),
    ).toThrow("Unsupported ODF table margin");
  });
});
