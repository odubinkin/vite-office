/** @fileoverview Verifies Writer native fill defaults and complete represented color state through the Worker boundary. */
import { assert, expect, it } from "vitest";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { SwDoc } from "./doc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { XATTR_FILLSTYLE, XATTR_FILLCOLOR, XATTR_FILLTRANSPARENCE } from "../../../../svx/inc/xdef";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { ComplexColor, SystemColorType } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorType, ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import { encodeComplexColor } from "../../../../docmodel/browser/complex-color-codec";
import { Color } from "../../../../tools/inc/color";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { MID_SHADING_VALUE } from "../../../../editeng/inc/memberids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { RES_CHRATR_COLOR, RES_CHRATR_HIGHLIGHT } from "../../../inc/hintids";
it("overrides root Writer fill styles without changing the drawing-pool SOLID default", /** Checks source docnew.cxx ownership/default placement rather than only visible formatting. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  try {
    expect(
      (doc.GetAttrPool().GetPoolDefaultItem(XATTR_FILLSTYLE) as XFillStyleItem).GetValue(),
    ).toBe(FillStyle.SOLID);
    expect(doc.GetAttrPool().GetUserDefaultItem(XATTR_FILLSTYLE)).toBeNull();
    expect(
      (
        doc.GetDfltTextFormatColl().GetAttrSet().Get(XATTR_FILLSTYLE, false) as XFillStyleItem
      ).GetValue(),
    ).toBe(FillStyle.NONE);
    expect(
      (
        doc.GetDfltFrameFormat().GetAttrSet().Get(XATTR_FILLSTYLE, false) as XFillStyleItem
      ).GetValue(),
    ).toBe(FillStyle.NONE);
    expect((node.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.NONE);
    expect((node.GetAttr(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toUInt32()).toBe(
      0x729fcf,
    );
  } finally {
    doc.Dispose();
  }
});
it("preserves native fill attributes and independent complex state across an actual Writer graph clone", /** Uses the existing Worker document codec with actual text-node/style owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("filled");
  const complex = new ComplexColor();
  complex.setSystemColor(SystemColorType.WindowText, 0x123456);
  complex.setThemeColor(ThemeColorType.Accent3);
  complex.setThemeColorUsage(ThemeColorUsage.Background);
  complex.setFinalColor(new Color(0xabcdef));
  const fill = new XFillColorItem("Custom", new Color(0x456789));
  fill.setComplexColor(complex);
  node.SetAttr(new XFillStyleItem(FillStyle.SOLID));
  node.SetAttr(fill);
  node.SetAttr(new XFillTransparenceItem(37));
  const decoded = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  try {
    const restored = decoded.paragraphs[0];
    assert(restored);
    const actual = restored.GetAttr(XATTR_FILLCOLOR);
    assert(actual instanceof XFillColorItem);
    expect(actual.GetName()).toBe("Custom");
    expect(actual.GetColorValue().toUInt32()).toBe(0x456789);
    expect(encodeComplexColor(actual.getComplexColor())).toEqual(encodeComplexColor(complex));
    expect((restored.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.SOLID);
    actual.getComplexColor().setFinalColor(new Color(0));
    expect(fill.getComplexColor().getFinalColor().toUInt32()).toBe(0xabcdef);
  } finally {
    decoded.Dispose();
    doc.Dispose();
  }
});
it("retains existing font/brush complex values instead of rejecting their Worker records", /** Checks raw shading, signed graphic transparency and native complex copy through the adapter. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    complex = ComplexColor.Theme(ThemeColorType.Accent2);
  complex.setThemeColorUsage(ThemeColorUsage.Text);
  const color = new SvxColorItem(new Color(0x123456), complex, RES_CHRATR_COLOR),
    brush = new SvxBrushItem(new Color(0xabcdef), complex, RES_CHRATR_HIGHLIGHT),
    shading = new Any([123456], "sal_Int32");
  try {
    expect(brush.PutValue(shading, MID_SHADING_VALUE)).toBe(true);
    brush.setGraphicTransparency(-1);
    for (const item of [color, brush]) {
      const record = encodeSfxPoolItem(item),
        restored = decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(record));
      expect(restored.equals(item)).toBe(true);
      expect(encodeSfxPoolItem(restored)).toEqual(record);
    }
  } finally {
    shading.dispose();
    doc.Dispose();
  }
});

it("round-trips direct fill values through actual Writer UNO and ODF paragraph styles", /** Checks native enum/color/negative-percent paths and inherited root NONE. @returns Completion. */ async () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("fill");
  node.SetAttr(new XFillStyleItem(FillStyle.SOLID));
  node.SetAttr(new XFillColorItem("", new Color(0x123abc)));
  node.SetAttr(new XFillTransparenceItem(37));
  const bytes = writeOdtDocument(doc, { title: "Fill" }),
    zip = new ZipFile(bytes);
  expect(await zip.readTextEntry("styles.xml")).toContain('draw:fill="none"');
  const content = await zip.readTextEntry("content.xml");
  expect(content).toContain('draw:fill="solid"');
  expect(content).toContain('draw:fill-color="#123abc"');
  expect(content).toContain('draw:opacity="63%"');
  const restored = (await readOdtDocument(bytes, { title: "Fill" })).document;
  try {
    const paragraph = restored.paragraphs[0];
    assert(paragraph);
    expect((paragraph.GetAttr(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.SOLID);
    expect((paragraph.GetAttr(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toUInt32()).toBe(
      0x123abc,
    );
    expect((paragraph.GetAttr(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(
      37,
    );
  } finally {
    restored.Dispose();
    doc.Dispose();
  }
});
