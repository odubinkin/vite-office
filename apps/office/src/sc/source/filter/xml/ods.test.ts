/** @fileoverview Actual ODS bytes/native document edit-save-reload and independent XML input. */
import { compressedMimetypePackage } from "../../../../test/fixtures/zip";
import { implementations } from "../../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../../desktop/source/app/appinit";
import { assert, expect, it, vi } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScAddress } from "../../../inc/address";
import type { ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { ScDocument } from "../../../inc/document";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import { EE_CHAR_ESCAPEMENT, EE_CHAR_WEIGHT } from "../../../../editeng/inc/eeitem";
import { DFLT_ESC_AUTO_SUPER } from "../../../../editeng/inc/escapementitem.constants";
import type { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { FontWeight } from "../../../../tools/inc/fontenum";
import type { ScPatternAttr } from "../../../inc/patattr";
import type { ScTable } from "../../../inc/table";
import type { ScDocumentPool } from "../../core/data/docpool";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
InitApplicationServiceManager(implementations);

it("compiles forward ODF data-style references and retains time and currency displays", /** Independent ODF uses source number fields and a forward style reference. @returns Completion. */ async () => {
  const xml = independent(
    '<table:table-row><table:table-cell table:style-name="clock" office:value-type="float" office:value="0.5"/><table:table-cell table:style-name="money" office:value-type="float" office:value="123.5"/></table:table-row>',
  ).replace(
    "<office:body>",
    `<office:automatic-styles xmlns:n="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
      <s:style s:name="clock" s:family="table-cell" s:data-style-name="clockFmt"/>
      <s:style s:name="money" s:family="table-cell" s:data-style-name="moneyFmt"/>
      <n:time-style s:name="clockFmt"><n:hours n:style="long"/><n:text>:</n:text><n:minutes n:style="long"/><n:text> </n:text><n:am-pm/></n:time-style>
      <n:currency-style s:name="moneyFmt"><n:currency-symbol>€</n:currency-symbol><n:number n:decimal-places="2" n:min-integer-digits="1"/></n:currency-style>
    </office:automatic-styles><office:body>`,
  );
  const first = load(xml);
  let copy: ScDocument | undefined;
  const output = new OUString();
  try {
    copy = await readOdsDocument(await writeOdsDocument(first));
    for (const document of [first, copy]) {
      const formatter = document.GetFormatTable();
      for (const [column, expected] of ["12:00 PM", "€123.50"].entries()) {
        const address = new ScAddress(column, 0, 0);
        const key = document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
        expect(key).toBeGreaterThan(0);
        formatter.GetOutputString(document.GetValue(address), key, output, [null]);
        expect(text(output)).toBe(expected);
      }
    }
  } finally {
    output.dispose();
    copy?.Dispose();
    first.Dispose();
  }
});

it("maps optional ODF numeric digits, named months and positioned decimal text", /** Exercises the independent ODF defaults and checks the serialized native styles. @returns Completion. */ async () => {
  const styles = [
    '<n:number-style><n:number n:min-integer-digits="0" n:decimal-places="3" n:min-decimal-places="1" n:grouping="1"><n:embedded-text n:position="-1">x</n:embedded-text></n:number></n:number-style>',
    '<n:date-style><n:month n:textual="1"/><n:text> </n:text><n:month n:textual="true" n:style="long"/></n:date-style>',
    '<n:number-style><n:scientific-number n:min-integer-digits="1" n:decimal-places="0" n:min-exponent-digits="1" n:forced-exponent-sign="false"/></n:number-style>',
    '<n:number-style><n:number n:min-integer-digits="1" n:decimal-places="0"><n:embedded-text n:position="0">x</n:embedded-text><n:embedded-text n:position="-1">discarded</n:embedded-text><n:embedded-text>discarded</n:embedded-text></n:number></n:number-style>',
    "<n:text-style><n:text/><n:text-content/></n:text-style>",
    "<n:number-style><n:number/><n:unrepresented/></n:number-style>",
    "<n:number-style/>",
    "<n:number-style><n:number/></n:number-style>",
    '<n:number-style><n:scientific-number n:min-integer-digits="1" n:decimal-places="2" n:min-exponent-digits="2"/></n:number-style>',
  ];
  const rows = styles
    .map(
      /** Adds one cell per separate source style. @param _style - Source entry. @param index - Style index. @returns Cell XML. */
      (_style, index) =>
        `<table:table-cell table:style-name="ce${index}" office:value-type="float" office:value="2"/>`,
    )
    .join("");
  const declarations = styles
    .map(
      /** Adds an independent data-style declaration and its cell style. @param style - Data-style XML. @param index - Style index. @returns Style XML. */
      (style, index) =>
        `<s:style s:name="ce${index}" s:family="table-cell" s:data-style-name="N${index}"/>` +
        style.replace(/^(<n:[\w-]+)/, `$1 s:name="N${index}"`),
    )
    .join("");
  const xml = independent(`<table:table-row>${rows}</table:table-row>`).replace(
    "<office:body>",
    `<office:automatic-styles xmlns:n="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0">${declarations}</office:automatic-styles><office:body>`,
  );
  const first = load(xml);
  try {
    const formatter = first.GetFormatTable();
    /** Reads the formatter's canonical code for a test cell. @param index - Cell column. @returns Format code. */
    function code(index: number): string {
      const key = first.GetPattern(new ScAddress(index, 0, 0))?.GetNumberFormat(formatter) ?? 0;
      const entry = formatter.GetEntry(key);
      return entry ? text(entry.GetFormatstring()) : "";
    }
    expect(code(0)).toContain('0"x"##');
    expect(code(1)).toContain('MMM" "MMMM');
    expect(code(2)).toBe("0E-0");
    expect(code(3)).toBe('0"x"');
    expect(code(4)).toBe("@");
    expect(code(5)).toBe("General");
    expect(code(6)).toBe("General");
    expect(code(7)).toBe("General");
    expect(code(8)).toBe("0.00E+00");
    const result = await (
      await DocumentArchive.open(await writeOdsDocument(first))
    ).readTextEntry("content.xml");
    expect(result).toContain('number:min-decimal-places="1"');
    expect(result).toContain('<number:embedded-text number:position="-1">x</number:embedded-text>');
    expect(result).toContain('<number:month number:style="short" number:textual="true"/>');
    expect(result).toContain('number:forced-exponent-sign="false"');
    expect(result).toContain("<number:text-content/>");
  } finally {
    first.Dispose();
  }
});

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
  const bytes = await writeOdsDocument(doc),
    zip = await DocumentArchive.open(bytes);
  expect(zip.getEntryNames()[0]).toBe("mimetype");
  expect(await zip.readTextEntry("content.xml")).toContain("of:=[.$A$1]*2");
  const loaded = await readOdsDocument(bytes);
  expect(loaded.GetTableCount()).toBe(2);
  expect(loaded.GetValue(b)).toBe(5);
  expect(text(loaded.GetSharedString(c).getString())).toBe('  x & <"😀>\t end ');
  loaded.SetValue(a, 4);
  const again = await readOdsDocument(await writeOdsDocument(loaded));
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

it("imports ODF paragraph boundaries into edit-text cells", /** Checks imports ODF paragraph boundaries into edit-text cells. @returns Test completion or assertion result. */ () => {
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
  const copy = await readOdsDocument(await writeOdsDocument(doc));
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
    '<table:table-cell table:formula="f:=1" table:number-columns-repeated="2"/>',
    "<table:table-cell><text:p><text:ruby/></text:p></table:table-cell>",
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

it("keeps spaced and multiline text spans in the native editor", /** Ports the source text:s and bold span assertions with independent ODF XML. @returns Completion. */ async () => {
  const input = independent(`<table:table-row>
    <table:table-cell><text:p>on<text:span text:style-name="B">e <text:s text:c="4"/>t</text:span>wo</text:p></table:table-cell>
    <table:table-cell><text:p>a<text:span text:style-name="B">b<text:tab/></text:span><text:tab/><text:line-break/><text:span text:style-name="B">c</text:span>d</text:p></table:table-cell>
    <table:table-cell><text:p><text:span text:style-name="absent">plain</text:span><text:span><text:s/>text</text:span></text:p></table:table-cell>
    <table:table-cell><text:p><text:span text:style-name="MissingOffset">a</text:span><text:span text:style-name="MissingHeight">b</text:span></text:p><text:p/></table:table-cell>
  </table:table-row>`).replace(
    "<office:body>",
    '<office:automatic-styles xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><s:style s:name="B" s:family="text"><s:text-properties fo:font-weight="bold"/></s:style><s:style s:name="MissingOffset" s:family="text"><s:text-properties s:text-position="unknown 62%"/></s:style><s:style s:name="MissingHeight" s:family="text"><s:text-properties s:text-position="super invalid"/></s:style></office:automatic-styles><office:body>',
  );
  const document = load(input);
  let reopened: ScDocument | undefined;
  try {
    reopened = await readOdsDocument(await writeOdsDocument(document));
    for (const copy of [document, reopened]) {
      const edit = copy.GetRefCellValue(new ScAddress()).getEditText();
      expect(edit?.GetParagraphCount()).toBe(1);
      const paragraph = edit?.GetText(0);
      try {
        expect(paragraph && text(paragraph)).toBe("one     two");
        const items: EECharAttrib[] = [];
        edit?.GetCharAttribs(0, items);
        const bold = items.find(
          /** Identifies the actual styled extent. @param item - Native character item. @returns Match. */
          (item) =>
            item.pAttr?.Which() === EE_CHAR_WEIGHT &&
            (item.pAttr as SvxWeightItem).GetValue() === FontWeight.WEIGHT_BOLD,
        );
        expect(bold && paragraph && text(paragraph).slice(bold.nStart, bold.nEnd)).toBe("e     t");
      } finally {
        paragraph?.dispose();
      }
      const multiline = copy.GetRefCellValue(new ScAddress(1, 0, 0)).getEditText();
      expect(multiline?.GetParagraphCount()).toBe(2);
      if (!multiline) throw new Error("Expected multiline edit cell");
      const engine = copy.GetEditEngine();
      engine.SetText(multiline);
      const value = engine.GetText();
      try {
        expect(text(value)).toBe("ab\t\ncd");
      } finally {
        value.dispose();
      }
      const plain = copy.GetRefCellValue(new ScAddress(2, 0, 0));
      const plainText = plain.getEditText()?.GetText(0);
      try {
        const actualText = plainText ?? plain.getSharedString()?.getString();
        expect(actualText && text(actualText)).toBe("plain text");
      } finally {
        plainText?.dispose();
      }
      const positioned = copy.GetRefCellValue(new ScAddress(3, 0, 0)).getEditText();
      expect(positioned?.GetParagraphCount()).toBe(2);
      const positions: EECharAttrib[] = [];
      positioned?.GetCharAttribs(0, positions);
      const escapement = positions.flatMap(
        /** Reads the native offset and proportional height for each run. @param entry - Character item. @returns Native values. */
        ({ pAttr }) => {
          if (pAttr?.Which() !== EE_CHAR_ESCAPEMENT) return [];
          const item = pAttr as SvxEscapementItem;
          return [[item.GetEsc(), item.GetProportionalHeight()]];
        },
      );
      expect(escapement).toEqual([
        [0, 62],
        [DFLT_ESC_AUTO_SUPER, 100],
      ]);
    }
  } finally {
    reopened?.Dispose();
    document.Dispose();
  }
});

it("round-trips sparse merge anchors and covered cell contents", /** Starts from independent ODF and reopens native document bytes. @returns Completion. */ async () => {
  const doc = load(
    independent(`<table:table-row table:number-rows-repeated="800"/>
    <table:table-row><table:table-cell table:number-columns-spanned="2" table:number-rows-spanned="4"/><table:covered-table-cell office:value-type="float" office:value="7"/></table:table-row>
    <table:table-row table:number-rows-repeated="3"><table:covered-table-cell table:number-columns-repeated="2"/></table:table-row>`),
  );
  const bytes = await writeOdsDocument(doc);
  const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
  expect(xml).toContain('table:number-columns-spanned="2" table:number-rows-spanned="4"');
  expect(xml).toContain('<table:covered-table-cell table:number-columns-repeated="2"/>');
  expect(xml).toContain('table:number-rows-repeated="800"');
  const loaded = await readOdsDocument(bytes);
  const sheet = loaded.FetchTable(0);
  const merge = sheet?.GetPattern(0, 800)?.GetItem(ATTR_MERGE) as ScMergeAttr;
  const flags = sheet?.GetPattern(1, 803)?.GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr;
  expect([merge.GetColMerge(), merge.GetRowMerge()]).toEqual([2, 4]);
  expect(flags.IsHorOverlapped() && flags.IsVerOverlapped()).toBe(true);
  expect(loaded.GetValue(new ScAddress(1, 800, 0))).toBe(7);
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
  const { DocumentArchiveWriter } =
      await import("../../../../package/source/zippackage/document-archive"),
    { createManifestXml, createManifestProperty } =
      await import("../../../../package/source/manifest/ManifestWriter"),
    { ODS_MIMETYPE, ScXMLImportWrapper } = await import("./xmlwrap"),
    { DEFAULT_ARCHIVE_LIMITS } =
      await import("../../../../package/source/zippackage/document-archive");
  /** Builds independent wire bytes,not a fake ZIP backend. @param mime - Media content. @param first - Whether media entry is first. @param root - Root media property. @returns Package. */
  async function bytes(
    mime = ODS_MIMETYPE,
    first = true,
    root = ODS_MIMETYPE,
  ): Promise<Uint8Array> {
    const zip = new DocumentArchiveWriter(),
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
    return await zip.finish();
  }
  for (const input of [
    await bytes("bad"),
    await bytes(ODS_MIMETYPE, false),
    await bytes(ODS_MIMETYPE, true, "application/vnd.oasis.opendocument.text"),
  ])
    await expect(readOdsDocument(input)).rejects.toThrow();
  const compressed = await compressedMimetypePackage(ODS_MIMETYPE);
  await expect(readOdsDocument(compressed)).rejects.toThrow(/mimetype/);
  const normal = await bytes();
  expect(
    (await readOdsDocument(normal, { zipLimits: DEFAULT_ARCHIVE_LIMITS })).GetTableCount(),
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
  await expect(
    /** Explicit export ceiling applies to actual bytes. @returns Bytes. */ async () =>
      await writeOdsDocument(doc, { maxOutputBytes: 0 }),
  ).rejects.toThrow(/size limit/);
  await expect(
    /** Export can be cancelled before content. @returns Bytes. */ async () =>
      await writeOdsDocument(doc, { isCancelled: /** Aborts. @returns True. */ () => true }),
  ).rejects.toThrow(/cancelled/);
  doc.SetValue(new ScAddress(1, 0, 0), 3);
  n = 0;
  await expect(
    /** Export observes cancellation during live traversal. @returns Bytes. */ async () =>
      await writeOdsDocument(doc, {
        isCancelled: /** Aborts during traversal. @returns Whether aborted. */ () => ++n > 2,
      }),
  ).rejects.toThrow(/cancelled/);
  const target = new ScDocument();
  await new ScXMLImportWrapper(target).Import(normal);
  expect(target.GetValue(new ScAddress(0, 0, 0))).toBe(2);
  const table = target.FetchTable(0);
  assert(table);
  table.CreateColumnIfNotExists(0).SetRawString(1, unicode("a\nb"));
  await expect(
    /** Rich multiline storage needs its actual export owner. @returns Bytes. */ async () =>
      await writeOdsDocument(target),
  ).rejects.toThrow(/multiline/);
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
  expect(diagnostics.length).toBe(1);
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
    bytes = await new ScXMLImportWrapper(doc).Export();
  expect(await (await DocumentArchive.open(bytes)).readTextEntry("content.xml")).toBe(xml);
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
  const bytes = await writeOdsDocument(doc),
    xmlOut = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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

it("observes cancellation while traversing an empty sheet's attribute row runs", /** Empty formatting/content still participates in the cooperative export boundary. @returns Nothing. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Empty"));
  let calls = 0;
  await expect(
    /** Observes actual export cancellation in an empty row run. @returns Never. */ async () =>
      await writeOdsDocument(doc, {
        isCancelled: /** Cancels after wrapper admission. @returns Cancelled. */ () => ++calls > 1,
      }),
  ).rejects.toThrow(/cancelled/);
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
  const bytes = await writeOdsDocument(doc),
    content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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
  const xml = await (
    await DocumentArchive.open(await writeOdsDocument(doc))
  ).readTextEntry("content.xml");
  expect(xml).not.toContain("fo:font-style=");
  doc.DisposeAttributes();
});

it("resolves the original ODF-style number maps and writes volatile subformats", /** Uses the signed currency branch layout from the pinned Calc flat ODF fixtures, with forward references. @returns Completion. */ async () => {
  const xml = independent(
    '<table:table-row><table:table-cell table:style-name="Money" office:value-type="float" office:value="780"/><table:table-cell table:style-name="Money" office:value-type="float" office:value="-780"/></table:table-row>',
  ).replace(
    "<office:body>",
    `<office:automatic-styles xmlns:n="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0">
      <s:style s:name="Money" s:family="table-cell" s:data-style-name="N114"/>
      <n:currency-style s:name="N114">
        <s:text-properties fo:color="#ff0000"/><n:text>-</n:text>
        <n:number n:decimal-places="2" n:min-integer-digits="1" n:grouping="true"/>
        <n:text> </n:text><n:currency-symbol n:language="de" n:country="DE">€</n:currency-symbol>
        <s:map s:condition="value()&gt;=0" s:apply-style-name="N114P0"/>
      </n:currency-style>
      <n:currency-style s:name="N114P0" s:volatile="true">
        <n:number n:decimal-places="2" n:min-integer-digits="1" n:grouping="true"/>
        <n:text> </n:text><n:currency-symbol n:language="de" n:country="DE">€</n:currency-symbol>
      </n:currency-style>
    </office:automatic-styles><office:body>`,
  );
  const first = load(xml);
  let copy: ScDocument | undefined;
  const output = new OUString();
  try {
    const bytes = await writeOdsDocument(first);
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    expect(content).toMatch(/style:name="N\d+P0" style:volatile="true"/u);
    expect(content).toMatch(
      /<style:map style:condition="value\(\)&gt;=0" style:apply-style-name="N\d+P0"\/>/u,
    );
    expect(content).toContain('<style:text-properties fo:color="#ff0000"/>');
    copy = await readOdsDocument(bytes);
    for (const document of [first, copy]) {
      const formatter = document.GetFormatTable();
      for (const [column, expected] of ["780.00 €", "-780.00 €"].entries()) {
        const address = new ScAddress(column, 0, 0);
        const key = document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
        const color: [import("../../../../tools/inc/color").Color | null] = [null];
        formatter.GetOutputString(document.GetValue(address), key, output, color);
        expect(text(output)).toBe(expected);
        expect(color[0]?.toUInt32()).toBe(column ? 0xff0000 : undefined);
      }
    }
  } finally {
    output.dispose();
    copy?.Dispose();
    first.Dispose();
  }
});

it("keeps the complementary number map when text is the final number format section", /** Exercises the native three numeric parts and the fourth text part through ODS. @returns Completion. */ async () => {
  const first = load(
    independent(
      '<table:table-row><table:table-cell table:style-name="Cell" office:value-type="float" office:value="1"/></table:table-row>',
    ).replace(
      "<office:body>",
      `<office:automatic-styles xmlns:n="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
        <s:style s:name="Cell" s:family="table-cell" s:data-style-name="Mixed"/>
        <n:number-style s:name="Positive"><n:number n:min-integer-digits="1"/></n:number-style>
        <n:number-style s:name="Negative"><n:text>-</n:text><n:number n:min-integer-digits="1"/></n:number-style>
        <n:number-style s:name="Zero"><n:text>zero</n:text></n:number-style>
        <n:text-style s:name="Mixed">
          <n:text>text:</n:text><n:text-content/>
          <s:map s:condition="value()&gt;0" s:apply-style-name="Positive"/>
          <s:map s:condition="value()&lt;0" s:apply-style-name="Negative"/>
          <s:map s:condition="value()=0" s:apply-style-name="Zero"/>
        </n:text-style>
      </office:automatic-styles><office:body>`,
    ),
  );
  const input = unicode("abc");
  const output = new OUString();
  let copy: ScDocument | undefined;
  try {
    const bytes = await writeOdsDocument(first);
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    expect(content).toMatch(/style:condition="value\(\)=0" style:apply-style-name="N\d+P2"/u);
    copy = await readOdsDocument(bytes);
    for (const document of [first, copy]) {
      const formatter = document.GetFormatTable();
      const key = document.GetPattern(new ScAddress())?.GetNumberFormat(formatter) ?? 0;
      formatter.GetOutputString(5, key, output, [null]);
      expect(text(output)).toBe("5");
      formatter.GetOutputString(-5, key, output, [null]);
      expect(text(output)).toBe("-5");
      formatter.GetOutputString(0, key, output, [null]);
      expect(text(output)).toBe("zero");
      formatter.GetOutputString(input, key, output, [null]);
      expect(text(output)).toBe("text:abc");
    }
  } finally {
    input.dispose();
    output.dispose();
    copy?.Dispose();
    first.Dispose();
  }
});

it("round-trips ODF number maps with a decimal threshold or an unconditional numeric part", /** Exercises explicit inequality, absent or cyclic targets, and the native text fallback map. @returns Completion. */ async () => {
  const first = load(
    independent(
      '<table:table-row><table:table-cell table:style-name="ThresholdCell" office:value-type="float" office:value="1.5"/><table:table-cell table:style-name="TextCell" office:value-type="float" office:value="5"/></table:table-row>',
    ).replace(
      "<office:body>",
      `<office:automatic-styles xmlns:n="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0" xmlns:s="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
        <s:style s:name="ThresholdCell" s:family="table-cell" s:data-style-name="Threshold"/>
        <s:style s:name="TextCell" s:family="table-cell" s:data-style-name="Text"/>
        <n:number-style s:name="Threshold">
          <n:text>threshold</n:text>
          <s:map s:condition="value()&lt;1" s:apply-style-name="Threshold"/>
          <s:map s:condition="value()=1" s:apply-style-name="Missing"/>
          <s:map s:condition="value()!=1.5" s:apply-style-name="Number"/>
        </n:number-style>
        <n:text-style s:name="Text">
          <n:text-content/><s:map s:condition="value()&lt;=1.7976931348623157E+308" s:apply-style-name="Number"/>
        </n:text-style>
        <n:number-style s:name="Number"><n:number n:min-integer-digits="1" n:decimal-places="0"/></n:number-style>
      </office:automatic-styles><office:body>`,
    ),
  );
  const output = new OUString();
  let copy: ScDocument | undefined;
  try {
    const bytes = await writeOdsDocument(first);
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    expect(content).toContain('style:condition="value()!=1.5"');
    expect(content).toMatch(/style:condition="value\(\)&lt;=1\.7976931348623157E\+308"/u);
    copy = await readOdsDocument(bytes);
    for (const document of [first, copy]) {
      const formatter = document.GetFormatTable();
      const threshold = document.GetPattern(new ScAddress())?.GetNumberFormat(formatter) ?? 0;
      const textFormat =
        document.GetPattern(new ScAddress(1, 0, 0))?.GetNumberFormat(formatter) ?? 0;
      formatter.GetOutputString(1.5, threshold, output, [null]);
      expect(text(output)).toBe("threshold");
      formatter.GetOutputString(3, threshold, output, [null]);
      expect(text(output)).toBe("3");
      formatter.GetOutputString(-5, textFormat, output, [null]);
      expect(text(output)).toBe("-5");
    }
  } finally {
    output.dispose();
    copy?.Dispose();
    first.Dispose();
  }
});
