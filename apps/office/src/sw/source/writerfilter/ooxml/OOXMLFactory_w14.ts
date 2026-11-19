/** @fileoverview Source-generated Word 2010 typographic property factory. */
import { GeneratedNamespaceFactory } from "./OOXMLFactory_wml";
import * as tables from "./OOXMLFactory_w14.tables";

/** Original generated namespace factory for the represented Word 2010 properties. */
export class OOXMLFactory_w14 extends GeneratedNamespaceFactory {
  private static w14: OOXMLFactory_w14 | undefined;

  /** Binds the native Word 2010 tables to the common generated lookup implementation. @returns Factory. */
  private constructor() {
    super(tables);
  }

  /** Original shared namespace factory. @returns Factory. */
  static getInstance(): OOXMLFactory_w14 {
    return (this.w14 ??= new OOXMLFactory_w14());
  }
}
