/** @fileoverview Original weak.hxx object declarations and inline acquisition helpers; source/weak owns the same actual OWeakObject implementation. */
import { OWeakObject } from "../source/weak";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import type { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
export { OWeakObject };
/** Original constructor-service convenience function requires a nonnull object and acquires it once. @param instance - Actual newly created object. @returns Acquired root pointer. */
export function acquire(instance: OWeakObject | null): XInterface {
  if (instance === null) throw new Error("assert(instance != NULL)");
  instance.acquire();
  return instance;
}
/** Original internal pointer conversion performs no acquisition and preserves null. @param instance - Original object pointer. @returns Borrowed weak pointer. */
export function getXWeak(instance: OWeakObject | null): XWeak | null {
  return instance;
}
