/** @fileoverview Original ChangesSet typedef for a sequence of ElementChange. */
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { ElementChange, cppu_detail_getUnoType } from "./ElementChange";
/** Original sequence type. */
export type ChangesSet = Sequence<ElementChange>;
/** Constructor for the original sequence typedef using the logical struct size. */
export const ChangesSet = Sequence.specialize<ElementChange>(cppu_detail_getUnoType, 72);
