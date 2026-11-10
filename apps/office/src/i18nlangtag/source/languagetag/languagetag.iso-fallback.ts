/** @fileoverview Complete original ISO getFallbackStrings branch over its consumed language/country values. */
import { LanguageTag } from "./languagetag.value";
import { text } from "../isolang/isolang.tables";

/** Executes native ISO fallback order,including legacy branches. @param language - Source language value. @param country - Source ISO country value. @param include - Include full tag. @returns Ordered native strings. */
export function getIsoFallbackStrings(
  language: string,
  country: string,
  include: boolean,
): string[] {
  const result: string[] = [];
  if (country) {
    if (include) result.push(language + "-" + country);
    if (language === "zh") {
      if (country === "HK" || country === "MO") result.push("zh-TW");
      else if (country !== "CN") result.push("zh-CN");
      result.push(language);
    } else if (language === "sh")
      result.push("sr-Latn-" + country, "sr-Latn", "sh", "sr-" + country, "sr");
    else if (language === "ca" && country === "XV")
      result.push(...new LanguageTag("ca-ES-valencia").getFallbackStrings(true).map(text));
    else if (language === "ku") {
      if (country === "TR" || country === "SY")
        result.push("kmr-Latn-" + country, "kmr-" + country, "kmr-Latn", "kmr", language);
      else if (country === "IQ" || country === "IR") result.push("ckb-" + country, "ckb");
    } else if (language === "kmr" && (country === "TR" || country === "SY"))
      result.push("ku-Latn-" + country, "ku-" + country, language, "ku");
    else if (language === "ckb" && (country === "IQ" || country === "IR"))
      result.push("ku-Arab-" + country, "ku-" + country, language);
    else result.push(language);
  } else {
    if (include) result.push(language);
    if (language === "sh") result.push("sr-Latn", "sr");
    else if (language === "pli") result.push("pi-Latn", "pi");
  }
  return result;
}
