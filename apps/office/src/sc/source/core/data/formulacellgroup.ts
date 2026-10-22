/** @fileoverview Original ScFormulaCellGroup code,scalar metadata and cached area-listener ownership split from formulacell.cxx;compileCode and column grouping remain separate consumers. */
import { ScTokenArray } from "../../../inc/tokenarray";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { GroupCalcEnabled } from "../../../inc/types";
import { ScRange, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { FormulaGroupAreaListener } from "../../../inc/grouparealistener";
import type { ScDocument } from "../../../inc/document";
import type { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";

/** Original copied range/fixed-endpoint key;string keys encode values for JS Map storage only. */
class AreaListenerKey {
  readonly maRange: ScRange;
  /** Copies native key values. @param range - Source range. @param mbStartFixed - Start policy. @param mbEndFixed - End policy. @returns Key. */
  constructor(
    range: ScRange,
    readonly mbStartFixed: boolean,
    readonly mbEndFixed: boolean,
  ) {
    this.maRange = new ScRange(range);
  }
  /** Original source range then boolean key order. @param other - Compared key. @returns Order. */
  compare(other: AreaListenerKey): number {
    return (
      this.maRange.compare(other.maRange) ||
      Number(this.mbStartFixed) - Number(other.mbStartFixed) ||
      Number(this.mbEndFixed) - Number(other.mbEndFixed)
    );
  }
}

/** Native shared code owner;JS references replace intrusive physical refcounts without a runtime ownership facade. */
export class ScFormulaCellGroup {
  readonly m_AreaListeners = new Map<
    string,
    { key: AreaListenerKey; listener: FormulaGroupAreaListener }
  >();
  mpCode: ScTokenArray | null = null;
  mpTopCell: ScFormulaCell | null = null;
  mnLength = 0;
  mnWeight = 0;
  mnFormatType: SvNumFormatType = SvNumFormatType.NUMBER;
  mbInvariant = false;
  mbSubTotal = false;
  mbPartOfCycle = false;
  meCalcState = GroupCalcEnabled;
  /** Original independent code copy determines vertical invariance and generates the native token hash. @param code - Source code. @returns Nothing. */
  setCode(code: ScTokenArray): void {
    this.mpCode = code.CloneValue();
    this.mbInvariant = this.mpCode.IsInvariant();
    this.mpCode.GenHash();
  }
  /** Original range/policy cache constructs one actual listener using the borrowed real top-cell block pointer. @param top - Actual formula block pointer. @param range - Source reference range. @param startFixed - Start row policy. @param endFixed - End row policy. @returns Cached owned listener. */
  getAreaListener(
    top: delayed_delete_vector_iterator<ScFormulaCell | null>,
    range: ScRange,
    startFixed: boolean,
    endFixed: boolean,
  ): FormulaGroupAreaListener {
    const encoded = range.GetVars().join(",") + ":" + Number(startFixed) + ":" + Number(endFixed);
    let entry = this.m_AreaListeners.get(encoded);
    if (!entry) {
      const cell = top.get() as ScFormulaCell;
      entry = {
        key: new AreaListenerKey(range, startFixed, endFixed),
        listener: new FormulaGroupAreaListener(
          range,
          cell.GetDocument(),
          cell.aPos,
          this.mnLength,
          startFixed,
          endFixed,
        ),
      };
      this.m_AreaListeners.set(encoded, entry);
    }
    return entry.listener;
  }
  /** Original sorted key teardown ends actual areas,then destroys owned listeners through the existing semantic destructor boundary. @param doc - Actual document. @returns Nothing. */
  endAllGroupListening(doc: ScDocument): void {
    const entries = Array.from(this.m_AreaListeners.values()).sort(
      /** Retains native key ordering during teardown. @param left - First entry. @param right - Second entry. @returns Order. */ (
        left,
        right,
      ) => left.key.compare(right.key),
    );
    for (const { listener } of entries) {
      const range = listener.getListeningRange();
      doc.EndListeningArea(range, !range.equals(BCA_LISTEN_ALWAYS()), listener);
    }
    for (const { listener } of entries) listener.Dispose();
    this.m_AreaListeners.clear();
  }
}
