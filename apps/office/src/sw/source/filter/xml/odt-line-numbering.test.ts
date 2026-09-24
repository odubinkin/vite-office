/** @fileoverview Verifies document-owned Writer line numbering across ODF styles. */

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { LineNumberPosition } from "../../../inc/lineinfo";
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
  const archive = new ZipFile(bytes);
  const output = new ZipOutputStream();
  for (const name of archive.getEntryNames())
    output.putNextEntry(
      name,
      name === "styles.xml"
        ? new TextEncoder().encode(transform(await archive.readTextEntry(name)))
        : await archive.readEntry(name),
    );
  return output.finish();
}

describe("Writer ODF line numbering", /** Groups global configuration cases. @returns Nothing. */ () => {
  it("preserves pinned defaults and a complete explicit configuration", /** Checks supported settings round trip. @returns Completion after import. */ async () => {
    const writer = createWriterDocument();
    const bytes = writeOdtDocument(writer, metadata);
    const styles = await new ZipFile(bytes).readTextEntry("styles.xml");
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
    const explicitBytes = writeOdtDocument(writer, metadata);
    const explicitStyles = await new ZipFile(explicitBytes).readTextEntry("styles.xml");
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

  it("reads omission defaults and rejects malformed or duplicate settings", /** Checks defaults and malformed input. @returns Completion after import. */ async () => {
    const bytes = writeOdtDocument(createWriterDocument(), metadata);
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

    for (const [from, to, error] of [
      ['text:number-lines="false"', 'text:number-lines="yes"', "boolean"],
      ['text:increment="5"', 'text:increment="-1"', "increment"],
      ['text:number-position="left"', 'text:number-position="above"', "position"],
      ['style:num-format="1"', 'style:num-format="A"', "format"],
    ] as const) {
      const changed = await rewriteStyles(
        bytes,
        /** Corrupts one line-number attribute. @param xml - Styles stream. @returns Rewritten stream. */ (
          xml,
        ) => xml.replace(from, to),
      );
      await expect(readOdtDocument(changed, metadata)).rejects.toThrow(error);
    }

    const duplicate = await rewriteStyles(
      bytes,
      /** Duplicates the global configuration. @param xml - Styles stream. @returns Rewritten stream. */ (
        xml,
      ) => xml.replace("</office:styles>", "<text:linenumbering-configuration/></office:styles>"),
    );
    await expect(readOdtDocument(duplicate, metadata)).rejects.toThrow(
      "Duplicate ODF line numbering",
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
      const bytes = writeOdtDocument(writer, metadata);
      expect(await new ZipFile(bytes).readTextEntry("styles.xml")).toContain(
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
      /** Attempts duplicate separator insertion. @returns Child context. */ () =>
        context.createFastChildContext(
          XMLToken.TEXT_LINENUMBERING_SEPARATOR,
          new FastAttributeList([]),
        ),
    ).toThrow("Duplicate ODF line-number separator");
    expect(
      exportLineNumberingConfiguration({
        countBlankLines: true,
        countBy: 5,
        countInFlys: false,
        divider: "",
        dividerCountBy: 3,
        paintLineNumbers: false,
        posFromLeft: 0,
        position: "left",
        restartEachPage: false,
      }),
    ).not.toContain("text:offset");
  });
});
