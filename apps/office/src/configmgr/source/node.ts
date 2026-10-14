/** @fileoverview Actual configmgr Node logical metadata/lookup contract; JS GC replaces native SimpleReferenceObject/staticization lifetime machinery. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import type { NodeMap } from "./nodemap";

/** Original polymorphic logical configuration node, using ordinary JS references. */
export abstract class Node {
  public static readonly KIND_PROPERTY = 0;
  public static readonly KIND_LOCALIZED_PROPERTY = 1;
  public static readonly KIND_LOCALIZED_VALUE = 2;
  public static readonly KIND_GROUP = 3;
  public static readonly KIND_SET = 4;
  public static readonly KIND_ROOT = 5;
  private layer_: number;
  private finalized_: number;
  private readonly description_ = new OUString();
  /** Original layer or base-copy construction; description is deliberately not copied. NO_LAYER is original INT_MAX, reused from SAL. @param layerOrSource - Signed32 layer or actual copy source. @returns Base state. */
  protected constructor(layerOrSource: number | Node) {
    if (typeof layerOrSource === "number") {
      this.layer_ = layerOrSource | 0;
      this.finalized_ = SAL_MAX_INT32;
    } else {
      this.layer_ = layerOrSource.layer_;
      this.finalized_ = layerOrSource.finalized_;
    }
  }
  /** Original abstract kind. @returns Native kind. */
  public abstract kind(): number;
  /** Original abstract clone; root's release fallback can return null. @param keepTemplateName - Original clone mode. @returns Owned logical node. */
  public abstract clone(keepTemplateName: boolean): Node | null;
  /** Original release fallback for nodes without children, using the existing real UNO exception owner. Native debug assertion is not emulated. @returns Never. */
  public getMembers(): NodeMap {
    throw new RuntimeException(
      new OUString(
        Uint8Array.from(
          "this cannot happen\0",
          /** Materializes the fixed original ASCII message. @param character - Literal character. @returns Byte. */ (
            character,
          ) => character.charCodeAt(0),
        ),
      ),
      new Reference(),
    );
  }
  /** Original empty value template name. @returns Independent empty string value. */
  public getTemplateName(): OUString {
    return new OUString();
  }
  /** Original default has no mandatory metadata; only NO_LAYER is valid under native debug assertions. @param layer - Original ignored value. @returns Nothing. */
  public setMandatory(layer: number): void {
    void layer;
  }
  /** Original default mandatory layer. @returns NO_LAYER. */
  public getMandatory(): number {
    return SAL_MAX_INT32;
  }
  /** Original layer assignment; monotonicity is the native debug producer precondition. @param layer - Signed32 layer. @returns Nothing. */
  public setLayer(layer: number): void {
    this.layer_ = layer | 0;
  }
  /** Original layer query. @returns Stored layer. */
  public getLayer(): number {
    return this.layer_;
  }
  /** Original finalized-layer assignment. @param layer - Signed32 layer. @returns Nothing. */
  public setFinalized(layer: number): void {
    this.finalized_ = layer | 0;
  }
  /** Original finalized-layer query. @returns Stored layer. */
  public getFinalized(): number {
    return this.finalized_;
  }
  /** Original owned description update preserves the member owner. @param description - Actual const string. @returns Nothing. */
  public setDescription(description: OUStringConstReference): void {
    this.description_.assign(description);
  }
  /** Original stable borrowed description. @returns Same const member owner. */
  public getDescription(): OUStringConstReference {
    return this.description_;
  }
  /** Original member lookup returns the actual node reference, including a stored null. @param name - Actual key. @returns Node or null. */
  public getMember(name: OUStringConstReference): Node | null {
    const entry = this.getMembers().find(name);
    return entry === undefined ? null : entry.second;
  }
}
