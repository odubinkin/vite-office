/** @fileoverview Explicit std::shared_ptr<xmlXPathObject> lowering for the source XPath owners. The control block shares one native result/deleter; it contains no alternate XPath value or node set. */
import { getLibXml2 } from "../../../external/libxml2/libxml2";
/** One shared native allocation with its original xmlXPathFreeObject deleter. */
interface Control {
  pointer: number;
  count: number;
}
/** Source shared_ptr copy/destruction semantics within a synchronous realm. */
export class XPathObjectReference {
  private readonly control: Control;
  /** Original native-pointer construction or shared copy. @param value - Owned native allocation or shared source. @returns Handle. */
  constructor(value: number | XPathObjectReference) {
    this.control = typeof value === "number" ? { pointer: value, count: 1 } : value.control;
    if (typeof value !== "number") ++this.control.count;
  }
  /** Original borrowed pointer. @returns Native result. */ get(): number {
    return this.control.pointer;
  }
  /** Original shared-count release and last-owner native delete. @returns Nothing. */ dispose(): void {
    if (--this.control.count === 0) getLibXml2()._xmlXPathFreeObject(this.control.pointer);
  }
}
