/** @fileoverview Real XLSX export-string/part owners through SAL, XML serializers and ZIP output without host DOM; not complete workbook filtering. */
import {
  XclExpRecordList,
  XclExpXmlStartElementRecord,
  XclExpXmlEndElementRecord,
} from "../../apps/office/src/sc/source/filter/inc/xerecord";
import { XclListColor } from "../../apps/office/src/sc/source/filter/excel/xestyle";
import { XclExpString } from "../../apps/office/src/sc/source/filter/inc/xestring";
import { XclStrFlags } from "../../apps/office/src/sc/source/filter/inc/xlstring";
import { XclFontData } from "../../apps/office/src/sc/source/filter/inc/xlstyle";
import { SvxFont } from "../../apps/office/src/editeng/inc/svxfont";
import { ScDocument } from "../../apps/office/src/sc/inc/document";
import { ScPatternAttr } from "../../apps/office/src/sc/inc/patattr";
import { SvtScriptType } from "../../apps/office/src/svl/inc/languageoptions";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
} from "../../apps/office/src/editeng/source/items/textitem";
import {
  ATTR_FONT,
  ATTR_FONT_HEIGHT,
  ATTR_FONT_WEIGHT,
} from "../../apps/office/src/sc/inc/scitems";
import { FontFamily, FontPitch } from "../../apps/office/src/tools/inc/fontenum";
import { RTL_TEXTENCODING_MS_1252 } from "../../apps/office/src/sal/inc/rtl/textenc";
import { FontWeight } from "../../apps/office/src/tools/inc/fontenum";
import { ComplexColor } from "../../apps/office/src/docmodel/inc/color/ComplexColor";
import { Color } from "../../apps/office/src/tools/inc/color";
import { XclXmlUtils } from "../../apps/office/src/sc/source/filter/inc/xestream";
import { XclExpXmlStream } from "../../apps/office/src/sc/source/filter/inc/xestream";
import { unicode, text } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import {
  ZipStorage,
  type ZipFragmentStream,
} from "../../apps/office/src/oox/source/helper/zipstorage";
import { DocumentArchive } from "../../apps/office/src/package/source/zippackage/document-archive";
import { getTokenFromUtf8 as token } from "../../apps/office/src/oox/source/token/tokenmap";
/** Serializes a real value via original part creation and stack ownership, then independently reopens the package. @returns Observations. */
export async function probeNativeXlsxString() {
  const native = unicode(" A\0字😀\n"),
    value = new XclExpString(native, XclStrFlags.ForceUnicode);
  native.dispose();
  const copy = new XclExpString(value),
    output = new Uint8Array(value.GetSize()),
    filter = new XclExpXmlStream(new ZipStorage(), false, false),
    bookPath = unicode("xl/workbook.xml"),
    stringPath = unicode("xl/sharedStrings.xml"),
    relative = unicode("sharedStrings.xml"),
    bookRelation = unicode(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    ),
    stringRelation = unicode(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
    ),
    id = new OUString();
  let routing: boolean;
  const sourceFont = new SvxFont(),
    color = new ComplexColor();
  const document = new ScDocument(),
    pattern = new ScPatternAttr(document.getCellAttributeHelper()),
    items = pattern.GetItemSetWritable();
  items.Put(
    new SvxFontItem(
      FontFamily.FAMILY_SWISS,
      "Liberation Sans",
      "Regular",
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_MS_1252,
      ATTR_FONT,
    ),
  );
  items.Put(new SvxFontHeightItem(245, 100, ATTR_FONT_HEIGHT));
  items.Put(new SvxWeightItem(FontWeight.WEIGHT_BOLD, ATTR_FONT_WEIGHT));
  pattern.fillFontOnly(sourceFont);
  const differential = ScPatternAttr.GetDxfFont(items, SvtScriptType.LATIN),
    itemExtraction =
      differential.pFontAttr === items.GetItemIfSet(ATTR_FONT) &&
      differential.nFontHeight === 245 &&
      differential.eWeight === FontWeight.WEIGHT_BOLD &&
      differential.eUnder === undefined;
  pattern.Dispose();
  document.DisposeAttributes();
  sourceFont.SetEscapement(33);
  color.setColor(new Color(255, 0, 0));
  const font = new XclFontData(sourceFont, color),
    extraction = text(font.maName) === "Arial" && font.mnEscapem === 1 && font.mnHeight === 245;
  try {
    const book = filter.CreateOutputStream(
      bookPath,
      bookPath,
      null,
      new TextEncoder().encode(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\0",
      ),
      bookRelation,
    );
    filter.PushStream(book);
    const serializer = filter.CreateOutputStream(
      stringPath,
      relative,
      book.getOutputStream() as ZipFragmentStream,
      new TextEncoder().encode(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml\0",
      ),
      stringRelation,
      id,
    );
    routing =
      filter.GetCurrentStream() === book &&
      filter.GetStreamForPath(stringPath) === serializer &&
      text(id) === "rId1";
    filter.PushStream(serializer);
    value.WriteToMem(output);
    serializer.startElement(
      token("sst"),
      token("xmlns"),
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    );
    const opening = new XclExpRecordList(),
      closing = new XclExpRecordList();
    opening.AppendNewRecord(new XclExpXmlStartElementRecord(token("si")));
    opening.AppendNewRecord(new XclExpXmlStartElementRecord(token("r")));
    opening.AppendNewRecord(new XclExpXmlStartElementRecord(token("rPr")));
    closing.AppendNewRecord(new XclExpXmlEndElementRecord(token("r")));
    closing.AppendNewRecord(new XclExpXmlEndElementRecord(token("si")));
    opening.SaveXml(filter);
    XclXmlUtils.WriteFontData(serializer, font, token("rFont"));
    serializer.endElement(token("rPr"));
    value.WriteXml(filter);
    closing.SaveXml(filter);
    opening.dispose();
    closing.dispose();
    serializer.endElement(token("sst"));
    serializer.endDocument();
    filter.PopStream();
    routing &&= filter.GetCurrentStream() === book;
    book.write('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"/>');
    book.endDocument();
    filter.PopStream();
  } finally {
    font.Dispose();
    id.dispose();
    stringRelation.dispose();
    bookRelation.dispose();
    relative.dispose();
    stringPath.dispose();
    bookPath.dispose();
  }
  const archive = await DocumentArchive.open(await filter.commitStorage()),
    xml = await archive.readTextEntry("xl/sharedStrings.xml"),
    relations = await archive.readTextEntry("xl/_rels/workbook.xml.rels");
  const firstColor = new XclListColor(new Color(32, 64, 96), 1),
    secondColor = new XclListColor(new Color(224, 192, 160), 2);
  firstColor.AddWeighting(10);
  secondColor.AddWeighting(20);
  firstColor.Merge(secondColor);
  return {
    recordList: xml.includes("<si><r><rPr>") && xml.includes("</r></si>"),
    paletteValues:
      firstColor.GetColor().GetRed() === 197 &&
      firstColor.GetColor().GetGreen() === 166 &&
      firstColor.GetColor().GetBlue() === 139 &&
      firstColor.GetWeighting() === 30,
    length: value.Len(),
    copy: copy.IsEqual(value) && copy.GetUnicodeBuffer() !== value.GetUnicodeBuffer(),
    header: output[0] === value.Len() && output[2] === 1,
    text: xml.includes(" A_x0000_字😀&#10;"),
    preserve: xml.includes('xml:space="preserve"'),
    fontExtraction: extraction,
    fontItems: itemExtraction,
    fontData:
      xml.includes('<vertAlign val="superscript"/>') &&
      xml.includes('<b val="true"/>') &&
      xml.includes('<sz val="12.25"/>') &&
      xml.includes('<color rgb="FFFF0000"/>') &&
      xml.includes('<rFont val="Arial"/>'),
    partRouting: routing && relations.includes('Target="sharedStrings.xml"'),
  };
}
