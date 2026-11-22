/** @fileoverview Native LibreOffice paragraph hyphenation properties through the Writer ODT and Worker paths. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxHyphenZoneItem } from "../../../../editeng/inc/hyphenzoneitem";
import {
  MID_HYPHEN_MAX_HYPHENS,
  MID_HYPHEN_MIN_LEAD,
  MID_HYPHEN_ZONE_PAGE,
} from "../../../../editeng/inc/memberids";
import { ALWAYS, COLUMN } from "../../../../offapi/com/sun/star/text/ParagraphHyphenationKeepType";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { RES_PARATR_HYPHENZONE } from "../../../inc/hintids";
import { getWriterStyleIdFromOdfName } from "../../../inc/poolfmt";
import { GetDfltAttr } from "../../core/attr/hints";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const metadata = createDocument({ id: "hyphenation", suiteId: "writer", title: "Hyphenation" });
const fixturePath = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data";

it("preserves the Standard style's no-caps setting from tdf121658.odt", /** Ports the original named paragraph-style property assertion. @returns Completion. */ async () => {
  const bytes = new Uint8Array(readFileSync(`${fixturePath}/tdf121658.odt`));
  const source = (await readOdtDocument(bytes, metadata)).document;
  let reopened: typeof source | undefined;
  try {
    reopened = (await readOdtDocument(await writeOdtDocument(source, metadata), metadata)).document;
    const style = getWriterStyleIdFromOdfName("Standard");
    assert(style);
    for (const candidate of [source, reopened]) {
      const item = candidate.GetTextFormatColl(style).GetAttrSet().Get(RES_PARATR_HYPHENZONE);
      assert(item instanceof SvxHyphenZoneItem);
      expect(item.QueryValue().noCaps).toBe(true);
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

/** Reads effective native paragraph attributes. @param node - Source paragraph. @returns Complete hyphenation state. */
function readHyphenation(node: SwTextNode) {
  const item = node.GetAttr(RES_PARATR_HYPHENZONE);
  assert(item instanceof SvxHyphenZoneItem);
  return item.QueryValue();
}

it("keeps the standalone and Writer defaults distinct and narrows native UNO members", /** Exercises the two pool defaults and original unsigned storage. @returns Nothing. */ () => {
  const item = SvxHyphenZoneItem.CreateDefault();
  const writer = GetDfltAttr(RES_PARATR_HYPHENZONE);
  assert(writer instanceof SvxHyphenZoneItem);
  expect(item.QueryValue().maxHyphens).toBe(255);
  expect(writer.QueryValue()).toMatchObject({ maxHyphens: 0, keepType: COLUMN });
  const any = new Any([300], "sal_Int16");
  try {
    expect(item.PutValue(any, MID_HYPHEN_MIN_LEAD)).toBe(true);
    any.insert([-5], "sal_Int16");
    expect(item.PutValue(any, MID_HYPHEN_ZONE_PAGE)).toBe(true);
    expect(item.QueryValue()).toMatchObject({ minLead: 44, pageEndZone: 65531 });
    item.QueryValue(any, MID_HYPHEN_ZONE_PAGE);
    const number: [number] = [0];
    expect(any.extract(number, "sal_Int16")).toBe(true);
    expect(number[0]).toBe(-5);
    expect(item.PutValue(any, MID_HYPHEN_MAX_HYPHENS)).toBe(true);
    expect(item.QueryValue().maxHyphens).toBe(251);
    expect(item.Clone().equals(item)).toBe(true);
  } finally {
    any.dispose();
    item.Dispose();
  }
});

it.each([
  ["tdf149248.odt", "noLastWord", false, true],
  ["tdf149324.odt", "minWordLength", 0, 7],
  ["tdf149420.odt", "zone", 0, 567],
] as const)(
  "replays paragraph hyphenation properties in %s",
  /** Ports the source paragraph assertions before and after saving. @param fixture - Pinned ODT. @param property - Stored member. @param initial - Second paragraph value. @param changed - Fourth paragraph value. @returns Completion. */ async (
    fixture,
    property,
    initial,
    changed,
  ) => {
    const source = (
      await readOdtDocument(new Uint8Array(readFileSync(`${fixturePath}/${fixture}`)), metadata)
    ).document;
    let reopened: typeof source | undefined;
    try {
      reopened = (await readOdtDocument(await writeOdtDocument(source, metadata), metadata))
        .document;
      for (const candidate of [source, reopened]) {
        expect(readHyphenation(candidate.paragraphs[1] as SwTextNode)[property]).toBe(initial);
        expect(readHyphenation(candidate.paragraphs[3] as SwTextNode)[property]).toBe(changed);
      }
    } finally {
      reopened?.Dispose();
      source.Dispose();
    }
  },
);

it("keeps direct, named and document-default hyphenation through the Worker", /** Checks both ODF property groups and complete state through the actual document graph. @returns Completion. */ async () => {
  const namespaces = `xmlns:office="${NS.office}" xmlns:style="${NS.style}" xmlns:text="${NS.text}" xmlns:fo="${NS.fo}" xmlns:loext="${NS.loext}"`;
  const styles = `<office:document-styles ${namespaces}><office:styles>
    <style:default-style style:family="paragraph"><style:text-properties loext:hyphenation-no-caps="true"/></style:default-style>
    <style:style style:name="Named" style:family="paragraph"><style:text-properties fo:hyphenate="true" fo:hyphenation-remain-char-count="3" loext:hyphenation-zone="567"/></style:style>
  </office:styles></office:document-styles>`;
  const content = `<office:document-content ${namespaces}><office:automatic-styles>
    <style:style style:name="Auto" style:family="paragraph" style:parent-style-name="Named">
      <style:paragraph-properties fo:hyphenation-keep="page" loext:hyphenation-keep-type="always" loext:hyphenation-keep-line="true" fo:hyphenation-ladder-count="5"/>
      <style:text-properties loext:hyphenation-word-char-count="7" loext:hyphenation-zone-spread="250" loext:hyphenation-compound-push-char-count="4"/>
    </style:style>
  </office:automatic-styles><office:body><office:text><text:p text:style-name="Named">one</text:p><text:p text:style-name="Auto">two</text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, content, metadata);
  let worker: typeof document | undefined;
  let reopened: typeof document | undefined;
  try {
    worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
    const bytes = await writeOdtDocument(worker, metadata);
    const archive = await DocumentArchive.open(bytes);
    const xml = await archive.readTextEntry("content.xml");
    expect(xml).toContain('loext:hyphenation-keep-type="always"');
    expect(xml).toContain('fo:hyphenation-keep="page"');
    expect(xml).toContain('loext:hyphenation-zone-spread="250"');
    const styleXml = await archive.readTextEntry("styles.xml");
    expect(styleXml).toMatch(/<style:default-style[^>]*>.*loext:hyphenation-no-caps="true"/u);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const candidate of [document, worker, reopened]) {
      expect(readHyphenation(candidate.paragraphs[0] as SwTextNode)).toMatchObject({
        hyphen: true,
        minLead: 3,
        zone: 567,
        noCaps: true,
      });
      expect(readHyphenation(candidate.paragraphs[1] as SwTextNode)).toMatchObject({
        hyphen: true,
        minLead: 3,
        zone: 567,
        noCaps: true,
        keep: true,
        keepType: ALWAYS,
        keepLine: true,
        maxHyphens: 5,
        minWordLength: 7,
        spreadEndZone: 250,
        compoundMinTrail: 4,
      });
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
