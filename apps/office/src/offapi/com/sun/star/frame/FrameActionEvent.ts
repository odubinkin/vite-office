/** @fileoverview Original FrameActionEvent IDL declarations; full component, event value and UI implementations are not supplied here. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { FrameAction } from "./FrameAction";
import type { XFrame } from "./XFrame";
import type { EventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
/** Original IDL field contract only. Generated value constructors, copying, destruction and struct type metadata remain unported; this declaration supplies no substitute runtime value owner. */
export interface FrameActionEvent extends EventObject {
  /** Original declared Frame field. */
  Frame: Reference<XFrame>;
  /** Original declared Action field. */
  Action: FrameAction;
}
