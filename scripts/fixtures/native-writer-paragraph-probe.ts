/** @fileoverview Real Writer paragraph item types and DOCX property emission through core ZIP output in main/DOM-free Worker. */
import { SwUnoPropertyMap } from "../../apps/office/src/sw/source/core/unocore/unomap";
import { putItem, queryItem } from "../../apps/office/src/sw/source/core/unocore/unocrsrhelper";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { SwDoc } from "../../apps/office/src/sw/source/core/doc/doc";
import { SwPosition, SwPaM } from "../../apps/office/src/sw/source/core/crsr/pam";
import { DocxExport } from "../../apps/office/src/sw/source/filter/ww8/docxexport";
import { XmlFilterBase } from "../../apps/office/src/oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../apps/office/src/oox/source/helper/zipstorage";
import { DocumentArchive } from "../../apps/office/src/package/source/zippackage/document-archive";
import {
  SvxFormatSplitItem,
  SvxWidowsItem,
} from "../../apps/office/src/editeng/source/items/paraitem.controls";
import { RES_PARATR_SPLIT, RES_PARATR_WIDOWS } from "../../apps/office/src/sw/inc/hintids";
import { getTokenFromUtf8 as token } from "../../apps/office/src/oox/source/token/tokenmap";
import { SvxColorItem } from "../../apps/office/src/editeng/inc/colritem";
import { SvxUnderlineItem } from "../../apps/office/src/editeng/inc/udlnitem";
import { SvxLanguageItem } from "../../apps/office/src/editeng/inc/langitem";
import { LanguageType } from "../../apps/office/src/i18nlangtag/inc/lang";
import { Color } from "../../apps/office/src/tools/inc/color";
import { FontLineStyle } from "../../apps/office/src/tools/inc/fontenum";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_UNDERLINE,
} from "../../apps/office/src/sw/inc/hintids";
import { applyWriterParagraphList } from "../../apps/office/src/sw/source/core/doc/list";
import { SwNumRuleItem } from "../../apps/office/src/sw/source/core/para/paratr";
import { MSWordStyles } from "../../apps/office/src/sw/source/filter/ww8/wrtw8sty";
import { SvxEscapementItem } from "../../apps/office/src/editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../apps/office/src/sw/inc/hintids";
/** Original default items are emitted by the real exporter/serializer, then independently reopened. @returns Public observations. */
export async function probeNativeWriterParagraph() {
  const document = new SwDoc(),
    position = new SwPosition(document.GetNodes().GetEndOfContent()),
    range = new SwPaM(position),
    filter = new XmlFilterBase(new ZipStorage()),
    exporter = new DocxExport(filter, document, range, range, false, false),
    output = exporter.DocxAttrOutput(),
    serializer = output.GetSerializer(),
    namespaces = exporter.MainXmlNamespaces();
  let closed = false;
  try {
    const heading = document.MakeTextFormatColl("heading 1", document.GetDfltTextFormatColl());
    heading.AssignToListLevelOfOutlineStyle(0);
    const styles = new MSWordStyles(exporter);
    const styleIds =
      styles.GetStyleId(styles.GetSlot(heading)) === "Heading1" &&
      styles.GetHeadingParagraphStyleId(0) === styles.GetSlot(heading);
    const split = document.GetDefault(RES_PARATR_SPLIT),
      widow = document.GetDefault(RES_PARATR_WIDOWS);
    if (!(split instanceof SvxFormatSplitItem) || !(widow instanceof SvxWidowsItem))
      throw new Error("generic paragraph item remains");
    serializer.startElementNS(token("w"), token("document"), namespaces);
    serializer.startElementNS(token("w"), token("body"));
    serializer.startElementNS(token("w"), token("p"));
    serializer.startElementNS(token("w"), token("pPr"));
    output.ParaSplit(split);
    output.ParaWidows(widow);
    const node = document.paragraphs[0];
    if (!node) throw new Error("actual Writer text node absent");
    applyWriterParagraphList(node, {
      kind: "numbered",
      ruleName: "probe list",
      level: 2,
      restart: true,
      startValue: 7,
    });
    exporter.m_pOutFormatNode = node;
    output.ParaNumRule(new SwNumRuleItem(node.GetNumRuleName()));
    const overrideId = (exporter.m_pUsedNumTable?.length ?? 0) - 1;
    const listOverride =
      exporter.m_pUsedNumTable?.[overrideId] === null &&
      exporter.m_ListLevelOverrides.get(overrideId)?.get(2) === 7 &&
      exporter.m_OverridingNums.has(overrideId);
    exporter.m_pOutFormatNode = undefined;
    serializer.endElementNS(token("w"), token("pPr"));
    const color = new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR),
      underline = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE),
      language = new SvxLanguageItem(LanguageType(1034), RES_CHRATR_LANGUAGE),
      escape = new SvxEscapementItem(14000, 80, RES_CHRATR_ESCAPEMENT);
    try {
      underline.SetColor(new Color(0xff0000));
      output.StartRun(null, 0);
      output.StartRunProperties();
      exporter.m_pISet = node.GetSwAttrSet();
      output.CharEscapement(escape);
      output.CharLanguage(language);
      output.CharUnderline(underline);
      output.CharColor(color);
      output.EndRunProperties();
      output.RunText("字😀");
      output.EndRun(null, 0, 3);
    } finally {
      exporter.m_pISet = undefined;
      escape.Dispose();
      language.Dispose();
      underline.Dispose();
      color.Dispose();
    }
    serializer.endElementNS(token("w"), token("p"));
    serializer.startElementNS(token("w"), token("sectPr"));
    output.SectionType(3);
    output.SectionPageNumbering(4, 0);
    serializer.endElementNS(token("w"), token("sectPr"));
    serializer.endElementNS(token("w"), token("body"));
    serializer.endElementNS(token("w"), token("document"));
    exporter.dispose();
    closed = true;
    const archive = await DocumentArchive.open(await filter.commitStorage()),
      xml = await archive.readTextEntry("word/document.xml");
    const entry = SwUnoPropertyMap.get("ParaWidows"),
      input = new Any([-1], "sal_Int8");
    if (!entry) throw new Error("native widow property entry absent");
    let nativeByte = false;
    try {
      const copy = putItem(widow, entry, input),
        result = queryItem(copy, entry),
        signed: [number] = [0];
      try {
        nativeByte =
          result.extract(signed, "sal_Int8") &&
          signed[0] === -1 &&
          copy instanceof SvxWidowsItem &&
          copy.GetValue() === 255 &&
          widow.GetValue() === 2;
      } finally {
        result.dispose();
        copy.Dispose();
      }
    } finally {
      input.dispose();
    }
    return {
      nativeByte,
      escapement: xml.includes('<w:position w:val="4"/><w:sz w:val="19"/>'),
      styleIds,
      sectionNumbering: xml.includes(
        '<w:sectPr><w:type w:val="evenPage"/><w:pgNumType w:start="0" w:fmt="decimal"/></w:sectPr>',
      ),
      listOverride:
        listOverride &&
        xml.includes(`<w:numPr><w:ilvl w:val="2"/><w:numId w:val="${overrideId + 1}"/></w:numPr>`),
      characterProperties: xml.includes(
        '<w:rPr><w:color w:val="123456"/><w:position w:val="4"/><w:sz w:val="19"/><w:u w:val="single" w:color="FF0000"/><w:lang w:val="es-ES_tradnl"/></w:rPr>',
      ),
      split: split.GetValue(),
      widows: widow.GetValue(),
      nativeItems: true,
      sourceXml:
        xml.includes('<w:pPr><w:keepLines w:val="false"/><w:widowControl/><w:numPr>') &&
        xml.includes("字😀"),
    };
  } finally {
    namespaces.dispose();
    if (!closed) exporter.dispose();
    range.Dispose();
    position.Dispose();
    document.Dispose();
  }
}
