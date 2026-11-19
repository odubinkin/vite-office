/** @fileoverview Original ScModelObj shell/document getters, actual native observer registration and represented Dying notification. XServiceInfo uses the original real UNO query and service values. Full UNO/property/rendering/base-model event services remain unported; not a complete spreadsheet component. */
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../../../cppu/inc/com/sun/star/uno/Type";
import { XServiceInfo } from "../../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { queryInterface } from "../../../../cppuhelper/inc/queryinterface";
import { supportsService } from "../../../../cppuhelper/inc/supportsservice";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";

import { SfxBaseModel } from "../../../../sfx2/source/doc/sfxbasemodel";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import type { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
import type { ScDocShell } from "../docshell/docsh";
import type { ScDocument } from "../../../inc/document";
/** Original source constexpr Unicode value binding. @param value - Compiler-known original literal. @returns Borrowed static string. */
function literal(value: string): OUStringConstReference {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        value + "\0",
        /** Original code unit. @param unit - Literal character. @returns Unit. */ (unit) =>
          unit.charCodeAt(0),
      ),
    ),
  );
}
const SCMODELOBJ_SERVICE = literal("com.sun.star.sheet.SpreadsheetDocument");
const SCDOCSETTINGS_SERVICE = literal("com.sun.star.sheet.SpreadsheetDocumentSettings");
const SCDOC_SERVICE = literal("com.sun.star.document.OfficeDocument");
/** Original actual model with represented XServiceInfo queries; other Calc interfaces and formatter aggregation remain unported. */
export class ScModelObj extends SfxBaseModel implements XServiceInfo {
  /** Original represented constructor registers on the document's actual UNO broadcaster in addition to the base shell registration. @param pDocShell - Actual shell, optionally null for options-only construction. @returns Model. */
  constructor(private pDocShell: ScDocShell | null) {
    super(pDocShell);
    if (pDocShell !== null) pDocShell.GetDocument().AddUnoObject(this);
  }
  /** Original direct interface query precedes base fallback. Only fully implemented XServiceInfo is admitted here; other native queries/formatter aggregation remain unported. @param type - Actual demanded UNO type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    const result = queryInterface(type, [[XServiceInfo.static_type, this]]);
    if (result.hasValue()) return result;
    try {
      return super.queryInterface(type);
    } finally {
      result.dispose();
    }
  }
  /** Original implementation identity is independent of shell state. @returns Owned Unicode name. */
  getImplementationName(): OUString {
    return new OUString(
      new OUStringLiteral(Uint16Array.of(83, 99, 77, 111, 100, 101, 108, 79, 98, 106, 0)),
    );
  }
  /** Original common exact service predicate. @param name - Borrowed native service name. @returns Original membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original ordered three-entry service initializer list. @returns Actual owned UNO sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const values = [SCMODELOBJ_SERVICE, SCDOCSETTINGS_SERVICE, SCDOC_SERVICE];
    return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
      {
        /** Original initializer-list source cell. @param offset - Initializer byte offset. @returns Borrowed string cell. */
        get(offset: number): rtl_uStringSlot {
          return [(values[offset / 8] as OUStringConstReference).pData];
        },
      },
      values.length,
    );
  }
  /** Original nullable access through the shell, not a captured or copied document. @returns Actual current document. */
  GetDocument(): ScDocument | null {
    return this.pDocShell?.GetDocument() ?? null;
  }
  /** Original nullable Calc shell identity. @returns Borrowed shell. */
  GetEmbeddedObject(): ScDocShell | null {
    return this.pDocShell;
  }
  /** Original represented Dying pointer invalidation and unconditional base dispatch. Formatter aggregation, render caches and calculate-event branches remain unported. @param broadcaster - Native source. @param hint - Actual hint. @returns Nothing. */
  override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void {
    if (hint.GetId() === SfxHintId.Dying) this.pDocShell = null;
    if (hint.GetId() === SfxHintId.DataChanged)
      throw new Error(
        "ScModelObj render-cache and calculate-event notification services are not implemented",
      );
    super.Notify(broadcaster, hint);
  }
  /** Explicit native destructor binding removes document registration before destroying the model base. Aggregation/printing owners remain unported. @returns Nothing. */
  override Dispose(): void {
    if (this.pDocShell !== null) this.pDocShell.GetDocument().RemoveUnoObject(this);
    super.Dispose();
  }
}
