/** @fileoverview Real Writer export context, font metadata fragment routing and committed OOXML ZIP relationships. No text-graph traversal or whole-DOCX readiness is inferred from this part test. */
import { readOwnedXml } from "../../../../test/oox-input";
import { expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { FragmentHandler } from "../../../../oox/source/core/fragmenthandler";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily as F, FontPitch as P } from "../../../../tools/inc/fontenum";
import { wwFont } from "./wrtw8sty";
/** Actual graph/filter/exporter setup with genuine retained range owners. @param docm - Native macro flag. @param template - Native template flag. @returns Actual owners. */
function setup(docm = false, template = false) {
  const doc = new SwDoc(),
    point = new SwPosition(doc.GetNodes().GetEndOfContent()),
    range = new SwPaM(point),
    filter = new XmlFilterBase(new ZipStorage());
  return {
    doc,
    point,
    range,
    filter,
    exporter: new DocxExport(filter, doc, range, range, docm, template),
  };
}
/** Close native document owner and release consumed ranges. @param owners - Actual owners. @returns Committed ZIP bytes. */
function finish(owners: ReturnType<typeof setup>): Uint8Array {
  owners.exporter.dispose();
  owners.range.Dispose();
  owners.point.Dispose();
  owners.doc.Dispose();
  return owners.filter.commitStorage();
}
/** Read an actual committed ZIP fragment. @param storage - Reopened storage. @param path - Part. @returns Decoded XML. */
async function xml(storage: ZipStorage, path: string): Promise<string> {
  const bytes = await storage.openInputStream(path);
  expect(bytes.is()).toBe(true);
  return readOwnedXml(bytes) as string;
}
it("connects actual exporter, shared font registration, collected rFonts and fontTable routing", /** Native part contract is tested through real ZIP commit/reopen. @returns Completion. */ async () => {
  const o = setup(),
    a = o.exporter.DocxAttrOutput(),
    serializer = a.GetSerializer(),
    w = token("w");
  expect(a.GetExport()).toBe(o.exporter);
  expect(o.exporter.GetFilter()).toBe(o.filter);
  expect(o.exporter.AttrOutput()).toBe(a);
  const baseline = o.doc.GetNodes().entries().slice();
  serializer.startElementNS(w, token("document"), o.exporter.MainXmlNamespaces());
  serializer.startElementNS(w, token("body"));
  a.StartRun(null, 0);
  a.StartRunProperties();
  a.CharFontCJK(new SvxFontItem(0));
  const first = new SvxFontItem(
      F.FAMILY_SWISS,
      "Liberation Sans;Fallback",
      "",
      P.PITCH_VARIABLE,
      1,
      7,
    ),
    second = new SvxFontItem(F.FAMILY_ROMAN, "Different", "", P.PITCH_FIXED, 10, 7);
  expect(o.exporter.GetId(first)).toBe(0);
  a.CharFont(first);
  a.CharFont(second);
  a.CharFont(new SvxFontItem(7));
  a.EndRunProperties();
  a.RawText("Ω", 76);
  a.EndRun(null, 0, 1);
  serializer.endElementNS(w, token("body"));
  serializer.endElementNS(w, token("document"));
  o.exporter.WriteFonts();
  expect(a.GetSerializer()).toBe(serializer);
  expect(o.doc.GetNodes().entries()).toEqual(baseline);
  const storage = new ZipStorage(finish(o)),
    main = await xml(storage, "word/document.xml"),
    fonts = await xml(storage, "word/fontTable.xml"),
    rels = await xml(storage, "word/_rels/document.xml.rels"),
    types = await xml(storage, "[Content_Types].xml");
  const reader = new XmlFilterBase(storage);
  expect(await reader.importFragment(new FragmentHandler(reader, "word/document.xml"))).toBe(true);
  expect(await reader.importFragment(new FragmentHandler(reader, "word/fontTable.xml"))).toBe(true);
  expect(
    (await reader.importRelations("word/document.xml")).getFragmentPathFromFirstType(
      getRelationship(Relationship.FONTTABLE),
    ),
  ).toBe("word/fontTable.xml");
  expect(main).toContain(
    '<w:rFonts w:eastAsia="" w:ascii="Liberation Sans;Fallback" w:hAnsi="Liberation Sans;Fallback"/>',
  );
  expect(main).toContain("<w:t>Ω</w:t>");
  expect(main).not.toContain("Different");
  expect(fonts).toContain(
    '<w:font w:name="Liberation Sans"><w:altName w:val="Arial"/><w:charset w:val="00"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font>',
  );
  expect(fonts).toContain(
    '<w:font w:name="Different"><w:charset w:val="02"/><w:family w:val="roman"/><w:pitch w:val="fixed"/></w:font>',
  );
  expect(fonts.match(/<w:font /g)).toHaveLength(2);
  expect(fonts.indexOf('w:name="Liberation Sans"')).toBeLessThan(
    fonts.indexOf('w:name="Different"'),
  );
  expect(rels).toContain(getRelationship(Relationship.FONTTABLE));
  expect(rels).toContain('Target="fontTable.xml"');
  expect(await xml(storage, "_rels/.rels")).toContain(getRelationship(Relationship.OFFICEDOCUMENT));
  expect(types).toContain(
    "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
  );
});
it("emits all native font family/pitch/charset metadata and omits empty registered names", /** Full metadata switches retain source output values. @returns Completion. */ async () => {
  const o = setup();
  for (const [index, family] of [
    F.FAMILY_DONTKNOW,
    F.FAMILY_DECORATIVE,
    F.FAMILY_MODERN,
    F.FAMILY_SCRIPT,
  ].entries())
    o.exporter.GetId(new wwFont("font" + index, P.PITCH_DONTKNOW, family, 34));
  o.exporter.GetId(new wwFont("", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0));
  o.exporter.WriteFonts();
  const fonts = await xml(new ZipStorage(finish(o)), "word/fontTable.xml");
  for (const family of ["auto", "decorative", "modern", "script"])
    expect(fonts).toContain(`<w:family w:val="${family}"/>`);
  expect(fonts).toContain('<w:pitch w:val="default"/>');
  expect(fonts).not.toContain('w:name=""');
});
it("retains all four native document media-type branches and missing namespace/relationship fallbacks", /** Native constants are used without a private export token catalog. @returns Completion. */ async () => {
  for (const [docm, template, type] of [
    [
      false,
      false,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    ],
    [
      false,
      true,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml",
    ],
    [true, false, "application/vnd.ms-word.document.macroEnabled.main+xml"],
    [true, true, "application/vnd.ms-word.template.macroEnabledTemplate.main+xml"],
  ] as const) {
    const o = setup(docm, template);
    expect(await xml(new ZipStorage(finish(o)), "[Content_Types].xml")).toContain(type);
  }
  expect(new XmlFilterBase(new ZipStorage()).getNamespaceURL(-1)).toBe("");
  expect(getRelationship(Relationship.NUM_ENTRIES)).toBe("");
  for (let value = 0; value < Relationship.NUM_ENTRIES; ++value)
    expect(getRelationship(value)).toMatch(/^http:\/\/schemas\./);
});
