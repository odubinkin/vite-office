/** @fileoverview Native Graphic value for embedded encoded images transported between office filters. */
import { Size, type ReadonlySize } from "../../../tools/inc/gen";

/** Owns the original encoded image and its physical preferred size. */
export class Graphic {
  private readonly data: Uint8Array;
  private readonly prefSize: Size;

  /** Creates an embedded graphic value. @param data - Encoded image bytes. @param mediaType - Image media type. @param prefSize - Preferred size in twips. @returns Independent graphic. */
  constructor(
    data: Uint8Array,
    readonly mediaType: string,
    prefSize: ReadonlySize,
  ) {
    this.data = Uint8Array.from(data);
    this.prefSize = new Size(prefSize);
  }

  /** Copies the image bytes for package output or Worker transfer. @returns Owned byte array. */
  GetNativeData(): Uint8Array {
    return this.data.slice();
  }

  /** Reads the preferred extent in the graphic's twip map mode. @returns Independent size. */
  GetPrefSize(): Size {
    return new Size(this.prefSize);
  }
}
