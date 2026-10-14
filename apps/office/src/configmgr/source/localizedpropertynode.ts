/** @fileoverview Original localized schema property metadata and member cloning over actual Node/NodeMap. */
import { Node } from "./node";
import { NodeMap } from "./nodemap";
import type { Type } from "./type";

/** Actual shared localized property node; public copy overload erases native private-copy accessibility. */
export class LocalizedPropertyNode extends Node {
  private readonly staticType_: Type;
  private readonly nillable_: boolean;
  private readonly members_ = new NodeMap();
  /** Original public construction. @param layer - Signed32 layer. @param staticType - Schema type. @param nillable - Schema flag. @returns Node. */
  constructor(layer: number, staticType: Type, nillable: boolean);
  /** Original clone copy constructor, with erased private syntax. @param source - Actual source. @returns Copy. */
  constructor(source: LocalizedPropertyNode);
  /** Original constructor bodies. @param layerOrSource - Selected original overload. @param staticType - Original schema type. @param nillable - Original flag. @returns Node. */
  constructor(
    layerOrSource: number | LocalizedPropertyNode,
    staticType?: Type,
    nillable?: boolean,
  ) {
    super(layerOrSource);
    if (typeof layerOrSource === "number") {
      this.staticType_ = staticType as Type;
      this.nillable_ = nillable as boolean;
    } else {
      this.staticType_ = layerOrSource.staticType_;
      this.nillable_ = layerOrSource.nillable_;
      layerOrSource.members_.cloneInto(this.members_);
    }
  }
  /** Original ignores keep-template flag and deep-copies members. @param keepTemplateName - Unused original flag. @returns Actual copy. */
  public override clone(keepTemplateName: boolean): LocalizedPropertyNode {
    void keepTemplateName;
    return new LocalizedPropertyNode(this);
  }
  /** Original stable map. @returns Actual member owner. */
  public override getMembers(): NodeMap {
    return this.members_;
  }
  /** Original schema type. @returns Stored type. */
  public getStaticType(): Type {
    return this.staticType_;
  }
  /** Original nil flag. @returns Stored flag. */
  public isNillable(): boolean {
    return this.nillable_;
  }
  /** Original logical kind. @returns Localized property kind. */
  public override kind(): number {
    return Node.KIND_LOCALIZED_PROPERTY;
  }
}
