/** @fileoverview Native document ownership of Writer system field types. */
import { SwDocInfoFieldType, SwDocStatFieldType, SwPostItFieldType } from "../fields/docufld";
import { SwSetExpFieldType } from "../fields/expfld";
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
  private readonly sequences = new Map<string, SwSetExpFieldType>();
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
    let type = this.sequences.get(name);
    if (!type) {
      type = new SwSetExpFieldType(this.document, name);
      this.sequences.set(name, type);
    }
    return type;
  }

  /** Lists sequence types in their native registration order. @returns Document-owned types. */
  public GetSequenceFieldTypes(): Iterable<SwSetExpFieldType> {
    return this.sequences.values();
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

  /** Updates the native sequence expression pass in document order. @param layout - Current Writer layout. */
  public UpdateExpFields(layout?: SwRootFrame): void {
    const calculator = new SwCalc();
    const outlines = new Map<SwSetExpFieldType, SwTextNode | undefined>();
    for (const node of this.document.GetNodes().entries()) {
      for (const hint of node.GetTextNode()?.GetpSwpHints()?.GetSequenceFields() ?? []) {
        const field = hint.GetAttr().GetField();
        const master = field.GetTyp();
        const name = master.GetName();
        let heading: SwTextNode | undefined;
        if (master.GetOutlineLvl() < 10) {
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
