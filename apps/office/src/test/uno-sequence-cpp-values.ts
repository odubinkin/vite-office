/** @fileoverview Pure original public Sequence C++ caller bindings: actual owning classes, live field lvalues and declared compiler sizeof/type inputs; no runtime default/type/data factory substitutes. */
import { createUnoNativeCppInputs } from "./uno-native-cpp-values";
import type { UnoNativeCapture } from "./uno-native-values";
import type { UnoNativeCppWitness as W } from "./uno-native-cpp-values";
import type { UnoTypeArgument } from "../cppu/inc/unotype";
import type {
  typelib_CompoundTypeDescription as P,
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../cppu/inc/typelib/typeclass";
import type { SequenceElements } from "../cppu/inc/com/sun/star/uno/Sequence";
/** Actual caller-owned E value plus its logical native address. */
interface Input {
  /** Actual field/value address. */
  address: unknown;
  /** Real owning object, absent only for the caller's scalar cells. */
  owner: { dispose(): void } | null;
}
/** Fresh original process with actual public owners and explicit native declarations. @param capture - Whole original capture. @returns Pure caller observations/owners. */
export async function createPublicSequenceInputs(capture: UnoNativeCapture) {
  const x = await createUnoNativeCppInputs(capture),
    publicSequence = await import("../cppu/inc/com/sun/star/uno/Sequence"),
    sequenceAPI = await import("../cppu/source/uno/sequence"),
    { SAL_NO_ACQUIRE_ARGUMENT } = await import("../sal/inc/types"),
    SeqString = publicSequence.Sequence.specialize("OUString", 8),
    args: UnoTypeArgument[] = [
      "sal_Bool",
      "sal_Int8",
      "sal_Int16",
      "sal_uInt16",
      "sal_Int32",
      "sal_uInt32",
      "sal_Int64",
      "sal_uInt64",
      "float",
      "double",
      "sal_Unicode",
      "OUString",
      "Type",
      "Any",
      ["Reference", "XInterface"],
      ["Sequence", "OUString"],
      x.runtimeType,
    ],
    sizes = [1, 1, 2, 2, 4, 4, 8, 8, 4, 8, 2, 8, 8, 24, 8, 8, 16];
  /** Nonowning actual original field-address syntax, with no acquisition/default/assignment policy. @param owner - Real class owner. @param field - Actual source field. @returns Live original pointer lvalue. */
  function field(owner: unknown, field: string): [unknown] {
    const slot = [] as unknown as [unknown],
      object = owner as Record<string, unknown>;
    Object.defineProperty(slot, "0", {
      get: /** Actual source field read. @returns Current pointer. */ () => object[field],
      set: /** Raw source field write only. @param value - Assigned pointer. @returns Nothing. */ (
        value: unknown,
      ) => {
        object[field] = value;
      },
    });
    return slot;
  }
  /** Actual generated exception field addresses at original description offsets. @param owner - Actual generated class. @returns Native logical compound address. */
  function exceptionAddress(owner: InstanceType<typeof x.RuntimeException>): unknown {
    const d: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(d, x.runtimeType().getTypeLibType() as R);
    const base = (d[0] as unknown as P).pBaseTypeDescription as P,
      offsets = base.pMemberOffsets as Int32Array,
      value = new Map<number, unknown>([
        [offsets[0] as number, field(owner.Message, "pData")],
        [offsets[1] as number, field(owner.Context, "_pInterface")],
      ]);
    x.f.typelib_typedescription_release(d[0] as D);
    return value;
  }
  /** Actual declared E() in the native caller, retaining real class defaults and lifetime. @param id - Native class declaration. @returns Actual owning input/address. */
  function input(id: number): Input {
    if (id < 11)
      return { address: [id === 0 ? false : id === 6 || id === 7 ? 0n : 0], owner: null };
    if (id === 11) {
      const owner = new x.OUString();
      return { address: field(owner, "pData"), owner };
    }
    if (id === 12) {
      const owner = new x.Type();
      return { address: field(owner, "_pType"), owner };
    }
    if (id === 13) {
      const owner = new x.Any();
      return { address: owner, owner };
    }
    if (id === 14) {
      const owner = new x.Reference();
      return { address: field(owner, "_pInterface"), owner };
    }
    if (id === 15) {
      const owner = new SeqString();
      return { address: sequenceAddress(owner), owner };
    }
    const owner = new x.RuntimeException();
    return { address: exceptionAddress(owner), owner };
  }
  /** Actual input address of an existing public Sequence pointer field; getter/setter forwards its real address cell rather than copying a handle. @param owner - Actual owner. @returns Live field storage. */
  function sequenceAddress(owner: InstanceType<typeof SeqString>): unknown {
    return (owner as unknown as { pointer: unknown }).pointer;
  }
  /** C++ input initialization assignments use real owning methods, preserving temporary destruction. @param item - Actual E object/address. @param id - Native declaration. @param variant - Source scalar/text variant. @param w - Caller virtual object. @returns Nothing. */
  function fill(item: Input, id: number, variant: number, w: W): void {
    const raw = variant === 0 ? 3 : variant === 1 ? 17 : 250;
    if (id < 11) {
      (item.address as [unknown])[0] =
        id === 0
          ? variant !== 0
          : id === 1
            ? new Int8Array([raw])[0]
            : id === 6 || id === 7
              ? BigInt(raw)
              : raw;
    } else if (id === 11) {
      const value = x.name(variant === 0 ? "" : "value");
      (item.owner as InstanceType<typeof x.OUString>).assign(value);
      value.dispose();
    } else if (id === 12) {
      const value = new x.Type(x.type(variant === 0 ? C.VOID : C.BYTE));
      (item.owner as InstanceType<typeof x.Type>).assign(value);
      value.dispose();
    } else if (id === 13)
      (item.owner as InstanceType<typeof x.Any>).insert([variant === 0 ? -14 : 27], "sal_Int32");
    else if (id === 14)
      (item.owner as InstanceType<typeof x.Reference>).set(variant === 0 ? w : w.root);
    else if (id === 15) {
      const owner = item.owner as InstanceType<typeof SeqString>;
      owner.realloc(1);
      const value = x.name(variant === 0 ? "" : "nested"),
        p = (owner.getArray() as SequenceElements).get(0) as Parameters<
          typeof x.strings.rtl_uString_assign
        >[0];
      x.strings.rtl_uString_assign(p, value.pData);
      value.dispose();
      item.address = sequenceAddress(owner);
    } else {
      const owner = item.owner as InstanceType<typeof x.RuntimeException>,
        value = x.name(variant === 0 ? "" : "member");
      owner.Message = value;
      value.dispose();
      owner.Context.set(variant === 0 ? w : w.root);
    }
  }
  /** Native initializer_list's real E copy constructor; no replacement C-default inputs. @param source - Actual source owner. @param id - Native declaration. @returns Actual copied owner/address. */
  function clone(source: Input, id: number): Input {
    if (id < 11) return { address: [(source.address as [unknown])[0]], owner: null };
    if (id === 11) {
      const owner = new x.OUString(source.owner as InstanceType<typeof x.OUString>);
      return { address: field(owner, "pData"), owner };
    }
    if (id === 12) {
      const owner = new x.Type(source.owner as InstanceType<typeof x.Type>);
      return { address: field(owner, "_pType"), owner };
    }
    if (id === 13) {
      const owner = new x.Any(source.owner as InstanceType<typeof x.Any>);
      return { address: owner, owner };
    }
    if (id === 14) {
      const owner = new x.Reference(source.owner as InstanceType<typeof x.Reference>);
      return { address: field(owner, "_pInterface"), owner };
    }
    if (id === 15) {
      const owner = new SeqString(source.owner as InstanceType<typeof SeqString>);
      return { address: sequenceAddress(owner), owner };
    }
    const owner = new x.RuntimeException(source.owner as InstanceType<typeof x.RuntimeException>);
    return { address: exceptionAddress(owner), owner };
  }
  /** Caller std::array E lvalues indexed by original sizeof(E). @param items - Actual source owners. @param stride - Original layout. @returns Original logical source pointer. */
  function array(items: Input[], stride: number): SequenceElements {
    return {
      get: /** Native caller address arithmetic only. @param offset - Original byte offset. @returns Actual E lvalue. */ (
        offset: number,
      ) => (items[offset / stride] as Input).address,
    };
  }
  return {
    ...x,
    ...publicSequence,
    sequenceAPI,
    SAL_NO_ACQUIRE_ARGUMENT,
    args,
    sizes,
    input,
    fill,
    clone,
    array,
  };
}
