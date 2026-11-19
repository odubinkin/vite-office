/** @fileoverview Actual MediaDescriptor fragment helper through the registered native URI service and borrowed process context. No URL trust or authentication policy is replaced. */
import { afterEach, expect, it } from "vitest";
import { removeFragment } from "./mediadescriptor.uri";
import { u, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it.each([
  ["file:///document.docx#bookmark", "file:///document.docx"],
  ["file:///a%23b.xlsx#", "file:///a%23b.xlsx"],
  ["relative/字.docx?x=%23#part", "relative/字.docx?x=%23"],
  ["#fragment", ""],
  ["file:///a.docx", "file:///a.docx"],
  ["vnd.sun.star.script:#fragment", "vnd.sun.star.script:#fragment"],
])(
  "removes only the actual fragment of %s",
  /** Executes the source helper and original factory/service path. @param input - Native input. @param expected - Expected native URI. @returns Nothing. */ (
    input,
    expected,
  ) => {
    expect(read(removeFragment(u(input)))).toBe(expected);
  },
);
