/** @fileoverview Native document ownership of Writer system field types. */
import { SwDocInfoFieldType, SwDocStatFieldType, SwPostItFieldType } from "../fields/docufld";
import {
  SwGetExpField,
  SwGetExpFieldType,
  SwGetSetExpType,
  SwSetExpField,
  SwSetExpFieldType,
} from "../fields/expfld";
import { SwUserFieldType } from "../fields/usrfld";
import { SwJumpEditFieldType } from "../fields/docufld.jumpedit";
import { SwDropDownFieldType } from "../fields/flddropdown";
import { SwChapterFieldType } from "../fields/chpfld";
import { SwPageNumberFieldType } from "../fields/docufld.pagenumber";
import { SwGetRefFieldType } from "../fields/reffld";
import { SwDateTimeFieldType } from "../fields/flddat";
import { SwCalc } from "../bastyp/calc";
import type { SwRootFrame } from "../layout/newfrm";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "./doc";

/** Document-owned system fields for the represented Writer field families. */
export class DocumentFieldsManager {
  private readonly setExpressions = new Map<string, SwSetExpFieldType>();
  private readonly users = new Map<string, SwUserFieldType>();
  private readonly getExpression: SwGetExpFieldType;
  private readonly jumpEdit: SwJumpEditFieldType;
  private readonly dropDown: SwDropDownFieldType;
  private readonly chapter: SwChapterFieldType;
  private readonly pageNumber: SwPageNumberFieldType;
  private readonly docStat: SwDocStatFieldType;
  private readonly postIt: SwPostItFieldType;
  private readonly getRef: SwGetRefFieldType;
  private readonly docInfo: SwDocInfoFieldType;
  private readonly dateTime: SwDateTimeFieldType;

  /** Creates the system field types for this document. @param document - Actual Writer model. */
  public constructor(private readonly document: SwDoc) {
    this.getExpression = new SwGetExpFieldType(document);
    this.jumpEdit = new SwJumpEditFieldType(document);
    this.dropDown = new SwDropDownFieldType(document);
    this.chapter = new SwChapterFieldType(document);
    this.pageNumber = new SwPageNumberFieldType(document);
    this.docStat = new SwDocStatFieldType(document);
    this.postIt = new SwPostItFieldType(document);
    this.getRef = new SwGetRefFieldType(document);
    this.docInfo = new SwDocInfoFieldType(document);
    this.dateTime = new SwDateTimeFieldType(document);
    for (const name of ["Illustration", "Table", "Text", "Drawing", "Figure"])
      this.GetSequenceFieldType(name);
  }

  /** Resolves the original named sequence type, creating its default state when first used. @param name - Native master name. @returns Document-owned sequence type. */
  public GetSequenceFieldType(name: string): SwSetExpFieldType {
    return this.GetSetExpFieldType(name, SwGetSetExpType.Sequence);
  }

  /** Looks up a named SetExpression type without introducing a new field master. @param name - Native master name. @returns Existing type. */
  public FindSetExpFieldType(name: string): SwSetExpFieldType | undefined {
    return this.setExpressions.get(name);
  }

  /** Resolves the native named SetExpression type. @param name - Native master name. @param subtype - Type for newly registered variables. @returns Document-owned type. */
  public GetSetExpFieldType(name: string, subtype: SwGetSetExpType): SwSetExpFieldType {
    let type = this.setExpressions.get(name);
    if (!type) {
      type = new SwSetExpFieldType(this.document, name, subtype);
      this.setExpressions.set(name, type);
    }
    return type;
  }

  /** Lists sequence types in their native registration order. @returns Document-owned types. */
  public *GetSequenceFieldTypes(): Iterable<SwSetExpFieldType> {
    for (const type of this.setExpressions.values())
      if (type.GetType() === SwGetSetExpType.Sequence) yield type;
  }

  /** Lists original SetExpression types in their registration order. @returns Named masters. */
  public GetSetExpFieldTypes(): Iterable<SwSetExpFieldType> {
    return this.setExpressions.values();
  }

  /** Finds the existing native User field type. @param name - Native master name. @returns Existing type. */
  public FindUserFieldType(name: string): SwUserFieldType | undefined {
    return this.users.get(name);
  }

  /** Resolves the native User field type. @param name - Native master name. @returns Document-owned type. */
  public GetUserFieldType(name: string): SwUserFieldType {
    let type = this.users.get(name);
    if (!type) {
      type = new SwUserFieldType(this.document, name);
      this.users.set(name, type);
    }
    return type;
  }

  /** Lists original user field types in their registration order. @returns Named masters. */
  public GetUserFieldTypes(): Iterable<SwUserFieldType> {
    return this.users.values();
  }

  /** Borrows the original GetExpression system type. @returns Document field type. */
  public GetGetExpFieldType(): SwGetExpFieldType {
    return this.getExpression;
  }

  /** Borrows the original JumpEdit system type. @returns Field type. */
  public GetJumpEditFieldType(): SwJumpEditFieldType {
    return this.jumpEdit;
  }

  /** Borrows the original DropDown system type. @returns Field type. */
  public GetDropDownFieldType(): SwDropDownFieldType {
    return this.dropDown;
  }

  /** Borrows the original Chapter system type. @returns Field type. */
  public GetChapterFieldType(): SwChapterFieldType {
    return this.chapter;
  }

  /** Borrows the original PageNumber system type. @returns Field type. */
  public GetPageNumberFieldType(): SwPageNumberFieldType {
    return this.pageNumber;
  }

  /** Borrows the original document statistic field type. @returns System field type. */
  public GetDocStatFieldType(): SwDocStatFieldType {
    return this.docStat;
  }

  /** Borrows the original date/time field type. @returns System field type. */
  public GetDateTimeFieldType(): SwDateTimeFieldType {
    return this.dateTime;
  }

  /** Borrows the original document information field type. @returns System field type. */
  public GetDocInfoFieldType(): SwDocInfoFieldType {
    return this.docInfo;
  }

  /** Borrows the original annotation field type. @returns Document type. */
  public GetPostItFieldType(): SwPostItFieldType {
    return this.postIt;
  }

  /** Borrows the original GetReference field type. @returns Document type. */
  public GetReferenceFieldType(): SwGetRefFieldType {
    return this.getRef;
  }

  /** Updates the native expression fields in document order. @param layout - Current Writer layout. */
  public UpdateExpFields(layout?: SwRootFrame): void {
    const calculator = new SwCalc();
    const strings = new Map<string, string>();
    for (const type of this.users.values()) {
      if (type.expression) calculator.VarChange(type.name, type.value);
      else strings.set(type.name, type.content);
    }
    const outlines = new Map<SwSetExpFieldType, SwTextNode | undefined>();
    for (const node of this.document.GetNodes().entries()) {
      for (const hint of node.GetTextNode()?.GetpSwpHints()?.GetOrdinaryFields() ?? []) {
        const field = hint.GetAttr().GetField();
        if (field instanceof SwGetExpField) {
          const value =
            field.subtype === SwGetSetExpType.Formula
              ? calculator.Calculate(field.formula)
              : (strings.get(field.formula) ?? calculator.GetVariable(field.formula));
          if (value !== undefined) field.SetValue(value);
          continue;
        }
        if (!(field instanceof SwSetExpField)) continue;
        const master = field.GetTyp();
        const name = master.GetName();
        if (master.GetType() === SwGetSetExpType.String) {
          const formula = field.GetFormula();
          const value = strings.get(formula) || formula;
          strings.set(name, value);
          field.ChgExpStr(value);
          continue;
        }
        let heading: SwTextNode | undefined;
        if (field.IsSequenceField() && master.GetOutlineLvl() < 10) {
          heading = node.FindOutlineNodeOfLevel(master.GetOutlineLvl(), layout);
          if (!outlines.has(master) || outlines.get(master) !== heading) {
            outlines.set(master, heading);
            calculator.VarChange(name, 0);
          }
        }
        const value = calculator.Calculate(field.GetFormula());
        if (value === undefined) continue;
        calculator.VarChange(name, value);
        field.SetValue(value);
        const chapter = heading?.GetNumString(false);
        if (chapter) field.ChgExpStr(chapter + master.GetDelimiter() + field.GetExpStr());
      }
    }
  }

  /** Updates native reference fields through their system type. */
  public UpdateRefFields(): void {
    this.UpdateExpFields();
    this.getRef.UpdateGetReferences();
  }
}
