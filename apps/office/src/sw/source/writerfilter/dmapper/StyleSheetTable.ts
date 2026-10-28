/** @fileoverview Consumed native StyleSheetTable entry identity, built-in name conversion, lookup and typed document defaults; native apply/parse handlers extend the same owner. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyMap, StyleSheetPropertyMap, GrabBagType } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import { TblStyleType } from "./TblStylePrHandler";

/** Existing generated PropertyValue sequence specialization; native struct stride is48. */
const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
const propertySequenceType = ["Sequence", cppu_detail_getUnoType_PropertyValue] as const;

/** Original built-in style names copied without case normalization or locally assigned aliases. */
const StyleNameMap = new Map<string, string>([
  ["Normal", "Standard"],
  ["heading 1", "Heading 1"],
  ["heading 2", "Heading 2"],
  ["heading 3", "Heading 3"],
  ["heading 4", "Heading 4"],
  ["heading 5", "Heading 5"],
  ["heading 6", "Heading 6"],
  ["heading 7", "Heading 7"],
  ["heading 8", "Heading 8"],
  ["heading 9", "Heading 9"],
  ["Heading 1", "Heading 1"],
  ["Heading 2", "Heading 2"],
  ["Heading 3", "Heading 3"],
  ["Heading 4", "Heading 4"],
  ["Heading 5", "Heading 5"],
  ["Heading 6", "Heading 6"],
  ["Heading 7", "Heading 7"],
  ["Heading 8", "Heading 8"],
  ["Heading 9", "Heading 9"],
  ["Index 1", "Index 1"],
  ["Index 2", "Index 2"],
  ["Index 3", "Index 3"],
  ["Index 4", ""],
  ["Index 5", ""],
  ["Index 6", ""],
  ["Index 7", ""],
  ["Index 8", ""],
  ["Index 9", ""],
  ["index 1", "Index 1"],
  ["index 2", "Index 2"],
  ["index 3", "Index 3"],
  ["index 4", ""],
  ["index 5", ""],
  ["index 6", ""],
  ["index 7", ""],
  ["index 8", ""],
  ["index 9", ""],
  ["TOC 1", "Contents 1"],
  ["TOC 2", "Contents 2"],
  ["TOC 3", "Contents 3"],
  ["TOC 4", "Contents 4"],
  ["TOC 5", "Contents 5"],
  ["TOC 6", "Contents 6"],
  ["TOC 7", "Contents 7"],
  ["TOC 8", "Contents 8"],
  ["TOC 9", "Contents 9"],
  ["toc 1", "Contents 1"],
  ["toc 2", "Contents 2"],
  ["toc 3", "Contents 3"],
  ["toc 4", "Contents 4"],
  ["toc 5", "Contents 5"],
  ["toc 6", "Contents 6"],
  ["toc 7", "Contents 7"],
  ["toc 8", "Contents 8"],
  ["toc 9", "Contents 9"],
  ["TOC1", "Contents 1"],
  ["TOC2", "Contents 2"],
  ["TOC3", "Contents 3"],
  ["TOC4", "Contents 4"],
  ["TOC5", "Contents 5"],
  ["TOC6", "Contents 6"],
  ["TOC7", "Contents 7"],
  ["TOC8", "Contents 8"],
  ["TOC9", "Contents 9"],
  ["Normal Indent", ""],
  ["footnote text", "Footnote"],
  ["Footnote Text", "Footnote"],
  ["Annotation Text", "Marginalia"],
  ["annotation text", "Marginalia"],
  ["Header", "Header"],
  ["header", "Header"],
  ["Footer", "Footer"],
  ["footer", "Footer"],
  ["Index Heading", "Index Heading"],
  ["index heading", "Index Heading"],
  ["Caption", "Caption"],
  ["caption", "Caption"],
  ["table of figures", "Figure Index 1"],
  ["Table of Figures", "Figure Index 1"],
  ["Envelope Address", "Addressee"],
  ["envelope address", "Addressee"],
  ["Envelope Return", "Sender"],
  ["envelope return", "Sender"],
  ["footnote reference", "Footnote Symbol"],
  ["Footnote Reference", "Footnote Symbol"],
  ["Annotation Reference", ""],
  ["annotation reference", ""],
  ["Line Number", "Line numbering"],
  ["line number", "Line numbering"],
  ["Page Number", "Page Number"],
  ["page number", "Page Number"],
  ["PageNumber", "Page Number"],
  ["endnote reference", "Endnote Symbol"],
  ["Endnote Reference", "Endnote Symbol"],
  ["endnote text", "Endnote"],
  ["Endnote Text", "Endnote"],
  ["Table of Authorities", "Bibliography Heading"],
  ["table of authorities", "Bibliography Heading"],
  ["macro", ""],
  ["TOA Heading", ""],
  ["toa heading", ""],
  ["List", "List"],
  ["List 2", ""],
  ["List 3", ""],
  ["List 4", ""],
  ["List 5", ""],
  ["List Bullet", "List 1"],
  ["List Bullet 2", "List 2"],
  ["List Bullet 3", "List 3"],
  ["List Bullet 4", "List 4"],
  ["List Bullet 5", "List 5"],
  ["List Number", "Numbering 1"],
  ["List Number 2", "Numbering 2"],
  ["List Number 3", "Numbering 3"],
  ["List Number 4", "Numbering 4"],
  ["List Number 5", "Numbering 5"],
  ["Title", "Title"],
  ["Closing", "Appendix"],
  ["Signature", "Signature"],
  ["Default Paragraph Font", ""],
  ["DefaultParagraphFont", ""],
  ["Body Text", "Text body"],
  ["BodyText", "Text body"],
  ["BodyTextIndentItalic", ""],
  ["Body Text Indent", "Text body indent"],
  ["BodyTextIndent", "Text body indent"],
  ["BodyTextIndent2", ""],
  ["List Continue", "List 1 Cont."],
  ["List Continue 2", "List 2 Cont."],
  ["List Continue 3", "List 3 Cont."],
  ["List Continue 4", "List 4 Cont."],
  ["List Continue 5", "List 5 Cont."],
  ["Message Header", ""],
  ["Subtitle", "Subtitle"],
  ["Salutation", "Salutation"],
  ["Date", ""],
  ["Body Text First Indent", "First line indent"],
  ["Body Text First Indent 2", ""],
  ["Note Heading", ""],
  ["Body Text 2", ""],
  ["Body Text 3", ""],
  ["Body Text Indent 2", ""],
  ["Body Text Indent 3", ""],
  ["Block Text", ""],
  ["Hyperlink", "Internet link"],
  ["FollowedHyperlink", "Visited Internet Link"],
  ["Strong", "Strong Emphasis"],
  ["Emphasis", "Emphasis"],
  ["Document Map", ""],
  ["DocumentMap", ""],
  ["Plain Text", ""],
  ["E-mail Signature", ""],
  ["HTML Top of Form", ""],
  ["HTML Bottom of Form", ""],
  ["Normal (Web)", ""],
  ["HTML Acronym", ""],
  ["HTML Address", ""],
  ["HTML Cite", ""],
  ["HTML Code", ""],
  ["HTML Definition", ""],
  ["HTML Keyboard", ""],
  ["HTML Preformatted", ""],
  ["HTML Sample", ""],
  ["HTML Typewriter", ""],
  ["HTML Variable", ""],
  ["", ""],
  ["", ""],
  ["", ""],
  ["Normal Table", ""],
  ["annotation subject", ""],
  ["No List", "No List"],
  ["NoList", "No List"],
  ["Outline List 1", ""],
  ["Outline List 2", ""],
  ["Outline List 3", ""],
  ["Table Simple 1", ""],
  ["Table Simple 2", ""],
  ["Table Simple 3", ""],
  ["Table Classic 1", ""],
  ["Table Classic 2", ""],
  ["Table Classic 3", ""],
  ["Table Classic 4", ""],
  ["Table Colorful 1", ""],
  ["Table Colorful 2", ""],
  ["Table Colorful 3", ""],
  ["Table Columns 1", ""],
  ["Table Columns 2", ""],
  ["Table Columns 3", ""],
  ["Table Columns 4", ""],
  ["Table Columns 5", ""],
  ["Table Grid 1", ""],
  ["Table Grid 2", ""],
  ["Table Grid 3", ""],
  ["Table Grid 4", ""],
  ["Table Grid 5", ""],
  ["Table Grid 6", ""],
  ["Table Grid 7", ""],
  ["Table Grid 8", ""],
  ["Table List 1", ""],
  ["Table List 2", ""],
  ["Table List 3", ""],
  ["Table List 4", ""],
  ["Table List 5", ""],
  ["Table List 6", ""],
  ["Table List 7", ""],
  ["Table List 8", ""],
  ["Table 3D effects 1", ""],
  ["Table 3D effects 2", ""],
  ["Table 3D effects 3", ""],
  ["Table Contemporary", ""],
  ["Table Elegant", ""],
  ["Table Professional", ""],
  ["Table Subtle 1", ""],
  ["Table Subtle 2", ""],
  ["Table Web 1", ""],
  ["Table Web 2", ""],
  ["Table Web 3", ""],
  ["Balloon Text", ""],
  ["Table Grid", ""],
  ["Table Theme", ""],
  ["Placeholder Text", ""],
  ["No Spacing", ""],
  ["Light Shading", ""],
  ["Light List", ""],
  ["Light Grid", ""],
  ["Medium Shading 1", ""],
  ["Medium Shading 2", ""],
  ["Medium List 1", ""],
  ["Medium List 2", ""],
  ["Medium Grid 1", ""],
  ["Medium Grid 2", ""],
  ["Medium Grid 3", ""],
  ["Dark List", ""],
  ["Colorful Shading", ""],
  ["Colorful List", ""],
  ["Colorful Grid", ""],
  ["Light Shading Accent 1", ""],
  ["Light List Accent 1", ""],
  ["Light Grid Accent 1", ""],
  ["Medium Shading 1 Accent 1", ""],
  ["Medium Shading 2 Accent 1", ""],
  ["Medium List 1 Accent 1", ""],
  ["Revision", ""],
  ["List Paragraph", ""],
  ["Quote", ""],
  ["Intense Quote", ""],
  ["Medium List 2 Accent 1", ""],
  ["Medium Grid 1 Accent 1", ""],
  ["Medium Grid 2 Accent 1", ""],
  ["Medium Grid 3 Accent 1", ""],
  ["Dark List Accent 1", ""],
  ["Colorful Shading Accent 1", ""],
  ["Colorful List Accent 1", ""],
  ["Colorful Grid Accent 1", ""],
  ["Light Shading Accent 2", ""],
  ["Light List Accent 2", ""],
  ["Light Grid Accent 2", ""],
  ["Medium Shading 1 Accent 2", ""],
  ["Medium Shading 2 Accent 2", ""],
  ["Medium List 1 Accent 2", ""],
  ["Medium List 2 Accent 2", ""],
  ["Medium Grid 1 Accent 2", ""],
  ["Medium Grid 2 Accent 2", ""],
  ["Medium Grid 3 Accent 2", ""],
  ["Dark List Accent 2", ""],
  ["Colorful Shading Accent 2", ""],
  ["Colorful List Accent 2", ""],
  ["Colorful Grid Accent 2", ""],
  ["Light Shading Accent 3", ""],
  ["Light List Accent 3", ""],
  ["Light Grid Accent 3", ""],
  ["Medium Shading 1 Accent 3", ""],
  ["Medium Shading 2 Accent 3", ""],
  ["Medium List 1 Accent 3", ""],
  ["Medium List 2 Accent 3", ""],
  ["Medium Grid 1 Accent 3", ""],
  ["Medium Grid 2 Accent 3", ""],
  ["Medium Grid 3 Accent 3", ""],
  ["Dark List Accent 3", ""],
  ["Colorful Shading Accent 3", ""],
  ["Colorful List Accent 3", ""],
  ["Colorful Grid Accent 3", ""],
  ["Light Shading Accent 4", ""],
  ["Light List Accent 4", ""],
  ["Light Grid Accent 4", ""],
  ["Medium Shading 1 Accent 4", ""],
  ["Medium Shading 2 Accent 4", ""],
  ["Medium List 1 Accent 4", ""],
  ["Medium List 2 Accent 4", ""],
  ["Medium Grid 1 Accent 4", ""],
  ["Medium Grid 2 Accent 4", ""],
  ["Medium Grid 3 Accent 4", ""],
  ["Dark List Accent 4", ""],
  ["Colorful Shading Accent 4", ""],
  ["Colorful List Accent 4", ""],
  ["Colorful Grid Accent 4", ""],
  ["Light Shading Accent 5", ""],
  ["Light List Accent 5", ""],
  ["Light Grid Accent 5", ""],
  ["Medium Shading 1 Accent 5", ""],
  ["Medium Shading 2 Accent 5", ""],
  ["Medium List 1 Accent 5", ""],
  ["Medium List 2 Accent 5", ""],
  ["Medium Grid 1 Accent 5", ""],
  ["Medium Grid 2 Accent 5", ""],
  ["Medium Grid 3 Accent 5", ""],
  ["Dark List Accent 5", ""],
  ["Colorful Shading Accent 5", ""],
  ["Colorful List Accent 5", ""],
  ["Colorful Grid Accent 5", ""],
  ["Light Shading Accent 6", ""],
  ["Light List Accent 6", ""],
  ["Light Grid Accent 6", ""],
  ["Medium Shading 1 Accent 6", ""],
  ["Medium Shading 2 Accent 6", ""],
  ["Medium List 1 Accent 6", ""],
  ["Medium List 2 Accent 6", ""],
  ["Medium Grid 1 Accent 6", ""],
  ["Medium Grid 2 Accent 6", ""],
  ["Medium Grid 3 Accent 6", ""],
  ["Dark List Accent 6", ""],
  ["Colorful Shading Accent 6", ""],
  ["Colorful List Accent 6", ""],
  ["Colorful Grid Accent 6", ""],
  ["Subtle Emphasis", ""],
  ["Intense Emphasis", ""],
  ["Subtle Reference", ""],
  ["Intense Reference", ""],
  ["Book Title", ""],
  ["Bibliography", ""],
  ["TOC Heading", "Contents Heading"],
  ["TOCHeading", "Contents Heading"],
  ["Plain Table 1", ""],
  ["Plain Table 2", ""],
  ["Plain Table 3", ""],
  ["Plain Table 4", ""],
  ["Plain Table 5", ""],
  ["Grid Table Light", ""],
  ["Grid Table 1 Light", ""],
  ["Grid Table 2", ""],
  ["Grid Table 3", ""],
  ["Grid Table 4", ""],
  ["Grid Table 5 Dark", ""],
  ["Grid Table 6 Colorful", ""],
  ["Grid Table 7 Colorful", ""],
  ["Grid Table 1 Light Accent 1", ""],
  ["Grid Table 2 Accent 1", ""],
  ["Grid Table 3 Accent 1", ""],
  ["Grid Table 4 Accent 1", ""],
  ["Grid Table 5 Dark Accent 1", ""],
  ["Grid Table 6 Colorful Accent 1", ""],
  ["Grid Table 7 Colorful Accent 1", ""],
  ["Grid Table 1 Light Accent 2", ""],
  ["Grid Table 2 Accent 2", ""],
  ["Grid Table 3 Accent 2", ""],
  ["Grid Table 4 Accent 2", ""],
  ["Grid Table 5 Dark Accent 2", ""],
  ["Grid Table 6 Colorful Accent 2", ""],
  ["Grid Table 7 Colorful Accent 2", ""],
  ["Grid Table 1 Light Accent 3", ""],
  ["Grid Table 2 Accent 3", ""],
  ["Grid Table 3 Accent 3", ""],
  ["Grid Table 4 Accent 3", ""],
  ["Grid Table 5 Dark Accent 3", ""],
  ["Grid Table 6 Colorful Accent 3", ""],
  ["Grid Table 7 Colorful Accent 3", ""],
  ["Grid Table 1 Light Accent 4", ""],
  ["Grid Table 2 Accent 4", ""],
  ["Grid Table 3 Accent 4", ""],
  ["Grid Table 4 Accent 4", ""],
  ["Grid Table 5 Dark Accent 4", ""],
  ["Grid Table 6 Colorful Accent 4", ""],
  ["Grid Table 7 Colorful Accent 4", ""],
  ["Grid Table 1 Light Accent 5", ""],
  ["Grid Table 2 Accent 5", ""],
  ["Grid Table 3 Accent 5", ""],
  ["Grid Table 4 Accent 5", ""],
  ["Grid Table 5 Dark Accent 5", ""],
  ["Grid Table 6 Colorful Accent 5", ""],
  ["Grid Table 7 Colorful Accent 5", ""],
  ["Grid Table 1 Light Accent 6", ""],
  ["Grid Table 2 Accent 6", ""],
  ["Grid Table 3 Accent 6", ""],
  ["Grid Table 4 Accent 6", ""],
  ["Grid Table 5 Dark Accent 6", ""],
  ["Grid Table 6 Colorful Accent 6", ""],
  ["Grid Table 7 Colorful Accent 6", ""],
  ["List Table 1 Light", ""],
  ["List Table 2", ""],
  ["List Table 3", ""],
  ["List Table 4", ""],
  ["List Table 5 Dark", ""],
  ["List Table 6 Colorful", ""],
  ["List Table 7 Colorful", ""],
  ["List Table 1 Light Accent 1", ""],
  ["List Table 2 Accent 1", ""],
  ["List Table 3 Accent 1", ""],
  ["List Table 4 Accent 1", ""],
  ["List Table 5 Dark Accent 1", ""],
  ["List Table 6 Colorful Accent 1", ""],
  ["List Table 7 Colorful Accent 1", ""],
  ["List Table 1 Light Accent 2", ""],
  ["List Table 2 Accent 2", ""],
  ["List Table 3 Accent 2", ""],
  ["List Table 4 Accent 2", ""],
  ["List Table 5 Dark Accent 2", ""],
  ["List Table 6 Colorful Accent 2", ""],
  ["List Table 7 Colorful Accent 2", ""],
  ["List Table 1 Light Accent 3", ""],
  ["List Table 2 Accent 3", ""],
  ["List Table 3 Accent 3", ""],
  ["List Table 4 Accent 3", ""],
  ["List Table 5 Dark Accent 3", ""],
  ["List Table 6 Colorful Accent 3", ""],
  ["List Table 7 Colorful Accent 3", ""],
  ["List Table 1 Light Accent 4", ""],
  ["List Table 2 Accent 4", ""],
  ["List Table 3 Accent 4", ""],
  ["List Table 4 Accent 4", ""],
  ["List Table 5 Dark Accent 4", ""],
  ["List Table 6 Colorful Accent 4", ""],
  ["List Table 7 Colorful Accent 4", ""],
  ["List Table 1 Light Accent 5", ""],
  ["List Table 2 Accent 5", ""],
  ["List Table 3 Accent 5", ""],
  ["List Table 4 Accent 5", ""],
  ["List Table 5 Dark Accent 5", ""],
  ["List Table 6 Colorful Accent 5", ""],
  ["List Table 7 Colorful Accent 5", ""],
  ["List Table 1 Light Accent 6", ""],
  ["List Table 2 Accent 6", ""],
  ["List Table 3 Accent 6", ""],
  ["List Table 4 Accent 6", ""],
  ["List Table 5 Dark Accent 6", ""],
  ["List Table 6 Colorful Accent 6", ""],
  ["List Table 7 Colorful Accent 6", ""],
  ["AbstractHeading", "Abstract Heading"],
  ["AbstractBody", "Abstract Body"],
  ["TableNormal", "Normal Table"],
]);
const ReservedStyleNames = new Set(StyleNameMap.values());

/** Original StyleType declaration order. */
export enum StyleType {
  Unknown,
  Paragraph,
  Character,
  Table,
  List,
}
/** Native consumed entry fields; names bind immutable UTF16 at the XML resource boundary. */
export class StyleSheetEntry {
  private readonly m_aInteropGrabBag: PropertyValue[] = [];
  m_sStyleIdentifierD = "";
  m_bIsDefaultStyle = false;
  m_bAssignedAsChapterNumbering = false;
  m_bInvalidHeight = false;
  m_bHasUPE = false;
  m_nStyleTypeCode = StyleType.Unknown;
  m_sBaseStyleIdentifier = "";
  m_sNextStyleIdentifier = "";
  m_sLinkStyleIdentifier = "";
  m_sStyleName = "";
  readonly m_pProperties = new StyleSheetPropertyMap();
  m_sConvertedStyleName = "";
  readonly m_aLatentStyles: PropertyValue[] = [];
  readonly m_aLsdExceptions: PropertyValue[] = [];
  m_bAutoRedefine = false;
  readonly m_aStyleInteropProps: PropertyValue[] = [];
  /** Original vector-to-sequence conversion copies generated values while retaining their native Any content. @returns Owned sequence. */
  GetInteropGrabBagSeq(): InstanceType<typeof PropertyValues> {
    return new PropertyValues(
      {
        /** Borrows a native vector element at its logical compound address. @param offset - Native byte offset. @returns Element. */
        get: (offset) => this.m_aInteropGrabBag[offset / 48],
      },
      this.m_aInteropGrabBag.length,
    );
  }
  /** Original style-ID wrapper around a copied property sequence. @returns Owned generated value. */
  GetInteropGrabBag(): PropertyValue {
    const result = new PropertyValue();
    const units = Uint16Array.from(
      this.m_sStyleIdentifierD.split(""),
      /** Copies one immutable host UTF16 unit without normalization. @param unit - Unit. @returns Code. */ (
        unit,
      ) => unit.charCodeAt(0),
    );
    const name = new OUString(units, units.length),
      sequence = this.GetInteropGrabBagSeq();
    try {
      result.Name = name;
      result.Value.insert(sequence.getAddress(), propertySequenceType);
      return result;
    } finally {
      name.dispose();
      sequence.dispose();
    }
  }
  /** Original vector push_back copies the generated value immediately. @param value - Borrowed source. @returns Nothing. */
  AppendInteropGrabBag(value: PropertyValue): void {
    this.m_aInteropGrabBag.push(new PropertyValue(value));
  }
  /** Original recursive parent merge keeps only the direct self-ID guard; no cycle repair or pooled-style fallback is introduced. @param table - Native import table or null. @returns Owned merged map. */
  GetMergedInheritedProperties(table: StyleSheetTable | null): PropertyMap {
    let result: PropertyMap | undefined;
    if (
      table &&
      this.m_sBaseStyleIdentifier !== "" &&
      this.m_sBaseStyleIdentifier !== this.m_sStyleIdentifierD
    ) {
      const parent = table.FindStyleSheetByISTD(this.m_sBaseStyleIdentifier);
      if (parent) result = parent.GetMergedInheritedProperties(table);
    }
    result ??= new PropertyMap();
    result.InsertProps(this.m_pProperties);
    return result;
  }
  /** Native owned map/vector member destruction; shared imported map identities are not replaced with local reference counters. @returns Nothing. */
  dispose(): void {
    this.m_pProperties.dispose();
    for (const values of [
      this.m_aInteropGrabBag,
      this.m_aLatentStyles,
      this.m_aLsdExceptions,
      this.m_aStyleInteropProps,
    ]) {
      for (const value of values) {
        value.Name.dispose();
        value.Value.dispose();
      }
      values.length = 0;
    }
  }
}

/** Original conditional table-style entry constructs a fresh base property owner and copies only the native selected fields. */
export class TableStyleSheetEntry extends StyleSheetEntry {
  private readonly m_aStyles = new Map<TblStyleType, PropertyMap>();
  /** Original conversion constructor deliberately does not copy properties, converted name, interop vectors or auto-update/chapter flags. @param source - Original entry. @returns Entry. */
  constructor(source: Readonly<StyleSheetEntry>) {
    super();
    this.m_bIsDefaultStyle = source.m_bIsDefaultStyle;
    this.m_bInvalidHeight = source.m_bInvalidHeight;
    this.m_bHasUPE = source.m_bHasUPE;
    this.m_nStyleTypeCode = StyleType.Table;
    this.m_sBaseStyleIdentifier = source.m_sBaseStyleIdentifier;
    this.m_sNextStyleIdentifier = source.m_sNextStyleIdentifier;
    this.m_sLinkStyleIdentifier = source.m_sLinkStyleIdentifier;
    this.m_sStyleName = source.m_sStyleName;
    this.m_sStyleIdentifierD = source.m_sStyleIdentifierD;
  }
  /** Original edge-style insertion can erase an inside border on the supplied map itself before retaining its identity. @param type - Native conditional type. @param properties - Original shared map. @returns Nothing. */
  AddTblStylePr(type: TblStyleType, properties: PropertyMap): void {
    const types = [
        TblStyleType.FirstRow,
        TblStyleType.LastRow,
        TblStyleType.FirstCol,
        TblStyleType.LastCol,
      ],
      borders = [P.PROP_BOTTOM_BORDER, P.PROP_TOP_BORDER, P.PROP_RIGHT_BORDER, P.PROP_LEFT_BORDER];
    for (let index = 0; index < types.length; ++index) {
      if (type === types[index]) {
        const checked = properties.getProperty(borders[index] as P),
          insideId = index < 2 ? P.META_PROP_HORIZONTAL_BORDER : P.META_PROP_VERTICAL_BORDER,
          inside = properties.getProperty(insideId);
        try {
          if (checked && inside) properties.Erase(insideId);
        } finally {
          checked?.[1].dispose();
          inside?.[1].dispose();
        }
        break;
      }
    }
    this.m_aStyles.set(type, properties);
  }
  /** Original returned map merges conditional properties only, without silently adding base or inherited style properties. @param mask - Signed32 condition mask. @returns Owned result. */
  GetProperties(mask: number): PropertyMap {
    const result = new PropertyMap(),
      local = this.GetLocalPropertiesFromMask(mask);
    try {
      result.InsertProps(local);
      return result;
    } finally {
      local.dispose();
    }
  }
  /** Original predicate resolves the same merged property set. @param mask - Conditions. @returns Whether any ordinary property remains. */
  Has(mask: number): boolean {
    const properties = this.GetProperties(mask);
    try {
      return properties.GetPropertyIds().length !== 0;
    } finally {
      properties.dispose();
    }
  }
  /** Original right-to-left mask precedence; columns/bands precede rows and corner cells. @param mask - Condition bits. @returns Owned merged map. */
  private GetLocalPropertiesFromMask(mask: number): PropertyMap {
    const order: readonly (readonly [number, TblStyleType])[] = [
      [0x010, TblStyleType.Band2Horz],
      [0x020, TblStyleType.Band1Horz],
      [0x040, TblStyleType.Band2Vert],
      [0x080, TblStyleType.Band1Vert],
      [0x100, TblStyleType.LastCol],
      [0x200, TblStyleType.FirstCol],
      [0x400, TblStyleType.LastRow],
      [0x800, TblStyleType.FirstRow],
      [0x001, TblStyleType.SWCell],
      [0x002, TblStyleType.SECell],
      [0x004, TblStyleType.NWCell],
      [0x008, TblStyleType.NECell],
    ];
    const properties = new PropertyMap();
    for (const [bit, type] of order) {
      const added = this.m_aStyles.get(type);
      if (mask & bit && added) mergeConditionalProperties(properties, added, type);
    }
    return properties;
  }
  /** Releases retained JS shared-map references; the supplied property owners keep their native filter lifetime. @returns Nothing. */
  override dispose(): void {
    this.m_aStyles.clear();
    super.dispose();
  }
}
/** Original lcl_mergeProps applies edge clearing before the ordinary overwrite merge; its column checks differ from AddTblStylePr. @param target - Result. @param added - Original conditional properties. @param type - Native conditional type. @returns Nothing. */
function mergeConditionalProperties(
  target: PropertyMap,
  added: PropertyMap,
  type: TblStyleType,
): void {
  const borders = [
      P.PROP_BOTTOM_BORDER,
      P.PROP_TOP_BORDER,
      P.PROP_RIGHT_BORDER,
      P.PROP_LEFT_BORDER,
    ],
    remove = [
      type === TblStyleType.FirstRow,
      type === TblStyleType.LastRow,
      type === TblStyleType.LastCol,
      type === TblStyleType.FirstCol,
    ];
  for (let index = 0; index < borders.length; ++index) {
    const property = added.getProperty(borders[index] as P);
    try {
      if (property && remove[index])
        target.Erase(index < 2 ? P.META_PROP_HORIZONTAL_BORDER : P.META_PROP_VERTICAL_BORDER);
    } finally {
      property?.[1].dispose();
    }
  }
  target.InsertProps(added);
}

/** Native style identity/default-property owner shared with DomainMapper_Impl, without substituting Writer's pooled style defaults for absent imported properties. */
export class StyleSheetTable {
  private readonly m_aStyleSheetEntries: StyleSheetEntry[] = [];
  private readonly m_aStyleSheetEntriesMap = new Map<string, StyleSheetEntry>();
  private readonly m_pDefaultParaProps = new PropertyMap();
  private readonly m_pDefaultCharProps = new PropertyMap();
  private m_sDefaultParaStyleName = "Normal";
  private m_pCurrentEntry: StyleSheetEntry | null = null;
  /** Original existing-style reset examines every represented direct property before imported values are applied. @param style - Actual UNO style. @returns Nothing. */
  static SetPropertiesToDefault(style: SwXStyle): void {
    const properties = style.getPropertySetInfo().getProperties();
    try {
      const states = style.getPropertyStates(
        properties.map(
          /** Borrows each actual property name. @param property - Native descriptor. @returns Name. */ (
            property,
          ) => property.Name,
        ),
      );
      for (let index = 0; index < states.length; ++index) {
        if (states[index] !== PropertyState.DIRECT_VALUE) continue;
        try {
          style.setPropertyToDefault((properties[index] as Property).Name);
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    } finally {
      for (const property of properties) {
        property.Type.dispose();
        property.Name.dispose();
      }
    }
  }
  /** Original constructor seeds only three 10pt heights and disabled auto-kerning. @returns Table. */
  constructor() {
    const height = new Any([10], "double"),
      kerning = new Any([false], "bool");
    try {
      for (const id of [P.PROP_CHAR_HEIGHT, P.PROP_CHAR_HEIGHT_ASIAN, P.PROP_CHAR_HEIGHT_COMPLEX])
        this.m_pDefaultCharProps.Insert(id, height);
      this.m_pDefaultCharProps.Insert(P.PROP_CHAR_AUTO_KERNING, kerning);
    } finally {
      height.dispose();
      kerning.dispose();
    }
  }
  /** Native entry completion admission and first-ID insertion, used by the parser's entry callback. @param entry - Completed native entry. @returns Nothing. */
  AppendEntry(entry: StyleSheetEntry): void {
    if (entry.m_sStyleName === "") {
      entry.dispose();
      return;
    }
    entry.m_sConvertedStyleName = StyleSheetTable.ConvertStyleName(entry.m_sStyleName)[0];
    this.m_aStyleSheetEntries.push(entry);
    if (!this.m_aStyleSheetEntriesMap.has(entry.m_sStyleIdentifierD))
      this.m_aStyleSheetEntriesMap.set(entry.m_sStyleIdentifierD, entry);
  }
  /** Native attribute handling records the last declared paragraph default by its Word ID. @param identifier - Style ID. @returns Nothing. */
  SetDefaultParaStyleName(identifier: string): void {
    this.m_sDefaultParaStyleName = identifier;
  }
  /** Original identity lookup returns the first inserted duplicate ID. @param identifier - Word ID. @returns Entry or null. */
  FindStyleSheetByISTD(identifier: string): StyleSheetEntry | null {
    return this.m_aStyleSheetEntriesMap.get(identifier) ?? null;
  }
  /** Original converted-name lookup scans source order. @param name - Converted name. @returns First entry or null. */
  FindStyleSheetByConvertedStyleName(name: string): StyleSheetEntry | null {
    return (
      this.m_aStyleSheetEntries.find(
        /** Exact source comparison. @param entry - Entry. @returns Match. */ (entry) =>
          entry.m_sConvertedStyleName === name,
      ) ?? null
    );
  }
  /** Original default identity lookup. @returns Entry or null. */ FindDefaultParaStyle(): StyleSheetEntry | null {
    return this.FindStyleSheetByISTD(this.m_sDefaultParaStyleName);
  }
  /** Native current entry during stylesheet resolution. @returns Entry or null. */ GetCurrentEntry(): StyleSheetEntry | null {
    return this.m_pCurrentEntry;
  }
  /** Native entry-resolution lifetime binding. @param entry - Entry or null. @returns Nothing. */ SetCurrentEntry(
    entry: StyleSheetEntry | null,
  ): void {
    this.m_pCurrentEntry = entry;
  }
  /** Native first-write document-default paragraph values. @param id - Property. @param value - Actual Any. @returns Nothing. */
  SetDefaultParaProps(id: P, value: Any): void {
    this.m_pDefaultParaProps.Insert(id, value, false, GrabBagType.NO_GRAB_BAG, true);
  }
  /** Borrows original paragraph defaults. @returns Map. */ GetDefaultParaProps(): PropertyMap {
    return this.m_pDefaultParaProps;
  }
  /** Borrows original character defaults. @returns Map. */ GetDefaultCharProps(): PropertyMap {
    return this.m_pDefaultCharProps;
  }
  /** Original Word style-ID to converted-name path. @param name - Word ID/name. @returns Converted name. */
  ConvertStyleNameExt(name: string): string {
    const entry = this.FindStyleSheetByISTD(name);
    if (entry) {
      if (entry.m_sConvertedStyleName !== "") return entry.m_sConvertedStyleName;
      name = entry.m_sStyleName;
    }
    return StyleSheetTable.ConvertStyleName(name)[0];
  }
  /** Original map and reserved-name collision algorithm; returns Word-built-in membership separately. @param name - Original style name. @returns Converted name and built-in flag. */
  static ConvertStyleName(name: string): readonly [string, boolean] {
    const found = StyleNameMap.get(name);
    if (found !== undefined && found !== "") return [found, true];
    return [
      ReservedStyleNames.has(name) || name.endsWith(" (WW)") ? name + " (WW)" : name,
      found !== undefined,
    ];
  }
  /** Releases filter-owned native maps. @returns Nothing. */ dispose(): void {
    for (const entry of this.m_aStyleSheetEntries) entry.dispose();
    this.m_aStyleSheetEntries.length = 0;
    this.m_aStyleSheetEntriesMap.clear();
    this.m_pDefaultParaProps.dispose();
    this.m_pDefaultCharProps.dispose();
  }
}

/** Original anonymous-namespace PropValVector: stable lexical insertion retains duplicate names and copied PropertyValue owners. */
export class PropValVector {
  private readonly m_aValues: PropertyValue[] = [];
  /** Original insertion stops at the first strictly greater name. @param value - Borrowed property. @returns Nothing. */
  Insert(value: PropertyValue): void {
    const index = this.m_aValues.findIndex(
      /** Original OUString comparison uses UTF16 units. @param entry - Existing native value. @returns Whether greater. */ (
        entry,
      ) => entry.Name.compareTo(value.Name) > 0,
    );
    this.m_aValues.splice(
      index === -1 ? this.m_aValues.length : index,
      0,
      new PropertyValue(value),
    );
  }
  /** Original by-value Sequence<Any> return, using the actual UNO sequence and Any copy owners. @returns Owned native sequence. */
  getValues(): Sequence<Any> {
    return new AnyValues(
      {
        /** Borrows the original vector value at a source logical address. @param offset - Byte offset. @returns Actual Any member. */ get: (
          offset: number,
        ) => this.m_aValues[offset / 24]?.Value,
      },
      this.m_aValues.length,
    );
  }
  /** Original by-value Sequence<OUString> return. @returns Owned native sequence. */
  getNames(): Sequence<OUString> {
    return new StringValues(
      {
        /** Borrows source string values at original logical addresses. @param offset - Byte offset. @returns Actual name. */ get: (
          offset: number,
        ) => this.m_aValues[offset / 8]?.Name.getDataAddress(),
      },
      this.m_aValues.length,
    );
  }
  /** Original const vector view. @returns Borrowed original copied values. */
  getProperties(): readonly PropertyValue[] {
    return this.m_aValues;
  }
  /** Original vector/member destructor. @returns Nothing. */
  dispose(): void {
    for (const value of this.m_aValues) {
      value.Value.dispose();
      value.Name.dispose();
    }
    this.m_aValues.length = 0;
  }
}
const AnyValues = Sequence.specialize<Any>("Any", 24);
const StringValues = Sequence.specialize<OUString>("OUString", 8);

import type { SwXStyle } from "../../core/unocore/unostyle";
import type { Property } from "../../../../udkapi/com/sun/star/beans/Property";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
