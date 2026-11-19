/** @fileoverview Original ZipPackageSink.cxx active data sink; acquired stream references are retained without closing or substituting their owner. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
/** Original source sink with its actual input reference member. */
export class ZipPackageSink
  extends WeakImplHelper.specialize(XActiveDataSink)
  implements XActiveDataSink
{
  private readonly xStream = new Reference<XInputStream>();
  /** Original field/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.xStream.dispose();
    super.destroy();
  }
  /** Original Reference replacement. @param stream - Actual source input. @returns Nothing. */
  setInputStream(stream: Reference<XInputStream>): void {
    this.xStream.assign(stream);
  }
  /** Original acquired copy of the plugged input. @returns Owned input reference. */
  getInputStream(): Reference<XInputStream> {
    return new Reference(this.xStream);
  }
}
