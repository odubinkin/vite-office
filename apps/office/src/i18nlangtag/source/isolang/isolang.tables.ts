/** @fileoverview Original ordered language mapping entries and their value operations;no ICU,caches or language-tag facade. */
import data from "./locale-id-tables.json" with { type: "json" };
import { Locale, type LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { toAsciiLowerCase, toAsciiUpperCase } from "../../../sal/inc/rtl/character";
/** Original common mapping fields. */
interface Entry {
  readonly mnLang: number;
  readonly maCountry: string;
  readonly mnOverride: number;
}
/** Original ISO language/country entry. */
export interface IsoLanguageCountryEntry extends Entry {
  readonly maLanguage: string;
}
/** Original script-qualified entry. */
export interface IsoLanguageScriptCountryEntry extends Entry {
  readonly maLanguageScript: string;
}
/** Original full BCP47 entry. */
export interface Bcp47CountryEntry extends Entry {
  readonly mpBcp47: string;
  readonly mpFallback: string;
}
/** Original overloaded entry pointer domain. */
export type TableEntry =
  IsoLanguageCountryEntry | IsoLanguageScriptCountryEntry | Bcp47CountryEntry;
export const aImplIsoLangEntries: readonly IsoLanguageCountryEntry[] = data.iso;
export const aImplIsoLangScriptEntries: readonly IsoLanguageScriptCountryEntry[] = data.script;
export const aImplBcp47CountryEntries: readonly Bcp47CountryEntry[] = data.bcp;
export const aImplPrivateUseEntries: readonly Readonly<{
  mnLang: number;
  mpLanguage: string | null;
}>[] = data.private;
export const countrylessLanguages: readonly number[] = data.countryless;
export const aLastResortFallbackEntry: IsoLanguageCountryEntry = data.lastResort;
/** Extracts logical UTF16 fields,retaining embedded NUL and lone surrogates. @param value - Actual shared string. @returns Logical text. */
export function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Creates the existing actual known-length Unicode value;source table text is ASCII. @param value - Text. @returns Value. */
export function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Native ASCII-only lower transformation via existing SAL character operations;JS replacement leaves other UTF16 units untouched. @param value - Text. @returns ASCII-normalized text. */
export function lower(value: string): string {
  return value.replace(
    /[A-Z]/gu,
    /** Maps an actual ASCII uppercase unit. @param c - Unit. @returns Native folded unit. */ (c) =>
      String.fromCharCode(toAsciiLowerCase(c.charCodeAt(0))),
  );
}
/** Native ASCII-only upper transformation. @param value - Text. @returns ASCII-normalized text. */
export function upper(value: string): string {
  return value.replace(
    /[a-z]/gu,
    /** Maps an actual ASCII lowercase unit. @param c - Unit. @returns Native folded unit. */ (c) =>
      String.fromCharCode(toAsciiUpperCase(c.charCodeAt(0))),
  );
}
/** Native ignore-ASCII-case comparison without Unicode case equivalence. @param left - First view. @param right - Second view. @returns Equality. */
export function equalAscii(left: string, right: string): boolean {
  return lower(left) === lower(right);
}
/** Original override sentinel policy. @param language - Entry ID. @param override - Native override. @returns Selected ID. */
export function getOverrideLang(language: number, override: number): number {
  return override ? (override === 65535 ? language : override) : language;
}
/** Original overloaded entry tag construction. @param entry - Actual table row. @returns Tag text. */
export function getTagString(entry: TableEntry): string {
  if ("mpBcp47" in entry) return entry.mpBcp47;
  const language = "maLanguage" in entry ? entry.maLanguage : entry.maLanguageScript;
  return language + (entry.maCountry ? "-" + entry.maCountry : "");
}
/** Original script-prefix comparison;verified native JS prefix matching follows ASCII-only folding. @param entry - Script row. @param value - Logical tag. @returns Prefix membership. */
export function startsInIgnoreAsciiCase(
  entry: IsoLanguageScriptCountryEntry,
  value: string,
): boolean {
  return lower(value).startsWith(lower(entry.maLanguageScript));
}
/** Original overloaded row Locale construction,without following overrides. @param entry - Table row. @returns Actual shared Locale. */
export function entryLocale(entry: TableEntry): Locale {
  return "maLanguage" in entry
    ? new Locale(unicode(entry.maLanguage), unicode(entry.maCountry), new OUString())
    : new Locale(unicode("qlt"), unicode(entry.maCountry), unicode(getTagString(entry)));
}
/** Source Locale language marker classification is case-sensitive. @param locale - Actual locale. @returns Native qlt marker. */
export function isQualified(locale: LocaleConstReference): boolean {
  return text(locale.Language) === "qlt";
}
