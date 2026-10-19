/** @fileoverview Exercises genuine native character values through shared xmloff handlers and Writer ODT package filters. */
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { FontWeight, FontItalic } from "../../../../tools/inc/fontenum";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxFontHeightItem,
  SvxUnderlineItem,
  FontLineStyle,
} from "../../../../editeng/source/items/textitem";
import { Color } from "../../../../tools/inc/color";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwpHints } from "../../core/txtnode/ndhints";
import { SwFormatAutoFormat, SwTextAttrEnd } from "../../core/txtnode/txatbase";
import { GetTextAttrMode } from "../../../inc/swtypes";
import {
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_UNDERLINE,
  RES_TXTATR_AUTOFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { importWriterXml } from "./xmlimp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
/** Actual shell identity used by the original package boundary. */
const metadata = createDocument({
  id: "native-character-values",
  suiteId: "writer",
  title: "Native character values",
});
/** Reads native auto-format ownership with the original default interval. @param node - Text owner. @param offset - UTF16 index. @param which - Item identity. @returns Real item. */
function itemAt(node: SwTextNode, offset: number, which: number) {
  const hint = node.GetTextAttrAt(offset, RES_TXTATR_AUTOFMT, GetTextAttrMode.Default);
  return hint?.format instanceof SwFormatAutoFormat
    ? (hint.format.GetStyleHandle().GetItemIfSet(which, false) ?? node.GetAttr(which))
    : node.GetAttr(which);
}
it("preserves independent script weights,postures,heights and a native colored double wave through actual ODT", /** Exercises direct native items and original handlers rather than a boolean projection. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText("Native values");
  const weights = [FontWeight.WEIGHT_SEMIBOLD, FontWeight.WEIGHT_NORMAL, FontWeight.WEIGHT_BLACK],
    postures = [FontItalic.ITALIC_OBLIQUE, FontItalic.ITALIC_NONE, FontItalic.ITALIC_NORMAL];
  for (const [index, which] of [
    RES_CHRATR_WEIGHT,
    RES_CHRATR_CJK_WEIGHT,
    RES_CHRATR_CTL_WEIGHT,
  ].entries())
    node.SetAttr(new SvxWeightItem(weights[index] as FontWeight, which));
  for (const [index, which] of [
    RES_CHRATR_POSTURE,
    RES_CHRATR_CJK_POSTURE,
    RES_CHRATR_CTL_POSTURE,
  ].entries())
    node.SetAttr(new SvxPostureItem(postures[index] as FontItalic, which));
  for (const [index, which] of [
    RES_CHRATR_FONTSIZE,
    RES_CHRATR_CJK_FONTSIZE,
    RES_CHRATR_CTL_FONTSIZE,
  ].entries())
    node.SetAttr(new SvxFontHeightItem(240 + index * 40, 100, which));
  const line = new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLEWAVE, RES_CHRATR_UNDERLINE);
  line.SetColor(new Color(0x332211));
  node.SetAttr(line);
  const transferred = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc)));
  const bytes = writeOdtDocument(transferred, metadata),
    xml = await new ZipFile(bytes).readTextEntry("content.xml");
  for (const attribute of [
    'fo:font-weight="600"',
    'style:font-weight-asian="normal"',
    'style:font-weight-complex="900"',
    'fo:font-style="oblique"',
    'style:font-style-asian="normal"',
    'style:font-style-complex="italic"',
    'fo:font-size="12pt"',
    'style:font-size-asian="14pt"',
    'style:font-size-complex="16pt"',
    'style:text-underline-style="wave"',
    'style:text-underline-type="double"',
    'style:text-underline-color="#332211"',
  ])
    expect(xml).toContain(attribute);
  let current = (await readOdtDocument(bytes, metadata)).document;
  for (let pass = 0; pass < 2; pass++) {
    const restored = current.paragraphs[0] as SwTextNode;
    for (const [index, which] of [
      RES_CHRATR_WEIGHT,
      RES_CHRATR_CJK_WEIGHT,
      RES_CHRATR_CTL_WEIGHT,
    ].entries())
      expect((itemAt(restored, 0, which) as SvxWeightItem).GetWeight()).toBe(weights[index]);
    for (const [index, which] of [
      RES_CHRATR_POSTURE,
      RES_CHRATR_CJK_POSTURE,
      RES_CHRATR_CTL_POSTURE,
    ].entries())
      expect((itemAt(restored, 0, which) as SvxPostureItem).GetPosture()).toBe(postures[index]);
    for (const [index, which] of [
      RES_CHRATR_FONTSIZE,
      RES_CHRATR_CJK_FONTSIZE,
      RES_CHRATR_CTL_FONTSIZE,
    ].entries())
      expect((itemAt(restored, 0, which) as SvxFontHeightItem).GetHeight()).toBe(240 + index * 40);
    const restoredLine = itemAt(restored, 0, RES_CHRATR_UNDERLINE) as SvxUnderlineItem;
    expect(restoredLine.GetLineStyle()).toBe(FontLineStyle.LINESTYLE_DOUBLEWAVE);
    expect(restoredLine.GetColor().toUInt32()).toBe(0x332211);
    current = (await readOdtDocument(writeOdtDocument(current, metadata), metadata)).document;
  }
});
it("retains adjacent native weights that have the same browser bold state", /** Exposes the previous boolean-run merge loss and native insertion-path loss. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    node = doc.paragraphs[0] as SwTextNode,
    hints = new SwpHints(doc.GetAttrPool());
  node.SetText("ab");
  const weights = [FontWeight.WEIGHT_LIGHT, FontWeight.WEIGHT_SEMIBOLD];
  for (const [index, weight] of weights.entries()) {
    const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
    set.Put(new SvxWeightItem(weight, RES_CHRATR_WEIGHT));
    hints.Insert(new SwTextAttrEnd(new SwFormatAutoFormat(set), index, index + 1));
  }
  node.SetTextHints(hints);
  const bytes = writeOdtDocument(doc, metadata),
    xml = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(xml).toContain('fo:font-weight="300"');
  expect(xml).toContain('fo:font-weight="600"');
  const restored = (await readOdtDocument(bytes, metadata)).document.paragraphs[0] as SwTextNode;
  expect(restored.GetText()).toBe("ab");
  expect((itemAt(restored, 0, RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(weights[0]);
  expect((itemAt(restored, 1, RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(weights[1]);
});

it("imports underline color independently while preserving the inherited line style", /** Uses independently authored ODF rather than a browser boolean. @returns Nothing. */ () => {
  const xml =
    '<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"><office:styles><style:style style:name="Text_20_body" style:family="paragraph"><style:text-properties style:text-underline-color="#123456"/></style:style></office:styles></office:document-styles>';
  const { document } = importWriterXml(xml, undefined, { title: "Color only" });
  const line = document
    .GetTextFormatColl("text-body")
    .GetAttrSet()
    .Get(RES_CHRATR_UNDERLINE, true) as SvxUnderlineItem;
  expect(line.GetLineStyle()).toBe(FontLineStyle.LINESTYLE_NONE);
  expect(line.GetColor().toUInt32()).toBe(0x123456);
  document.Dispose();
});
