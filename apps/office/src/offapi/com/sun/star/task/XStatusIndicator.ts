/** @fileoverview Native XStatusIndicator.idl callback contract; host owners provide actual progress presentation and lifecycle. */
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
/** Original progress callback surface; this declaration registers no UNO service or implementation. */
export interface XStatusIndicator {
  start(text: OUStringConstReference, range: number): void;
  end(): void;
  setText(text: OUStringConstReference): void;
  setValue(value: number): void;
  reset(): void;
}
