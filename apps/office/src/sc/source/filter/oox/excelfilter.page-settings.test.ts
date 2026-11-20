/** @fileoverview Native Calc page styles through XLSX, ODS and Worker transfer. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ExcelFilter } from "./excelfilter";
import { HeaderFooterParser } from "./pagesettings.headerfooter";
import { StylesBuffer } from "./stylesbuffer";
import { exportXlsx } from "../excel/xetable";
import { XclExpHFConverter } from "../excel/xehelper.headerfooter";
import { XclFontData } from "../excel/xlstyle";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScXMLImport } from "../xml/xmlimprt";
import { ScDocument } from "../../../inc/document";
import type { SvxPageItem, SvxSetItem } from "../../../../svx/inc/pageitem";
import type { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxUInt16Item } from "../../../../svl/inc/intitem";
import type { ScPageScaleToItem } from "../../../inc/attrib";
import type { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import {
  ATTR_PAGE,
  ATTR_PAGE_ON,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_HEADERRIGHT,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_SCALE,
  ATTR_PAGE_GRID,
  ATTR_PAGE_HEADERS,
  ATTR_PAGE_FIRSTPAGENO,
  ATTR_PAGE_TOPDOWN,
  ATTR_PAGE_HORCENTER,
  ATTR_PAGE_VERCENTER,
  ATTR_PAGE_NOTES,
  ATTR_LRSPACE,
  ATTR_ULSPACE,
} from "../../../inc/scitems";

const worksheet = "xl/worksheets/sheet1.xml";

/** Unchanged native QA workbook. @param stem - Fixture name. @returns File bytes. */
function fixture(stem: string): Uint8Array {
  return new Uint8Array(
    readFileSync(`../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/${stem}.xlsx`),
  );
}

/** Reads the sheet's real named page item set. @param document - Workbook. @param tab - Native sheet. @returns Existing style items. */
function style(document: ScDocument, tab = 0) {
  const items = document
    .GetStyleSheetPool()
    ?.GetPageStyle(document.GetPageStyle(tab))
    ?.GetItemSet();
  assert(items);
  return items;
}

/** Returns represented print settings from the original page-pool values. @param document - Workbook. @returns Page properties. */
function page(document: ScDocument) {
  const items = style(document);
  const size = (items.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize();
  const lr = items.Get(ATTR_LRSPACE) as SvxLRSpaceItem;
  const ul = items.Get(ATTR_ULSPACE) as SvxULSpaceItem;
  const fit = items.Get(ATTR_PAGE_SCALETO) as ScPageScaleToItem;
  const flag =
    /** Borrows the native page boolean. @param which - Which identity. @returns Page flag. */ (
      which: number,
    ): boolean => (items.Get(which) as SfxBoolItem).GetValue();
  const reserve =
    /** Reads the native header/footer total height. @param which - Header or footer set. @returns Body offset in twips. */ (
      which: number,
    ): number => {
      const set = (items.Get(which) as SvxSetItem).GetItemSet();
      return (set.Get(ATTR_PAGE_ON) as SfxBoolItem).GetValue()
        ? (set.Get(ATTR_PAGE_SIZE) as SvxSizeItem).GetSize().Height()
        : 0;
    };
  return {
    landscape: (items.Get(ATTR_PAGE) as SvxPageItem).IsLandscape(),
    size: [size.Width(), size.Height()],
    grid: flag(ATTR_PAGE_GRID),
    headings: flag(ATTR_PAGE_HEADERS),
    notes: flag(ATTR_PAGE_NOTES),
    center: [flag(ATTR_PAGE_HORCENTER), flag(ATTR_PAGE_VERCENTER)],
    down: flag(ATTR_PAGE_TOPDOWN),
    margins: [
      lr.ResolveLeft(),
      lr.ResolveRight(),
      ul.GetUpper() + reserve(ATTR_PAGE_HEADERSET),
      ul.GetLower() + reserve(ATTR_PAGE_FOOTERSET),
    ],
    scale: (items.Get(ATTR_PAGE_SCALE) as SfxUInt16Item).GetValue(),
    first: (items.Get(ATTR_PAGE_FIRSTPAGENO) as SfxUInt16Item).GetValue(),
    fit: [fit.GetWidth(), fit.GetHeight()],
  };
}

/** Reuses an unmodified workbook with a tailored worksheet property set. @param replacement - Independent page XML. @param fit - Fit mode. @returns Workbook bytes. */
async function patched(replacement: string, fit = true): Promise<Uint8Array> {
  const archive = await DocumentArchive.open(fixture("sheet-tab-color"));
  const result = new DocumentArchiveWriter();
  for (const part of archive.getEntryNames()) {
    const bytes =
      part === worksheet
        ? new TextEncoder().encode(
            (await archive.readTextEntry(part))
              .replace("</sheetPr>", `<pageSetUpPr fitToPage="${fit}"/></sheetPr>`)
              .replace(/<pageMargins[^>]*\/>/u, replacement),
          )
        : await archive.readEntry(part);
    result.putNextEntry(part, bytes);
  }
  return result.finish();
}

it("exports paper size 70 from the original tdf136721 test and preserves the ODS and Worker style", /** Matches the native size identifier, sheet orientation, margins and print flags. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdf136721_letter_sized_paper"));
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  const ods = await writeOdsDocument(worker);
  const copy = await readOdsDocument(ods);
  const xlsx = await exportXlsx(copy);
  const reopened = await ExcelFilter.importDocument(xlsx);
  try {
    const expected = {
      landscape: true,
      size: [8391, 5953],
      grid: true,
      headings: true,
      notes: false,
      center: [false, false],
      down: true,
      margins: [283, 567, 1134, 1701],
      scale: 100,
      first: 0,
      fit: [0, 0],
    };
    for (const document of [source, worker, copy, reopened]) {
      const values = page(document);
      expect({ ...values, margins: values.margins.slice(0, 2) }).toEqual({
        ...expected,
        margins: expected.margins.slice(0, 2),
      });
      // Separate native edge and header/footer height conversions can round in opposite directions.
      for (const axis of [2, 3])
        expect(
          Math.abs((values.margins[axis] ?? 0) - (expected.margins[axis] ?? 0)),
        ).toBeLessThanOrEqual(1);
    }
    const stored = await DocumentArchive.open(ods);
    expect(await stored.readTextEntry("styles.xml")).toContain(
      'style:print-orientation="landscape"',
    );
    expect(await stored.readTextEntry("content.xml")).toContain('style:master-page-name="MP1"');
    const xml = await (await DocumentArchive.open(xlsx)).readTextEntry(worksheet);
    expect(xml).toMatch(/<pageSetup[^>]*paperSize="70"/u);
    expect(xml).toContain('<printOptions headings="true" gridLines="true"');
    expect(xml).toMatch(/<pageMargins[^>]*\/><pageSetup/u);
  } finally {
    for (const document of [source, worker, copy, reopened]) document.Dispose();
  }
});

it("keeps the original fitted sheet bounded to one page wide", /** Uses the original tdf151755 package with its unbounded vertical dimension. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("tdf151755_stylesLostOnXLSXExport"));
  const copy = await readOdsDocument(await writeOdsDocument(source));
  try {
    expect(page(source)).toMatchObject({
      landscape: false,
      margins: [1080, 1080, 1440, 1440],
      scale: 0,
      fit: [1, 0],
    });
    expect(page(copy)).toEqual(page(source));
    const xml = await (await DocumentArchive.open(await exportXlsx(copy))).readTextEntry(worksheet);
    expect(xml).toContain('<pageSetUpPr fitToPage="true"/>');
    expect(xml).toMatch(/<pageSetup[^>]*fitToWidth="1" fitToHeight="0"/u);
  } finally {
    source.Dispose();
    copy.Dispose();
  }
});

it("preserves independent physical and print flags in the page style", /** Exercises custom paper, native clamping and unsupported printer defaults. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(
    await patched(
      '<printOptions horizontalCentered="1" verticalCentered="true" gridLines="true"/><pageMargins right="0.5"/><pageSetup paperSize="9" paperWidth="170mm" paperHeight="255mm" pageOrder="overThenDown" useFirstPageNumber="1" firstPageNumber="11000" fitToWidth="-7" fitToHeight="1200" cellComments="asDisplayed"/>',
    ),
  );
  try {
    expect(page(source)).toMatchObject({
      center: [true, true],
      grid: true,
      headings: false,
      down: false,
      notes: true,
      size: [9638, 14457],
      first: 9999,
      scale: 0,
      fit: [0, 1000],
      margins: [1077, 720, 1417, 1417],
    });
    const bytes = await exportXlsx(source);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry(worksheet);
    expect(xml).toContain('paperWidth="170mm" paperHeight="255mm"');
    expect(xml).toContain('firstPageNumber="9999" useFirstPageNumber="true"');
    expect(xml).toContain('cellComments="atEnd"');
    const reopened = await ExcelFilter.importDocument(bytes);
    try {
      expect(page(reopened).notes).toBe(false);
    } finally {
      reopened.Dispose();
    }
    const stale = structuredClone(encodeCalcDocument(source));
    const sheet = stale.sheets[0];
    assert(sheet);
    stale.sheets[0] = { ...sheet, pageStyle: "Missing" };
    expect(
      /** Tries an unknown page style. @returns Decoded workbook. */ () =>
        decodeCalcDocument(stale),
    ).toThrow("Invalid Calc sheet page style.");
  } finally {
    source.Dispose();
  }
});

it("resolves a shared ODF master page and writes the first page number only once", /** Imports the original style reference, legacy fit attributes and first-page rules. @returns Completion. */ async () => {
  const source = new ScDocument();
  const importer = new ScXMLImport(source);
  const namespaces =
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:loext="urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0"';
  try {
    importer.importStyles(`<office:document-styles ${namespaces}>
      <office:automatic-styles><style:page-layout style:name="layout"><style:page-layout-properties
        fo:page-width="21cm" fo:page-height="29.7cm" fo:margin="1in" fo:margin-left="0.5in"
        style:table-centering="vertical" style:print-page-order="ltr" style:first-page-number="5"
        loext:scale-to-X="2" loext:scale-to-Y="0"/></style:page-layout>
      <style:page-layout style:name="wide"><style:page-layout-properties
        fo:page-width="21cm" fo:page-height="invalid" fo:margin-left="0.5in" fo:margin-top="0.8in"
        style:scale-to-pages="3" style:table-centering="horizontal"/></style:page-layout>
      <style:page-layout style:name="tall"><style:page-layout-properties
        fo:page-height="29cm" fo:margin-right="0.5in" fo:margin-bottom="0.8in"
        style:table-centering="both"/></style:page-layout>
      </office:automatic-styles>
      <office:master-styles><style:master-page style:name="page" style:display-name="Shared print page"
        style:page-layout-name="layout"/>
      <style:master-page style:name="wide" style:page-layout-name="wide"/>
      <style:master-page style:name="tall" style:page-layout-name="tall"/>
      <style:master-page style:name="blank"/></office:master-styles></office:document-styles>`);
    importer.importContent(`<office:document-content ${namespaces}><office:automatic-styles>
      <style:style style:name="sheet" style:family="table" style:master-page-name="page"/>
      <style:style style:name="wideStyle" style:family="table" style:master-page-name="wide"/>
      <style:style style:name="tallStyle" style:family="table" style:master-page-name="tall"/>
      <style:style style:name="blankStyle" style:family="table" style:master-page-name="blank"/>
      <style:style style:name="missingStyle" style:family="table" style:master-page-name="missing"/>
      </office:automatic-styles><office:body><office:spreadsheet>
      <table:table table:name="First" table:style-name="sheet"/><table:table table:name="Second" table:style-name="sheet"/>
      <table:table table:name="Third" table:style-name="wideStyle"/>
      <table:table table:name="Fourth" table:style-name="tallStyle"/>
      <table:table table:name="Fifth" table:style-name="blankStyle"/>
      <table:table table:name="Sixth" table:style-name="missingStyle"/>
      </office:spreadsheet></office:body></office:document-content>`);
    expect(source.GetPageStyle(0)).toBe("Shared print page");
    expect(source.GetPageStyle(1)).toBe("Shared print page");
    expect(page(source)).toMatchObject({
      center: [false, true],
      down: false,
      fit: [2, 0],
      scale: 0,
      first: 5,
      margins: [720, 1440, 1440, 1440],
    });
    const ods = await DocumentArchive.open(await writeOdsDocument(source));
    const styles = await ods.readTextEntry("styles.xml");
    expect(styles).toContain('style:table-centering="horizontal"');
    expect(styles).toContain('style:table-centering="both"');
    expect(styles).toContain('style:scale-to-pages="3"');
    expect(source.GetPageStyle(4)).toBe("blank");
    expect(source.GetPageStyle(5)).toBe("Default");
    const archive = await DocumentArchive.open(await exportXlsx(source));
    expect(await archive.readTextEntry(worksheet)).toContain('firstPageNumber="5"');
    expect(await archive.readTextEntry("xl/worksheets/sheet2.xml")).not.toContain(
      "firstPageNumber",
    );
  } finally {
    source.Dispose();
  }
});

it("uses the original 100 percent default for an uninitialized scale and keeps the style paper fallback", /** Exercises the source fallback when no custom or indexed paper is valid. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(
    await patched(
      '<pageMargins/><pageSetup paperSize="0" scale="0" paperWidth="130pixels"/>',
      false,
    ),
  );
  try {
    expect(page(source)).toMatchObject({
      size: [12240, 15840],
      landscape: false,
      scale: 100,
      fit: [0, 0],
    });
    const xml = await (
      await DocumentArchive.open(await exportXlsx(source))
    ).readTextEntry(worksheet);
    expect(xml).toMatch(/<pageSetup[^>]*paperSize="1" scale="100"/u);
  } finally {
    source.Dispose();
  }
});

it.each([
  [
    "tdf134459_HeaderFooterColor",
    "&amp;L&amp;Kc06040l&amp;C&amp;K4c3789c&amp;Rr",
    "&amp;Ll&amp;C&amp;K64cf5fc&amp;R&amp;Kcd15aar",
  ],
  [
    "tdf134817_HeaderFooterTextWith2Section",
    '&amp;L&amp;"Abadi"&amp;11aaa&amp;"Bembo"&amp;20bbb',
    '&amp;R&amp;"Cambria"&amp;14camb&amp;"Dante"&amp;18dant',
  ],
] as const)(
  "exports the original header/footer assertions for %s",
  /** Checks upstream's complete worksheet header and footer strings. @param name - Pinned XLSX fixture. @param header - Expected XML-escaped header. @param footer - Expected XML-escaped footer. @returns Completion. */ async (
    name,
    header,
    footer,
  ) => {
    const source = await ExcelFilter.importDocument(fixture(name));
    try {
      const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
      const stored = await readOdsDocument(await writeOdsDocument(worker));
      try {
        for (const document of [source, worker, stored]) {
          const archive = await DocumentArchive.open(await exportXlsx(document));
          const xml = await archive.readTextEntry(worksheet);
          expect(xml).toContain("<oddHeader>" + header.replaceAll('"', "&quot;") + "</oddHeader>");
          expect(xml).toContain("<oddFooter>" + footer.replaceAll('"', "&quot;") + "</oddFooter>");
        }
      } finally {
        worker.Dispose();
        stored.Dispose();
      }
    } finally {
      source.Dispose();
    }
  },
);

it("duplicates the shared footer in the original even-page ODS export", /** Runs upstream's first and second sheet header/footer assertions. @returns Completion. */ async () => {
  const source = await readOdsDocument(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf121716_EvenHeaderFooter.ods",
      ),
    ),
  );
  try {
    const packageFile = await DocumentArchive.open(await exportXlsx(source));
    const first = await packageFile.readTextEntry(worksheet);
    const second = await packageFile.readTextEntry("xl/worksheets/sheet2.xml");
    expect(first).toContain('differentOddEven="true"');
    expect(first).toContain("<oddHeader>&amp;Lodd/right&amp;Cpage&amp;Rheader</oddHeader>");
    expect(first).toContain("<evenHeader>&amp;Lpage&amp;Cheader&amp;Reven/left</evenHeader>");
    for (const tag of ["oddFooter", "evenFooter"])
      expect(first).toContain(`<${tag}>&amp;Lboth&amp;C&amp;12page&amp;Rfooter</${tag}>`);
    expect(second).toContain("<oddHeader>&amp;Coddh</oddHeader>");
    expect(second).toContain("<evenHeader>&amp;Cevenh</evenHeader>");
    expect(second).toContain("<oddFooter>&amp;Coddf</oddFooter>");
    expect(second).toContain("<evenFooter>&amp;Levenf</evenFooter>");
  } finally {
    source.Dispose();
  }
});

it("retains worksheet page fields and first/even settings across ODS", /** Asserts native field identities and escaped output after the primary-format conversion. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(
    await patched(
      '<pageMargins left="0.7" right="0.7" top="0.9" bottom="0.9" header="0.2" footer="0.2"/><headerFooter differentFirst="1" differentOddEven="1"><oddHeader>&amp;L&amp;A&amp;C&amp;P/&amp;N&amp;RRock &amp;&amp; Roll</oddHeader><evenHeader>&amp;Ceven</evenHeader><firstHeader>&amp;Cfirst</firstHeader><oddFooter>&amp;Rfooter</oddFooter></headerFooter>',
    ),
  );
  const restored = await readOdsDocument(await writeOdsDocument(source));
  try {
    const document = await DocumentArchive.open(await exportXlsx(restored));
    const xml = await document.readTextEntry(worksheet);
    expect(xml).toContain('<headerFooter differentFirst="true" differentOddEven="true">');
    expect(xml).toContain(
      "<oddHeader>&amp;L&amp;A&amp;C&amp;P/&amp;N&amp;RRock &amp;&amp; Roll</oddHeader>",
    );
    expect(xml).toContain("<evenHeader>&amp;Ceven</evenHeader>");
    expect(xml).toContain("<firstHeader>&amp;Cfirst</firstHeader>");
  } finally {
    source.Dispose();
    restored.Dispose();
  }
});

it("applies the original font control transitions and skips incomplete tokens", /** Checks blank paragraph height, ASCII control codes and the current font transitions. @returns Nothing. */ () => {
  const document = new ScDocument();
  const styles = new StylesBuffer();
  const parser = new HeaderFooterParser(document, styles);
  const base = new XclFontData();
  const converter = new XclExpHFConverter(base);
  const parsed = parser.parse(
    '&l&30\n\n&L&"Cambria,Fett SchrÄg"&U&S&XFirst&U&S&X Plain&E&YDouble&E&Y Last\n&"-,Regular"Second&0!&1001?&K!&',
    ATTR_PAGE_HEADERRIGHT,
  );
  const interrupted = parser.parse('Keep&"Ignore\0remainder', ATTR_PAGE_HEADERRIGHT);
  const reset = parser.parse('&C&"Bembo"Custom&"-"Default&",Italic"Italic', ATTR_PAGE_HEADERRIGHT);
  try {
    expect(parsed.height).toBe(2400);
    const encoded = converter.GenerateString([parsed.content.GetLeftArea(), null, null]).value;
    expect(encoded).toContain("&B&I&30&U&S&XFirst&U&S&X Plain&E&YDouble&E&Y Last");
    expect(encoded).toContain("\n&B&ISecond!?!");
    expect(
      converter.GenerateString([null, interrupted.content.GetCenterArea(), null]).value,
    ).toMatch(/Keep$/u);
    const families = converter.GenerateString([null, reset.content.GetCenterArea(), null]).value;
    expect(families).toContain('&"Bembo"');
    expect(families).toContain('&"Cambria"Default&IItalic');
  } finally {
    parsed.content.dispose();
    interrupted.content.dispose();
    reset.content.dispose();
    base.Dispose();
    styles.dispose();
    document.Dispose();
  }
});

it("preserves ODF header spans, text features and unformatted text through XLSX export", /** Uses a digit at a font-size transition and tests original dynamic text fields. @returns Completion. */ async () => {
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  const namespaces =
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"';
  try {
    importer.importStyles(`<office:document-styles ${namespaces}><office:automatic-styles>
      <style:style style:name="Big" style:family="text"><style:text-properties fo:font-size="20pt"/></style:style>
      </office:automatic-styles><office:master-styles><style:master-page style:name="Letter">
      <style:header><style:region-left><text:h>Ignored</text:h><text:p>plain<text:s/><text:span text:style-name="Big"><text:span>123</text:span></text:span><text:tab/>tail</text:p></style:region-left>
      <text:h>Ignored</text:h><text:p><text:title/><text:line-break/><text:time/></text:p></style:header>
      </style:master-page></office:master-styles></office:document-styles>`);
    importer.importContent(`<office:document-content ${namespaces}><office:automatic-styles>
      <style:style style:name="sheet" style:family="table" style:master-page-name="Letter"/>
      </office:automatic-styles><office:body><office:spreadsheet><table:table table:name="First" table:style-name="sheet"/></office:spreadsheet></office:body></office:document-content>`);
    const ods = await DocumentArchive.open(await writeOdsDocument(document));
    const xml = await ods.readTextEntry("styles.xml");
    expect(xml).toContain("plain<text:s/><text:span");
    expect(xml).toContain("<text:tab/>tail");
    expect(xml).toMatch(
      /<text:p><text:title\/><text:line-break\/><text:time text:time-value="[^"]+"\/><\/text:p>/u,
    );
    expect(xml).not.toContain("Ignored");
    const workbook = await DocumentArchive.open(await exportXlsx(document));
    expect(await workbook.readTextEntry(worksheet)).toContain(
      "<oddHeader>&amp;Lplain &amp;20 123&amp;10&#9;tail&amp;C&amp;F&#10;&amp;T</oddHeader>",
    );
  } finally {
    document.Dispose();
  }
});

it("retains XLSX date, time and file fields across primary ODS and Worker transfer", /** Checks real output tokens, including original full-path normalization. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(
    await patched(
      '<pageMargins top="1" header="0.5"/><headerFooter><oddHeader>&amp;L&amp;D/&amp;T&amp;C&amp;F&amp;R&amp;Z&amp;f + &amp;Z</oddHeader></headerFooter>',
    ),
  );
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  const saved = await writeOdsDocument(worker);
  const restored = await readOdsDocument(saved);
  try {
    const styles = await (await DocumentArchive.open(saved)).readTextEntry("styles.xml");
    expect(styles).toMatch(/<text:date text:date-value="\d{4}-\d{2}-\d{2}"\/>/u);
    expect(styles).toMatch(/<text:time text:time-value="[^"]+"\/>/u);
    expect(styles.match(/<text:file-name text:display="full"\/>/gu)).toHaveLength(2);
    expect(styles).toContain('<text:file-name text:display="name-and-extension"/>');
    for (const document of [source, worker, restored]) {
      const archive = await DocumentArchive.open(await exportXlsx(document));
      expect(await archive.readTextEntry(worksheet)).toContain(
        "<oddHeader>&amp;L&amp;D/&amp;T&amp;C&amp;F&amp;R&amp;Z&amp;F + &amp;Z&amp;F</oddHeader>",
      );
    }
  } finally {
    source.Dispose();
    worker.Dispose();
    restored.Dispose();
  }
});

it("preserves fixed ODF date and time snapshots and filename formats", /** Reads a leap-day and nanosecond timestamp from native ODF field attributes. @returns Completion. */ async () => {
  const document = new ScDocument();
  const importer = new ScXMLImport(document);
  const namespaces =
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"';
  try {
    importer.importStyles(`<office:document-styles ${namespaces}>
      <office:master-styles><style:master-page style:name="Letter"><style:header>
      <text:p><text:date text:fixed="true" text:date-value="2024-02-29">Fixed date</text:date>
      <text:time text:fixed="true" text:time-value="16:07:00.123456789">Fixed time</text:time>
      <text:file-name text:display="path"/><text:file-name text:display="name"/><text:file-name/>
      </text:p></style:header></style:master-page></office:master-styles></office:document-styles>`);
    importer.importContent(`<office:document-content ${namespaces}><office:automatic-styles>
      <style:style style:name="sheet" style:family="table" style:master-page-name="Letter"/>
      </office:automatic-styles><office:body><office:spreadsheet><table:table table:name="First" table:style-name="sheet"/></office:spreadsheet></office:body></office:document-content>`);
    const ods = await DocumentArchive.open(await writeOdsDocument(document));
    const xml = await ods.readTextEntry("styles.xml");
    expect(xml).toContain('<text:date text:date-value="2024-02-29" text:fixed="true"/>');
    expect(xml).toContain('<text:time text:time-value="16:07:00.123456789" text:fixed="true"/>');
    expect(xml).toContain('<text:file-name text:display="path"/>');
    expect(xml).toContain('<text:file-name text:display="name"/>');
    expect(xml).toContain('<text:file-name text:display="full"/>');
    const archive = await DocumentArchive.open(await exportXlsx(document));
    expect(await archive.readTextEntry(worksheet)).toMatch(
      /<oddHeader>&amp;C&amp;D[^<]*&amp;T[^<]*&amp;Z&amp;F&amp;Z&amp;F/u,
    );
  } finally {
    document.Dispose();
  }
});

it("retains the native date and filename footer from tdf167019", /** Isolates the upstream header/footer XML from the workbook's conditional formats. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(fixture("tdf167019"));
  const headerFooter = (await source.readTextEntry(worksheet)).match(
    /<headerFooter>.*?<\/headerFooter>/su,
  )?.[0];
  assert(headerFooter);
  const document = await ExcelFilter.importDocument(await patched("<pageMargins/>" + headerFooter));
  try {
    const archive = await DocumentArchive.open(await exportXlsx(document));
    expect(await archive.readTextEntry(worksheet)).toMatch(
      /<oddFooter>&amp;L[^<]*&amp;D&amp;C[^<]*&amp;Z&amp;F&amp;R[^<]*&amp;P\/&amp;N<\/oddFooter>/u,
    );
  } finally {
    document.Dispose();
  }
});

it("saves the original tdf58243 XLSX with its invalid named reference", /** Ports the native rows-order export and checks the source date header. @returns Completion. */ async () => {
  const document = await ExcelFilter.importDocument(fixture("tdf58243"));
  try {
    expect(document.GetRangeName(0)?.findByUpperName("EXCEL_BUILTIN_DATABASE")?.GetSymbol()).toBe(
      "[#REF!]",
    );
    const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
    try {
      const restored = await readOdsDocument(await writeOdsDocument(worker));
      try {
        for (const candidate of [document, restored]) {
          const archive = await DocumentArchive.open(await exportXlsx(candidate));
          const names = await archive.readTextEntry("xl/workbook.xml");
          expect(names).toContain(
            '<definedName name="Excel_BuiltIn_Database" localSheetId="0">#REF!</definedName>',
          );
          expect(names).toContain(
            '<definedName name="Etat_du_dossier">[1]Feuil1!$D$2:$D$5</definedName>',
          );
          expect(await archive.readTextEntry(worksheet)).toMatch(
            /<oddHeader>[^<]*&amp;R&amp;D<\/oddHeader>/u,
          );
        }
      } finally {
        restored.Dispose();
      }
    } finally {
      worker.Dispose();
    }
  } finally {
    document.Dispose();
  }
});
