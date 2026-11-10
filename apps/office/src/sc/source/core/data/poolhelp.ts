/** @fileoverview Native ScPoolHelper intrusive lifetime and General formatter ownership/options from poolhelp.cxx;native edit-engine pool metrics and laziness are retained. */
import { CreatePool } from "../../../../editeng/inc/editeng";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { SimpleReferenceObject } from "../../../../salhelper/source/simplereferenceobject";
import { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { NfEvalDateFormat } from "../../../../svl/inc/zforlist";
import { ScDocOptions, type ScDocOptionsConstReference } from "../../../inc/docoptio";
import { ScDocumentPool } from "./docpool";
import { ScStyleSheetPool } from "../../../inc/stlpool";
import type { ScDocument } from "../../../inc/document";

/** Actual native intrusive resource owner;document fields erase rtl::Reference syntax while retaining its acquire/release operations. */
export class ScPoolHelper extends SimpleReferenceObject {
  private readonly aOpt = new ScDocOptions();
  private pFormTable: SvNumberFormatter | null = null;
  private mpEditEnginePool: SfxItemPool | null = null;
  private readonly pDocPool = new ScDocumentPool();
  private readonly mxStylePool: ScStyleSheetPool;
  /** Allocates document and style pools in native order. @param source - Actual source document. @returns Helper. */
  constructor(source: ScDocument) {
    super();
    this.mxStylePool = new ScStyleSheetPool(this.pDocPool, source);
  }
  /** Borrows the actual item pool. @returns Pool. */
  GetDocPool(): ScDocumentPool {
    return this.pDocPool;
  }
  /** Borrows the actual style pool. @returns Pool. */
  GetStylePool(): ScStyleSheetPool {
    return this.mxStylePool;
  }
  /** Original lazy document edit pool with the native hundredth-millimetre default. @returns Borrowed edit-engine item pool. */
  GetEditEnginePool(): SfxItemPool {
    if (this.mpEditEnginePool === null) {
      const pool = CreatePool();
      pool.SetDefaultMetric(MapUnit.Map100thMM);
      this.mpEditEnginePool = pool;
    }
    return this.mpEditEnginePool;
  }
  /** Original lazy actual formatter instance. Unsupported pattern/color/edit-engine services remain explicit boundaries;no fake formatter or callback is installed. @returns Borrowed owned formatter. */
  GetFormTable(): SvNumberFormatter {
    this.pFormTable ??= this.CreateNumberFormatter();
    return this.pFormTable;
  }
  /** Original represented formatter creation/options order. The source custom-number-color callback is unrepresented in the admitted General/NatNum0 slice and is not replaced by a dummy callback. @returns Actual owned formatter. */
  CreateNumberFormatter(): SvNumberFormatter {
    if (!this.mxStylePool.GetDocument()) throw new Error("Source style-pool document assertion");
    const formatter = new SvNumberFormatter(LANGUAGE_SYSTEM);
    formatter.SetEvalDateFormat(NfEvalDateFormat.InternationalThenFormat);
    const day: [number] = [0],
      month: [number] = [0],
      year: [number] = [0];
    this.aOpt.GetDate(day, month, year);
    formatter.ChangeNullDate(day[0], month[0], year[0]);
    formatter.ChangeStandardPrec(this.aOpt.GetStdPrecision());
    formatter.SetYear2000(this.aOpt.GetYear2000());
    return formatter;
  }
  /** Retains formatter options by value without allocating the original lazy formatter. @param options - Source options. @returns Nothing. */
  SetFormTableOpt(options: ScDocOptionsConstReference): void {
    this.aOpt.assign(options);
    if (this.pFormTable) {
      const day: [number] = [0],
        month: [number] = [0],
        year: [number] = [0];
      this.aOpt.GetDate(day, month, year);
      this.pFormTable.ChangeNullDate(day[0], month[0], year[0]);
      this.pFormTable.ChangeStandardPrec(this.aOpt.GetStdPrecision());
      this.pFormTable.SetYear2000(this.aOpt.GetYear2000());
    }
  }
  /** Clears the consumed source binding. General-only formatting has no custom-color callback. @returns Nothing. */
  SourceDocumentGone(): void {
    this.mxStylePool.SetDocument(null);
  }
  /** Original represented destructor destroys the owned formatter before releasing remaining shared-resource state. GC reclaims the released pool after its remaining value owners finish. @returns Nothing. */
  protected override destroy(): void {
    this.mpEditEnginePool = null;
    this.pFormTable?.dispose();
    this.pFormTable = null;
    super.destroy();
  }
}
