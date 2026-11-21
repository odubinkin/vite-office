/** @fileoverview Original SearchOptions2.idl inheritance and generated default/copy/all-field construction. AlgorithmType2 is independent of obsolete algorithmType. */
import {
  SearchOptions,
  cppu_detail_getUnoType_SearchOptions,
  type SearchOptionsConstReference,
  type SearchOptionsArguments,
} from "./SearchOptions";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";

const the_type: [R | null] = [null];

/** Publishes inherited SearchOptions metadata and the two declared fields. @returns Borrowed type. */
export function cppu_detail_getUnoType_SearchOptions2(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.SearchOptions2\0"),
      cppu_detail_getUnoType_SearchOptions().getTypeLibType() as R,
      2,
      [
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}

/** Borrowed extended native value fields. */
export interface SearchOptions2ConstReference extends SearchOptionsConstReference {
  readonly AlgorithmType2: number;
  readonly WildcardEscapeCharacter: number;
}
/** Complete inherited UNO constructor field order. */
export type SearchOptions2Arguments = [
  ...SearchOptionsArguments,
  AlgorithmType2: number,
  WildcardEscapeCharacter: number,
];
/** Native extended UNO struct. Both new fields default to zero, not to newer ABSOLUTE/backslash. */
export class SearchOptions2 extends SearchOptions implements SearchOptions2ConstReference {
  private readonly algorithmType2Value: [number] = [0];
  private readonly wildcardEscapeValue: [number] = [0];

  /** The current algorithm as the original IDL short. @returns Algorithm identity. */
  public get AlgorithmType2(): number {
    return this.algorithmType2Value[0];
  }
  /** Assigns the original IDL short. @param value - Algorithm identity. @returns Nothing. */
  public set AlgorithmType2(value: number) {
    this.algorithmType2Value[0] = (value << 16) >> 16;
  }

  /** Reads the original wildcard escape character. @returns Unicode value. */
  public get WildcardEscapeCharacter(): number {
    return this.wildcardEscapeValue[0];
  }
  /** Assigns the original IDL long. @param value - Unicode value. @returns Nothing. */
  public set WildcardEscapeCharacter(value: number) {
    this.wildcardEscapeValue[0] = value | 0;
  }
  /** Original default, implicit copy or complete inherited-field constructor. @param args - Original constructor shape. @returns Independent value owner. */
  public constructor(
    ...args: [] | [source: SearchOptions2ConstReference] | SearchOptions2Arguments
  ) {
    super();
    if (args.length === 1) {
      this.CopyFields(args[0]);
      this.AlgorithmType2 = args[0].AlgorithmType2;
      this.WildcardEscapeCharacter = args[0].WildcardEscapeCharacter;
    } else if (args.length === 11) {
      this.SetFields(
        args[0],
        args[1],
        args[2],
        args[3],
        args[4],
        args[5],
        args[6],
        args[7],
        args[8],
      );
      this.AlgorithmType2 = args[9];
      this.WildcardEscapeCharacter = args[10];
    }
  }
  /** Logical CPPU member addresses, including the inherited fields. @param offset - Member offset. @returns Existing field address. */
  public override get(offset: number): unknown {
    if (offset === 64) return this.algorithmType2Value;
    if (offset === 68) return this.wildcardEscapeValue;
    return super.get(offset);
  }
}
