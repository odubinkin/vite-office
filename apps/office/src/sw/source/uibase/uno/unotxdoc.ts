/** @fileoverview Consumed SwXTextDocument text/style/service suppliers from pinned sw/source/uibase/uno/unotxdoc.cxx. No browser/shell lifecycle state enters SwDoc. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { WID_DOC_DEFAULT_PAGE_MODE } from "../../../inc/unomap";
import { SwUnoTextDocumentPropertyMap, createPropertySetInfo } from "../../core/unocore/unomap";
import { unknown } from "../../core/unocore/unocrsrhelper";
import { SwXAutoStyles } from "../../core/unocore/unostyle-auto";

import { SwXBookmark } from "../../core/unocore/unobkm";
import type { SwDoc } from "../../core/doc/doc";
import { SwXText } from "../../core/unocore/unotext";
import { SwXStyleFamilies, SwXStyle, SwXPageStyle } from "../../core/unocore/unostyle";
import { SwXNumberingRules, SwXLineNumberingProperties } from "../../core/unocore/unosett";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../core/unocore/unocrsrhelper";
import { invalid } from "../../core/unocore/unocrsrhelper";
/** Import-facing model supplier; canonical document lifetime remains with its actual shell. */
export class SwXTextDocument {
  private readonly body: SwXText;
  private valid = true;
  /** Binds the represented native owner and its declared inputs. @param doc - Canonical document owner. @returns Nothing. */
  constructor(private readonly doc: SwDoc) {
    this.body = new SwXText(doc);
  }
  /** Borrows the owning canonical document. @returns The represented native operation result. */
  GetDoc(): SwDoc {
    if (!this.valid) invalid("Text document is disposed");
    return this.doc;
  }
  /** Publishes admitted native document properties, separately from paragraph/cursor maps. @returns Property metadata. */
  getPropertySetInfo(): ReturnType<typeof createPropertySetInfo> {
    this.GetDoc();
    return createPropertySetInfo(
      [...SwUnoTextDocumentPropertyMap].map(
        /** Publishes original document property metadata. @param entry - Property and entry. @returns Metadata pair. */ ([
          name,
          entry,
        ]) => [name, entry.type] as const,
      ),
      false,
    );
  }
  /** Original document page-mode getter. @param name - Native property name. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    const doc = this.GetDoc(),
      property = text(name);
    if (SwUnoTextDocumentPropertyMap.get(property)?.which !== WID_DOC_DEFAULT_PAGE_MODE)
      unknown(property);
    return new Any(doc.IsSquaredPageMode());
  }
  /** Original page-mode setter intentionally ignores failed bool extraction and uses false. @param name - Native property name. @param value - Borrowed Any. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const doc = this.GetDoc(),
      property = text(name);
    if (SwUnoTextDocumentPropertyMap.get(property)?.which !== WID_DOC_DEFAULT_PAGE_MODE)
      unknown(property);
    const mode: [boolean] = [false];
    value.extract(mode, "bool");
    doc.SetDefaultPageMode(mode[0]);
  }
  /** Borrows the native parent text owner. @returns The represented native operation result. */
  getText(): SwXText {
    this.GetDoc();
    return this.body;
  }
  /** Supplies the document-owned line numbering property interface. @returns Actual native property owner. */
  getLineNumberingProperties(): SwXLineNumberingProperties {
    return new SwXLineNumberingProperties(this.GetDoc());
  }
  /** Implements the represented native getStyleFamilies operation. @returns The represented native operation result. */
  getAutoStyles(): SwXAutoStyles {
    return new SwXAutoStyles(this.GetDoc());
  }
  /** Supplies the named style families. @returns Native family supplier. */
  getStyleFamilies(): SwXStyleFamilies {
    return new SwXStyleFamilies(this.GetDoc());
  }
  /** Original typed page-style factory validates the actual model lifetime. @returns Unattached page-style descriptor. */
  createPageStyle(): SwXPageStyle {
    return SwXStyleFamilies.CreateStylePage(this.GetDoc());
  }
  /** Implements the represented native createInstance operation. @param name - Native property or element name. @returns The represented native operation result. */
  createInstance(name: OUStringConstReference): SwXStyle | SwXNumberingRules | SwXBookmark {
    const n = text(name),
      doc = this.GetDoc();
    switch (n) {
      case "com.sun.star.text.Bookmark":
        return new SwXBookmark();
      case "com.sun.star.style.ParagraphStyle":
        return new SwXStyle(doc, "ParagraphStyles");
      case "com.sun.star.style.NumberingStyle":
        return new SwXStyle(doc, "NumberingStyles");
      case "com.sun.star.style.PageStyle":
        return this.createPageStyle();
      case "com.sun.star.text.NumberingRules":
        return new SwXNumberingRules(doc);
      default:
        invalid(`Unported Writer service: ${n}`);
    }
  }
  /** Ends this API object lifetime and releases its owned resources. @returns Nothing. */
  dispose(): void {
    if (this.valid) {
      this.body.dispose();
      this.valid = false;
    }
  }
}
