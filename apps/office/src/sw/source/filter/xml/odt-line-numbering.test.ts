/** @fileoverview Verifies document-owned Writer line numbering across ODF styles. */

import { SwFormatLineNumber } from "../../../inc/fmtline";
import { readFileSync } from "node:fs";
import { assert, describe, expect, it } from "vitest";

import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocumentArchiveWriter } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ARABIC, CHARS_UPPER_LETTER_N } from "../../../../offapi/com/sun/star/style/NumberingType";
import { LineNumberPosition } from "../../../inc/lineinfo";
import { RES_LINENUMBER } from "../../../inc/hintids";
import { decodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { XMLLineNumberingImportContext } from "../../../../xmloff/source/text/XMLLineNumberingImportContext";
import { exportLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingExport";
import { createWriterDocument } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = createDocument({
  id: "odt-line-numbers",
  suiteId: "writer",
  title: "Line numbers",
});

/** Changes styles.xml in an ODF package. @param bytes - Original archive. @param transform - XML change. @returns Rebuilt archive. */
async function rewriteStyles(
  bytes: Uint8Array,
  transform: (xml: string) => string,
): Promise<Uint8Array> {
  const archive = await DocumentArchive.open(bytes);
  const output = new DocumentArchiveWriter();
  for (const name of archive.getEntryNames())
    output.putNextEntry(
      name,
      name === "styles.xml"
        ? new TextEncoder().encode(transform(await archive.readTextEntry(name)))
        : await archive.readEntry(name),
    );
  return await output.finish();
}

describe("Writer ODF line numbering", /** Groups global configuration cases. @returns Nothing. */ () => {
  it("preserves pinned defaults and a complete explicit configuration", /** Checks supported settings round trip. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    const bytes = await writeOdtDocument(writer, metadata);
    const styles = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
    expect(styles).toContain('<text:linenumbering-configuration text:number-lines="false"');
    expect(
      (await readOdtDocument(bytes, metadata)).document.GetLineNumberInfo().QueryValue(),
    ).toEqual(writer.GetLineNumberInfo().QueryValue());

    const info = writer.GetLineNumberInfo();
    info.SetPaintLineNumbers(true);
    info.SetCountBlankLines(false);
    info.SetCountInFlys(true);
    info.SetRestartEachPage(true);
    info.SetCountBy(2);
    info.SetDivider("&");
    info.SetDividerCountBy(7);
    info.SetPosFromLeft(720);
    info.SetPos(LineNumberPosition.Outside);
    writer.SetLineNumberInfo(info);
    const explicitBytes = await writeOdtDocument(writer, metadata);
    const explicitStyles = await (
      await DocumentArchive.open(explicitBytes)
    ).readTextEntry("styles.xml");
    expect(explicitStyles).toContain('text:count-empty-lines="false"');
    expect(explicitStyles).toContain('text:count-in-text-boxes="true"');
    expect(explicitStyles).toContain('text:restart-on-page="true"');
    expect(explicitStyles).toContain('text:number-position="outside"');
    expect(explicitStyles).toContain('text:increment="2"');
    expect(explicitStyles).toContain('text:offset="1.27cm"');
    expect(explicitStyles).toContain(
      '<text:linenumbering-separator text:increment="7">&amp;</text:linenumbering-separator>',
    );
    expect(
      (await readOdtDocument(explicitBytes, metadata)).document.GetLineNumberInfo().QueryValue(),
    ).toEqual(info.QueryValue());
  });

  it("preserves native defaults when lexical conversion fails and applies repeated configurations in order", /** Checks native property admission on the package path. @returns Completion after import. */ async () => {
    const bytes = await writeOdtDocument(createWriterDocument(), metadata);
    const defaults = await readOdtDocument(
      await rewriteStyles(
        bytes,
        /** Removes optional line-number attributes. @param xml - Styles stream. @returns Rewritten stream. */ (
          xml,
        ) =>
          xml.replace(
            /<text:linenumbering-configuration[^>]*><\/text:linenumbering-configuration>/,
            "<text:linenumbering-configuration/>",
          ),
      ),
      metadata,
    );
    expect(defaults.document.GetLineNumberInfo().IsPaintLineNumbers()).toBe(true);
    expect(defaults.document.GetLineNumberInfo().GetCountBy()).toBe(5);
    expect(defaults.document.GetLineNumberInfo().GetPosFromLeft()).toBe(65535);

    const repeated = await rewriteStyles(
      bytes,
      /** Makes a subsequent style declaration with missing and malformed properties. @param xml - Styles stream. @returns Rewritten stream. */ (
        xml,
      ) =>
        xml
          .replace('text:increment="5"', 'text:increment="7"')
          .replace(
            "</office:styles>",
            '<text:linenumbering-configuration text:number-lines="yes" text:number-position="above" style:num-format="unrecognized" text:offset="invalid"><text:linenumbering-separator text:increment="2">First</text:linenumbering-separator><text:linenumbering-separator text:increment="invalid">Last</text:linenumbering-separator></text:linenumbering-configuration></office:styles>',
          ),
    );
    const reopened = (await readOdtDocument(repeated, metadata)).document;
    expect(reopened.GetLineNumberInfo().QueryValue()).toMatchObject({
      paintLineNumbers: true,
      position: LineNumberPosition.Left,
      numberingType: ARABIC,
      posFromLeft: 65535,
      countBy: 7,
      dividerCountBy: 2,
      divider: "Last",
    });
    const saved = await (
      await DocumentArchive.open(await writeOdtDocument(reopened, metadata))
    ).readTextEntry("styles.xml");
    expect(saved.match(/<text:linenumbering-configuration\b[^>]*>/u)?.[0]).not.toContain(
      "text:offset",
    );
  });

  it("maps right and inside positions and handles separator context boundaries", /** Checks remaining position and child-context branches. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    for (const [position, label] of [
      [LineNumberPosition.Right, "right"],
      [LineNumberPosition.Inside, "inside"],
    ] as const) {
      const info = writer.GetLineNumberInfo();
      info.SetPos(position);
      writer.SetLineNumberInfo(info);
      const bytes = await writeOdtDocument(writer, metadata);
      expect(await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml")).toContain(
        `text:number-position="${label}"`,
      );
      expect((await readOdtDocument(bytes, metadata)).document.GetLineNumberInfo().GetPos()).toBe(
        position,
      );
    }

    const context = new XMLLineNumberingImportContext(
      new FastAttributeList([]),
      /** Ignores an unused test result. @returns Nothing. */ () => {},
    );
    expect(context.createFastChildContext(XMLToken.TEXT_P, new FastAttributeList([]))).toBeNull();
    expect(
      context.createFastChildContext(
        XMLToken.TEXT_LINENUMBERING_SEPARATOR,
        new FastAttributeList([]),
      ),
    ).not.toBeNull();
    expect(
      exportLineNumberingConfiguration({
        countBlankLines: true,
        countBy: 5,
        countInFlys: false,
        divider: "",
        dividerCountBy: 3,
        paintLineNumbers: false,
        distance: 0,
        numberingType: ARABIC,
        position: "left",
        restartEachPage: false,
      }),
    ).not.toContain("text:offset");
  });
});

it("preserves a forward character style and synchronized numbering type through Writer Worker and ODT", /** Checks that package and Worker reconstruction bind actual style owners. @returns Completion. */ async () => {
  const bytes = await writeOdtDocument(createWriterDocument(), metadata);
  const authored = await rewriteStyles(
    bytes,
    /** Declares a custom style after its settings reference. @param xml - Styles stream. @returns Rewritten stream. */ (
      xml,
    ) =>
      xml
        .replace(
          "text:linenumbering-configuration ",
          'text:linenumbering-configuration text:style-name="Row_20_Label" ',
        )
        .replace(
          'style:num-format="1" text:number-position=',
          'style:num-format="A" style:num-letter-sync="true" text:number-position=',
        )
        .replace(
          "</office:styles>",
          '<style:style style:name="Row_20_Label" style:display-name="Row Label" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style></office:styles>',
        ),
  );
  const source = (await readOdtDocument(authored, metadata)).document;
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
  const saved = await writeOdtDocument(worker, metadata);
  const xml = await (await DocumentArchive.open(saved)).readTextEntry("styles.xml");
  expect(xml).toContain('<text:linenumbering-configuration text:style-name="Row_20_Label"');
  expect(xml).toContain('style:num-format="A" style:num-letter-sync="true" text:number-position=');
  const reopened = (await readOdtDocument(saved, metadata)).document;
  for (const document of [source, worker, reopened]) {
    const info = document.GetLineNumberInfo();
    const style = info.GetCharFormat();
    assert(style);
    expect(style).toBe(document.FindCharFormatByName("Row Label"));
    expect(info.GetNumType().GetNumberingType()).toBe(CHARS_UPPER_LETTER_N);
    document.Dispose();
  }
});

it("preserves the Writer distance clamp and unspecified-distance export sentinel", /** Reads the native maximum through the XML and UNO property owners. @returns Completion. */ async () => {
  const bytes = await writeOdtDocument(createWriterDocument(), metadata);
  const changed = await rewriteStyles(
    bytes,
    /** Replaces the default distance with a value beyond the native field. @param xml - Styles stream. @returns Rewritten styles. */
    (xml) => xml.replace(/text:offset="[^"]+"/u, 'text:offset="200cm"'),
  );
  const document = (await readOdtDocument(changed, metadata)).document;
  try {
    expect(document.GetLineNumberInfo().GetPosFromLeft()).toBe(65535);
    const saved = await (
      await DocumentArchive.open(await writeOdtDocument(document, metadata))
    ).readTextEntry("styles.xml");
    expect(saved.match(/<text:linenumbering-configuration\b[^>]*>/u)?.[0]).not.toContain(
      "text:offset",
    );
  } finally {
    document.Dispose();
  }
});

it("ports the tdf148834 paragraph line-count settings through ODT", /** Reads the pinned regression input and checks original style participation after saving. @returns Completion. */ async () => {
  const input = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf148834_lineNumbering.odt",
    ),
  );
  const source = (await readOdtDocument(input, metadata)).document;
  const reopened = (await readOdtDocument(await writeOdtDocument(source, metadata), metadata))
    .document;
  for (const document of [source, reopened]) {
    const info = document.GetLineNumberInfo();
    expect(info.GetCharFormat()?.GetPoolFormatId()).toBe(SwPoolFormatId.CHR_LINENUM);
    expect(info.GetCountBy()).toBe(1);
    expect(info.GetPosFromLeft()).toBe(288);
    const standard = document.GetDfltTextFormatColl();
    const footer = document.FindTextFormatCollByName("Footer");
    const numbered = document.FindTextFormatCollByName("0 NUMBERED");
    assert(footer && numbered);
    for (const [style, count] of [
      [standard, false],
      [footer, false],
      [numbered, true],
    ] as const)
      expect((style.GetAttrSet().Get(RES_LINENUMBER) as SwFormatLineNumber).IsCount()).toBe(count);
    document.Dispose();
  }
});

it("keeps the tdf134548 style restart and separate automatic paragraph restarts through Worker and ODT", /** Preserves original named and direct formatting with the native paragraph item. @returns Completion. */ async () => {
  const bytes = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/layout/data/tdf134548.odt"),
  );
  const archive = await DocumentArchive.open(bytes);
  const ordered = new DocumentArchiveWriter();
  ordered.putNextEntry("mimetype", await archive.readEntry("mimetype"));
  for (const name of archive.getEntryNames())
    if (name !== "mimetype" && !name.endsWith("/"))
      ordered.putNextEntry(name, await archive.readEntry(name));
  const source = (await readOdtDocument(await ordered.finish(), metadata)).document;
  let worker: ReturnType<typeof decodeWriterDocument> | undefined;
  let reopened: typeof worker;
  try {
    const first = source.paragraphs[0];
    const second = source.paragraphs[1];
    const parent = source.FindTextFormatCollByName("LibOComputerCode ZeilenNr");
    assert(first && second && parent);
    source.MakeTextFormatColl("Inherited restart", parent);
    first.SetAttr(new SwFormatLineNumber(true, 14));
    second.SetAttr(new SwFormatLineNumber(true, 61));
    const legacy = decodeSfxPoolItem(source.GetAttrPool(), { which: RES_LINENUMBER, value: false });
    assert(legacy instanceof SwFormatLineNumber);
    expect(legacy.IsCount()).toBe(false);
    expect(legacy.GetStartValue()).toBe(0);

    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const saved = await writeOdtDocument(worker, metadata);
    const content = await (await DocumentArchive.open(saved)).readTextEntry("content.xml");
    expect(content).toContain('text:number-lines="true" text:line-number="14"');
    expect(content).toContain('text:number-lines="true" text:line-number="61"');
    reopened = (await readOdtDocument(saved, metadata)).document;
    for (const doc of [source, worker, reopened]) {
      const named = doc.FindTextFormatCollByName("LibOComputerCode ZeilenNr");
      assert(named);
      expect(named.GetAttrSet().GetLineNumber().GetStartValue()).toBe(1);
      const inherited = doc.FindTextFormatCollByName("Inherited restart");
      expect(inherited?.GetAttrSet().GetLineNumber().GetStartValue()).toBe(1);
      expect(inherited?.GetAttrSet().GetItemIfSet(RES_LINENUMBER, false)).toBeUndefined();
      expect(doc.paragraphs[0]?.GetSwAttrSet().GetLineNumber().GetStartValue()).toBe(14);
      expect(doc.paragraphs[1]?.GetSwAttrSet().GetLineNumber().GetStartValue()).toBe(61);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("imports native narrowed intervals and reexports applied values instead of original lexemes", /** Real package/model/filter owners retain defaults and zero separator values. @returns Completion. */ async () => {
  const original = createWriterDocument();
  const bytes = await writeOdtDocument(original, metadata);
  for (const [raw, count, divider] of [
    ["32768", 5, 3],
    ["65537", 1, 1],
    ["-1", 5, 0],
    ["invalid", 5, 3],
    ["0", 5, 0],
  ] as const) {
    const changed = await rewriteStyles(
      bytes,
      /** Authors interval values into actual ODT settings. @param xml - Styles. @returns Rewritten styles. */ (
        xml,
      ) =>
        xml
          .replace('text:increment="5"', `text:increment="${raw}"`)
          .replace(
            "</text:linenumbering-configuration>",
            `<text:linenumbering-separator text:increment="${raw}">*</text:linenumbering-separator></text:linenumbering-configuration>`,
          ),
    );
    const reopened = await readOdtDocument(changed, metadata);
    expect(reopened.document.GetLineNumberInfo().QueryValue()).toMatchObject({
      countBy: count,
      dividerCountBy: divider,
    });
    const saved = await (
      await DocumentArchive.open(await writeOdtDocument(reopened.document, metadata))
    ).readTextEntry("styles.xml");
    expect(saved).toContain(`text:increment="${count}"`);
    expect(saved).toContain(
      `<text:linenumbering-separator text:increment="${divider}">*</text:linenumbering-separator>`,
    );
  }
});

it("exports the original signed16 interval properties from unsigned native core fields", /** Rare direct-core values preserve the same export/property narrowing as upstream. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    info = doc.GetLineNumberInfo();
  info.SetCountBy(65535);
  info.SetDividerCountBy(32768);
  info.SetDivider("*");
  doc.SetLineNumberInfo(info);
  const bytes = await writeOdtDocument(doc, metadata),
    xml = await (await DocumentArchive.open(bytes)).readTextEntry("styles.xml");
  expect(xml).toContain('text:increment="-1"');
  expect(xml).toContain(
    '<text:linenumbering-separator text:increment="-32768">*</text:linenumbering-separator>',
  );
  const reopened = await readOdtDocument(bytes, metadata);
  expect(reopened.document.GetLineNumberInfo().QueryValue()).toMatchObject({
    countBy: 5,
    dividerCountBy: 0,
  });
});
