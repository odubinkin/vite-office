/** @fileoverview Original alphabetical-index source flags and collation properties. */
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLIndexSourceBaseContext,
  readIndexSourceFlag,
  type XMLIndexSourceProperties,
} from "./XMLIndexSourceBaseContext";

/** Original source properties for an alphabetical index. */
export interface XMLIndexAlphabeticalSource extends XMLIndexSourceProperties {
  readonly family: "alphabetical-index";
  readonly mainEntryStyle: string;
  readonly ignoreCase: boolean;
  readonly separators: boolean;
  readonly combineEntries: boolean;
  readonly combineWithDash: boolean;
  readonly useKeysAsEntries: boolean;
  readonly combineWithPP: boolean;
  readonly capitalizeEntries: boolean;
  readonly commaSeparated: boolean;
  readonly sortAlgorithm: string;
  readonly language?: number;
}

/** Imports the original index sort and formatting descriptor, independent of its cached contents. */
export class XMLIndexAlphabeticalSourceContext extends XMLIndexSourceBaseContext {
  /** Binds the native descriptor sink and common source properties. @param attributes - Alphabetical index source. @param levels - Native paragraph levels. @param publish - Connected descriptor. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    levels: number,
    private readonly publish: (source: XMLIndexAlphabeticalSource) => void,
  ) {
    super(attributes, "alphabetical-index", levels);
  }

  /** Applies the source-equivalent flags and original ODF language fields. @returns Nothing. */
  public override endFastElement(): void {
    const a = this.attributes;
    this.publish({
      ...this.GetSource(),
      family: "alphabetical-index",
      mainEntryStyle: a.get(XMLToken.TEXT_MAIN_ENTRY_STYLE_NAME) ?? "",
      ignoreCase: readIndexSourceFlag(a, XMLToken.TEXT_IGNORE_CASE),
      separators: readIndexSourceFlag(a, XMLToken.TEXT_ALPHABETICAL_SEPARATORS),
      combineEntries: readIndexSourceFlag(a, XMLToken.TEXT_COMBINE_ENTRIES, true),
      combineWithDash: readIndexSourceFlag(a, XMLToken.TEXT_COMBINE_ENTRIES_WITH_DASH),
      useKeysAsEntries: readIndexSourceFlag(a, XMLToken.TEXT_USE_KEYS_AS_ENTRIES),
      combineWithPP: readIndexSourceFlag(a, XMLToken.TEXT_COMBINE_ENTRIES_WITH_PP, true),
      capitalizeEntries: readIndexSourceFlag(a, XMLToken.TEXT_CAPITALIZE_ENTRIES),
      commaSeparated: readIndexSourceFlag(a, XMLToken.TEXT_COMMA_SEPARATED),
      sortAlgorithm: a.get(XMLToken.TEXT_SORT_ALGORITHM) ?? "",
      ...this.readLanguage(),
    });
  }

  /** Reads the original RFC tag and separate language, script and country attributes. @returns Optional source language. */
  private readLanguage(): { language?: number } {
    const a = this.attributes;
    const rfc = unicode(a.get(XMLToken.STYLE_RFC_LANGUAGE_TAG) ?? "");
    const language = unicode(a.get(XMLToken.FO_LANGUAGE) ?? "");
    const script = unicode(a.get(XMLToken.FO_SCRIPT) ?? "");
    const country = unicode(a.get(XMLToken.FO_COUNTRY) ?? "");
    try {
      if (rfc.isEmpty() && language.isEmpty() && script.isEmpty() && country.isEmpty()) return {};
      const tag = new LanguageTag(rfc, language, script, country);
      try {
        return { language: LanguageTag.convertToLanguageType(tag.getLocale(false)) };
      } finally {
        tag.dispose();
      }
    } finally {
      country.dispose();
      script.dispose();
      language.dispose();
      rfc.dispose();
    }
  }
}
