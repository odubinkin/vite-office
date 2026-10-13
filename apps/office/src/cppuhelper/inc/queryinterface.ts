/** @fileoverview Original cppuhelper/queryinterface.hxx1..14/17..19 template family: sequential declared static_type comparisons and actual acquired Any result. Explicit compile-time argument erasure adds no inferred type or provider. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
/** Original declared InterfaceN::static_type and its actual pointer; the getter is not inferred from a possibly null pointer. */
export type QueryInterfaceArgument = readonly [staticType: () => Type, pointer: XInterface | null];
/** Original overload arities1..14/17..19, enforced at the erased compile-time call boundary. */
type QueryInterfaceArity =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 17 | 18 | 19;
/** Original ordered template/pointer argument list, with no runtime validation or fallback policy. */
export type QueryInterfaceArguments = readonly [
  QueryInterfaceArgument,
  ...QueryInterfaceArgument[],
] & { readonly length: QueryInterfaceArity };
/** Original1..14/17..19 overload bodies share this erased sequential expression: later static types are untouched after the first match. Matching NULL returns typed NULL Any; mismatch returns genuine empty Any. No virtual queryInterface is invoked. @param demanded - Borrowed original rType. @param arguments_ - Original declared interface/pointer pairs. @returns Acquired original Any. */
export function queryInterface(demanded: Type, arguments_: QueryInterfaceArguments): Any {
  for (const [staticType, pointer] of arguments_)
    if (demanded.operatorEqual(staticType())) return new Any([pointer], demanded);
  return new Any();
}
