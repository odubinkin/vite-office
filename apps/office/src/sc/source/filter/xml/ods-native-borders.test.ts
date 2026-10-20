/** @fileoverview Independent ODF border fixtures and actual ZIP package reopens across native controller, box/diagonal items and shared XML property handlers. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { DispatchBorderItem } from "../../../../svx/source/tbxctrls/tbcontrl";
/** Independent content fixture; never calls the production exporter. @param attributes - Literal native ODF properties. @returns XML. */
function xml(attributes: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell"><style:table-cell-properties ${attributes}/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell table:style-name="ce" office:value-type="float" office:value="42"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
/** Reads actual canonical native cell pattern. @param doc - Actual document. @returns Pattern. */
function pattern(doc: ScDocument): ScPatternAttr {
  return doc.GetPattern(new ScAddress()) as ScPatternAttr;
}
/** Reads actual native frame. @param doc - Actual document. @returns Border item. */
function box(doc: ScDocument): SvxBoxItem {
  return pattern(doc).GetItem(150) as SvxBoxItem;
}
it("imports independent outer shorthand with side overrides in either attribute order and reopens actual ZIP packages", /** Exercises actual native attributes and package transport. @returns Completion. */ async () => {
  for (const attributes of [
    'fo:border="1pt solid #123456" fo:border-top="none" fo:border-right="2pt dashed #abcdef"',
    'fo:border-right="2pt dashed #abcdef" fo:border-top="none" fo:border="1pt solid #123456"',
  ]) {
    const doc = new ScDocument();
    try {
      new ScXMLImport(doc).importContent(xml(attributes));
      expect(box(doc).GetTop()).toBeUndefined();
      expect(box(doc).GetLeft()?.GetWidth()).toBe(20);
      expect(box(doc).GetRight()?.GetBorderLineStyle()).toBe(2);
      expect(box(doc).GetRight()?.GetColor().toUInt32()).toBe(0xabcdef);
      let bytes = writeOdsDocument(doc);
      const content = await new ZipFile(bytes).readTextEntry("content.xml");
      expect(content).toContain('fo:border-top="none"');
      expect(content).toContain('fo:border-right="2.01pt dashed #abcdef"');
      for (let cycle = 0; cycle < 3; cycle++) {
        const reopened = await readOdsDocument(bytes);
        try {
          expect(box(reopened).equals(box(doc))).toBe(true);
          expect(reopened.GetValue(new ScAddress())).toBe(42);
          bytes = writeOdsDocument(reopened);
        } finally {
          reopened.DisposeAttributes();
        }
      }
    } finally {
      doc.DisposeAttributes();
    }
  }
});
it("merges compound widths after shorthand, prefers new diagonal widths and retains native diagonal width-only application", /** Exercises native finished ordering, including deprecated source spelling. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    diagnostics: string[] = [];
  try {
    new ScXMLImport(doc, {
      onDiagnostic: /** Retains actual diagnostics. @param item - Diagnostic. @returns Nothing. */ (
        item,
      ) => {
        diagnostics.push(item.name);
      },
    }).importContent(
      xml(
        'style:border-line-width="0.5pt 1pt 0.5pt ignored-native-tail" fo:border="2pt double #112233" style:border-line-width-top="1pt 1pt 1pt" style:diagonal-tl-br="3pt double #445566" style:diagonal-tl-br-width="0.5pt 1pt 0.5pt" style:diagonal-tl-br-widths="1pt 1pt 1pt" style:diagonal-bl-tr-widths="0pt 0pt 1pt"',
      ),
    );
    expect(box(doc).GetLeft()?.GetInWidth()).toBe(10);
    expect(box(doc).GetLeft()?.GetDistance()).toBe(20);
    expect(box(doc).GetTop()?.GetInWidth()).toBe(20);
    const diagonal = (pattern(doc).GetItem(141) as SvxLineItem).GetLine();
    expect(diagonal?.GetInWidth()).toBe(20);
    expect(diagonal?.GetDistance()).toBe(20);
    expect((pattern(doc).GetItem(142) as SvxLineItem).GetLine()?.GetWidth()).toBe(20);
    expect(diagnostics).toEqual([]);
  } finally {
    doc.DisposeAttributes();
  }
});
it("keeps border presets and diagonal hairlines through actual packages without storing inner-frame command items", /** Runs original toolbar dispatch on real controller and document. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    DispatchBorderItem(
      /** Dispatches real typed source command arguments. @param command - Command. @param args - Original items. @returns Nothing. */ (
        command,
        args,
      ) => {
        session.frame.GetDispatcher().Execute(command, args);
      },
      2,
      true,
      0,
    );
    DispatchBorderItem(
      /** Dispatches real typed source command arguments. @param command - Command. @param args - Original items. @returns Nothing. */ (
        command,
        args,
      ) => {
        session.frame.GetDispatcher().Execute(command, args);
      },
      9,
      true,
      0,
    );
    const original = c.shell.GetDocument(),
      bytes = writeOdsDocument(original),
      content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('fo:border="0.74pt solid #000000"');
    expect(content).toContain('style:diagonal-tl-br="0.06pt solid #000000"');
    const reopened = await readOdsDocument(bytes);
    try {
      expect(box(reopened).equals(box(original))).toBe(true);
      expect(
        (pattern(reopened).GetItem(141) as SvxLineItem).equals(pattern(original).GetItem(141)),
      ).toBe(true);
    } finally {
      reopened.DisposeAttributes();
    }
  } finally {
    session.Close();
  }
});
it("collapses equal compound sides independently and exports only current diagonal width spellings", /** Validates actual automatic-style ContextFilter output. @returns Completion. */ async () => {
  const doc = new ScDocument();
  try {
    new ScXMLImport(doc).importContent(
      xml(
        'fo:border="3pt double #123456" style:border-line-width="1pt 1pt 1pt" style:diagonal-bl-tr="3pt double #445566" style:diagonal-bl-tr-width="1pt 1pt 1pt"',
      ),
    );
    const content = await new ZipFile(writeOdsDocument(doc)).readTextEntry("content.xml");
    expect(content).toContain('fo:border="');
    expect(content).not.toContain("fo:border-left=");
    expect(content).toContain('style:border-line-width="');
    expect(content).not.toContain("style:border-line-width-left=");
    expect(content).toContain('style:diagonal-bl-tr-widths="');
    expect(content).not.toContain('style:diagonal-bl-tr-width="');
    const reopened = await readOdsDocument(writeOdsDocument(doc));
    try {
      expect(box(reopened).equals(box(doc))).toBe(true);
    } finally {
      reopened.DisposeAttributes();
    }
  } finally {
    doc.DisposeAttributes();
  }
});
it("diagnoses invalid border lexemes and unported padding while preserving valid independent sides", /** Verifies unsupported metadata is visible rather than silently discarded. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    diagnostics: string[] = [];
  try {
    new ScXMLImport(doc, {
      onDiagnostic: /** Captures original metadata. @param item - Diagnostic. @returns Nothing. */ (
        item,
      ) => {
        diagnostics.push(item.name);
      },
    }).importContent(
      xml(
        'fo:border="solid" fo:border-left="1pt dashed #123456" style:border-line-width-top="1pt" fo:padding="1pt"',
      ),
    );
    expect(box(doc).GetLeft()?.GetWidth()).toBe(20);
    expect(box(doc).GetTop()).toBeUndefined();
    expect(diagnostics).toEqual(
      expect.arrayContaining(["invalid cell border", "invalid cell border widths"]),
    );
    expect(diagnostics).toHaveLength(3);
  } finally {
    doc.DisposeAttributes();
  }
});
