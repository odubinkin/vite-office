/** @fileoverview Native XGraphic view of VCL's embedded graphic value. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XGraphic } from "../../../offapi/com/sun/star/graphic/XGraphic";
import { EMPTY, PIXEL, VECTOR } from "../../../offapi/com/sun/star/graphic/GraphicType";
import type { Graphic } from "../gdi/graph";

/** Binds the original UNO graphic view to the immutable VCL value. */
export class UnoGraphic extends WeakImplHelper.specialize(XGraphic) implements XGraphic {
  /** Creates the native interface over an embedded image. @param value - Actual graphic value. @returns XGraphic implementation. */
  constructor(readonly value: Graphic) {
    super();
  }

  /** Returns the original raster or vector type. @returns GraphicType constant. */
  public getType(): number {
    if (this.value.IsNone()) return EMPTY;
    return this.value.mediaType === "image/svg+xml" ? VECTOR : PIXEL;
  }
}
