/** @fileoverview Native paragraph/stylesheet/table property-map ownership, exact frame defaults/reset and independent table-value merge semantics on actual Writer contexts. */
import { expect, it } from "vitest";
import {
  ParagraphProperties,
  ParagraphPropertiesPropertyMap,
  ParagraphPropertyMap,
  StyleSheetPropertyMap,
  TablePropertyMap,
  TablePropertyMapTarget as T,
  PropertyMap,
  WW_OUTLINE_MAX,
  WW_OUTLINE_MIN,
} from "./PropertyMap";
import { StyleSheetEntry } from "./StyleSheetTable";
import { DomainMapper_Impl, ContextType as C } from "./DomainMapper_Impl";
import { SwDoc } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WrapTextMode as W } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { PropertyIds as P } from "./PropertyIds";
import { text, unicode } from "../../core/unocore/unocrsrhelper";

/** Reads all original frame fields without a browser projection or synthesized defaults. @param value - Actual native state. @returns Original fields in declaration order. */
function frame(value: ParagraphProperties) {
  return [
    value.IsFrameMode(),
    value.GetDropCap(),
    value.GetLines(),
    value.Getw(),
    value.Geth(),
    value.GetWrap(),
    value.GethAnchor(),
    value.GetvAnchor(),
    value.Getx(),
    value.IsxValid(),
    value.Gety(),
    value.IsyValid(),
    value.GethSpace(),
    value.GetvSpace(),
    value.GethRule(),
    value.GetxAlign(),
    value.GetyAlign(),
    value.GetDropCapLength(),
  ];
}
/** Stores one actual Any in a map and releases its caller-owned temporary. @param map - Map. @param id - Property. @param value - Value. @returns Nothing. */
function insert(map: PropertyMap, id: P, value: number): void {
  const any = new Any([value], "sal_Int32");
  try {
    map.Insert(id, any);
  } finally {
    any.dispose();
  }
}

it("keeps native frame defaults including the wrap sentinel and separates list/name/range lifetime from frame reset", /** Uses actual live Writer ranges and native Unicode field assignment. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    start = model.getText().getStart(),
    end = model.getText().getEnd(),
    value = new ParagraphProperties();
  const defaults = [
    false,
    91935,
    0,
    -1,
    -1,
    2147483647,
    -1,
    -1,
    -1,
    false,
    -1,
    false,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
  ];
  expect(frame(value)).toEqual(defaults);
  expect(value.GetListId()).toBe(-1);
  expect(text(value.GetParaStyleName())).toBe("");
  expect(text(value.GetParaId())).toBe("");
  expect(value.GetStartingRange()).toBeNull();
  expect(value.GetEndingRange()).toBeNull();
  value.SetFrameMode();
  value.SetDropCap(91934);
  value.SetLines(3);
  value.Setw(1200);
  value.Seth(600);
  value.SetWrap(W.DYNAMIC);
  value.SethAnchor(1);
  value.SetvAnchor(2);
  value.Setx(-1);
  value.Sety(-1);
  value.SethSpace(30);
  value.SetvSpace(40);
  value.SethRule(3);
  value.SetxAlign(4);
  value.SetyAlign(5);
  value.SetDropCapLength(255);
  expect(frame(value)).toEqual([
    true,
    91934,
    3,
    1200,
    600,
    3,
    1,
    2,
    -1,
    true,
    -1,
    true,
    30,
    40,
    3,
    4,
    5,
    -1,
  ]);
  value.SetListId(12);
  value.SetStartingRange(start);
  value.SetEndingRange(end);
  const name = unicode("Body😀"),
    id = unicode("00AB12"),
    borrowed = value.GetParaStyleName();
  value.SetParaStyleName(name);
  value.SetParaId(id);
  name.assign(id);
  name.dispose();
  id.dispose();
  expect(value.GetParaStyleName()).toBe(borrowed);
  expect(text(borrowed)).toBe("Body😀");
  const copy = new ParagraphProperties(value);
  expect(frame(copy)).toEqual(frame(value));
  expect(copy.GetStartingRange()).toBe(start);
  expect(copy.GetEndingRange()).toBe(end);
  expect(copy.GetParaStyleName()).not.toBe(borrowed);
  expect(text(copy.GetParaStyleName())).toBe("Body😀");
  value.ResetFrameProperties();
  expect(frame(value)).toEqual(defaults);
  expect([value.GetListId(), text(value.GetParaStyleName()), text(value.GetParaId())]).toEqual([
    12,
    "Body😀",
    "00AB12",
  ]);
  expect(value.GetStartingRange()).toBe(start);
  expect(value.GetEndingRange()).toBe(end);
  expect(start.GetDoc()).toBe(doc);
  expect(end.GetDoc()).toBe(doc);
  copy.SetFrameMode(false);
  copy.assign(value);
  expect(frame(copy)).toEqual(defaults);
  expect(copy.GetListId()).toBe(12);
  copy.assign(copy);
  expect(frame(copy)).toEqual(defaults);
  copy.SetStartingRange(null);
  copy.SetEndingRange(null);
  expect(copy.GetStartingRange()).toBeNull();
  expect(copy.GetEndingRange()).toBeNull();
  value.dispose();
  copy.dispose();
  start.dispose();
  end.dispose();
  model.dispose();
  doc.Dispose();
});

it("uses native derived property owners for actual paragraph contexts and style entries without sharing components", /** Refactors the real producer rather than constructing a test-only owner graph. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper_Impl(model, SourceDocumentType.OOXML),
    entry = new StyleSheetEntry();
  const paragraph = mapper.PushProperties(C.CONTEXT_PARAGRAPH);
  expect(paragraph).toBeInstanceOf(ParagraphPropertyMap);
  expect(paragraph).toBeInstanceOf(ParagraphPropertiesPropertyMap);
  const para = paragraph as ParagraphPropertyMap;
  expect(para.props()).toBe(para.props());
  expect(entry.m_pProperties).toBeInstanceOf(StyleSheetPropertyMap);
  expect(entry.m_pProperties.props()).not.toBe(para.props());
  para.props().SetListId(9);
  expect(entry.m_pProperties.props().GetListId()).toBe(-1);
  expect([entry.m_pProperties.GetListLevel(), entry.m_pProperties.GetOutlineLevel()]).toEqual([
    -1, -1,
  ]);
  expect([WW_OUTLINE_MIN, WW_OUTLINE_MAX]).toEqual([0, 9]);
  entry.m_pProperties.SetListLevel(65535);
  expect(entry.m_pProperties.GetListLevel()).toBe(-1);
  entry.m_pProperties.SetListLevel(8);
  expect(entry.m_pProperties.GetListLevel()).toBe(8);
  entry.m_pProperties.SetOutlineLevel(9);
  entry.m_pProperties.SetOutlineLevel(10);
  expect(entry.m_pProperties.GetOutlineLevel()).toBe(9);
  entry.m_pProperties.SetOutlineLevel(-2);
  expect(entry.m_pProperties.GetOutlineLevel()).toBe(-2);
  entry.m_pProperties.SetOutlineLevel(65545);
  expect(entry.m_pProperties.GetOutlineLevel()).toBe(9);
  insert(para, P.PROP_CHAR_HEIGHT, 14);
  expect(para.GetPropertyIds()).toEqual([P.PROP_CHAR_HEIGHT]);
  mapper.PopProperties(C.CONTEXT_PARAGRAPH);
  const character = mapper.PushProperties(C.CONTEXT_CHARACTER);
  expect(character).toBeInstanceOf(PropertyMap);
  expect(character).not.toBeInstanceOf(ParagraphPropertiesPropertyMap);
  mapper.PopProperties(C.CONTEXT_CHARACTER);
  entry.dispose();
  mapper.dispose();
  model.dispose();
  doc.Dispose();
});

it("merges all native table-value slots independently of the ordinary map and preserves output cells on unset/out-of-range queries", /** Covers valid zero, both overwrite policies, foreign maps and self merge with actual Any properties. @returns Nothing. */ () => {
  const source = new TablePropertyMap(),
    target = new TablePropertyMap(),
    plain = new PropertyMap(),
    output: [number] = [1234];
  for (let slot = T.TablePropertyMapTarget_START; slot < T.TablePropertyMapTarget_MAX; ++slot) {
    expect(source.getValue(slot, output)).toBe(false);
    expect(output[0]).toBe(1234);
    source.setValue(slot, slot * 10);
    expect(source.getValue(slot, output)).toBe(true);
    expect(output[0]).toBe(slot * 10);
    output[0] = 1234;
  }
  source.setValue(T.TablePropertyMapTarget_MAX, 999);
  expect(source.getValue(T.TablePropertyMapTarget_MAX, output)).toBe(false);
  expect(output[0]).toBe(1234);
  expect(source.getValue(100 as T, output)).toBe(false);
  source.setValue(100 as T, 888);
  target.setValue(T.TABLE_WIDTH, 777);
  target.InsertProps(source, false);
  expect(target.GetPropertyIds()).toEqual([]);
  for (let slot = T.TablePropertyMapTarget_START; slot < T.TablePropertyMapTarget_MAX; ++slot) {
    expect(target.getValue(slot, output)).toBe(true);
    expect(output[0]).toBe(slot === T.TABLE_WIDTH ? 777 : slot * 10);
  }
  source.setValue(T.TABLE_WIDTH, 888);
  target.InsertProps(source);
  expect(target.getValue(T.TABLE_WIDTH, output)).toBe(true);
  expect(output[0]).toBe(888);
  const absent = new TablePropertyMap();
  target.InsertProps(absent);
  target.insertTableProperties(null);
  target.insertTableProperties(plain);
  expect(target.getValue(T.TABLE_WIDTH, output)).toBe(true);
  expect(output[0]).toBe(888);
  insert(source, P.PROP_WIDTH, 40);
  insert(target, P.PROP_WIDTH, 90);
  target.InsertProps(source, false);
  const unchanged = target.getProperty(P.PROP_WIDTH);
  expect(unchanged?.[1].get("sal_Int32")).toBe(90);
  unchanged?.[1].dispose();
  target.InsertProps(target);
  expect(target.getValue(T.TABLE_WIDTH, output)).toBe(true);
  expect(output[0]).toBe(888);
  source.setValue(T.TABLE_WIDTH, -1);
  expect(source.getValue(T.TABLE_WIDTH, output)).toBe(true);
  expect(output[0]).toBe(-1);
  source.dispose();
  target.dispose();
  plain.dispose();
  absent.dispose();
});

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
