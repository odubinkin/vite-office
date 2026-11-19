/** @fileoverview Original ActiveDataStreamer reference replacement and acquired return; stream closing and reading stay with their actual owners. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XActiveDataStreamer } from "../../../udkapi/com/sun/star/io/XActiveDataStreamer";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
/** Complete original active data streamer component. */
export class ActiveDataStreamer
  extends WeakImplHelper.specialize(XActiveDataStreamer)
  implements XActiveDataStreamer
{
  private readonly m_xStream = new Reference<XStream>();
  /** Original implicit field/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xStream.dispose();
    super.destroy();
  }
  /** Original Reference assignment, without closing either stream. @param stream - Borrowed new stream or empty reference. @returns Nothing. */
  setStream(stream: Reference<XStream>): void {
    this.m_xStream.assign(stream);
  }
  /** Original acquired return. @returns Independent owner of the same stream. */
  getStream(): Reference<XStream> {
    return new Reference(this.m_xStream);
  }
}
