/** @fileoverview Original editeng Section value from section.cxx; item pointers are borrowed ordinary JS references. */
import type { SfxPoolItem } from "../../../svl/inc/poolitem";
/** Original paragraph/span and ordered format-item list. */
export class Section {
  public maAttributes: SfxPoolItem[] = [];
  /** Original signed32 value initialization. @param mnParagraph - Paragraph. @param mnStart - Start. @param mnEnd - End. @returns Section. */
  constructor(
    public mnParagraph: number,
    public mnStart: number,
    public mnEnd: number,
  ) {}
}
