/** @fileoverview Native Writer numbering-style pool defaults from DocumentStylePoolManager.cxx. */
import { SvxAdjust } from "../../../../editeng/inc/adjustitem";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwStyleNameMapper } from "./SwStyleNameMapper";
import type { SwDoc } from "./doc";
import { WRITER_MAX_LIST_LEVEL } from "./list";
import { SwNumFormat, SwNumRule, SvxNumType as N } from "./number";
import { GetDefBulletFont } from "./number-bullet";

const arabicPositions = [397, 794, 1191, 1588, 1985, 2381, 2778, 3175, 3572, 3969] as const;
const romanPositions = [754, 1508, 2262, 3016, 3771, 4525, 5279, 6033, 6787, 7541] as const;
const roundBulletPositions = [227, 454, 680, 907, 1134, 1361, 1587, 1814, 2041, 2268] as const;
const dashPositions = [170, 340, 510, 680, 850, 1020, 1191, 1361, 1531, 1701] as const;

/** Native label geometry, retained here in its original twip units. */
interface PoolListLevel {
  readonly kind: N;
  readonly indent: number;
  readonly first: number;
  readonly tab: number;
  readonly suffix?: string;
  readonly right?: boolean;
  readonly bullet?: number;
  readonly start?: number;
  readonly space?: boolean;
}

/** Resolves the source defaults for an alignment-mode list level. @param style - Source list pool index. @param depth - Zero-based list level. @returns Native style defaults. */
function poolLevel(style: number, depth: number): PoolListLevel {
  const roman = romanPositions[depth] ?? 754;
  const round = roundBulletPositions[depth] ?? 227;
  switch (style) {
    case 1: {
      const position = arabicPositions[depth] ?? 397;
      return { kind: N.SVX_NUM_ARABIC, indent: position + 357, first: -397, tab: position };
    }
    case 2: {
      const position = (depth + 1) * 397 + 357;
      return { kind: N.SVX_NUM_CHARS_UPPER_LETTER, indent: position, first: -397, tab: position };
    }
    case 3: {
      const position = (depth + 1) * 397 + 357;
      return { kind: N.SVX_NUM_CHARS_LOWER_LETTER, indent: position, first: -397, tab: position };
    }
    case 4:
      return { kind: N.SVX_NUM_ROMAN_UPPER, indent: roman, first: -174, tab: roman, right: true };
    case 5:
      if (depth === 0)
        return { kind: N.SVX_NUM_ROMAN_LOWER, indent: 754, first: -174, tab: 754, right: true };
      if (depth === 1)
        return { kind: N.SVX_NUM_ROMAN_UPPER, indent: 1508, first: -174, tab: 1508, right: true };
      if (depth === 2)
        return {
          kind: N.SVX_NUM_CHARS_LOWER_LETTER,
          indent: 2262,
          first: -397,
          tab: 2262,
          suffix: ")",
        };
      return {
        kind: N.SVX_NUM_CHAR_SPECIAL,
        indent: 2268 + (depth - 2) * 374,
        first: -374,
        tab: 2268 + (depth - 2) * 374,
        bullet: 0x2022,
        start: depth + 1,
      };
    case 7: {
      const dash = dashPositions[depth] ?? 170;
      return { kind: N.SVX_NUM_CHAR_SPECIAL, indent: dash, first: -170, tab: dash, bullet: 0x2013 };
    }
    case 8: {
      const position = ((depth % 2) + 1) * 227;
      return {
        kind: N.SVX_NUM_CHAR_SPECIAL,
        indent: position,
        first: -227,
        tab: position,
        bullet: depth % 2 ? 0x25a1 : 0x2611,
      };
    }
    case 9:
      return {
        kind: N.SVX_NUM_CHAR_SPECIAL,
        indent: round,
        first: -227,
        tab: round,
        bullet: depth === 0 ? 0x27a2 : depth === 1 ? 0xe006 : 0xe004,
        space: true,
      };
    default:
      return {
        kind: N.SVX_NUM_CHAR_SPECIAL,
        indent: round,
        first: -227,
        tab: round,
        bullet: style === 10 ? 0x2717 : 0x2022,
      };
  }
}

/** Resolves a list style name through the document and lazily materializes the source pool rule. @param doc - Rule owner. @param name - Original style UI name. @returns Existing or newly materialized style. */
export function GetNumRuleFromPool(doc: SwDoc, name: string): SwNumRule | undefined {
  const existing = doc.FindNumRulePtr(name);
  if (existing !== undefined) return existing;
  const names = SwStyleNameMapper.GetNumRuleUINameArray();
  const index = names.indexOf(name);
  if (index <= 0) return undefined;
  const rule = new SwNumRule(name, "label-alignment");
  rule.SetPoolFormatId(SwStyleNameMapper.GetPoolIdFromUIName(name, SwGetPoolIdFromName.NumRule));
  rule.SetAutoRule(false);
  const character = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_NUM_LEVEL);
  for (let depth = 0; depth <= WRITER_MAX_LIST_LEVEL; depth++) {
    const model = poolLevel(index, depth);
    const value = new SwNumFormat();
    value.SetPositionAndSpaceMode("label-alignment");
    value.SetNumberingType(model.kind);
    value.SetCharFormat(character);
    value.SetStart(model.start ?? 1);
    value.SetIncludeUpperLevels(1);
    value.SetNumAdjust(model.right ? SvxAdjust.Right : SvxAdjust.Left);
    value.SetLabelFollowedBy(model.space ? "space" : "listtab");
    value.SetIndentAt(model.indent);
    value.SetFirstLineIndent(model.first);
    value.SetListtabPos(model.tab);
    if (model.bullet === undefined) {
      value.SetListFormat("", model.suffix ?? ".", depth);
    } else {
      if (index === 5) value.SetListFormat("", "", depth);
      value.SetBulletFont(GetDefBulletFont());
      value.SetBulletChar(model.bullet);
    }
    rule.Set(depth, value);
    value.Dispose();
  }
  return doc.AddNumRule(rule);
}

/** Enumerates real named list styles and names in the built-in pseudo family. @param doc - Current document. @returns Source-style UI names in the default collation order. */
export function GetParagraphListStyleNames(doc: SwDoc): readonly string[] {
  return [
    ...new Set([
      ...SwStyleNameMapper.GetNumRuleUINameArray().slice(1),
      ...doc
        .GetNumRuleTable()
        .filter(
          /** Only named, non-outline styles are selectable. @param rule - Actual list rule. @returns Whether advertised. */
          (rule) => !rule.IsAutoRule() && !rule.IsOutlineRule(),
        )
        .map(
          /** Reads the style's native name. @param rule - Actual rule. @returns UI name. */
          (rule) => rule.GetName(),
        ),
    ]),
  ].sort();
}
