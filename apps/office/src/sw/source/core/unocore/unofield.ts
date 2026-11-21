/** @fileoverview Writer's UNO Annotation descriptor and attachment to the native text field. */
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  DateTime as UnoDateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../../offapi/com/sun/star/util/DateTime";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../../inc/fmtfld";
import { SwTextField } from "../../../inc/txtfld";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwPostItField, SwPostItFieldType, type SwPostItFieldData } from "../fields/docufld";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { illegal, invalid, scalar, stringValue, text, unknown } from "./unocrsrhelper";

/** Implements the annotation service's descriptor and borrowed attached text field. */
export class SwXTextField {
  private data: SwPostItFieldData = {
    author: "",
    initials: "",
    text: "",
    name: "",
    dateTime: new DateTime(DateTime.EMPTY),
  };
  private hint: SwTextField | undefined;
  private parent: SwXTextOwner | undefined;

  /** Sets the annotation descriptor's native name. @param name - Field name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    this.data = { ...this.data, name: text(name) };
    this.hint?.GetAttr().GetField().SetName(this.data.name);
  }

  /** Reads and writes the consumed descriptor properties before attachment. @param key - Native property name. @param input - Typed UNO value. @returns Nothing. */
  setPropertyValue(key: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Annotation descriptor is attached");
    const propertyName = text(key);
    switch (propertyName) {
      case "Author":
        this.data = { ...this.data, author: stringValue(input) };
        break;
      case "Initials":
        this.data = { ...this.data, initials: stringValue(input) };
        break;
      case "Content":
        this.data = { ...this.data, text: stringValue(input) };
        break;
      case "Name":
        this.data = { ...this.data, name: stringValue(input) };
        break;
      case "ParentName":
        this.data = { ...this.data, parentName: stringValue(input) };
        break;
      case "Resolved":
        this.data = { ...this.data, resolved: scalar(input, "bool") as boolean };
        break;
      case "DateTimeValue": {
        const date = new UnoDateTime();
        if (!input.extract(date, cppu_detail_getUnoType_DateTime)) illegal(propertyName);
        this.data = { ...this.data, dateTime: new DateTime(date) };
        break;
      }
      default:
        unknown(propertyName);
    }
  }

  /** Inserts at the selection end, retaining the selected text as an annotation mark. @param range - Registered insertion or selected range. @returns Nothing. */
  attach(range: SwXTextRange): void {
    const doc = range.GetDoc();
    const selection = range.GetPaM();
    const start = selection.Start();
    const end = selection.End();
    const endNode = end.GetNode().GetTextNode();
    if (!endNode) illegal("Annotation requires a text position");
    const oldHint = this.hint;
    const oldNode = oldHint?.GetTextNode();
    if (oldHint && oldNode?.GetDoc() !== doc) illegal("Annotation belongs to another document");
    const expanded = start.compare(end) !== 0;
    const first = start.clone("mark");
    first.nContent.SetAffinity("before");
    try {
      doc.RunModelTransaction(
        /** Inserts the new point before erasing the old one, then registers the live range. @returns Nothing. */ () => {
          const oldField = oldHint?.GetAttr().GetField();
          const value = oldField ?? new SwPostItField(SwPostItFieldType.Get(doc), this.data);
          const format = new SwFormatField(value);
          if (!oldField) value.Dispose();
          const hint = new SwTextField(format, end.GetContentIndex());
          if (!endNode.InsertHint(hint)) illegal("No space for the annotation");
          if (oldHint && oldNode) oldNode.EraseText(oldHint.GetStart(), 1);
          this.hint = hint;
          this.parent = range.getText();
          if (expanded) {
            const last = new SwPosition(endNode, hint.GetStart() + 1);
            const selected = new SwPaM(first, last);
            try {
              const field = format.GetField();
              if (!field.GetName()) field.SetName(`__Annotation__${field.GetData().id}`);
              doc.GetIDocumentMarkAccess().MakeAnnotationMark(selected, format);
            } finally {
              selected.Dispose();
              last.Dispose();
            }
          }
        },
      );
    } finally {
      first.Dispose();
    }
  }

  /** Returns the annotation mark or the one-character point range. @returns Registered anchor. */
  getAnchor(): SwXTextRange {
    const hint = this.hint;
    const node = hint?.GetTextNode();
    if (!hint || !node || !this.parent) return invalid("Annotation is detached");
    const mark = node.GetDoc().GetIDocumentMarkAccess().GetAnnotationMark(hint.GetAttr());
    const first = mark?.GetMarkStart() ?? new SwPosition(node, hint.GetStart());
    const last = mark?.GetMarkEnd() ?? new SwPosition(node, hint.GetStart() + 1);
    const anchor = new SwPaM(first, last);
    try {
      return new SwXTextRange(anchor, this.parent);
    } finally {
      anchor.Dispose();
      if (!mark) {
        first.Dispose();
        last.Dispose();
      }
    }
  }

  /** Erases the attached annotation and its range. @returns Nothing. */
  dispose(): void {
    const hint = this.hint;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
    this.hint = undefined;
    this.parent = undefined;
  }
}
