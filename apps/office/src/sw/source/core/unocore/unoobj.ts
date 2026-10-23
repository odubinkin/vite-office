/** @fileoverview Consumed SwXTextCursor movement from pinned unoobj.cxx; selection lives in registered SwPaM endpoints. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import {
  UnknownPropertyException,
  cppu_detail_getUnoType as unknownType,
} from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { WrappedTargetException } from "../../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { unicode } from "./unocrsrhelper";
import type { SwXText } from "./unotext";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { SwPaM } from "../crsr/pam";
import { ResetPoolItem } from "../doc/docfmt";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SwUnoPropertyMap } from "./unomap";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text } from "./unocrsrhelper";
import { SelectPam, invalid, spans, queryItem, unknown } from "./unocrsrhelper";
import type { SwTextNode } from "../txtnode/ndtxt";
/** Text cursor over one body or cell text domain. */
export class SwXTextCursor extends SwXTextRange {
  /** Binds the represented native owner and its declared inputs. @param range - Registered canonical range. @param parent - Borrowed parent text owner. @returns Nothing. */
  constructor(range: SwPaM, parent: SwXTextOwner) {
    super(range, parent, false);
    this.pam.GetPoint().nContent.SetAffinity("after");
    this.pam.GetMark().nContent.SetAffinity("after");
  }
  /** Applies native cursor batching and wraps unknown properties as XMultiPropertySet requires. @param names - Ordered property names. @param values - Corresponding typed values. @returns Nothing. */
  override setPropertyValues(
    names: readonly OUStringConstReference[],
    values: readonly Any[],
  ): void {
    try {
      super.setPropertyValues(names, values);
    } catch (error) {
      if (!(error instanceof UnknownPropertyException)) throw error;
      const target = new Any(error, unknownType),
        message = unicode("wrapped Exception " + text(error.Message));
      try {
        throw new WrappedTargetException(message, new Reference(), target);
      } finally {
        target.dispose();
        message.dispose();
        error.dispose();
      }
    }
  }
  /** Borrows the actual XText owner of this cursor. @returns Parent text. */
  override getText(): SwXText {
    return super.getText() as SwXText;
  }
  /** Implements the represented native GetCursor operation. @returns The represented native operation result. */
  GetCursor(): SwPaM {
    return this.GetPaM();
  }
  /** Implements the represented native collapseToStart operation. @returns Nothing. */
  collapseToStart(): void {
    this.collapse(true);
  }
  /** Implements the represented native collapseToEnd operation. @returns Nothing. */
  collapseToEnd(): void {
    this.collapse(false);
  }
  /** Implements the represented native collapse operation. @param start - Original start input. @returns Nothing. */
  private collapse(start: boolean): void {
    const p = this.GetPaM(),
      position = (start ? p.Start() : p.End()).clone();
    try {
      p.Assign(position);
    } finally {
      position.Dispose();
    }
  }
  /** Implements the represented native isCollapsed operation. @returns The represented native operation result. */
  isCollapsed(): boolean {
    const p = this.GetPaM();
    return p.Start().compare(p.End()) === 0;
  }
  /** Implements the represented native goLeft operation. @param count - Original count input. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  goLeft(count: number, expand: boolean): boolean {
    return this.move(-(count & 0xffff), expand);
  }
  /** Implements the represented native goRight operation. @param count - Original count input. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  goRight(count: number, expand: boolean): boolean {
    return this.move(count & 0xffff, expand);
  }
  /** Implements the represented native move operation. @param count - Original count input. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  private move(count: number, expand: boolean): boolean {
    const p = this.GetPaM();
    SelectPam(p, expand);
    const nodes = this.parent.GetTextNodes();
    let remaining = Math.abs(count),
      index = nodes.indexOf(p.GetPoint().GetNode() as SwTextNode),
      offset = p.GetPoint().GetContentIndex();
    while (remaining > 0) {
      const node = nodes[index] ?? invalid("Cursor is outside text");
      if (count > 0) {
        if (offset < node.Len()) {
          offset++;
          remaining--;
        } else if (index + 1 < nodes.length) {
          index++;
          offset = 0;
          remaining--;
        } else break;
      } else if (offset > 0) {
        offset--;
        remaining--;
      } else if (index > 0) {
        index--;
        offset = (nodes[index] ?? invalid("Cursor is outside text")).Len();
        remaining--;
      } else break;
    }
    p.GetPoint().Assign(nodes[index] ?? invalid("Cursor is outside text"), offset);
    return remaining === 0;
  }
  /** Implements the represented native gotoStart operation. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  gotoStart(expand: boolean): void {
    this.boundary(false, expand);
  }
  /** Implements the represented native gotoEnd operation. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  gotoEnd(expand: boolean): void {
    this.boundary(true, expand);
  }
  /** Implements the represented native boundary operation. @param end - Original end input. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  private boundary(end: boolean, expand: boolean): void {
    const p = this.GetPaM();
    SelectPam(p, expand);
    const node = end ? this.parent.GetTextNodes().at(-1) : this.parent.GetTextNodes()[0];
    if (!node) invalid("Empty text");
    p.GetPoint().Assign(node, end ? node.Len() : 0);
  }
  /** Implements the represented native gotoStartOfParagraph operation. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  gotoStartOfParagraph(expand: boolean): boolean {
    const p = this.GetPaM();
    SelectPam(p, expand);
    p.GetPoint().Assign(p.GetPoint().GetNode(), 0);
    return true;
  }
  /** Implements the represented native gotoEndOfParagraph operation. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  gotoEndOfParagraph(expand: boolean): boolean {
    const p = this.GetPaM();
    SelectPam(p, expand);
    const node = p.GetPoint().GetNode() as SwTextNode;
    p.GetPoint().Assign(node, node.Len());
    return true;
  }
  /** Implements the represented native gotoRange operation. @param range - Registered canonical range. @param expand - Preserve the existing selection mark when true. @returns The represented native operation result. */
  gotoRange(range: SwXTextRange, expand: boolean): void {
    if (range.GetDoc() !== this.GetDoc()) invalid("Range belongs to another document");
    const target = range.GetPaM(),
      nodes = this.parent.GetTextNodes();
    if (
      !nodes.includes(target.Start().GetNode() as SwTextNode) ||
      !nodes.includes(target.End().GetNode() as SwTextNode)
    )
      invalid("Range belongs to another text");
    const p = this.GetPaM();
    if (!expand) {
      p.Assign(target.GetPoint(), target.HasMark() ? target.GetMark() : undefined);
      return;
    }
    const first = p.Start().compare(target.Start()) <= 0 ? p.Start() : target.Start(),
      last = p.End().compare(target.End()) >= 0 ? p.End() : target.End();
    const a = first.clone(),
      b = last.clone();
    try {
      p.Assign(b, a);
    } finally {
      a.Dispose();
      b.Dispose();
    }
  }
  /** Reads direct versus inherited native property state. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyState(name: OUStringConstReference): PropertyState {
    const entry = SwUnoPropertyMap.get(text(name));
    if (!entry) unknown(text(name));
    let result: PropertyState | undefined;
    for (const r of spans(this.GetPaM())) {
      let current: PropertyState = PropertyState.DEFAULT_VALUE;
      if (entry.which < 49) {
        const set = new SfxItemSet(this.GetDoc().GetAttrPool(), [[entry.which, entry.which]]);
        r.node.GetParaAttr(set, r.start, r.end, true);
        const state = set.GetItemState(entry.which, false);
        if (state === SfxItemState.INVALID) current = PropertyState.AMBIGUOUS_VALUE;
        else if (
          state === SfxItemState.SET ||
          r.node.GetpSwAttrSet()?.GetItemState(entry.which, false) === SfxItemState.SET
        )
          current = PropertyState.DIRECT_VALUE;
      } else if (r.node.GetpSwAttrSet()?.GetItemState(entry.which, false) === SfxItemState.SET)
        current = PropertyState.DIRECT_VALUE;
      if (result !== undefined && result !== current) return PropertyState.AMBIGUOUS_VALUE;
      result = current;
    }
    return result ?? PropertyState.DEFAULT_VALUE;
  }
  /** Reads native property states in caller order. @param names - Original names input. @returns The represented native operation result. */
  getPropertyStates(names: readonly OUStringConstReference[]): PropertyState[] {
    return names.map(
      /** Processes one ordered native value at this boundary. @param name - Native property or element name. @returns The represented native operation result. */
      (name) => this.getPropertyState(name),
    );
  }
  /** Implements the represented native getPropertyDefault operation. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyDefault(name: OUStringConstReference): ReturnType<typeof queryItem> {
    const entry = SwUnoPropertyMap.get(text(name));
    if (!entry) unknown(text(name));
    return queryItem(this.GetDoc().GetAttrPool().GetUserOrPoolDefaultItem(entry.which), entry);
  }
  /** Removes the supported direct property delta. @param name - Native property or element name. @returns Nothing. */
  setPropertyToDefault(name: OUStringConstReference): void {
    const entry = SwUnoPropertyMap.get(text(name));
    if (!entry) unknown(text(name));
    ResetPoolItem(this.GetDoc(), this.GetPaM(), entry.which);
  }
  /** Implements the represented native isStartOfParagraph operation. @returns The represented native operation result. */
  isStartOfParagraph(): boolean {
    return this.GetPaM().GetPoint().GetContentIndex() === 0;
  }
  /** Implements the represented native isEndOfParagraph operation. @returns The represented native operation result. */
  isEndOfParagraph(): boolean {
    const p = this.GetPaM().GetPoint();
    return p.GetContentIndex() === (p.GetNode() as SwTextNode).Len();
  }
}
