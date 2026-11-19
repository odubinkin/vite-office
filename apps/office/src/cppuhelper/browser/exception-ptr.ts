/** @fileoverview Real JavaScript compiler exception-pointer ABI over actual generated UNO Any/exception values and VM-owned host objects. The standard-library facade stays neutral; native C++ addresses, exception heap, atomic/TLS and nonobject JS throws remain unqualified. */
import { bindExceptionPointerAbi } from "../../external/libcxx/exception";
import { Exception } from "../../cppu/inc/com/sun/star/uno/Exception";
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { withCaughtException } from "../../cppu/inc/uno/exception-context";
import { getCaughtException, throwException } from "../inc/exc_hlp";
/** One genuine generated value or ordinary VM exception object. */
type Value = { kind: "uno"; data: Any } | { kind: "host"; data: object };
/** Actual compiler-runtime retained exception, shared by source pointer copies. */
type Cell = { value: Value; owners: number };
const cells = new WeakMap<object, Cell>();
/** The ABI receives only pointers it produced; no injected exception type/value provider is consulted. @param pointer - Actual opaque pointer. @returns Same compiler cell. */
function value(pointer: object): Cell {
  return pointer as Cell;
}
/** Actual std::current_exception host execution. @param error - Actual catch object. @returns Acquired opaque pointer. */
function current(error: unknown): object {
  if ((typeof error !== "object" || error === null) && typeof error !== "function")
    throw new Error("exception_ptr nonobject JavaScript exception ABI is not implemented");
  const object = error as object,
    previous = cells.get(object);
  if (previous && previous.owners > 0) {
    ++previous.owners;
    return previous;
  }
  const payload: Value =
    error instanceof Exception
      ? { kind: "uno", data: withCaughtException(error, getCaughtException) }
      : { kind: "host", data: object };
  const result: Cell = { value: payload, owners: 1 };
  cells.set(object, result);
  return result;
}
/** Original runtime exception-reference acquisition. @param pointer - Actual opaque pointer. @returns Nothing. */
function acquire(pointer: object): void {
  ++value(pointer).owners;
}
/** Original final runtime exception release; VM owns ordinary host storage. @param pointer - Actual opaque pointer. @returns Nothing. */
function release(pointer: object): void {
  const previous = value(pointer);
  if (--previous.owners === 0 && previous.value.kind === "uno") previous.value.data.dispose();
}
/** Actual primary-exception rethrow. Generated values use the installed real exception ABI; subsequent capture retains logical pointer identity. @param pointer - Actual nonempty exception pointer. @returns Never. */
function rethrow(pointer: object): never {
  const current = value(pointer);
  if (current.value.kind === "host") throw current.value.data;
  try {
    throwException(current.value.data);
  } catch (error) {
    if ((typeof error === "object" && error !== null) || typeof error === "function")
      cells.set(error as object, current);
    throw error;
  }
}
/** Composition links the actual host operations; kernel code imports only the neutral standard-library facade. @returns Nothing. */
export function initializeExceptionPointerAbi(): void {
  bindExceptionPointerAbi({ current, acquire, release, rethrow });
}
