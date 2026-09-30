/** @fileoverview Owns independent supported list-level positioning and attribute import from pinned xmlnumi.cxx. */
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { XMLListLevelImportProperties } from "../text/txtparai";

/** Parses one label-alignment leaf into native MM100 numbering properties. */
export class SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl extends SvXMLIgnoreContext {
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
  /** Creates a declared level with native zero defaults. @param save - Complete property sink. @returns Context. */
  public constructor(private readonly save: (properties: XMLListLevelImportProperties) => void) {
    super();
  }
  /** Creates a properties context with independent legacy and modern fields. @param element - Child token. @param attributes - Properties. @returns Context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_LIST_LEVEL_PROPERTIES) return new SvXMLIgnoreContext();
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
    );
  }
  /** Publishes both groups after the full declared level. @returns Nothing. */
  public override endFastElement(): void {
    const distance = this.legacy.minLabelDistance;
    this.save({
      measureUnit: "mm100",
      values: {
        ...this.properties,
        absLSpace: this.legacy.spaceBefore + this.legacy.minLabelWidth,
        firstLineOffset: 0 - this.legacy.minLabelWidth,
        charTextDistance: distance >= 32768 ? distance - 65536 : distance,
      },
    });
  }
}

/** Imports native legacy spacing and selects mode only from its explicit attribute. */
class SvxXMLListLevelStyleAttrContext_Impl extends SvXMLImportContext {
  /** Parses native MM100 legacy measures. @param attributes - List properties. @param save - Raw field sink. @param saveLegacy - Successful legacy measure sink. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    private readonly save: (values: XMLListLevelImportProperties["values"]) => void,
    saveLegacy: (values: Partial<LegacyListMeasures>) => void,
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
  }
  /** Parses the alignment leaf independently from the selected mode. @param element - Child token. @param attributes - Alignment attributes. @returns Leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_LIST_LEVEL_LABEL_ALIGNMENT) return new SvXMLIgnoreContext();
    return new SvxXMLListLevelStyleLabelAlignmentAttrContext_Impl(
      attributes,
      /** Retains modern fields without selecting a mode. @param properties - Alignment fields. @returns Nothing. */
      (properties) => this.save(properties.values),
    );
  }
}
