/** @fileoverview Writer sequence field masters, values and reference identities from expfld.cxx. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxNumberType } from "../../../../editeng/source/items/numitem";
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";
import { SwValueFieldType } from "./fldbas";

/** Original unused sequence identity reserved before a field has a reference number. */
export const SW_SEQUENCE_ID_UNASSIGNED = 0xffff;

/** Native Writer SetExpression field type for a numbered sequence. */
export class SwSetExpFieldType extends SwValueFieldType {
  private outlineLevel = 0xff;
  private delimiter = ".";

  /** Binds a sequence type to the native document. @param document - Writer owner. @param name - Field master name. @param type - Native expression subtype. @returns The initialized SwSetExpFieldType instance. */
  public constructor(
    document: SwDoc,
    private readonly name: string,
    private type = SwGetSetExpType.Sequence,
  ) {
    super(document);
  }

  /** Reads the original variable subtype. @returns Native type. */
  public GetType(): SwGetSetExpType {
    return this.type;
  }

  /** Assigns the original variable subtype. @param type - Native type. @returns Nothing. */
  public SetType(type: SwGetSetExpType): void {
    this.type = type;
  }

  /** Returns the original field master name. @returns Sequence name. */
  public GetName(): string {
    return this.name;
  }

  /** Reads the original unsigned outline level. @returns Zero-based depth or 255 when chapter numbering is disabled. */
  public GetOutlineLvl(): number {
    return this.outlineLevel;
  }

  /** Sets the native sequence outline level. @param level - UNO signed depth or native unsigned value. @returns Nothing. */
  public SetOutlineLvl(level: number): void {
    this.outlineLevel = level & 0xff;
  }

  /** Reads the separator appended after a chapter number. @returns Original delimiter. */
  public GetDelimiter(): string {
    return this.delimiter;
  }

  /** Assigns the original sequence numbering separator. @param delimiter - Authored separator. @returns Nothing. */
  public SetDelimiter(delimiter: string): void {
    this.delimiter = delimiter;
  }

  /** Keeps an unused existing reference number or assigns the first unused index. @param field - Field that needs its stable reference number. @returns Nothing. */
  public SetSeqRefNo(field: SwSetExpField): void {
    const used = new Set<number>();
    for (const node of this.GetDoc().GetNodes().entries()) {
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
  private visible = true;
  private input = false;
  private prompt = "";

  /** Creates a sequence field with its original default increment. @param type - Document sequence master. @param formula - Writer formula. @param format - Native numbering format. @param expansion - Existing field presentation. @returns The initialized SwSetExpField instance. */
  public constructor(
    private readonly type: SwSetExpFieldType,
    formula: string,
    private format: number = type.GetType() === SwGetSetExpType.Sequence
      ? SvxNumType.SVX_NUM_ARABIC
      : 0,
    expansion = "",
  ) {
    this.formula = this.IsSequenceField() && !formula ? type.GetName() + "+1" : formula;
    this.numericValue = this.IsSequenceField() ? 1 : 0;
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

  /** Assigns the source expression. @param formula - Writer formula. @returns Nothing. */
  public SetFormula(formula: string): void {
    this.formula = formula;
  }

  /** Assigns the native presentation format. @param format - Numbering format. @returns Nothing. */
  public SetFormat(format: number): void {
    this.format = format;
  }

  /** Reads the original sequence numbering format. @returns Number format. */
  public GetFormat(): number {
    return this.format;
  }

  /** Returns the sequence reference identity independently of its displayed number. @returns Native unsigned identity. */
  public GetSeqNumber(): number {
    return this.sequenceNumber;
  }

  /** Assigns a sequence reference identity. @param value - Unsigned field reference number. @returns Nothing. */
  public SetSeqNumber(value: number): void {
    this.sequenceNumber = value & 0xffff;
  }

  /** Returns the last calculated sequence value. @returns Numeric field value. */
  public GetValue(): number {
    return this.numericValue;
  }

  /** Sets the numeric sequence value and native numbering expansion. @param value - Calculated value. @returns Nothing. */
  public SetValue(value: number): void {
    this.numericValue = value;
    if (!this.IsSequenceField()) {
      this.expansion = this.type.ExpandValue(value, this.format);
      return;
    }
    const number = value >>> 0;
    this.expansion =
      this.format === SvxNumType.SVX_NUM_PAGEDESC
        ? String(number)
        : new SvxNumberType(this.format).GetNumStr(number);
  }

  /** Sets the full presentation, including any chapter prefix. @param expansion - Source expansion. @returns Nothing. */
  public ChgExpStr(expansion: string): void {
    this.expansion = expansion;
  }

  /** Sets the native command-display switch. @param show - Whether to show the formula. @returns Nothing. */
  public SetShowFormula(show: boolean): void {
    this.displayFormula = show;
  }

  /** Reads the native command-display switch. @returns Original mode. */
  public IsShowFormula(): boolean {
    return this.displayFormula;
  }

  /** Tests the original master subtype. @returns Whether this occurrence is a sequence. */
  public IsSequenceField(): boolean {
    return this.type.GetType() === SwGetSetExpType.Sequence;
  }

  /** Sets the original field visibility. @param visible - Whether the value appears in text. @returns Nothing. */
  public SetVisible(visible: boolean): void {
    this.visible = visible;
  }

  /** Reads the original field visibility. @returns Visibility setting. */
  public IsVisible(): boolean {
    return this.visible;
  }

  /** Sets the variable-input occurrence mode. @param input - Whether this is an input occurrence. @returns Nothing. */
  public SetInput(input: boolean): void {
    this.input = input;
  }

  /** Reads the occurrence's input mode. @returns Original input flag. */
  public IsInput(): boolean {
    return this.input;
  }

  /** Sets the original input prompt. @param prompt - Description text. @returns Nothing. */
  public SetPromptText(prompt: string): void {
    this.prompt = prompt;
  }

  /** Reads the original input prompt. @returns Description text. */
  public GetPromptText(): string {
    return this.prompt;
  }

  /** Reads the original presentation cache independently of command display. @returns Cached field text. */
  public GetExpStr(): string {
    return this.expansion;
  }

  /** Provides the native cached display. @returns Field text. */
  public Expand(): string {
    if (this.displayFormula) return this.type.GetName() + " = " + this.formula;
    return this.visible ? this.expansion : "";
  }

  /** Copies the cached values through the original field type. @returns Unattached clone. */
  public Copy(): SwSetExpField {
    return this.CopyWithType(this.type, this.format);
  }

  /** Resolves the original named master in another Writer document. @param document - Destination model. @returns Unattached clone. */
  public CopyToDocument(document: SwDoc): SwSetExpField {
    const type = document
      .getIDocumentFieldsAccess()
      .GetSetExpFieldType(this.type.GetName(), this.type.GetType());
    const format = this.IsSequenceField()
      ? this.format
      : this.type.CopyFormatToDocument(this.format, document);
    return this.CopyWithType(type, format);
  }

  /** Copies the occurrence data through a destination field owner. @param type - Destination master. @param format - Destination number format. @returns Detached occurrence. */
  private CopyWithType(type: SwSetExpFieldType, format: number): SwSetExpField {
    const field = new SwSetExpField(type, this.formula, format, this.expansion);
    field.SetSeqNumber(this.sequenceNumber);
    field.numericValue = this.numericValue;
    field.displayFormula = this.displayFormula;
    field.visible = this.visible;
    field.input = this.input;
    field.prompt = this.prompt;
    return field;
  }

  /** Releases the represented value-only field. @returns Nothing. */
  public Dispose(): void {}
}

/** Original represented expression field subtype bits. */
export enum SwGetSetExpType {
  String = 0x0001,
  Expr = 0x0002,
  Sequence = 0x0008,
  Formula = 0x0010,
}

/** Original system type for GetExpression fields. */
export class SwGetExpFieldType extends SwValueFieldType {}

/** Original expression reader or formula at a Writer text point. */
export class SwGetExpField implements SwField<SwGetExpField> {
  /** Constructs the field and its imported presentation. @param type - Document field type. @param formula - Name or formula. @param subtype - Native subtype. @param format - Document format key. @param showFormula - Command display. @param presentation - Imported presentation. @param value - Cached numeric expression value. @returns The initialized SwGetExpField instance. */
  public constructor(
    private readonly type: SwGetExpFieldType,
    public readonly formula: string,
    public readonly subtype: SwGetSetExpType,
    public readonly format: number,
    public readonly showFormula: boolean,
    private presentation: string,
    public value = 0,
  ) {}

  /** Borrows the original document field type. @returns GetExpression owner. */
  public GetTyp(): SwGetExpFieldType {
    return this.type;
  }

  /** Keeps the native calculated presentation. @param value - Resolved expression value. @returns Nothing. */
  public SetValue(value: number | string): void {
    if (typeof value === "number") this.value = value;
    this.presentation =
      typeof value === "string" ? value : this.type.ExpandValue(value, this.format);
  }

  /** Reads the native presentation cache. @returns Calculated or imported expansion. */
  public GetExpStr(): string {
    return this.presentation;
  }

  /** Expands the native command or current value. @returns Text shown for the field. */
  public Expand(): string {
    return this.showFormula ? this.formula : this.presentation;
  }

  /** Copies the native field in the same document. @returns Detached occurrence. */
  public Copy(): SwGetExpField {
    return new SwGetExpField(
      this.type,
      this.formula,
      this.subtype,
      this.format,
      this.showFormula,
      this.presentation,
      this.value,
    );
  }

  /** Copies the occurrence and its format into another document. @param document - Destination model. @returns Detached occurrence. */
  public CopyToDocument(document: SwDoc): SwGetExpField {
    return new SwGetExpField(
      document.getIDocumentFieldsAccess().GetGetExpFieldType(),
      this.formula,
      this.subtype,
      this.type.CopyFormatToDocument(this.format, document),
      this.showFormula,
      this.presentation,
      this.value,
    );
  }

  /** Releases the value-only field. @returns Nothing. */
  public Dispose(): void {}
}
