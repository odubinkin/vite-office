/** @fileoverview Original UNO sequence alias of the existing shared SAL sequence declaration; the actual zero-count destruction export reuses its source owner; other sequence engine operations remain pending. */
import type { sal_Sequence } from "../../../sal/inc/types";
/** Original public typedef reuses the SAL record. */
export type uno_Sequence = sal_Sequence;

/** Original zero-count C destruction declaration. */
export { uno_type_sequence_destroy } from "../../source/uno/sequence";
