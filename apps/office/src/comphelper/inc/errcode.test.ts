/** @fileoverview Packed native diagnostics and source formatter contracts used by metadata commit errors. */
import { OUString } from "../../sal/inc/rtl/ustring";
import { afterEach, expect, it } from "vitest";
import {
  ErrCode,
  ErrCodeMsg,
  ERRCODE_IO_GENERAL,
  ErrCodeArea,
  ErrCodeClass,
  WarningFlag,
} from "./errcode";
import { read, releaseDomScope } from "../../test/native-dom";
afterEach(releaseDomScope);

it("preserves the complete packed I/O error separately from its low-byte code", /** Checks the original general I/O constant and source formatting. @returns Nothing. */ () => {
  expect(ERRCODE_IO_GENERAL.valueOf()).toBe(0x20d);
  expect(ERRCODE_IO_GENERAL.GetCode()).toBe(13);
  expect(ERRCODE_IO_GENERAL.GetArea()).toBe(ErrCodeArea.Io);
  expect(ERRCODE_IO_GENERAL.GetClass()).toBe(ErrCodeClass.General);
  expect(read(ERRCODE_IO_GENERAL.toHexString())).toBe("0x20d");
  expect(read(new ErrCodeMsg(ERRCODE_IO_GENERAL).toString())).toBe(
    "0x20d(Error Area:Io Class:General Code:13)",
  );
});

it("retains warning masking and empty names for unknown enum values", /** Replays the source switch fallthrough and warning branches. @returns Nothing. */ () => {
  const warning = new ErrCode(WarningFlag.Yes, ErrCodeArea.Sw, ErrCodeClass.Write, 255),
    message = new ErrCodeMsg(warning);
  expect(read(message.toString())).toBe("0x80070cff(Warning Area:Sw Class:Write Code:255)");
  expect(message.IsWarning()).toBe(true);
  expect(message.IsError()).toBe(false);
  expect(message.IgnoreWarning().IsSet()).toBe(false);
  const unknown = new ErrCode(0x1fff1fff);
  expect(read(unknown.toString())).toBe("0x1fff1fff(Error Area: Class: Code:255)");
  const normal = new ErrCodeMsg(ERRCODE_IO_GENERAL);
  expect(normal.IgnoreWarning()).toBe(normal);
  expect(read(new ErrCode().toString())).toBe("0x0(Error Area:Io Class:NONE Code:0)");
});

it("formats every declared area and class without converting their packed values into a low-byte error", /** Exercises the original complete enum switches. @returns Nothing. */ () => {
  for (const area of [
    ErrCodeArea.Io,
    ErrCodeArea.Sfx,
    ErrCodeArea.Inet,
    ErrCodeArea.Vcl,
    ErrCodeArea.Svx,
    ErrCodeArea.So,
    ErrCodeArea.Sbx,
    ErrCodeArea.Uui,
    ErrCodeArea.Sc,
    ErrCodeArea.Sd,
    ErrCodeArea.Sw,
  ])
    expect(read(new ErrCode(area, ErrCodeClass.Format, 7).toString())).toContain(
      " Area:" + ErrCodeArea[area] + " Class:Format Code:7)",
    );
  for (const kind of [
    ErrCodeClass.NONE,
    ErrCodeClass.Abort,
    ErrCodeClass.General,
    ErrCodeClass.NotExists,
    ErrCodeClass.AlreadyExists,
    ErrCodeClass.Access,
    ErrCodeClass.Path,
    ErrCodeClass.Locking,
    ErrCodeClass.Parameter,
    ErrCodeClass.Space,
    ErrCodeClass.NotSupported,
    ErrCodeClass.Read,
    ErrCodeClass.Write,
    ErrCodeClass.Unknown,
    ErrCodeClass.Version,
    ErrCodeClass.Format,
    ErrCodeClass.Create,
    ErrCodeClass.Import,
    ErrCodeClass.Export,
    ErrCodeClass.So,
    ErrCodeClass.Sbx,
    ErrCodeClass.Runtime,
    ErrCodeClass.Compiler,
  ])
    expect(read(new ErrCode(ErrCodeArea.Io, kind, 7).toString())).toContain(
      " Class:" + ErrCodeClass[kind] + " Code:7)",
    );
});

it("uses the original unsigned number overload at both 32-bit and 64-bit limits", /** Keeps erased signedness explicit instead of routing warnings through the signed formatter. @returns Nothing. */ () => {
  expect(read(new OUString(OUString.numberUnsigned(0xffffffff)))).toBe("4294967295");
  expect(read(new OUString(OUString.numberUnsigned(0xffffffffffffffffn, 16)))).toBe(
    "ffffffffffffffff",
  );
  expect(read(new OUString(OUString.numberUnsigned(0xffffffffffffffffn)))).toBe(
    "18446744073709551615",
  );
});
