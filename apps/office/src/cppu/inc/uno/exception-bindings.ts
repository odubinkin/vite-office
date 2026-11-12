/** @fileoverview JavaScript compiler RTTI linkage for actual generated UNO exception classes. Registration links declarations only; it does not construct values or initialize UNO types. This platform-neutral compiler metadata contract owns declarations only; host exception execution is injected separately. */
import type { Exception } from "../com/sun/star/uno/Exception";
import type { Type } from "../com/sun/star/uno/Type";
/** A linked generated exception declaration and its existing implicit copy constructor/type getter. */
export interface ExceptionBinding {
  readonly name: string;
  readonly Constructor: new (source: never) => Exception;
  readonly type: () => Type;
}
const byName = new Map<string, ExceptionBinding>();
const byConstructor = new Map<object, ExceptionBinding>();
/** Compiler-emitted linkage corresponding to the C++ exception class's RTTI symbol. No getter is evaluated during linking. @param binding - Actual generated declaration. @returns Nothing. */
export function linkException(binding: ExceptionBinding): void {
  byName.set(binding.name, binding);
  byConstructor.set(binding.Constructor, binding);
}
/** Looks up the actual linked declaration by its native UNO name. @param name - Exact type name. @returns Linked declaration or absent binding. */
export function exceptionBindingByName(name: string): ExceptionBinding | undefined {
  return byName.get(name);
}
/** Looks up the exact dynamic generated class of a caught value, without ancestor substitution. @param value - Actual thrown value. @returns Linked declaration or absent binding. */
export function exceptionBindingFor(value: Exception): ExceptionBinding | undefined {
  return byConstructor.get(value.constructor);
}
