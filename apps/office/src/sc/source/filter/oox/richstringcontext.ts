/** @fileoverview Original SpreadsheetML string context shared by the shared-string table and inline cells. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import type { RichString } from "../inc/richstring";
import { isSpreadsheetTag } from "./workbookfragment";
import { FontContext } from "./stylesfragment";
import type { ExcelGraphicHelper } from "./stylesbuffer.color";

const xmlNamespace = "http://www.w3.org/XML/1998/namespace";
const spaceToken = (namespaceTokens.get("xml") as number) | getTokenFromUtf8("space");
const tokenHandler = new FastTokenHandler();

/** Imports each base text portion independently of its phonetic annotation. */
export class RichStringContext implements FragmentContext {
  private readonly elements: string[] = [];
  private portion = -1;
  private pending = "";

  /** Borrows the cell or workbook string. @param string - Actual string owner. @param graphicHelper - Workbook color resolver. @returns Context. */
  constructor(
    private readonly string: RichString,
    private readonly graphicHelper?: ExcelGraphicHelper,
  ) {}

  /** Selects text and run elements under the same two SpreadsheetML parents. @param tag - XML child. @returns Active text context or absence. */
  createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (!isSpreadsheetTag(tag)) return null;
    const parent = this.elements.at(-1);
    if (parent === "r" && tag.local === "rPr" && this.portion !== -1)
      return new FontContext(this.string.getPortion(this.portion).createFont(this.graphicHelper));
    return ((parent === "si" || parent === "is") && (tag.local === "t" || tag.local === "r")) ||
      (parent === "r" && tag.local === "t")
      ? this
      : null;
  }

  /** Creates the source run and transfers the native XML space attribute. @param tag - Source tag. @param attributes - Expanded attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    const parent = this.elements.at(-1);
    this.elements.push(tag.local);
    if (tag.local === "r") this.portion = this.string.importRun();
    if (tag.local !== "t") return;
    const list = new FastAttributeList(tokenHandler);
    const reference = new Reference(list);
    const values = new AttributeList(reference);
    try {
      for (const attr of attributes)
        if (attr.uri === xmlNamespace && attr.local === "space") list.add(spaceToken, attr.value);
      if (parent === "r") this.string.setAttributes(values);
      else this.portion = this.string.importText(values);
      this.pending = "";
    } finally {
      values.dispose();
      reference.dispose();
    }
  }

  /** Accumulates the whole text element across SAX deliveries. @param value - Delivered characters. @returns Nothing. */
  characters(value: string): void {
    if (this.elements.at(-1) === "t") this.pending += value;
  }

  /** Decodes the Excel escape syntax only within the current portion. @param tag - Completed tag. @returns Nothing. */
  endFastElement(tag: SaxesTagNS): void {
    if (tag.local === "t") {
      const value = unicode(this.pending);
      try {
        this.string.getPortion(this.portion).setText(value);
      } finally {
        value.dispose();
      }
    }
    this.elements.pop();
  }
}
