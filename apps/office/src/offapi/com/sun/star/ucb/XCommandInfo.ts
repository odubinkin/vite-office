/** @fileoverview Complete original XCommandInfo.idl declarations and normal CPPUMaker interface type binding; no command, interaction or stream provider is manufactured. */
import type { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_mi_interface_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import type { XInterface } from "../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { CommandInfo } from "./CommandInfo";
/** Complete original IDL declaration, with its original direct base. */
export interface XCommandInfo extends XInterface {
  /** Original complete command-info sequence. @returns Owned sequence. */
  getCommands(): Sequence<CommandInfo>;
  /** Original exact-name lookup. @param name - Borrowed command name. @returns Owned command descriptor. */
  getCommandInfoByName(name: OUStringConstReference): CommandInfo;
  /** Original handle lookup. @param handle - Signed32 handle. @returns Owned command descriptor. */
  getCommandInfoByHandle(handle: number): CommandInfo;
  /** Original name membership. @param name - Borrowed name. @returns Membership. */
  hasCommandByName(name: OUStringConstReference): boolean;
  /** Original handle membership. @param handle - Signed32 handle. @returns Membership. */
  hasCommandByHandle(handle: number): boolean;
}

const the_type: [R | null] = [null];
/** Original normal generated cached getter uses the shared CPPU factory and original declared direct base. @returns Borrowed cached Type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_mi_interface_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.XCommandInfo\0"),
      0,
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original deprecated Reference pointer overload. @param reference - Ignored original pointer. @returns Borrowed type. */
export function getCppuType(reference?: Reference<XCommandInfo> | null): Type {
  void reference;
  return UnoType.get(["Reference", cppu_detail_getUnoType]);
}
/** Original generated interface static API. */
export const XCommandInfo = Object.freeze({
  /** Original ignored void pointer overload. @param unused - Ignored pointer. @returns Borrowed type. */
  static_type(unused?: unknown): Type {
    void unused;
    return UnoType.get(cppu_detail_getUnoType);
  },
});
