/** @fileoverview Owns independent supported list-level positioning and attribute import from pinned xmlnumi.cxx. */
import { FastAttributeList, SvXMLImport, SvXMLImportContext } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { importFamilyName } from "./XMLFontStylesContext";
import type {
  XMLListLevelImport,
  XMLListLevelImportProperties,
  XMLTextListRule,
} from "../text/txtparai";

/** Parses one label-alignment leaf into native MM100 numbering properties. */
export class SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl extends SvXMLImportContext {
  /** Retains native parent defaults and publishes only successfully parsed numeric fields. @param attributes - Source attributes. @param save - Parent property sink. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    save: (properties: XMLListLevelImportProperties) => void,
  ) {
    super();
    const converter = new SvXMLUnitConverter("mm100");
    /** Reads one bounded property, leaving parent state unchanged on failure. @param token - Attribute token. @param min - Native lower bound. @returns MM100 integer or null. */
    function measure(token: XMLToken, min: number): number | null {
      const value = attributes.get(token);
      return value === null ? null : converter.convertMeasureToCore(value, min, 32767);
    }
    const first = measure(XMLToken.FO_TEXT_INDENT, -32768);
    const indent = measure(XMLToken.FO_MARGIN_LEFT, -32768);
    const tab = measure(XMLToken.TEXT_LIST_TAB_STOP_POSITION, 0);
    const follow = attributes.get(XMLToken.TEXT_LABEL_FOLLOWED_BY);
    save({
      measureUnit: "mm100",
      values: {
        ...(first === null ? {} : { firstLineIndent: first }),
        ...(indent === null ? {} : { indentAt: indent }),
        labelFollowedBy: follow === "space" || follow === "nothing" ? follow : "listtab",
        ...(tab === null ? {} : { listTabPosition: tab }),
      },
    });
  }
}

/** Raw legacy MM100 measures retained until GetProperties assembly. */
interface LegacyListMeasures {
  readonly spaceBefore: number;
  readonly minLabelWidth: number;
  readonly minLabelDistance: number;
}

/** Owns declared level position defaults and both independent MM100 field groups. */
export class SvxXMLListLevelStyleContext_Impl extends SvXMLImportContext {
  private legacy: LegacyListMeasures = { spaceBefore: 0, minLabelWidth: 0, minLabelDistance: 0 };
  private properties: XMLListLevelImportProperties["values"] = {
    positionAndSpaceMode: "label-width-and-position",
    firstLineIndent: 0,
    indentAt: 0,
    labelFollowedBy: "listtab",
    listTabPosition: 0,
  };
  private readonly level: number;
  private readonly kind: "bullet" | "numbered";
  private cBullet: number;
  private readonly xmlImport: SvXMLImport;
  private readonly format: string;
  private readonly suffix: string;
  private readonly prefix: string;
  private readonly startWith: number;
  private readonly parentNumbering: number;
  private listFormat: string | undefined;
  private bulletFontName = "";
  /** Retains native declaration defaults before property children. @param element - Level family. @param attributes - Declaration fields. @param fontDeclarations - Borrowed existing font declarations. @returns Context. */
  public constructor(
    element: XMLToken,
    attributes: FastAttributeList,
    private readonly fontDeclarations?: Pick<XMLListStyleImportTarget, "getFontFace">,
  ) {
    super();
    this.xmlImport = fontDeclarations instanceof SvXMLImport ? fontDeclarations : new SvXMLImport();
    this.kind = element === XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET ? "bullet" : "numbered";
    attributes.assertOnly(
      [
        XMLToken.TEXT_LEVEL,
        XMLToken.TEXT_BULLET_CHAR,
        XMLToken.STYLE_NUM_FORMAT,
        XMLToken.STYLE_NUM_SUFFIX,
        XMLToken.STYLE_NUM_PREFIX,
        XMLToken.TEXT_START_VALUE,
        XMLToken.TEXT_DISPLAY_LEVELS,
        XMLToken.STYLE_NUM_LIST_FORMAT,
        XMLToken.LOEXT_NUM_LIST_FORMAT,
      ],
      "list level",
    );
    const parsed = attributes.getAsInteger(XMLToken.TEXT_LEVEL);
    this.level = parsed === null ? -1 : parsed >= 1 ? parsed - 1 : 0;
    this.cBullet = attributes.get(XMLToken.TEXT_BULLET_CHAR)?.codePointAt(0) ?? 0;
    this.format = attributes.get(XMLToken.STYLE_NUM_FORMAT) ?? "1";
    this.suffix = attributes.get(XMLToken.STYLE_NUM_SUFFIX) ?? "";
    this.prefix = attributes.get(XMLToken.STYLE_NUM_PREFIX) ?? "";
    const start = attributes.getAsInteger(XMLToken.TEXT_START_VALUE) ?? 1;
    const display = attributes.getAsInteger(XMLToken.TEXT_DISPLAY_LEVELS) ?? 1;
    this.startWith = this.kind === "bullet" ? 1 : start < 0 ? 1 : Math.min(start, 32767);
    this.parentNumbering = this.kind === "bullet" ? 1 : Math.max(1, Math.min(display, 32767));
    for (const [token, value] of attributes)
      if (token === XMLToken.STYLE_NUM_LIST_FORMAT || token === XMLToken.LOEXT_NUM_LIST_FORMAT)
        this.listFormat = value;
  }

  /** Returns the native zero-based index, retaining -1 for an absent attribute. @returns Level. */
  public GetLevel(): number {
    return this.level;
  }

  /** Creates a properties context with independent legacy and modern fields. @param element - Child token. @param attributes - Properties. @returns Context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element !== XMLToken.STYLE_LIST_LEVEL_PROPERTIES &&
      element !== XMLToken.STYLE_TEXT_PROPERTIES
    )
      return null;
    return new SvxXMLListLevelStyleAttrContext_Impl(
      attributes,
      /** Retains the selected fields without changing the other group. @param values - Property delta. @returns Nothing. */
      (values) => {
        this.properties = { ...this.properties, ...values };
      },
      /** Retains only successful legacy updates. @param values - Legacy delta. @returns Nothing. */
      (values) => {
        this.legacy = { ...this.legacy, ...values };
      },
      this.fontDeclarations,
      /** Updates only successfully resolved native font family values. @param family - Model family. @returns Nothing. */
      (family) => {
        this.bulletFontName = family;
      },
    );
  }
  /** Assembles the supported native property sequence only when the owning rule reads it. @returns Declaration and both MM100 geometry groups. */
  public GetProperties(): XMLListLevelImport {
    const type = {
      value: this.kind === "bullet" ? 6 : 4,
    };
    if (this.kind === "numbered")
      new SvXMLUnitConverter("mm100").convertNumFormat(type, this.format, true);
    if (this.listFormat === undefined) {
      this.listFormat = this.prefix;
      const display = Math.min(this.parentNumbering, this.level + 1);
      for (let index = 1; index <= display; index++) {
        this.listFormat += `%${this.level - display + index + 1}%`;
        if (index !== display) this.listFormat += ".";
      }
      this.listFormat += this.suffix;
    }
    const distance = this.legacy.minLabelDistance;
    let bulletFontName = this.bulletFontName;
    if (this.kind === "bullet" && bulletFontName !== "") {
      // The source mutates cBullet on each publication while changing only
      // the published descriptor family, not the stored legacy font name.
      if (/^starbats$/i.test(bulletFontName)) {
        this.cBullet = this.xmlImport.ConvStarBatsCharToStarSymbol(this.cBullet);
        bulletFontName = "StarSymbol";
      } else if (/^starmath$/i.test(bulletFontName)) {
        this.cBullet = this.xmlImport.ConvStarMathCharToStarSymbol(this.cBullet);
        bulletFontName = "StarSymbol";
      }
    }
    return {
      level: this.level,
      kind: this.kind,
      numberingType: type.value,
      ...(this.kind === "bullet"
        ? { bulletChar: String.fromCodePoint(this.cBullet), bulletFont: { name: bulletFontName } }
        : {}),
      prefix: this.prefix,
      suffix: this.suffix,
      ...(this.kind === "bullet"
        ? {}
        : { startWith: this.startWith, parentNumbering: this.parentNumbering }),
      listFormat: this.listFormat,
      position: {
        measureUnit: "mm100",
        values: {
          ...this.properties,
          absLSpace: this.legacy.spaceBefore + this.legacy.minLabelWidth,
          firstLineOffset: 0 - this.legacy.minLabelWidth,
          charTextDistance: distance >= 32768 ? distance - 65536 : distance,
        },
      },
    };
  }
}

/** Imports native legacy spacing and selects mode only from its explicit attribute. */
class SvxXMLListLevelStyleAttrContext_Impl extends SvXMLImportContext {
  /** Parses native MM100 geometry and represented font attributes. @param attributes - List or text properties. @param save - Geometry sink. @param saveLegacy - Legacy measure sink. @param fontDeclarations - Borrowed declarations. @param saveFont - Resolved family sink. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    private readonly save: (values: XMLListLevelImportProperties["values"]) => void,
    saveLegacy: (values: Partial<LegacyListMeasures>) => void,
    fontDeclarations?: Pick<XMLListStyleImportTarget, "getFontFace">,
    saveFont?: (family: string) => void,
  ) {
    super();
    const converter = new SvXMLUnitConverter("mm100");
    /** Leaves the owning level unchanged when a measure is absent or fails conversion. @param token - Attribute. @param min - Lower bound. @param max - Upper bound. @returns MM100 value or null. */
    function measure(token: XMLToken, min: number, max: number): number | null {
      const value = attributes.get(token);
      return value === null ? null : converter.convertMeasureToCore(value, min, max);
    }
    const before = measure(XMLToken.TEXT_SPACE_BEFORE, -32768, 32767);
    const width = measure(XMLToken.TEXT_MIN_LABEL_WIDTH, 0, 32767);
    const distance = measure(XMLToken.TEXT_MIN_LABEL_DISTANCE, 0, 65535);
    const mode = attributes.get(XMLToken.TEXT_LIST_LEVEL_POSITION_AND_SPACE_MODE);
    saveLegacy({
      ...(before === null ? {} : { spaceBefore: before }),
      ...(width === null ? {} : { minLabelWidth: width }),
      ...(distance === null ? {} : { minLabelDistance: distance }),
    });
    save({
      ...(mode === null
        ? {}
        : {
            positionAndSpaceMode:
              mode === "label-alignment" ? "label-alignment" : "label-width-and-position",
          }),
    });
    const faceName = attributes.get(XMLToken.STYLE_FONT_NAME) ?? "";
    if (faceName !== "") {
      const family = fontDeclarations?.getFontFace?.(faceName);
      if (family !== undefined) saveFont?.(family);
    }
    // Native direct family processing follows and overrides resolved declarations.
    const familyName = attributes.get(XMLToken.FO_FONT_FAMILY) ?? "";
    if (familyName !== "") saveFont?.(importFamilyName(familyName));
  }
  /** Parses the alignment leaf independently from the selected mode. @param element - Child token. @param attributes - Alignment attributes. @returns Leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_LIST_LEVEL_LABEL_ALIGNMENT) return null;
    return new SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl(
      attributes,
      /** Retains modern fields without selecting a mode. @param properties - Alignment fields. @returns Nothing. */
      (properties) => this.save(properties.values),
    );
  }
}

/** Model-facing numbering publication port used by the source-owned list context. */
export interface XMLListStyleImportTarget {
  registerListStyle(styleName: string, rule: XMLTextListRule, automatic?: boolean): void;
  /** Resolves an existing declaration; missing faces retain the level's prior font. */
  getFontFace?(name: string): string | undefined;
}

/** Owns native list identity and the source-ordered level context references. */
export class SvxXMLListStyleContext extends SvXMLImportContext {
  private readonly levelStyles: SvxXMLListLevelStyleContext_Impl[] = [];
  private readonly name: string;
  private readonly ruleName: string;
  /** Reads identity while retaining declarations in their own contexts. @param target - Writer numbering consumer. @param attributes - List identity attributes. @returns Context.  @param automatic - Native operation input. */
  public constructor(
    private readonly target: XMLListStyleImportTarget,
    attributes: FastAttributeList,
    private readonly automatic = false,
  ) {
    super();
    attributes.assertOnly([XMLToken.STYLE_NAME, XMLToken.STYLE_DISPLAY_NAME], "style property");
    this.name = attributes.require(XMLToken.STYLE_NAME, "list style name");
    this.ruleName = attributes.get(XMLToken.STYLE_DISPLAY_NAME) ?? this.name;
  }

  /** Retains each native supported leaf reference in creation order. @param element - Child token. @param attributes - Declaration attributes. @returns Level context or ignored subtree. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element !== XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER &&
      element !== XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET
    )
      return null;
    const context = new SvxXMLListLevelStyleContext_Impl(element, attributes, this.target);
    this.levelStyles.push(context);
    return context;
  }

  /** Ignores unknown children while keeping unsupported native image numbering explicit. @param namespaceURI - Namespace. @param localName - Child name. @returns Null for native unknown-child skipping. */
  public override createUnknownChildContext(
    namespaceURI: string,
    localName: string,
  ): SvXMLImportContext | null {
    if (namespaceURI === ODF_NAMESPACES.text && localName === "list-level-style-image")
      throw new Error("Unsupported ODF list level style: list-level-style-image");
    return null;
  }

  /** Publishes only the valid indices, reading properties from their retained native leaves. @returns Nothing. */
  public override endFastElement(): void {
    const levels: XMLListLevelImport[] = [];
    for (const context of this.levelStyles) {
      const level = context.GetLevel();
      if (level >= 0 && level < 10) levels.push(context.GetProperties());
    }
    this.target.registerListStyle(
      this.name,
      { name: this.ruleName, levelCount: 10, levels },
      this.automatic,
    );
  }
}

import type { XMLNumberingRules } from "../../inc/txtimp";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { xmlTextString } from "../text/txtprmap";
/** Original generated PropertyValue compound sequence; layout belongs to shared CPPU. */
const ListPropertySequence = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Fills the native rule service with typed level property sequences, retaining earlier replacements after UNO failure. @param rules - Actual XIndexReplace service. @param declaration - Parsed list declaration. @returns Nothing. */
export function FillUnoNumRule(rules: XMLNumberingRules, declaration: XMLTextListRule): void {
  try {
    for (const level of declaration.levels) {
      if (level.level < 0 || level.level >= rules.getCount()) continue;
      const properties: PropertyValue[] = [];
      /** Copies one native Any property into the generated sequence values. @param name - API name. @param value - Owned temporary value. @returns Nothing. */
      function add(name: string, value: Any): void {
        const key = xmlTextString(name);
        try {
          properties.push(new PropertyValue(key, -1, value, 0));
        } finally {
          key.dispose();
          value.dispose();
        }
      }
      /** Creates a native string property. @param name - API name. @param text - Parsed text. @returns Nothing. */
      function addString(name: string, text: string): void {
        const value = xmlTextString(text);
        try {
          add(name, new Any(value.getDataAddress(), "OUString"));
        } finally {
          value.dispose();
        }
      }
      add(
        "NumberingType",
        new Any([level.numberingType ?? (level.kind === "bullet" ? 6 : 4)], "sal_Int16"),
      );
      addString("Prefix", level.prefix);
      addString("Suffix", level.suffix);
      addString("ListFormat", level.listFormat);
      if (level.startWith !== undefined)
        add("StartWith", new Any([(level.startWith << 16) >> 16], "sal_Int16"));
      if (level.parentNumbering !== undefined)
        add("ParentNumbering", new Any([level.parentNumbering], "sal_Int16"));
      if (level.bulletChar !== undefined) addString("BulletChar", level.bulletChar);
      if (level.bulletFont !== undefined) addString("BulletFontName", level.bulletFont.name);
      const position = level.position.values;
      add(
        "PositionAndSpaceMode",
        new Any([position.positionAndSpaceMode === "label-alignment" ? 1 : 0], "sal_Int16"),
      );
      for (const [field, name] of [
        ["absLSpace", "LeftMargin"],
        ["firstLineOffset", "FirstLineOffset"],
        ["charTextDistance", "SymbolTextDistance"],
        ["firstLineIndent", "FirstLineIndent"],
        ["indentAt", "IndentAt"],
        ["listTabPosition", "ListtabStopPosition"],
      ] as const)
        if (position[field] !== undefined) add(name, new Any([position[field]], "sal_Int32"));
      if (position.labelFollowedBy !== undefined)
        add(
          "LabelFollowedBy",
          new Any([["listtab", "space", "nothing"].indexOf(position.labelFollowedBy)], "sal_Int16"),
        );
      const sequence = new ListPropertySequence(
        {
          get: /** Executes this bounded native operation. @param offset - Native operation input. @returns Native operation result. */ (
            offset: number,
          ) => properties[offset / 48],
        },
        properties.length,
      );
      const value = new Any(sequence.getAddress(), ["Sequence", propertyType]);
      try {
        rules.replaceByIndex(level.level, value);
      } finally {
        value.dispose();
        sequence.dispose();
        for (const property of properties) {
          property.Name.dispose();
          property.Value.dispose();
        }
      }
    }
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    error.dispose();
  }
}
