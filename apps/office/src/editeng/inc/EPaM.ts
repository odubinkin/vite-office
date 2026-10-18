/** @fileoverview Original EditEngine paragraph/index value from include/editeng/EPaM.hxx. */

/** Original signed32 paragraph end/not-found marker. */
export const EE_PARA_MAX = 0x7fffffff;
/** Original signed32 text-position end/not-found marker. */
export const EE_TEXTPOS_MAX = 0x7fffffff;

/** Public paragraph/index value with native memberwise copy semantics. */
export class EPaM {
  /** Zero-based paragraph or original end marker. */
  public nPara = 0;
  /** UTF-16 code-unit index or original end marker. */
  public nIndex = 0;

  /** Original default, two-coordinate and implicit copy constructors. Inputs inhabit the native signed32 domain. @param args - Coordinates or copied value. @returns Position value. */
  public constructor(...args: [] | [source: EPaM] | [paragraph: number, index: number]) {
    if (args[0] instanceof EPaM) this.assign(args[0]);
    else {
      this.nPara = args[0] ?? 0;
      this.nIndex = args[1] ?? 0;
    }
  }
  /** Original not-found value, independently constructed per call. @returns Maximal position. */
  public static NotFound(): EPaM {
    return new EPaM(EE_PARA_MAX, EE_TEXTPOS_MAX);
  }
  /** Original implicit memberwise assignment. @param source - Copied value. @returns This position. */
  public assign(source: EPaM): this {
    this.nPara = source.nPara;
    this.nIndex = source.nIndex;
    return this;
  }
  /** Original defaulted coordinate equality. @param other - Compared position. @returns Whether both coordinates equal. */
  public equals(other: EPaM): boolean {
    return this.nPara === other.nPara && this.nIndex === other.nIndex;
  }
  /** Original paragraph-first strict ordering. @param other - Compared position. @returns Whether before it. */
  public lessThan(other: EPaM): boolean {
    return this.nPara < other.nPara || (this.nPara === other.nPara && this.nIndex < other.nIndex);
  }
  /** Original diagnostic stream content, without a native ostream/template binding. @returns Position description. */
  public toString(): string {
    return `EPaM(${this.nPara},${this.nIndex})`;
  }
}
