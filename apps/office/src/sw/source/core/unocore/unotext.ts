/** @fileoverview SwXText import append/insert/paragraph boundaries from pinned unotext.cxx, using the existing document content-operation owner. */
import { SetAttrMode } from "../../../inc/swtypes";
import * as ControlCharacter from "../../../../offapi/com/sun/star/text/ControlCharacter";
import { convertToTable, setCellProperty, type SwXTextTable } from "./unotbl";
import type { SwTableBox } from "../table/swtable";
import type { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwStartNode } from "../docnode/node";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwXParagraph } from "./unoparagraph";
import { IllegalArgumentException } from "../../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { SwXBookmark } from "./unobkm";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { SwXTextCursor } from "./unoobj";
import {
  DocInsertStringSplitCR,
  SetPropertyValues,
  invalid,
  illegal,
  unicode,
} from "./unocrsrhelper";
import { text } from "./unocrsrhelper";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { UnknownPropertyException } from "../../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
/** Parent text owner for body or a table cell; no text is stored in this API object. */
export class SwXText implements SwXTextOwner {
  private valid = true;
  /** Binds the represented native owner and its declared inputs. @param document - Canonical document owner. @param start - Original start input. @returns Nothing. */
  constructor(
    private readonly document: SwDoc,
    private readonly start: SwStartNode = document
      .GetNodes()
      .GetEndOfContent()
      .StartOfSectionNode(),
  ) {}
  /** Borrows the owning canonical document. @returns The represented native operation result. */
  GetDoc(): SwDoc {
    if (!this.valid || this.document.IsInDtor()) invalid("Text is disposed");
    return this.document;
  }
  /** Implements the represented native GetTextNodes operation. @returns The represented native operation result. */
  GetTextNodes(): readonly SwTextNode[] {
    const doc = this.GetDoc();
    return doc
      .GetNodes()
      .entries()
      .filter(
        /** Processes one ordered native value at this boundary. @param node - Canonical text node. @returns The represented native operation result. */
        (node): node is SwTextNode =>
          node instanceof SwTextNode && node.StartOfSectionNode() === this.start,
      );
  }
  /** Implements the represented native createTextCursor operation. @returns The represented native operation result. */
  createTextCursor(): SwXTextCursor {
    const start = this.getStart();
    try {
      return this.createTextCursorByRange(start);
    } finally {
      start.dispose();
    }
  }
  /** Implements the represented native createTextCursorByRange operation. @param range - Registered canonical range. @returns The represented native operation result. */
  createTextCursorByRange(range: SwXTextRange): SwXTextCursor {
    this.check(range);
    return new SwXTextCursor(range.GetPaM(), this);
  }
  /** Creates a native range at the ordered start. @returns The represented native operation result. */
  getStart(): SwXTextRange {
    return this.boundary(false);
  }
  /** Creates a native range at the ordered end. @returns The represented native operation result. */
  getEnd(): SwXTextRange {
    return this.boundary(true);
  }
  /** Implements the represented native boundary operation. @param end - Original end input. @returns The represented native operation result. */
  private boundary(end: boolean): SwXTextRange {
    const nodes = this.GetTextNodes(),
      node = end ? nodes.at(-1) : nodes[0];
    if (!node) invalid("Text has no content node");
    const pos = new SwPosition(node, end ? node.Len() : 0),
      pam = new SwPaM(pos);
    try {
      return new SwXTextRange(pam, this);
    } finally {
      pam.Dispose();
      pos.Dispose();
    }
  }
  /** Implements the represented native check operation. @param range - Registered canonical range. @returns The represented native operation result. */
  private check(range: SwXTextRange): void {
    if (!(range instanceof SwXTextRange) || range.GetDoc() !== this.GetDoc())
      invalid("Range belongs to another document");
    const p = range.GetPaM(),
      nodes = this.GetTextNodes();
    if (
      !nodes.includes(p.Start().GetNode() as SwTextNode) ||
      !nodes.includes(p.End().GetNode() as SwTextNode)
    )
      invalid("Range belongs to another text");
  }
  /** Reads text from the canonical node range. @returns The represented native operation result. */
  getString(): ReturnType<SwXTextRange["getString"]> {
    const c = this.createTextCursor();
    try {
      c.gotoEnd(true);
      return c.getString();
    } finally {
      c.dispose();
    }
  }
  /** Replaces the selected canonical text. @param value - Declared native value. @returns Nothing. */
  setString(value: OUStringConstReference): void {
    const c = this.createTextCursor();
    try {
      c.gotoEnd(true);
      c.setString(value);
    } finally {
      c.dispose();
    }
  }
  /** Nonabsorbing insertion occurs at the ordered start and leaves the caller's selection live. Absorbing insertion selects replacement text. @param range - Registered canonical range. @param value - Declared native value. @param absorb - Original absorb input. @returns The represented native operation result. */
  insertString(range: SwXTextRange, value: OUStringConstReference, absorb: boolean): void {
    this.check(range);
    const original = range.GetPaM(),
      first = original.Start().clone(),
      p = new SwPaM(first),
      doc = this.GetDoc();
    p.GetPoint().nContent.SetAffinity("after");
    try {
      if (absorb && original.Start().compare(original.End()) !== 0) {
        p.Assign(original.End(), original.Start());
        doc.GetDocumentContentOperationsManager().DeleteAndJoin(p);
        p.DeleteMark();
      }
      const start = p.GetPoint().clone();
      start.nContent.SetAffinity("before");
      try {
        DocInsertStringSplitCR(p, value);
        if (absorb) {
          const selected = new SwPaM(p.GetPoint(), start);
          try {
            range.SetPositions(selected);
          } finally {
            selected.Dispose();
          }
        }
      } finally {
        start.Dispose();
      }
    } finally {
      p.Dispose();
      first.Dispose();
    }
  }
  /** Inserts the represented original control character and updates the caller cursor through canonical index correction. @param range - Native destination. @param control - ControlCharacter value. @param absorb - Replace the selected range. @returns Nothing. */
  insertControlCharacter(range: SwXTextRange, control: number, absorb: boolean): void {
    this.check(range);
    const value =
      control === ControlCharacter.PARAGRAPH_BREAK
        ? "\r"
        : control === ControlCharacter.LINE_BREAK
          ? "\n"
          : control === ControlCharacter.HARD_HYPHEN
            ? "\u2011"
            : control === ControlCharacter.SOFT_HYPHEN
              ? "\u00ad"
              : control === ControlCharacter.HARD_SPACE
                ? "\u00a0"
                : undefined;
    if (value !== undefined) {
      const string = unicode(value);
      try {
        this.insertString(range, string, absorb);
      } finally {
        string.dispose();
      }
    } else if (control === ControlCharacter.APPEND_PARAGRAPH) {
      const node = range.GetPaM().GetPoint().GetNode();
      const paragraph = this.finishParagraphInsert([], range);
      const position = new SwPosition(
        this.GetDoc()
          .GetNodes()
          .at(node.GetIndex() + 1),
        0,
      );
      const appended = new SwPaM(position);
      try {
        range.SetPositions(appended);
      } finally {
        appended.Dispose();
        position.Dispose();
        paragraph.Release();
      }
    } else illegal("Unsupported control character");
  }
  /** Import portions use NOHINTEXPAND so omitted properties cannot inherit the preceding run's direct formatting. @param value - Declared native value. @param properties - Ordered native property values. @returns The represented native operation result. */
  appendTextPortion(
    value: OUStringConstReference,
    properties: readonly PropertyValue[],
  ): SwXTextRange {
    const end = this.getEnd();
    try {
      return this.insertTextPortion(value, properties, end);
    } finally {
      end.dispose();
    }
  }
  /** Implements the represented native insertTextPortion operation. @param value - Declared native value. @param properties - Ordered native property values. @param position - Original position input. @returns The represented native operation result. */
  insertTextPortion(
    value: OUStringConstReference,
    properties: readonly PropertyValue[],
    position: SwXTextRange,
  ): SwXTextRange {
    this.check(position);
    const p = new SwPaM(position.GetPaM().GetPoint()),
      start = p.GetPoint().clone();
    start.nContent.SetAffinity("before");
    p.GetPoint().nContent.SetAffinity("after");
    const node = p.GetPoint().GetNode() as SwTextNode,
      offset = start.GetContentIndex(),
      style = node.GetTextFormatColl(),
      before = node.CaptureTextFragment(0, node.Len()),
      direct = node.GetpSwAttrSet()?.Clone();
    try {
      DocInsertStringSplitCR(p, value, SwInsertFlags.NOHINTEXPAND);
      const result = new SwPaM(start, p.GetPoint());
      try {
        SetPropertyValues(result, properties, SetAttrMode.NOFORMATATTR);
        return new SwXTextRange(result, this);
      } finally {
        result.Dispose();
      }
    } catch (error) {
      if (!(error instanceof IllegalArgumentException) && !(error instanceof RuntimeException))
        throw error;
      {
        const inserted = new SwPaM(p.GetPoint(), start);
        try {
          if (start.compare(p.GetPoint()) !== 0) docDelete(this.GetDoc(), inserted);
        } finally {
          inserted.Dispose();
        }
        node.ChgFormatColl(style);
        node.SetText(before.text);
        node.SetTextHints(before.hints);
        node.ResetAllAttr();
        if (direct) node.SetAttr(direct);
        p.GetPoint().Assign(node, offset);
      }
      throw error;
    } finally {
      start.Dispose();
      p.Dispose();
    }
  }
  /** Implements the represented native finishParagraph operation. @param properties - Ordered native property values. @returns The represented native operation result. */
  finishParagraph(properties: readonly PropertyValue[]): SwXParagraph {
    const end = this.getEnd();
    try {
      return this.finishParagraphInsert(properties, end);
    } finally {
      end.dispose();
    }
  }
  /** Implements the represented native finishParagraphInsert operation. @param properties - Ordered native property values. @param position - Original position input. @returns The represented native operation result. */
  finishParagraphInsert(
    properties: readonly PropertyValue[],
    position: SwXTextRange,
  ): SwXParagraph {
    this.check(position);
    const node = position.GetPaM().GetPoint().GetNode() as SwTextNode,
      doc = this.GetDoc(),
      end = new SwPosition(node, node.Len()),
      p = new SwPaM(end),
      direct = node.GetpSwAttrSet()?.Clone(),
      style = node.GetTextFormatColl(),
      fragment = node.CaptureTextFragment(0, node.Len());
    const next = new SwTextNode(doc.GetNodes(), this.start, style.GetNextTextFormatColl());
    doc.GetNodes().insertTextNodeAfter(node, next);
    try {
      p.SetMark();
      p.GetMark().Assign(node, 0);
      SetPropertyValues(p, properties);
      return new SwXParagraph(node, this);
    } catch (error) {
      doc.GetNodes().removeTextNode(next);
      node.ChgFormatColl(style);
      node.ResetAllAttr();
      if (direct) node.SetAttr(direct);
      node.SetTextHints(fragment.hints);
      if (error instanceof UnknownPropertyException) invalid("Unknown paragraph property");
      throw error;
    } finally {
      p.Dispose();
      end.Dispose();
    }
  }
  /** Attaches currently supported native text contents; selection deletion is not part of bookmark attachment. @param range - Registered canonical range. @param content - Original content input. @param absorb - Original absorb input. @returns The represented native operation result. */
  insertTextContent(range: SwXTextRange, content: SwXBookmark, absorb: boolean): void {
    this.check(range);
    if (absorb) content.attach(range);
    else {
      const start = range.getStart();
      try {
        content.attach(start);
      } finally {
        start.dispose();
      }
    }
  }
  /** Implements the represented native removeTextContent operation. @param content - Original content input. @returns The represented native operation result. */
  removeTextContent(content: SwXBookmark): void {
    content.dispose();
  }

  /** Converts imported cell ranges through the native table owner. @param ranges - Original ranges input. @param cells - Original cells input. @param rows - Original rows input. @param properties - Ordered native property values. @returns The represented native operation result. */
  convertToTable(
    ranges: readonly (readonly (readonly SwXTextRange[])[])[],
    cells: readonly (readonly (readonly PropertyValue[])[])[],
    rows: readonly (readonly PropertyValue[])[],
    properties: readonly PropertyValue[],
  ): SwXTextTable | null {
    return convertToTable(this, ranges, cells, rows, properties);
  }
  /** Native range comparison returns positive when the first endpoint precedes the second. @param a - Original a input. @param b - Original b input. @returns The represented native operation result. */
  compareRegionStarts(a: SwXTextRange, b: SwXTextRange): number {
    this.check(a);
    this.check(b);
    return -Math.sign(a.GetPaM().Start().compare(b.GetPaM().Start()));
  }
  /** Implements the represented native compareRegionEnds operation. @param a - Original a input. @param b - Original b input. @returns The represented native operation result. */
  compareRegionEnds(a: SwXTextRange, b: SwXTextRange): number {
    this.check(a);
    this.check(b);
    return -Math.sign(a.GetPaM().End().compare(b.GetPaM().End()));
  }
  /** Ends this API object lifetime and releases its owned resources. @returns Nothing. */
  dispose(): void {
    this.valid = false;
  }
}

/** Cell subclass is evaluated after SwXText to preserve native inheritance across the ES module cycle with unotbl. Its public owner is re-exported by unotbl. */
export class SwXCell extends SwXText {
  /** Binds the represented native owner and its declared inputs. @param box - Original box input. @returns Nothing. */
  constructor(private readonly box: SwTableBox) {
    super(box.GetStartNode().GetDoc(), box.GetStartNode());
  }
  /** Applies a typed native property without duplicating model state. @param name - Native property or element name. @param value - Declared native value. @returns Nothing. */
  setPropertyValue(
    name: OUStringConstReference,
    value: import("../../../../cppu/inc/com/sun/star/uno/Any").Any,
  ): void {
    if (setCellProperty(this.box, text(name), value)) return;
    const cursor = this.createTextCursor();
    try {
      cursor.gotoEnd(true);
      cursor.setPropertyValue(name, value);
    } finally {
      cursor.dispose();
    }
  }
}

/** Uses canonical structural deletion to unwind a failed imported portion, including its CR splits. @param doc - Canonical document owner. @param pam - Original pam input. @returns The represented native operation result. */
function docDelete(doc: SwDoc, pam: SwPaM): void {
  doc.GetDocumentContentOperationsManager().DeleteAndJoin(pam);
}
