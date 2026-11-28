/** @fileoverview Native Writer reference-mark attachment from unorefmk.cxx. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwFormatRefMark, SwTextRefMark } from "../txtnode/atrref";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { illegal, invalid, text, unicode } from "./unocrsrhelper";

/** Consumed ReferenceMark service descriptor and its native attachment. */
export class SwXReferenceMark {
  private name = "";
  private isDescriptor = true;
  private mark: SwTextRefMark | undefined;
  private parent: SwXTextOwner | undefined;

  /** Sets the original name, using the native deletion and reinsertion for an attached mark. @param name - Native name. @returns Nothing. */
  public setName(name: OUStringConstReference): void {
    const next = text(name);
    if (this.isDescriptor) {
      this.name = next;
      return;
    }
    const hint = this.mark;
    const document = hint?.GetTextNode()?.GetDoc();
    if (!hint || !document?.GetRefMark(this.name) || document.GetRefMark(next))
      invalid("Writer reference mark cannot be renamed.");
    if (document.GetRefMark(this.name) !== hint.GetAttr()) return;
    this.DeleteRefMark(
      hint,
      /** Reinserts the renamed mark at the range left after native deletion. @param range - Updated native selection. @returns Nothing. */
      (range) => {
        this.name = next;
        this.InsertRefMark(range);
      },
    );
  }

  /** Rejects writes to the original reference mark properties. */
  public setPropertyValue(): never {
    illegal("Writer reference mark properties are read-only.");
  }

  /** Reads the name only while it identifies a live reference. @returns Native name. */
  public getName(): OUStringConstReference {
    if (!this.mark?.GetTextNode()?.GetDoc().GetRefMark(this.name))
      invalid("Writer reference mark is detached.");
    return unicode(this.name);
  }

  /** Inserts the actual native hint at the selected text. @param range - Original Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (!this.isDescriptor) invalid("Writer reference mark is already attached.");
    this.InsertRefMark(range.GetPaM());
    this.parent = range.getText();
    this.isDescriptor = false;
  }

  /** Inserts the actual native point or range at the selected text. @param selection - Registered Writer selection. @returns Nothing. */
  private InsertRefMark(selection: SwPaM): void {
    const start = selection.Start();
    const end = selection.End();
    const node = start.GetNode().GetTextNode();
    if (!node || end.GetNode() !== node) invalid("Writer reference mark must be in one paragraph.");
    const first = start.GetContentIndex();
    const last = end.GetContentIndex();
    const hint = new SwTextRefMark(
      new SwFormatRefMark(this.name),
      first,
      first === last ? undefined : last,
    );
    if (!node.InsertHint(hint, SetAttrMode.DONTEXPAND))
      invalid("Writer reference mark could not be inserted.");
    this.mark = hint;
  }

  /** Returns the original live range or a collapsed point before the dummy. @returns Native anchor. */
  public getAnchor(): SwXTextRange | undefined {
    const hint = this.mark;
    const node = hint?.GetTextNode();
    if (!hint || !node || !this.parent || node.GetDoc().GetRefMark(this.name) !== hint.GetAttr())
      return undefined;
    const start = new SwPosition(node, hint.GetStart());
    const end = new SwPosition(node, hint.GetAnyEnd());
    const range = new SwPaM(end, start);
    try {
      return new SwXTextRange(range, this.parent);
    } finally {
      range.Dispose();
      end.Dispose();
      start.Dispose();
    }
  }

  /** Releases the descriptor or applies native deletion of the attached mark text. @returns Nothing. */
  public dispose(): void {
    const hint = this.mark;
    const node = hint?.GetTextNode();
    this.isDescriptor = false;
    this.mark = undefined;
    this.parent = undefined;
    if (hint && node && node.GetDoc().GetRefMark(this.name) === hint.GetAttr())
      this.DeleteRefMark(hint);
  }

  /** Deletes the selected mark and its text through the original content operations owner. @param hint - Attached mark. @param after - Optional operation on the resulting selection. @returns Nothing. */
  private DeleteRefMark(hint: SwTextRefMark, after?: (range: SwPaM) => void): void {
    const node = hint.GetTextNode();
    if (!node) return;
    const start = new SwPosition(node, hint.GetStart());
    const end = new SwPosition(node, hint.GetEnd() ?? hint.GetStart() + 1);
    const range = new SwPaM(end, start);
    try {
      node.GetDoc().GetDocumentContentOperationsManager().DeleteAndJoin(range);
      after?.(range);
    } finally {
      range.Dispose();
      end.Dispose();
      start.Dispose();
    }
  }
}
