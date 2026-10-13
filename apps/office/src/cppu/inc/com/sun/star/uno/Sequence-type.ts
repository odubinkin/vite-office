/** @fileoverview Original Sequence.hxx type-helper bodies and Sequence<E>::s_pType member-static storage, shared with the actual public Sequence value class. Explicit erased C++ argument keys represent compiler specialization identity; real typelib factory and borrowed Type owners remain shared. */
import type { Type } from "./Type";
import type { typelib_TypeDescriptionReference as R } from "../../../../typelib/typedescription";
import { typelib_static_sequence_type_init } from "../../../../typelib/typedescription";
import {
  UnoType,
  getTypeFavourUnsigned,
  getTypeFavourChar,
  getTypeFromTypeDescriptionReference,
  unoTypeArgumentIdentity,
} from "../../../../unotype";
import type { UnoTypeArgument } from "../../../../unotype";
/** Original Sequence<E>::s_pType, initially NULL for each exact E. This is the real shared member-static cell used by both favourUnsigned and getCppuSequenceType. */
const s_pType = new Map<unknown, [R | null]>();
/** Original getTypeFavourChar<Sequence<T>> independent function-static td, initially NULL for each T. */
const charTypes = new Map<unknown, [R | null]>();
/** Adapts original compiler-emitted member/function-static pointer cell storage without a UNO type registry or new factory. @param cells - Original storage family. @param element - Exact erased C++ element type. @returns Stable original pointer cell, initially null. */
function cell(cells: Map<unknown, [R | null]>, element: UnoTypeArgument): [R | null] {
  const key = unoTypeArgumentIdentity(element);
  let slot = cells.get(key);
  if (slot === undefined) {
    slot = [null];
    cells.set(key, slot);
  }
  return slot;
}
/** Original getTypeFavourUnsigned<Sequence<T>> body at its original source owner. @param element - Exact Sequence<T> template argument. @returns Borrowed member-static Type view. */
export function getSequenceTypeFavourUnsigned(element: UnoTypeArgument): Type {
  const slot = cell(s_pType, element);
  if (slot[0] === null)
    typelib_static_sequence_type_init(slot, getTypeFavourUnsigned(element).getTypeLibType() as R);
  return getTypeFromTypeDescriptionReference(slot);
}
/** Original getTypeFavourChar<Sequence<T>> body with its separate function-static td. @param element - Exact Sequence<T> template argument. @returns Borrowed function-static Type view. */
export function getSequenceTypeFavourChar(element: UnoTypeArgument): Type {
  const slot = cell(charTypes, element);
  if (slot[0] === null)
    typelib_static_sequence_type_init(slot, getTypeFavourChar(element).getTypeLibType() as R);
  return getTypeFromTypeDescriptionReference(slot);
}
/** Original generic legacy sequence type function delegates to favourUnsigned. @param type - Exact erased Sequence<E> argument. @returns Original Type reference. */
export function getCppuType(type: readonly ["Sequence", UnoTypeArgument]): Type {
  return getTypeFavourUnsigned(type);
}
/** Original supplied-element helper shares Sequence<E>::s_pType and uses rElementType only before its first initialization. No replacement or consistency check is added on later calls. @param element - Exact E specialization. @param rElementType - Original caller's Type value. @returns Original shared member-static Type reference. */
export function getCppuSequenceType(element: UnoTypeArgument, rElementType: Type): Type {
  const slot = cell(s_pType, element);
  if (slot[0] === null) typelib_static_sequence_type_init(slot, rElementType.getTypeLibType() as R);
  return getTypeFromTypeDescriptionReference(slot);
}
/** Original independent char-sequence function-static cell. */
const charSequence: [R | null] = [null];
/** Original getCharSequenceCppuType helper; does not share its pointer-cell address with another template family. @returns Borrowed original char-sequence Type. */
export function getCharSequenceCppuType(): Type {
  if (charSequence[0] === null)
    typelib_static_sequence_type_init(
      charSequence,
      UnoType.get("UnoCharType").getTypeLibType() as R,
    );
  return getTypeFromTypeDescriptionReference(charSequence);
}
