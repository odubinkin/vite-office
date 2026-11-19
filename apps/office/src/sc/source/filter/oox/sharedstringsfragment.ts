/** @fileoverview Original shared-string table fragment creates a rich string context for each indexed item. */
import type { SaxesTagNS } from "saxes";
import {
  FragmentHandler,
  type FragmentContext,
  type FragmentFilter,
} from "../../../../oox/source/core/fragmenthandler";
import { RichStringContext } from "./richstringcontext";
import type { SharedStringsBuffer } from "./sharedstringsbuffer";
import { isSpreadsheetTag } from "./workbookfragment";
import type { ExcelGraphicHelper } from "./stylesbuffer.color";

/** Selects the table root and delegates each string to its own context. */
export class SharedStringsFragment extends FragmentHandler {
  private inTable = false;

  /** Binds the actual workbook-owned shared string table. @param filter - Fragment filter. @param path - Relationship target. @param strings - Workbook string owner. @param graphicHelper - Workbook color resolver. @returns Fragment. */
  constructor(
    filter: FragmentFilter,
    path: string,
    private readonly strings: SharedStringsBuffer,
    private readonly graphicHelper?: ExcelGraphicHelper,
  ) {
    super(filter, path);
  }

  /** Selects the root and the original si child. @param tag - Expanded tag. @returns Selected context. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (!isSpreadsheetTag(tag)) return null;
    if (this.inTable) {
      return tag.local === "si"
        ? new RichStringContext(this.strings.createRichString(), this.graphicHelper)
        : null;
    }
    return tag.local === "sst" ? this : null;
  }

  /** Opens the table. @returns Nothing. */
  override startFastElement(): void {
    this.inTable = true;
  }

  /** Closes the table. @returns Nothing. */
  override endFastElement(): void {
    this.inTable = false;
  }
}
