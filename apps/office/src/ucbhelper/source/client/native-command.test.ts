/** @fileoverview Original Command struct defaults, owned member copies and complete native Any transport; no command processor provider is simulated. */
import { afterEach, expect, it } from "vitest";
import {
  Command,
  cppu_detail_getUnoType,
  getCppuType,
} from "../../../offapi/com/sun/star/ucb/Command";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import type { typelib_CompoundTypeDescription as C } from "../../../cppu/inc/typelib/typedescription";
afterEach(releaseDomScope);
it("retains generated empty string, zero handle and void Any defaults", /** No-handle -1 is a client choice, not the generated default. @returns Nothing. */ () => {
  const command = own(new Command());
  expect(command.Name.isEmpty()).toBe(true);
  expect(command.Handle).toBe(0);
  expect(command.Argument.hasValue()).toBe(false);
  expect(getCppuType()).toBe(cppu_detail_getUnoType());
  const description = cppu_detail_getUnoType().getTypeLibType()?.pType as unknown as C;
  expect(description.nMembers).toBe(3);
});
it("copies command payloads through native Any compound addresses", /** Uses a real string argument accepted by UCB commands and an owned result. @returns Nothing. */ () => {
  const arg = own(new Any(u("argument").getDataAddress(), "OUString")),
    source = own(new Command(u("command"), -1, arg)),
    copy = own(new Command(source)),
    envelope = own(new Any(source, cppu_detail_getUnoType)),
    envelopeCopy = own(new Any(envelope)),
    output = own(new Command());
  arg.clear();
  source.Name = u("changed");
  source.Argument.clear();
  expect(copy.Name.equals(u("command"))).toBe(true);
  expect(copy.Handle).toBe(-1);
  const payload = u("");
  expect(copy.Argument.extract(payload, "OUString")).toBe(true);
  expect(payload.equals(u("argument"))).toBe(true);
  expect(envelopeCopy.extract(output, cppu_detail_getUnoType)).toBe(true);
  expect(output.Name.equals(u("command"))).toBe(true);
  expect(output.Handle).toBe(-1);
  expect(output.Argument.extract(payload, "OUString")).toBe(true);
  expect(payload.equals(u("argument"))).toBe(true);
  output.assign(copy).assign(output);
  output.Handle = 0xffffffff;
  expect(output.Handle).toBe(-1);
  output.Handle = 0x80000000;
  expect(output.Handle).toBe(-2147483648);
});
