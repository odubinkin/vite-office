/** @fileoverview Owns original content-node frame registration from pinned ssfrm.cxx; native flow/redline layout remains incomplete. */
import { SwFrame } from "./wsfrm";
import { SwFlowFrame } from "./flowfrm";
import type { SwTextFrame } from "../text/txtfrm";
import type { SwContentNode } from "../docnode/node";

/** Native content-frame base registering the original content node rather than a projected geometry owner. */
export abstract class SwContentFrame extends SwFrame {
  protected readonly flow: SwFlowFrame;
  /** Registers the original native content owner. @param node - Existing source node. @param sibling - Existing original root-bearing frame. @returns Nothing. */
  protected constructor(node: SwContentNode, sibling?: SwFrame) {
    super(node, sibling);
    this.flow = new SwFlowFrame(this);
  }
  /** Reads the next original native content frame. @returns Follow frame. */
  public GetFollow(): SwContentFrame | undefined {
    return this.flow.GetFollow()?.m_rThis as SwContentFrame | undefined;
  }
  /** Reads the preceding original content frame. @returns Preceding frame. */
  public GetPrecede(): SwContentFrame | undefined {
    return this.flow.GetPrecede()?.m_rThis as SwContentFrame | undefined;
  }
  /** Tests actual follow ownership. @returns Whether a follow exists. */
  public HasFollow(): boolean {
    return this.flow.HasFollow();
  }
  /** Classifies the original native predecessor link. @returns Whether this is a follow. */
  public IsFollow(): boolean {
    return this.flow.IsFollow();
  }
  /** Finds the original immediate text master using native reciprocal-link guards. @returns Original master or a lost link. */
  public FindMaster(): SwTextFrame | undefined {
    const preceding = this.GetPrecede();
    return preceding !== undefined && preceding.HasFollow() && preceding.GetFollow() === this
      ? (preceding as SwTextFrame)
      : undefined;
  }
  /** Re-chains original content frames through their native flow component. @param follow - Actual next content frame. @returns Nothing. */
  public SetFollow(follow: SwContentFrame | undefined): void {
    this.flow.SetFollow(follow?.flow);
  }
  /** Releases registered content and its original flow neighbors. @returns Nothing. */
  public override DestroyImpl(): void {
    super.DestroyImpl();
    this.flow.DestroyImpl();
  }
}
