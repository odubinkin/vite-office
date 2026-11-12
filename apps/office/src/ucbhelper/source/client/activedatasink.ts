/** @fileoverview Original ActiveDataSink reference replacement and acquired return; stream closing and reading stay with their actual owners. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
/** Original named template base from activedatasink.hxx. */
class ActiveDataSink_Base extends WeakImplHelper.specialize(XActiveDataSink) {}
/** Complete original active data sink component. */
export class ActiveDataSink extends ActiveDataSink_Base implements XActiveDataSink {
  private readonly m_xStream = new Reference<XInputStream>();
  /** Original implicit field/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xStream.dispose();
    super.destroy();
  }
  /** Original Reference assignment, without closing either stream. @param stream - Borrowed new stream or empty reference. @returns Nothing. */
  setInputStream(stream: Reference<XInputStream>): void {
    this.m_xStream.assign(stream);
  }
  /** Original acquired return. @returns Independent owner of the same stream. */
  getInputStream(): Reference<XInputStream> {
    return new Reference(this.m_xStream);
  }
}
