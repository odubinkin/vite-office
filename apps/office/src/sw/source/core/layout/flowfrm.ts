/** @fileoverview Owns original master/follow links from flowfrm.cxx; native flow placement and lock flags remain incomplete. */
import type { SwFrame } from "./wsfrm";

/** Native flow-frame component over the original frame, representing the C++ multiple-inheritance ownership. */
export class SwFlowFrame {
  private m_pFollow: SwFlowFrame | undefined;
  private m_pPrecede: SwFlowFrame | undefined;
  /** Retains the original frame with initially absent preceding/follow links. @param m_rThis - Actual frame owner. @returns Nothing. */
  public constructor(public readonly m_rThis: SwFrame) {}
  /** Reads the original native follow. @returns Next original flow frame. */
  public GetFollow(): SwFlowFrame | undefined {
    return this.m_pFollow;
  }
  /** Reads the original native predecessor. @returns Previous original flow frame. */
  public GetPrecede(): SwFlowFrame | undefined {
    return this.m_pPrecede;
  }
  /** Tests native follow ownership. @returns Whether a next flow frame exists. */
  public HasFollow(): boolean {
    return this.m_pFollow !== undefined;
  }
  /** Classifies a follow by its actual native predecessor. @returns Whether this is a follow. */
  public IsFollow(): boolean {
    return this.m_pPrecede !== undefined;
  }
  /** Replaces and re-chains original flow ownership in source order. @param follow - Next original flow frame. @returns Nothing. */
  public SetFollow(follow: SwFlowFrame | undefined): void {
    if (this.m_pFollow !== undefined) this.m_pFollow.m_pPrecede = undefined;
    this.m_pFollow = follow;
    if (this.m_pFollow !== undefined) {
      if (this.m_pFollow.m_pPrecede !== undefined) this.m_pFollow.m_pPrecede.m_pFollow = undefined;
      this.m_pFollow.m_pPrecede = this;
    }
  }
  /** Detaches original neighbors as the native destructor does without stitching the chain. @returns Nothing. */
  public DestroyImpl(): void {
    if (this.m_pFollow !== undefined) this.m_pFollow.m_pPrecede = undefined;
    if (this.m_pPrecede !== undefined) this.m_pPrecede.m_pFollow = undefined;
    this.m_pFollow = undefined;
    this.m_pPrecede = undefined;
  }
}
