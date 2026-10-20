/** @fileoverview Original text-wrap XML handler and actual ODS automatic-style/row geometry transport. */
import { expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { XmlScPropHdl_IsTextWrapped } from "./xmlstyle";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScLineBreakCell } from "../../../inc/attrib";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
it("preserves exact wrap/no-wrap conversion and unchanged output Any on invalid lexical input", /** Checks native handler contracts independently. @returns Nothing. */ () => {
  const h = new XmlScPropHdl_IsTextWrapped(),
    u = new SvXMLUnitConverter("twip"),
    a = new Any(),
    b = new Any(),
    out: [string] = ["previous"];
  try {
    for (const [lexical, expected] of [
      ["wrap", true],
      ["no-wrap", false],
    ] as const) {
      expect(h.importXML(lexical, a, u)).toBe(true);
      b.insert([expected], "bool");
      expect(h.equals(a, b)).toBe(true);
      b.insert([!expected], "bool");
      expect(h.equals(a, b)).toBe(false);
      expect(h.exportXML(out, a, u)).toBe(true);
      expect(out[0]).toBe(lexical);
    }
    for (const lexical of ["", " wrap", "wrap ", "WRAP", "true", "no_wrap"]) {
      a.insert([true], "bool");
      expect(h.importXML(lexical, a, u)).toBe(false);
      b.insert([true], "bool");
      expect(h.equals(a, b)).toBe(true);
    }
  } finally {
    a.dispose();
    b.dispose();
  }
});
it("exports explicit true and false separately from defaults and preserves manual row geometry through repeated real ZIP reopens", /** Uses actual native cells and package owners. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    c.EnterString("Two words More words");
    c.CompleteRowHeight(1440);
    d.Execute(".uno:WrapText", true);
    c.Select(1, 0);
    c.EnterString("Explicit false");
    d.Execute(".uno:WrapText", false);
    let bytes = writeOdsDocument(c.shell.GetDocument());
    const xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml).toContain('fo:wrap-option="wrap"');
    expect(xml).toContain('fo:wrap-option="no-wrap"');
    for (let cycle = 0; cycle < 3; cycle++) {
      const doc = await readOdsDocument(bytes);
      try {
        expect((doc.GetPattern(new ScAddress())?.GetItem(139) as ScLineBreakCell).GetValue()).toBe(
          true,
        );
        expect(
          (doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(139) as ScLineBreakCell).GetValue(),
        ).toBe(false);
        expect(
          (doc.GetPattern(new ScAddress(2, 0, 0))?.GetItem(139) as ScLineBreakCell).GetValue(),
        ).toBe(false);
        expect(doc.GetRowHeight(0, 0, false)).toBe(1440);
        expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("Two words More words");
        bytes = writeOdsDocument(doc);
      } finally {
        doc.DisposeAttributes();
      }
    }
  } finally {
    s.Close();
  }
});
it("imports independently authored table-cell wrap properties and diagnoses invalid case without changing native defaults", /** Does not rely on exporter-produced fixtures. @returns Nothing. */ () => {
  for (const [lexical, expected, errors] of [
    ["wrap", true, 0],
    ["no-wrap", false, 0],
    ["Wrap", false, 1],
    [" wrap", false, 1],
  ] as const) {
    const doc = new ScDocument(),
      diagnostics: string[] = [];
    try {
      new ScXMLImport(doc, {
        onDiagnostic:
          /** Retains actual filter diagnostics. @param item - Source diagnostic. @returns Nothing. */ (
            item,
          ) => {
            diagnostics.push(item.name);
          },
      }).importContent(
        `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="w" style:family="table-cell"><style:table-cell-properties fo:wrap-option="${lexical}"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="w" office:value-type="float" office:value="17"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
      );
      expect((doc.GetPattern(new ScAddress())?.GetItem(139) as ScLineBreakCell).GetValue()).toBe(
        expected,
      );
      expect(doc.GetValue(new ScAddress())).toBe(17);
      expect(diagnostics).toHaveLength(errors);
    } finally {
      doc.DisposeAttributes();
    }
  }
});
