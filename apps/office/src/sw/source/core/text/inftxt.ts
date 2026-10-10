/** @fileoverview Resolves the represented Number branch of SwTextPaintInfo::DrawViewOpt for a browser paint device. */
import type { SwParaPortion } from "./porlay";
import type { SwTextFrame } from "./txtfrm";
import type { SwViewOption } from "../../../inc/viewopt";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Resolves native Number background admission and DrawBackground color selection; device rectangle painting remains external. @param node - Original paragraph-property owner. @param options - Actual view options. @param onWin - Whether painting to a window device. @param isMulti - Native multi-portion context. @param color - Optional explicit paint color. @returns Background color when admitted. */
export function resolveSwNumberPortionBackground(
  node: SwTextNode,
  options: SwViewOption,
  onWin = true,
  isMulti = false,
  color?: string,
): string | undefined {
  if (!onWin || isMulti) return undefined;
  if (options.IsPagePreview() || options.IsReadonly()) return undefined;
  if (!options.IsFieldShadings() || !node.HasMarkedLabel()) return undefined;
  return color ?? options.GetFieldShadingsColor();
}

/** Original paragraph information used by native text iteration; formatting retry remains unrepresented. */
export class SwTextInfo {
  private readonly m_pPara: SwParaPortion | undefined;
  private readonly m_nTextStart: number;
  /** Retains the original formatted paragraph and frame offset. @param frame - Original text frame. @returns Information. */
  public constructor(frame: SwTextFrame) {
    this.m_pPara = frame.GetPara();
    this.m_nTextStart = frame.GetOffset();
  }
  /** Reads the original first-line paragraph. @returns Paragraph information. */
  public GetParaPortion(): SwParaPortion | undefined {
    return this.m_pPara;
  }
  /** Reads the original frame text offset. @returns UTF-16 offset. */
  public GetTextStart(): number {
    return this.m_nTextStart;
  }
}
/** Native size information for the represented unmerged text; font/device sizing remains unrepresented. */
export class SwTextSizeInfo extends SwTextInfo {
  /** Retains the original frame and its text owner. @param frame - Original text frame. @returns Information. */
  public constructor(private readonly frame: SwTextFrame) {
    super(frame);
  }
  /** Reads original unmerged node text. @returns UTF-16 text. */
  public GetText(): string {
    return this.frame.GetTextNodeFirst().GetText();
  }
  /** Reads one original text character. @param position - UTF-16 offset. @returns Original character. */
  public GetChar(position: number): string | undefined {
    return this.GetText()[position];
  }
}
