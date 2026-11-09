/** @fileoverview Native line layout and import-time script changes from porlay.hxx/cxx. */
import { SvxScriptHintItem } from "../../../../editeng/source/items/textitem.modes";
import { getConfiguredSystemLanguage } from "../../../../i18nlangtag/source/isolang/mslangid";
import {
  MakeDirectionChangeScanner,
  MakeScriptChangeScanner,
  ScriptHintProvider,
  type ScriptChange,
} from "../../../../i18nutil/inc/scriptchangescanner";
import { GetI18NScriptTypeOfLanguage } from "../../../../svl/inc/languageoptions";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { RES_CHRATR_SCRIPT_HINT } from "../../../inc/hintids";
import { COMPLETE_STRING } from "../../../inc/swtypes";
import { GetWriterTextUnits } from "../bastyp/breakit";
import type { SwTextNode } from "../txtnode/ndtxt";
import { CharFormat } from "./atrstck";
import { SwLinePortion } from "./porlin";

/** Original native layout line in a paragraph's linked chain. */
export class SwLineLayout extends SwLinePortion {
  private m_pNext: SwLineLayout | undefined;
  private m_nRealHeight = 0;
  private m_bDummy = false;
  /** Reads the following original line. @returns Native line or no successor. */
  public GetNext(): SwLineLayout | undefined {
    return this.m_pNext;
  }
  /** Stores an original line link. @param next - Following line. @returns Nothing. */
  public SetNext(next: SwLineLayout | undefined): void {
    this.m_pNext = next;
  }
  /** Reads the formatted line height. @returns Twips. */
  public GetRealHeight(): number {
    return this.m_nRealHeight;
  }
  /** Stores device-shaped line height. @param height - Twips. @returns Nothing. */
  public SetRealHeight(height: number): void {
    this.m_nRealHeight = height;
  }
  /** Reads native dummy-line status. @returns Whether this is a dummy. */
  public IsDummy(): boolean {
    return this.m_bDummy;
  }
  /** Sets native dummy-line status. @param dummy - New status. @returns Nothing. */
  public SetDummy(dummy: boolean): void {
    this.m_bDummy = dummy;
  }
}
/** Native paragraph object also serving as its original first line. */
export class SwParaPortion extends SwLineLayout {
  /** Sums actual line lengths as the native paragraph does. @returns UTF-16 length. */
  public GetParLen(): number {
    let length = this.GetLen();
    let line = this.GetNext();
    while (line !== undefined) {
      length += line.GetLen();
      line = line.GetNext();
    }
    return length;
  }
}

/** Collects original paragraph and ranged script hints in native hint order. @param node - Actual text owner. @returns Scanner hint provider. */
function lcl_FindScriptTypeHintSpans(node: SwTextNode): ScriptHintProvider {
  const provider = new ScriptHintProvider();
  const paragraph = node.GetSwAttrSet().GetItemIfSet(RES_CHRATR_SCRIPT_HINT, true);
  if (paragraph instanceof SvxScriptHintItem) provider.SetParagraphLevelHint(paragraph.GetValue());
  for (const hint of node.GetpSwpHints()?.entries() ?? []) {
    const item = CharFormat.GetItem(hint, RES_CHRATR_SCRIPT_HINT);
    const start = hint.GetStart();
    const end = hint.GetEnd();
    if (item instanceof SvxScriptHintItem && end > start)
      provider.AddHint(item.GetValue(), start, end);
  }
  return provider;
}

/** Owns the fresh, unmerged script-change array used by import without a text frame. */
export class SwScriptInfo {
  private readonly m_ScriptChanges: ScriptChange[] = [];

  /** Scans a new unmerged paragraph using the layout-free initial LTR direction. @param node - Actual text owner. @returns Nothing. */
  public InitScriptInfo(node: SwTextNode): void {
    const units = GetWriterTextUnits(node.GetText());
    const text = new OUString(units, units.length);
    this.m_ScriptChanges.length = 0;
    try {
      const directions = MakeDirectionChangeScanner(text, 0);
      const scripts = MakeScriptChangeScanner(
        text,
        GetI18NScriptTypeOfLanguage(getConfiguredSystemLanguage()),
        directions,
        lcl_FindScriptTypeHintSpans(node),
      );
      while (!scripts.AtEnd()) {
        this.m_ScriptChanges.push(scripts.Peek());
        scripts.Advance();
      }
    } finally {
      text.dispose();
    }
  }

  /** Returns the next native script range end. @param position - UTF-16 text offset. @returns Range end or COMPLETE_STRING. */
  public NextScriptChg(position: number): number {
    for (const change of this.m_ScriptChanges)
      if (position < change.m_nEndIndex) return change.m_nEndIndex;
    return COMPLETE_STRING;
  }

  /** Returns the native active script and application script fallback. @param position - UTF-16 text offset. @returns Original i18n script. */
  public ScriptType(position: number): number {
    for (const change of this.m_ScriptChanges)
      if (position < change.m_nEndIndex) return change.m_nScriptType;
    return GetI18NScriptTypeOfLanguage(getConfiguredSystemLanguage());
  }
}
