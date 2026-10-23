/** @fileoverview SwXTextRange's consumed text-range contract from pinned unoobj2.cxx, over registered canonical positions. */
import type { UnoMark } from "../crsr/bookmark";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwDoc } from "../doc/doc";
import type { SwTextNode } from "../txtnode/ndtxt";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "./unocrsrhelper";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { createPropertySetInfo } from "./unomap";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import {
  GetPropertyValue,
  SetPropertyValue,
  SetPropertyValues,
  illegal,
  invalid,
  spans,
} from "./unocrsrhelper";
/** Native parent text responsibility; this is a borrowed interface, not another document model. */
export interface SwXTextOwner {
  GetDoc(): SwDoc;
  GetTextNodes(): readonly SwTextNode[];
  insertString(range: SwXTextRange, value: OUStringConstReference, absorb: boolean): void;
}
/** A live UNO range whose endpoints follow native content-index corrections. */
export class SwXTextRange {
  protected readonly pam: SwPaM;
  private disposed = false;
  private readonly mark: UnoMark | undefined;
  private readonly document: SwDoc;
  /** Binds the represented native owner and its declared inputs. @param range - Registered canonical range. @param parent - Borrowed parent text owner. @param ownMark - Original ownMark input. @returns Nothing. */
  constructor(
    range: SwPaM,
    protected readonly parent: SwXTextOwner,
    ownMark = true,
  ) {
    this.document = parent.GetDoc();
    this.pam = new SwPaM(range.GetPoint(), range.HasMark() ? range.GetMark() : undefined);
    this.pam.Start().nContent.SetAffinity("after");
    this.pam.End().nContent.SetAffinity("before");
    this.mark = ownMark
      ? parent.GetDoc().GetIDocumentMarkAccess().MakeUnoMark(this.pam)
      : undefined;
  }
  /** Checks both document and containing text ownership before exposing positions. @returns The represented native operation result. */
  GetPaM(): SwPaM {
    if (this.disposed) invalid("Text range is disposed");
    if (this.mark && !this.mark.GetPositions(this.pam)) invalid("UNO range mark is disposed");
    const nodes = this.parent.GetDoc().GetNodes().entries();
    if (!nodes.includes(this.pam.Start().GetNode()) || !nodes.includes(this.pam.End().GetNode()))
      invalid("Text range is outside its parent text");
    return this.pam;
  }
  /** Replaces the mark's native positions after an absorbing range operation. @param range - Registered canonical range. @returns The represented native operation result. */
  SetPositions(range: SwPaM): void {
    if (this.mark) {
      if (!this.mark.SetPositions(range)) invalid("UNO range mark is disposed");
    } else this.pam.Assign(range.GetPoint(), range.HasMark() ? range.GetMark() : undefined);
  }
  /** Borrows the owning canonical document. @returns The represented native operation result. */
  GetDoc(): SwDoc {
    return this.parent.GetDoc();
  }
  /** Copies registered native positions into the caller range. @param out - Original out input. @returns The represented native operation result. */
  GetPositions(out: SwPaM): boolean {
    const p = this.GetPaM();
    out.Assign(p.GetPoint(), p.HasMark() ? p.GetMark() : undefined);
    return true;
  }
  /** Borrows the native parent text owner. @returns The represented native operation result. */
  getText(): SwXTextOwner {
    this.GetPaM();
    return this.parent;
  }
  /** Creates a native range at the ordered start. @returns The represented native operation result. */
  getStart(): SwXTextRange {
    return this.endpoint(this.GetPaM().Start());
  }
  /** Creates a native range at the ordered end. @returns The represented native operation result. */
  getEnd(): SwXTextRange {
    return this.endpoint(this.GetPaM().End());
  }
  /** Implements the represented native endpoint operation. @param position - Original position input. @returns The represented native operation result. */
  protected endpoint(position: SwPosition): SwXTextRange {
    const p = new SwPaM(position);
    try {
      return new SwXTextRange(p, this.parent);
    } finally {
      p.Dispose();
    }
  }
  /** Reads text from the canonical node range. @returns The represented native operation result. */
  getString(): OUString {
    return unicode(
      spans(this.GetPaM())
        .map(
          /** Processes one ordered native value at this boundary. @param r - Original r input. @returns The represented native operation result. */
          (r) => r.node.GetText().slice(r.start, r.end),
        )
        .join("\n"),
    );
  }
  /** Replaces the selected canonical text. @param value - Declared native value. @returns Nothing. */
  setString(value: OUStringConstReference): void {
    this.parent.insertString(this, value, true);
  }
  /** Publishes the supported native property descriptors. @returns The represented native operation result. */
  getPropertySetInfo(): ReturnType<typeof createPropertySetInfo> {
    return createPropertySetInfo([
      ["ParaStyleName", "OUString"],
      ["PageDescName", "OUString"],
      ["NumberingStyleName", "OUString"],
      ["NumberingRules", ["Reference", indexReplaceType]],
      ["NumberingLevel", "sal_Int16"],
      ["NumberingStartValue", "sal_Int16"],
      ["NumberingIsNumber", "bool"],
      ["ParaIsNumberingRestart", "bool"],
      ["ListId", "OUString"],
    ]);
  }
  /** Queries the current native property value. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyValue(name: OUStringConstReference): Any {
    return GetPropertyValue(this.GetPaM(), text(name));
  }
  /** Applies a typed native property without duplicating model state. @param name - Native property or element name. @param value - Declared native value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    SetPropertyValue(this.GetPaM(), text(name), value);
  }
  /** Reads native properties in caller order. @param names - Original names input. @returns The represented native operation result. */
  getPropertyValues(names: readonly OUStringConstReference[]): Any[] {
    return names.map(
      /** Processes one ordered native value at this boundary. @param name - Native property or element name. @returns The represented native operation result. */
      (name) => this.getPropertyValue(name),
    );
  }
  /** Applies the ordered native property sequence. @param names - Original names input. @param values - Original values input. @returns Nothing. */
  setPropertyValues(names: readonly OUStringConstReference[], values: readonly Any[]): void {
    if (names.length !== values.length) illegal("Property name/value count differs");
    const properties = names.map(
      /** Executes this bounded native contract operation. @param name - Native operation input. @param index - Native operation input. @returns Native operation result. */ (
        name,
        index,
      ) => new PropertyValue(name, 0, values[index] as Any, 0),
    );
    try {
      SetPropertyValues(this.GetPaM(), properties);
    } finally {
      for (const property of properties) {
        property.Name.dispose();
        property.Value.dispose();
      }
    }
  }
  /** Releases only owned positions; the canonical document belongs to its shell. @returns Nothing. */
  dispose(): void {
    if (!this.disposed) {
      this.disposed = true;
      if (this.mark) this.document.GetIDocumentMarkAccess().DeleteUnoMark(this.mark);
      this.pam.Dispose();
    }
  }
}
