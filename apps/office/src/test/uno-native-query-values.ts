/** @fileoverview Shared complete native binary query and dispatcher caller observations, extracted unchanged from equality replay and reusing actual type/Any/default/storage/callback owners. */
import { createUnoNativeInputs } from "./uno-native-values";
import type { UnoNativeCapture } from "./uno-native-values";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../cppu/inc/typelib/typeclass";
import type { uno_Any } from "../cppu/inc/uno/any2";
import type { uno_DispatchMethod } from "../cppu/inc/uno/dispatcher";
/** Loads original process/caller input state with real shared owners, then supplies only the authored FFI witness. @param capture - Original full process observations. @returns Actual shared inputs and unchanged query witness. */
export async function createUnoNativeQueryInputs(capture: UnoNativeCapture) {
  const x = await createUnoNativeInputs(capture, true);
  let seenMethod: D | null = null;
  /** Caller interface acquires its supplied root; this implements only the authored FFI witness. @param p - Witness. @param r - Actual demanded type. @returns Caller root. */
  function query(p: unknown, r: R): unknown {
    const w = p as ReturnType<typeof witness>;
    x.emit(4, w.id, r.eTypeClass, w.mode);
    if (w.root) {
      x.acquire(w.root);
      return w.root;
    }
    return null;
  }
  /** Creates the same binary callback record with caller-owned root and mode. @param id - Source label. @param root - Supplied root. @returns Caller FFI record. */
  function witness(id: number, root: ReturnType<typeof x.witness> | null) {
    const w = Object.assign(x.witness(id), { root, mode: 0 });
    w.count = 1000;
    const dispatch: uno_DispatchMethod =
      /** Real caller dispatcher observes only arguments and constructs actual original Any values, never a library substitute. @param p - Witness. @param member - Borrowed actual method. @param output - Return Any. @param args - Original type-reference argument. @param exception - In/out exception. @returns Nothing. */ (
        p,
        member,
        output,
        args,
        exception,
      ): void => {
        const q = p as unknown as typeof w,
          returned = output as uno_Any;
        x.emit(
          5,
          q.id,
          member.eTypeClass,
          exception[0] !== null,
          ((args as unknown[])[0] as [R])[0].eTypeClass,
        );
        x.emit(seenMethod === member);
        seenMethod = member as D;
        x.desc(member as D);
        if (q.mode === 3) {
          const held = x.name("dispatch"),
            src = x.sample(x.exc.pWeakRef as R, held.pData, q, 1);
          x.any.uno_type_any_construct(
            exception[0] as uno_Any,
            src,
            x.exc.pWeakRef as R,
            x.acquire,
          );
          x.globals.uno_type_destructData(src, x.exc.pWeakRef as R, x.release);
          held.dispose();
          return;
        }
        exception[0] = null;
        if (q.mode === 0)
          x.any.uno_type_any_construct(returned, [q.root], x.type(C.INTERFACE), x.acquire);
        else if (q.mode === 1) x.any.uno_type_any_construct(returned, null, x.type(C.VOID), null);
        else {
          const held = x.name("other");
          x.any.uno_type_any_construct(returned, [held.pData], x.type(C.STRING), null);
          held.dispose();
        }
      };
    Object.defineProperty(w, "pDispatcher", { value: dispatch, writable: true });
    return w;
  }
  return { ...x, query, witness };
}
