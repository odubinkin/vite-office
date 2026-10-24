/** @fileoverview Exact source-backed shared-value edge table extracted without changing existing admissions, guards or neighboring module permissions. */
import path from "node:path";
/** Exact native value imports needed by the consumed SAX/xmloff character-property owners.
 * converter.cxx includes o3tl/numeric.hxx; original xo handlers use Any and postuhdl.cxx uses vcl/unohelp.hxx.
 * Library_xo links cppu/vcl. Neighboring files and browser adapters receive no additional permission.
 */
const originalCharacterValueImports = new Map([
  // Native TabWin_Impl paints Ruler::DrawTab through the svtools owner.
  [
    "cui/browser/tabpages/TabulatorTabPage.tsx",
    new Set(["svtools/browser/control/RulerTabSymbol.tsx", "svtools/inc/ruler.ts"]),
  ],
  // Original absolute FontSizeBox uses vcl::TextToValue/ConvertValue, not an alternate numeric parser.
  ["svtools/source/control/ctrlbox.fontsize.ts", new Set(["vcl/source/control/field.ts"])],
  // Browser toolbox binding borrows actual system decimal fields like original SvtSysLocale; no locale provider is supplied.
  ["svx/browser/tbxctrls/font-size-binding.ts", new Set(["unotools/source/misc/syslocale.ts"])],
  // Original languageoptions.cxx borrows MsLangId and ScriptType scalar contracts; existing host fields supply system resolution.
  [
    "svl/source/config/languageoptions.ts",
    new Set([
      "i18nlangtag/source/isolang/mslangid.ts",
      "i18nlangtag/source/isolang/mslangid.script.ts",
      "i18nlangtag/inc/lang.ts",
      "offapi/com/sun/star/i18n/ScriptType.ts",
    ]),
  ],
  // Original GetWhichOfScript uses actual application locale language in the WEAK branch.
  ["sw/source/core/attr/hints.ts", new Set(["i18nlangtag/source/isolang/mslangid.ts"])],
  // Original layout-absent GetScriptType executes BreakIterator script queries and borrows original language fields.
  [
    "sw/source/core/edit/edattr-script.ts",
    new Set([
      "i18npool/source/breakiterator/breakiteratorImpl.ts",
      "i18nlangtag/source/isolang/mslangid.ts",
      "i18nlangtag/inc/lang.ts",
    ]),
  ],
  // Original page.cxx uses o3tl unit conversion and the Paper enum from paperinf/papersizelistbox headers.
  [
    "cui/source/tabpages/page.ts",
    new Set(["i18nutil/inc/paper.ts", "o3tl/inc/unit_conversion.ts"]),
  ],
  // Original page.hrc and papersizelistbox.hxx use i18nutil/paper.hxx identities.
  ["svx/source/dialog/page.ts", new Set(["i18nutil/inc/paper.ts"])],
  ["svx/source/dialog/papersizelistbox.ts", new Set(["i18nutil/inc/paper.ts"])],
  // Existing explicit document host-locale preparation supplies original paper/measurement queries, not a native LanguageTag substitute.
  ["sw/source/core/layout/pagedesc.ts", new Set(["i18nlangtag/source/isolang/insys.locale.ts"])],
  // The persistent browser binding owns only actual VCL numeric state and source aliases.
  [
    "svtools/browser/control/metric-spin-binding.ts",
    new Set(["vcl/source/weld/MetricSpinButton.ts", "vcl/inc/units.ts"]),
  ],
  // React presentation reads the shared system-locale fields;numeric ownership stays in the binding.
  ["svtools/browser/control/MetricSpinButton.tsx", new Set(["unotools/source/misc/syslocale.ts"])],
  // Original svtools SetFieldUnit borrows the actual VCL metric widget numeric contract.
  [
    "svtools/source/misc/unitconv.ts",
    new Set(["vcl/source/weld/MetricSpinButton.ts", "vcl/source/outdev/map.ts"]),
  ],
  // Actual native popup numeric presentation borrows existing host decimal fields.
  [
    "svx/browser/sidebar/paragraph/ParaLineSpacingControl.tsx",
    new Set(["unotools/source/misc/syslocale.ts", "i18nutil/source/utility/unicode.percent.ts"]),
  ],
  // Original tabstpge.cxx uses the native numeric widget, map conversion, unit helper and SfxTabPage item queries.
  [
    "cui/source/tabpages/tabstpge.ts",
    new Set([
      "vcl/source/weld/MetricSpinButton.ts",
      "vcl/source/outdev/map.ts",
      "svtools/source/misc/unitconv.ts",
      "sfx2/source/dialog/SfxTabPage.ts",
    ]),
  ],
  // Browser field formatting borrows real VCL unit aliases and actual host locale fields only.
  [
    "cui/browser/tabpages/tabstpge-binding.ts",
    new Set([
      "vcl/source/weld/MetricSpinButton.ts",
      "vcl/inc/units.ts",
      "unotools/source/misc/syslocale.ts",
    ]),
  ],
  // Generated MultipleCharsOutputException type initialization uses the original UNO TypeClass value.
  [
    "offapi/com/sun/star/i18n/MultipleCharsOutputException.ts",
    new Set(["udkapi/com/sun/star/uno/TypeClass.ts"]),
  ],

  // Original transliteration headers/cxx use these precise UNO value/type/exception and supportsService contracts.
  [
    "i18npool/source/transliteration/transliteration_commonclass.ts",
    new Set([
      "cppu/inc/com/sun/star/lang/XServiceInfo.ts",
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "cppuhelper/inc/supportsservice.ts",
      "offapi/com/sun/star/i18n/TransliterationModules.ts",
    ]),
  ],
  [
    "i18npool/source/transliteration/transliteration_OneToOne.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/TransliterationType.ts",
    ]),
  ],
  [
    "i18npool/source/transliteration/transliteration_Ignore.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/TransliterationType.ts",
    ]),
  ],
  [
    "i18npool/source/transliteration/transliteration_body.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/MultipleCharsOutputException.ts",
      "offapi/com/sun/star/i18n/TransliterationType.ts",
    ]),
  ],
  [
    "i18npool/source/transliteration/transliteration_caseignore.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/TransliterationModules.ts",
      "offapi/com/sun/star/i18n/TransliterationType.ts",
    ]),
  ],

  // Original ignoreDiacritics_CTL consumes actual UNO Sequence/RuntimeException values.
  [
    "i18npool/source/transliteration/ignoreDiacritics_CTL.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "cppu/inc/com/sun/star/uno/RuntimeException.ts",
    ]),
  ],

  // Original directional and ignore declarations expose actual UNO offset/range Sequence values.
  [
    "i18npool/source/transliteration/fullwidthToHalfwidth.ts",
    new Set([
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/MultipleCharsOutputException.ts",
    ]),
  ],
  [
    "i18npool/source/transliteration/halfwidthToFullwidth.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreKana.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreWidth.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreSize_ja_JP.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],

  // Original contextual folding and locale-data signatures use actual UNO Sequence values.
  [
    "i18npool/source/transliteration/ignoreIandEfollowedByYa_ja_JP.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreKiKuFollowedBySa_ja_JP.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreIterationMark_ja_JP.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  [
    "i18npool/source/transliteration/ignoreProlongedSoundMark_ja_JP.ts",
    new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"]),
  ],
  ["i18npool/source/localedata/localedata.ts", new Set(["cppu/inc/com/sun/star/uno/Sequence.ts"])],

  // Original Parser, ParseManager, xmldata and XcsParser declare/use these XML event/span contracts.
  ["configmgr/source/parser.ts", new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts"])],
  [
    "configmgr/source/parsemanager.ts",
    new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts"]),
  ],
  ["configmgr/source/xmldata.ts", new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts"])],
  [
    "configmgr/source/xcsparser.ts",
    new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts"]),
  ],

  // Original xcuparser.hxx/cxx directly declares the same XmlReader and Span update callbacks.
  [
    "configmgr/source/xcuparser.ts",
    new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts"]),
  ],

  // Original valueparser.hxx/cxx directly owns XmlReader, Span and Pad contracts.
  [
    "configmgr/source/valueparser.ts",
    new Set(["xmlreader/inc/xmlreader.ts", "xmlreader/inc/span.ts", "xmlreader/inc/pad.ts"]),
  ],
  // Native swcrsr.hxx declares Find_Text with i18nutil::SearchOptions2.
  ["sw/source/core/crsr/swcrsr.ts", new Set(["i18nutil/inc/searchopt.ts"])],
  // Native findtxt.cxx consumes i18nutil::SearchOptions2 through its original search contracts.
  ["sw/source/core/crsr/findtxt.ts", new Set(["i18nutil/inc/searchopt.ts"])],
  // Native textsearch.hxx/cxx includes i18nutil/searchopt.hxx and generated util/SearchResult.hpp.
  [
    "unotools/source/i18n/textsearch.ts",
    new Set(["i18nutil/inc/searchopt.ts", "offapi/com/sun/star/util/SearchResult.ts"]),
  ],
  // Native cclass_unicode.cxx calls ICU u_charType and o3tl::iterateCodePoints and uses KCharacterType.hpp.
  [
    "i18npool/source/characterclassification/cclass_unicode.ts",
    new Set([
      "external/icu/source/common/uchar.ts",
      "external/icu/source/common/unicode/uchar.ts",
      "o3tl/inc/string_view.ts",
      "offapi/com/sun/star/i18n/KCharacterType.ts",
    ]),
  ],
  // Native TextSearch uses published util/i18n values and o3tl code-point stepping.
  [
    "i18npool/source/search/textsearch.ts",
    new Set([
      // Original XTextSearch2/XTextSearch signatures and SearchOptions inheritance carry these native values.
      "offapi/com/sun/star/util/SearchAlgorithms.ts",
      "offapi/com/sun/star/util/SearchOptions.ts",
      "offapi/com/sun/star/util/SearchOptions2.ts",
      "offapi/com/sun/star/util/SearchAlgorithms2.ts",
      "offapi/com/sun/star/util/SearchFlags.ts",
      "offapi/com/sun/star/util/SearchResult.ts",
      // Original SearchResult sequence fields expose cppu Sequence mutable scalar addresses.
      "cppu/inc/com/sun/star/uno/Sequence.ts",
      "offapi/com/sun/star/i18n/KCharacterType.ts",
      "o3tl/inc/string_view.ts",
    ]),
  ],
  // Original SearchOptions.idl owns ::com::sun::star::lang::Locale; generated struct fields use Locale value semantics.
  ["offapi/com/sun/star/util/SearchOptions.ts", new Set(["udkapi/com/sun/star/lang/Locale.ts"])],
  // patattr.cxx::fillColor owns and returns actual model::ComplexColor values.
  ["sc/source/core/data/patattr.ts", new Set(["docmodel/inc/color/ComplexColor.ts"])],
  ["sc/browser/presentation/ScGridWindow.tsx", new Set(["docmodel/inc/color/ComplexColor.ts"])],
  // Original sfx2/namedcolor.hxx owns Color/OUString and the docmodel theme/transformation value conversion.
  [
    "sfx2/inc/namedcolor.ts",
    new Set([
      "tools/inc/color.ts",
      "sal/inc/rtl/ustring.ts",
      "docmodel/inc/color/ComplexColor.ts",
      "docmodel/inc/color/Transformation.ts",
      "docmodel/inc/theme/ThemeColorType.ts",
    ]),
  ],
  // The browser binding of ToolboxButtonColorUpdater borrows actual Sfx owners;JS names use the existing UTF16 bridge.
  [
    "svx/browser/tbxctrls/ColorSelect.tsx",
    new Set([
      "sfx2/source/doc/objsh.ts",
      "sfx2/inc/namedcolor.ts",
      "i18nlangtag/source/isolang/isolang.tables.ts",
    ]),
  ],
  // Original mslangid.cxx uses css::i18n::ScriptType from the published API.
  [
    "i18nlangtag/source/isolang/mslangid.script.ts",
    new Set(["offapi/com/sun/star/i18n/ScriptType.ts"]),
  ],
  // Original BreakIteratorImpl includes o3tl/string_view.hxx and the generated i18n ScriptType.hpp.
  [
    "i18npool/source/breakiterator/breakiteratorImpl.ts",
    new Set(["o3tl/inc/string_view.ts", "offapi/com/sun/star/i18n/ScriptType.ts"]),
  ],
  // Browser composition borrows the actual producer for the consumed XBreakIterator port.
  // Native documen6.cxx obtains it via BreakIterator::create;that unported UNO factory is not copied into ScDocument.
  [
    "sc/browser/controller/calc-selection-script.ts",
    new Set(["i18npool/source/breakiterator/breakiteratorImpl.ts"]),
  ],
  [
    "sc/browser/presentation/ScCellText.tsx",
    new Set(["i18npool/source/breakiterator/breakiteratorImpl.ts"]),
  ],
  ["sax/source/tools/converter.ts", new Set(["o3tl/inc/numeric.ts"])],
  ["xmloff/source/style/weighhdl.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  [
    "xmloff/source/style/postuhdl.ts",
    new Set(["cppu/inc/com/sun/star/uno/Any.ts", "vcl/inc/unohelp.ts"]),
  ],
  ["xmloff/source/style/undlihdl.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  // Pinned cdouthdl.cxx includes com/sun/star/uno/Any.hxx and mutates the caller-owned native Any.
  ["xmloff/source/style/cdouthdl.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  // Original shdwdhdl.cxx includes Any.hxx; constants handler also reads the original UNO TypeClass_ENUM payload.
  ["xmloff/source/style/shdwdhdl.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  [
    "xmloff/source/style/escphdl.ts",
    new Set(["cppu/inc/com/sun/star/uno/Any.ts", "editeng/inc/escapementitem.constants.ts"]),
  ],
  [
    "xmloff/source/style/XMLConstantsPropertyHandler.ts",
    new Set(["cppu/inc/com/sun/star/uno/Any.ts", "udkapi/com/sun/star/uno/TypeClass.ts"]),
  ],
  // Original xmlstyle.cxx and txtparae.cxx consume actual UNO Any;only this concrete value type is admitted.
  ["xmloff/source/style/xmlstyle.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  ["xmloff/source/text/txtparae.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  ["xmloff/source/style/xmlbahdl.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
  ["xmloff/source/text/txtprmap.ts", new Set(["cppu/inc/com/sun/star/uno/Any.ts"])],
]);
/** Matches only source-backed value-owner imports,leaving general module/browser/cycle guards unchanged. @param relativeSource - Importing source path. @param relativeTarget - Imported source path. @returns Whether this exact edge is original. */
export function isOriginalCharacterValueImport(relativeSource, relativeTarget) {
  const source = relativeSource.split(path.sep).join("/"),
    normalized = relativeTarget.split(path.sep).join("/"),
    allowed = originalCharacterValueImports.get(source);
  if (/\.tsx?$/u.test(normalized)) return allowed?.has(normalized) ?? false;
  return (allowed?.has(normalized + ".ts") || allowed?.has(normalized + ".tsx")) ?? false;
}
