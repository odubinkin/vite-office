/** @fileoverview Verifies native independent popup registration and local non-quiet dispatcher ownership. */
import { expect, it } from "vitest";
import { SfxInterface } from "./objface";
import { SfxDispatcher } from "./dispatch";
import { createSfxShell } from "./shell";
it("native resource registration defaults empty and replaces exact names without normalization", /** Checks original objface field contract. @returns Nothing. */ () => {
  const a = new SfxInterface([]),
    b = new SfxInterface([]);
  expect(a.GetPopupMenuName()).toBe("");
  a.RegisterPopupMenu("text");
  expect(a.GetPopupMenuName()).toBe("text");
  expect(b.GetPopupMenuName()).toBe("");
  a.RegisterPopupMenu(" ");
  expect(a.GetPopupMenuName()).toBe(" ");
  a.RegisterPopupMenu("");
  expect(a.GetPopupMenuName()).toBe("");
});
it("native dispatcher selects the first nonempty top interface once and skips unregistered shells", /** Checks original stack owners and synchronous presenter. @returns Nothing. */ () => {
  const d = new SfxDispatcher(),
    a = new SfxInterface([]),
    b = new SfxInterface([]),
    empty = new SfxInterface([]),
    bottom = createSfxShell({}, a),
    top = createSfxShell({}, b),
    overlay = createSfxShell({}, empty),
    names: string[] = [];
  a.RegisterPopupMenu("text");
  b.RegisterPopupMenu("table");
  d.Push(bottom);
  d.Push(top);
  d.Push(overlay);
  d.ExecutePopup(
    /** Captures original resource ownership. @param name - Native resource. @returns Nothing. */ (
      name,
    ) => {
      names.push(name);
    },
  );
  expect(names).toEqual(["table"]);
  d.Pop(top);
  d.ExecutePopup(
    /** Captures fallback native interface. @param name - Native resource. @returns Nothing. */ (
      name,
    ) => {
      names.push(name);
    },
  );
  expect(names).toEqual(["table", "text"]);
  a.RegisterPopupMenu("");
  d.ExecutePopup(
    /** Must not present when every original interface is empty. @param name - Unexpected resource. @returns Nothing. */ (
      name,
    ) => {
      names.push(name);
    },
  );
  expect(names).toHaveLength(2);
});
it("empty native stack does not invent a popup", /** Checks native no-owner outcome. @returns Nothing. */ () => {
  const d = new SfxDispatcher(),
    names: string[] = [];
  d.ExecutePopup(
    /** Captures unexpected owner. @param name - Unexpected resource. @returns Nothing. */ (
      name,
    ) => {
      names.push(name);
    },
  );
  expect(names).toEqual([]);
});
it("unknown nonempty names retain native ownership and presenter errors propagate", /** Prevents browser resource fallbacks from rewriting core selection. @returns Nothing. */ () => {
  const d = new SfxDispatcher(),
    iface = new SfxInterface([]);
  iface.RegisterPopupMenu("missing-resource");
  d.Push(createSfxShell({}, iface));
  expect(
    /** Exercises final presentation failure without changing core ownership. @returns Nothing. */ () =>
      d.ExecutePopup(
        /** Asserts exact native resource before failing. @param name - Original resource. @returns Never. */ (
          name,
        ) => {
          expect(name).toBe("missing-resource");
          throw Error("presenter");
        },
      ),
  ).toThrow("presenter");
  expect(iface.GetPopupMenuName()).toBe("missing-resource");
});
