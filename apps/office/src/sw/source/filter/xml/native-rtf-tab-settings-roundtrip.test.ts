/** @fileoverview Real native RTF compatibility settings through browser XML and packed ODT reopen. */
import { assert, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfExport } from "../ww8/rtfexport";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const metadata = { title: "Native RTF tabs" };

it("reopens absolute RTF tab positions and list indentation compatibility", /** Exercises the real packed and unpacked settings streams and native RTF re-export. @returns Completion. */ async () => {
  const rtf = String.raw`{\rtf1\ansi\li720\tx1440 X\tab Y}`;
  const source = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
  try {
    const storage = writeOdtXml(source, metadata);
    const settings = storage.files["settings.xml"];
    assert(typeof settings === "string");
    expect(settings).toContain('config:name="TabsRelativeToIndent" config:type="boolean">false');
    expect(settings).toContain(
      'config:name="TabAtLeftIndentForParagraphsInList" config:type="boolean">true',
    );
    for (const bytes of [storage, writeOdtDocument(source, metadata)]) {
      const { document } = await readOdtDocument(bytes, metadata);
      try {
        expect(document.GetDocumentSettingManager().GetValues()).toMatchObject({
          TABS_RELATIVE_TO_INDENT: false,
          TAB_AT_LEFT_INDENT_FOR_PARA_IN_LIST: true,
          IGNORE_TABS_AND_BLANKS_FOR_LINE_CALCULATION: true,
        });
        const output = new TextDecoder().decode(RtfExport.WriteDocument(document));
        expect(output).toContain("\\tx1440");
        expect(output).not.toContain("\\tx2160");
      } finally {
        document.Dispose();
      }
    }
  } finally {
    source.Dispose();
  }
});

it("uses the original config namespace and boolean token while keeping older ODT defaults", /** Checks alternate prefixes, wrong namespaces, boolean token rules and the missing settings stream. @returns Completion. */ async () => {
  const source = createWriterDocument();
  try {
    const storage = writeOdtXml(source, metadata);
    const settings = storage.files["settings.xml"];
    assert(typeof settings === "string");
    const { "settings.xml": removed, ...older } = storage.files;
    expect(removed).toBe(settings);
    const qualified = settings
      .replace("xmlns:ooo=", "xmlns:legacy=")
      .replace("ooo:configuration-settings", "legacy:configuration-settings")
      .replace(
        'config:name="TabsRelativeToIndent" config:type="boolean">true',
        'config:name="TabsRelativeToIndent" config:type="boolean">1',
      );
    const foreign = qualified.replace("http://openoffice.org/2004/office", "urn:example:foreign");
    for (const [files, relative] of [
      [older, true],
      [{ ...storage.files, "settings.xml": qualified }, false],
      [{ ...storage.files, "settings.xml": foreign }, true],
    ] as const) {
      const { document } = await readOdtDocument({ format: "xml", files }, metadata);
      try {
        expect(document.GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")).toBe(relative);
      } finally {
        document.Dispose();
      }
    }
  } finally {
    source.Dispose();
  }
});
