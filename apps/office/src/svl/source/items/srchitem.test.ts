/** @fileoverview Verifies original scalar and aggregate SvxSearchItem value semantics. */
import { expect, it } from "vitest";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  cppu_detail_getUnoType_PropertyValue as propertyType,
  PropertyValue,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  cppu_detail_getUnoType_SearchOptions2 as optionsType,
  SearchOptions2,
} from "../../../offapi/com/sun/star/util/SearchOptions2";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { LANGUAGE_NONE } from "../../../i18nlangtag/inc/lang";
import { SearchAlgorithms } from "../../../offapi/com/sun/star/util/SearchAlgorithms";
import { ABSOLUTE, WILDCARD } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { NORM_WORD_ONLY, REG_NOT_BEGINOFLINE } from "../../../offapi/com/sun/star/util/SearchFlags";
import * as MID from "../../inc/memberid";
import { CONVERT_TWIPS } from "../../inc/poolitem";
import { SvxSearchCmd } from "../../inc/srchitem";
import { SvxSearchItem } from "./srchitem";

it("copies native option state while preserving search equality", /** Checks defaults, wire-width extraction, locale and independent options. @returns Nothing. */ () => {
  const item = new SvxSearchItem(10291);
  expect(item.GetSearchOptions()).toMatchObject({
    changedChars: 2,
    deletedChars: 2,
    insertedChars: 2,
    AlgorithmType2: ABSOLUTE,
    WildcardEscapeCharacter: 92,
  });
  expect(item.QueryValue(MID.MID_SEARCH_LOCALE)).toBe(LANGUAGE_NONE);
  expect(item.PutValue(new Any([1033], "sal_Int16"), MID.MID_SEARCH_LOCALE)).toBe(true);
  expect(item.QueryValue(MID.MID_SEARCH_LOCALE)).toBe(1033);
  expect(item.PutValue(WILDCARD, MID.MID_SEARCH_ALGORITHMTYPE2 | CONVERT_TWIPS)).toBe(true);
  expect(item.QueryValue(MID.MID_SEARCH_ALGORITHMTYPE)).toBe(SearchAlgorithms.ABSOLUTE);
  expect(item.PutValue(NORM_WORD_ONLY | REG_NOT_BEGINOFLINE, MID.MID_SEARCH_FLAGS)).toBe(true);
  expect(item.GetSelection()).toBe(true);
  const clone = item.Clone();
  expect(clone.Which()).toBe(item.Which());
  clone.PutValue(77, MID.MID_SEARCH_STARTPOINTX);
  clone.PutValue(LANGUAGE_NONE, MID.MID_SEARCH_LOCALE);
  expect(clone.HasStartPoint()).toBe(true);
  expect(clone.QueryValue(MID.MID_SEARCH_STARTPOINTX)).toBeUndefined();
  expect(item.HasStartPoint()).toBe(false);
  expect(clone.equals(item)).toBe(true);
  clone.SetNotes(true);
  expect(clone.equals(item)).toBe(false);
  clone.SetNotes(false);
  clone.PutValue("new", MID.MID_SEARCH_REPLACESTRING);
  clone.PutValue(SvxSearchCmd.REPLACE, MID.MID_SEARCH_COMMAND);
  expect(clone.equalsIgnoring(item, true, true)).toBe(true);
  expect(clone.equalsIgnoring(item, true, false)).toBe(false);
  expect(clone.equalsIgnoring(item, false, true)).toBe(false);
});

it("requires thirteen distinct converted aggregate names while retaining partial writes", /** Tests native sequence order and the failed conversion side effects. @returns Nothing. */ () => {
  const source = SvxSearchItem.CreateDefault();
  source.PutValue("cats", MID.MID_SEARCH_SEARCHSTRING);
  source.PutValue(true, MID.MID_SEARCH_BACKWARD);
  const properties = source.QueryValue() as { Name: string; Value: unknown }[];
  expect(
    properties.map(
      /** Reads one aggregate property name. @param property - Property record. @returns Name. */
      (property) => property.Name,
    ),
  ).toEqual([
    "Options",
    "Family",
    "Command",
    "CellType",
    "AppFlag",
    "RowDirection",
    "AllTables",
    "SearchFiltered",
    "SearchFormatted",
    "Backward",
    "Pattern",
    "Content",
    "AsianOptions",
  ]);
  const target = SvxSearchItem.CreateDefault();
  expect(target.PutValue(properties.slice(1), 0)).toBe(false);
  expect(target.equals(source)).toBe(false);
  expect(target.PutValue([...properties.slice(0, 12), properties[1]], 0)).toBe(false);
  expect(target.QueryValue(MID.MID_SEARCH_BACKWARD)).toBe(true);
  expect(target.equals(source)).toBe(true);
  expect(target.PutValue(properties, 0)).toBe(true);
});

it("round-trips the native Any sequence and preserves the extended UNO type", /** Exercises genuine struct inheritance, member types, sequence extraction and value independence. @returns Nothing. */ () => {
  const item = SvxSearchItem.CreateDefault();
  item.PutValue("a\0😀", MID.MID_SEARCH_SEARCHSTRING);
  item.PutValue("new", MID.MID_SEARCH_REPLACESTRING);
  item.PutValue(WILDCARD, MID.MID_SEARCH_ALGORITHMTYPE2);
  item.PutValue(1033, MID.MID_SEARCH_LOCALE);
  item.PutValue(-2147483648, MID.MID_SEARCH_TRANSLITERATEFLAGS);
  const output = new Any();
  expect(item.QueryValue(output)).toBe(true);
  expect(output.getValueTypeClass()).toBe(TypeClass.SEQUENCE);
  const Properties = Sequence.specialize<{ get(offset: number): unknown }>(propertyType, 48);
  const properties = new Properties();
  expect(output.extract(properties.getAddress(), ["Sequence", propertyType])).toBe(true);
  expect(properties.getLength()).toBe(13);
  const optionsValue = new PropertyValue(PropertyValue.unacquired(properties.operatorIndex(0)));
  const options = new SearchOptions2();
  expect(optionsValue.Value.extract(options, optionsType)).toBe(true);
  expect(options).toMatchObject({
    algorithmType: SearchAlgorithms.ABSOLUTE,
    AlgorithmType2: WILDCARD,
    WildcardEscapeCharacter: 92,
    transliterateFlags: -2147483648,
  });
  expect(options.searchString.getLength()).toBe(4);
  expect(options.Locale.Language.getLength()).toBe(2);
  const clone = SvxSearchItem.CreateDefault();
  expect(clone.PutValue(output, 0)).toBe(true);
  expect(clone.equals(item)).toBe(true);
  item.PutValue("changed", MID.MID_SEARCH_SEARCHSTRING);
  expect(clone.GetSearchOptions().searchString.equals(options.searchString)).toBe(true);
  expect(clone.QueryValue(MID.MID_SEARCH_LOCALE)).toBe(1033);
  expect(clone.QueryValue(output, MID.MID_SEARCH_ALGORITHMTYPE2)).toBe(true);
  expect(output.getValueTypeClass()).toBe(TypeClass.SHORT);
  expect(clone.QueryValue(output, MID.MID_SEARCH_STARTPOINTX)).toBe(false);
  const algorithm: [number] = [0];
  expect(output.extract(algorithm, "sal_Int16")).toBe(true);
  expect(algorithm).toEqual([WILDCARD]);
  optionsValue.dispose();
  properties.dispose();
  output.dispose();
});
