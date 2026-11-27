/** @fileoverview Original shared caption-index properties for table and illustration indexes. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLIndexSourceBaseContext,
  readIndexSourceFlag,
  type XMLIndexSourceProperties,
} from "./XMLIndexSourceBaseContext";

/** Original named caption source used by both caption-index families. */
export interface XMLIndexTableSource extends XMLIndexSourceProperties {
  readonly family: "table-index" | "illustration-index";
  readonly useCaption: boolean;
  readonly sequenceName?: string;
  readonly captionFormat?: "text" | "category-and-value" | "caption";
}

/** Reads the original caption source properties and a single native form. */
export class XMLIndexTableSourceContext extends XMLIndexSourceBaseContext {
  /** Binds the original caption source context. @param attributes - Native source attributes. @param publish - Connected descriptor sink. @param captionFamily - Original table or illustration specialization. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    private readonly publish: (source: XMLIndexTableSource) => void,
    private readonly captionFamily: XMLIndexTableSource["family"] = "table-index",
  ) {
    super(attributes, captionFamily, 1);
  }

  /** Converts caption names and the original historical format aliases. @returns Nothing. */
  public override endFastElement(): void {
    const name = this.attributes.get(XMLToken.TEXT_CAPTION_SEQUENCE_NAME);
    const format = this.attributes.get(XMLToken.TEXT_CAPTION_SEQUENCE_FORMAT);
    const captionFormat =
      format === "text"
        ? "text"
        : format === "category-and-value" || format === "chapter"
          ? "category-and-value"
          : format === "caption" || format === "page"
            ? "caption"
            : undefined;
    this.publish({
      ...this.GetSource(),
      family: this.captionFamily,
      useCaption: readIndexSourceFlag(this.attributes, XMLToken.TEXT_USE_CAPTION, true),
      ...(name === null ? {} : { sequenceName: name }),
      ...(captionFormat === undefined ? {} : { captionFormat }),
    });
  }
}
