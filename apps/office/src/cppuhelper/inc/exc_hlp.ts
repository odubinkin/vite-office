/** @fileoverview Original public exception helpers with an injected host exception ABI; this contract never imports a browser implementation. */
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
/** Platform exception operations corresponding to the native compiler/bridge ABI. */
export interface ExceptionAbi {
  /** Throws an independent actual exception value. @param exception - Borrowed native Any. @returns Never. */ throwException(
    exception: Any,
  ): never;
  /** Captures the current host UNO catch scope. @returns Owned Any. */ getCaughtException(): Any;
}
let abi: ExceptionAbi | undefined;
/** Platform bootstrap installs the realm's actual exception execution ABI. @param value - Host implementation. @returns Nothing. */
export function bindExceptionAbi(value: ExceptionAbi): void {
  abi = value;
}
/** Platform bootstrap is a prerequisite, analogous to native bridge linkage. @returns Current implementation. */
function current(): ExceptionAbi {
  if (!abi) throw new Error("UNO exception ABI must be initialized before exception helper use");
  return abi;
}
/** Original generic public throw contract. @param exception - Borrowed native exception Any. @returns Never. */
export function throwException(exception: Any): never {
  return current().throwException(exception);
}
/** Original zero-argument public capture contract. @returns Owned native Any. */
export function getCaughtException(): Any {
  return current().getCaughtException();
}
