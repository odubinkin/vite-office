/** @fileoverview Original ordered undo argument rules, duplicate updates and literal UTF-16 replacement. */
import { expect, it } from "vitest";
import { SwRewriter } from "./SwRewriter";
import { SwUndoArg as A } from "../../../inc/SwRewriter";
it("retains native scalar identities and unknown-placeholder fallback", /** Literal pinned header/switch values are independent of rule storage. @returns Nothing. */ () => {
  expect([A.UndoArg1, A.UndoArg2, A.UndoArg3]).toEqual([0, 1, 2]);
  expect([
    SwRewriter.GetPlaceHolder(A.UndoArg1),
    SwRewriter.GetPlaceHolder(A.UndoArg2),
    SwRewriter.GetPlaceHolder(A.UndoArg3),
    SwRewriter.GetPlaceHolder(3 as A),
  ]).toEqual(["$1", "$2", "$3", "$1"]);
});
it("returns unchanged text before any actual rule is added", /** Empty native vector changes no input. @returns Nothing. */ () => {
  expect(new SwRewriter().Apply("$1 $2 $3 🔹")).toBe("$1 $2 $3 🔹");
});
it("replaces all occurrences in actual insertion order and permits cascades", /** Original sequential Apply consumes the result of each earlier rule. @returns Nothing. */ () => {
  const forward = new SwRewriter(),
    reverse = new SwRewriter();
  forward.AddRule(A.UndoArg1, "[$2]");
  forward.AddRule(A.UndoArg2, "done");
  reverse.AddRule(A.UndoArg2, "done");
  reverse.AddRule(A.UndoArg1, "[$2]");
  expect(forward.Apply("$1/$1/$2")).toBe("[done]/[done]/done");
  expect(reverse.Apply("$1/$2")).toBe("[$2]/done");
});
it("updates an existing rule without moving its source vector position", /** Native find_if assigns in place. @returns Nothing. */ () => {
  const value = new SwRewriter();
  value.AddRule(A.UndoArg1, "old");
  value.AddRule(A.UndoArg2, "done");
  value.AddRule(A.UndoArg1, "$2");
  expect(value.Apply("$1")).toBe("done");
});
it.each(["$&", "$`", "$'", "$$", "🔹\u0000$1"])(
  "keeps replacement %j literal and does not recursively revisit its own rule",
  /** Source OUString replacement differs from JS replacement-string interpolation. @param replacement - Literal source text. @returns Nothing. */ (
    replacement,
  ) => {
    const value = new SwRewriter();
    value.AddRule(A.UndoArg1, replacement);
    expect(value.Apply("a$1b$1")).toBe("a" + replacement + "b" + replacement);
  },
);
it("keeps independent real rule owners and supports empty deletion", /** Source value vectors are independent, with empty literal values admitted. @returns Nothing. */ () => {
  const first = new SwRewriter(),
    second = new SwRewriter();
  first.AddRule(A.UndoArg1, "");
  second.AddRule(A.UndoArg1, "separate");
  expect(first.Apply("$1x$1")).toBe("x");
  expect(second.Apply("$1")).toBe("separate");
});

it("copies the source value vector independently before later edits", /** Native implicit copy keeps its original rule values and order. @returns Nothing. */ () => {
  const first = new SwRewriter();
  first.AddRule(A.UndoArg1, "$2");
  first.AddRule(A.UndoArg2, "original");
  const copy = new SwRewriter(first);
  first.AddRule(A.UndoArg2, "changed");
  expect(copy.Apply("$1")).toBe("original");
  expect(first.Apply("$1")).toBe("changed");
});
