/** @fileoverview Native ODF variable declarations and expression field import from txtvfldi.cxx. */
import { ARABIC } from "../../../offapi/com/sun/star/style/NumberingType";
import { Converter } from "../../../sax/source/tools/converter";
import { convertDurationToDays } from "../../../sax/source/tools/converter.duration";
import { Date } from "../../../tools/source/datetime/tdate";
import type {
  XMLDependentTextField,
  XMLTextContent,
  XMLTextFieldMasterFamily,
} from "../../inc/txtimp";
import { type FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { OdfCharacterProperties, OdfHyperlink } from "./txtparae";
import type { XMLCharacterStyleLayer, XMLTextImportHelper } from "./txtimp";
import { xmlTextString } from "./txtprmap";

/** Reads typed scalar field values in authored attribute order. @param attributes - Original field values. @returns Decoded type, string and numeric values. */
function readVariableValue(attributes: FastAttributeList): {
  isString: boolean;
  content: string;
  value: number;
} {
  let isString = false;
  let content = "";
  const value: [number] = [0];
  for (const [token, text] of attributes) {
    switch (token) {
      case XMLToken.TABLE_VALUE_TYPE:
      case XMLToken.TEXT_VALUE_TYPE:
        if (text === "string") isString = true;
        else if (["float", "date", "time", "percentage", "currency", "boolean"].includes(text))
          isString = false;
        break;
      case XMLToken.OFFICE_STRING_VALUE:
      case XMLToken.TEXT_STRING_VALUE:
        content = text;
        break;
      case XMLToken.OFFICE_BOOLEAN_VALUE:
        if (text === "true" || text === "false") value[0] = Number(text === "true");
        else Converter.convertDouble(value, text);
        break;
      case XMLToken.OFFICE_VALUE:
      case XMLToken.TEXT_VALUE:
        Converter.convertDouble(value, text);
        break;
      case XMLToken.OFFICE_TIME_VALUE:
      case XMLToken.TEXT_TIME_VALUE:
        convertDurationToDays(value, text);
        break;
      case XMLToken.OFFICE_DATE_VALUE:
      case XMLToken.TEXT_DATE_VALUE:
        SvXMLUnitConverter.convertDateTimeToDays(value, text, new Date(30, 12, 1899));
        break;
    }
  }
  return { isString, content, value: value[0] };
}

/** Imports native named field master declarations. */
export class XMLVariableDeclsImportContext extends SvXMLImportContext {
  /** Determines the native declaration family. @param token - Declaration container. @returns Family, if handled. */
  public static GetFamily(token: XMLToken): XMLTextFieldMasterFamily | undefined {
    switch (token) {
      case XMLToken.TEXT_SEQUENCE_DECLS:
        return "sequence";
      case XMLToken.TEXT_VARIABLE_DECLS:
        return "variable";
      case XMLToken.TEXT_USER_FIELD_DECLS:
        return "user";
    }
  }

  /** Binds the text importer and original declaration family. @param helper - Shared text import helper. @param family - Named field family. @returns The initialized XMLVariableDeclsImportContext instance. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly family: XMLTextFieldMasterFamily,
  ) {
    super();
  }

  /** Processes a sequence master declaration at its original XML position. @param element - Child element. @param attributes - Authored declaration values. @returns Inert handled child or no context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const family =
      element === XMLToken.TEXT_SEQUENCE_DECL
        ? "sequence"
        : element === XMLToken.TEXT_VARIABLE_DECL
          ? "variable"
          : element === XMLToken.TEXT_USER_FIELD_DECL
            ? "user"
            : undefined;
    if (family !== this.family) return null;
    const name = attributes.get(XMLToken.TEXT_NAME) ?? "";
    const master = this.helper.FindFieldMaster(name, this.family)?.properties;
    if (!master) return new SvXMLImportContext();
    if (family === "sequence") {
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
    } else {
      const { isString, content, value } = readVariableValue(attributes);
      if (family === "variable")
        this.helper.SetProperty(master, "SubType", isString ? 3 : 0, "sal_Int16");
      else {
        this.helper.SetProperty(master, "IsExpression", !isString);
        if (isString) this.helper.SetProperty(master, "Content", content);
        else this.helper.SetProperty(master, "Value", value, "double");
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

  /** Binds the field's original styled text point. @param helper - Text import helper. @param properties - Character formatting. @param hyperlink - Surrounding link. @param characterStyles - Named styles. @returns The initialized XMLSequenceFieldImportContext instance. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly characterStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Reads the sequence name, Writer formula QName and native numbering style. @param _element - Source token. @param attributes - Authored values. @returns Nothing. */
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

  /** Retains imported field text for the original formula and presentation fallbacks. @param text - Decoded content. @returns Nothing. */
  public override characters(text: string): void {
    this.text += text;
  }

  /** Inserts the dependent field before assigning its original properties. @returns Nothing. */
  public override endFastElement(): void {
    const master =
      this.name === null ? undefined : this.helper.FindFieldMaster(this.name, "sequence");
    if (!master) {
      this.helper.InsertString(this.text, this.properties, this.hyperlink, this.characterStyles);
      return;
    }
    const field = this.helper.InsertTextField(
      "SetExpression",
      /** Connects the native field master before attaching the field. @param field - Detached sequence field. @returns Nothing. */
      (field) => (field as XMLDependentTextField).attachTextFieldMaster(master.properties),
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
        this.helper.InsertSequenceID(this.referenceName, master.name, id[0]);
      } finally {
        value.dispose();
        key.dispose();
      }
    }
  }
}

/** Reads Writer expression, variable and user field occurrences. */
export class XMLVarFieldImportContext extends SvXMLImportContext {
  private name: string | null = null;
  private formula: string | undefined;
  private hint: string | null = null;
  private format: number | undefined;
  private isString = false;
  private value = 0;
  private showFormula = false;
  private visible = true;
  private content = "";

  /** Tests whether the paragraph factory dispatches this native variable field. @param token - Text field token. @returns Whether supported. */
  public static IsField(token: XMLToken): boolean {
    return (
      token === XMLToken.TEXT_VARIABLE_SET ||
      token === XMLToken.TEXT_VARIABLE_GET ||
      token === XMLToken.TEXT_VARIABLE_INPUT ||
      token === XMLToken.TEXT_USER_FIELD_GET ||
      token === XMLToken.TEXT_EXPRESSION
    );
  }

  /** Binds the original text point and field variant. @param token - Original field. @param helper - Native text importer. @param properties - Character properties. @param hyperlink - Link context. @param characterStyles - Native character style layers. @returns The initialized XMLVarFieldImportContext instance. */
  public constructor(
    private readonly token: XMLToken,
    private readonly helper: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly characterStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Reads the field's authored values. @param _element - Element token. @param attributes - Field attributes. @returns Nothing. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    this.name = attributes.get(XMLToken.TEXT_NAME);
    this.hint = attributes.get(XMLToken.TEXT_DESCRIPTION);
    const formula = attributes.get(XMLToken.TEXT_FORMULA);
    if (formula !== null) {
      const colon = formula.indexOf(":");
      if (colon >= 0 && attributes.getNamespaceUri(formula.slice(0, colon)) === ODF_NAMESPACES.ooow)
        this.formula = formula.slice(colon + 1);
    }
    const value = readVariableValue(attributes);
    this.isString = value.isString;
    this.value = value.value;
    const style = attributes.get(XMLToken.STYLE_DATA_STYLE_NAME);
    if (style !== null) this.format = this.helper.GetDataStyleKey(style)?.key;
    const display = attributes.get(XMLToken.TEXT_DISPLAY);
    this.showFormula = display === "formula";
    this.visible = display !== "none";
  }

  /** Retains authored presentation and original formula fallback. @param text - Text characters. @returns Nothing. */
  public override characters(text: string): void {
    this.content += text;
  }

  /** Attaches the original service and assigns its typed field properties in native order. @returns Nothing. */
  public override endFastElement(): void {
    const expression = this.token === XMLToken.TEXT_EXPRESSION;
    if (!expression && this.name === null) {
      this.helper.InsertString(this.content, this.properties, this.hyperlink, this.characterStyles);
      return;
    }
    if (expression || this.token === XMLToken.TEXT_VARIABLE_GET) {
      this.helper.InsertTextField(
        "GetExpression",
        this.PrepareGetField.bind(this),
        this.properties,
        this.hyperlink,
        this.characterStyles,
      );
      return;
    }
    const user = this.token === XMLToken.TEXT_USER_FIELD_GET;
    const master = this.helper.FindFieldMaster(this.name ?? "", user ? "user" : "variable");
    if (!master) {
      this.helper.InsertString(this.content, this.properties, this.hyperlink, this.characterStyles);
      return;
    }
    const field = this.helper.InsertTextField(
      user ? "User" : "SetExpression",
      /** Attaches the named field master before insertion. @param field - Native descriptor. @returns Nothing. */
      (field) => (field as XMLDependentTextField).attachTextFieldMaster(master.properties),
      this.properties,
      this.hyperlink,
      this.characterStyles,
    );
    if (!user) {
      if (this.token === XMLToken.TEXT_VARIABLE_INPUT) {
        this.helper.SetProperty(field, "Input", true);
        if (this.hint !== null) this.helper.SetProperty(field, "Hint", this.hint);
      }
      this.helper.SetProperty(field, "SubType", this.isString ? 3 : 0, "sal_Int16");
      this.helper.SetProperty(field, "Content", this.formula ?? this.content);
      this.helper.SetProperty(field, "CurrentPresentation", this.content);
    }
    if (this.format !== undefined)
      this.helper.SetProperty(field, "NumberFormat", this.format, "sal_Int32");
    this.helper.SetProperty(field, "IsVisible", this.visible);
    this.helper.SetProperty(
      field,
      "IsShowFormula",
      this.showFormula && (user || this.token === XMLToken.TEXT_VARIABLE_INPUT),
    );
  }

  /** Supplies the native descriptor before insertion. @param field - Detached GetExpression. @returns Nothing. */
  private PrepareGetField(field: XMLTextContent): void {
    const expression = this.token === XMLToken.TEXT_EXPRESSION;
    this.helper.SetProperty(
      field,
      "Content",
      expression ? (this.formula ?? this.content) : (this.name ?? ""),
    );
    this.helper.SetProperty(field, "SubType", expression ? 2 : this.isString ? 3 : 0, "sal_Int16");
    this.helper.SetProperty(field, "CurrentPresentation", this.content);
    this.helper.SetProperty(field, "IsShowFormula", this.showFormula);
    if (expression) this.helper.SetProperty(field, "Value", this.value, "double");
    if (this.format !== undefined)
      this.helper.SetProperty(field, "NumberFormat", this.format, "sal_Int32");
  }
}
