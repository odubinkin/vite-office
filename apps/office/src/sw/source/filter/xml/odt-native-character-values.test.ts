/** @fileoverview Exercises genuine native character values through shared xmloff handlers and Writer ODT package filters. */
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { FontWeight, FontItalic, FontEmphasisMark } from "../../../../tools/inc/fontenum";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxCharRotateItem } from "../../../../editeng/inc/charrotateitem";
import { SvxCharScaleWidthItem } from "../../../../editeng/inc/charscaleitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { SvxTwoLinesItem } from "../../../../editeng/inc/twolinesitem";
import { SvxCaseMapItem } from "../../../../editeng/source/items/textitem.modes";
import { SvxCaseMap } from "../../../../editeng/inc/svxenum";
import { SvxBlinkItem } from "../../../../editeng/source/items/textitem.layout";
import { SvxCharHiddenItem } from "../../../../editeng/source/items/charhiddenitem";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxFontHeightItem,
  SvxUnderlineItem,
  FontLineStyle,
  SvxNoHyphenItem,
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
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_ROTATE,
  RES_CHRATR_SCALEW,
  RES_CHRATR_EMPHASIS_MARK,
  RES_CHRATR_TWO_LINES,
  RES_CHRATR_CASEMAP,
  RES_CHRATR_BLINK,
  RES_CHRATR_HIDDEN,
  RES_CHRATR_NOHYPHEN,
  RES_TXTATR_AUTOFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { importWriterXml } from "./xmlimp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
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

/** Checks the native character items without applying visual formatting to the model text. @param document - Writer model. @param legacy - Whether generator inversion was applied. @returns Nothing. */
function expectCharacterFlags(document: ReturnType<typeof createWriterDocument>, legacy: boolean) {
  const node = document.paragraphs[0] as SwTextNode;
  expect(node.GetText()).toBe("abcd");
  for (const [offset, mode, flashing, hidden, noHyphen] of [
    [1, SvxCaseMap.SmallCaps, true, !legacy, true],
    [3, SvxCaseMap.Uppercase, false, legacy, false],
  ] as const) {
    const casing = itemAt(node, offset, RES_CHRATR_CASEMAP);
    const flash = itemAt(node, offset, RES_CHRATR_BLINK);
    const visibility = itemAt(node, offset, RES_CHRATR_HIDDEN);
    const hyphenation = itemAt(node, offset, RES_CHRATR_NOHYPHEN);
    assert(casing instanceof SvxCaseMapItem);
    assert(flash instanceof SvxBlinkItem);
    assert(visibility instanceof SvxCharHiddenItem);
    assert(hyphenation instanceof SvxNoHyphenItem);
    expect(casing.GetCaseMap()).toBe(mode);
    expect(flash.GetValue()).toBe(flashing);
    expect(visibility.GetValue()).toBe(hidden);
    expect(hyphenation.GetValue()).toBe(noHyphen);
  }
}

it.each([false, true])(
  "round-trips native character flags with legacy generator %s",
  /** Exercises upstream small caps and blink fixture attributes, named and automatic styles, and modern versus old hidden-text polarity. @param legacy - Whether to supply an old generator. @returns Completion. */ async (
    legacy,
  ) => {
    const namespaces =
      'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"';
    const fixture = new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/tdf100492.odt"),
    );
    const fixtureStyles = await (await DocumentArchive.open(fixture)).readTextEntry("styles.xml");
    assert(fixtureStyles);
    const fixtureDocument = new DOMParser().parseFromString(fixtureStyles, "application/xml");
    const sampleStyles = Array.from(
      fixtureDocument.getElementsByTagNameNS(
        "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
        "style",
      ),
    );
    const smallCaps = sampleStyles
      .find(
        /** Finds the character style by its escaped ODF name. @param sample - ODF style element. @returns Whether the source style name matches. */ (
          sample,
        ) => sample.getAttribute("style:name") === "Titre_20_1_20_Car",
      )
      ?.firstElementChild?.getAttribute("fo:font-variant");
    const blinking = sampleStyles
      .find(
        /** Finds the list label style by its escaped ODF name. @param sample - ODF style element. @returns Whether the source style name matches. */ (
          sample,
        ) => sample.getAttribute("style:name") === "ListLabel_20_1",
      )
      ?.firstElementChild?.getAttribute("style:text-blinking");
    expect([smallCaps, blinking]).toEqual(["small-caps", "true"]);
    const styles = `<office:document-styles ${namespaces}><office:styles><style:style style:name="TextFlags" style:family="paragraph"><style:text-properties fo:text-transform="uppercase" style:text-blinking="false" text:display="true" fo:hyphenate="true"/></style:style></office:styles></office:document-styles>`;
    const content = `<office:document-content ${namespaces}><office:automatic-styles><style:style style:name="Flags" style:family="text"><style:text-properties fo:font-variant="${smallCaps}" style:text-blinking="${blinking}" text:display="none" fo:hyphenate="false"/></style:style></office:automatic-styles><office:body><office:text><text:p text:style-name="TextFlags"><text:span text:style-name="Flags">ab</text:span>cd</text:p></office:text></office:body></office:document-content>`;
    const generator = legacy
      ? "OpenOffice.org/2.4 Win32 OpenOffice.org_project/680m12$Build-9286"
      : "LibreOffice/26.8.0.2 LibreOffice_project/42";
    const meta = `<office:document-meta ${namespaces}><office:meta><meta:generator>${generator}</meta:generator></office:meta></office:document-meta>`;
    const { document } = importWriterXml(styles, content, metadata, meta);
    let transferred: typeof document | undefined;
    let reopened: typeof document | undefined;
    try {
      expectCharacterFlags(document, legacy);
      transferred = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
      expectCharacterFlags(transferred, legacy);
      const bytes = await writeOdtDocument(transferred, metadata);
      const archive = await DocumentArchive.open(bytes);
      const stylesXml = await archive.readTextEntry("styles.xml");
      const contentXml = await archive.readTextEntry("content.xml");
      expect(stylesXml).toContain('fo:text-transform="uppercase"');
      expect(stylesXml).toContain(`text:display="${legacy ? "none" : "true"}"`);
      expect(stylesXml).toContain('fo:hyphenate="true"');
      expect(contentXml).toContain('fo:font-variant="small-caps"');
      expect(contentXml).toContain('style:text-blinking="true"');
      expect(contentXml).toContain('fo:hyphenate="false"');
      expect(contentXml).toContain(`text:display="${legacy ? "true" : "none"}"`);
      reopened = (await readOdtDocument(bytes, metadata)).document;
      expectCharacterFlags(reopened, legacy);
    } finally {
      reopened?.Dispose();
      transferred?.Dispose();
      document.Dispose();
    }
  },
);

it("retains the original tdf106001-2.odt text scale through Writer ODT", /** Ports the ODT-source scale used by LibreOffice's tdf106001 export fixture. @returns Completion. */ async () => {
  const fixture = new Uint8Array(
    readFileSync(
      "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf106001-2.odt",
    ),
  );
  const source = (await readOdtDocument(fixture, metadata)).document;
  let reopened: typeof source | undefined;
  try {
    const node = source.paragraphs[0] as SwTextNode;
    const item = itemAt(node, 1, RES_CHRATR_SCALEW);
    assert(item instanceof SvxCharScaleWidthItem);
    expect(item.GetValue()).toBe(900);
    const bytes = await writeOdtDocument(source, metadata);
    expect(await (await DocumentArchive.open(bytes)).readTextEntry("content.xml")).toContain(
      'style:text-scale="900%"',
    );
    reopened = (await readOdtDocument(bytes, metadata)).document;
    const saved = itemAt(reopened.paragraphs[0] as SwTextNode, 1, RES_CHRATR_SCALEW);
    assert(saved instanceof SvxCharScaleWidthItem);
    expect(saved.GetValue()).toBe(900);
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves typography deltas in named and automatic styles through Worker transfer and ODT", /** Exercises native member flags and XML escaping with explicit style resets. @returns Completion. */ async () => {
  const namespaces =
    'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"';
  const styles = `<office:document-styles ${namespaces}><office:styles><style:style style:name="Typography" style:family="paragraph"><style:text-properties style:letter-kerning="true" style:text-scale="160%" style:text-emphasize="below accent" style:text-rotation-angle="-90" style:text-rotation-scale="fixed" style:text-combine="lines" style:text-combine-start-char="&lt;extra" style:text-combine-end-char="&gt;"/></style:style></office:styles></office:document-styles>`;
  const content = `<office:document-content ${namespaces}><office:automatic-styles><style:style style:name="Reset" style:family="text"><style:text-properties style:letter-kerning="false" style:text-scale="100%" style:text-emphasize="none" style:text-rotation-angle="0" style:text-rotation-scale="line-height" style:text-combine="none"/></style:style></office:automatic-styles><office:body><office:text><text:p text:style-name="Typography"><text:span text:style-name="Reset">ab</text:span>cd</text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, content, metadata);
  let transferred: typeof document | undefined;
  let reopened: typeof document | undefined;
  try {
    transferred = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(document)));
    const bytes = await writeOdtDocument(transferred, metadata);
    const archive = await DocumentArchive.open(bytes);
    const styleXml = await archive.readTextEntry("styles.xml");
    expect(styleXml).toContain('style:text-combine-start-char="&lt;"');
    expect(styleXml).toContain('style:text-combine-end-char="&gt;"');
    expect(styleXml).toContain('style:text-emphasize="accent below"');
    expect(styleXml).toContain('style:text-rotation-angle="270"');
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const candidate of [document, transferred, reopened]) {
      const node = candidate.paragraphs[0] as SwTextNode;
      expect(node.GetText()).toBe("abcd");
      for (const [offset, angle, fit, scale, emphasis, combine, kern] of [
        [1, 0, false, 100, FontEmphasisMark.NONE, false, false],
        [3, 2700, true, 160, FontEmphasisMark.Accent | FontEmphasisMark.PosBelow, true, true],
      ] as const) {
        const rotation = itemAt(node, offset, RES_CHRATR_ROTATE);
        const width = itemAt(node, offset, RES_CHRATR_SCALEW);
        const marks = itemAt(node, offset, RES_CHRATR_EMPHASIS_MARK);
        const lines = itemAt(node, offset, RES_CHRATR_TWO_LINES);
        const automatic = itemAt(node, offset, RES_CHRATR_AUTOKERN);
        assert(rotation instanceof SvxCharRotateItem);
        assert(width instanceof SvxCharScaleWidthItem);
        assert(marks instanceof SvxEmphasisMarkItem);
        assert(lines instanceof SvxTwoLinesItem);
        assert(automatic instanceof SvxAutoKernItem);
        expect([rotation.GetValue(), rotation.IsFitToLine()]).toEqual([angle, fit]);
        expect(width.GetValue()).toBe(scale);
        expect(marks.GetEmphasisMark()).toBe(emphasis);
        expect(lines.GetValue()).toBe(combine);
        expect(automatic.GetValue()).toBe(kern);
      }
    }
  } finally {
    reopened?.Dispose();
    transferred?.Dispose();
    document.Dispose();
  }
});
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
  const bytes = await writeOdtDocument(transferred, metadata),
    xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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
    current = (await readOdtDocument(await writeOdtDocument(current, metadata), metadata)).document;
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
  const bytes = await writeOdtDocument(doc, metadata),
    xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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
