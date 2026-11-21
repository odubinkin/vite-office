/** @fileoverview Consumed SwXBookmark descriptor, range attachment and lifetime from unobkm.cxx. */
import type { SwDoc } from "../doc/doc";
import type { SwBookmark } from "../doc/docbm";
import { SwPaM } from "../crsr/pam";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { illegal, invalid, scalar, stringAny, stringValue } from "./unocrsrhelper";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "./unocrsrhelper";
/** A detached descriptor owns a requested name; attachment transfers authority to DocumentMarkAccess. */
export class SwXBookmark {
  private name = "";
  private doc: SwDoc | undefined;
  private mark: SwBookmark | undefined;
  private parent: SwXTextOwner | undefined;
  private hidden = false;
  private condition = "";
  /** Implements the represented native getName operation. @returns The represented native operation result. */
  getName(): OUStringConstReference {
    return unicode(this.mark?.GetName() ?? this.name);
  }
  /** Implements the represented native setName operation. @param name - Native property or element name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    const n = text(name);
    if (this.mark) {
      if (this.mark.GetName() === n) return;
      const marks = (this.doc as SwDoc).GetIDocumentMarkAccess();
      if (marks.FindMark(n)) invalid("Cannot rename bookmark");
      if (!marks.RenameMark(this.mark.GetName(), n)) invalid("Cannot rename bookmark");
    } else this.name = n;
  }
  /** Queries supported bookmark properties on the descriptor or attached mark. @param name - UNO property name. @returns Owned value. */
  getPropertyValue(name: OUStringConstReference): Any {
    switch (text(name)) {
      case "BookmarkHidden":
        return new Any([this.mark?.IsHidden() ?? this.hidden], "bool");
      case "BookmarkCondition":
        return stringAny(this.mark?.GetHideCondition() ?? this.condition);
      case "LinkDisplayName":
        return stringAny(this.mark?.GetName() ?? this.name);
      default:
        return new Any();
    }
  }

  /** Assigns the original writable bookmark properties. @param name - UNO property name. @param value - Typed value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    switch (text(name)) {
      case "BookmarkHidden": {
        const hidden = scalar(value, "bool") as boolean;
        if (this.mark) this.mark.Hide(hidden);
        else this.hidden = hidden;
        break;
      }
      case "BookmarkCondition": {
        const condition = stringValue(value);
        if (this.mark) this.mark.SetHideCondition(condition);
        else this.condition = condition;
        break;
      }
      default:
        illegal(`Property is read-only: ${text(name)}`);
    }
  }
  /** Implements the represented native attach operation. @param range - Registered canonical range. @returns The represented native operation result. */
  attach(range: SwXTextRange): void {
    if (this.mark) invalid("Bookmark is already attached");
    const p = range.GetPaM();
    const doc = range.GetDoc(),
      base = this.name || "Bookmark";
    this.mark = doc.GetIDocumentMarkAccess().MakeBookmark(p, base);
    this.mark.Hide(this.hidden);
    this.mark.SetHideCondition(this.condition);
    this.doc = doc;
    this.parent = range.getText();
  }
  /** Implements the represented native getAnchor operation. @returns The represented native operation result. */
  getAnchor(): SwXTextRange {
    if (
      !this.mark ||
      (this.doc as SwDoc).GetIDocumentMarkAccess().FindMark(this.mark.GetName()) !== this.mark
    )
      invalid("Bookmark is disposed");
    const p = new SwPaM(
      this.mark.GetMarkStart(),
      this.mark.IsExpanded() ? this.mark.GetMarkEnd() : undefined,
    );
    try {
      return new SwXTextRange(p, this.parent as SwXTextOwner);
    } finally {
      p.Dispose();
    }
  }
  /** Ends this API object lifetime and releases its owned resources. @returns Nothing. */
  dispose(): void {
    if (this.mark && this.doc) this.doc.GetIDocumentMarkAccess().DeleteMark(this.mark.GetName());
    this.mark = undefined;
    this.doc = undefined;
    this.parent = undefined;
  }
}
