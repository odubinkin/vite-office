/** @fileoverview Exercises native annotations through Writer's ODT import. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { CH_FEATURE } from "../../../../editeng/inc/editattr";
import type { EECharAttrib } from "../../../../editeng/inc/editdata";
import { TextRotation } from "../../../../editeng/inc/editobj";
import {
  EE_CHAR_BKGCOLOR,
  EE_CHAR_COLOR,
  EE_CHAR_UNDERLINE,
  EE_CHAR_WEIGHT,
  EE_FEATURE_LINEBR,
  EE_FEATURE_TAB,
  EE_PARA_JUST,
  EE_PARA_OUTLLEVEL,
  EE_PARA_ULSPACE,
} from "../../../../editeng/inc/eeitem";
import { EditTextObjectImpl } from "../../../../editeng/source/editeng/editobj.owner";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { SfxVoidItem } from "../../../../svl/source/items/voiditem";
import { Color } from "../../../../tools/inc/color";
import { FontLineStyle, FontWeight } from "../../../../tools/inc/fontenum";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { isAnnotationTextField, type SwTextField } from "../../../inc/txtfld";
import { SwPostItFieldType } from "../../core/fields/docufld";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";

it("imports the named annotation and range from the upstream backward-search document", /** Reads the LibreOffice QA sample through the ordinary Writer importer. @returns Completion. */ async () => {
  const sample =
    "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf147583_backwardSearch.odt";
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(sample)),
    { title: "ODT annotations" },
    undefined,
    { onDiagnostic: /** Omits unrelated diagnostics. @returns Nothing. */ () => undefined },
  );
  const fields: SwTextField[] = [];
  for (const node of document.GetNodes().entries()) {
    const hints = node.GetTextNode()?.GetpSwpHints();
    for (let index = 0; hints && index < hints.Count(); index++) {
      const hint = hints.Get(index);
      if (isAnnotationTextField(hint)) fields.push(hint);
    }
  }
  expect(fields).toHaveLength(1);
  const [field] = fields;
  if (!field) throw new Error("Fixture annotation is missing.");
  expect(field.GetAttr().GetField().GetData()).toMatchObject({
    author: "Unknown Author",
    name: "__Annotation__75_3386804513",
    resolved: false,
    text: "Comments are also checked\n\nFor empty paragraphs",
  });
  const mark = document.GetIDocumentMarkAccess().GetAnnotationMark(field.GetAttr());
  expect(mark).toBeDefined();
  expect(mark?.GetMarkEnd().GetNode()).toBe(field.GetTextNode());
  expect(mark?.GetMarkEnd().GetContentIndex()).toBe(field.GetStart() + 1);

  const transfer = createOdtWriterTransfer(document);
  expect(transfer.graph.annotations).toHaveLength(1);
  const restored = restoreOdtWriterTransfer(structuredClone(transfer));
  expect(createOdtWriterTransfer(restored).graph.annotations).toEqual(transfer.graph.annotations);
  const bytes = await writeOdtDocument(restored, { title: "ODT annotations" });
  const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
  expect(xml).toContain('<office:annotation office:name="__Annotation__75_3386804513"');
  expect(xml).toContain('<office:annotation-end office:name="__Annotation__75_3386804513"/>');
  expect(xml).not.toContain("\ufff9");
  const reloaded = await readOdtDocument(bytes, { title: "ODT annotations" });
  const before = transfer.graph.annotations?.[0];
  const after = createOdtWriterTransfer(reloaded.document).graph.annotations?.[0];
  expect(after).toEqual({ ...before, id: after?.id });
});

it("transports native annotation editor text through the ODT Worker record", /** Verifies format and feature ownership across structured clone. @returns Completion. */ async () => {
  const sample =
    "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf147583_backwardSearch.odt";
  const { document } = await readOdtDocument(
    new Uint8Array(readFileSync(sample)),
    { title: "Rich comments" },
    undefined,
    { onDiagnostic: /** Omits unrelated diagnostics. @returns Nothing. */ () => undefined },
  );
  const record = createOdtWriterTransfer(document).graph.annotations?.[0];
  if (!record) throw new Error("Fixture annotation is missing.");
  const type = SwPostItFieldType.Get(document);
  const field = type.FindField(record.id);
  if (!field) throw new Error("Fixture field is missing.");
  const rich = new EditTextObjectImpl(
    null,
    MapUnit.MapTwip,
    false,
    TextRotation.NONE,
    SvtScriptType.LATIN,
  );
  const paragraph = rich.CreateAndInsertContent();
  const feature = String.fromCharCode(CH_FEATURE);
  const value = unicode(`A😀${feature}B${feature}C`);
  const style = unicode("Comment");
  const empty = unicode("");
  try {
    paragraph.SetText(value);
    paragraph.SetStyle(style);
    paragraph.SetFamily(SfxStyleFamily.Para);
    paragraph.GetParaAttribs().Put(new SvxAdjustItem(SvxAdjust.Center, EE_PARA_JUST), true);
    const spacing = new SvxULSpaceItem(EE_PARA_ULSPACE);
    spacing.SetUpper(160);
    spacing.SetLower(120);
    spacing.SetContextValue(true);
    paragraph.GetParaAttribs().Put(spacing, true);
    const underline = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, EE_CHAR_UNDERLINE);
    underline.SetColor(new Color(221, 0, 73));
    paragraph
      .GetCharAttribs()
      .push(
        rich.CreateAttrib(new SvxColorItem(new Color(40, 90, 200), EE_CHAR_COLOR), 0, 3),
        rich.CreateAttrib(new SvxWeightItem(FontWeight.WEIGHT_BOLD, EE_CHAR_WEIGHT), 1, 3),
        rich.CreateAttrib(underline, 1, 3),
        rich.CreateAttrib(new SvxColorItem(new Color(255, 223, 97), EE_CHAR_BKGCOLOR), 1, 3),
        rich.CreateAttrib(new SfxVoidItem(EE_FEATURE_TAB), 3, 4),
        rich.CreateAttrib(new SfxVoidItem(EE_FEATURE_LINEBR), 5, 6),
      );
    rich.CreateAndInsertContent().SetText(empty);
    field.SetPar2("A😀\tB\nC\n");
    field.SetTextObject(rich);

    const wire = structuredClone(createOdtWriterTransfer(document));
    const restored = restoreOdtWriterTransfer(wire);
    const restoredField = SwPostItFieldType.Get(restored).FindField(record.id);
    const actual = restoredField?.GetTextObject();
    expect(actual?.Equals(rich)).toBe(true);
    expect(actual?.GetPool()).not.toBe(rich.GetPool());
    expect(restoredField?.GetPar2()).toBe("A😀\tB\nC\n");
    expect(createOdtWriterTransfer(restored).graph.annotations).toEqual(wire.graph.annotations);

    const bytes = await writeOdtDocument(restored, { title: "Rich comments" });
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    const annotation = xml?.match(/<office:annotation\s[^>]*>.*?<\/office:annotation>/su)?.[0];
    expect(annotation).toMatch(/<text:p text:style-name="P\d+">/u);
    expect(annotation).toMatch(/<text:span text:style-name="T\d+">😀<\/text:span>/u);
    expect(annotation).toContain("<text:tab/>B<text:line-break/>C");
    expect(annotation).toMatch(/<text:p(?: text:style-name="[^"]+")?><\/text:p>/u);
    expect(xml).toContain('fo:text-align="center"');
    expect(xml).toContain('style:contextual-spacing="true"');
    expect(xml).toContain('fo:font-weight="bold"');
    expect(xml).toContain('fo:color="#285ac8"');
    expect(xml).toContain('style:text-underline-color="#dd0049"');
    expect(xml).toContain('fo:background-color="#ffdf61"');
    expect(xml).not.toContain(feature);

    const reopened = await readOdtDocument(bytes, { title: "Rich comments" });
    const reopenedRecord = createOdtWriterTransfer(reopened.document).graph.annotations?.[0];
    expect(reopenedRecord?.text).toBe("A😀\tB\nC\n");
    const reopenedField =
      reopenedRecord && SwPostItFieldType.Get(reopened.document).FindField(reopenedRecord.id);
    const reopenedText = reopenedField?.GetTextObject();
    expect(reopenedText?.GetParagraphCount()).toBe(2);
    const first = reopenedText?.GetText(0);
    if (!first) throw new Error("Missing native annotation paragraph.");
    try {
      expect(text(first)).toBe(`A😀${feature}B${feature}C`);
    } finally {
      first.dispose();
    }
    const spans: EECharAttrib[] = [];
    reopenedText?.GetCharAttribs(0, spans);
    const background = spans.find(
      /** Locates the native imported background over the styled range. @param span - Note attribute. @returns Whether this is the background. */
      (span) => span.pAttr?.Which() === EE_CHAR_BKGCOLOR,
    );
    expect(background?.pAttr).toBeInstanceOf(SvxColorItem);
    expect((background?.pAttr as SvxColorItem).GetValue().toUInt32()).toBe(0xffdf61);
    expect(spans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nStart: 1, nEnd: 3, pAttr: expect.any(SvxWeightItem) }),
        expect.objectContaining({ nStart: 1, nEnd: 3, pAttr: expect.any(SvxUnderlineItem) }),
        expect.objectContaining({ nStart: 3, nEnd: 4, pAttr: expect.any(SfxVoidItem) }),
        expect.objectContaining({ nStart: 5, nEnd: 6, pAttr: expect.any(SfxVoidItem) }),
      ]),
    );
    expect(
      (
        reopenedText?.GetParaAttribs(0).GetItemIfSet(EE_PARA_JUST, false) as SvxAdjustItem
      ).GetAdjust(),
    ).toBe(SvxAdjust.Center);
    const reopenedSpacing = reopenedText?.GetParaAttribs(0).GetItemIfSet(EE_PARA_ULSPACE, false);
    expect(reopenedSpacing?.equals(spacing)).toBe(true);
  } finally {
    empty.dispose();
    style.dispose();
    value.dispose();
    rich.dispose();
  }
});

it("preserves formatting in the original Writer annotation list", /** Ports testAnnotationFormatting using the native EditEngine text object. @returns Completion. */ async () => {
  const sample =
    "../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/annotation-formatting.odt";
  const metadata = { title: "Annotation formatting" };
  const { document } = await readOdtDocument(new Uint8Array(readFileSync(sample)), metadata);
  const transfer = createOdtWriterTransfer(document);
  const restored = restoreOdtWriterTransfer(structuredClone(transfer));
  const [first] = [...SwPostItFieldType.Get(restored).GatherFields()];
  const note = first?.GetField().GetTextObject();
  expect(note).toBeInstanceOf(EditTextObjectImpl);
  if (!(note instanceof EditTextObjectImpl)) throw new Error("Missing native annotation text.");
  const paragraph = note.GetContents()[0];
  expect(first?.GetField().GetPar2()).toBe("Looses: bold");
  expect(paragraph?.GetParaAttribs().Get(EE_PARA_OUTLLEVEL).QueryValue()).toBe(0);
  const bold = paragraph
    ?.GetCharAttribs()
    .find(
      /** Finds the native run for the second portion. @param attribute - Borrowed character attribute. @returns Whether the portion starts at the source position. */
      (attribute) => attribute.GetStart() === 8 && attribute.GetItem()?.Which() === EE_CHAR_WEIGHT,
    )
    ?.GetItem();
  expect(bold).toBeInstanceOf(SvxWeightItem);
  expect((bold as SvxWeightItem).GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  const reopened = await readOdtDocument(await writeOdtDocument(restored, metadata), metadata);
  const [after] = [...SwPostItFieldType.Get(reopened.document).GatherFields()];
  expect(after?.GetField().GetPar2()).toBe("Looses: bold");
});

it("round-trips the original resolved and unresolved annotations", /** Ports testResolvedComment and verifies its legacy initials become native ODF 1.3 metadata. @returns Completion. */ async () => {
  const sample =
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/resolved-comment.odt";
  const metadata = { title: "Resolved comments" };
  const { document } = await readOdtDocument(new Uint8Array(readFileSync(sample)), metadata);
  const restored = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
  const result = await writeOdtDocument(restored, metadata);
  expect(await (await DocumentArchive.open(result)).readTextEntry("content.xml")).toContain(
    "<meta:creator-initials>SC</meta:creator-initials>",
  );
  const { document: reopened } = await readOdtDocument(result, metadata);
  expect(
    [...SwPostItFieldType.Get(reopened).GatherFields()].map(
      /** Reads the represented native field metadata. @param item - Attached annotation format. @returns Resolved state, initials and authored text. */ (
        item,
      ) => {
        const value = item.GetField().GetData();
        return [value.resolved, value.initials, value.text];
      },
    ),
  ).toEqual([
    [true, "SC", "This comment is resolved"],
    [false, "SC", "This comment is not resolved"],
  ]);
});

it("imports the native paragraph extension and writes the empty annotation date", /** Exercises represented Shape text and native default metadata. @returns Completion. */ async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:loext="${ODF_NAMESPACES.loext}"`;
  const xml = `<office:document-content ${ns}><office:body><office:text><text:p>before<office:annotation><loext:p>note</loext:p></office:annotation>after</text:p></office:text></office:body></office:document-content>`;
  const metadata = { title: "Annotation defaults" };
  const { document } = importWriterXml(undefined, xml, metadata);
  const [note] = [...SwPostItFieldType.Get(document).GatherFields()];
  expect(note?.GetField().GetPar2()).toBe("note");
  const bytes = await writeOdtDocument(document, metadata);
  const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
  expect(content).toContain("<dc:date>0000-00-00T00:00:00</dc:date>");
  expect(content).not.toContain("<dc:creator>");
});
