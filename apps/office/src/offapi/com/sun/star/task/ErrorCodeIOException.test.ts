/** @fileoverview Actual ErrorCodeIOException generated value, type and UNO compound-copy contracts used by native metadata save errors. */
import { afterEach, expect, it } from "vitest";
import { ErrorCodeIOException, cppu_detail_getUnoType, getCppuType } from "./ErrorCodeIOException";
import { IOException } from "../../../../../cppu/inc/com/sun/star/io/IOException";
import { Exception } from "../../../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import type { typelib_CompoundTypeDescription } from "../../../../../cppu/inc/typelib/typedescription";
import { own, u, read, releaseDomScope } from "../../../../../test/native-dom";

afterEach(releaseDomScope);

it("retains signed32 legacy codes across copy, move and assignment", /** Exercises actual generated value lifetimes. @returns Nothing. */ () => {
  const context = own(new Reference()),
    empty = own(new ErrorCodeIOException());
  expect(empty.ErrCode).toBe(0);
  for (const code of [-2147483648, -1, 0, 2147483647]) {
    const source = own(new ErrorCodeIOException(u("Commit failed"), context, code)),
      copy = own(new ErrorCodeIOException(source)),
      moved = own(ErrorCodeIOException.move(copy));
    expect(source).toBeInstanceOf(IOException);
    expect(source).toBeInstanceOf(Exception);
    expect(moved.ErrCode).toBe(code);
    expect(copy.ErrCode).toBe(code);
    expect(empty.assign(moved)).toBe(empty);
    expect(empty.ErrCode).toBe(code);
    expect(empty.moveAssign(moved)).toBe(empty);
    expect(moved.ErrCode).toBe(code);
    expect(read(new OUString(source.Message))).toBe("Commit failed");
    expect(empty.assign(empty)).toBe(empty);
  }
});

it("registers the original long member and IOException base through the shared typelib", /** Inspects genuine generated type metadata. @returns Nothing. */ () => {
  const type = cppu_detail_getUnoType(),
    description = type.getTypeLibType()?.pType as unknown as typelib_CompoundTypeDescription;
  expect(getCppuType()).toBe(type);
  expect(read(type.getTypeName())).toBe("com.sun.star.task.ErrorCodeIOException");
  expect(description.nMembers).toBe(1);
  expect(description.pMemberOffsets?.[0]).toBe(16);
  expect(description.aBase.nSize).toBe(24);
  expect(description.pBaseTypeDescription?.aBase.nSize).toBe(16);
});

it("copies native exception fields through Any without truncating the packed error to its low byte", /** Uses the actual compound-value runtime. @returns Nothing. */ () => {
  const context = own(new Reference()),
    source = own(new ErrorCodeIOException(u("Save failed"), context, 0x8000020d)),
    any = own(new Any(source, cppu_detail_getUnoType)),
    result = own(new ErrorCodeIOException());
  source.ErrCode = 13;
  expect(any.extract(result, cppu_detail_getUnoType)).toBe(true);
  expect(result.ErrCode).toBe(-2147483123);
  expect(read(new OUString(result.Message))).toBe("Save failed");
});
