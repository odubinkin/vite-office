/** @fileoverview Original illustration specialization of the shared caption-index import. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLIndexTableSourceContext, type XMLIndexTableSource } from "./XMLIndexTableSourceContext";

/** Imports illustration caption settings using the table-index property contract. */
export class XMLIndexIllustrationSourceContext extends XMLIndexTableSourceContext {
  /** Selects the original illustration entry-template family. @param attributes - ODF source attributes. @param publish - Connected source sink. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    publish: (source: XMLIndexTableSource) => void,
  ) {
    super(attributes, publish, "illustration-index");
  }
}
