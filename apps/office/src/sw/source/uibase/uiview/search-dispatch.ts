/** @fileoverview Writer adapter for the named Sfx formal arguments of ExecuteSearch. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import { APPROXIMATE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { LEV_RELAXED, NORM_WORD_ONLY } from "../../../../offapi/com/sun/star/util/SearchFlags";
import * as MID from "../../../../svl/inc/memberid";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { SvxSearchItem } from "../../../../svl/source/items/srchitem";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterSlotId } from "../../../sdi/swriter";
import { text } from "../../core/unocore/unocrsrhelper";
import type {
  WriterExecuteSearchArguments,
  WriterSearchItem,
  WriterSearchSlotItem,
} from "./viewsrch";

const searchMembers = new Map<string, number>([
  ["StyleFamily", MID.MID_SEARCH_STYLEFAMILY],
  ["CellType", MID.MID_SEARCH_CELLTYPE],
  ["RowDirection", MID.MID_SEARCH_ROWDIRECTION],
  ["AllTables", MID.MID_SEARCH_ALLTABLES],
  ["SearchFiltered", MID.MID_SEARCH_SEARCHFILTERED],
  ["Backward", MID.MID_SEARCH_BACKWARD],
  ["Pattern", MID.MID_SEARCH_PATTERN],
  ["Content", MID.MID_SEARCH_CONTENT],
  ["AsianOptions", MID.MID_SEARCH_ASIANOPTIONS],
  ["AlgorithmType", MID.MID_SEARCH_ALGORITHMTYPE],
  ["SearchFlags", MID.MID_SEARCH_FLAGS],
  ["SearchString", MID.MID_SEARCH_SEARCHSTRING],
  ["ReplaceString", MID.MID_SEARCH_REPLACESTRING],
  ["Locale", MID.MID_SEARCH_LOCALE],
  ["ChangedChars", MID.MID_SEARCH_CHANGEDCHARS],
  ["DeletedChars", MID.MID_SEARCH_DELETEDCHARS],
  ["InsertedChars", MID.MID_SEARCH_INSERTEDCHARS],
  ["TransliterateFlags", MID.MID_SEARCH_TRANSLITERATEFLAGS],
  ["Command", MID.MID_SEARCH_COMMAND],
  ["SearchStartPointX", MID.MID_SEARCH_STARTPOINTX],
  ["SearchStartPointY", MID.MID_SEARCH_STARTPOINTY],
  ["SearchFormatted", MID.MID_SEARCH_SEARCHFORMATTED],
  ["AlgorithmType2", MID.MID_SEARCH_ALGORITHMTYPE2],
]);

/** Reads the named browser properties or an actual UNO property sequence in caller order. @param value - Request payload. @returns Named values. */
function* properties(value: object): Iterable<readonly [name: string, value: unknown]> {
  if (!Array.isArray(value)) {
    yield* Object.entries(value);
    return;
  }
  for (const property of value) {
    if (property instanceof PropertyValue) yield [text(property.Name), property.Value];
  }
}

/** Reads the source boolean argument, with fallback when it is absent or unconvertible. @param value - Argument value. @param fallback - Original default. @returns Boolean value. */
function readBool(value: unknown, fallback: boolean): boolean {
  if (value instanceof Any) {
    const output: [boolean] = [fallback];
    return value.extract(output, "bool") ? output[0] : fallback;
  }
  return typeof value === "boolean" ? value : fallback;
}

/** Reconstructs SID_SEARCH_ITEM from its formal arguments, retaining their native order. @param value - Request from Sfx. @param dialogDefaults - Current Writer dialog preferences. @returns Search request if converted. */
export function TransformWriterSearchParameters(
  value: unknown,
  dialogDefaults: WriterSearchItem,
): WriterExecuteSearchArguments | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  if ("SearchItem" in value) {
    const request = value as WriterExecuteSearchArguments;
    if (!Array.isArray(request.SearchItem)) return request;
    const item = new SvxSearchItem(getWriterSlotId(WRITER_COMMAND_IDS.searchProperties));
    const projected =
      item.PutValue(request.SearchItem, 0) && ProjectWriterSearchItem(item, dialogDefaults);
    return projected ? { ...request, SearchItem: projected } : undefined;
  }
  const item = new SvxSearchItem(getWriterSlotId(WRITER_COMMAND_IDS.searchProperties));
  let quiet: boolean | undefined;
  let useAttrItemList: boolean | undefined;
  let converted = false;
  for (const [name, argument] of properties(value)) {
    if (name === "Quiet") quiet ??= readBool(argument, false);
    else if (name === "UseAttrItemList") useAttrItemList ??= readBool(argument, true);
    else if (name.startsWith("SearchItem.")) {
      const member = searchMembers.get(name.slice("SearchItem.".length));
      // TransformParameters retains the result from the last recognized member.
      if (member !== undefined) converted = item.PutValue(argument, member);
    }
  }
  const projected = converted && ProjectWriterSearchItem(item, dialogDefaults);
  return projected
    ? { SearchItem: projected, Quiet: quiet ?? false, UseAttrItemList: useAttrItemList ?? true }
    : undefined;
}

/** Copies a native pooled search item into the represented Writer execution options. @param item - Native search item. @param dialogDefaults - Current Writer dialog preferences. @returns Accepted execution item. */
export function ProjectWriterSearchItem(
  item: SvxSearchItem,
  dialogDefaults: WriterSearchItem,
): WriterSearchSlotItem | undefined {
  const command = item.GetCommand();
  if (command < SvxSearchCmd.FIND || command > SvxSearchCmd.REPLACE_ALL) return undefined;
  const options = item.GetSearchOptions();
  const pattern = item.QueryValue(MID.MID_SEARCH_PATTERN) === true;
  const search = text(options.searchString),
    replacement = text(options.replaceString);
  const flags = options.transliterateFlags;
  return {
    ...dialogDefaults,
    search,
    replacement,
    command,
    backward: item.QueryValue(MID.MID_SEARCH_BACKWARD) === true,
    matchCase: !(flags & TransliterationFlags.IGNORE_CASE),
    matchDiacritics: !(flags & TransliterationFlags.IGNORE_DIACRITICS_CTL),
    matchKashida: !(flags & TransliterationFlags.IGNORE_KASHIDA_CTL),
    matchCharacterWidth: !(flags & TransliterationFlags.IGNORE_WIDTH),
    useAsianOptions: item.QueryValue(MID.MID_SEARCH_ASIANOPTIONS) === true,
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
    selection: item.GetSelection(),
    searchOptions: options,
    searchInNotes: item.GetNotes(),
  };
}
