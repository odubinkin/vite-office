/** @fileoverview Consumed ScTabViewShell actual view ownership and default frame line from tabvwsh4.cxx/tabvwsh8.cxx;native window/UNO services remain unported. */
import { ScViewFunc } from "./viewfunc";
import { ScViewData } from "./viewdata";
import type { ScDocShell } from "../docshell/docsh";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { COL_BLACK } from "../../../../tools/inc/color";
/** Native view-shell state persists across commands and is replaced with its actual document view. */
export class ScTabViewShell extends ScViewFunc {
  private pCurFrameLine: SvxBorderLine | undefined = new SvxBorderLine(
    COL_BLACK,
    20,
    SvxBorderLineStyle.SOLID,
  );
  /** Binds actual source view data and shell. @param shell - Document shell. @returns View shell. */
  constructor(shell: ScDocShell) {
    const data = new ScViewData(shell.GetDocument());
    super(data, shell);
    // Native pView constructor initialization follows super because JavaScript forbids this before the base constructor.
    data["pView"] = this;
  }
  /** Original borrowed frame-line pointer. @returns Actual default line or absence. */
  GetDefaultFrameLine(): SvxBorderLine | undefined {
    return this.pCurFrameLine;
  }
  /** Original tabvwsh8 recreation copies only color,width and style. @param line - New default or absence. @returns Nothing. */
  SetDefaultFrameLine(line: SvxBorderLine | undefined): void {
    this.pCurFrameLine = line
      ? new SvxBorderLine(line.GetColor(), line.GetWidth(), line.GetBorderLineStyle())
      : undefined;
  }
}
