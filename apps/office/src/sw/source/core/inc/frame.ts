/** @fileoverview Native SwFrameAreaDefinition ownership and scoped value writeback from frame.hxx/wsfrm.cxx. Transformations and full layout geometry remain unported. */
import { SwRect, type ReadonlySwRect } from "../../../inc/swrect";
/** Original frame-area base, composed by SwFrame to retain both native C++ bases in TypeScript. */
export class SwFrameAreaDefinition {
  private readonly maFrameArea = new SwRect();
  private readonly maFramePrintArea = new SwRect();
  private static snLastFrameId = 0;
  private readonly mnFrameId: number;
  private mbFrameAreaPositionValid = false;
  private mbFrameAreaSizeValid = false;
  private mbFramePrintAreaValid = false;
  /** Assigns native uint32 process identity by postincrement. @returns Nothing. */
  public constructor() {
    this.mnFrameId = SwFrameAreaDefinition.snLastFrameId;
    SwFrameAreaDefinition.snLastFrameId = (SwFrameAreaDefinition.snLastFrameId + 1) >>> 0;
  }
  /** Reads native process frame identity. @returns Original ID. */
  public GetFrameId(): number {
    return this.mnFrameId;
  }
  /** Borrows original absolute frame area through const-qualified access. @returns Original area. */
  public getFrameArea(): ReadonlySwRect {
    return this.maFrameArea;
  }
  /** Borrows original print area, relative to the absolute frame origin. @returns Original print area. */
  public getFramePrintArea(): ReadonlySwRect {
    return this.maFramePrintArea;
  }
  /** Reads native position validity. @returns Whether valid. */
  public isFrameAreaPositionValid(): boolean {
    return this.mbFrameAreaPositionValid;
  }
  /** Reads native size validity. @returns Whether valid. */
  public isFrameAreaSizeValid(): boolean {
    return this.mbFrameAreaSizeValid;
  }
  /** Reads native print validity. @returns Whether valid. */
  public isFramePrintAreaValid(): boolean {
    return this.mbFramePrintAreaValid;
  }
  /** Reads native complete validity. @returns Whether all three flags are set. */
  public isFrameAreaDefinitionValid(): boolean {
    return (
      this.isFrameAreaPositionValid() && this.isFrameAreaSizeValid() && this.isFramePrintAreaValid()
    );
  }
  /** Sets native position validity. @param value - New native flag. @returns Nothing. */
  public setFrameAreaPositionValid(value: boolean): void {
    if (this.mbFrameAreaPositionValid !== value) this.mbFrameAreaPositionValid = value;
  }
  /** Sets native size validity. @param value - New native flag. @returns Nothing. */
  public setFrameAreaSizeValid(value: boolean): void {
    if (this.mbFrameAreaSizeValid !== value) this.mbFrameAreaSizeValid = value;
  }
  /** Sets native print validity. @param value - New native flag. @returns Nothing. */
  public setFramePrintAreaValid(value: boolean): void {
    if (this.mbFramePrintAreaValid !== value) this.mbFramePrintAreaValid = value;
  }
  /** Native copy-on-release absolute area access. Explicit Dispose in finally represents C++ scope destruction. */
  public static readonly FrameAreaWriteAccess = class FrameAreaWriteAccess extends SwRect {
    /** Copies the native area while retaining its original target. @param mrTarget - Actual native area owner. @returns Nothing. */
    public constructor(private readonly mrTarget: SwFrameAreaDefinition) {
      super(mrTarget.getFrameArea());
    }
    /** Copies a native rectangle into the current scoped value. @param value - Original rectangle. @returns Nothing. */
    public setSwRect(value: ReadonlySwRect): void {
      this.Assign(value);
    }
    /** Writes changed native values back at scope release, retaining target identity. @returns Nothing. */
    public Dispose(): void {
      if (!this.mrTarget.maFrameArea.Equals(this)) this.mrTarget.maFrameArea.Assign(this);
    }
  };
  /** Native copy-on-release relative print area access. Explicit Dispose in finally represents C++ scope destruction. */
  public static readonly FramePrintAreaWriteAccess = class FramePrintAreaWriteAccess extends SwRect {
    /** Copies the native print area while retaining its original target. @param mrTarget - Actual native area owner. @returns Nothing. */
    public constructor(private readonly mrTarget: SwFrameAreaDefinition) {
      super(mrTarget.getFramePrintArea());
    }
    /** Copies a native rectangle into the current scoped value. @param value - Original rectangle. @returns Nothing. */
    public setSwRect(value: ReadonlySwRect): void {
      this.Assign(value);
    }
    /** Writes changed native values back at scope release, retaining target identity. @returns Nothing. */
    public Dispose(): void {
      if (!this.mrTarget.maFramePrintArea.Equals(this)) this.mrTarget.maFramePrintArea.Assign(this);
    }
  };
}
