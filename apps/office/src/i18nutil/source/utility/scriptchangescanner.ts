/** @fileoverview Original ScriptHintProvider and GreedyScriptChangeScanner from scriptchangescanner.cxx over the original direction-scanner contract; the concrete direction scanner consumes the original default ICU bidi path. */
import type { ScriptHintType } from "../../inc/scriptchangescanner";
import * as HintValue from "../../../offapi/com/sun/star/text/ScriptHintType";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { GetScriptClass } from "./scriptclass";
import { unicode } from "./unicode";
import * as ScriptType from "../../../offapi/com/sun/star/i18n/ScriptType";
import * as UnicodeType from "../../../offapi/com/sun/star/i18n/UnicodeType";
import { u_getIntPropertyValue } from "../../../external/icu/source/common/uprops";
import { resolveDefaultBidiLevels } from "../../../external/icu/source/common/ubidi";
import { u_charDirection } from "../../../external/icu/source/common/ubidi_props";
import { UCharDirection as U } from "../../../external/icu/source/common/unicode/uchar";
import { UProperty } from "../../../external/icu/source/common/unicode/uchar";
import { UScriptCode } from "../../../external/icu/source/common/unicode/uscript";

/** Original by-value direction run. */
export interface DirectionChange {
  m_nStartIndex: number;
  m_nEndIndex: number;
  m_nLevel: number;
  m_bHasEmbeddedStrongLTR: boolean;
}
/** Original by-value script run. */
export interface ScriptChange {
  m_nStartIndex: number;
  m_nEndIndex: number;
  m_nScriptType: number;
}
/** Original direction scanner abstraction; the concrete factory retains original ICU levels and logical-run traversal. */
export abstract class DirectionChangeScanner {
  /** Original cursor state. @returns Whether exhausted. */
  abstract AtEnd(): boolean;
  /** Original logical-run advance. @returns Nothing. */
  abstract Advance(): void;
  /** Original copied current run. @returns Direction run. */
  abstract Peek(): DirectionChange;
  /** Original random-access embedding level independent of cursor state. @param index - UTF16 position. @returns Bidi level. */
  abstract GetLevelAt(index: number): number;
  /** Original reset. @returns Nothing. */
  abstract Reset(): void;
}
/** Original script scanner abstraction. */
export abstract class ScriptChangeScanner {
  /** Original cursor state. @returns Whether exhausted. */
  abstract AtEnd(): boolean;
  /** Original next nonempty run,or terminal value. @returns Nothing. */
  abstract Advance(): void;
  /** Original copied run. @returns Script run. */
  abstract Peek(): ScriptChange;
}

/** Original hint provider retains insertion order and cursor state; Start is required before AdvanceTo. */
export class ScriptHintProvider {
  private readonly m_aHints: {
    m_eType: ScriptHintType;
    m_nStartIndex: number;
    m_nEndIndex: number;
  }[] = [];
  private m_eParaHint: ScriptHintType = HintValue.AUTOMATIC;
  private m_pCurrIt = 0;
  private m_eCurrHint: ScriptHintType = HintValue.AUTOMATIC;
  private m_nCurrIdx = 0;
  /** Original paragraph assignment does not update the current hint until Start/AdvanceTo. @param type - Original hint. @returns Nothing. */
  public SetParagraphLevelHint(type: ScriptHintType): void {
    this.m_eParaHint = type;
  }
  /** Original append without sorting,merging or range normalization. @param type - Original hint. @param start - UTF16 start. @param end - Exclusive end. @returns Nothing. */
  public AddHint(type: ScriptHintType, start: number, end: number): void {
    this.m_aHints.push({ m_eType: type, m_nStartIndex: start, m_nEndIndex: end });
  }
  /** Original reset and special first-range-at-zero lookup. @returns Nothing. */
  public Start(): void {
    this.m_pCurrIt = 0;
    this.m_nCurrIdx = 0;
    this.m_eCurrHint = this.m_eParaHint;
    const hint = this.m_aHints[this.m_pCurrIt];
    if (hint !== undefined && hint.m_nStartIndex === 0 && hint.m_nEndIndex > 0)
      this.m_eCurrHint = hint.m_eType;
  }
  /** Original forward-only cursor; moving the requested index backwards does not rewind skipped ranges. @param next - Actual UTF16 position. @returns Nothing. */
  public AdvanceTo(next: number): void {
    this.m_nCurrIdx = next;
    while (
      this.m_pCurrIt < this.m_aHints.length &&
      this.m_nCurrIdx >=
        (this.m_aHints[this.m_pCurrIt] as (typeof this.m_aHints)[number]).m_nEndIndex
    )
      ++this.m_pCurrIt;
    this.m_eCurrHint = this.m_eParaHint;
    const hint = this.m_aHints[this.m_pCurrIt];
    if (
      hint !== undefined &&
      this.m_nCurrIdx >= hint.m_nStartIndex &&
      this.m_nCurrIdx < hint.m_nEndIndex
    )
      this.m_eCurrHint = hint.m_eType;
  }
  /** Original current hint value. @returns Hint. */
  public Peek(): ScriptHintType {
    return this.m_eCurrHint;
  }
}

/** Original concrete greedy scanner; supplied direction data comes from the real direction owner,not script heuristics. */
class GreedyScriptChangeScanner extends ScriptChangeScanner {
  private m_stCurr: ScriptChange = { m_nStartIndex: 0, m_nEndIndex: 0, m_nScriptType: 0 };
  private m_nIndex = 0;
  private m_nNextStart = 0;
  private m_nPrevScript: number = ScriptType.WEAK;
  private m_bAtEnd = false;
  /** Original full prescan,leading-weak fallback,hint initialization and first Advance. @param m_rText - Actual borrowed string. @param defaultScript - Actual application-language script. @param m_pDirScanner - Actual direction scanner. @param m_pHints - Actual hint provider. @returns Scanner. */
  constructor(
    private readonly m_rText: OUStringConstReference,
    defaultScript: number,
    private readonly m_pDirScanner: DirectionChangeScanner,
    private readonly m_pHints: ScriptHintProvider,
  ) {
    super();
    const index: [number] = [0];
    while (index[0] < m_rText.getLength()) {
      const script = GetScriptClass(m_rText.iterateCodePoints(index));
      if (this.m_nPrevScript === ScriptType.WEAK) this.m_nPrevScript = script;
    }
    if (this.m_nPrevScript === ScriptType.WEAK) this.m_nPrevScript = defaultScript;
    m_pHints.Start();
    this.Advance();
  }
  /** Original one-run state transition,including dotted-circle/mark and NNBSP/Mongolian boundary reassociation. @returns Nothing. */
  private AdvanceOnce(): void {
    this.m_stCurr = {
      m_nStartIndex: this.m_nNextStart,
      m_nEndIndex: this.m_nNextStart,
      m_nScriptType: this.m_nPrevScript,
    };
    if (this.m_nNextStart >= this.m_rText.getLength()) {
      this.m_bAtEnd = true;
      return;
    }
    const runStart = this.m_nNextStart;
    this.m_nNextStart = this.m_nIndex;
    let script = this.m_nPrevScript;
    while (this.m_nIndex < this.m_rText.getLength()) {
      const previousIndex = this.m_nIndex;
      const level = this.m_pDirScanner.GetLevelAt(this.m_nIndex);
      const rtl = level % 2 === 1,
        embedded = level > 0;
      let strongEmbeddedLTR = false;
      while (embedded && !this.m_pDirScanner.AtEnd()) {
        const direction = this.m_pDirScanner.Peek();
        if (this.m_nIndex >= direction.m_nStartIndex && this.m_nIndex < direction.m_nEndIndex) {
          strongEmbeddedLTR = direction.m_bHasEmbeddedStrongLTR;
          break;
        }
        this.m_pDirScanner.Advance();
      }
      this.m_pHints.AdvanceTo(this.m_nIndex);
      const hint = this.m_pHints.Peek();
      const index: [number] = [this.m_nIndex];
      const char = this.m_rText.iterateCodePoints(index);
      this.m_nIndex = index[0];
      script = GetScriptClass(char);
      if (hint === HintValue.IGNORE) script = ScriptType.LATIN;
      else if (script === ScriptType.WEAK) {
        switch (hint) {
          case HintValue.LATIN:
            script = ScriptType.LATIN;
            break;
          case HintValue.ASIAN:
            script = ScriptType.ASIAN;
            break;
          case HintValue.COMPLEX:
            script = ScriptType.COMPLEX;
            break;
          default:
            break;
        }
      }
      if (
        (hint === HintValue.AUTOMATIC || hint === HintValue.COMPLEX) &&
        (rtl || (embedded && !strongEmbeddedLTR))
      ) {
        if (script !== ScriptType.ASIAN) script = ScriptType.COMPLEX;
      } else if (script === ScriptType.WEAK) script = this.m_nPrevScript;
      if (script !== this.m_nPrevScript) {
        this.m_nNextStart = previousIndex;
        break;
      }
      this.m_nNextStart = this.m_nIndex;
    }
    if (this.m_nNextStart > 0) {
      const previousPosition: [number] = [this.m_nNextStart];
      const previousChar = this.m_rText.iterateCodePoints(previousPosition, -1);
      if (
        this.m_nNextStart < this.m_rText.getLength() &&
        GetScriptClass(previousChar) === ScriptType.WEAK
      ) {
        const position: [number] = [this.m_nNextStart];
        const char = this.m_rText.iterateCodePoints(position, 0),
          type = unicode.getUnicodeType(char);
        if (
          type === UnicodeType.NON_SPACING_MARK ||
          type === UnicodeType.ENCLOSING_MARK ||
          type === UnicodeType.COMBINING_SPACING_MARK ||
          (previousChar === 0x202f &&
            u_getIntPropertyValue(char, UProperty.UCHAR_SCRIPT) === UScriptCode.USCRIPT_MONGOLIAN)
        )
          this.m_nNextStart = previousPosition[0];
      }
    }
    this.m_stCurr = {
      m_nStartIndex: runStart,
      m_nEndIndex: this.m_nNextStart,
      m_nScriptType: this.m_nPrevScript,
    };
    this.m_nPrevScript = script;
  }
  /** Original terminal state. @returns Whether exhausted. */
  public override AtEnd(): boolean {
    return this.m_bAtEnd;
  }
  /** Original Advance skips internal zero-length transitions. @returns Nothing. */
  public override Advance(): void {
    for (;;) {
      this.AdvanceOnce();
      if (this.AtEnd() || this.m_stCurr.m_nStartIndex !== this.m_stCurr.m_nEndIndex) break;
    }
  }
  /** Original by-value result; callers cannot mutate the current state through Peek. @returns Copied script run. */
  public override Peek(): ScriptChange {
    return { ...this.m_stCurr };
  }
}

/** Original concrete script factory; construction of ICU direction data remains a separate native responsibility. @param text - Actual borrowed string. @param defaultScript - Application-language script. @param direction - Actual direction scanner. @param hints - Actual hint provider. @returns Original scanner abstraction. */
export function MakeScriptChangeScanner(
  text: OUStringConstReference,
  defaultScript: number,
  direction: DirectionChangeScanner,
  hints: ScriptHintProvider,
): ScriptChangeScanner {
  return new GreedyScriptChangeScanner(text, defaultScript, direction, hints);
}

/** Original IcuDirectionChangeScanner state machine over the real ICU default-mode value result. Native memory ownership is left to JS. */
class IcuDirectionChangeScanner extends DirectionChangeScanner {
  private readonly levels: readonly number[];
  private readonly m_nCount: number;
  private m_nCurrIndex = 0;
  private m_nCurr = 0;
  private m_bAtEnd = true;
  private m_stCurr: DirectionChange;
  /** Resolves the actual text once and starts the original logical-run cursor. @param m_rText - Actual borrowed OUString. @param m_nInitialDirection - Actual paragraph direction. @returns Scanner. */
  constructor(
    private readonly m_rText: OUStringConstReference,
    private readonly m_nInitialDirection: 0 | 1,
  ) {
    super();
    const units = m_rText.getStr();
    let text = "";
    for (let index = 0; index < m_rText.getLength(); ++index)
      text += String.fromCharCode(units[index] as number);
    this.levels = resolveDefaultBidiLevels(text, m_nInitialDirection);
    let count = this.levels.length === 0 ? 0 : 1;
    for (let i = 1; i < this.levels.length; ++i) if (this.levels[i] !== this.levels[i - 1]) ++count;
    this.m_nCount = count;
    this.m_stCurr = {
      m_nStartIndex: 0,
      m_nEndIndex: 0,
      m_nLevel: m_nInitialDirection,
      m_bHasEmbeddedStrongLTR: false,
    };
    this.Reset();
  }
  /** Original code-unit scan deliberately calls u_charDirection on each UTF16 unit. @param start - Actual run start. @param end - Actual run end. @returns Whether strong LTR is present. */
  private RangeHasStrongLTR(start: number, end: number): boolean {
    const text = this.m_rText.getStr();
    for (let i = start; i < end; ++i) {
      const dir = u_charDirection(text[i] as number);
      if (
        dir === U.U_LEFT_TO_RIGHT ||
        dir === U.U_LEFT_TO_RIGHT_EMBEDDING ||
        dir === U.U_LEFT_TO_RIGHT_OVERRIDE
      )
        return true;
    }
    return false;
  }
  /** Original logical run query over actual ICU levels;private calls satisfy the API's in-range precondition. @param start - Valid UTF16 index. @returns Original logical end and level. */
  private LogicalRun(start: number): { end: number; level: number } {
    const level = this.levels[start] as number;
    let end = start + 1;
    while (end < this.levels.length && this.levels[end] === level) ++end;
    return { end, level };
  }
  /** Original PopulateCurr control-terminal adjustment and one-character-run skip. @returns Nothing. */
  private PopulateCurr(): void {
    const run = this.LogicalRun(this.m_nCurrIndex);
    let end = run.end;
    const embedded =
      run.level % 2 === 0 && run.level > 1 ? this.RangeHasStrongLTR(this.m_nCurrIndex, end) : false;
    if (end < this.m_rText.getLength()) {
      const c = this.m_rText.getStr()[end] as number,
        dir = u_charDirection(c);
      const advance =
        c === 0x200e ||
        c === 0x200f ||
        dir === U.U_LEFT_TO_RIGHT_EMBEDDING ||
        dir === U.U_RIGHT_TO_LEFT_EMBEDDING ||
        dir === U.U_LEFT_TO_RIGHT_OVERRIDE ||
        dir === U.U_RIGHT_TO_LEFT_OVERRIDE;
      if (advance) {
        const control = this.LogicalRun(end);
        ++end;
        if (end === control.end) ++this.m_nCurr;
      }
    }
    this.m_stCurr = {
      m_nStartIndex: this.m_nCurrIndex,
      m_nEndIndex: end,
      m_nLevel: run.level,
      m_bHasEmbeddedStrongLTR: embedded,
    };
    this.m_nCurrIndex = end;
    ++this.m_nCurr;
    this.m_bAtEnd = false;
  }
  /** Original reset restores the sentinel then populates only when runs exist. @returns Nothing. */
  public override Reset(): void {
    this.m_nCurrIndex = this.m_nCurr = 0;
    this.m_stCurr = {
      m_nStartIndex: 0,
      m_nEndIndex: 0,
      m_nLevel: this.m_nInitialDirection,
      m_bHasEmbeddedStrongLTR: false,
    };
    this.m_bAtEnd = true;
    if (this.m_nCurr < this.m_nCount) this.PopulateCurr();
  }
  /** Original terminal flag. @returns Whether exhausted. */
  public override AtEnd(): boolean {
    return this.m_bAtEnd;
  }
  /** Original run-count guard before advancing. @returns Nothing. */
  public override Advance(): void {
    if (this.m_nCurr >= this.m_nCount) {
      this.m_bAtEnd = true;
      return;
    }
    this.PopulateCurr();
  }
  /** Original copied current run. @returns By-value run. */
  public override Peek(): DirectionChange {
    return { ...this.m_stCurr };
  }
  /** Original getLevelAt returns0 for out-of-range indices,independently of traversal. @param index - Signed32 UTF16 index. @returns Actual level or source invalid-index0. */
  public override GetLevelAt(index: number): number {
    return this.levels[index | 0] ?? 0;
  }
}
/** Original concrete direction factory for the actually consumed paragraph LTR/RTL path. @param text - Actual borrowed text. @param initialDirection - Actual paragraph direction. @returns Native scanner abstraction. */
export function MakeDirectionChangeScanner(
  text: OUStringConstReference,
  initialDirection: 0 | 1,
): DirectionChangeScanner {
  return new IcuDirectionChangeScanner(text, initialDirection);
}
