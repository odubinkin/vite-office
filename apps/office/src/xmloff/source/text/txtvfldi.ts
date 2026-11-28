/** @fileoverview Native ODF Writer sequence declarations from txtvfldi.cxx. */
import { ARABIC } from "../../../offapi/com/sun/star/style/NumberingType";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLDependentTextField, XMLTextModel } from "../../inc/txtimp";
import { type FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { OdfCharacterProperties, OdfHyperlink } from "./txtparae";
import type { XMLCharacterStyleLayer, XMLTextImportHelper } from "./txtimp";
import { xmlTextString } from "./txtprmap";

/** Imports native sequence master declarations. */
export class XMLVariableDeclsImportContext extends SvXMLImportContext {
  /** Binds the text importer and original model. @param helper - Shared text import helper. @param model - Text field master supplier. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly model: XMLTextModel,
  ) {
    super();
  }

  /** Processes a sequence master declaration at its original XML position. @param element - Child element. @param attributes - Authored declaration values. @returns Inert handled child or no context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.TEXT_SEQUENCE_DECL) return null;
    const name = attributes.get(XMLToken.TEXT_NAME) ?? "";
    const master = this.model.getSequenceFieldMaster?.(name);
    if (master) {
      const rawLevel = attributes.get(XMLToken.TEXT_DISPLAY_OUTLINE_LEVEL);
      const parsed: [number] = [0];
      const level =
        rawLevel !== null &&
        Converter.convertNumber(parsed, rawLevel, 0, this.helper.GetIndexOutlineLevelCount())
          ? parsed[0] - 1
          : -1;
      this.helper.SetProperty(master, "ChapterNumberingLevel", level, "sal_Int8");
      if (level >= 0) {
        const character = attributes.get(XMLToken.TEXT_SEPARATION_CHARACTER);
        const separator =
          character === null ? "." : String.fromCharCode((character.charCodeAt(0) << 24) >> 24);
        this.helper.SetProperty(master, "NumberingSeparator", separator);
      }
    }
    return new SvXMLImportContext();
  }
}

/** Reads the Writer sequence field and attaches its named master. */
export class XMLSequenceFieldImportContext extends SvXMLImportContext {
  private name: string | null = null;
  private referenceName: string | null = null;
  private formula: string | undefined;
  private numbering: number = ARABIC;
  private text = "";

  /** Binds the field's original styled text point. @param helper - Text import helper. @param properties - Character formatting. @param hyperlink - Surrounding link. @param characterStyles - Named styles. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly characterStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Reads the sequence name, Writer formula QName and native numbering style. @param _element - Source token. @param attributes - Authored values. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    this.name = attributes.get(XMLToken.TEXT_NAME);
    this.referenceName = attributes.get(XMLToken.TEXT_REF_NAME);
    const formula = attributes.get(XMLToken.TEXT_FORMULA);
    if (formula !== null) {
      const colon = formula.indexOf(":");
      if (colon >= 0 && attributes.getNamespaceUri(formula.slice(0, colon)) === ODF_NAMESPACES.ooow)
        this.formula = formula.slice(colon + 1);
    }
    const type = { value: ARABIC as number };
    new SvXMLUnitConverter("mm100").convertNumFormat(
      type,
      attributes.get(XMLToken.STYLE_NUM_FORMAT) ?? "1",
      attributes.get(XMLToken.STYLE_NUM_LETTER_SYNC) ?? "false",
      false,
    );
    this.numbering = type.value;
  }

  /** Retains imported field text for the original formula and presentation fallbacks. @param text - Decoded content. */
  public override characters(text: string): void {
    this.text += text;
  }

  /** Inserts the dependent field before assigning its original properties. */
  public override endFastElement(): void {
    const master = this.name === null ? undefined : this.helper.FindSequenceFieldMaster(this.name);
    if (!master) {
      this.helper.InsertString(this.text, this.properties, this.hyperlink, this.characterStyles);
      return;
    }
    const field = this.helper.InsertTextField(
      "SetExpression",
      /** Connects the native field master before attaching the field. @param field - Detached sequence field. */
      (field) => (field as XMLDependentTextField).attachTextFieldMaster(master),
      this.properties,
      this.hyperlink,
      this.characterStyles,
    );
    this.helper.SetProperty(field, "Content", this.formula ?? this.text);
    this.helper.SetProperty(field, "IsShowFormula", false);
    this.helper.SetProperty(field, "CurrentPresentation", this.text);
    this.helper.SetProperty(field, "NumberingType", this.numbering, "sal_Int16");
    if (this.name !== null && this.referenceName !== null) {
      const key = xmlTextString("SequenceValue");
      const value = (field as XMLDependentTextField).getPropertyValue(key);
      try {
        const id: [number] = [0];
        value.extract(id, "sal_Int16");
        this.helper.InsertSequenceID(this.referenceName, this.name, id[0]);
      } finally {
        value.dispose();
        key.dispose();
      }
    }
  }
}
