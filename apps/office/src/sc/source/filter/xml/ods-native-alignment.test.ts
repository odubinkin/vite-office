/** @fileoverview Actual ODS alignment property groups and native shared horizontal merge semantics. */
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify as H, SvxCellVerJustify as V } from "../../../../editeng/inc/svxenum";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { SfxItemState } from "../../../../svl/source/items/itemset";
/** Reads real pattern alignment. @param doc - Document. @param col - Column. @returns Native pair. */
function alignment(doc: ScDocument, col = 0): readonly number[] {
  const pattern = doc.GetPattern(new ScAddress(col, 0, 0)) as ScPatternAttr;
  return [
    (pattern.GetItem(129) as SvxHorJustifyItem).GetValue(),
    (pattern.GetItem(132) as SvxVerJustifyItem).GetValue(),
  ];
}
/** Produces independent XML without using the production exporter. @param groups - Explicit style property groups. @returns Document bytes as XML text. */
function xml(groups: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell">${groups}</style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="ce"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("writes original paragraph/cell alignment groups and keeps all native values across repeated package reopens", /** Tests real native document bytes. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    for (let col = 0; col < 6; col++) {
      c.Select(col, 0);
      c.SetAlignment("horizontal", col, false);
      c.SetAlignment("vertical", col % 5, false);
    }
    let bytes = writeOdsDocument(c.shell.GetDocument());
    const content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('style:text-align-source="value-type"');
    expect(content).toContain('style:repeat-content="true"');
    expect(content).toContain('<style:paragraph-properties fo:text-align="center"/>');
    expect(content).toContain('style:vertical-align="middle"');
    for (let cycle = 0; cycle < 3; cycle++) {
      const doc = await readOdsDocument(bytes);
      try {
        for (let col = 0; col < 6; col++) expect(alignment(doc, col)).toEqual([col, col % 5]);
        bytes = writeOdsDocument(doc);
      } finally {
        doc.DisposeAttributes();
      }
    }
  } finally {
    session.Close();
  }
});
it("imports independent cell/paragraph groups with original shared-Any ordering and no-write fix/false semantics", /** Runs native contexts with real SAX group order. @returns Nothing. */ () => {
  const cases: readonly (readonly [string, number, number])[] = [
    [
      '<style:paragraph-properties fo:text-align="end"/><style:table-cell-properties style:text-align-source="fix" style:repeat-content="false" style:vertical-align="top"/>',
      H.Right,
      V.Top,
    ],
    [
      '<style:table-cell-properties style:text-align-source="fix" style:vertical-align="middle"/><style:paragraph-properties fo:text-align="center"/>',
      H.Center,
      V.Center,
    ],
    [
      '<style:paragraph-properties fo:text-align="end"/><style:table-cell-properties style:text-align-source="value-type"/>',
      H.Standard,
      V.Standard,
    ],
    [
      '<style:table-cell-properties style:repeat-content="true"/><style:paragraph-properties fo:text-align="end"/>',
      H.Repeat,
      V.Standard,
    ],
    [
      '<style:paragraph-properties fo:text-align="justify"/><style:table-cell-properties style:repeat-content="true" style:vertical-align="justify"/>',
      H.Repeat,
      V.Block,
    ],
    [
      '<style:table-cell-properties style:text-align-source="fix" style:repeat-content="false"/>',
      H.Standard,
      V.Standard,
    ],
    ["<style:paragraph-properties/>", H.Standard, V.Standard],
  ];
  for (const [groups, horizontal, vertical] of cases) {
    const doc = new ScDocument();
    try {
      const diagnostics: string[] = [],
        importer = new ScXMLImport(doc, {
          onDiagnostic:
            /** Records actual import diagnostics. @param item - Original diagnostic. @returns Nothing. */ (
              item,
            ) => {
              diagnostics.push(item.name);
            },
        });
      importer.importContent(xml(groups));
      expect(alignment(doc)).toEqual([horizontal, vertical]);
      expect(diagnostics).toEqual([]);
      if (groups.includes('style:text-align-source="fix" style:repeat-content="false"/>'))
        expect(
          (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItemSet().GetItemState(129, false),
        ).toBe(SfxItemState.DEFAULT);
    } finally {
      doc.DisposeAttributes();
    }
  }
});
it("diagnoses invalid supported values and unported paragraph scopes while retaining native defaults", /** Does not silently normalize invalid lexical values. @returns Nothing. */ () => {
  const doc = new ScDocument();
  try {
    const diagnostics: string[] = [],
      importer = new ScXMLImport(doc, {
        onDiagnostic:
          /** Records actual import diagnostics. @param item - Original diagnostic. @returns Nothing. */ (
            item,
          ) => {
            diagnostics.push(item.name);
          },
      });
    importer.importContent(
      xml(
        '<style:paragraph-properties fo:text-align="left"><style:text-properties/></style:paragraph-properties><style:table-cell-properties style:text-align-source="invalid" style:repeat-content="invalid" style:vertical-align="center"/>',
      ),
    );
    expect(alignment(doc)).toEqual([H.Standard, V.Standard]);
    expect(diagnostics).toHaveLength(5);
  } finally {
    doc.DisposeAttributes();
  }
});
