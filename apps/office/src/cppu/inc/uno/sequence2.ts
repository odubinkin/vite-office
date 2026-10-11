/** @fileoverview Original UNO sequence alias of the existing shared SAL sequence declaration; all original C engine declarations reuse their actual shared sequence source owner. */
import type { sal_Sequence } from "../../../sal/inc/types";
/** Original public typedef reuses the SAL record. */
export type uno_Sequence = sal_Sequence;

/** Original zero-count C destruction declaration. */
export {
  uno_type_sequence_construct,
  uno_sequence_construct,
  uno_type_sequence_realloc,
  uno_sequence_realloc,
  uno_type_sequence_reference2One,
  uno_sequence_reference2One,
  uno_type_sequence_assign,
  uno_sequence_assign,
  uno_type_sequence_destroy,
} from "../../source/uno/sequence";
