/** @fileoverview Actual GroupNode scalar/template/deep-clone responsibility; ordinary references reuse the real NodeMap. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { Node } from "./node";
import { NodeMap } from "./nodemap";

/** Original extensible group node. Copy overload is an erased adapter for the native private copy constructor used by clone. */
export class GroupNode extends Node {
  private extensible_: boolean;
  private readonly members_ = new NodeMap();
  private readonly templateName_: OUString;
  private mandatory_: number;
  /** Original public constructor. @param layer - Signed32 layer. @param extensible - Schema flag. @param templateName - Actual value argument. @returns Group. */
  constructor(layer: number, extensible: boolean, templateName: OUStringConstReference);
  /** Original clone's private-copy syntax erased to a class-local value operation. @param source - Actual group source. @param keepTemplateName - Original mode. @returns Group. */
  constructor(source: GroupNode, keepTemplateName: boolean);
  /** Implements actual constructor bodies without a fake group/provider. @param layerOrSource - Original overload. @param extensibleOrKeep - Original overload flag. @param templateName - Original value. @returns Group. */
  constructor(
    layerOrSource: number | GroupNode,
    extensibleOrKeep: boolean,
    templateName?: OUStringConstReference,
  ) {
    super(layerOrSource);
    if (typeof layerOrSource === "number") {
      this.extensible_ = extensibleOrKeep;
      this.templateName_ = new OUString(templateName as OUStringConstReference);
      this.mandatory_ = SAL_MAX_INT32;
    } else {
      this.extensible_ = layerOrSource.extensible_;
      this.mandatory_ = layerOrSource.mandatory_;
      layerOrSource.members_.cloneInto(this.members_);
      this.templateName_ = extensibleOrKeep
        ? new OUString(layerOrSource.templateName_)
        : new OUString();
    }
  }
  /** Original group clone. @param keepTemplateName - Original mode. @returns Independent group/tree. */
  public override clone(keepTemplateName: boolean): GroupNode {
    return new GroupNode(this, keepTemplateName);
  }
  /** Original live member map. @returns Same owner. */
  public override getMembers(): NodeMap {
    return this.members_;
  }
  /** Original by-value template query. @returns Copied string. */
  public override getTemplateName(): OUString {
    return new OUString(this.templateName_);
  }
  /** Original mandatory-layer update. @param layer - Signed32 value. @returns Nothing. */
  public override setMandatory(layer: number): void {
    this.mandatory_ = layer | 0;
  }
  /** Original mandatory-layer query. @returns Value. */
  public override getMandatory(): number {
    return this.mandatory_;
  }
  /** Original schema extensibility query. @returns Flag. */
  public isExtensible(): boolean {
    return this.extensible_;
  }
  /** Original node kind. @returns Group kind. */
  public override kind(): number {
    return Node.KIND_GROUP;
  }
}
