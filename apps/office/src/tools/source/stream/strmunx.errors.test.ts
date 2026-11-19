/** @fileoverview Original SvFileStream error-table vectors and complete native I/O macro values, with source-table/header provenance. No host errno, source state injection or file-open policy change. */
import { afterEach, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as code from "../../../comphelper/inc/errcode";
import { oslFileError as E } from "../../../sal/inc/osl/file";
import { GetSvError, GetSvErrorErrno } from "./strmunx.errors";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, read, releaseDomScope } from "../../../test/native-dom";
import { SvMemoryStream } from "./stream.native";
afterEach(releaseDomScope);
it("ports every original integer error vector and preserves the unknown/sentinel fallback", /** Source order, WASI mapping and packed diagnostics. @returns Nothing. */ () => {
  for (const [values, cls, low] of [
    [[0], 0, 0],
    [[2, 63, 69, 74], 5, 7],
    [[8], 2, 13],
    [[16, 6], 7, 8],
    [[28], 8, 26],
    [[33, 41], 9, 14],
    [[44], 3, 2],
    [[31, 32, 36, 47, 54], 3, 28],
    [[20], 16, 25],
    [[51], 9, 9],
    [[-1, 99, 0xffff], 2, 13],
  ] as const)
    for (const value of values) {
      const result = GetSvErrorErrno(value);
      expect(result.GetArea()).toBe(0);
      expect(result.GetClass()).toBe(cls);
      expect(result.GetCode()).toBe(low);
    }
});
it("ports every original OSL enum vector without conflating it with errno integers", /** The two overloads have different results for equal numbers. @returns Nothing. */ () => {
  for (const [values, cls, low] of [
    [[E.None], 0, 0],
    [[E.ACCES, E.PERM, E.ROFS], 5, 7],
    [[E.BADF], 2, 13],
    [[E.DEADLK, E.AGAIN], 7, 8],
    [[E.INVAL], 8, 26],
    [[E.MFILE, E.NFILE], 9, 14],
    [[E.NOENT], 3, 2],
    [[E.ISDIR, E.LOOP, E.MULTIHOP, E.NOLINK, E.NOTDIR], 3, 28],
    [[E.EXIST], 16, 25],
    [[E.NOSPC], 9, 9],
    [[E.NOMEM, E.NOSYS, 0xffff as E], 2, 13],
  ] as const)
    for (const value of values) {
      const result = GetSvError(value);
      expect(result.GetClass()).toBe(cls);
      expect(result.GetCode()).toBe(low);
    }
  expect(GetSvErrorErrno(2).GetCode()).toBe(7); // WASI EACCES.
  expect(GetSvError(2).GetCode()).toBe(2); // osl_File_E_NOENT.
});
it("retains every original I/O packed macro and stream alias from the pinned header", /** All actual header declarations are checked, not selected local exports. @returns Nothing. */ () => {
  const header = readFileSync(
    resolve("../../vendor/libreoffice-reference/include/comphelper/errcode.hxx"),
    "utf8",
  );
  const constants = code as unknown as Readonly<Record<string, code.ErrCode>>;
  let count = 0,
    aliases = 0;
  for (const match of header.matchAll(
    /#define\s+(ERRCODE_IO_\w+)\s+ErrCode\(\s*ErrCodeArea::(\w+),\s*ErrCodeClass::(\w+),\s*(\d+)\s*\)/g,
  )) {
    const actual = constants[match[1] as string];
    expect(actual).toBeDefined();
    if (!actual) throw new Error("native I/O macro missing");
    expect(actual.GetArea()).toBe(code.ErrCodeArea[match[2] as keyof typeof code.ErrCodeArea]);
    expect(actual.GetClass()).toBe(code.ErrCodeClass[match[3] as keyof typeof code.ErrCodeClass]);
    expect(actual.GetCode()).toBe(Number(match[4]));
    ++count;
  }
  for (const match of header.matchAll(/#define\s+(SVSTREAM_\w+)\s+(ERRCODE_IO_\w+)/g)) {
    const actual = constants[match[1] as string],
      expected = constants[match[2] as string];
    if (!actual || !expected) throw new Error("native stream alias missing");
    expect(actual.valueOf()).toBe(expected.valueOf());
    ++aliases;
  }
  expect(count).toBeGreaterThan(30);
  expect(aliases).toBeGreaterThan(15);
});

it("translates real MEMFS errors into original packed diagnostics without a file-open policy substitute", /** Genuine public runtime failures, no injected errno or production open fallback. @returns Completion. */ async () => {
  await initializeRuntime();
  const fs = getFileSystem();
  for (const [action, expectedErrno, expectedCode] of [
    [
      /** Genuine absent path read. @returns Result. */ () =>
        fs.open("/native-file-errors/absent", 0),
      44,
      2,
    ],
    [/** Genuine directory write error. @returns Result. */ () => fs.open("/", 1), 31, 28],
    [/** Genuine invalid descriptor. @returns Result. */ () => fs.fstat(-1), 8, 13],
  ] as const) {
    let caught = false;
    try {
      action();
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("errno" in error) ||
        typeof error.errno !== "number"
      )
        throw error;
      expect(error.errno).toBe(expectedErrno);
      expect(GetSvErrorErrno(error.errno).GetCode()).toBe(expectedCode);
      caught = true;
    }
    expect(caught).toBe(true);
  }
  const message = new code.ErrCodeMsg(GetSvError(E.INVAL));
  expect(message.IsError()).toBe(true);
  expect(read(message.toString())).toBe("0x81a(Error Area:Io Class:Parameter Code:26)");
});

it("passes original file diagnostics through SvStream warning masking and first-error precedence", /** Actual stream error state, not altered counters or private fields. @returns Nothing. */ () => {
  const stream = own(new SvMemoryStream());
  stream.SetError(
    new code.ErrCode(code.WarningFlag.Yes, code.ErrCodeArea.Io, code.ErrCodeClass.Space, 9),
  );
  expect(stream.GetError().IsSet()).toBe(false);
  stream.SetError(GetSvError(E.NOSPC));
  expect(stream.GetError().valueOf()).toBe(0x909);
  stream.SetError(GetSvError(E.INVAL));
  const diagnostic = new code.ErrCodeMsg(stream.GetError());
  expect(diagnostic.IsSet()).toBe(true);
  expect(diagnostic.GetCode().GetCode()).toBe(9);
  expect(read(diagnostic.toString())).toBe("0x909(Error Area:Io Class:Space Code:9)");
  stream.ResetError();
  expect(stream.GetError().IsError()).toBe(false);
});
