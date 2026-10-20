/** @fileoverview Original SearchOptions2.idl inheritance and generated default/copy/all-field construction. AlgorithmType2 is independent of obsolete algorithmType. */
import {
  SearchOptions,
  type SearchOptionsConstReference,
  type SearchOptionsArguments,
} from "./SearchOptions";
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
  public AlgorithmType2 = 0;
  public WildcardEscapeCharacter = 0;
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
}
