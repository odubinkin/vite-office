/** @fileoverview Native DOCX run output over actual shared character items and ZIP fragment stream. */
import { DocxExport } from "./docxexport";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { expect, it } from "vitest";
import { impl_WriteRunText } from "./docxattributeoutput";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import {
  FontItalic as I,
  FontWeight as W,
  FontStrikeout as S,
} from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_FONTSIZE as H,
  RES_CHRATR_CJK_FONTSIZE as C,
  RES_CHRATR_CTL_FONTSIZE as T,
} from "../../../inc/hintids";
/** Actual fragment serializer and native attribute output. @returns Test output owners. */
function setup() {
  const stream = new ZipFragmentStream("word/document.xml", "application/xml"),
    helper = new FastSerializerHelper(stream, false, new FastTokenHandler());
  const doc = new SwDoc(),
    position = new SwPosition(doc.GetNodes().GetEndOfContent()),
    range = new SwPaM(position);
  const exporter = new DocxExport(
    new XmlFilterBase(new ZipStorage()),
    doc,
    range,
    range,
    false,
    false,
  );
  const output = exporter.DocxAttrOutput();
  output.SetSerializer(helper);
  return { stream, helper, output, exporter, range, position, doc };
}
/** Complete the actual serializer and decode output. @param owners - Actual owners. @returns XML fragment. */
function finish(owners: ReturnType<typeof setup>): string {
  owners.helper.endDocument();
  owners.exporter.dispose();
  owners.range.Dispose();
  owners.position.Dispose();
  owners.doc.Dispose();
  return new TextDecoder().decode(owners.stream.getBytes());
}
it("splits controls and whitespace with native UTF16 symbol handling and final-segment font asymmetry", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const o = setup();
  o.output.RunText(" A<&\t\u0001\u000bB\u001eC\u001fD\rE\0F ");
  o.output.RunText("\u0001\u0001");
  o.output.RunText("");
  o.output.RunText("\n");
  o.output.RunText("X\t😀", 0, "Symbol");
  expect(finish(o)).toBe(
    '<w:t xml:space="preserve"> A&lt;&amp;</w:t><w:tab/><w:br/><w:br/><w:t>B</w:t><w:noBreakHyphen/><w:t>C</w:t><w:softHyphen/><w:t>D</w:t><w:t>E</w:t><w:t xml:space="preserve">F </w:t><w:br/><w:br/><w:t>X</w:t><w:tab/><w:sym w:font="Symbol" w:char="d83d"/><w:sym w:font="Symbol" w:char="de00"/>',
  );
  const second = setup(),
    begin: [number] = [2];
  expect(impl_WriteRunText(second.helper, token("t"), "xx", begin, 1)).toBe(false);
  expect(begin[0]).toBe(2);
  expect(finish(second)).toBe("");
});
it("prepends sorted native properties to pending text and replaces RawText", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const o = setup(),
    a = o.output;
  a.StartRun(null, 0);
  a.RunText("before");
  a.RawText("discard", 0);
  a.RawText("after", 0);
  a.StartRunProperties();
  a.CharFontSize(new SvxFontHeightItem(245, 100, H));
  a.CharFontSize(new SvxFontHeightItem(300, 100, T));
  a.CharKerning(new SvxKerningItem(-20, 0));
  a.CharAutoKern(new SvxAutoKernItem(true, 0));
  a.CharWeight(new SvxWeightItem(W.WEIGHT_BOLD, 0));
  a.CharPosture(new SvxPostureItem(I.ITALIC_NONE, 0));
  a.CharPostureCJK(new SvxPostureItem(I.ITALIC_NORMAL, 0));
  a.CharFontCJK(new SvxFontItem(0));
  a.CharFontCJK(new SvxFontItem(0));
  a.CharFontCTL(new SvxFontItem(0));
  a.CharFontCTL(new SvxFontItem(0));
  a.CharCrossedOut(new SvxCrossedOutItem(S.STRIKEOUT_NONE, 0));
  a.EndRunProperties();
  a.EndRun(null, 0, 0);
  expect(finish(o)).toBe(
    '<w:r><w:rPr><w:rFonts w:eastAsia="" w:cs=""/><w:b/><w:i w:val="false"/><w:strike w:val="false"/><w:dstrike w:val="false"/><w:spacing w:val="-20"/><w:kern w:val="2"/><w:sz w:val="25"/><w:szCs w:val="30"/></w:rPr><w:t>before</w:t><w:t>after</w:t></w:r>',
  );
});
it("keeps exact weight comparison, shared posture guard, reset, optional zero and independent CTL", /** Native source behavior over actual owners. @returns Nothing. */ () => {
  const o = setup(),
    a = o.output;
  for (const posture of [I.ITALIC_NONE, I.ITALIC_OBLIQUE]) {
    a.StartRun(null, 0);
    a.StartRunProperties();
    a.CharPostureCJK(new SvxPostureItem(posture, 0));
    a.CharPosture(new SvxPostureItem(I.ITALIC_NORMAL, 0));
    a.CharPostureCTL(new SvxPostureItem(posture, 0));
    a.CharWeight(new SvxWeightItem(W.WEIGHT_BLACK, 0));
    a.CharWeightCJK(new SvxWeightItem(W.WEIGHT_NORMAL, 0));
    a.CharWeightCTL(new SvxWeightItem(W.WEIGHT_NORMAL, 0));
    a.CharFontSize(new SvxFontHeightItem(0, 100, C));
    a.CharFontSize(new SvxFontHeightItem(999, 100, 0));
    a.CharAutoKern(new SvxAutoKernItem(false, 0));
    a.EndRunProperties();
    a.EndRun(null, 0, 0);
  }
  a.StartRun(null, 0);
  a.StartRunProperties();
  a.CharPosture(new SvxPostureItem(I.ITALIC_NORMAL, 0));
  a.CharWeightCJK(new SvxWeightItem(W.WEIGHT_BOLD, 0));
  a.CharWeightCTL(new SvxWeightItem(W.WEIGHT_BOLD, 0));
  a.CharCrossedOut(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, 0));
  a.EndRunProperties();
  a.EndRun(null, 0, 0);
  a.StartRun(null, 0);
  a.StartRunProperties();
  a.CharCrossedOut(new SvxCrossedOutItem(S.STRIKEOUT_SLASH, 0));
  a.EndRunProperties();
  a.EndRun(null, 0, 0);
  const xml = finish(o);
  expect(xml).toContain(
    '<w:b w:val="false"/><w:b w:val="false"/><w:bCs w:val="false"/><w:i w:val="false"/><w:iCs w:val="false"/><w:kern w:val="0"/><w:sz w:val="0"/>',
  );
  expect(xml).toContain('<w:i/><w:iCs/><w:kern w:val="0"/><w:sz w:val="0"/>');
  expect(xml).toContain("<w:b/><w:bCs/><w:i/><w:dstrike/>");
  expect(xml).toContain("<w:rPr><w:strike/></w:rPr>");
});
