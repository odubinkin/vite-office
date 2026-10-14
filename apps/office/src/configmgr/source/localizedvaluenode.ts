/** @fileoverview Actual localized configuration value and modified-state contract over the existing shared Any owner. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Node } from "./node";

/** Actual localized value node; native const/private-copy syntax is erased, no value/provider substitute. */
export class LocalizedValueNode extends Node {
  private readonly value_: Any;
  private modified_: boolean;
  /** Original layer/value construction or clone's private copy. @param layerOrSource - Actual overload. @param value - Original optional by-value argument. @returns Initialized node. */
  constructor(layerOrSource: number | LocalizedValueNode, value?: Any) {
    super(layerOrSource);
    if (typeof layerOrSource === "number") {
      this.value_ = value === undefined ? new Any() : new Any(value);
      this.modified_ = false;
    } else {
      this.value_ = new Any(layerOrSource.value_);
      this.modified_ = layerOrSource.modified_;
    }
  }
  /** Original defaulted copy preserves value/modified metadata and base-copy rules. @param keepTemplateName - Original ignored mode. @returns Actual independent copy. */
  public override clone(keepTemplateName: boolean): LocalizedValueNode {
    void keepTemplateName;
    return new LocalizedValueNode(this);
  }
  /** Original wildcard value name. @returns Actual string value. */
  public override getTemplateName(): OUString {
    return new OUString(new Uint8Array([42, 0]));
  }
  /** Original borrowed const Any reference; const qualification is the caller contract. @returns Stable actual owner. */
  public getValue(): Any {
    return this.value_;
  }
  /** Original mutable value pointer also updates layer and modified metadata. @param layer - Signed32 layer. @param isUserModification - Original flag. @returns Stable actual Any owner. */
  public getValuePtr(layer: number, isUserModification: boolean): Any {
    this.setLayer(layer);
    this.modified_ = isUserModification;
    return this.value_;
  }
  /** Original value assignment skips the same member address after updating metadata. @param layer - Signed32 layer. @param value - Actual source Any. @param isUserModification - Original flag. @returns Nothing. */
  public setValue(layer: number, value: Any, isUserModification: boolean): void {
    this.setLayer(layer);
    this.modified_ = isUserModification;
    if (value !== this.value_) this.value_.assign(value);
  }
  /** Original user modification flag. @returns Current value. */
  public isModified(): boolean {
    return this.modified_;
  }
  /** Original node kind. @returns Localized value kind. */
  public override kind(): number {
    return Node.KIND_LOCALIZED_VALUE;
  }
}
