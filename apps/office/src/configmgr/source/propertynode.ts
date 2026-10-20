/** @fileoverview Original ordinary configuration property state and value contracts over actual Node, Any and OUString owners. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Node } from "./node";
import type { Type } from "./type";
/** Type-only projection of the native forward-declared Components receiver. No Components implementation/provider is introduced; returned Optional<Any> owns its Value temporary. */
export interface PropertyNodeComponents {
  /** Original external lookup. @param descriptor - Borrowed native UTF16 descriptor. @returns Original Optional<Any> value fields. */
  getExternalValue(descriptor: Uint16Array): { readonly IsPresent: boolean; readonly Value: Any };
}
/** Actual ordinary property node; private native clone-copy accessibility is erased. */
export class PropertyNode extends Node {
  private readonly staticType_: Type;
  private readonly nillable_: boolean;
  private readonly extension_: boolean;
  private modified_: boolean;
  private readonly externalDescriptor_ = new OUString();
  private readonly value_: Any;
  /** Original constructor and defaulted clone-copy. @param args - Source clone or native fields in declaration order. @returns Property node. */
  constructor(
    ...args:
      | [source: PropertyNode]
      | [layer: number, staticType: Type, nillable: boolean, value: Any, extension: boolean]
  ) {
    super(args[0]);
    if (args.length === 1) {
      const source = args[0];
      this.staticType_ = source.staticType_;
      this.nillable_ = source.nillable_;
      this.extension_ = source.extension_;
      this.modified_ = source.modified_;
      this.externalDescriptor_.assign(source.externalDescriptor_);
      this.value_ = new Any(source.value_);
    } else {
      this.staticType_ = args[1];
      this.nillable_ = args[2];
      this.extension_ = args[4];
      this.modified_ = false;
      this.value_ = new Any(args[3]);
    }
  }
  /** Original copy ignores template-name mode. @param keepTemplateName - Ignored native mode. @returns Independent property value owner. */
  public override clone(keepTemplateName: boolean): PropertyNode {
    void keepTemplateName;
    return new PropertyNode(this);
  }
  /** Original static schema type. @returns Declared type. */
  public getStaticType(): Type {
    return this.staticType_;
  }
  /** Original nil permission. @returns Schema flag. */
  public isNillable(): boolean {
    return this.nillable_;
  }
  /** Original extension-origin marker. @returns Marker. */
  public isExtension(): boolean {
    return this.extension_;
  }
  /** Original modified flag tracks the last explicit value write, not external lookup. @returns Marker. */
  public isModified(): boolean {
    return this.modified_;
  }
  /** Original lazy external resolution clears only after a successful lookup/assignment; absent results retain the old value without type validation. @param components - Actual external receiver contract. @returns Stable borrowed Any field. */
  public getValue(components: PropertyNodeComponents): Any {
    if (!this.externalDescriptor_.isEmpty()) {
      const external = components.getExternalValue(
        this.externalDescriptor_.getStr().subarray(0, this.externalDescriptor_.getLength()),
      );
      try {
        if (external.IsPresent) this.value_.assign(external.Value);
        this.externalDescriptor_.clear();
      } finally {
        external.Value.dispose();
      }
    }
    // Original missing-value/non-nillable condition is diagnostic-only, not a thrown policy error.
    return this.value_;
  }
  /** Original explicit assignment updates layer, modified marker and pending descriptor. @param layer - Native layer. @param value - Borrowed Any. @param isUserModification - Original modified flag. @returns Nothing. */
  public setValue(layer: number, value: Any, isUserModification: boolean): void {
    this.setLayer(layer);
    this.value_.assign(value);
    this.modified_ = isUserModification;
    this.externalDescriptor_.clear();
  }
  /** Original mutable Any address clears external lookup before the caller writes. @param layer - Native layer. @param isUserModification - Original flag. @returns Stable Any owner. */
  public getValuePtr(layer: number, isUserModification: boolean): Any {
    this.setLayer(layer);
    this.modified_ = isUserModification;
    this.externalDescriptor_.clear();
    return this.value_;
  }
  /** Original pending descriptor assignment does not alter value or modified state. @param layer - Native layer. @param descriptor - Nonempty original descriptor. @returns Nothing. */
  public setExternal(layer: number, descriptor: OUStringConstReference): void {
    if (descriptor.isEmpty()) throw new Error("assert(!descriptor.isEmpty())");
    this.setLayer(layer);
    this.externalDescriptor_.assign(descriptor);
  }
  /** Original property kind. @returns Kind. */
  public override kind(): number {
    return Node.KIND_PROPERTY;
  }
}
