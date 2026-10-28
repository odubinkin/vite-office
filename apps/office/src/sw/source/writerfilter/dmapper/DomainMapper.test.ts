/** @fileoverview Consumed DomainMapper resource-to-model contracts through actual Writer native text, paragraph, style and pooled-item APIs. */
import { expect, it } from "vitest";
import { DomainMapper } from "./DomainMapper";
import { DomainMapper_Impl, ContextType as C } from "./DomainMapper_Impl";
import { PropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { ThemeColorHandler } from "./ThemeColorHandler";
import {
  convertTwipToMm100_Limited as limited,
  convertTwipToMm100_LimitedRoundUp as up,
  convertTwipToMm100_LimitedUnsigned as unsigned,
} from "./ConversionHelper";
import { createWriterDocument } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLPropertyType as T,
  OOXMLValue as V,
} from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode, stringAny } from "../../core/unocore/unocrsrhelper";
import { getEnumAsINT32 } from "../../../../comphelper/source/misc/types";
import {
  FontSlant,
  cppu_detail_getUnoType_FontSlant as slantType,
} from "../../../../offapi/com/sun/star/awt/FontSlant";
import { FontUnderline as U } from "../../../../offapi/com/sun/star/awt/FontUnderline";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { OUString } from "../../../../sal/inc/rtl/ustring";

/** Creates an actual native import ownership chain. @returns Owners. */
function session() {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML);
  return { doc, model, mapper };
}
/** Original native modifier construction. @param id - ID. @param value - Value. @returns Modifier. */
function sprm(id: number, value: V): OOXMLProperty {
  return new OOXMLProperty(id, value, T.SPRM);
}
/** Creates the original nested attribute property set. @param entries - Attribute entries. @returns Value. */
function attrs(entries: readonly (readonly [number, V])[]): V {
  const set = new OOXMLPropertySet();
  for (const [id, value] of entries) set.add(id, value, T.ATTRIBUTE);
  return V.createPropertySet(set);
}
/** Sends original UTF16 stream input. @param mapper - Mapper. @param value - Text. @returns Nothing. */
function send(mapper: DomainMapper, value: string): void {
  mapper.utext(
    Uint16Array.from(
      value.split(""),
      /** Copies one unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Reads a copied map scalar through actual Any extraction. @param map - Property map. @param id - Property. @returns Number or undefined. */
function scalar(map: PropertyMap, id: P): number | undefined {
  const value = map.getProperty(id);
  if (!value) return undefined;
  try {
    const n: [number] = [0];
    if (value[1].extract(n, "double")) return n[0];
    return getEnumAsINT32(value[1]);
  } finally {
    value[1].dispose();
  }
}

it("writes actual formatted and plain runs without leaking previous direct hints, finishing CR via XParagraphAppend", /** Verifies the native graph and actual query API. @returns Nothing. */ () => {
  const { doc, model, mapper } = session();
  mapper.startParagraphGroup();
  mapper.sprm(sprm(N.LN_CT_PPrBase_ind, attrs([[N.LN_CT_Ind_left, V.createInteger(720)]])));
  mapper.startCharacterGroup();
  const properties = new OOXMLPropertySet();
  properties.add(N.LN_EG_RPrBase_b, V.createBoolean(true), T.SPRM);
  properties.add(N.LN_EG_RPrBase_sz, V.createInteger(28), T.SPRM);
  properties.add(N.LN_EG_RPrBase_iCs, V.createBoolean(true), T.SPRM);
  properties.add(
    N.LN_EG_RPrBase_u,
    attrs([
      [N.LN_CT_Underline_val, V.createInteger(N.LN_Value_ST_Underline_double)],
      [N.LN_CT_Underline_color, V.createHex(0x2468ac)],
    ]),
    T.SPRM,
  );
  properties.add(
    N.LN_EG_RPrBase_color,
    attrs([[N.LN_CT_Color_val, V.createHex(0x123456)]]),
    T.SPRM,
  );
  mapper.props(properties);
  send(mapper, "Bold😀");
  mapper.endCharacterGroup();
  mapper.startCharacterGroup();
  send(mapper, " plain");
  mapper.endCharacterGroup();
  send(mapper, "\r");
  mapper.endParagraphGroup();
  mapper.finishDocument();
  expect(
    doc.paragraphs.map(
      /** Reads canonical text. @param p - Node. @returns Text. */ (p) => p.GetText(),
    ),
  ).toEqual(["Bold😀 plain"]);
  expect(doc.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(720);
  const cursor = model.getText().createTextCursor();
  cursor.gotoStart(false);
  cursor.goRight(6, true);
  for (const [name, expected] of [
    ["CharWeight", 150],
    ["CharHeight", 14],
    ["CharWeightAsian", 150],
    ["CharHeightAsian", 14],
    ["CharPostureComplex", 2],
    ["CharUnderline", 2],
    ["CharColor", 0x123456],
    ["CharUnderlineColor", 0x2468ac],
  ] as const) {
    const key = unicode(name),
      any = cursor.getPropertyValue(key);
    key.dispose();
    try {
      const out: [number] = [0];
      if (any.extract(out, "double")) expect(out[0], name).toBe(expected);
      else expect(getEnumAsINT32(any), name).toBe(expected);
    } finally {
      any.dispose();
    }
  }
  cursor.gotoEnd(false);
  cursor.goLeft(5, true);
  const key = unicode("CharWeight"),
    any = cursor.getPropertyValue(key);
  key.dispose();
  try {
    const out: [number] = [0];
    expect(any.extract(out, "double")).toBe(true);
    expect(out[0]).toBe(100);
  } finally {
    any.dispose();
  }
  cursor.dispose();
  mapper.dispose();
  model.dispose();
});

it("retains native script-family independence, false-strike overwrite suppression and 128 inheritance", /** Checks native map values before model insertion. @returns Nothing. */ () => {
  const { mapper } = session();
  mapper.startParagraphGroup();
  mapper.startCharacterGroup();
  const map = mapper.impl.GetTopContext() as PropertyMap;
  mapper.sprm(sprm(N.LN_EG_RPrBase_bCs, V.createBoolean(true)));
  mapper.sprm(sprm(N.LN_EG_RPrBase_i, V.createBoolean(false)));
  mapper.sprm(sprm(N.LN_EG_RPrBase_szCs, V.createInteger(22)));
  expect(scalar(map, P.PROP_CHAR_WEIGHT_COMPLEX)).toBe(150);
  expect(map.isSet(P.PROP_CHAR_WEIGHT)).toBe(false);
  expect(map.isSet(P.PROP_CHAR_HEIGHT_ASIAN)).toBe(false);
  expect(scalar(map, P.PROP_CHAR_HEIGHT_COMPLEX)).toBe(11);
  mapper.sprm(sprm(N.LN_EG_RPrBase_dstrike, V.createBoolean(true)));
  mapper.sprm(sprm(N.LN_EG_RPrBase_strike, V.createBoolean(false)));
  expect(scalar(map, P.PROP_CHAR_STRIKEOUT)).toBe(2);
  mapper.sprm(sprm(N.LN_EG_RPrBase_strike, V.createBoolean(true)));
  mapper.sprm(sprm(N.LN_EG_RPrBase_dstrike, V.createBoolean(false)));
  expect(scalar(map, P.PROP_CHAR_STRIKEOUT)).toBe(1);
  for (const id of [N.LN_EG_RPrBase_b, N.LN_EG_RPrBase_i, N.LN_EG_RPrBase_strike])
    mapper.sprm(sprm(id, V.createInteger(128)));
  expect(map.isSet(P.PROP_CHAR_WEIGHT)).toBe(false);
  expect(scalar(map, P.PROP_CHAR_POSTURE)).toBe(0);
  expect(scalar(map, P.PROP_CHAR_STRIKEOUT)).toBe(1);
  mapper.dispose();
});

it("retains original font attributes, unsupported hAnsi behavior, underline/color and automatic escapement", /** Exercises independent attribute/modifier channels. @returns Nothing. */ () => {
  const { mapper } = session();
  mapper.startParagraphGroup();
  mapper.startCharacterGroup();
  const map = mapper.impl.GetTopContext() as PropertyMap;
  for (const [id, name] of [
    [N.LN_CT_Fonts_ascii, "Western"],
    [N.LN_CT_Fonts_eastAsia, "Asian"],
    [N.LN_CT_Fonts_cs, "Complex"],
    [N.LN_CT_Fonts_hAnsi, "ignored"],
  ] as const) {
    const s = unicode(name);
    mapper.attribute(id, V.createString(s));
    s.dispose();
  }
  for (const [id, name] of [
    [P.PROP_CHAR_FONT_NAME, "Western"],
    [P.PROP_CHAR_FONT_NAME_ASIAN, "Asian"],
    [P.PROP_CHAR_FONT_NAME_COMPLEX, "Complex"],
  ] as const) {
    const pair = map.getProperty(id) as readonly [P, Any],
      s = new OUString();
    try {
      expect(pair[1].extract(s, "OUString")).toBe(true);
      expect(text(s)).toBe(name);
    } finally {
      s.dispose();
      pair[1].dispose();
    }
  }
  mapper.attribute(N.LN_CT_Underline_val, V.createInteger(N.LN_Value_ST_Underline_words));
  expect(scalar(map, P.PROP_CHAR_UNDERLINE)).toBe(U.SINGLE);
  mapper.attribute(N.LN_CT_Underline_val, V.createInteger(N.LN_Value_ST_Underline_single));
  const word = map.getProperty(P.PROP_CHAR_WORD_MODE) as readonly [P, Any];
  try {
    const out: [boolean] = [false];
    expect(word[1].extract(out, "bool")).toBe(true);
    expect(out[0]).toBe(true);
  } finally {
    word[1].dispose();
  }
  mapper.attribute(N.LN_CT_Underline_val, V.createInteger(-99));
  expect(scalar(map, P.PROP_CHAR_UNDERLINE)).toBe(U.NONE);
  for (const [alignment, escape, height] of [
    ["superscript", 14000, 58],
    ["subscript", -14000, 58],
    ["baseline", 0, 100],
  ] as const) {
    const s = unicode(alignment);
    mapper.sprm(sprm(N.LN_EG_RPrBase_vertAlign, V.createString(s)));
    s.dispose();
    expect(scalar(map, P.PROP_CHAR_ESCAPEMENT)).toBe(escape);
    expect(scalar(map, P.PROP_CHAR_ESCAPEMENT_HEIGHT)).toBe(height);
  }
  mapper.dispose();
});

it("retains native paragraph property semantics and limited spacing/indent conversion", /** Checks current non-numbered paragraph mapping against source boundaries. @returns Nothing. */ () => {
  const { mapper } = session();
  mapper.attribute(N.LN_CT_Ind_left, V.createInteger(1));
  mapper.sprm(sprm(N.LN_CT_PPrBase_keepLines, V.createBoolean(true)));
  mapper.startParagraphGroup();
  const map = mapper.impl.GetTopContext() as PropertyMap;
  for (const id of [
    N.LN_CT_Ind_left,
    N.LN_CT_Ind_start,
    N.LN_CT_Ind_right,
    N.LN_CT_Ind_end,
    N.LN_CT_Ind_firstLine,
  ])
    mapper.attribute(id, V.createInteger(720));
  mapper.attribute(N.LN_CT_Ind_hanging, V.createInteger(360));
  expect(scalar(map, P.PROP_PARA_FIRST_LINE_INDENT)).toBe(-635);
  mapper.attribute(N.LN_CT_Spacing_before, V.createInteger(120));
  mapper.attribute(N.LN_CT_Spacing_before, V.createInteger(240));
  mapper.attribute(N.LN_CT_Spacing_after, V.createInteger(32768));
  expect(scalar(map, P.PROP_PARA_TOP_MARGIN)).toBe(212);
  expect(scalar(map, P.PROP_PARA_BOTTOM_MARGIN)).toBe(0);
  mapper.sprm(sprm(N.LN_CT_PPrBase_pageBreakBefore, V.createBoolean(true)));
  mapper.sprm(sprm(N.LN_CT_PPrBase_pageBreakBefore, V.createBoolean(false)));
  expect(scalar(map, P.PROP_BREAK_TYPE)).toBe(4);
  for (const id of [
    N.LN_CT_PPrBase_keepLines,
    N.LN_CT_PPrBase_keepNext,
    N.LN_CT_PPrBase_widowControl,
    N.LN_CT_PPrBase_contextualSpacing,
  ]) {
    mapper.sprm(sprm(id, V.createBoolean(true)));
    mapper.sprm(sprm(id, V.createBoolean(false)));
  }
  expect(scalar(map, P.PROP_PARA_ORPHANS)).toBe(0);
  expect(scalar(map, P.PROP_PARA_WIDOWS)).toBe(0);
  for (const [id, expected, last] of [
    [N.LN_Value_ST_Jc_center, 3, 0],
    [N.LN_Value_ST_Jc_right, 6, 0],
    [N.LN_Value_ST_Jc_end, 6, 0],
    [N.LN_Value_ST_Jc_both, 2, 0],
    [N.LN_Value_ST_Jc_distribute, 2, 2],
    [-1, 5, 0],
  ] as const) {
    mapper.sprm(sprm(N.LN_CT_PPrBase_jc, V.createInteger(id)));
    expect(scalar(map, P.PROP_PARA_ADJUST)).toBe(expected);
    expect(scalar(map, P.PROP_PARA_LAST_LINE_ADJUST)).toBe(last);
  }
  mapper.dispose();
});

it("retains native positive-limit asymmetry and float upward versus integral unit rounding", /** Tests source arithmetic independent of the mapper. @returns Nothing. */ () => {
  expect(limited(1440)).toBe(2540);
  expect(limited(32768)).toBe(0);
  expect(limited(-1440)).toBe(-2540);
  expect(unsigned(-1)).toBe(0);
  expect(unsigned(1440)).toBe(2540);
  expect(unsigned(32768)).toBe(0);
  expect(up(1)).toBe(2);
  expect(up(-1)).toBe(-1);
  expect(up(32768)).toBe(0);
});

it("retains native color receiver defaults and reference context lifetime", /** Covers shared style maps and actual body paragraph disposal. @returns Nothing. */ () => {
  const { model } = session(),
    impl = new DomainMapper_Impl(model, SourceDocumentType.OOXML),
    shared = new PropertyMap();
  expect(impl.GetTopContext()).toBeNull();
  expect(impl.GetTopContextOfType(C.CONTEXT_CHARACTER)).toBeNull();
  impl.RemoveLastParagraph();
  impl.PushStyleProperties(shared);
  impl.PushProperties(C.CONTEXT_CHARACTER);
  expect(impl.GetTopContextOfType(C.CONTEXT_STYLESHEET)).toBe(shared);
  impl.PopProperties(C.CONTEXT_CHARACTER);
  impl.PopProperties(C.CONTEXT_STYLESHEET);
  shared.InsertProps(null);
  expect(
    /** Enforces actual context nesting precondition. @returns Nothing or throws. */ () =>
      impl.PopProperties(C.CONTEXT_CHARACTER),
  ).toThrow("nesting");
  impl.PushProperties(C.CONTEXT_PARAGRAPH);
  expect(
    /** Rejects mismatched original stream grouping. @returns Nothing or throws. */ () =>
      impl.PopProperties(C.CONTEXT_CHARACTER),
  ).toThrow("nesting");
  const s = unicode("kept");
  impl.appendTextPortion(s, null);
  s.dispose();
  impl.finishParagraph(null);
  const tail = unicode("tail");
  impl.appendTextPortion(tail, null);
  tail.dispose();
  impl.RemoveLastParagraph();
  expect(model.GetDoc().paragraphs).toHaveLength(2);
  impl.dispose();
  shared.dispose();
  const color = new ThemeColorHandler();
  expect([color.mnColor, color.mnIndex, color.mnTint, color.mnShade]).toEqual([0, -1, 0, 0]);
  for (const [id, value] of [
    [N.LN_CT_Color_val, 10],
    [N.LN_CT_Color_themeColor, 11],
    [N.LN_CT_Color_themeTint, 12],
    [N.LN_CT_Color_themeShade, 13],
    [-1, 99],
  ] as const)
    color.attribute(id, V.createInteger(value));
  color.sprm(sprm(1, V.createInteger(8)));
  expect([color.mnColor, color.mnIndex, color.mnTint, color.mnShade]).toEqual([10, 11, 12, 13]);
});

it("uses native enum extraction and typed illegal-argument failure", /** Verifies shared utility exception fields, not V8 Error stand-ins. @returns Nothing. */ () => {
  const enumValue = new Any([FontSlant.ITALIC], slantType),
    numeric = new Any([42], "sal_Int32"),
    invalid = stringAny("bad");
  try {
    expect(getEnumAsINT32(enumValue)).toBe(2);
    expect(getEnumAsINT32(numeric)).toBe(42);
    let caught: unknown;
    try {
      getEnumAsINT32(invalid);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(IllegalArgumentException);
    expect((caught as IllegalArgumentException).ArgumentPosition).toBe(-1);
    expect(text((caught as IllegalArgumentException).Message)).toBe("enum2int failed");
  } finally {
    enumValue.dispose();
    numeric.dispose();
    invalid.dispose();
  }
});

it("retains native underline token variants, highlight colors, false weights and nullable modifiers", /** Resolves the source token matrix through actual property maps. @returns Nothing. */ () => {
  const { model, mapper } = session();
  mapper.startParagraphGroup();
  mapper.startCharacterGroup();
  const map = mapper.impl.GetTopContext() as PropertyMap;
  for (const [token, underline] of [
    [N.LN_Value_ST_Underline_none, U.NONE],
    [N.LN_Value_ST_Underline_single, U.SINGLE],
    [N.LN_Value_ST_Underline_double, U.DOUBLE],
    [N.LN_Value_ST_Underline_dotted, U.DOTTED],
    [N.LN_Value_ST_Underline_dash, U.DASH],
    [N.LN_Value_ST_Underline_dotDash, U.DASHDOT],
    [N.LN_Value_ST_Underline_dotDotDash, U.DASHDOTDOT],
    [N.LN_Value_ST_Underline_thick, U.BOLD],
    [N.LN_Value_ST_Underline_wave, U.WAVE],
    [N.LN_Value_ST_Underline_dottedHeavy, U.BOLDDOTTED],
    [N.LN_Value_ST_Underline_dashedHeavy, U.BOLDDASH],
    [N.LN_Value_ST_Underline_dashLong, U.LONGDASH],
    [N.LN_Value_ST_Underline_dashLongHeavy, U.BOLDLONGDASH],
    [N.LN_Value_ST_Underline_dashDotHeavy, U.BOLDDASHDOT],
    [N.LN_Value_ST_Underline_dashDotDotHeavy, U.BOLDDASHDOTDOT],
    [N.LN_Value_ST_Underline_wavyHeavy, U.BOLDWAVE],
    [N.LN_Value_ST_Underline_wavyDouble, U.DOUBLEWAVE],
  ] as const) {
    mapper.attribute(N.LN_CT_Underline_val, V.createInteger(token));
    expect(scalar(map, P.PROP_CHAR_UNDERLINE)).toBe(underline);
  }
  for (const [offset, color] of [
    0x000000, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
    0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0, -1,
  ].entries()) {
    mapper.sprm(
      sprm(N.LN_EG_RPrBase_highlight, V.createInteger(N.LN_Value_ST_HighlightColor_black + offset)),
    );
    expect(scalar(map, P.PROP_CHAR_HIGHLIGHT)).toBe(color);
  }
  mapper.sprm(sprm(N.LN_EG_RPrBase_highlight, V.createInteger(-1)));
  expect(scalar(map, P.PROP_CHAR_HIGHLIGHT)).toBe(-1);
  mapper.sprm(sprm(N.LN_EG_RPrBase_b, V.createBoolean(false)));
  expect(scalar(map, P.PROP_CHAR_WEIGHT)).toBe(100);
  expect(scalar(map, P.PROP_CHAR_WEIGHT_ASIAN)).toBe(100);
  mapper.sprm(sprm(N.LN_EG_RPrBase_i, V.createBoolean(true)));
  expect(scalar(map, P.PROP_CHAR_POSTURE_ASIAN)).toBe(2);
  for (const id of [N.LN_EG_RPrBase_iCs, N.LN_EG_RPrBase_dstrike])
    mapper.sprm(sprm(id, V.createInteger(128)));
  for (const id of [N.LN_EG_RPrBase_color, N.LN_EG_RPrBase_vertAlign, N.LN_EG_RPrBase_rFonts])
    mapper.sprm(sprm(id, new V()));
  expect(scalar(map, P.PROP_CHAR_ESCAPEMENT)).toBe(0);
  mapper.sprm(sprm(N.LN_CT_Style_pPr, attrs([])));
  mapper.sprm(sprm(0, V.createInteger(129)));
  mapper.endCharacterGroup();
  mapper.utext(new Uint16Array([7]));
  mapper.endParagraphGroup();
  mapper.finishDocument();
  expect(model.GetDoc().paragraphs).toHaveLength(1);
  const shared = new PropertyMap();
  mapper.impl.PushStyleProperties(shared); // A borrowed context is never destroyed by mapper context cleanup.
  mapper.dispose();
  shared.dispose();
  model.dispose();
});

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";

it("distinguishes native source profiles for the same numeric highlight payload", /** The exact same integer is an OOXML color token or an RTF RGB value according to the original SourceDocumentType. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc);
  const rtf = new DomainMapper(model, SourceDocumentType.RTF),
    xml = new DomainMapper(model, SourceDocumentType.OOXML);
  try {
    expect(rtf.IsRTFImport()).toBe(true);
    expect(xml.IsOOXMLImport()).toBe(true);
    for (const mapper of [rtf, xml]) {
      mapper.startCharacterGroup();
      mapper.sprm(sprm(N.LN_EG_RPrBase_highlight, V.createInteger(0x123456)));
    }
    const color = rtf.impl.GetTopContext()?.getProperty(P.PROP_CHAR_HIGHLIGHT)?.[1];
    expect(color).toBeDefined();
    const n: [number] = [0];
    try {
      expect(color?.extract(n, "sal_Int32")).toBe(true);
      expect(n[0]).toBe(0x123456);
    } finally {
      color?.dispose();
    }
    expect(xml.impl.GetTopContext()?.getProperty(P.PROP_CHAR_HIGHLIGHT)).toBeUndefined();
    rtf.endCharacterGroup();
    xml.endCharacterGroup();
  } finally {
    rtf.dispose();
    xml.dispose();
    model.dispose();
    doc.Dispose();
  }
});
