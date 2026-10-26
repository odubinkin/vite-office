/** @fileoverview Actual ODS bytes/native document edit-save-reload and independent XML input. */
import type { ScDocumentPool } from "../../core/data/docpool";
import type { ScPatternAttr } from "../../../inc/patattr";
import type { ScTable } from "../../../inc/table";
import { assert, expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ScXMLImport } from "./xmlimprt";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
it("opens exported actual document bytes,edits and reloads formula results and literal text", /** No alternate workbook model participates. @returns Completion. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data & <😀>"));
  doc.InsertTab(1, unicode("Empty"));
  const a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    c = new ScAddress(3, 100, 0);
  doc.SetValue(a, 2.5);
  doc.SetFormula(b, unicode("=[.$A$1]*2"), grammar);
  doc.SetTextCell(c, unicode('  x & <"😀>\t end '));
  const bytes = writeOdsDocument(doc),
    zip = new ZipFile(bytes);
  expect(zip.getEntryNames()[0]).toBe("mimetype");
  expect(await zip.readTextEntry("content.xml")).toContain("of:=[.$A$1]*2");
  const loaded = await readOdsDocument(bytes);
  expect(loaded.GetTableCount()).toBe(2);
  expect(loaded.GetValue(b)).toBe(5);
  expect(text(loaded.GetSharedString(c).getString())).toBe('  x & <"😀>\t end ');
  loaded.SetValue(a, 4);
  const again = await readOdsDocument(writeOdsDocument(loaded));
  expect(again.GetValue(b)).toBe(8);
  const cell = again.GetFormulaCell(b);
  assert(cell);
  expect(text(cell.GetFormula(grammar))).toBe("=[.$A$1]*2");
});
it("imports independent modern ODF XML with scoped formula namespace alias and scalar repeats", /** Uses real shared SAX namespace bindings. @returns Nothing. */ () => {
  const xml = `<o:document-content xmlns:o="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:t="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:p="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:f="urn:oasis:names:tc:opendocument:xmlns:of:1.2" o:version="1.3"><o:body><o:spreadsheet><t:table t:name="Data"><t:table-row t:number-rows-repeated="2"><t:table-cell o:value-type="float" o:value="3" t:number-columns-repeated="2"/><t:table-cell o:value-type="string"><p:p>A<p:s p:c="2"/>B<p:tab/>C</p:p></t:table-cell></t:table-row><t:table-row><t:table-cell t:formula="f:=[.A1]+1" o:value-type="float" o:value="999"/></t:table-row></t:table></o:spreadsheet></o:body></o:document-content>`;
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(xml);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(3);
  expect(text(doc.GetSharedString(new ScAddress(2, 1, 0)).getString())).toBe("A  B\tC");
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(4);
});

it("imports ODF paragraph boundaries into edit-text cells", () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:spreadsheet><table:table table:name="Data"><table:table-row><table:table-cell office:value-type="string"><text:p>first</text:p><text:p>second</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  const cell = doc.GetRefCellValue(new ScAddress());
  expect(cell.getType()).toBe(4);
  const edit = cell.getEditText();
  assert(edit);
  const value = edit.GetText();
  try {
    expect(text(value)).toBe("first\nsecond");
  } finally {
    value.dispose();
  }
});

/** Independent ODF test envelope;no exporter participates in parser/default or failure assertions. @param rows - Rows. @param tableAttributes - Attributes. @returns XML. */
function independent(rows: string, tableAttributes = 'table:name="Data"'): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:f="urn:oasis:names:tc:opendocument:xmlns:of:1.2"><office:body><office:spreadsheet><table:table ${tableAttributes}>${rows}</table:table><table:named-expressions/></office:spreadsheet></office:body></office:document-content>`;
}
/** Imports only independent XML through the actual native root. @param xml - Input. @param options - Controls. @returns Document. */
function load(xml: string, options: import("./xmlimprt").ScXMLImportOptions = {}): ScDocument {
  const doc = new ScDocument();
  new ScXMLImport(doc, options).importContent(xml);
  return doc;
}
it("retains native numeric defaults,raw string precedence,covered slots and namespace rebinding", /** Checks values and true native cell alternatives rather than rendered text. @returns Nothing. */ () => {
  const doc = load(
    independent(
      `<table:table-rows><table:table-row table:number-rows-repeated="0"><table:table-cell office:value-type="float"/><table:table-cell office:value-type="float" office:value="INF"/><table:table-cell office:value-type="float" office:value="garbage"/><table:table-cell office:value-type="string" office:string-value="attribute"><text:p>ignored</text:p></table:table-cell><table:covered-table-cell/><table:table-cell><text:p>x<text:s text:c="0"/>y</text:p></table:table-cell><table:table-cell table:formula=""/><table:table-cell office:value-type="string"/></table:table-row></table:table-rows><table:table-row-group><table:table-row><table:table-cell xmlns:f="urn:oasis:names:tc:opendocument:xmlns:of:1.2" table:formula="f:=1+2"/><table:table-cell table:formula="==1+3"/></table:table-row></table:table-row-group>`,
    ),
  );
  for (const c of [0, 1, 2]) expect(doc.GetValue(new ScAddress(c, 0, 0))).toBe(0);
  expect(text(doc.GetSharedString(new ScAddress(3, 0, 0)).getString())).toBe("attribute");
  expect(doc.GetCellType(new ScAddress(4, 0, 0))).toBe(0);
  expect(text(doc.GetSharedString(new ScAddress(5, 0, 0)).getString())).toBe("x y");
  expect(doc.GetCellType(new ScAddress(7, 0, 0))).toBe(0);
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(3);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4);
});
it("round-trips formula error,text and empty results without substituting cached data", /** Real formula tokens retain their meaning after package reload. @returns Completion. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetTextCell(new ScAddress(0, 0, 0), unicode("hello"));
  for (const [c, r, s] of [
    [1, 0, "=[.A1]"],
    [1, 1, "=[.A2]"],
    [1, 2, "=1/0"],
  ] as const)
    doc.SetFormula(new ScAddress(c, r, 0), unicode(s), grammar);
  const copy = await readOdsDocument(writeOdsDocument(doc));
  const string = copy.GetFormulaCell(new ScAddress(1, 0, 0)),
    empty = copy.GetFormulaCell(new ScAddress(1, 1, 0));
  assert(string);
  assert(empty);
  expect(text(string.GetString().getString())).toBe("hello");
  expect(empty.IsEmpty()).toBe(true);
  expect(copy.GetErrCode(new ScAddress(1, 2, 0))).toBe(532);
});
it("keeps importer APIs on the actual document and does not allocate invalid coordinates", /** Import and editing share all cell stores. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const importer = new ScXMLImport(doc),
    raw = importer.GetDoc();
  expect(raw.getDoc()).toBe(doc);
  expect(importer.GetDocument()).toBe(doc);
  raw.setStringCell(new ScAddress(-1, 0, 0), unicode("x"));
  raw.setStringCell(new ScAddress(0, 0, 9), unicode("x"));
  expect(doc.FetchTable(0)?.GetAllocatedColumnsCount()).toBe(1);
  expect(
    /** A live document is not an empty package-import target. @returns Nothing. */ () =>
      importer.importContent(independent("")),
  ).toThrow(/fresh document/);
});
it("rejects unsupported cell services and malformed structure explicitly", /** Each input is independent from the exporter. @returns Nothing. */ () => {
  for (const cell of [
    '<table:table-cell office:value-type="date"/>',
    '<table:table-cell table:number-columns-spanned="2"/>',
    '<table:table-cell table:number-rows-spanned="2"/>',
    '<table:table-cell table:formula="f:=1" table:number-columns-repeated="2"/>',
    "<table:table-cell><text:p><text:span>x</text:span></text:p></table:table-cell>",
    "<table:table-cell><text:p><text:line-break/></text:p></table:table-cell>",
    '<table:table-cell><text:p><text:s text:c="1000001"/></text:p></table:table-cell>',
    '<table:table-cell table:formula="unknown:=1"/>',
    "<table:table-cell><text:span>x</text:span></table:table-cell>",
    '<table:table-cell><unknown xmlns="urn:unknown"/></table:table-cell>',
  ])
    expect(
      /** Rejects the concrete unsupported semantic owner. @returns Document. */ () =>
        load(independent(`<table:table-row>${cell}</table:table-row>`)),
    ).toThrow();
  expect(
    /** Repeated formula rows need their real formula-copy services. @returns Document. */ () =>
      load(
        independent(
          '<table:table-row table:number-rows-repeated="2"><table:table-cell table:formula="f:=1"/></table:table-row>',
        ),
      ),
  ).toThrow(/repeated formula/);
  for (const content of [
    "<table:table-cell/>",
    "<table:table-row><table:table-row/></table:table-row>",
    '<unknown xmlns="urn:unknown"/>',
  ])
    expect(
      /** Rejects a misplaced or unknown semantic node. @returns Document. */ () =>
        load(independent(content)),
    ).toThrow();
  expect(
    /** Names obey actual document constraints. @returns Document. */ () =>
      load(independent("", 'table:name="bad:name"')),
  ).toThrow(/sheet name/);
  for (const xml of [
    "<unknown/>",
    independent("").replace("document-content", "document-styles"),
    independent("").replace("<office:body>", "<office:settings/> <office:body>"),
    independent("")
      .replace("<office:spreadsheet>", "<office:text>")
      .replace("</office:spreadsheet>", "</office:text>"),
    independent("").replace("</office:spreadsheet>", "</office:spreadsheet><office:spreadsheet/>"),
    independent("")
      .replace("<office:body>", "<office:bodyX>")
      .replace("</office:body>", "</office:bodyX>"),
    independent("")
      .replace("<office:body>", "")
      .replace("</office:body>", "")
      .replace(/<office:spreadsheet>.*<\/office:spreadsheet>/, ""),
    independent("").replace(
      "<office:document-content ",
      '<office:document-content office:version="1.0" ',
    ),
  ])
    expect(
      /** Invalid roots/grammar/body cannot be treated as an empty spreadsheet. @returns Document. */ () =>
        load(xml),
    ).toThrow();
});
it("bounds scalar expansion and reports actual formatting/range omissions", /** Empty repeats advance positions without expanded cell storage. @returns Nothing. */ () => {
  expect(
    /** Expanded nonempty cells consume the explicit budget. @returns Document. */ () =>
      load(
        independent(
          '<table:table-row><table:table-cell office:value-type="float" table:number-columns-repeated="2"/></table:table-row>',
        ),
        { maxExpandedCells: 1 },
      ),
  ).toThrow(/expanded cell limit/);
  const diagnostics: unknown[] = [];
  const doc = load(
    independent(
      '<table:table-column/><table:table-header-rows><table:table-row table:style-name="ro"><table:table-cell table:style-name="ce" office:value-type="float"/></table:table-row></table:table-header-rows><table:table-row table:number-rows-repeated="1048575"><table:table-cell/></table:table-row><table:table-row><table:table-cell office:value-type="float"/></table:table-row>',
      'table:name="Data" table:style-name="ta"',
    ),
    {
      onDiagnostic:
        /** Records real unsupported metadata. @param value - Diagnostic. @returns Nothing. */ (
          value,
        ) => diagnostics.push(value),
    },
  );
  expect(diagnostics.length).toBeGreaterThan(3);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(0);
  const columns = load(
    independent(
      '<table:table-row><table:table-cell table:number-columns-repeated="16383"/><table:table-cell office:value-type="float" table:number-columns-repeated="2"/></table:table-row>',
    ),
    {
      onDiagnostic:
        /** Collects bounded overflow diagnostics. @param value - Diagnostic. @returns Nothing. */ (
          value,
        ) => diagnostics.push(value),
    },
  );
  expect(columns.GetCellType(new ScAddress(16383, 0, 0))).toBe(1);
});

it("enforces real ZIP/media boundaries and cooperative import/export controls", /** Package metadata is composed through the same shared native property owners. @returns Completion. */ async () => {
  const { ZipOutputStream } = await import("../../../../package/source/zipapi/ZipOutputStream"),
    { createManifestXml, createManifestProperty } =
      await import("../../../../package/source/manifest/ManifestWriter"),
    { ODS_MIMETYPE, ScXMLImportWrapper } = await import("./xmlwrap"),
    { DEFAULT_ZIP_FILE_LIMITS } = await import("../../../../package/source/zipapi/ZipFile");
  /** Builds independent wire bytes,not a fake ZIP backend. @param mime - Media content. @param first - Whether media entry is first. @param root - Root media property. @returns Package. */
  function bytes(mime = ODS_MIMETYPE, first = true, root = ODS_MIMETYPE): Uint8Array {
    const zip = new ZipOutputStream(),
      encoder = new TextEncoder(),
      sequence = [
        [
          createManifestProperty("FullPath", "/"),
          createManifestProperty("MediaType", root),
          createManifestProperty("Version", "1.3"),
        ],
        [
          createManifestProperty("FullPath", "content.xml"),
          createManifestProperty("MediaType", "text/xml"),
        ],
      ];
    if (first) zip.putNextEntry("mimetype", encoder.encode(mime));
    zip.putNextEntry(
      "content.xml",
      encoder.encode(
        independent(
          '<table:table-row><table:table-cell office:value-type="float" office:value="2"/></table:table-row>',
        ),
      ),
    );
    if (!first) zip.putNextEntry("mimetype", encoder.encode(mime));
    zip.putNextEntry("META-INF/manifest.xml", encoder.encode(createManifestXml(sequence)));
    return zip.finish();
  }
  for (const input of [
    bytes("bad"),
    bytes(ODS_MIMETYPE, false),
    bytes(ODS_MIMETYPE, true, "application/vnd.oasis.opendocument.text"),
  ])
    await expect(readOdsDocument(input)).rejects.toThrow();
  const compressed = bytes(),
    view = new DataView(compressed.buffer, compressed.byteOffset, compressed.byteLength);
  view.setUint16(8, 8, true);
  for (let i = 0; i < compressed.length - 16; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      view.setUint16(i + 10, 8, true);
      break;
    }
  await expect(readOdsDocument(compressed)).rejects.toThrow(/mimetype/);
  const normal = bytes();
  expect(
    (await readOdsDocument(normal, { zipLimits: DEFAULT_ZIP_FILE_LIMITS })).GetTableCount(),
  ).toBe(1);
  await expect(
    readOdsDocument(normal, {
      isCancelled: /** Aborts before package reads. @returns True. */ () => true,
    }),
  ).rejects.toThrow(/cancelled/);
  let n = 0;
  await expect(
    readOdsDocument(normal, {
      isCancelled: /** Aborts after manifest read. @returns Whether aborted. */ () => ++n > 1,
    }),
  ).rejects.toThrow(/cancelled/);
  const doc = await readOdsDocument(normal);
  expect(
    /** Explicit export ceiling applies to actual bytes. @returns Bytes. */ () =>
      writeOdsDocument(doc, { maxOutputBytes: 0 }),
  ).toThrow(/size limit/);
  expect(
    /** Export can be cancelled before content. @returns Bytes. */ () =>
      writeOdsDocument(doc, { isCancelled: /** Aborts. @returns True. */ () => true }),
  ).toThrow(/cancelled/);
  doc.SetValue(new ScAddress(1, 0, 0), 3);
  n = 0;
  expect(
    /** Export observes cancellation during live traversal. @returns Bytes. */ () =>
      writeOdsDocument(doc, {
        isCancelled: /** Aborts during traversal. @returns Whether aborted. */ () => ++n > 2,
      }),
  ).toThrow(/cancelled/);
  const target = new ScDocument();
  await new ScXMLImportWrapper(target).Import(normal);
  expect(target.GetValue(new ScAddress(0, 0, 0))).toBe(2);
  const table = target.FetchTable(0);
  assert(table);
  table.CreateColumnIfNotExists(0).SetRawString(1, unicode("a\nb"));
  expect(
    /** Rich multiline storage needs its actual export owner. @returns Bytes. */ () =>
      writeOdsDocument(target),
  ).toThrow(/multiline/);
});

it("distinguishes empty metadata wrappers from unimplemented semantic descendants", /** Namespace dispatch cannot flatten unsupported content into cells. @returns Nothing. */ () => {
  const empty = independent("");
  expect(
    /** A known non-table node is not spreadsheet content. @returns Document. */ () =>
      load(empty.replace("</table:table>", "</table:table><table:table-cell/>")),
  ).toThrow(/spreadsheet feature/);
  for (const child of [
    '<unknown xmlns="urn:unknown"/>',
    "<table:named-expressions><table:table/></table:named-expressions>",
    "<table:named-expressions><table:named-range/></table:named-expressions>",
  ])
    expect(
      /** Empty-only metadata does not imply full named-expression support. @returns Document. */ () =>
        load(empty.replace("</table:table>", `</table:table>${child}`)),
    ).toThrow();
  const diagnostics: unknown[] = [];
  load(
    empty
      .replace(
        "<office:body>",
        "<office:scripts/><office:font-face-decls/><office:automatic-styles/><office:body>",
      )
      .replace("</table:table>", "</table:table><table:calculation-settings/>"),
    {
      onDiagnostic:
        /** Captures actual omitted metadata. @param value - Diagnostic. @returns Nothing. */ (
          value,
        ) => diagnostics.push(value),
    },
  );
  expect(diagnostics.length).toBe(2);
  const warn = vi
    .spyOn(console, "warn")
    .mockImplementation(
      /** Observes warnings without polluting test output. @returns Nothing. */ () => {},
    );
  try {
    load(independent("", 'table:name="Data" table:style-name="ta"'));
    expect(warn).toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
  expect(
    /** A missing sheet name is not silently fabricated. @returns Document. */ () =>
      load(independent("", "")),
  ).toThrow(/sheet name/);
});
it("exposes native export component and wrapper entry points on the same document", /** Checks direct component output against the actual ZIP stream,not a separate encoder. @returns Completion. */ async () => {
  const { ScXMLExport } = await import("./xmlexprt"),
    { ScXMLImportWrapper } = await import("./xmlwrap");
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(0, 0, 0), 1);
  const xml = new ScXMLExport(doc).exportContent(),
    bytes = new ScXMLImportWrapper(doc).Export();
  expect(await new ZipFile(bytes).readTextEntry("content.xml")).toBe(xml);
});

/** Independent ODF automatic style envelope for native font-height import contracts. @param styles - Source styles. @param rows - Source rows. @returns XML. */
function fontStyles(styles: string, rows: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles>${styles}</office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Data">${rows}</table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("imports real script-specific automatic font heights and preserves styled empty repeats without expanding cell contents", /** Independent XML tests native item identities rather than exporter agreement alone. @returns Completion. */ async () => {
  const xml = fontStyles(
    `<style:style style:name="ce" style:family="table-cell"><style:text-properties fo:font-size="1in" style:font-size-asian="16pt" style:font-size-complex="22pt"/></style:style>`,
    `<table:table-row table:number-rows-repeated="1048576"><table:table-cell table:style-name="ce" table:number-columns-repeated="16384"/></table:table-row>`,
  );
  const doc = load(xml, { maxExpandedCells: 0 });
  expect((doc.FetchTable(0) as ScTable).GetAllocatedColumnsCount()).toBe(1);
  const pos = new ScAddress(doc.MaxCol(), doc.MaxRow(), 0),
    pattern = doc.GetPattern(pos) as ScPatternAttr;
  expect(
    [101, 112, 117].map(
      /** Reads actual imported script height. @param which - Identity. @returns Twips. */ (
        which,
      ) =>
        (
          pattern.GetItem(which) as import("../../../../editeng/inc/fhgtitem").SvxFontHeightItem
        ).GetHeight(),
    ),
  ).toEqual([1440, 320, 440]);
  const bytes = writeOdsDocument(doc),
    xmlOut = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(xmlOut.length).toBeLessThan(3000);
  expect(xmlOut).toContain('table:number-rows-repeated="1048576"');
  const again = await readOdsDocument(bytes);
  expect(
    (
      (again.GetPattern(pos) as ScPatternAttr).GetItem(
        112,
      ) as import("../../../../editeng/inc/fhgtitem").SvxFontHeightItem
    ).GetHeight(),
  ).toBe(320);
  expect(again.GetCellType(pos)).toBe(0);
  doc.DisposeAttributes();
  again.DisposeAttributes();
});
it("diagnoses unsupported style families,inheritance,properties,relative sizes and missing references while retaining supported heights", /** Invalid metadata never becomes a successful invented format. @returns Nothing. */ () => {
  const names: string[] = [];
  const xml = fontStyles(
    `<style:style style:name="p" style:family="paragraph"/><style:default-style style:family="table-cell"/><style:style style:name="ce" style:family="table-cell"><style:text-properties fo:font-size="8pt"/></style:style><style:style style:name="ce" style:family="table-cell" style:parent-style-name="Base"><style:paragraph-properties/><style:table-row-properties/><style:text-properties fo:font-size="0pt" style:font-size-asian="120%" style:font-size-complex="16pt" fo:font-weight="bold"/></style:style>`,
    `<table:table-row><table:table-cell table:style-name="ce"/><table:table-cell table:style-name="missing"/><table:covered-table-cell table:style-name="ce"/></table:table-row><table:table-row table:number-rows-repeated="1048577"><table:table-cell table:style-name="ce" table:number-columns-repeated="16385"/></table:table-row><table:table-row><table:table-cell table:style-name="ce"/></table:table-row>`,
  );
  const doc = load(xml, {
    onDiagnostic:
      /** Records actual importer diagnostics. @param value - Native diagnostic. @returns Nothing. */ (
        value,
      ) => {
        names.push(value.name);
      },
  });
  expect(names).toEqual(
    expect.arrayContaining([
      "non-cell automatic style",
      "cell parent style inheritance",
      "cell style properties",
      "relative or invalid cell font height",
      "cell style/number format",
      "cell range overflow",
    ]),
  );
  expect(
    (
      (doc.GetPattern(new ScAddress(0, 0, 0)) as ScPatternAttr).GetItem(
        101,
      ) as import("../../../../editeng/inc/fhgtitem").SvxFontHeightItem
    ).GetHeight(),
  ).toBe(200);
  expect(
    (
      (doc.GetPattern(new ScAddress(0, 0, 0)) as ScPatternAttr).GetItem(
        117,
      ) as import("../../../../editeng/inc/fhgtitem").SvxFontHeightItem
    ).GetHeight(),
  ).toBe(320);
  doc.DisposeAttributes();
  expect(
    /** Rejects an automatic cell style without its required name. @returns Never. */ () =>
      load(fontStyles('<style:style style:family="table-cell"/>', "<table:table-row/>")),
  ).toThrow(/cell style name/);
});

it("observes cancellation while traversing an empty sheet's attribute row runs", /** Empty formatting/content still participates in the cooperative export boundary. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Empty"));
  let calls = 0;
  expect(
    /** Observes actual export cancellation in an empty row run. @returns Never. */ () =>
      writeOdsDocument(doc, {
        isCancelled: /** Cancels after wrapper admission. @returns Cancelled. */ () => ++calls > 1,
      }),
  ).toThrow(/cancelled/);
});
it("preserves manual row geometry and recalculates standard automatic font rows through actual ODS", /** Independent ODF input covers row defaults and large empty repeats. @returns Completion. */ async () => {
  const xml = fontStyles(
    '<style:style style:name="r" style:family="table-row"><style:table-row-properties style:row-height="30pt" style:use-optimal-row-height="false"/></style:style><style:style style:name="a" style:family="table-row"><style:table-row-properties style:row-height="0pt" style:use-optimal-row-height="true"/></style:style>',
    '<table:table-row table:style-name="r" table:number-rows-repeated="3"><table:table-cell office:value-type="string"><text:p xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">Rows</text:p></table:table-cell></table:table-row><table:table-row table:style-name="a"/><table:table-row table:number-rows-repeated="1048572"><table:table-cell/></table:table-row>',
  );
  const doc = load(xml),
    table = doc.FetchTable(0) as ScTable;
  expect(table.GetRowHeight(0)).toBe(600);
  expect(table.GetRowHeight(2)).toBe(600);
  expect(table.GetRowHeight(3)).toBe(256);
  expect(table.GetRowFlagsRange(0).maValue & 8).toBe(8);
  const bytes = writeOdsDocument(doc),
    content = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(content).toContain('style:row-height="1.058cm"');
  expect(content).toContain('style:use-optimal-row-height="false"');
  const reopened = await readOdsDocument(bytes),
    result = reopened.FetchTable(0) as ScTable;
  expect(result.GetRowHeight(2)).toBe(600);
  expect(result.GetRowHeight(3)).toBe(256);
  expect(result.GetRowFlagsRange(2).maValue & 8).toBe(8);
  doc.DisposeAttributes();
  reopened.DisposeAttributes();
});
it("diagnoses unsupported row-style children and invalid properties without manufacturing geometry", /** Exercises actual property parser with independent XML. @returns Nothing. */ () => {
  const diagnostics: string[] = [];
  const doc = load(
    fontStyles(
      '<style:style style:name="empty" style:family="table-row"><style:table-row-properties/></style:style><style:style style:name="r" style:family="table-row"><style:text-properties/><style:table-row-properties style:row-height="bad" style:use-optimal-row-height="bad"/></style:style>',
      '<table:table-row table:style-name="empty"/><table:table-row table:style-name="r"/>',
    ),
    {
      /** Collects parser diagnostics. @param diagnostic - Unsupported metadata. @returns Nothing. */
      onDiagnostic: (diagnostic) => {
        diagnostics.push(diagnostic.name);
      },
    },
  );
  expect(diagnostics).toEqual(
    expect.arrayContaining([
      "row style properties",
      "invalid row height",
      "invalid optimal row height",
    ]),
  );
  expect((doc.FetchTable(0) as ScTable).GetRowHeight(0)).toBe(256);
  doc.DisposeAttributes();
});

it("retains source item defaults and diagnostics when character conversions fail", /** Independent malformed properties exercise shared handler failure contracts. @returns Nothing. */ () => {
  const names: string[] = [];
  const doc = load(
    fontStyles(
      `<style:style style:name="ce" style:family="table-cell"><style:text-properties fo:font-style="invalid" fo:font-weight="heavy" style:text-underline-style="invalid" style:text-underline-color="invalid"/></style:style>`,
      `<table:table-row><table:table-cell table:style-name="ce"/></table:table-row>`,
    ),
    {
      onDiagnostic:
        /** Collects native diagnostics. @param diagnostic - Source error. @returns Nothing. */ (
          diagnostic,
        ) => {
          names.push(diagnostic.name);
        },
    },
  );
  expect(
    names.filter(
      /** Counts actual conversion failures. @param name - Error. @returns Match. */ (name) =>
        name === "invalid cell character property",
    ),
  ).toHaveLength(2);
  expect(names).toContain("invalid cell underline property");
  const pattern = doc.GetPattern(new ScAddress()) as ScPatternAttr;
  expect(
    pattern.GetItem(102).equals((doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(102)),
  ).toBe(true);
  expect(
    pattern.GetItem(103).equals((doc.GetPool() as ScDocumentPool).GetUserOrPoolDefaultItem(103)),
  ).toBe(true);
  doc.DisposeAttributes();
});

it("omits an unrepresentable native posture on export without replacing it with a boolean", /** Checks the original handler's unsupported enum outcome. @returns Completion. */ async () => {
  const { ScPatternAttr } = await import("../../../inc/patattr"),
    { SvxPostureItem } = await import("../../../../editeng/source/items/textitem"),
    { FontItalic } = await import("../../../../tools/inc/fontenum");
  const doc = load(independent("<table:table-row><table:table-cell/></table:table-row>"));
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  delta.ItemSetPut(new SvxPostureItem(FontItalic.ITALIC_DONTKNOW, 103));
  doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, delta);
  delta.Dispose();
  const xml = await new ZipFile(writeOdsDocument(doc)).readTextEntry("content.xml");
  expect(xml).not.toContain("fo:font-style=");
  doc.DisposeAttributes();
});
