/** @fileoverview Original MouseEvent IDL declarations; full component, event value and UI implementations are not supplied here. */
import type { InputEvent } from "./InputEvent";
/** Original IDL field contract only. Generated value constructors, copying, destruction and struct type metadata remain unported; this declaration supplies no substitute runtime value owner. */
export interface MouseEvent extends InputEvent {
  /** Original declared Buttons field. */
  Buttons: number;
  /** Original declared X field. */
  X: number;
  /** Original declared Y field. */
  Y: number;
  /** Original declared ClickCount field. */
  ClickCount: number;
  /** Original declared PopupTrigger field. */
  PopupTrigger: boolean;
}
