/** @fileoverview Writer sequence field masters, values and reference identities from expfld.cxx. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxNumberType } from "../../../../editeng/source/items/numitem";
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";

/** Original unused sequence identity reserved before a field has a reference number. */
export const SW_SEQUENCE_ID_UNASSIGNED = 0xffff;

/** Native Writer SetExpression field type for a numbered sequence. */
export class SwSetExpFieldType {
  private outlineLevel = 0xff;
  private delimiter = ".";

  /** Binds a sequence type to the native document. @param document - Writer owner. @param name - Field master name. */
  public constructor(
    private readonly document: SwDoc,
    private readonly name: string,
  ) {}

  /** Returns the document that owns the sequence. @returns Writer model. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the original field master name. @returns Sequence name. */
  public GetName(): string {
    return this.name;
  }

  /** Reads the original unsigned outline level. @returns Zero-based depth or 255 when chapter numbering is disabled. */
  public GetOutlineLvl(): number {
    return this.outlineLevel;
  }

  /** Sets the native sequence outline level. @param level - UNO signed depth or native unsigned value. */
  public SetOutlineLvl(level: number): void {
    this.outlineLevel = level & 0xff;
  }

  /** Reads the separator appended after a chapter number. @returns Original delimiter. */
  public GetDelimiter(): string {
    return this.delimiter;
  }

  /** Assigns the original sequence numbering separator. @param delimiter - Authored separator. */
  public SetDelimiter(delimiter: string): void {
    this.delimiter = delimiter;
  }

  /** Keeps an unused existing reference number or assigns the first unused index. @param field - Field that needs its stable reference number. */
  public SetSeqRefNo(field: SwSetExpField): void {
    const used = new Set<number>();
    for (const node of this.document.GetNodes().entries()) {
      for (const hint of node.GetTextNode()?.GetpSwpHints()?.GetSequenceFields() ?? []) {
        const other = hint.GetAttr().GetField();
        if (other !== field && other.GetTyp() === this) used.add(other.GetSeqNumber());
      }
    }
    const previous = field.GetSeqNumber();
    if (previous !== SW_SEQUENCE_ID_UNASSIGNED && !used.has(previous)) return;
    let next = 0;
    while (next < SW_SEQUENCE_ID_UNASSIGNED && used.has(next)) ++next;
    field.SetSeqNumber(next);
  }
}

/** Native numbered SetExpression field at one Writer text point. */
export class SwSetExpField implements SwField<SwSetExpField> {
  private formula: string;
  private numericValue = 1;
  private expansion: string;
  private displayFormula = false;
  private sequenceNumber = SW_SEQUENCE_ID_UNASSIGNED;

  /** Creates a sequence field with its original default increment. @param type - Document sequence master. @param formula - Writer formula. @param format - Native numbering format. @param expansion - Existing field presentation. */
  public constructor(
    private readonly type: SwSetExpFieldType,
    formula: string,
    private format = SvxNumType.SVX_NUM_ARABIC,
    expansion = "",
  ) {
    this.formula = formula || type.GetName() + "+1";
    this.expansion = expansion;
  }

  /** Borrows the connected sequence master. @returns Native field type. */
  public GetTyp(): SwSetExpFieldType {
    return this.type;
  }

  /** Returns the original Writer formula. @returns Source expression. */
  public GetFormula(): string {
    return this.formula;
  }

  /** Assigns the source expression. @param formula - Writer formula. */
  public SetFormula(formula: string): void {
    this.formula = formula;
  }

  /** Assigns the native presentation format. @param format - Numbering format. */
  public SetFormat(format: SvxNumType): void {
    this.format = format;
  }

  /** Reads the original sequence numbering format. @returns Number format. */
  public GetFormat(): SvxNumType {
    return this.format;
  }

  /** Returns the sequence reference identity independently of its displayed number. @returns Native unsigned identity. */
  public GetSeqNumber(): number {
    return this.sequenceNumber;
  }

  /** Assigns a sequence reference identity. @param value - Unsigned field reference number. */
  public SetSeqNumber(value: number): void {
    this.sequenceNumber = value & 0xffff;
  }

  /** Returns the last calculated sequence value. @returns Numeric field value. */
  public GetValue(): number {
    return this.numericValue;
  }

  /** Sets the numeric sequence value and native numbering expansion. @param value - Calculated value. */
  public SetValue(value: number): void {
    this.numericValue = value;
    const number = value >>> 0;
    this.expansion =
      this.format === SvxNumType.SVX_NUM_PAGEDESC
        ? String(number)
        : new SvxNumberType(this.format).GetNumStr(number);
  }

  /** Sets the full presentation, including any chapter prefix. @param expansion - Source expansion. */
  public ChgExpStr(expansion: string): void {
    this.expansion = expansion;
  }

  /** Sets the native command-display switch. @param show - Whether to show the formula. */
  public SetShowFormula(show: boolean): void {
    this.displayFormula = show;
  }

  /** Reads the native command-display switch. @returns Original mode. */
  public IsShowFormula(): boolean {
    return this.displayFormula;
  }

  /** Reads the original presentation cache independently of command display. @returns Cached field text. */
  public GetExpStr(): string {
    return this.expansion;
  }

  /** Provides the native cached display. @returns Field text. */
  public Expand(): string {
    return this.displayFormula ? this.type.GetName() + " = " + this.formula : this.expansion;
  }

  /** Copies the cached values through the original field type. @returns Unattached clone. */
  public Copy(): SwSetExpField {
    const field = new SwSetExpField(this.type, this.formula, this.format, this.expansion);
    field.SetSeqNumber(this.sequenceNumber);
    field.numericValue = this.numericValue;
    field.displayFormula = this.displayFormula;
    return field;
  }

  /** Resolves the original named master in another Writer document. @param document - Destination model. @returns Unattached clone. */
  public CopyToDocument(document: SwDoc): SwSetExpField {
    const type = document.getIDocumentFieldsAccess().GetSequenceFieldType(this.type.GetName());
    const field = new SwSetExpField(type, this.formula, this.format, this.expansion);
    field.SetSeqNumber(this.sequenceNumber);
    field.numericValue = this.numericValue;
    field.displayFormula = this.displayFormula;
    return field;
  }

  /** Releases the represented value-only field. */
  public Dispose(): void {}
}
