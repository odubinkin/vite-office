/** @fileoverview Consumed native MSWordExportBase document/range and font ownership. Actual SwPaM binds the consumed base portion of the native SwUnoCursor; cursor overrides, traversal and the broader export context are not yet admitted. */
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { wwFont, wwFontHelper } from "./wrtw8sty";
/** Native common Word export owner for the currently consumed context. */
export class MSWordExportBase {
  protected readonly m_aFontHelper = new wwFontHelper();
  protected readonly m_nCurStart: number;
  protected readonly m_nCurEnd: number;
  /** Original consumed constructor stores the real document and selection owners. @param m_rDoc - Actual document. @param m_pCurPam - Actual current range base binding. @param m_pOrigPam - Actual original range. @returns Export context. */
  constructor(
    readonly m_rDoc: SwDoc,
    protected readonly m_pCurPam: SwPaM,
    protected readonly m_pOrigPam: SwPaM | null,
  ) {
    this.m_nCurStart = m_pCurPam.GetPoint().GetNodeIndex();
    this.m_nCurEnd = m_pCurPam.GetMark().GetNodeIndex();
  }
  /** Original item overload returns the registered numeric font ID. @param font - Actual shared item. @returns ID. */
  GetId(font: SvxFontItem): number;
  /** Original font-value overload registers without returning an ID. @param font - Actual native font value. @returns Nothing. */
  GetId(font: wwFont): void;
  /** Native overload binding consumes the genuine shared font helper. @param font - Actual font/item. @returns ID for the item overload only. */
  GetId(font: SvxFontItem | wwFont): number | void {
    if (font instanceof SvxFontItem) return this.m_aFontHelper.GetId(font);
    this.m_aFontHelper.GetId(font);
  }
}
