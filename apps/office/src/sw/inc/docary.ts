/** @fileoverview Native SwFormatsBase collection query contract from docary.hxx and format.cxx. */
import type { SwFormat } from "../source/core/attr/format";
import type { SwFrameFormat } from "../source/core/layout/atrfrm";
/** Original abstract format collection; concrete containers own their storage. */
export abstract class SwFormatsBase {
  /** Original collection count. @returns Count. */
  abstract GetFormatCount(): number;
  /** Original positional access. @param index - Source position. @returns Borrowed format. */
  abstract GetFormat(index: number): SwFormat;
  /** Original default linear name search. @param name - Actual format name. @returns First matching format or absent. */
  FindFormatByName(name: string): SwFormat | undefined {
    for (let index = 0; index < this.GetFormatCount(); ++index) {
      const format = this.GetFormat(index);
      if (format.GetName() === name) return format;
    }
    return undefined;
  }
  /** Original base rename is deliberately empty. @param format - Borrowed frame format. @param name - New name. @returns Nothing. */
  Rename(format: SwFrameFormat, name: string): void {
    void format;
    void name;
  }
}
