/** @fileoverview Source-backed UNO InputEvent name binding retains the DOM isolation guard. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { getProtectedBrowserGlobalReferences } from "./check-module-boundaries.mjs";
const prefix = "offapi/com/sun/star/awt/";
it("admits original type-only IDL declarations while rejecting DOM operations and false bindings", /** Uses actual source contracts and adversarial neighboring/global references. @returns Nothing. */ () => {
  for (const file of ["InputEvent.ts", "KeyEvent.ts", "MouseEvent.ts"]) {
    const path = prefix + file,
      source = readFileSync("apps/office/src/" + path, "utf8");
    expect(getProtectedBrowserGlobalReferences(source, path)).toEqual([]);
    expect(getProtectedBrowserGlobalReferences(source, prefix + "OtherEvent.ts")).toEqual([
      "InputEvent",
    ]);
    for (const appended of [
      'new InputEvent("input");',
      "globalThis.InputEvent;",
      "let event: InputEvent;",
      "let worker: Worker;",
    ])
      expect(getProtectedBrowserGlobalReferences(source + "\n" + appended, path)).toEqual([
        appended.includes("Worker") ? "Worker" : "InputEvent",
      ]);
    if (file !== "InputEvent.ts") {
      for (const changed of [
        source.replace('from "./InputEvent"', 'from "./OtherEvent"'),
        source.replace("import type { InputEvent }", "import { InputEvent }"),
        source.replace("import type { InputEvent }", "import type { DOMEvent as InputEvent }"),
        source.replace("import type { InputEvent }", "import type InputEvent"),
        source.replace("extends InputEvent", "extends globalThis.InputEvent"),
      ])
        expect(getProtectedBrowserGlobalReferences(changed, path)).toEqual(["InputEvent"]);
    } else {
      for (const changed of [
        source.replace("Modifiers: number", "Modifiers: string"),
        source.replace("extends EventObject", "extends OtherEvent"),
        source.replace('lang/EventObject"', 'lang/OtherEvent"'),
      ])
        expect(getProtectedBrowserGlobalReferences(changed, path)).toEqual(["InputEvent"]);
    }
  }
  expect(getProtectedBrowserGlobalReferences("let event: InputEvent;")).toEqual(["InputEvent"]);
});
