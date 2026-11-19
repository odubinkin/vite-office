/** @fileoverview Real XclExpXmlStream part routing, parent relationships, serializer stack and export-string XML output. */
import { expect, it } from "vitest";
import { XclExpXmlStream } from "../inc/xestream";
import { XclExpString } from "../inc/xestring";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { XclStrFlags } from "../inc/xlstring";
import { ZipStorage, type ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { unicode, text as nativeText } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { readOwnedXml } from "../../../../test/oox-input";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
/** Original terminated ASCII literal. @param value - MIME. @returns Pointer binding. */
function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value + "\0");
}
/** Calls original part creation with actual native arguments. @param owner - XML owner. @param path - Full path. @param target - Relationship target. @param parent - Actual parent output. @param id - Optional native output. @returns Actual helper. */
function part(
  owner: XclExpXmlStream,
  path: string,
  target = path,
  parent: ZipFragmentStream | null = null,
  id: OUString | null = null,
) {
  const full = unicode(path),
    relative = unicode(target),
    relation = unicode(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
    );
  try {
    return owner.CreateOutputStream(full, relative, parent, ascii("application/xml"), relation, id);
  } finally {
    relation.dispose();
    relative.dispose();
    full.dispose();
  }
}

it("retains constructor flags, original preincrement and sticky dynamic-array observation", /** No private counters are injected. @returns Nothing. */ () => {
  const owner = new XclExpXmlStream(new ZipStorage(), false, true),
    vba = new XclExpXmlStream(new ZipStorage(), true, false);
  expect(owner.IsExportVBA()).toBe(false);
  expect(vba.IsExportVBA()).toBe(true);
  expect(owner.importDocument()).toBe(false);
  expect(owner.HasDynamicArrayFormula()).toBe(false);
  owner.NoteDynamicArrayFormula();
  owner.NoteDynamicArrayFormula();
  expect(owner.HasDynamicArrayFormula()).toBe(true);
  expect(owner.getAndIncrementDiagramId()).toBe(1);
  expect(owner.getAndIncrementDiagramId()).toBe(2);
  owner.WriteAttributes(token("name"), null);
});

it("preserves exact path identity and explicit nested stream stack, without implicit pushing or closing", /** The real helpers remain usable after PopStream. @returns Completion. */ async () => {
  const owner = new XclExpXmlStream(new ZipStorage(), false, false),
    root = part(owner, "xl/workbook.xml"),
    path = unicode("xl/字.xml"),
    missing = unicode("xl/字.XML");
  try {
    expect(owner.GetStreamForPath(path)).toBeNull();
    owner.PushStream(root);
    const child = part(owner, "xl/字.xml", "字.xml", root.getOutputStream() as ZipFragmentStream);
    expect(owner.GetCurrentStream()).toBe(root);
    expect(owner.GetStreamForPath(path)).toBe(child);
    expect(owner.GetStreamForPath(missing)).toBeNull();
    owner.PushStream(child);
    expect(owner.GetCurrentStream()).toBe(child);
    owner.PopStream();
    expect(owner.GetCurrentStream()).toBe(root);
    child.write("<child/>");
    child.endDocument();
    root.write("<root/>");
    root.endDocument();
    owner.PopStream();
    const archive = await DocumentArchive.open(await owner.commitStorage());
    expect(await archive.readTextEntry("xl/字.xml")).toContain("<child/>");
    expect(await archive.readTextEntry("xl/workbook.xml")).toContain("<root/>");
    expect(await archive.readTextEntry("xl/_rels/workbook.xml.rels")).toContain('Target="字.xml"');
  } finally {
    path.dispose();
    missing.dispose();
  }
});

it("preserves relation ID assignment before open failure and last path-map replacement", /** Real path admission throws rather than a fabricated provider. @returns Completion. */ async () => {
  const owner = new XclExpXmlStream(new ZipStorage(), false, false),
    id = new OUString(),
    path = unicode("xl/part.xml");
  try {
    expect(
      /** Calls actual archive path admission. @returns Nothing. */ () =>
        part(owner, "../invalid.xml", "invalid.xml", null, id),
    ).toThrow();
    expect(nativeText(id)).toBe("rId1");
    const first = part(owner, "xl/part.xml", "part.xml", null, id),
      second = part(owner, "xl/part.xml", "part2.xml", null, id);
    expect(nativeText(id)).toBe("rId3");
    expect(owner.GetStreamForPath(path)).toBe(second);
    expect(second).not.toBe(first);
    first.write("<first/>");
    first.endDocument();
    second.write("<second/>");
    second.endDocument();
    const archive = await DocumentArchive.open(await owner.commitStorage());
    expect(await archive.readTextEntry("xl/part.xml")).toContain("<second/>");
  } finally {
    id.dispose();
    path.dispose();
  }
});

it("writes original raw attribute syntax with native Unicode, counted UTF8 and omitted null pointers", /** Uses actual serializer escaping and native SAL conversion. @returns Completion. */ async () => {
  const owner = new XclExpXmlStream(new ZipStorage(), false, false),
    output = part(owner, "xl/attributes.xml"),
    native = unicode('字&"');
  owner.PushStream(output);
  try {
    output.write("<c");
    owner.WriteAttributes(
      token("name"),
      native,
      token("r"),
      "A1",
      token("t"),
      new TextEncoder().encode("é\0"),
      token("s"),
      null,
    );
    output.write("/>");
    output.endDocument();
  } finally {
    native.dispose();
    owner.PopStream();
  }
  const archive = await DocumentArchive.open(await owner.commitStorage()),
    xml = await archive.readTextEntry("xl/attributes.xml");
  expect(xml).toContain('<c name="字&amp;&quot;" r="A1" t="é_x0000_"/>');
});

it("emits the actual export string through its original plain-text XML method", /** Tests empty, Unicode/control text, SeparateFormats and original byte-mode behavior without supplying fake font/root owners. @returns Completion. */ async () => {
  const owner = new XclExpXmlStream(new ZipStorage(), false, false),
    output = part(owner, "xl/sharedStrings.xml"),
    text = unicode(" A\0<&字😀\n"),
    byteText = unicode("bytes"),
    richText = unicode("rich");
  owner.PushStream(output);
  try {
    output.startElement(
      token("sst"),
      token("xmlns"),
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    );
    const separate = new XclExpString(text, XclStrFlags.SeparateFormats);
    separate.AppendFormat(0, 1);
    for (const value of [new XclExpString(), new XclExpString(text), separate]) {
      output.startElement(token("si"));
      value.WriteXml(owner);
      output.endElement(token("si"));
    }
    const byte = new XclExpString();
    byte.AssignByte(byteText, RTL_TEXTENCODING_UTF8);
    output.startElement(token("si"));
    byte.WriteXml(owner);
    output.endElement(token("si"));
    const rich = new XclExpString(richText);
    rich.AppendFormat(0, 1);
    expect(
      /** Leaves all rich-font output unqualified. @returns Nothing. */ () => rich.WriteXml(owner),
    ).toThrow("XclExpRoot/font-rich");
    output.endElement(token("sst"));
    output.endDocument();
  } finally {
    text.dispose();
    byteText.dispose();
    richText.dispose();
    owner.PopStream();
  }
  const archive = await ZipStorage.open(await owner.commitStorage()),
    input = await archive.openInputStream("xl/sharedStrings.xml"),
    xml = readOwnedXml(input);
  expect(xml).toContain('<si><t xml:space="preserve"></t></si>');
  expect(xml).toContain(" A_x0000_&lt;&amp;字😀&#10;");
  expect(xml?.match(/<si>/g)).toHaveLength(4);
});
