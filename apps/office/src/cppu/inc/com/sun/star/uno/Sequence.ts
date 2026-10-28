/** @fileoverview Original normal internal Sequence.h/hxx value/lifetime and array contracts over actual shared C/type/OSL owners. Explicit compiler template/sizeof declarations and addressed storage adapt erased syntax, not a new type/default/data provider or JS binary ABI. */
import type { uno_Sequence } from "../../../../uno/sequence2";
import {
  uno_type_sequence_construct,
  uno_type_sequence_destroy,
  uno_type_sequence_assign,
  uno_type_sequence_reference2One,
  uno_type_sequence_realloc,
} from "../../../../uno/sequence2";
import { sequenceCountAddress } from "../../../../../source/uno/sequence";
import { osl_atomic_increment, osl_atomic_decrement } from "../../../../../../sal/inc/osl/interlck";
import { uno_type_equalData } from "../../../../uno/data";
import { cpp_acquire, cpp_release, cpp_queryInterface } from "./genfunc";
import { getSequenceTypeFavourUnsigned } from "./Sequence-type";
import { getTypeFromTypeDescriptionReference, unoTypeArgumentIdentity } from "../../../../unotype";
import type { UnoTypeArgument } from "../../../../unotype";
import type { typelib_TypeDescriptionReference as R } from "../../../../typelib/typedescription";
import { SAL_NO_ACQUIRE_ARGUMENT } from "../../../../../../sal/inc/types";
import type { SalNoAcquireArgument } from "../../../../../../sal/inc/types";
/** Existing logical address storage returned by original pointer casts, with no new array/value owner. */
export type SequenceElements = Pick<ReadonlyMap<number, unknown>, "get">;
/** Original source pointer addition, represented by its unchanged storage and logical byte offset. Physical address ordering/layout is unverified. */
export type SequenceEnd = readonly [storage: uno_Sequence["elements"], byteOffset: number];
/** Erased original overload argument lists; caller elements are initialized native logical addresses. */
type SequenceArgs<E> =
  | []
  | [source: Sequence<E>]
  | [handle: uno_Sequence | null, noAcquire: SalNoAcquireArgument]
  | [elements: SequenceElements | null, length: number]
  | [length: number];
/** One compiler-emitted specialization constructor, sharing the actual implementation body and no instance type metadata. */
export interface SequenceConstructor<E> {
  /** Original declared E, explicit after compile-time erasure; not a value-inferred type provider. */
  readonly ElementType: UnoTypeArgument;
  /** Original compile-time sizeof(E), an explicit logical address stride. */
  readonly ElementSize: number;
  /** Original selected value constructor. @param args - Native overload inputs. @returns Actual shared sequence owner. */
  new (...args: SequenceArgs<E>): Sequence<E>;
}
/** Compiler specialization identity only; contains no UNO reference or sequence data/default allocation. */
const specializations = new Map<unknown, SequenceConstructor<unknown>>();
/** Public template body: exactly one owned pointer-cell address. An erased template is instantiated through its explicit compiler binding; copy/adopt/read do not initialize a type or add another owner. */
export abstract class Sequence<E = unknown> {
  /** Original uninitialized _pSequence field address. Actual constructors alone write its pointer. */
  private readonly pointer = [] as unknown as [uno_Sequence | null];
  /** Compiler binding for the actual source template specialization; never infers E from an element or supplies a library type/value/default factory. @param element - Declared E. @param elementSize - Original sizeof(E). @returns Constructor for this exact declared template. */
  static specialize<E>(element: UnoTypeArgument, elementSize: number): SequenceConstructor<E> {
    const key = unoTypeArgumentIdentity(element);
    let compiled = specializations.get(key);
    if (compiled === undefined) {
      const body = /** Original compiler-emitted class specialization; introduces no value/type policy. */ class extends Sequence<unknown> {};
      Object.defineProperties(body, {
        ElementType: { value: element },
        ElementSize: { value: elementSize },
      });
      compiled = body as unknown as SequenceConstructor<unknown>;
      specializations.set(key, compiled);
    }
    return compiled as SequenceConstructor<E>;
  }
  /** Original default/copy/adopt/elements/length constructors. Explicit source pointer/length also represents an initializer_list's begin/size, retaining the same actual C body. There is no native move constructor: rvalue construction still copies. @param args - Original constructor overload. @returns Original owned value. */
  constructor(...args: SequenceArgs<E>) {
    if (args.length === 1 && args[0] instanceof Sequence) {
      const source = args[0].get() as uno_Sequence;
      osl_atomic_increment(sequenceCountAddress(source));
      this.pointer[0] = source;
    } else if (args.length === 2 && args[1] === SAL_NO_ACQUIRE_ARGUMENT)
      this.pointer[0] = args[0] as uno_Sequence | null;
    else {
      const type = this.type();
      if (args.length === 0) uno_type_sequence_construct(this.pointer, type, null, 0, cpp_acquire);
      else {
        const elements = args.length === 1 ? null : (args[0] as SequenceElements | null),
          length = args.length === 1 ? (args[0] as number) : (args[1] as number);
        if (!uno_type_sequence_construct(this.pointer, type, elements, length, cpp_acquire))
          throw new RangeError("std::bad_alloc");
      }
    }
  }
  /** Erases the original C++ address-of a Sequence value used by Any assignment. Returns its existing sole field cell, with no allocation, copy, acquire or new lifetime owner; it is not a document byte representation. @returns Original initialized object address. */
  getAddress(): [uno_Sequence | null] {
    return this.pointer;
  }
  /** Original repeated favourUnsigned lookup of this compile-time Sequence<E>; real member-static type cells remain in Sequence-type. @returns Borrowed original type reference. */
  private type(): R {
    return getSequenceTypeFavourUnsigned(
      (this.constructor as SequenceConstructor<E>).ElementType,
    ).getTypeLibType() as R;
  }
  /** Original destructor decrements first and consults its type only for zero-count C destruction. @returns Nothing. */
  dispose(): void {
    const sequence = this.get() as uno_Sequence;
    if (osl_atomic_decrement(sequenceCountAddress(sequence)) === 0)
      uno_type_sequence_destroy(sequence, this.type(), cpp_release);
  }
  /** Original copy assignment uses its actual C owner even for self/identical handles. @param source - Same declared source template. @returns This same value. */
  assign(source: Sequence<E>): this {
    uno_type_sequence_assign(this.pointer, source.get() as uno_Sequence, this.type(), cpp_release);
    return this;
  }
  /** Original internal move assignment swaps two handles, unlike Reference's transfer/null move. @param source - Rvalue source. @returns This same value. */
  moveAssign(source: Sequence<E>): this {
    this.swap(source);
    return this;
  }
  /** Original borrowed handle accessor. @returns Actual pointer. */
  get(): uno_Sequence | null {
    return this.pointer[0];
  }
  /** Original signed element count. @returns Actual length. */
  getLength(): number {
    return (this.get() as uno_Sequence).nElements;
  }
  /** Original strictly positive predicate. @returns Actual source predicate. */
  hasElements(): boolean {
    return (this.get() as uno_Sequence).nElements > 0;
  }
  /** Original asserted nonnegative length converted to unsigned32. @returns Source unsigned count. */
  size(): number {
    if (!(this.getLength() >= 0)) throw new Error("Sequence size assertion");
    return this.getLength() >>> 0;
  }
  /** Original borrowed typed tail pointer; no COW/type initialization/value assembly. Empty tail contents are not defined. @returns Actual logical storage. */
  getConstArray(): uno_Sequence["elements"] {
    return (this.get() as uno_Sequence).elements;
  }
  /** Original getArray invokes real C copy-on-write before returning the actual tail pointer. @returns Actual logical storage. */
  getArray(): uno_Sequence["elements"] {
    if (!uno_type_sequence_reference2One(this.pointer, this.type(), cpp_acquire, cpp_release))
      throw new RangeError("std::bad_alloc");
    return (this.get() as uno_Sequence).elements;
  }
  /** Original internal const begin, even on a mutable sequence; no hidden COW. @returns Actual tail pointer. */
  begin(): uno_Sequence["elements"] {
    return this.getConstArray();
  }
  /** Original internal const end pointer addition using declared sizeof(E). @returns Logical one-past address. */
  end(): SequenceEnd {
    return [
      this.begin(),
      this.getLength() * (this.constructor as SequenceConstructor<E>).ElementSize,
    ];
  }
  /** Original asserted const E reference. The erased Type specialization uses its existing borrowed view over the actual cell; other element bindings retain logical addresses. No value copy, acquire or COW occurs. @param index - Native signed32 index. @returns Original borrowed element reference. */
  operatorIndex(index: number): E {
    if (!(index >= 0 && index >>> 0 < this.getLength() >>> 0))
      throw new Error("Sequence index assertion");
    const binding = this.constructor as SequenceConstructor<E>,
      element = ((this.get() as uno_Sequence).elements as SequenceElements).get(
        index * binding.ElementSize,
      );
    return (
      binding.ElementType === "Type"
        ? getTypeFromTypeDescriptionReference(element as [R | null])
        : element
    ) as E;
  }
  /** Original equal handle/count fast paths, then actual C equality with real C++ query/release callbacks. @param other - Same declared template. @returns Original equality. */
  operatorEquals(other: Sequence<E>): boolean {
    if (this.get() === other.get()) return true;
    if (this.getLength() !== other.getLength()) return false;
    const type = this.type();
    return uno_type_equalData(
      this.pointer,
      type,
      other.pointer,
      type,
      cpp_queryInterface,
      cpp_release,
    );
  }
  /** Original inequality calls equality. @param other - Right side. @returns Original inequality. */
  operatorNotEquals(other: Sequence<E>): boolean {
    return !this.operatorEquals(other);
  }
  /** Original reallocation and source bad_alloc on a false C result; the actual C engine determines prior handle/value preservation. @param size - New native signed32 length. @returns Nothing. */
  realloc(size: number): void {
    if (!uno_type_sequence_realloc(this.pointer, this.type(), size, cpp_acquire, cpp_release))
      throw new RangeError("std::bad_alloc");
  }
  /** Original internal std::swap of the two fields without acquire/release or value copying. @param other - Other same template. @returns Nothing. */
  swap(other: Sequence<E>): void {
    const old = this.pointer[0];
    this.pointer[0] = other.pointer[0];
    other.pointer[0] = old;
  }
}
/** Original internal mutable range pair; empty sequences return null without requesting COW. Logical pointer/reference arithmetic explicitly uses the declared source stride. */
export class SequenceRange<E = unknown> {
  /** Original pair first pointer, nullable for an empty range. */
  readonly first: uno_Sequence["elements"] | null;
  /** Original pair second address. */
  readonly second: readonly [uno_Sequence["elements"] | null, number];
  /** Original local SequenceRange pointer/length constructor. @param pointer - Actual source pointer. @param length - Native count. @param stride - Erased sizeof(E). @returns Pair. */
  constructor(pointer: uno_Sequence["elements"] | null, length: number, stride: number) {
    this.first = pointer;
    this.second = [pointer, length * stride];
  }
  /** Original pair first accessor. @returns Actual source pointer. */
  begin(): uno_Sequence["elements"] | null {
    return this.first;
  }
  /** Original pair second accessor. @returns Actual logical end. */
  end(): readonly [uno_Sequence["elements"] | null, number] {
    return this.second;
  }
  /** Original asserted source mutable element reference. @param index - Native index. @param stride - Erased sizeof(E), without another instance field. @returns Actual logical cell. */
  operatorIndex(index: number, stride: number): E {
    if (!(index >= 0 && index < this.second[1] / stride))
      throw new Error("Sequence range index assertion");
    return (this.first as SequenceElements).get(index * stride) as E;
  }
}
/** Original helper calls getArray only once for a nonempty sequence; empty range leaves the original shared handle alone. @param sequence - Actual source owner. @returns Original mutable pair. */
export function asNonConstRange<E>(sequence: Sequence<E>): SequenceRange<E> {
  return new SequenceRange(
    sequence.getLength() ? sequence.getArray() : null,
    sequence.getLength(),
    (sequence.constructor as SequenceConstructor<E>).ElementSize,
  );
}

/** Original toUnoSequence reinterpret-view copy, lowered through real count acquisition and the original adopt constructor without a new type/data provider. @param bytes - Actual SAL byte owner. @returns Owned UNO byte Sequence sharing the same record and elements. */
export function toUnoSequence(
  bytes: import("../../../../../../sal/inc/rtl/byteseq").ByteSequence,
): Sequence<number> {
  const handle = bytes.get() as uno_Sequence;
  osl_atomic_increment(sequenceCountAddress(handle));
  const Bytes = Sequence.specialize<number>("sal_Int8", 1);
  return new Bytes(handle, SAL_NO_ACQUIRE_ARGUMENT);
}
