/** @fileoverview Original configuration SetNode template metadata, validation and deep-copy contract over actual Data/Node/NodeMap. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../sal/inc/types";
import { Data } from "./data";
import { Node } from "./node";
import { NodeMap } from "./nodemap";

/** Actual shared set node; private C++ copy constructor syntax is erased by the copy overload. */
export class SetNode extends Node {
  private readonly defaultTemplateName_: OUString;
  private readonly additionalTemplateNames_: OUString[];
  private readonly members_ = new NodeMap();
  private readonly templateName_: OUString;
  private mandatory_: number;
  /** Original initialized public constructor. @param layer - Signed32 metadata. @param defaultTemplateName - By-value full name. @param templateName - By-value own name. @returns Set. */
  constructor(
    layer: number,
    defaultTemplateName: OUStringConstReference,
    templateName: OUStringConstReference,
  );
  /** Original clone copy constructor. @param source - Actual set. @param keepTemplateName - Original mode. @returns Copy. */
  constructor(source: SetNode, keepTemplateName: boolean);
  /** Original selected constructor bodies. @param layerOrSource - Actual overload. @param defaultOrKeep - Original overload argument. @param templateName - Original own name. @returns Set. */
  constructor(
    layerOrSource: number | SetNode,
    defaultOrKeep: OUStringConstReference | boolean,
    templateName?: OUStringConstReference,
  ) {
    super(layerOrSource);
    if (typeof layerOrSource === "number") {
      this.defaultTemplateName_ = new OUString(defaultOrKeep as OUStringConstReference);
      this.additionalTemplateNames_ = [];
      this.templateName_ = new OUString(templateName as OUStringConstReference);
      this.mandatory_ = SAL_MAX_INT32;
    } else {
      this.defaultTemplateName_ = new OUString(layerOrSource.defaultTemplateName_);
      this.additionalTemplateNames_ = layerOrSource.additionalTemplateNames_.map(
        /** Performs the original vector element value copy. @param value - Actual string. @returns Independent string owner. */ (
          value,
        ) => new OUString(value),
      );
      this.mandatory_ = layerOrSource.mandatory_;
      layerOrSource.members_.cloneInto(this.members_);
      this.templateName_ = defaultOrKeep
        ? new OUString(layerOrSource.templateName_)
        : new OUString();
    }
  }
  /** Original deep copy with optional own-template retention. @param keepTemplateName - Original mode. @returns Actual copy. */
  public override clone(keepTemplateName: boolean): SetNode {
    return new SetNode(this, keepTemplateName);
  }
  /** Original stable member map. @returns Actual map. */
  public override getMembers(): NodeMap {
    return this.members_;
  }
  /** Original by-value own template query. @returns String value copy. */
  public override getTemplateName(): OUString {
    return new OUString(this.templateName_);
  }
  /** Original mandatory-layer assignment. @param layer - Signed32 scalar. @returns Nothing. */
  public override setMandatory(layer: number): void {
    this.mandatory_ = layer | 0;
  }
  /** Original mandatory-layer query. @returns Layer. */
  public override getMandatory(): number {
    return this.mandatory_;
  }
  /** Original borrowed const full default name. @returns Stable string owner. */
  public getDefaultTemplateName(): OUStringConstReference {
    return this.defaultTemplateName_;
  }
  /** Original mutable vector reference erases to an array; callers explicitly copy OUString on value insertion. @returns Actual stable array. */
  public getAdditionalTemplateNames(): OUString[] {
    return this.additionalTemplateNames_;
  }
  /** Original default-or-additional short/full template matching. @param templateName - Actual short or full name. @returns Original acceptance. */
  public isValidTemplate(templateName: OUStringConstReference): boolean {
    return (
      Data.equalTemplateNames(templateName, this.defaultTemplateName_) ||
      this.additionalTemplateNames_.some(
        /** Uses the original actual Data name rule. @param longName - Full declared name. @returns Match. */ (
          longName,
        ) => Data.equalTemplateNames(templateName, longName),
      )
    );
  }
  /** Original logical kind. @returns Set kind. */
  public override kind(): number {
    return Node.KIND_SET;
  }
}
