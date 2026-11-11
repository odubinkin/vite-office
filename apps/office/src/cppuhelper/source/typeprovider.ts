/** @fileoverview Original OTypeCollection overloads and TypeSeqLen/PutToTypeSeq/InitTypeSeq helpers over actual native Type Sequence owners. OImplementationId and physical allocation operators remain separate unported responsibilities. */
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import {
  typelib_typedescriptionreference_assign,
  type typelib_TypeDescriptionReference as R,
} from "../../cppu/inc/typelib/typedescription";
const Types = Sequence.specialize<Type>("Type", 8);
/** Original constructor overload set, with one to twelve types and an optional final native sequence, plus the implicit copy constructor. */
type Arguments =
  | [source: OTypeCollection]
  | [type1: Type]
  | [type1: Type, additional: Sequence<Type>]
  | [type1: Type, type2: Type]
  | [type1: Type, type2: Type, additional: Sequence<Type>]
  | [type1: Type, type2: Type, type3: Type]
  | [type1: Type, type2: Type, type3: Type, additional: Sequence<Type>]
  | [type1: Type, type2: Type, type3: Type, type4: Type]
  | [type1: Type, type2: Type, type3: Type, type4: Type, additional: Sequence<Type>]
  | [type1: Type, type2: Type, type3: Type, type4: Type, type5: Type]
  | [type1: Type, type2: Type, type3: Type, type4: Type, type5: Type, additional: Sequence<Type>]
  | [type1: Type, type2: Type, type3: Type, type4: Type, type5: Type, type6: Type]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      additional: Sequence<Type>,
    ]
  | [type1: Type, type2: Type, type3: Type, type4: Type, type5: Type, type6: Type, type7: Type]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      additional: Sequence<Type>,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      additional: Sequence<Type>,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      additional: Sequence<Type>,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
      additional: Sequence<Type>,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
      type11: Type,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
      type11: Type,
      additional: Sequence<Type>,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
      type11: Type,
      type12: Type,
    ]
  | [
      type1: Type,
      type2: Type,
      type3: Type,
      type4: Type,
      type5: Type,
      type6: Type,
      type7: Type,
      type8: Type,
      type9: Type,
      type10: Type,
      type11: Type,
      type12: Type,
      additional: Sequence<Type>,
    ];
/** Original variadic length recursion after compiler erasure. @param types - Leading actual Type arguments. @param additional - Native tail. @returns Exact count. */
function TypeSeqLen(types: readonly Type[], additional: Sequence<Type>): number {
  return types.length + additional.getLength();
}
/** Original leading Type assignment followed by std::copy of the final Sequence. @param target - Actual writable field cells. @param types - Leading types. @param additional - Native tail. @returns Nothing. */
function PutToTypeSeq(
  target: ReadonlyMap<number, [R | null]>,
  types: readonly Type[],
  additional: Sequence<Type>,
): void {
  for (let i = 0; i < types.length; ++i)
    typelib_typedescriptionreference_assign(
      target.get(i * 8) as [R | null],
      (types[i] as Type).getTypeLibType(),
    );
  for (let i = 0; i < additional.getLength(); ++i)
    typelib_typedescriptionreference_assign(
      target.get((types.length + i) * 8) as [R | null],
      additional.operatorIndex(i).getTypeLibType(),
    );
}
/** Original sized construction and initialization. @param types - Leading types. @param additional - Native tail. @returns Owned sequence. */
function InitTypeSeq(types: readonly Type[], additional: Sequence<Type>): Sequence<Type> {
  const sequence = new Types(TypeSeqLen(types, additional));
  try {
    PutToTypeSeq(sequence.getArray() as ReadonlyMap<number, [R | null]>, types, additional);
    return sequence;
  } catch (error) {
    sequence.dispose();
    throw error;
  }
}
/** Original native type collection preserves order and duplicates and returns Sequence value copies. */
export class OTypeCollection {
  private readonly _aTypes: Sequence<Type>;
  /** Original one-through-twelve constructor overloads and optional empty default tail; implicit copy uses the actual Sequence copy constructor. @param args - Selected native overload. @returns Collection. */
  constructor(...args: Arguments) {
    if (args[0] instanceof OTypeCollection) {
      this._aTypes = new Types(args[0]._aTypes);
      return;
    }
    const last = args[args.length - 1],
      supplied = last instanceof Sequence,
      additional = supplied ? (last as Sequence<Type>) : new Types();
    try {
      this._aTypes = InitTypeSeq((supplied ? args.slice(0, -1) : args) as Type[], additional);
    } finally {
      if (!supplied) additional.dispose();
    }
  }
  /** Original value-return overload. @returns Owned Sequence copy. */
  getTypes(): Sequence<Type> {
    return new Types(this._aTypes);
  }
  /** Original implicit memberwise copy assignment. @param other - Source collection. @returns This collection. */
  assign(other: OTypeCollection): this {
    this._aTypes.assign(other._aTypes);
    return this;
  }
  /** Original implicit member destructor. @returns Nothing. */
  dispose(): void {
    this._aTypes.dispose();
  }
}
