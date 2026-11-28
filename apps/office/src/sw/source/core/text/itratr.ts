/** @fileoverview Iterates Writer text attributes when applying paragraph and character formatting. */
import { isTextFormatHint } from "../txtnode/txatbase";
/** @fileoverview Represents native itratr.cxx hint traversal for one unmerged text node without a filter-run conversion. */
import { DICTIONARY_WORD } from "../../../../offapi/com/sun/star/i18n/WordType";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { CHAR_HARDBLANK, CHAR_HARDHYPHEN, CHAR_SOFTHYPHEN } from "../../../inc/swtypes";
import { GetWhichOfScript } from "../attr/hints";
import { g_pBreakIt } from "../bastyp/breakit";
import { CreateSwMeasurementFont, TryMeasureSwTextWidth } from "../txtnode/swfont";
import { SwScriptInfo } from "./porlay";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  CH_TXT_ATR_FIELDEND,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_FORMELEMENT,
  CH_TXT_ATR_INPUTFIELDEND,
  CH_TXT_ATR_INPUTFIELDSTART,
  CH_TXTATR_BREAKWORD,
  CH_TXTATR_INWORD,
  RES_CHRATR_LANGUAGE,
  RES_TXTATR_CHARFMT,
} from "../../../inc/hintids";
import { SwAttrHandler } from "./atrstck";

/** Traverses actual native start/end maps and maintains character stacks for the current text position. */
export class SwAttrIter {
  private readonly m_aAttrHandler = new SwAttrHandler();
  private m_nStartIndex = 0;
  private m_nEndIndex = 0;
  private m_nPosition = 0;

  /** Initializes the iterator over the actual node and inherited paragraph items. @param m_pTextNode - Canonical owner. @param includeCollections - Whether named character collections participate. @returns Nothing. */
  public constructor(
    private readonly m_pTextNode: SwTextNode,
    private readonly includeCollections = true,
  ) {
    this.m_aAttrHandler.Init(m_pTextNode.GetSwAttrSet());
  }

  /** Exposes the existing native handler for the platform item formatter. @returns Owned handler. */
  public GetAttrHandler(): SwAttrHandler {
    return this.m_aAttrHandler;
  }

  /** Reports native hint-container presence, including an allocated empty container. @returns Whether hints may exist. */
  public MaybeHasHints(): boolean {
    return this.m_pTextNode.GetpSwpHints() !== undefined;
  }

  /** Seeks a character position, resetting backward/zero seeks before end-first forward traversal. Font/device change reporting remains unrepresented. @param position - UTF-16 node position. @returns Nothing. */
  public Seek(position: number): void {
    if (!Number.isInteger(position) || position < 0 || position > this.m_pTextNode.Len())
      throw new Error("SwAttrIter position is outside its text node.");
    const hints = this.m_pTextNode.GetpSwpHints();
    if (hints !== undefined && (position === 0 || position < this.m_nPosition)) {
      this.m_aAttrHandler.Reset();
      this.m_nStartIndex = 0;
      this.m_nEndIndex = 0;
      this.m_nPosition = 0;
    }
    if (hints !== undefined) {
      while (
        this.m_nEndIndex < hints.Count() &&
        hints.GetSortedByEnd(this.m_nEndIndex).GetAnyEnd() <= position
      ) {
        const hint = hints.GetSortedByEnd(this.m_nEndIndex++);
        if (
          isTextFormatHint(hint) &&
          this.m_nStartIndex !== 0 &&
          hint.GetStart() <= this.m_nPosition
        )
          this.m_aAttrHandler.PopAndChg(hint);
      }
      while (
        this.m_nStartIndex < hints.Count() &&
        hints.Get(this.m_nStartIndex).GetStart() <= position
      ) {
        const hint = hints.Get(this.m_nStartIndex++);
        if (
          isTextFormatHint(hint) &&
          hint.GetEnd() > position &&
          (this.includeCollections || hint.Which() !== RES_TXTATR_CHARFMT)
        )
          this.m_aAttrHandler.PushAndChg(hint);
      }
    }
    this.m_nPosition = position;
  }

  /** Finds the next nonignored start/end boundary or field marker. @returns UTF-16 offset or native node-length sentinel. */
  public GetNextAttr(): number {
    let next = this.m_pTextNode.Len();
    const hints = this.m_pTextNode.GetpSwpHints();
    if (hints !== undefined) {
      for (let index = this.m_nStartIndex; index < hints.Count(); index++) {
        const hint = hints.Get(index);
        if (!hint.IsFormatIgnoreStart()) {
          next = hint.GetStart();
          break;
        }
      }
      for (let index = this.m_nEndIndex; index < hints.Count(); index++) {
        const hint = hints.GetSortedByEnd(index);
        if (!hint.IsFormatIgnoreEnd()) {
          next = Math.min(next, hint.GetAnyEnd());
          break;
        }
      }
    }
    const text = this.m_pTextNode.GetText();
    for (let position = this.m_nPosition; position < next; ++position) {
      switch (text[position]) {
        case CH_TXT_ATR_FORMELEMENT:
        case CH_TXT_ATR_FIELDSTART:
        case CH_TXT_ATR_FIELDSEP:
        case CH_TXT_ATR_FIELDEND:
          return position === this.m_nPosition ? position + 1 : position;
      }
    }
    return next;
  }
}

/** Characters that the native scaling scan handles outside ordinary text. */
const scalingControls = new Set([
  "\t",
  "\n",
  CHAR_HARDBLANK,
  CHAR_HARDHYPHEN,
  CHAR_SOFTHYPHEN,
  CH_TXT_ATR_FIELDEND,
  CH_TXT_ATR_FIELDSEP,
  CH_TXT_ATR_FIELDSTART,
  CH_TXT_ATR_FORMELEMENT,
  CH_TXT_ATR_INPUTFIELDEND,
  CH_TXT_ATR_INPUTFIELDSTART,
  CH_TXTATR_BREAKWORD,
  CH_TXTATR_INWORD,
]);

/** Measures the native unscaled text advance against the first affected visual line. @param node - Unmerged text node. @param start - Native selection start. @param end - Selection end in this node. @param lineHeight - Height of the containing visual line in twips, if formatted. @returns Unsigned percentage when an output device is available. */
export function GetScalingOfSelectedText(
  node: SwTextNode,
  start: number,
  end: number,
  lineHeight?: (offset: number) => number | undefined,
): number | undefined {
  const text = node.GetText();
  if (start === text.length) return 100;
  const device = node.GetDoc().GetDefaultFontDevice();
  if (device?.measureTextWidth === undefined) return undefined;
  const scripts = new SwScriptInfo();
  scripts.InitScriptInfo(node);
  const iterator = new SwAttrIter(node);
  const attributes = iterator.GetAttrHandler();
  if (start === end) {
    iterator.Seek(start);
    const script = scripts.ScriptType(start);
    const language = attributes.ReadItem(
      GetWhichOfScript(RES_CHRATR_LANGUAGE, script),
    ) as SvxLanguageItem;
    const value = unicode(text);
    try {
      const boundary = g_pBreakIt
        .GetWordBreakIter()
        .getWordBoundary(
          value,
          start,
          g_pBreakIt.GetLocale(language.GetLanguage()),
          DICTIONARY_WORD,
          true,
        );
      if (boundary.startPos === start || boundary.startPos === boundary.endPos) return 100;
      start = boundary.startPos;
      end = boundary.endPos;
    } finally {
      value.dispose();
    }
  }

  let width = 0;
  let lineWidth = 0;
  let offset = start;
  while (offset < end) {
    iterator.Seek(offset);
    const script = scripts.ScriptType(offset);
    const limit = Math.min(end, iterator.GetNextAttr(), scripts.NextScriptChg(offset));
    let stop = offset;
    while (stop < limit && !scalingControls.has(text[stop] as string)) stop++;
    if (stop > offset) {
      const measured = TryMeasureSwTextWidth(
        device,
        attributes,
        script,
        text,
        offset,
        stop - offset,
      );
      if (measured === undefined) return undefined;
      lineWidth += measured;
      offset = stop;
      continue;
    }
    const character = text[offset];
    if (character === "\n") {
      width = Math.max(width, lineWidth);
      lineWidth = 0;
    } else if (
      character === "\t" ||
      character === CHAR_HARDBLANK ||
      character === CHAR_HARDHYPHEN
    ) {
      const measured =
        character === "\t"
          ? TryMeasureSwTextWidth(device, attributes, script, " ", 0, 1)
          : TryMeasureSwTextWidth(device, attributes, script, text, offset, 1);
      if (measured === undefined) return undefined;
      lineWidth += measured;
    }
    offset++;
  }

  width = Math.max(width, lineWidth);
  if (width === 0) return 0;
  let height = lineHeight?.(start);
  if (height === undefined) {
    iterator.Seek(start);
    const font = CreateSwMeasurementFont(attributes, scripts.ScriptType(start));
    height = device.measureTextHeight?.(font.familyName, font.heightTwips);
  }
  return height === undefined ? undefined : Math.trunc((100 * height) / width) & 0xffff;
}
