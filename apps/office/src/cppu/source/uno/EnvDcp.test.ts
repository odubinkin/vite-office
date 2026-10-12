/** @fileoverview Whole original C and C++ environment descriptor streams, including initialized replacement and retained aliases, through actual shared string owners. */
import { describe, it } from "vitest";
import fixture from "./native-envdcp-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
/** Creates a fresh actual owner realm matching one original process. @param mode - Whole native mode. @returns Existing string owners and actual descriptor boundaries. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    c = await import("../../inc/uno/EnvDcp"),
    wrapper = await import("../../inc/EnvDcp");
  return { ...x, c, wrapper };
}
/** Replays every initialized C output operation with the same retained input/old-output owners as native. @param alias - Select original retained-alias caller. @returns Complete proof. */
async function functions(alias: boolean): Promise<void> {
  const x = await context(alias ? "aliases" : "functions");
  for (const [n, row] of fixture.inputs.entries()) {
    const input = new x.OUString(Uint16Array.from([...row, 0]), row.length);
    for (const purpose of [0, 1]) {
      x.emit(10, n, purpose, alias);
      const out: rtl_uStringSlot = [null];
      let old: rtl_uString | null = null;
      if (alias) {
        out[0] = input.pData;
        x.strings.rtl_uString_acquire(out[0]);
      } else {
        x.strings.rtl_uString_newFromAscii(out, Uint8Array.from([...Buffer.from("old output"), 0]));
        old = out[0] as rtl_uString;
        x.strings.rtl_uString_acquire(old);
      }
      x.text(input.pData);
      x.text(old);
      if (purpose) x.c.uno_EnvDcp_getPurpose(input.pData, out);
      else x.c.uno_EnvDcp_getTypeName(input.pData, out);
      x.text(input.pData);
      x.text(out[0]);
      x.text(old);
      x.emit(out[0] === input.pData, out[0] === old);
      if (old !== null) x.strings.rtl_uString_release(old);
      x.strings.rtl_uString_release(out[0] as rtl_uString);
      x.text(input.pData);
    }
    input.dispose();
  }
  x.emit(90);
  x.finish();
}
describe("original environment descriptor", /** Groups whole initialized original caller proofs. @returns Nothing. */ () => {
  it("matches complete original C replacement stream", /** Replays all initialized outputs. @returns Complete proof. */ async () => {
    await functions(false);
  });
  it("matches complete original retained-alias stream", /** Replays same-pointer sources kept alive by actual owners. @returns Complete proof. */ async () => {
    await functions(true);
  });
  it("matches complete original OUString wrapper stream", /** Replays the original wrapper/default/result lifetimes. @returns Complete proof. */ async () => {
    const x = await context("wrappers");
    for (const [n, row] of fixture.inputs.entries()) {
      const input = new x.OUString(Uint16Array.from([...row, 0]), row.length);
      x.emit(20, n);
      x.text(input.pData);
      const type = x.wrapper.getTypeName(input);
      x.text(type.pData);
      x.text(input.pData);
      const purpose = x.wrapper.getPurpose(input);
      x.text(type.pData);
      x.text(purpose.pData);
      x.text(input.pData);
      x.emit(
        type.pData === input.pData,
        purpose.pData === input.pData,
        type.pData === purpose.pData,
      );
      purpose.dispose();
      type.dispose();
      x.text(input.pData);
      input.dispose();
    }
    x.emit(90);
    x.finish();
  });
});
