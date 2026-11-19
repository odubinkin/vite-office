/** @fileoverview Original ContextHandler native WeakImplHelper, shared fragment data, path/relation getters and XML callbacks. Binary SequenceInputStream record interface remains unported. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import type { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SharedReference } from "./shared-reference";
import type { FragmentBaseDataRef } from "./fragmenthandler.data";
import type { RelationConstReference, RelationsConstReference } from "./relations.native";
import type { XmlFilterBase } from "./xmlfilterbase";
/** Actual original native context, with fresh weak identity when copying a parent. */
export class ContextHandler
  extends WeakImplHelper.specialize(XFastContextHandler)
  implements XFastContextHandler
{
  private readonly mxBaseData: FragmentBaseDataRef;
  /** Original public parent copy/protected fragment-data constructor overloads; static C++ access erasure does not manufacture an aggregate. @param source - Actual parent or original shared aggregate. @returns Context. */
  constructor(source: ContextHandler | FragmentBaseDataRef) {
    super(source instanceof ContextHandler ? source : undefined);
    this.mxBaseData = new SharedReference(
      source instanceof ContextHandler ? source.mxBaseData : source,
    );
  }
  /** Original implicit shared member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.mxBaseData.dispose();
    super.destroy();
  }
  /** Original borrowed actual filter. @returns Source filter. */ getFilter(): XmlFilterBase {
    return this.mxBaseData.operatorStar().mrFilter;
  }
  /** Original borrowed relation collection. @returns Source collection. */ getRelations(): RelationsConstReference {
    return this.mxBaseData.operatorStar().mxRelations.operatorStar();
  }
  /** Original borrowed const native path. @returns Source path. */ getFragmentPath(): OUStringConstReference {
    return this.mxBaseData.operatorStar().maFragmentPath;
  }
  /** Original relation path forwarding. @param relation - Actual relation. @returns Owned path. */ getFragmentPathFromRelation(
    relation: RelationConstReference,
  ): OUString {
    return this.getRelations().getFragmentPathFromRelation(relation);
  }
  /** Original ID path forwarding. @param id - Native ID. @returns Owned path. */ getFragmentPathFromRelId(
    id: OUStringConstReference,
  ): OUString {
    return this.getRelations().getFragmentPathFromRelId(id);
  }
  /** Original type path forwarding. @param type - Native view. @returns Owned path. */ getFragmentPathFromFirstType(
    type: Uint16Array,
  ): OUString {
    return this.getRelations().getFragmentPathFromFirstType(type);
  }
  /** Original Office type path forwarding. @param type - Native view. @returns Owned path. */ getFragmentPathFromFirstTypeFromOfficeDoc(
    type: Uint16Array,
  ): OUString {
    return this.getRelations().getFragmentPathFromFirstTypeFromOfficeDoc(type);
  }
  /** Original locator assignment into the shared aggregate. @param locator - Actual native locator. @returns Nothing. */ protected implSetLocator(
    locator: Reference<XLocator>,
  ): void {
    this.mxBaseData.operatorStar().mxLocator.assign(locator);
  }
  /** Original inert base start callback. @param element - Ignored token. @param attrs - Ignored native attrs. @returns Nothing. */ startFastElement(
    element: number,
    attrs: Reference<XFastAttributeList>,
  ): void {
    void element;
    void attrs;
  }
  /** Original inert unknown start. @param namespace - Ignored namespace. @param name - Ignored name. @param attrs - Ignored attrs. @returns Nothing. */ startUnknownElement(
    namespace: OUStringConstReference,
    name: OUStringConstReference,
    attrs: Reference<XFastAttributeList>,
  ): void {
    void namespace;
    void name;
    void attrs;
  }
  /** Original inert end. @param element - Ignored token. @returns Nothing. */ endFastElement(
    element: number,
  ): void {
    void element;
  }
  /** Original inert unknown end. @param namespace - Ignored namespace. @param name - Ignored name. @returns Nothing. */ endUnknownElement(
    namespace: OUStringConstReference,
    name: OUStringConstReference,
  ): void {
    void namespace;
    void name;
  }
  /** Original base declines child contexts. @param element - Ignored token. @param attrs - Ignored attrs. @returns Empty native reference. */ createFastChildContext(
    element: number,
    attrs: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler> {
    void element;
    void attrs;
    return new Reference();
  }
  /** Original base declines unknown child contexts. @param namespace - Ignored namespace. @param name - Ignored name. @param attrs - Ignored attrs. @returns Empty native reference. */ createUnknownChildContext(
    namespace: OUStringConstReference,
    name: OUStringConstReference,
    attrs: Reference<XFastAttributeList>,
  ): Reference<XFastContextHandler> {
    void namespace;
    void name;
    void attrs;
    return new Reference();
  }
  /** Original inert text callback. @param value - Ignored text. @returns Nothing. */ characters(
    value: OUStringConstReference,
  ): void {
    void value;
  }
}
