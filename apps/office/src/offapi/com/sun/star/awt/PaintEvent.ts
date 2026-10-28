/** @fileoverview Original PaintEvent IDL declarations; full component, event value and UI implementations are not supplied here. */
import type { Rectangle } from "./Rectangle";
import type { EventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
/** Original IDL field contract only. Generated value constructors, copying, destruction and struct type metadata remain unported; this declaration supplies no substitute runtime value owner. */
export interface PaintEvent extends EventObject {
  /** Original declared UpdateRect field. */
  UpdateRect: Rectangle;
  /** Original declared Count field. */
  Count: number;
}
