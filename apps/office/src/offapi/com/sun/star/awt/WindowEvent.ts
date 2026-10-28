/** @fileoverview Original WindowEvent IDL declarations; full component, event value and UI implementations are not supplied here. */
import type { EventObject } from "../../../../../udkapi/com/sun/star/lang/EventObject";
/** Original IDL field contract only. Generated value constructors, copying, destruction and struct type metadata remain unported; this declaration supplies no substitute runtime value owner. */
export interface WindowEvent extends EventObject {
  /** Original declared X field. */
  X: number;
  /** Original declared Y field. */
  Y: number;
  /** Original declared Width field. */
  Width: number;
  /** Original declared Height field. */
  Height: number;
  /** Original declared LeftInset field. */
  LeftInset: number;
  /** Original declared TopInset field. */
  TopInset: number;
  /** Original declared RightInset field. */
  RightInset: number;
  /** Original declared BottomInset field. */
  BottomInset: number;
}
