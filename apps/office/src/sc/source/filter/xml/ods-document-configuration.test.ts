/** @fileoverview Native Calc document configuration through ODS settings and Worker transfer. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ViewOption } from "../../../inc/viewopti";
import { readOdsDocument, writeOdsXml } from "./xmlwrap";

it("preserves the original R1C1 document syntax from tdf144970.ods", /** Checks the persisted syntax from the original workbook, independently of its macro. @returns Completion. */ async () => {
  const imported = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/extras/testdocuments/tdf144970.ods"),
    ),
  );
  const documents = [imported];
  try {
    const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(imported)));
    documents.push(transferred);
    const output = await writeOdsXml(transferred);
    expect(output.files["settings.xml"]).toContain(
      '<config:config-item config:name="SyntaxStringRef" config:type="short">3</config:config-item>',
    );
    documents.push(await readOdsDocument(output));
    for (const document of documents) {
      const config = document.GetCalcConfig();
      expect(config.mbHasStringRefSyntax).toBe(true);
      expect(config.meStringRefAddressSyntax).toBe(FormulaGrammar.AddressConvention.CONV_XL_R1C1);
    }
  } finally {
    for (const document of documents) document.Dispose();
  }
});

it("uses the native absent-syntax fallback and applies configuration before view settings", /** Ports the combined INDIRECT convention checks and verifies the ODS settings precedence. @returns Completion. */ async () => {
  const original = new ScDocument();
  const name = unicode("foo");
  const documents = [original];
  try {
    original.InsertTab(0, name);
    const data = new ScAddress(0, 10, 0);
    const value = unicode("Test");
    try {
      original.SetString(data, value);
    } finally {
      value.dispose();
    }
    for (const [row, formula] of ['=INDIRECT("foo.A11")', '=INDIRECT("foo!A11")'].entries()) {
      const input = unicode(formula);
      try {
        original.SetString(new ScAddress(0, row, 0), input);
      } finally {
        input.dispose();
      }
    }
    const fresh = await writeOdsXml(original);
    const stream = fresh.files["settings.xml"];
    assert(typeof stream === "string");
    expect(stream).not.toContain('config:name="SyntaxStringRef"');

    const imported = await readOdsDocument(fresh);
    documents.push(imported);
    const config = imported.GetCalcConfig();
    expect(config.mbHasStringRefSyntax).toBe(false);
    expect(config.meStringRefAddressSyntax).toBe(FormulaGrammar.AddressConvention.CONV_A1_XL_A1);
    for (let row = 0; row < 2; row++) {
      const cell = imported.GetFormulaCell(new ScAddress(0, row, 0));
      assert(cell);
      cell.SetDirty();
      expect(text(cell.GetString().getString())).toBe("Test");
    }

    const split = stream.indexOf('config:name="ooo:configuration-settings"');
    assert(split > 0);
    const settings =
      stream
        .slice(0, split)
        .replace(
          'config:name="ShowZeroValues" config:type="boolean">true',
          'config:name="ShowZeroValues" config:type="boolean">false',
        ) +
      stream
        .slice(split)
        .replace(
          'config:name="AutoCalculate" config:type="boolean">true',
          'config:name="AutoCalculate" config:type="boolean">false',
        )
        .replace(
          'config:name="GridColor" config:type="int">13421772',
          'config:name="GridColor" config:type="int">1193046',
        );
    const configured = await readOdsDocument({
      ...fresh,
      files: { ...fresh.files, "settings.xml": settings },
    });
    documents.push(configured);
    expect(configured.GetCalcConfig().mbHasStringRefSyntax).toBe(false);
    const transferred = decodeCalcDocument(structuredClone(encodeCalcDocument(configured)));
    documents.push(transferred);
    const out = await writeOdsXml(transferred);
    expect(out.files["settings.xml"]).toContain(
      '<config:config-item config:name="SyntaxStringRef" config:type="short">7</config:config-item>',
    );
    const reopened = await readOdsDocument(out);
    documents.push(reopened);
    for (const document of [configured, transferred, reopened]) {
      expect(document.GetAutoCalc()).toBe(false);
      expect(document.GetViewOptions().GetOption(ViewOption.NULLVALS)).toBe(false);
      expect(document.GetViewOptions().GetGridColor().toUInt32()).toBe(0x123456);
    }
    expect(reopened.GetCalcConfig().mbHasStringRefSyntax).toBe(true);
  } finally {
    name.dispose();
    for (const document of documents) document.Dispose();
  }
});
