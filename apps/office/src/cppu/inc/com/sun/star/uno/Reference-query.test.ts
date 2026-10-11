/** @fileoverview Whole original Reference query/throw/identity and cppu_opt message streams; caller virtual inputs and logical pointers reuse actual shared owners, including diagnostic invalid root replies. */
import { expect, it } from "vitest";
import fixture from "./native-reference-query-cases.json";
import { createUnoNativeCppInputs } from "../../../../../../test/uno-native-cpp-values";
import type { UnoNativeCppWitness as W } from "../../../../../../test/uno-native-cpp-values";
import type { Reference, BaseReference } from "./Reference";
import type { Any } from "./Any";
import type { RuntimeException } from "./RuntimeException";
import type { typelib_TypeDescription as D } from "../../../../typelib/typedescription";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
/** Fresh original process and complete observations. @param mode - Original native mode. @returns Actual owners and caller observations. */
async function caller(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeCppInputs(fixture.captures[mode]),
    refs = await import("./Reference"),
    cppu = await import("../../../../../source/cppu/cppu_opt"),
    { SAL_NO_ACQUIRE } = await import("../../../../../../sal/inc/types");
  /** Whole initialized Any observations and actual description lifetime. @param a - Real source owner. @returns Nothing. */
  function observe(a: Any): void {
    x.anyValue(a);
    x.emit(
      a.getValueTypeRef() === a.pType,
      a.getValueTypeClass(),
      a.hasValue(),
      a.getValue() === a.pData,
      a.getValueType() === a.getValueType(),
      a.getValueType().getTypeLibType() === a.pType,
    );
    x.ref(a.getValueType().getTypeLibType());
    const n = a.getValueTypeName();
    x.text(n.pData);
    x.ref(a.pType);
    n.dispose();
    x.ref(a.pType);
    const d: [D | null] = [null];
    a.getValueTypeDescription(d);
    x.desc(d[0]);
    x.f.typelib_typedescription_release(d[0] as D);
    x.ref(a.pType);
  }
  /** Original actual caller pointer/count. @param p - Original logical pointer. @returns Nothing. */
  function pointer(p: unknown): void {
    x.emit(p === null);
    if (p !== null) {
      const w = p as W;
      x.emit(w.id, w.count);
    }
  }
  /** Original reference observations only invoke native dereference with its non-null producer precondition. @param r - Real owner. @param w - Caller. @param root - Caller root. @returns Nothing. */
  function state(r: Reference, w: W, root: W): void {
    pointer(r.get());
    x.emit(r.is(), r.operatorBool());
    if (r.is()) x.emit(r.operatorArrow() === r.get(), r.operatorStar() === r.get());
    x.emit(w.count, root.count);
    x.ref(x.unotype.getTypeFavourUnsigned("XInterface").getTypeLibType());
  }
  /** Actual generated exception fields and demanded native types. @param e - Real exception owner. @returns Nothing. */
  function exception(e: RuntimeException): void {
    x.text(e.Message.pData);
    pointer(e.Context.get());
    x.ref(x.runtimeType().getTypeLibType());
    x.ref(x.type(C.INTERFACE));
  }
  /** Original typed catch and real exception destruction. @param e - Caught owner or caller signal. @param r - Existing destination. @param w - Caller. @param root - Root. @returns Nothing. */
  function caught(e: unknown, r?: Reference, w?: W, root?: W): void {
    x.emit(e instanceof x.RuntimeException ? 1 : 2);
    if (r) state(r, w as W, root as W);
    if (e instanceof x.RuntimeException) {
      exception(e);
      e.dispose();
    } else {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe("caller");
    }
  }
  /** Actual original OUString temporary-to-Any construction and temporary destruction. @param label - Source text. @returns Actual Any. */
  function stringAny(label: string): Any {
    const held = x.name(label);
    try {
      return new x.Any([held.pData], "OUString");
    } finally {
      held.dispose();
    }
  }
  return { ...x, ...refs, cppu, SAL_NO_ACQUIRE, observe, pointer, state, caught, stringAny };
}
it("matches whole original constructors/set query and throwing ownership streams", /** Replays actual source overloads, cold non-interface Any and failure preservation. @returns Whole native parity. */ async () => {
  const x = await caller("queries"),
    w = x.witness(41),
    root = x.witness(91);
  root.root = root;
  x.emit(x.UNO_REF_NO_ACQUIRE, x.UNO_QUERY[1], x.UNO_QUERY_THROW[1], x.UNO_SET_THROW[1]);
  x.emit(-1);
  {
    const src = x.stringAny("source"),
      r = new x.Reference(src, x.UNO_QUERY);
    x.pointer(r.get());
    x.ref(x.type(C.INTERFACE));
    x.observe(src);
    r.dispose();
    src.dispose();
  }
  /** Actual selected constructor/set operation. @param api - Native operation. @param src - Native overload source. @returns Nothing. */
  function operation(api: number, src: BaseReference | Any | W | null): void {
    if (api < 2) {
      try {
        const r =
          api === 0 ? new x.Reference(src, x.UNO_QUERY) : new x.Reference(src, x.UNO_QUERY_THROW);
        try {
          x.emit(0);
          x.state(r, w, root);
        } finally {
          r.dispose();
        }
      } catch (e) {
        x.caught(e);
      }
    } else {
      const r = new x.Reference(root);
      try {
        try {
          if (api === 2) x.emit(r.set(src, x.UNO_QUERY));
          else {
            r.set(src, x.UNO_QUERY_THROW);
            x.emit(0);
          }
        } catch (e) {
          x.caught(e, r, w, root);
        }
        x.state(r, w, root);
      } finally {
        r.dispose();
      }
    }
  }
  for (let mode = 0; mode < 5; mode++)
    for (let nr = 0; nr < 2; nr++)
      for (let source = 0; source < 8; source++)
        for (let api = 0; api < 4; api++) {
          w.mode = mode;
          w.root = nr ? null : root;
          x.emit(mode, nr, source, api);
          if (source === 0) operation(api, w);
          else if (source === 1 || source === 5) {
            const src = new x.Reference(source === 1 ? w : null);
            try {
              operation(api, src);
            } finally {
              src.dispose();
            }
          } else if (source === 2 || source === 6) {
            const src = new x.Any([source === 2 ? w : null], x.type(C.INTERFACE));
            try {
              operation(api, src);
            } finally {
              src.dispose();
            }
          } else if (source === 3) {
            const src = x.stringAny("source");
            try {
              operation(api, src);
            } finally {
              src.dispose();
            }
          } else if (source === 4) operation(api, null);
          else {
            const src = new x.Any();
            try {
              operation(api, src);
            } finally {
              src.dispose();
            }
          }
          x.emit(w.count, root.count);
        }
  for (let source = 0; source < 4; source++)
    for (let api = 0; api < 2; api++) {
      x.emit(5, source, api);
      /** Native direct pointer/reference setThrow operations. @param src - Source overload. @returns Nothing. */
      function setThrowOperation(src: Reference<W> | W | null): void {
        if (api === 0) {
          try {
            const r = new x.Reference(src, x.UNO_SET_THROW);
            try {
              x.emit(0);
              x.state(r, w, root);
            } finally {
              r.dispose();
            }
          } catch (e) {
            x.caught(e);
          }
        } else {
          const r = new x.Reference(root);
          try {
            try {
              r.set(src, x.UNO_SET_THROW);
              x.emit(0);
            } catch (e) {
              x.caught(e, r, w, root);
            }
            x.state(r, w, root);
          } finally {
            r.dispose();
          }
        }
      }
      if (source === 0) setThrowOperation(w);
      else if (source === 2) setThrowOperation(null);
      else {
        const src = new x.Reference<W>(source === 1 ? w : null);
        try {
          setThrowOperation(src);
        } finally {
          src.dispose();
        }
      }
      x.emit(w.count, root.count);
    }
  x.finish();
});
it("matches whole original static/member/Any queries and protected query helpers", /** Replays genuine declared caller CW-to-XInterface member instantiations and all returned owners. @returns Whole native parity. */ async () => {
  const x = await caller("members"),
    w = x.witness(41),
    root = x.witness(91);
  root.root = root;
  for (let mode = 0; mode < 5; mode++)
    for (let nr = 0; nr < 2; nr++)
      for (let api = 0; api < 10; api++) {
        w.mode = mode;
        w.root = nr ? null : root;
        x.emit(mode, nr, api);
        try {
          let src: Reference<W> | Any | null = null;
          try {
            let r: Reference;
            if (api === 0) r = x.Reference.query(w);
            else if (api === 1 || api === 2 || api === 3 || api === 7) {
              const holder = new x.Reference<W>(api === 7 ? null : w);
              src = holder;
              r =
                api === 1 || api === 7
                  ? x.Reference.query(holder)
                  : api === 2
                    ? mode % 2 === 0
                      ? holder.query()
                      : holder.query("XInterface")
                    : holder.queryThrow("XInterface");
            } else if (api === 4 || api === 5 || api === 8 || api === 9) {
              const holder =
                api === 4 || api === 5 ? new x.Any([w], x.type(C.INTERFACE)) : new x.Any();
              src = holder;
              r =
                api === 4 || api === 8
                  ? api === 4
                    ? holder.query()
                    : holder.query("XInterface")
                  : api === 9
                    ? holder.queryThrow()
                    : holder.queryThrow("XInterface");
            } else r = x.Reference.query(null);
            try {
              x.state(r, w, root);
            } finally {
              r.dispose();
            }
          } finally {
            src?.dispose();
          }
          x.emit(0);
        } catch (e) {
          x.caught(e);
        }
        x.emit(w.count, root.count);
      }
  for (let throwing = 0; throwing < 2; throwing++)
    for (let nullSource = 0; nullSource < 2; nullSource++) {
      x.emit(5, throwing, nullSource);
      try {
        const p = nullSource ? null : w,
          type = x.unotype.getTypeFavourUnsigned("XInterface"),
          result = throwing
            ? x.BaseReference.iquery_throw(p, type)
            : x.BaseReference.iquery(p, type),
          out = new x.Reference(result, x.SAL_NO_ACQUIRE);
        try {
          x.state(out, w, root);
          x.emit(0);
        } finally {
          out.dispose();
        }
      } catch (e) {
        x.caught(e);
      }
      x.emit(w.count, root.count);
    }
  x.finish();
});
it("matches whole original identity comparisons, RuntimeException catch and other propagation", /** Diagnostic invalid root replies are observed separately from valid UNO producer claims. @returns Whole native parity. */ async () => {
  const x = await caller("identity"),
    a = x.witness(41),
    b = x.witness(42),
    r1 = x.witness(91),
    r2 = x.witness(92);
  for (let am = 0; am < 5; am++)
    for (let bm = 0; bm < 5; bm++)
      for (let ar = 0; ar < 3; ar++)
        for (let br = 0; br < 3; br++)
          for (let pc = 0; pc < 5; pc++) {
            a.mode = am;
            b.mode = bm;
            a.root = ar === 0 ? null : ar === 1 ? r1 : r2;
            b.root = br === 0 ? null : br === 1 ? r1 : r2;
            const ap = pc === 2 || pc === 4 ? null : a,
              bp = pc === 0 ? a : pc === 1 ? b : pc === 2 ? a : null;
            x.emit(am, bm, ar, br, pc);
            const left = new x.Reference(ap),
              right = new x.Reference(bp);
            try {
              for (let op = 0; op < 5; op++) {
                x.emit(op);
                try {
                  x.emit(
                    op === 0
                      ? left.operatorEquals(right)
                      : op === 1
                        ? left.operatorNotEquals(right)
                        : op === 2
                          ? left.operatorEquals(bp)
                          : op === 3
                            ? left.operatorNotEquals(bp)
                            : left.operatorEquals(left),
                  );
                } catch (e) {
                  expect(e).toBeInstanceOf(Error);
                  expect((e as Error).message).toBe("caller");
                  x.emit(2);
                }
                x.state(left, a, r1);
                x.state(right, b, r2);
                x.emit(a.count, b.count, r1.count, r2.count);
              }
            } finally {
              right.dispose();
              left.dispose();
            }
            x.emit(a.count, b.count, r1.count, r2.count);
          }
  x.finish();
});
it("matches whole original diagnostic strings and all initialized source/type/count fields", /** Replays all supported initialized source and requested classes through the real three C owners. @returns Whole native parity. */ async () => {
  const x = await caller("messages"),
    w = x.witness(41);
  for (let ac = 0; ac <= 22; ac++) {
    if ([16, 18, 21].includes(ac)) continue;
    const ar = x.get(ac),
      ad: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(ad, ar);
    for (let bc = 0; bc <= 22; bc++) {
      if ([16, 18, 21].includes(bc)) continue;
      const br = x.get(bc),
        h = x.name("Aa"),
        p = x.sample(ar, h.pData, w as unknown as Parameters<typeof x.sample>[2], 1);
      x.emit(ac, bc);
      const a = new x.Any(p, ar);
      try {
        for (let api = 0; api < 3; api++) {
          x.emit(api);
          const out =
            api === 0
              ? x.cppu.cppu_unsatisfied_iquery_msg(br)
              : api === 1
                ? x.cppu.cppu_unsatisfied_iset_msg(br)
                : x.cppu.cppu_Any_extraction_failure_msg(a, br);
          x.text(out);
          x.strings.rtl_uString_release(out);
          x.ref(ar);
          x.ref(br);
          x.observe(a);
          x.emit(w.count);
        }
      } finally {
        a.dispose();
      }
      x.globals.uno_type_destructData(p, ar, x.genfunc.cpp_release);
      h.dispose();
    }
    x.f.typelib_typedescription_release(ad[0] as D);
  }
  x.finish();
});
