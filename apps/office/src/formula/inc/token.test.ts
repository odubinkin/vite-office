/** @fileoverview Original formula token constructor/classification/ownership regression cases over genuine shared owners; whole native stream comparison is recorded separately. */
import { describe, expect, it } from "vitest";
import {
  FormulaToken,
  FormulaSpaceToken,
  FormulaByteToken,
  FormulaFAPToken,
  FormulaDoubleToken,
  FormulaTypedDoubleToken,
  FormulaIndexToken,
  FormulaExternalToken,
  FormulaMissingToken,
  FormulaJumpToken,
  FormulaUnknownToken,
  FormulaErrorToken,
  FormulaStringToken,
  FormulaStringOpToken,
  FormulaStringNameToken,
  StackVar,
  RefCntPolicy,
  StackVarEnumToString,
} from "./token";
import { FormulaTokenRef, FormulaConstTokenRef } from "./types";
import { FormulaCompiler } from "./FormulaCompiler";
import { OpCode } from "./opcode";
import { FormulaError } from "./errorcodes";
import { ParamClass } from "./paramclass";
import { OUString } from "../../sal/inc/rtl/ustring";
import { SharedString } from "../../svl/inc/sharedstring";
import { intrusive_ptr } from "../../external/boost/include/boost/smart_ptr/intrusive_ptr";
import type { FormulaTokenPrivateAccess } from "./token";

describe("original formula token family", /** Groups original formula token family. @returns Nothing. */ () => {
  it("retains erased compiler access, default pointer aliases and unknown UInt8 policy dispatch", /** Verifies: retains erased compiler access, default pointer aliases and unknown UInt8 policy dispatch. @returns Nothing. */ () => {
    const empty = new FormulaTokenRef();
    const constEmpty = new FormulaConstTokenRef();
    const constCopy = new FormulaConstTokenRef(constEmpty);
    expect([empty.get(), constEmpty.get(), constCopy.get()]).toEqual([null, null, null]);
    empty.dispose();
    constEmpty.dispose();
    constCopy.dispose();
    const token = new FormulaToken(StackVar.svIndex, OpCode.ocName);
    // Test-only erased reference to the original empty PrivateAccess value; no public production factory is introduced.
    const access = {} as FormulaTokenPrivateAccess;
    token.NewOpCode(OpCode.ocTableRef, access);
    expect([token.GetOpCode(), token.IsRef()]).toEqual([OpCode.ocTableRef, true]);
    token.SetRefCntPolicy(255 as RefCntPolicy);
    token.IncRef();
    token.DeleteIfZeroRef();
    expect(token.GetRef()).toBe(1);
    token.DecRef();
  });

  it("moves string-op and named arguments through the genuine shared value owner", /** Verifies: moves string-op and named arguments through the genuine shared value owner. @returns Nothing. */ () => {
    const text = new OUString(new Uint16Array([65]), 1);
    const first = new SharedString(text);
    const op = new FormulaStringOpToken(OpCode.ocStringName, first, SharedString.move);
    expect(first.isValid()).toBe(false);
    op.SetByte(3);
    expect(op.GetParamCount()).toBe(3);
    const second = new SharedString(text);
    const name = new FormulaStringNameToken(StackVar.svStringName, second, SharedString.move);
    expect(second.isValid()).toBe(false);
    expect(name.GetString().getLength()).toBe(1);
    const jump = new FormulaJumpToken(OpCode.ocIf, new Int16Array([1, 7]));
    const lengthMismatch = new FormulaJumpToken(OpCode.ocIf, new Int16Array([2, 7, 8]));
    expect(jump.equals(lengthMismatch)).toBe(false);
    expect(jump.equals(op)).toBe(false);
    op.Delete();
    name.Delete();
    first.dispose();
    second.dispose();
    jump.Delete();
    lengthMismatch.Delete();
    expect(text.pData?.refCount).toBe(1);
    text.dispose();
  });
  it("retains stack/policy defaults and resets copied counts and policy", /** Verifies: retains stack/policy defaults and resets copied counts and policy. @returns Nothing. */ () => {
    expect(StackVarEnumToString(StackVar.svExternalDoubleRef)).toBe("ExternalDoubleRef");
    expect(StackVarEnumToString(255 as StackVar)).toBe("255");
    const token = new FormulaToken(StackVar.svMatrix);
    expect([token.GetType(), token.GetOpCode(), token.GetRef(), token.GetRefCntPolicy()]).toEqual([
      StackVar.svMatrix,
      OpCode.ocPush,
      0,
      RefCntPolicy.ThreadSafe,
    ]);
    expect(token.IsInForceArray()).toBe(true);
    token.SetRefCntPolicy(RefCntPolicy.UnsafeRef);
    token.IncRef();
    token.IncRef();
    token.DecRef();
    const clone = token.Clone();
    expect([clone.GetRef(), clone.GetRefCntPolicy(), clone.TextEqual(token)]).toEqual([
      0,
      RefCntPolicy.ThreadSafe,
      true,
    ]);
    token.SetRefCntPolicy(RefCntPolicy.None);
    token.IncRef();
    token.DecRef();
    expect(token.GetRef()).toBe(1);
    token.SetRefCntPolicy(RefCntPolicy.ThreadSafe);
    token.DecRef();
    clone.DeleteIfZeroRef();
    const other = new FormulaToken(StackVar.svDouble);
    expect(other.equals(token)).toBe(false);
    expect(other.GetInForceArray()).toBe(ParamClass.Unknown);
    other.SetInForceArray(ParamClass.Array); // Original NDEBUG dummy is a no-op.
    expect(other.IsInForceArray()).toBe(false);
    other.Delete();
  });

  it("classifies actual byte, space, jump and external tokens", /** Verifies: classifies actual byte, space, jump and external tokens. @returns Nothing. */ () => {
    const b = new FormulaByteToken(OpCode.ocSum, 3, ParamClass.ForceArray);
    expect([b.IsFunction(), b.GetParamCount(), b.IsInForceArray()]).toEqual([true, 3, true]);
    expect(b.Clone().equals(b)).toBe(true);
    b.SetByte(257);
    expect(b.GetByte()).toBe(1);
    b.SetInForceArray(ParamClass.ReferenceOrForceArray);
    expect(b.IsInForceArray()).toBe(true);
    b.SetInForceArray(ParamClass.ReferenceOrRefArray);
    expect(b.IsInForceArray()).toBe(true);
    b.SetInForceArray(ParamClass.Value);
    expect(b.IsInForceArray()).toBe(false);
    for (const [op, count] of [
      [OpCode.ocAdd, 2],
      [OpCode.ocNegSub, 1],
      [OpCode.ocPercentSign, 1],
      [OpCode.ocPi, 0],
      [OpCode.ocIf, 1],
      [OpCode.ocPush, 0],
    ] as const) {
      const t = new FormulaByteToken(op);
      expect(t.GetParamCount()).toBe(count);
      t.Delete();
    }
    const whitespace = new FormulaSpaceToken(2, 0x10020);
    expect([whitespace.GetByte(), whitespace.GetChar(), whitespace.IsFunction()]).toEqual([
      2,
      32,
      true,
    ]);
    expect(whitespace.Clone().equals(whitespace)).toBe(true);
    expect(new FormulaSpaceToken(0, 32).IsFunction()).toBe(false);
    const jump = new FormulaJumpToken(OpCode.ocChoose, new Int16Array([3, 1, -7, 32000, 42]));
    const copy = jump.Clone() as FormulaJumpToken;
    expect(jump.GetParamCount()).toBe(1);
    expect(copy.GetJump()).toEqual(new Int16Array([3, 1, -7, 32000]));
    expect(copy.GetJump()).not.toBe(jump.GetJump());
    expect(copy.equals(jump)).toBe(true);
    copy.GetJump()[2] = -8;
    expect(copy.equals(jump)).toBe(false);
    copy.GetJump()[2] = -7;
    copy.SetInForceArray(ParamClass.ForceArray);
    expect(copy.GetInForceArray()).toBe(ParamClass.ForceArray);
    expect(copy.equals(jump)).toBe(false);
    for (const op of [OpCode.ocIf, OpCode.ocIfError, OpCode.ocIfNA, OpCode.ocChoose, OpCode.ocLet])
      expect(FormulaCompiler.IsOpCodeJumpCommand(op)).toBe(true);
    expect(FormulaCompiler.IsOpCodeJumpCommand(OpCode.ocSum)).toBe(false);
    jump.Delete();
    copy.Delete();
    whitespace.Delete();
    b.Delete();
  });

  it("keeps real original FAP pointer identity and balanced intrusive lifetimes", /** Verifies: keeps real original FAP pointer identity and balanced intrusive lifetimes. @returns Nothing. */ () => {
    const original = new FormulaDoubleToken(4);
    const owner = new FormulaTokenRef(original);
    const fap = new FormulaFAPToken(OpCode.ocSum, 2, original);
    expect(original.GetRef()).toBe(2);
    const copied = fap.Clone() as FormulaFAPToken;
    expect([
      original.GetRef(),
      copied.GetFAPOrigToken(),
      copied.GetByte(),
      copied.GetParamCount(),
      copied.equals(fap),
    ]).toEqual([3, original, 2, 2, true]);
    const copiedOwner = new FormulaTokenRef(owner);
    const constOwner = new FormulaConstTokenRef(owner);
    const constView = constOwner.get();
    expect(constView?.TextEqual(original)).toBe(true);
    expect(original.TextEqual(constView as NonNullable<typeof constView>)).toBe(true);
    const fromConst = new FormulaToken(constView as NonNullable<typeof constView>);
    expect(fromConst.GetRef()).toBe(0);
    fromConst.Delete();
    expect(original.GetRef()).toBe(5);
    copiedOwner.dispose();
    constOwner.dispose();
    copied.Delete();
    fap.Delete();
    expect(original.GetRef()).toBe(1);
    owner.dispose();
    const nil = new FormulaFAPToken(OpCode.ocSum, 0, null);
    expect([nil.GetFAPOrigToken(), nil.GetParamCount()]).toEqual([null, 0]);
    nil.Delete();
  });

  it("preserves actual intrusive temporary/swap/move/reset order including self assignment", /** Verifies: preserves actual intrusive temporary/swap/move/reset order including self assignment. @returns Nothing. */ () => {
    const original = new FormulaDoubleToken(9);
    const a = new FormulaTokenRef(original);
    const b = intrusive_ptr.copy(a);
    expect(original.GetRef()).toBe(2);
    expect([a.get(), a.dereference(), a.arrow(), a.bool()]).toEqual([
      original,
      original,
      original,
      true,
    ]);
    a.assign(a);
    expect(original.GetRef()).toBe(2);
    a.assignPointer(original);
    expect(original.GetRef()).toBe(2);
    const moved = intrusive_ptr.move(b);
    expect([b.get(), moved.get(), original.GetRef()]).toEqual([null, original, 2]);
    moved.moveAssign(moved);
    expect(original.GetRef()).toBe(2);
    a.moveAssign(moved);
    expect([moved.bool(), original.GetRef()]).toEqual([false, 1]);
    const detached = a.detach();
    expect([detached, a.bool(), original.GetRef()]).toEqual([original, false, 1]);
    const adopt = new FormulaTokenRef(detached, false);
    adopt.reset(original);
    expect(original.GetRef()).toBe(1);
    adopt.reset();
    expect(adopt.get()).toBe(null);
    a.dispose();
    b.dispose();
    moved.dispose();
    adopt.dispose();
  });

  it("copies typed numbers, narrows index/error fields and retains error-only assignment", /** Verifies: copies typed numbers, narrows index/error fields and retains error-only assignment. @returns Nothing. */ () => {
    const d = new FormulaDoubleToken(-0);
    expect(d.GetDoubleType()).toBe(0);
    expect(Object.is((d.Clone() as FormulaDoubleToken).GetDouble(), -0)).toBe(true);
    d.SetDouble(Number.NaN);
    expect(d.equals(d)).toBe(false);
    const typed = new FormulaTypedDoubleToken(2.5, 65535);
    expect(typed.GetDoubleType()).toBe(-1);
    expect(typed.Clone().equals(typed)).toBe(true);
    typed.SetDoubleType(32768);
    expect(typed.GetDoubleType()).toBe(-32768);
    const index = new FormulaIndexToken(OpCode.ocName, 65537);
    expect([index.GetIndex(), index.GetSheet()]).toEqual([1, -1]);
    expect(index.Clone().equals(index)).toBe(true);
    index.SetIndex(-1);
    index.SetSheet(65535);
    expect([index.GetIndex(), index.GetSheet()]).toEqual([65535, -1]);
    const error = new FormulaErrorToken();
    expect(error.GetError()).toBe(FormulaError.IllegalChar);
    const rhs = new FormulaErrorToken(FormulaError.DivisionByZero);
    error.IncRef();
    error.SetRefCntPolicy(RefCntPolicy.UnsafeRef);
    expect(error.assign(rhs)).toBe(error);
    expect([
      error.GetError(),
      error.GetRef(),
      error.GetRefCntPolicy(),
      error.Clone().equals(error),
    ]).toEqual([FormulaError.DivisionByZero, 1, RefCntPolicy.UnsafeRef, true]);
    error.SetError(65537 as FormulaError);
    expect(error.GetError()).toBe(1);
    error.DecRef();
    rhs.Delete();
    index.Delete();
    typed.Delete();
    d.Delete();
    const missing = new FormulaMissingToken();
    expect([missing.GetType(), missing.GetOpCode(), missing.Clone().equals(missing)]).toEqual([
      StackVar.svMissing,
      OpCode.ocMissing,
      true,
    ]);
    const unknown = new FormulaUnknownToken(OpCode.ocBad);
    expect(unknown.Clone().equals(unknown)).toBe(true);
    expect([
      unknown.IsFunction(),
      unknown.GetParamCount(),
      unknown.IsRef(),
      unknown.IsExternalRef(),
    ]).toEqual([false, 0, false, false]);
    missing.Delete();
    unknown.Delete();
  });

  it("uses real shared string ownership for public, protected and named token constructors", /** Verifies: uses real shared string ownership for public, protected and named token constructors. @returns Nothing. */ () => {
    const text = new OUString(new Uint16Array([65, 0, 66]), 3);
    const value = new SharedString(text);
    expect(text.pData?.refCount).toBe(2);
    const token = new FormulaStringToken(value);
    expect(text.pData?.refCount).toBe(3);
    const clone = token.Clone();
    expect(clone.equals(token)).toBe(true);
    token.SetString(token.GetString());
    expect(text.pData?.refCount).toBe(4);
    const moved = new FormulaStringToken(value, SharedString.move);
    expect(value.isValid()).toBe(false);
    expect(text.pData?.refCount).toBe(4);
    const op = new FormulaStringOpToken(OpCode.ocStringXML, token.GetString());
    op.SetByte(259);
    op.SetInForceArray(ParamClass.ForceArray);
    const opCopy = op.Clone();
    expect([
      op.GetByte(),
      op.GetParamCount(),
      op.GetInForceArray(),
      op.IsInForceArray(),
      opCopy.equals(op),
    ]).toEqual([3, 0, ParamClass.ForceArray, true, true]);
    const name = new FormulaStringNameToken(StackVar.svStringName, token.GetString());
    const nameCopy = name.Clone();
    expect(nameCopy.equals(name)).toBe(true);
    clone.Delete();
    token.Delete();
    moved.Delete();
    op.Delete();
    opCopy.Delete();
    name.Delete();
    nameCopy.Delete();
    value.dispose();
    expect(text.pData?.refCount).toBe(1);
    text.dispose();
  });

  it("owns external strings and classifies original reference kinds", /** Verifies: owns external strings and classifies original reference kinds. @returns Nothing. */ () => {
    const text = new OUString(new Uint16Array([70]), 1);
    const external = new FormulaExternalToken(OpCode.ocExternal, 3, text);
    expect([
      text.pData?.refCount,
      external.GetByte(),
      external.GetParamCount(),
      external.IsFunction(),
    ]).toEqual([2, 3, 3, true]);
    const copy = external.Clone();
    expect(copy.equals(external)).toBe(true);
    external.SetByte(258);
    external.SetInForceArray(ParamClass.ForceArrayReturn);
    expect([external.GetByte(), external.GetInForceArray(), external.IsInForceArray()]).toEqual([
      2,
      ParamClass.ForceArrayReturn,
      true,
    ]);
    copy.Delete();
    external.Delete();
    expect(text.pData?.refCount).toBe(1);
    const move = new FormulaExternalToken(OpCode.ocExternal, text, OUString.move);
    expect([move.GetExternal().getLength(), move.GetParamCount()]).toEqual([1, 0]);
    move.Delete();
    text.dispose();
    for (const [type, ref, ext] of [
      [StackVar.svSingleRef, true, false],
      [StackVar.svDoubleRef, true, false],
      [StackVar.svExternalSingleRef, true, true],
      [StackVar.svExternalDoubleRef, true, true],
      [StackVar.svExternalName, false, true],
    ] as const) {
      const token = new FormulaToken(type);
      expect([token.IsRef(), token.IsExternalRef()]).toEqual([ref, ext]);
      token.Delete();
    }
    const table = new FormulaToken(StackVar.svIndex, OpCode.ocTableRef);
    expect(table.IsRef()).toBe(true);
    table.Delete();
  });
});
