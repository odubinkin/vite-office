/** @fileoverview Actual RootNode ownership and release fallback behavior, without native refcount/staticization machinery. */
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { Node } from "./node";
import { NodeMap } from "./nodemap";

/** Original root starts at NO_LAYER and owns one stable map. */
export class RootNode extends Node {
  private readonly members_ = new NodeMap();
  /** Original default constructor. @returns Root. */
  constructor() {
    super(SAL_MAX_INT32);
  }
  /** Original root kind. @returns Root kind. */
  public override kind(): number {
    return Node.KIND_ROOT;
  }
  /** Original unsupported clone's explicit release return; native debug assertion is outside represented behavior. @param keepTemplateName - Unused original mode. @returns Null. */
  public override clone(keepTemplateName: boolean): null {
    void keepTemplateName;
    return null;
  }
  /** Original stable member owner. @returns Map. */
  public override getMembers(): NodeMap {
    return this.members_;
  }
}
