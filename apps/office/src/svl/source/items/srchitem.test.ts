/** @fileoverview Verifies original scalar and aggregate SvxSearchItem value semantics. */
import { expect, it } from "vitest";
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
