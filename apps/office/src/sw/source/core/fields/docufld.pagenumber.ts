/** @fileoverview Original page number field and expansion rules from docufld.cxx. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxNumberType } from "../../../../editeng/source/items/numitem";
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";
import type { SwRootFrame } from "../layout/newfrm";

/** Original internal page-number selection. */
export enum SwPageNumSubType {
  Random,
  Next,
  Previous,
}

/** Native PageNumber system field type. */
export class SwPageNumberFieldType {
  private numbering = SvxNumType.SVX_NUM_ARABIC;
  private virtual = false;

  /** Binds the system type to its text owner document. @param document - Original document. @returns The initialized SwPageNumberFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Reads the native field owner. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Resolves the original next/previous bounds and page-style numbering format. @param format - Field number style. @param offset - Relative offset. @param page - Current virtual number. @param maximum - Number of physical pages. @param userText - Continuation text. @returns Presentation. */
  public Expand(
    format: SvxNumType,
    offset: number,
    page: number,
    maximum: number,
    userText: string,
  ): string {
    const numbering = format === SvxNumType.SVX_NUM_PAGEDESC ? this.numbering : format;
    const number = page + offset;
    if (
      number < 0 ||
      numbering === SvxNumType.SVX_NUM_NUMBER_NONE ||
      (!this.virtual && number > maximum)
    )
      return "";
    if (numbering === SvxNumType.SVX_NUM_CHAR_SPECIAL) return userText;
    return new SvxNumberType(numbering).GetNumStr(number);
  }

  /** Updates the system defaults and original field cache from the real layout frame. @param layout - Formatted root. @returns Nothing. */
  public UpdateFields(layout: SwRootFrame): void {
    const pages = layout.GetFormattedPages();
    const virtual = pages.some(
      /** A real restart makes automatic page bounds virtual. @param page - Formatted physical page. @returns Whether it starts a virtual range. */
      (page) => page.numberRestart === true,
    );
    for (const node of this.document.GetNodes().entries()) {
      const paragraph = node.GetTextNode();
      const fields = paragraph?.GetpSwpHints()?.GetPageNumberFields();
      if (!paragraph || !fields?.length) continue;
      for (const hint of fields) {
        const page = pages[layout.FindPageIndexAt(paragraph, hint.GetStart())];
        if (!page) continue;
        const field = hint.GetAttr().GetField();
        if (field.GetFormat() === SvxNumType.SVX_NUM_PAGEDESC) {
          this.numbering =
            this.document.FindPageDesc(page.descriptor.name)?.GetNumType().GetNumberingType() ??
            SvxNumType.SVX_NUM_ARABIC;
        }
        this.virtual = virtual;
        field.ChangeExpansion(page.number, pages.length);
      }
    }
  }
}

/** Original owned PageNumber field, including the formatted occurrence cache. */
export class SwPageNumberField implements SwField<SwPageNumberField> {
  private page = 0;
  private maximum = 0;

  /** Creates a page number or continuation field. @param type - Original field type. @param subtype - Current, next or previous page. @param format - Original numbering format. @param offset - Adjusted native offset. @param userText - Original continuation text. @param expansion - Formatted occurrence cache. @returns The initialized SwPageNumberField instance. */
  public constructor(
    private readonly type: SwPageNumberFieldType,
    private readonly subtype: SwPageNumSubType,
    private readonly format: SvxNumType,
    private readonly offset: number,
    private readonly userText: string,
    private expansion?: string,
  ) {}

  /** Borrows the native system field type. @returns Field type. */
  public GetTyp(): SwPageNumberFieldType {
    return this.type;
  }

  /** Borrows the original random, next or previous page selection. @returns Internal selection. */
  public GetSubType(): SwPageNumSubType {
    return this.subtype;
  }

  /** Reads the native numbering format. @returns Native style. */
  public GetFormat(): SvxNumType {
    return this.format;
  }

  /** Reads the original relative offset including base selection. @returns Signed offset. */
  public GetOffset(): number {
    return this.offset;
  }

  /** Reads the continuation's authored text. @returns User text. */
  public GetUserString(): string {
    return this.userText;
  }

  /** Reads the occurrence cache for Worker transfer. @returns Layout presentation if available. */
  public GetCachedExpansion(): string | undefined {
    return this.expansion;
  }

  /** Recalculates the original cached layout presentation. @param page - Virtual page. @param maximum - Physical page limit. @returns Nothing. */
  public ChangeExpansion(page: number, maximum: number): void {
    this.page = page;
    this.maximum = maximum;
    this.expansion = this.ExpandImpl();
  }

  /** Returns the layout occurrence or the native no-layout expansion. @returns Field presentation. */
  public Expand(): string {
    return this.expansion ?? this.ExpandImpl();
  }

  /** Tests the adjacent page first when an authored adjustment modifies next or previous. @returns Native expansion. */
  private ExpandImpl(): string {
    const adjacent =
      this.subtype === SwPageNumSubType.Next
        ? 1
        : this.subtype === SwPageNumSubType.Previous
          ? -1
          : 0;
    if (
      adjacent &&
      adjacent !== this.offset &&
      !this.type.Expand(this.format, adjacent, this.page, this.maximum, this.userText)
    )
      return "";
    return this.type.Expand(this.format, this.offset, this.page, this.maximum, this.userText);
  }

  /** Copies the field with its original formatted cache. @returns Independent field. */
  public Copy(): SwPageNumberField {
    return this.CopyToDocument(this.type.GetDoc());
  }

  /** Rebinds to the destination's native system field type. @param document - Destination owner. @returns Independent field. */
  public CopyToDocument(document: SwDoc): SwPageNumberField {
    return new SwPageNumberField(
      document.getIDocumentFieldsAccess().GetPageNumberFieldType(),
      this.subtype,
      this.format,
      this.offset,
      this.userText,
      this.expansion,
    );
  }

  /** Releases represented field-specific state. @returns Nothing. */
  public Dispose(): void {}
}
