/** @fileoverview Original writing-mode property handler variants from prhdlfac.cxx. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { WritingMode2 as W } from "../../../offapi/com/sun/star/text/WritingMode2";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLConstantsPropertyHandler } from "./XMLConstantsPropertyHandler";

const aXML_WritingDirection_Enum = [
  ["page", W.PAGE],
  ["lr-tb", W.LR_TB],
  ["rl-tb", W.RL_TB],
  ["tb-rl", W.TB_RL],
  ["tb-lr", W.TB_LR],
  ["bt-lr", W.BT_LR],
  ["lr", W.LR_TB],
  ["rl", W.RL_TB],
  ["tb", W.TB_RL],
  ["tb-rl90", W.TB_RL90],
] as const;
const writingModeWithDefault = new XMLConstantsPropertyHandler(aXML_WritingDirection_Enum, "page");
const writingMode = new XMLConstantsPropertyHandler(aXML_WritingDirection_Enum.slice(1), "lr-tb");
const converter = new SvXMLUnitConverter("twip");

/** Reads the original direction or no authored value. @param token - Original ODF value. @param withDefault - Selects the property handler that accepts the page mode. @returns Native WritingMode2 value. */
export function importWritingDirection(token: string, withDefault = true): number | undefined {
  const value = new Any();
  const handler = withDefault ? writingModeWithDefault : writingMode;
  try {
    const result: [number] = [0];
    return handler.importXML(token, value, converter) && value.extract(result, "sal_Int16")
      ? result[0]
      : undefined;
  } finally {
    value.dispose();
  }
}

/** Writes the original canonical token. @param mode - Native WritingMode2 value. @param withDefault - Selects the page fallback in place of the implicit left-to-right direction. @returns ODF token. */
export function exportWritingDirection(mode: number, withDefault = true): string {
  const value = new Any([mode], "sal_Int32");
  const handler = withDefault ? writingModeWithDefault : writingMode;
  try {
    const result: [string] = [""];
    handler.exportXML(result, value, converter);
    return result[0];
  } finally {
    value.dispose();
  }
}
