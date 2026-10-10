/** @fileoverview Checks the shared original script discriminator against compiled pinned native declarations. */
import { expect, it } from "vitest";
import { SvtScriptType } from "./languageoptions";
import native from "./native-script-type-cases.json";

it("retains all original shared UInt8 script values", /** Compares all original shared discriminator constants. @returns Nothing. */ () => {
  expect([
    SvtScriptType.NONE,
    SvtScriptType.LATIN,
    SvtScriptType.ASIAN,
    SvtScriptType.COMPLEX,
    SvtScriptType.UNKNOWN,
  ]).toEqual(native.scriptTypes);
});
