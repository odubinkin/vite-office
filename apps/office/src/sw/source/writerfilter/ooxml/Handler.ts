/** @fileoverview Native OOXMLBreakHandler property interpretation and deterministic destructor delivery; the remaining Handler.cxx owners are not represented by this slice. */
import type { Id, Properties, Sprm, Stream, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { OOXMLPropertySet } from "./OOXMLPropertySet";

/** Consumed original context operations used by the native break-handler destructor. */
export interface BreakContext {
  getPropertySet(): OOXMLPropertySet;
  clearProps(): void;
}

/** Native break properties are emitted before the byte control marker when context-owned. */
export class OOXMLBreakHandler implements Properties {
  private mnType = 0;
  /** Borrows context and stream for the native lexical handler lifetime. @param mpFastContext - Context, null for postponed breaks. @param mrStream - Stream. @returns Handler. */
  constructor(
    private readonly mpFastContext: BreakContext | null,
    private readonly mrStream: Stream,
  ) {}
  /** Original type selection ignores clear and other attributes. @param name - Resource ID. @param value - Native value. @returns Nothing. */
  attribute(name: Id, value: Value): void {
    if (name === N.LN_CT_Br_type) this.mnType = value.getInt();
  }
  /** Original modifier callback is intentionally empty. @param _sprm - Ignored native modifier. @returns Nothing. */
  sprm(_sprm: Sprm): void {
    void _sprm;
  }
  /** Explicit host binding of the native destructor; call once at the end of the handler's scope. @returns Nothing. */
  dispose(): void {
    if (this.mpFastContext) {
      this.mrStream.props(this.mpFastContext.getPropertySet());
      this.mpFastContext.clearProps();
    }
    const code =
      this.mnType === N.LN_Value_ST_BrType_column
        ? 0x0e
        : this.mnType === N.LN_Value_ST_BrType_page
          ? 0x0c
          : 0x0a;
    this.mrStream.text(Uint8Array.of(code), 1);
  }
}
