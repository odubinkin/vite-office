/** @fileoverview ExcelFilter OOXML import through the real relationship and workbook part owners. */
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScDocument } from "../../../inc/document";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScDocOptions } from "../../core/tool/docoptio";
import { WorkbookFragment } from "./workbookfragment";
import { WorksheetFragment } from "./worksheetfragment";
import { SharedStringsBuffer } from "./sharedstringsbuffer";
import { SharedStringsFragment } from "./sharedstringsfragment";
import { StylesBuffer } from "./stylesbuffer";
import { StylesFragment } from "./stylesfragment";
import { OOXMLDocPropHandler } from "../../../../oox/source/docprop/docprophandler";
import { UnitConverter, type XlsxReferenceDevice } from "./unitconverter";
import { ThemeFragmentHandler } from "../../../../oox/source/drawingml/themefragmenthandler";
import { ExcelGraphicHelper } from "./stylesbuffer.color";
import { ViewSettings } from "./viewsettings";
import { importExternalLinkFragments } from "./externallinkfragment";

/** Original Excel import filter selects the workbook and worksheet parts through package relationships. */
export class ExcelFilter extends XmlFilterBase {
  /** Instantiates the filter over an opened package. @param bytes - Complete XLSX package. @param device - Workbook reference device. @returns Imported Calc graph. */
  static async importDocument(
    bytes: Uint8Array,
    device?: XlsxReferenceDevice,
  ): Promise<ScDocument> {
    const storage = await ZipStorage.openForImport(bytes, "calc");
    try {
      return await new ExcelFilter(storage).importDocument(device);
    } finally {
      storage.dispose();
    }
  }

  /** Resolves the workbook, creates sheets, and imports their content. @param device - Workbook reference device. @returns Imported workbook. */
  async importDocument(device?: XlsxReferenceDevice): Promise<ScDocument> {
    const propertiesPath =
      await this.getFragmentPathFromFirstTypeFromOfficeDoc("extended-properties");
    if (propertiesPath) {
      const properties = new OOXMLDocPropHandler(this, propertiesPath);
      if (await this.importFragment(properties)) this.checkDocumentProperties(properties.generator);
    }
    const main = await this.getFragmentPathFromFirstTypeFromOfficeDoc("officeDocument");
    const workbook = new WorkbookFragment(this, main);
    if (!(await this.importFragment(workbook)) || workbook.sheets.length === 0)
      throw new Error("Excel workbook part is missing or invalid.");
    const relations = await workbook.getRelations();
    const themePath = relations.getFragmentPathFromFirstTypeFromOfficeDoc("theme");
    const theme = themePath ? new ThemeFragmentHandler(this, themePath) : undefined;
    if (theme) await this.importFragment(theme);
    const graphicHelper = new ExcelGraphicHelper(theme?.theme?.colorSet);
    const sharedStrings = new SharedStringsBuffer();
    const styles = new StylesBuffer(graphicHelper);
    const document = new ScDocument();
    let imported = false;
    try {
      const options = new ScDocOptions(document.GetDocOptions());
      options.SetIgnoreLineBreaks(true);
      document.SetDocOptions(options);
      if (theme?.theme) document.theme = theme.theme;
      const stylesPath = relations.getFragmentPathFromFirstTypeFromOfficeDoc("styles");
      if (stylesPath) {
        const fragment = new StylesFragment(this, stylesPath, styles);
        if (!(await this.importFragment(fragment)) || !fragment.sawStyleSheet)
          throw new Error("Excel styles are invalid.");
      }
      const stringsPath = relations.getFragmentPathFromFirstTypeFromOfficeDoc("sharedStrings");
      if (
        stringsPath &&
        !(await this.importFragment(
          new SharedStringsFragment(this, stringsPath, sharedStrings, graphicHelper),
        ))
      )
        throw new Error("Excel shared strings are invalid.");
      const worksheetRelations = relations.getRelationsFromTypeFromOfficeDoc("worksheet");
      const units = new UnitConverter(styles.getDefaultFont()?.getVclFont(), device);
      styles.units = units;
      units.finalizeNullDate(workbook.settings.getNullDate());
      workbook.settings.finalizeImport(document);
      styles.finalizeImport(document);
      for (const [tab, sheet] of workbook.sheets.entries()) {
        const name = unicode(sheet.name);
        try {
          if (!document.InsertTab(tab, name)) throw new Error("Excel worksheet name is invalid.");
        } finally {
          name.dispose();
        }
      }
      await importExternalLinkFragments(this, relations, workbook.externalLinks, document);
      workbook.definedNames.finalizeImport(document, workbook.externalLinks);
      const views = new ViewSettings();
      for (const [tab, sheet] of workbook.sheets.entries()) {
        const path = worksheetRelations.getFragmentPathFromRelId(sheet.relationshipId);
        const worksheet = new WorksheetFragment(
          this,
          path,
          document,
          tab,
          sharedStrings,
          styles,
          views,
          this.isMSODocument(),
          units,
        );
        try {
          if (!(await this.importFragment(worksheet)) || !worksheet.sawWorksheet)
            throw new Error(`Excel worksheet is missing or invalid: ${sheet.name}`);
        } finally {
          worksheet.dispose();
        }
      }
      const activeSheet = workbook.getActiveCalcSheet();
      for (const [tab, sheet] of workbook.sheets.entries())
        document.SetVisible(
          tab,
          tab === activeSheet || (sheet.state !== "hidden" && sheet.state !== "veryHidden"),
        );
      document.SetVisibleTab(activeSheet);
      views.finalizeImport(document, activeSheet);
      document.StartAllListeners();
      document.SetAllFormulasDirty(new SetFormulaDirtyContext());
      imported = true;
      return document;
    } finally {
      try {
        styles.dispose();
        sharedStrings.dispose();
      } finally {
        if (!imported) document.Dispose();
      }
    }
  }
}
