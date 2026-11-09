/** @fileoverview Original itratr.cxx paragraph width and anchored Writer fly contributions during import. */
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwTableNode } from "../docnode/node";
import type { SwFrameFormat } from "../layout/atrfrm";
import {
  resolveSwLeftMarginWithNum,
  resolveSwListFirstLineIndent,
} from "../txtnode/ndtxt-list-indent";
import {
  CH_TXT_ATR_FIELDEND,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_FORMELEMENT,
  CH_TXT_ATR_INPUTFIELDEND,
  CH_TXT_ATR_INPUTFIELDSTART,
  RES_CHRATR_LANGUAGE,
  RES_FLYFRMFMT,
  RES_MARGIN_FIRSTLINE,
} from "../../../inc/hintids";
import {
  CHAR_HARDBLANK,
  CHAR_HARDHYPHEN,
  CHAR_SOFTHYPHEN,
  COMPLETE_STRING,
} from "../../../inc/swtypes";
import { DICTIONARY_WORD } from "../../../../offapi/com/sun/star/i18n/WordType";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import type { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import type { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { GetWhichOfScript } from "../attr/hints";
import { g_pBreakIt } from "../bastyp/breakit";
import { MeasureSwTextWidth } from "../txtnode/swfont";
import { SwAttrIter } from "./itratr";
import { SwScriptInfo } from "./porlay";

/** Native preliminary minimum, maximum, and common offset for the text-width calculation. */
export interface SwMinMaxNodeMetrics {
  readonly minimum: number;
  readonly maximum: number;
  readonly margin: number;
}

/** Original mutable width accumulators for anchored content. */
interface SwMinMaxNodeArgs {
  minimum: number;
  maximum: number;
  leftRest: number;
  rightRest: number;
  leftDiff: number;
  rightDiff: number;
  index: number;
}

/** Measures the actual format or first/last contained table through the original item/layout owners. @param format - Actual Writer fly format. @param args - Native accumulating arguments. @returns Nothing. */
function lcl_MinMaxNode(format: SwFrameFormat, args: SwMinMaxNodeArgs): void {
  const anchor = format.GetAnchor(),
    id = anchor.GetAnchorId();
  if (
    (id !== RndStdIds.FLY_AT_PARA && id !== RndStdIds.FLY_AT_CHAR) ||
    anchor.GetAnchorNode()?.GetIndex() !== args.index
  )
    return;
  const content = format.GetContent().GetContentIdx();
  if (content === null) throw new Error("assert(anchored Writer fly content)");
  const nodes = format.GetDoc().GetNodes();
  let table = nodes.at(content.GetIndex() + 1);
  if (!(table instanceof SwTableNode)) {
    const last = nodes.at(content.GetNode().EndOfSectionIndex() - 1);
    if (last.IsEndNode()) table = last.StartOfSectionNode();
  }
  const layout = table instanceof SwTableNode ? table.GetTable().GetHTMLTableLayout() : null;
  const sizeMin = layout ? layout.GetMin() : format.GetFrameSize().GetWidth(),
    sizeMax = layout ? layout.GetMax() : sizeMin,
    difference = sizeMax - sizeMin,
    spacing = format.GetLRSpace(),
    inset = spacing.ResolveLeft() + spacing.ResolveRight(),
    minimum = sizeMin + inset;

  if (format.GetSurround().GetSurround() === WrapTextMode.THROUGH) {
    args.minimum = Math.max(args.minimum, minimum);
    return;
  }
  const orientation = format.GetHoriOrient(),
    relation = orientation.GetRelationOrient();
  switch (orientation.GetHoriOrient()) {
    case HoriOrientation.RIGHT:
      if (difference) {
        args.rightRest -= args.rightDiff;
        args.rightDiff = difference;
      }
      if (relation !== RelOrientation.FRAME && args.rightRest > 0) args.rightRest = 0;
      args.rightRest -= minimum;
      break;
    case HoriOrientation.LEFT:
      if (difference) {
        args.leftRest -= args.leftDiff;
        args.leftDiff = difference;
      }
      if (relation !== RelOrientation.FRAME && args.leftRest < 0) args.leftRest = 0;
      args.leftRest -= minimum;
      break;
    default:
      args.maximum += sizeMax + inset;
      args.minimum = Math.max(args.minimum, minimum);
  }
}

/** Resolves original paragraph indents and anchored Writer fly widths ahead of text measurement. @param node - Actual source text node. @param index - Native anchor-node index or zero to omit the anchored scan. @returns Original preliminary measurements. */
export function GetMinMaxNodeMetrics(node: SwTextNode, index: number): SwMinMaxNodeMetrics {
  let left = node.GetParagraphTextLeftMargin() + resolveSwLeftMarginWithNum(node, true);
  const numbered = node.GetNum()?.GetNumRule() !== undefined;
  const first = numbered
    ? resolveSwListFirstLineIndent(node)
    : ((
        node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset() <<
        16) >>
      16;
  if (!numbered || first > left) left = first;
  const right = node.GetParagraphRightMargin();
  const args: SwMinMaxNodeArgs = {
    minimum: 0,
    maximum: 0,
    leftRest: left,
    rightRest: right,
    leftDiff: 0,
    rightDiff: 0,
    index,
  };
  if (index) {
    // The current Writer graph contains actual Writer fly formats; native drawing-object bounds require the drawing owner.
    for (const format of node.GetDoc().GetSpzFrameFormats())
      if (format.Which() === RES_FLYFRMFMT) lcl_MinMaxNode(format, args);
  }
  if (args.leftRest < 0) args.minimum = Math.max(args.minimum, left - args.leftRest);
  args.leftRest -= args.leftDiff;
  if (args.leftRest < 0) args.maximum -= args.leftRest;
  if (args.rightRest < 0) args.minimum = Math.max(args.minimum, right - args.rightRest);
  args.rightRest -= args.rightDiff;
  if (args.rightRest < 0) args.maximum -= args.rightRest;
  return { minimum: args.minimum, maximum: args.maximum, margin: left + right };
}

/** Native paragraph width results used by the HTML filter. */
export interface SwMinMaxSize {
  readonly minimum: number;
  readonly maximum: number;
  readonly absoluteMinimum: number;
}

/** Original SwMinMaxArgs word and row accumulators for the represented text runs. */
class SwMinMaxArgs {
  minimum = 0;
  absoluteMinimum = 0;
  rowWidth = 0;
  wordWidth = 0;
  noLineBreak = COMPLETE_STRING;

  /** Clears the running word without affecting the row. @returns Nothing. */
  NewWord(): void {
    this.wordWidth = 0;
  }

  /** Adds nonblank width to the current word and updates both minima. @param width - Measured width. @returns Nothing. */
  AddWordWidth(width: number): void {
    this.wordWidth += width;
    this.absoluteMinimum = Math.max(this.absoluteMinimum, this.wordWidth);
    // In the represented hint graph there is no inline fly contributing m_nWordAdd.
    this.minimum = Math.max(this.minimum, this.wordWidth);
  }
}

/** Measures segments of one attributed range up to the original dictionary word end. @param args - Active accumulators. @param measure - Active font and output device width query. @param language - Active subfont language. @param text - Actual UTF-16 paragraph. @param index - First position. @param end - Exclusive run end. @returns Whether a nonblank segment was measured. */
function lcl_MinMaxString(
  args: SwMinMaxArgs,
  measure: (text: string, start: number, length: number) => number,
  language: number,
  text: string,
  index: number,
  end: number,
): boolean {
  let measured = false;
  while (index < end) {
    const blank = text[index] === " ";
    const boundary = g_pBreakIt
      .GetBreakIter()
      .getWordBoundary(text, index, g_pBreakIt.GetLocale(language), DICTIONARY_WORD, true);
    if (index <= boundary.startPos && index !== 0 && index - 1 !== args.noLineBreak) args.NewWord();
    const stop = Math.min(boundary.endPos === index ? index + 1 : boundary.endPos, end);
    const width = measure(text, index, stop - index);
    args.rowWidth += width;
    if (blank) args.NewWord();
    else {
      args.AddWordWidth(width);
      measured = true;
    }
    index = stop;
  }
  return measured;
}

/** Original special controls that terminate the scan before measuring a regular string run. */
const minMaxControls = new Set([
  "\t",
  "\n",
  CHAR_HARDBLANK,
  CHAR_HARDHYPHEN,
  CHAR_SOFTHYPHEN,
  CH_TXT_ATR_INPUTFIELDSTART,
  CH_TXT_ATR_INPUTFIELDEND,
  CH_TXT_ATR_FORMELEMENT,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDEND,
]);

/** Implements SwTextNode::GetMinMaxSize for the represented paragraph graph and twip output-device port. @param node - Actual text owner. @param nodeIndex - Original anchor scan index or zero. @returns Native paragraph width metrics. */
export function GetMinMaxSize(node: SwTextNode, nodeIndex: number): SwMinMaxSize {
  const frame = GetMinMaxNodeMetrics(node, nodeIndex);
  const text = node.GetText();
  const device = node.GetDoc().GetDefaultFontDevice();
  const scripts = new SwScriptInfo();
  scripts.InitScriptInfo(node);
  const iterator = new SwAttrIter(node);
  const attributes = iterator.GetAttrHandler();
  const args = new SwMinMaxArgs();
  let index = 0;
  let script = scripts.ScriptType(0);
  let maximum = 0;
  let add = 0;

  /** Measures using the script and attributes of the most recent seek. @param value - Source text. @param start - First UTF-16 unit. @param length - Unit count. @returns Width in twips. */
  function measure(value: string, start: number, length: number): number {
    return MeasureSwTextWidth(device, attributes, script, value, start, length);
  }

  /** Seeks both native formatting owners. @returns Nothing. */
  function seek(): void {
    iterator.Seek(index);
    script = scripts.ScriptType(index);
  }
  seek();
  while (index < text.length) {
    const next = Math.min(iterator.GetNextAttr(), scripts.NextScriptChg(index));
    let stop = index;
    let control: string | undefined;
    while (stop < next) {
      const character = text[stop] as string;
      if (minMaxControls.has(character)) {
        control = character;
        break;
      }
      ++stop;
    }
    if (index < stop) {
      const languageItem = attributes.ReadItem(
        GetWhichOfScript(RES_CHRATR_LANGUAGE, script),
      ) as SvxLanguageItem;
      const language = languageItem.GetLanguage();
      if (
        lcl_MinMaxString(
          args,
          measure,
          language === LANGUAGE_SYSTEM ? getConfiguredSystemLanguage() : language,
          text,
          index,
          stop,
        )
      )
        add = 20;
    }
    index = stop;
    seek();
    switch (control) {
      case "\n":
        maximum = Math.max(maximum, args.rowWidth);
        args.rowWidth = 0;
        args.NewWord();
        ++index;
        seek();
        break;
      case "\t":
        args.NewWord();
        ++index;
        seek();
        break;
      case CHAR_SOFTHYPHEN:
        ++index;
        break;
      case CHAR_HARDBLANK:
      case CHAR_HARDHYPHEN: {
        const width = measure(control, 0, 1);
        args.rowWidth += width;
        args.AddWordWidth(width);
        args.noLineBreak = index++;
        break;
      }
      case undefined:
        break;
      default:
        ++index;
        seek();
    }
  }
  const offset = frame.margin + add;
  const minimum = Math.max(args.minimum + offset, frame.minimum);
  return {
    minimum,
    absoluteMinimum: Math.max(args.absoluteMinimum + offset, frame.minimum),
    maximum: Math.max(Math.max(maximum, args.rowWidth) + frame.maximum + offset, minimum),
  };
}
