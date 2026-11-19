/** @fileoverview Original FragmentBaseData aggregate and shared ownership over actual native path, UNO locator and RelationsRef; physical std::shared_ptr ABI is separate. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import type { XmlFilterBase } from "./xmlfilterbase";
import type { RelationsRef } from "./relations.native";
import { SharedReference } from "./shared-reference";
/** Original shared native aggregate. */
export class FragmentBaseData {
  private readonly fragmentPath: OUString;
  readonly mxLocator = new Reference<XLocator>();
  readonly mxRelations: RelationsRef;
  /** Original by-value/move fields retain exactly one caller copy; raw filter is borrowed. @param mrFilter - Actual filter. @param path - Borrowed path argument. @param relations - Actual shared native relation owner. @returns Aggregate. */
  constructor(
    readonly mrFilter: XmlFilterBase,
    path: OUStringConstReference,
    relations: RelationsRef,
  ) {
    this.fragmentPath = new OUString(path);
    this.mxRelations = new SharedReference(relations);
  }
  /** Original const native field projection, without exposing mutation/destruction. @returns Borrowed path. */
  get maFragmentPath(): OUStringConstReference {
    return this.fragmentPath;
  }
  /** Original implicit reverse members. @returns Nothing. */
  dispose(): void {
    this.mxRelations.dispose();
    this.mxLocator.dispose();
    this.fragmentPath.dispose();
  }
}
/** Original shared fragment-data pointer alias. */
export type FragmentBaseDataRef = SharedReference<FragmentBaseData>;
