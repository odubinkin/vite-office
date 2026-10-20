/** @fileoverview Original ordered stylehelper.cxx name conversion and suffix rules;resolved resource values are borrowed explicitly without inventing the native translation/module service. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import * as P from "../../../inc/stylehelper";
import { scStyleNameResourcesEnglish, type ScStyleNameResources } from "../../../inc/globstr";
/** Original map value;each entry owns its real native string handles. */
interface ScDisplayNameMap {
  aDispName: OUString;
  aProgName: OUString;
}
/** Native static maps are initialized lazily per supported family. */
let cellMap: readonly ScDisplayNameMap[] | undefined,
  pageMap: readonly ScDisplayNameMap[] | undefined,
  graphicMap: readonly ScDisplayNameMap[] | undefined;
/** Original exact UTF16 escaping suffix,including its leading space. */
const SC_SUFFIX_USER = " (user)";
/** Constructs original map values and empty sentinel from actual resolved resource data. @param values - Original initializer order. @param resources - Borrowed resolved labels. @returns Owned map. */
function buildMap(
  values: readonly (readonly [keyof ScStyleNameResources, string | OUStringConstReference])[],
  resources: ScStyleNameResources,
): readonly ScDisplayNameMap[] {
  const result = values.map(
    /** Owns native value copies. @param entry - Source initializer. @returns Owned pair. */ ([
      key,
      prog,
    ]) => ({
      aDispName: unicode(resources[key]),
      aProgName: typeof prog === "string" ? unicode(prog) : new OUString(prog),
    }),
  );
  result.push({ aDispName: new OUString(), aProgName: new OUString() });
  return result;
}
/** Original Cell static initializer values in source order. @param resources - Resolved resource input. @returns Owned native values. */
function createCellMap(resources: ScStyleNameResources): readonly ScDisplayNameMap[] {
  return buildMap(
    [
      ["STR_STYLENAME_HEADING", "Heading"],
      ["STR_STYLENAME_HEADING_1", "Heading 1"],
      ["STR_STYLENAME_HEADING_2", "Heading 2"],
      ["STR_STYLENAME_TEXT", "Text"],
      ["STR_STYLENAME_NOTE", "Note"],
      ["STR_STYLENAME_FOOTNOTE", "Footnote"],
      ["STR_STYLENAME_HYPERLINK", "Hyperlink"],
      ["STR_STYLENAME_STATUS", "Status"],
      ["STR_STYLENAME_GOOD", "Good"],
      ["STR_STYLENAME_NEUTRAL", "Neutral"],
      ["STR_STYLENAME_BAD", "Bad"],
      ["STR_STYLENAME_WARNING", "Warning"],
      ["STR_STYLENAME_ERROR", "Error"],
      ["STR_STYLENAME_ACCENT", "Accent"],
      ["STR_STYLENAME_ACCENT_1", "Accent 1"],
      ["STR_STYLENAME_ACCENT_2", "Accent 2"],
      ["STR_STYLENAME_ACCENT_3", "Accent 3"],
      ["STR_STYLENAME_RESULT", "Result"],
      ["STR_STYLENAME_STANDARD", P.SC_STYLE_PROG_STANDARD],
      ["STR_STYLENAME_RESULT", P.SC_STYLE_PROG_RESULT],
      ["STR_STYLENAME_RESULT1", P.SC_STYLE_PROG_RESULT1],
      ["STR_STYLENAME_HEADING", P.SC_STYLE_PROG_HEADING],
      ["STR_STYLENAME_HEADING_1", P.SC_STYLE_PROG_HEADING1],
      ["STR_PIVOT_STYLENAME_INNER", P.SC_PIVOT_STYLE_PROG_INNER],
      ["STR_PIVOT_STYLENAME_RESULT", P.SC_PIVOT_STYLE_PROG_RESULT],
      ["STR_PIVOT_STYLENAME_CATEGORY", P.SC_PIVOT_STYLE_PROG_CATEGORY],
      ["STR_PIVOT_STYLENAME_TITLE", P.SC_PIVOT_STYLE_PROG_TITLE],
      ["STR_PIVOT_STYLENAME_FIELDNAME", P.SC_PIVOT_STYLE_PROG_FIELDNAME],
      ["STR_PIVOT_STYLENAME_TOP", P.SC_PIVOT_STYLE_PROG_TOP],
    ],
    resources,
  );
}
/** Original Page static initializer values in source order. @param resources - Resolved resource input. @returns Owned native values. */
function createPageMap(resources: ScStyleNameResources): readonly ScDisplayNameMap[] {
  return buildMap(
    [
      ["STR_STYLENAME_STANDARD", P.SC_STYLE_PROG_STANDARD],
      ["STR_STYLENAME_REPORT", P.SC_STYLE_PROG_REPORT],
    ],
    resources,
  );
}
/** Original Graphic static initializer values in source order. @param resources - Resolved resource input. @returns Owned native values. */
function createGraphicMap(resources: ScStyleNameResources): readonly ScDisplayNameMap[] {
  return buildMap(
    [
      ["STR_STYLENAME_STANDARD", P.SC_STYLE_PROG_STANDARD],
      ["STR_STYLENAME_NOTE", "Note"],
    ],
    resources,
  );
}
/** Original family selection and lazy native default maps. Alternate resolved resource values are scoped inputs,not a translation service. @param family - Native family. @param resources - Actual resolved values. @returns Native map or null. */
function getStyleNameMap(
  family: SfxStyleFamily,
  resources: ScStyleNameResources,
): readonly ScDisplayNameMap[] | null {
  const temporary = resources !== scStyleNameResourcesEnglish;
  if (family === SfxStyleFamily.Para)
    return temporary ? createCellMap(resources) : (cellMap ??= createCellMap(resources));
  if (family === SfxStyleFamily.Page)
    return temporary ? createPageMap(resources) : (pageMap ??= createPageMap(resources));
  if (family === SfxStyleFamily.Frame)
    return temporary ? createGraphicMap(resources) : (graphicMap ??= createGraphicMap(resources));
  return null;
}
/** Releases only explicitly scoped alternate resource values;default static maps retain native process lifetime. @param map - Borrowed/scoped map. @param resources - Original binding. @returns Nothing. */
function releaseScopedMap(
  map: readonly ScDisplayNameMap[] | null,
  resources: ScStyleNameResources,
): void {
  if (map !== null && resources !== scStyleNameResourcesEnglish)
    for (const entry of map) {
      entry.aDispName.dispose();
      entry.aProgName.dispose();
    }
}
/** Original static conversion owner. Native ScModule/gettext locale/cache initialization remains outside this borrowed resource-value boundary. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ScStyleNameConversion owner.
export class ScStyleNameConversion {
  /** Original ordered display lookup,alias collision and suffix escape. @param name - Native display value. @param family - Source family. @param resources - Optional real resolved resource values;default is the existing English UI resource projection. @returns Independent native return value. */
  static DisplayToProgrammaticName(
    name: OUStringConstReference,
    family: SfxStyleFamily,
    resources: ScStyleNameResources = scStyleNameResourcesEnglish,
  ): OUString {
    let displayIsProgrammatic = false;
    const map = getStyleNameMap(family, resources);
    try {
      if (map !== null) {
        let index = 0;
        do {
          const entry = map[index] as ScDisplayNameMap;
          if (entry.aDispName.equals(name)) return new OUString(entry.aProgName);
          else if (entry.aProgName.equals(name)) displayIsProgrammatic = true;
          index++;
        } while (!(map[index] as ScDisplayNameMap).aDispName.isEmpty());
      }
      const value = text(name);
      return displayIsProgrammatic || value.endsWith(SC_SUFFIX_USER)
        ? unicode(value + SC_SUFFIX_USER)
        : new OUString(name);
    } finally {
      releaseScopedMap(map, resources);
    }
  }
  /** Original suffix-first decoding and ordered programmatic lookup. @param name - Native programmatic value. @param family - Source family. @param resources - Borrowed resolved labels. @returns Independent native return value. */
  static ProgrammaticToDisplayName(
    name: OUStringConstReference,
    family: SfxStyleFamily,
    resources: ScStyleNameResources = scStyleNameResourcesEnglish,
  ): OUString {
    if (text(name).endsWith(SC_SUFFIX_USER))
      return name.copy(0, name.getLength() - SC_SUFFIX_USER.length);
    const map = getStyleNameMap(family, resources);
    try {
      if (map !== null) {
        let index = 0;
        do {
          const entry = map[index] as ScDisplayNameMap;
          if (entry.aProgName.equals(name)) return new OUString(entry.aDispName);
          index++;
        } while (!(map[index] as ScDisplayNameMap).aDispName.isEmpty());
      }
      return new OUString(name);
    } finally {
      releaseScopedMap(map, resources);
    }
  }
}
