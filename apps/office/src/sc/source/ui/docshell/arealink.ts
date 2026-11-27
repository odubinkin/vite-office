/** @fileoverview Native Calc external data range identity from arealink.cxx. */
import { SfxLinkUpdateMode, SvBaseLink } from "../../../../sfx2/source/appl/lnkbase2";
import { SotClipboardFormatId } from "../../../../sot/inc/formats";
import { ScRange } from "../../../inc/address";

/** Links one external range to its native destination rectangle. */
export class ScAreaLink extends SvBaseLink {
  private readonly aDestArea: ScRange;

  /** Constructs the original client range and refresh delay. @param aFileName - Source URL. @param aFilterName - Source filter. @param aOptions - Source filter options. @param aSourceArea - External range expression. @param destination - Native destination. @param nRefreshDelaySeconds - Refresh interval in seconds. */
  constructor(
    private readonly aFileName: string,
    private readonly aFilterName: string,
    private readonly aOptions: string,
    private readonly aSourceArea: string,
    destination: ScRange,
    private readonly nRefreshDelaySeconds: number,
  ) {
    super(SfxLinkUpdateMode.ONCALL, SotClipboardFormatId.SIMPLE_FILE);
    this.aDestArea = new ScRange(destination);
  }

  /** Reads the source file from the area link. @returns Source document URL. */
  GetFile(): string {
    return this.aFileName;
  }

  /** Reads the native document filter. @returns Filter name. */
  GetFilter(): string {
    return this.aFilterName;
  }

  /** Reads the native filter options. @returns Filter options. */
  GetOptions(): string {
    return this.aOptions;
  }

  /** Reads the external data range expression. @returns Source range. */
  GetSource(): string {
    return this.aSourceArea;
  }

  /** Borrows the original destination range. @returns Native range. */
  GetDestArea(): ScRange {
    return this.aDestArea;
  }

  /** Replaces the destination rectangle's endpoints. @param destination - Native rectangle. */
  SetDestArea(destination: ScRange): void {
    this.aDestArea.assign(destination);
  }

  /** Reads the native refresh interval. @returns Whole seconds. */
  GetRefreshDelaySeconds(): number {
    return this.nRefreshDelaySeconds;
  }
}
