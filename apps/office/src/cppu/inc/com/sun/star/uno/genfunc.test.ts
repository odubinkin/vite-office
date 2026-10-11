/** @fileoverview Complete original genfunc C++ virtual callbacks, reserved interface transfer, actual Any destruction and RuntimeException/other throw behavior through real public owners. */
import { expect, it } from "vitest";
import fixture from "./native-any-ownership-cases.json";
import { createUnoNativeCppInputs } from "../../../../../../test/uno-native-cpp-values";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type { UnoNativeCppWitness } from "../../../../../../test/uno-native-cpp-values";
it("matches complete original C++ callback query ownership and exception cleanup", /** Replays every authored virtual result and actual source pointer count/callback event. @returns Complete replay. */ async () => {
  const x = await createUnoNativeCppInputs(fixture.captures.callbacks),
    w = x.witness(41),
    root = x.witness(91);
  w.root = root;
  x.genfunc.cpp_acquire(w);
  x.genfunc.cpp_release(w);
  const r = x.type(C.INTERFACE);
  x.emit(x.genfunc.cpp_queryInterface(null, r) === null);
  for (let iteration = 0; iteration < 2; iteration++)
    for (let mode = 0; mode < 5; mode++)
      for (let nullRoot = 0; nullRoot < 2; nullRoot++) {
        w.mode = mode;
        w.root = nullRoot ? null : root;
        x.emit(iteration, mode, nullRoot);
        try {
          const p = x.genfunc.cpp_queryInterface(w, r);
          x.emit(p === null);
          if (p !== null) {
            const actual = p as UnoNativeCppWitness;
            x.emit(actual.id, actual.count);
            x.genfunc.cpp_release(p);
          }
          x.emit(0);
        } catch (error) {
          expect(mode).toBe(4);
          expect(error).toBeInstanceOf(Error);
          x.emit(1);
        }
        x.emit(w.count, root.count);
        x.ref(r);
      }
  x.dispose();
  x.finish();
});
