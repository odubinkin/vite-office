/** @fileoverview Owns the Writer row-height dialog draft and native Apply from rowht.cxx. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import type { SwFEShell } from "../../core/frmedt/fetab";

/** Captures native row height without mutating selection, then applies the accepted size item. */
export class SwTableHeightDlg {
  public static readonly MINLAY = 23;
  public static readonly MAX_HEIGHT = Math.round((99 * 1440) / 2.54);
  public height = SwTableHeightDlg.MINLAY;
  public fit = false;

  /** Reads the shell's current or selected row value once. @param shell - Original editing shell. @returns Nothing. */
  public constructor(private readonly shell: SwFEShell) {
    const size = shell.GetRowHeight();
    if (size !== undefined) {
      this.fit = size.GetHeightSizeType() !== SwFrameSize.Fixed;
      this.SetHeight(size.GetHeight());
    }
  }

  /** Applies native metric spin bounds in twips. @param height - Edited twip height. @returns Nothing. */
  public SetHeight(height: number): void {
    this.height = Math.max(
      SwTableHeightDlg.MINLAY,
      Math.min(SwTableHeightDlg.MAX_HEIGHT, Math.round(height)),
    );
  }

  /** Sets the source fit checkbox state without applying row attributes. @param fit - Automatic height flag. @returns Nothing. */
  public SetFit(fit: boolean): void {
    this.fit = fit;
  }

  /** Applies a new Fixed item, changing its mode to Minimum when fit is active. @returns Whether native rows changed. */
  public Apply(): boolean {
    const size = new SwFormatFrameSize(SwFrameSize.Fixed, 0, this.height);
    if (this.fit) size.SetHeightSizeType(SwFrameSize.Minimum);
    return this.shell.SetRowHeight(size);
  }
}
