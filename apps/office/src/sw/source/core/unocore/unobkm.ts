/** @fileoverview Consumed SwXBookmark descriptor/attachment/lifetime from pinned unobkm.cxx for the current collapsed-bookmark core. */
import type { SwDoc } from "../doc/doc";
import type { SwBookmark } from "../doc/docbm";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM } from "../crsr/pam";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { invalid, illegal } from "./unocrsrhelper";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "./unocrsrhelper";
/** A detached descriptor owns a requested name; attachment transfers authority to DocumentMarkAccess. */
export class SwXBookmark {
  private name = "";
  private doc: SwDoc | undefined;
  private mark: SwBookmark | undefined;
  private parent: SwXTextOwner | undefined;
  /** Implements the represented native getName operation. @returns The represented native operation result. */
  getName(): OUStringConstReference {
    return unicode(this.mark?.GetName() ?? this.name);
  }
  /** Implements the represented native setName operation. @param name - Native property or element name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    const n = text(name);
    if (this.mark) {
      if (
        !(this.doc ?? invalid("Bookmark is detached"))
          .GetIDocumentMarkAccess()
          .RenameMark(this.mark.GetName(), n)
      )
        invalid("Cannot rename bookmark");
    } else this.name = n;
  }
  /** Implements the represented native attach operation. @param range - Registered canonical range. @returns The represented native operation result. */
  attach(range: SwXTextRange): void {
    if (this.mark) invalid("Bookmark is already attached");
    const p = range.GetPaM();
    if (p.Start().compare(p.End()) !== 0)
      illegal("Ranged bookmarks require the unported ranged-mark core");
    const doc = range.GetDoc(),
      base = this.name || "Bookmark";
    let name = base,
      index = 1;
    while (doc.GetIDocumentMarkAccess().FindMark(name)) name = base + index++;
    this.mark = doc
      .GetIDocumentMarkAccess()
      .MakeMark(p.GetPoint().GetNode() as SwTextNode, p.GetPoint().GetContentIndex(), name);
    this.doc = doc;
    this.parent = range.getText();
  }
  /** Implements the represented native getAnchor operation. @returns The represented native operation result. */
  getAnchor(): SwXTextRange {
    if (
      !this.mark ||
      !this.doc ||
      this.doc.GetIDocumentMarkAccess().FindMark(this.mark.GetName()) !== this.mark
    )
      invalid("Bookmark is disposed");
    const p = new SwPaM(this.mark.GetMarkPos());
    try {
      return new SwXTextRange(p, this.parent ?? invalid("Bookmark is detached"));
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
