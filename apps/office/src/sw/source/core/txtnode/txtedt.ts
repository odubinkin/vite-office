/** @fileoverview Ports the ordinary exact/selective whole-paragraph RstTextAttr branches from pinned sw/source/core/txtnode/txtedt.cxx. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_KOREAN } from "../../../../i18nlangtag/inc/lang";
import { ASIAN } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { WORD_COUNT } from "../../../../offapi/com/sun/star/i18n/WordType";
import { u_isUWhiteSpace } from "../../../../external/icu/source/common/uchar";
import {
  CH_TXT_ATR_FIELDEND,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_INPUTFIELDEND,
  CH_TXT_ATR_INPUTFIELDSTART,
  CH_TXTATR_BREAKWORD,
  CH_TXTATR_INWORD,
  RES_CHRATR_HIDDEN,
  RES_TXTATR_ANNOTATION,
  RES_TXTATR_FIELD,
} from "../../../inc/hintids";
import { SvxCharHiddenItem } from "../../../../editeng/inc/charhiddenitem";
import { SwAttrIter } from "../text/itratr";
import { GetWriterTextUnits, g_pBreakIt } from "../bastyp/breakit";
import type { SwDocStat } from "../doc/docstat";
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { DestroyTextNodeAttribute } from "./thints-insert";
import { MakeTextAttr } from "./thints";
import { GetTextResetStyle } from "./txtedt-reset";
import { type SfxItemSet } from "../../../../svl/source/items/itemset";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @param resetSet - Optional native selective deletion set. @returns Nothing. */
export function resetParagraphTextAttributes(
  node: SwTextNode,
  exactRange = false,
  resetSet?: SfxItemSet,
): void {
  node.RstTextAttr(0, node.Len(), 0, resetSet, false, exactRange);
}

/** Performs initial StyleApply's exact full-paragraph hint reset. @param node - Reset text node. @returns Nothing. */
export function resetFullParagraphAutoFormat(node: SwTextNode): void {
  resetParagraphTextAttributes(node, true);
}

/** Applies the original full-node selective hint-item deletion to an independent hint value without changing its node. Uses the same native selection helper as actual mutation for history capture. @param node - Original pool/style owner. @param hints - Original native hint value. @param resetSet - Original selective deletion set. @returns Changed hint value or undefined when no original item participates. */
export function ResetTextNodeHintItems(
  node: SwTextNode,
  hints: SwpHints,
  resetSet: SfxItemSet,
): SwpHints | undefined {
  let changed = false;
  const retained = hints.entries().flatMap(
    /** Computes the identical native selective deletion for an independent history value. @param hint - Original value. @returns Retained value. */
    (hint) => {
      const value = ResetTextHintItem(node, hint, resetSet);
      changed ||= value !== hint;
      return value === undefined ? [] : [value];
    },
  );
  try {
    return changed ? new SwpHints(node.GetDoc().GetAttrPool(), retained) : undefined;
  } finally {
    for (const hint of retained)
      if (!hints.entries().includes(hint)) DestroyTextNodeAttribute(hint);
  }
}

/** Retains the original owner unless a requested item actually participates in selective native deletion. @param node - Original pool owner. @param hint - Actual native attribute. @param resetSet - Requested items. @returns Original, freshly reconstructed,or removed native attribute. */
function ResetTextHintItem(
  node: SwTextNode,
  hint: ReturnType<SwpHints["entries"]>[number],
  resetSet: SfxItemSet,
): ReturnType<SwpHints["entries"]>[number] | undefined {
  const [skip, style] = GetTextResetStyle(node, hint, resetSet, 0);
  try {
    return skip
      ? hint
      : style === undefined
        ? undefined
        : MakeTextAttr(node.GetDoc(), style, hint.GetStart(), hint.GetEnd());
  } finally {
    if (style !== undefined) releaseStyleHandle(style);
  }
}

/** Counts one native paragraph for document statistics after the export redline visibility transition. @param node - Original text owner. @param stat - Current document accumulator. */
export function CountWords(node: SwTextNode, stat: SwDocStat): void {
  ++stat.nAllPara;
  for (let section = node.FindSectionNode(); section;) {
    const data = section.GetSection().GetSectionData();
    if (data.hidden && data.condHidden) return;
    section = section.StartOfSectionNode().FindSectionNode();
  }
  const numbering = node.GetNumString();
  const bullet = !numbering.length && node.HasBullet();
  if (!node.Len() && !numbering.length && !bullet) return;
  const expanded = GetCountedText(node);
  if (!expanded) return;
  ++stat.nPara;
  if (expanded.text.length) CountText(node, expanded.text, stat, undefined, expanded.model);
  if (numbering.length) CountText(node, numbering, stat, node.GetLang(0));
  else if (bullet) {
    ++stat.nWord;
    ++stat.nChar;
    ++stat.nCharExcludingSpaces;
  }
}

/** Projects visible text and retains the source position of every expanded code unit. @param node - Text owner. @returns Text and language mapping, or no value for a wholly hidden paragraph. */
function GetCountedText(
  node: SwTextNode,
): { readonly text: string; readonly model?: readonly number[] } | undefined {
  const source = node.GetText();
  const hints = node.GetpSwpHints();
  const defaultHidden = (node.GetAttr(RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue();
  if (!hints) return defaultHidden ? undefined : { text: source };
  const iterator = new SwAttrIter(node);
  const attrs = iterator.GetAttrHandler();
  const model: number[] = [];
  const parts: string[] = [];
  let hasVisibleText = false;
  for (let start = 0; start < source.length;) {
    iterator.Seek(start);
    const end = Math.max(start + 1, iterator.GetNextAttr());
    const hidden = (attrs.ReadItem(RES_CHRATR_HIDDEN) as SvxCharHiddenItem).GetValue();
    if (!hidden) {
      hasVisibleText = true;
      for (let offset = start; offset < end; ++offset) {
        const code = source[offset];
        if (code === CH_TXTATR_INWORD && hints.GetTextAttrForCharAt(offset, RES_TXTATR_ANNOTATION))
          continue;
        switch (code) {
          case CH_TXT_ATR_FIELDSTART:
          case CH_TXT_ATR_FIELDSEP:
          case CH_TXT_ATR_FIELDEND:
          case CH_TXT_ATR_INPUTFIELDSTART:
          case CH_TXT_ATR_INPUTFIELDEND:
            break;
          case CH_TXTATR_BREAKWORD: {
            const field = hints.GetTextAttrForCharAt(offset, RES_TXTATR_FIELD);
            const expansion = field?.GetAttr().GetField().Expand() ?? code;
            parts.push(expansion);
            for (let index = 0; index < expansion.length; ++index) model.push(offset);
            break;
          }
          default:
            parts.push(code ?? "");
            model.push(offset);
        }
      }
    }
    start = end;
  }
  if (!hasVisibleText && (source.length || defaultHidden)) return undefined;
  return { text: parts.join(""), model };
}

/** Runs the original WORD_COUNT scanner over the represented text or numbering label. @param node - Language owner. @param original - Text before dash replacement. @param stat - Original accumulator. @param language - Fixed numbering language, when present. @param model - View-to-model positions. */
function CountText(
  node: SwTextNode,
  original: string,
  stat: SwDocStat,
  language?: number,
  model?: readonly number[],
): void {
  const masked = original.replaceAll(/[\u2013\u2014]/gu, " ");
  const value = unicode(masked);
  const units = GetWriterTextUnits(masked);
  const breaks = g_pBreakIt.GetBreakIter();
  const words = g_pBreakIt.GetWordBreakIter();
  try {
    for (let offset = 0; offset < masked.length;) {
      const character = masked.charCodeAt(offset);
      if (u_isUWhiteSpace(character) || (character >= 0x1c && character <= 0x1f)) {
        ++offset;
        continue;
      }
      const script = breaks.getScriptType(units, offset);
      const current =
        language ?? node.GetLang(model?.[offset] ?? Math.min(offset, node.Len()), 0, script);
      const locale = g_pBreakIt.GetLocale(current);
      const word = words.getWordBoundary(value, offset, locale, WORD_COUNT, true);
      if (word.startPos === word.endPos) break;
      if (word.endPos <= offset) {
        ++offset;
        continue;
      }
      const start = Math.max(offset, word.startPos);
      let end = word.endPos;
      if (end - start > 1) {
        for (let position = start; position < end;) {
          const point = position;
          const code = masked.codePointAt(position) ?? 0;
          position += code > 0xffff ? 2 : 1;
          if (breaks.getScriptType(units, point) !== ASIAN) continue;
          const asianLanguage = node.GetLang(
            model?.[point] ?? Math.min(point, node.Len()),
            0,
            ASIAN,
          );
          if ((asianLanguage & 0x3ff) !== (LANGUAGE_KOREAN & 0x3ff))
            end = point === start ? position : point;
          break;
        }
      }
      if (original[start] !== CH_TXTATR_BREAKWORD) {
        ++stat.nWord;
        if (breaks.getScriptType(units, start) === ASIAN) ++stat.nAsianWord;
        stat.nCharExcludingSpaces += g_pBreakIt.getGraphemeCount(original.slice(start, end));
      }
      offset = end;
    }
  } finally {
    value.dispose();
  }
  for (let index = 0; index < original.length; ++index)
    if (original[index] !== masked[index]) ++stat.nCharExcludingSpaces;
  stat.nChar += g_pBreakIt.getGraphemeCount(original);
}
