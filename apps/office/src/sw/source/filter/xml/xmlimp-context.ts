/** @fileoverview Dispatches Writer document, style, metadata and body XML contexts. */
import { getBuildIdFromGenerator } from "../../../../xmloff/source/meta/xmlmetai";
import { XMLDocumentSettingsContext } from "../../../../xmloff/source/core/DocumentSettingsContext";
import {
  FastAttributeList,
  SvXMLIgnoreContext,
  SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { XMLFontStylesContext } from "../../../../xmloff/source/style/XMLFontStylesContext";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import type { SwXMLImport } from "./xmlimp";

const ignoredDocumentChildren = new Set([XMLToken.OFFICE_SETTINGS, XMLToken.OFFICE_SCRIPTS]);

const ignoredMetadataChildren = new Set([
  XMLToken.META_GENERATOR,
  XMLToken.META_INITIAL_CREATOR,
  XMLToken.META_CREATION_DATE,
  XMLToken.META_EDITING_CYCLES,
  XMLToken.META_EDITING_DURATION,
  XMLToken.META_DOCUMENT_STATISTIC,
  XMLToken.DC_CREATOR,
  XMLToken.DC_DATE,
]);

/** Dispatches document-level elements like upstream SwXMLDocContext_Impl. */
export class SwXMLDocContext extends SvXMLImportContext {
  /** Creates a document dispatcher. @param xmlImport - Import owner. @param root - Current root. @returns Context. */
  public constructor(
    private readonly xmlImport: SwXMLImport,
    private readonly root: XMLToken,
  ) {
    super();
  }

  /** Dispatches one document child. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element === XMLToken.OFFICE_FONT_FACE_DECLS &&
      (this.root === XMLToken.OFFICE_DOCUMENT_STYLES ||
        this.root === XMLToken.OFFICE_DOCUMENT_CONTENT)
    ) {
      attributes.assertOnly([], "font face declarations");
      return new XMLFontStylesContext(this.xmlImport, RTL_TEXTENCODING_UTF8);
    }
    if (
      element === XMLToken.OFFICE_MASTER_STYLES &&
      this.root === XMLToken.OFFICE_DOCUMENT_STYLES
    ) {
      attributes.assertOnly([], "master styles");
      return new XMLMasterStylesContext(this.xmlImport);
    }
    if (
      (element === XMLToken.OFFICE_STYLES || element === XMLToken.OFFICE_AUTOMATIC_STYLES) &&
      (this.root === XMLToken.OFFICE_DOCUMENT_STYLES ||
        this.root === XMLToken.OFFICE_DOCUMENT_CONTENT)
    ) {
      attributes.assertOnly([], "styles container");
      return this.xmlImport.CreateStylesContext(element === XMLToken.OFFICE_AUTOMATIC_STYLES);
    }
    if (element === XMLToken.OFFICE_BODY && this.root === XMLToken.OFFICE_DOCUMENT_CONTENT) {
      attributes.assertOnly([], "body");
      return new SwXMLBodyContext(this.xmlImport);
    }
    if (element === XMLToken.OFFICE_META && this.root === XMLToken.OFFICE_DOCUMENT_META) {
      attributes.assertOnly([], "metadata");
      return new XMLMetaContext(this.xmlImport);
    }
    if (element === XMLToken.OFFICE_SETTINGS && this.root === XMLToken.OFFICE_DOCUMENT_SETTINGS) {
      return new XMLDocumentSettingsContext(
        /** Applies the original native configuration properties. @param properties - Borrowed properties. @returns Nothing. */
        (properties) => this.xmlImport.SetConfigurationSettings(properties),
      );
    }
    if (ignoredDocumentChildren.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Imports the page-layout association from Writer master pages. */
class XMLMasterStylesContext extends SvXMLImportContext {
  /** Creates the master-page context for one Writer XML import. @param xmlImport - Import coordinator. @returns Nothing. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Imports supported master-page children and ignores their unmodeled content. @param element - Child token. @param attributes - Child attributes. @returns Import context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_MASTER_PAGE) return new SvXMLIgnoreContext();
    return this.xmlImport.registerMasterPage(attributes);
  }
}

/** Owns the single office:text body child. */
class SwXMLBodyContext extends SvXMLImportContext {
  /** Creates a body context. @param xmlImport - Import owner. @returns Context. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Creates the Writer text body context. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.OFFICE_SPREADSHEET) return new SvXMLIgnoreContext();
    if (element !== XMLToken.OFFICE_TEXT) return null;
    attributes.assertOnly([], "text body");
    return this.xmlImport.registerOfficeText();
  }
}

/** Imports metadata while explicitly ignoring the known generator element. */
class XMLMetaContext extends SvXMLImportContext {
  /** Ignores only metadata fields without canonical Writer effect. @param element - Child token. @returns Whether metadata-only. */
  public override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return ignoredMetadataChildren.has(element);
  }
  /** Creates a metadata context. @param xmlImport - Import owner. @returns Context. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Creates a supported metadata child. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.DC_TITLE) {
      attributes.assertOnly([], "metadata title");
      this.xmlImport.startTitle();
      return new XMLTitleContext(
        /** Commits the parsed title. @param title - Normalized title. @returns Nothing. */
        (title) => {
          this.xmlImport.title = title;
        },
      );
    }
    if (element === XMLToken.DC_LANGUAGE) {
      attributes.assertOnly([], "metadata language");
      return new XMLTitleContext(
        /** Retains the document language for construction defaults. @param language - Parsed tag. @returns Nothing. */ (
          language,
        ) => {
          this.xmlImport.language = language;
        },
      );
    }
    if (element === XMLToken.META_GENERATOR)
      return new XMLTitleContext(
        /** Records the native generator build ID. @param generator - Imported generator text. @returns Nothing. */ (
          generator,
        ) => {
          this.xmlImport.buildId = getBuildIdFromGenerator(generator);
        },
      );
    if (ignoredMetadataChildren.has(element)) return new SvXMLIgnoreContext(true);
    return null;
  }
}

/** Accumulates the bounded title element. */
class XMLTitleContext extends SvXMLImportContext {
  private value = "";
  /** Creates a title accumulator. @param commit - Completion callback. @returns Context. */
  public constructor(private readonly commit: (title: string) => void) {
    super();
  }
  /** Appends title characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.value += characters;
  }
  /** Commits a non-empty normalized title. @returns Nothing. */
  public override endFastElement(): void {
    const title = this.value.trim();
    if (title.length > 0) this.commit(title);
  }
}
