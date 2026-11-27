/** @fileoverview Original ODF user index source from XMLIndexUserSourceContext.cxx. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLIndexSourceBaseContext,
  readIndexSourceFlag,
  type XMLIndexSourceProperties,
} from "./XMLIndexSourceBaseContext";

/** Source switches and type name for a user-defined Writer index. */
export interface XMLIndexUserSource extends XMLIndexSourceProperties {
  readonly family: "user-index";
  readonly indexName: string;
  readonly useMarks: boolean;
  readonly useObjects: boolean;
  readonly useGraphics: boolean;
  readonly useTables: boolean;
  readonly useFrames: boolean;
  readonly copyOutlineLevels: boolean;
  readonly useStyles: boolean;
}

/** Imports the user index's original source flags independently of its stored contents. */
export class XMLIndexUserSourceContext extends XMLIndexSourceBaseContext {
  /** Binds the native descriptor sink and reads the common source properties. @param attributes - User index source. @param levels - Native outline rule depth. @param publish - Connected descriptor. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    levels: number,
    private readonly publish: (source: XMLIndexUserSource) => void,
  ) {
    super(attributes, "user-index", levels);
  }

  /** Sends native defaults and user-defined entries to the original descriptor. @returns Nothing. */
  public override endFastElement(): void {
    const a = this.attributes;
    this.publish({
      ...this.GetSource(),
      family: "user-index",
      indexName: a.get(XMLToken.TEXT_INDEX_NAME) ?? "",
      useMarks: readIndexSourceFlag(a, XMLToken.TEXT_USE_INDEX_MARKS),
      useObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_OBJECTS),
      useGraphics: readIndexSourceFlag(a, XMLToken.TEXT_USE_GRAPHICS),
      useTables: readIndexSourceFlag(a, XMLToken.TEXT_USE_TABLES),
      useFrames: readIndexSourceFlag(a, XMLToken.TEXT_USE_FLOATING_FRAMES),
      copyOutlineLevels: readIndexSourceFlag(a, XMLToken.TEXT_COPY_OUTLINE_LEVELS),
      useStyles: readIndexSourceFlag(a, XMLToken.TEXT_USE_INDEX_SOURCE_STYLES),
    });
  }
}
