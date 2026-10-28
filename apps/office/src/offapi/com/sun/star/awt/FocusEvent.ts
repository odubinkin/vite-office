/** @fileoverview Original FocusEvent IDL declarations; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { EventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
/** Original IDL field contract only. Generated value constructors, copying, destruction and struct type metadata remain unported; this declaration supplies no substitute runtime value owner. */
export interface FocusEvent extends EventObject {
  /** Original declared FocusFlags field. */
  FocusFlags: number;
  /** Original declared NextFocus field. */
  NextFocus: Reference<XInterface>;
  /** Original declared Temporary field. */
  Temporary: boolean;
}
