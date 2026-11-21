/** @fileoverview Writer adapter for the named Sfx formal arguments of ExecuteSearch. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SearchOptions2, upgradeSearchAlgorithms } from "../../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import { ABSOLUTE, APPROXIMATE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  LEV_RELAXED,
  NORM_WORD_ONLY,
  REG_NOT_BEGINOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { Locale } from "../../../../udkapi/com/sun/star/lang/Locale";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import type { WriterExecuteSearchArguments, WriterSearchItem } from "./viewsrch";

/** The scalar shape exposed by the browser dispatcher for UNO properties. */
type Property = readonly [name: string, value: unknown];

/** Reads the named browser properties or an actual UNO property sequence in caller order. @param value - Request payload. @returns Named values. */
function* properties(value: object): Iterable<Property> {
  if (!Array.isArray(value)) {
    yield* Object.entries(value);
    return;
  }
  for (const property of value) {
    if (property instanceof PropertyValue) yield [text(property.Name), property.Value];
  }
}

/** Reads a scalar with the native Any extraction rules or the browser scalar projection. @param value - Input value. @param type - Formal numeric, boolean or string type. @returns Extracted value or no value. */
function extract(
  value: unknown,
  type: "bool" | "sal_Int32" | "OUString",
): boolean | number | string | undefined {
  if (value instanceof Any) {
    if (type === "OUString") {
      const string = new OUString();
      return value.extract(string, type) ? text(string) : undefined;
    }
    const scalar: [number | boolean] = [0];
    return value.extract(scalar, type) ? scalar[0] : undefined;
  }
  switch (type) {
    case "bool":
      return typeof value === "boolean" ? value : undefined;
    case "OUString":
      return typeof value === "string" ? value : undefined;
    case "sal_Int32":
      return typeof value === "number" && Number.isInteger(value) && (value | 0) === value
        ? value
        : undefined;
  }
}

/** Projects native SearchItem members into the current Writer search execution owner. @param value - Request from the Sfx dispatcher. @param dialogDefaults - Current Writer dialog preferences. @returns Search request, if converted. */
export function TransformWriterSearchParameters(
  value: unknown,
  dialogDefaults: WriterSearchItem,
): WriterExecuteSearchArguments | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  // The modeless browser dialog already carries the accepted Writer item as one argument.
  if ("SearchItem" in value) return value as WriterExecuteSearchArguments;
  const options = new SearchOptions2(
    LEV_RELAXED,
    new OUString(),
    new OUString(),
    new Locale(),
    2,
    2,
    2,
    TransliterationFlags.IGNORE_CASE |
      TransliterationFlags.IGNORE_WIDTH |
      TransliterationFlags.IGNORE_KASHIDA_CTL,
    ABSOLUTE,
    "\\".charCodeAt(0),
  );
  let command = SvxSearchCmd.FIND;
  let backward = false;
  let pattern = false;
  let asianOptions = false;
  let quiet = false;
  let useAttrItemList = true;
  let converted = false;
  let haveQuiet = false;
  let haveUseAttrItemList = false;
  for (const [name, argument] of properties(value)) {
    switch (name) {
      case "Quiet":
        if (!haveQuiet) quiet = extract(argument, "bool") === true;
        haveQuiet = true;
        break;
      case "UseAttrItemList":
        if (!haveUseAttrItemList) useAttrItemList = extract(argument, "bool") !== false;
        haveUseAttrItemList = true;
        break;
      case "SearchItem.SearchString":
      case "SearchItem.ReplaceString": {
        const field = extract(argument, "OUString");
        converted = typeof field === "string";
        if (typeof field === "string")
          (name === "SearchItem.SearchString"
            ? options.searchString
            : options.replaceString
          ).assign(unicode(field));
        break;
      }
      case "SearchItem.Backward":
      case "SearchItem.Pattern":
      case "SearchItem.AsianOptions":
      case "SearchItem.SearchFormatted": {
        const field = extract(argument, "bool");
        converted = typeof field === "boolean";
        if (typeof field === "boolean") {
          if (name === "SearchItem.Backward") backward = field;
          if (name === "SearchItem.Pattern") pattern = field;
          if (name === "SearchItem.AsianOptions") asianOptions = field;
        }
        break;
      }
      case "SearchItem.Command":
      case "SearchItem.AlgorithmType":
      case "SearchItem.AlgorithmType2":
      case "SearchItem.SearchFlags":
      case "SearchItem.TransliterateFlags":
      case "SearchItem.ChangedChars":
      case "SearchItem.DeletedChars":
      case "SearchItem.InsertedChars":
      case "SearchItem.CellType": {
        const field = extract(argument, "sal_Int32");
        converted = typeof field === "number";
        if (typeof field !== "number") break;
        switch (name) {
          case "SearchItem.Command":
            command = field;
            break;
          case "SearchItem.AlgorithmType":
            options.AlgorithmType2 = upgradeSearchAlgorithms(field);
            break;
          case "SearchItem.AlgorithmType2":
            options.AlgorithmType2 = field;
            break;
          case "SearchItem.SearchFlags":
            options.searchFlag = field;
            break;
          case "SearchItem.TransliterateFlags":
            options.transliterateFlags = field;
            break;
          case "SearchItem.ChangedChars":
            options.changedChars = field;
            break;
          case "SearchItem.DeletedChars":
            options.deletedChars = field;
            break;
          case "SearchItem.InsertedChars":
            options.insertedChars = field;
            break;
        }
        break;
      }
    }
  }
  // TransformParameters keeps the conversion status of the last recognized member.
  if (!converted || command < SvxSearchCmd.FIND || command > SvxSearchCmd.REPLACE_ALL)
    return undefined;
  const search = text(options.searchString),
    replacement = text(options.replaceString);
  const flags = options.transliterateFlags;
  return {
    SearchItem: {
      ...dialogDefaults,
      search,
      replacement,
      command,
      backward,
      matchCase: !(flags & TransliterationFlags.IGNORE_CASE),
      matchDiacritics: !(flags & TransliterationFlags.IGNORE_DIACRITICS_CTL),
      matchKashida: !(flags & TransliterationFlags.IGNORE_KASHIDA_CTL),
      matchCharacterWidth: !(flags & TransliterationFlags.IGNORE_WIDTH),
      useAsianOptions: asianOptions,
      wholeWords: Boolean(options.searchFlag & NORM_WORD_ONLY),
      similaritySearch: options.AlgorithmType2 === APPROXIMATE,
      similarity: {
        changedChars: options.changedChars,
        deletedChars: options.deletedChars,
        insertedChars: options.insertedChars,
        relaxed: Boolean(options.searchFlag & LEV_RELAXED),
      },
      styleSearch: pattern,
      searchStyle: pattern ? search : "",
      replaceStyle: pattern ? replacement : "",
      selection: Boolean(options.searchFlag & REG_NOT_BEGINOFLINE),
      searchOptions: options,
    },
    Quiet: quiet,
    UseAttrItemList: useAttrItemList,
  };
}
