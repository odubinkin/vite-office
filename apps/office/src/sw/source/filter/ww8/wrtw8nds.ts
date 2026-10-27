/** @fileoverview Native MSWord text-snippet transformations from wrtw8nds.cxx for the represented Writer character item slice. */
/** MSWord attribute iterator text extraction; script/bidi iteration remains on its separate producer frontier. */
export class SwWW8AttrIter {
  /** Original code-unit slice, control substitutions and content-control marker removal. RES_CHRATR_CASEMAP is not represented by the current Writer item pool, so the source title-case branch is not admitted here. @param text - Original node text. @param start - Native UTF16 offset. @param length - Native UTF16 length. @returns Export snippet. */
  public GetSnippet(text: string, start: number, length: number): string {
    if (!length) return "";
    return text
      .slice(start, start + length)
      .replaceAll("\n", "\v")
      .replaceAll("\u2011", "\u001e")
      .replaceAll("\u00ad", "\u001f")
      .replaceAll("\u0001", "");
  }
}
