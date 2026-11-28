/** @fileoverview Native ScXMLBodyContext spreadsheet/table dispatch subset. */
import { ScXMLImportContext } from "./importcontext";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLImport } from "./xmlimprt";
import { ScXMLTableContext } from "./xmltabi";
import { ScXMLLabelRangesContext } from "./xmllabri";
import { ScXMLDatabaseRangeContext, ScXMLDatabaseRangesContext } from "./xmldrani";
import { ScXMLNamedExpressionsContext } from "./xmlnexpi";
import { ScXMLCalculationSettingsContext } from "./XMLCalculationSettingsContext";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { stringToDouble } from "../../../../sal/inc/rtl/math";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { createExternalRefTable } from "./xmlexternaltabi";
import { ScXMLContentValidationsContext } from "./xmlcvali";
import { ScXMLConsolidationContext } from "./XMLConsolidationContext";
import { ScDocProtection } from "../../core/data/tabprotection";
import { readProtectionHash } from "./xmlsubti";
/** Spreadsheet content owns table creation,not a separate workbook model. */
export class ScXMLBodyContext extends ScXMLImportContext {
  private hadCalculationSettings = false;
  private protection: ScDocProtection | undefined;
  /** Binds importer. @param owner - Owner. @returns Context. */
  constructor(private readonly owner: ScXMLImport) {
    super(owner);
    const version = unicode(owner.GetODFVersion());
    try {
      const legacy = stringToDouble(version, ".".charCodeAt(0), 0) < 1.2;
      owner
        .GetDocument()
        .SetStorageGrammar(
          legacy ? FormulaGrammar.Grammar.GRAM_PODF : FormulaGrammar.Grammar.GRAM_ODFF,
        );
    } finally {
      version.dispose();
    }
  }
  /** Reads the original protection attributes for adoption after the sheets. @param _element - Spreadsheet token. @param attributes - Spreadsheet attributes. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    if (attributes.get(XMLToken.TABLE_STRUCTURE_PROTECTED) !== "true") return;
    const protection = new ScDocProtection();
    protection.setProtected(true);
    protection.setStoredPasswordHash(readProtectionHash(attributes));
    this.protection = protection;
  }
  /** Creates actual sheets. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.LOEXT_PERSONS) return new ScXMLPersonsContext(this.owner);
    if (element === XMLToken.TABLE_TRACKED_CHANGES)
      return new ScXMLTrackedChangesContext(this.owner);
    if (element === XMLToken.TABLE_CONTENT_VALIDATIONS)
      return new ScXMLContentValidationsContext(this.owner);
    if (element === XMLToken.TABLE_DATABASE_RANGES)
      return new ScXMLDatabaseRangesContext(this.owner);
    if (element === XMLToken.TABLE_DATABASE_RANGE)
      return new ScXMLDatabaseRangeContext(this.owner, attributes);
    if (element === XMLToken.TABLE_LABEL_RANGES) return new ScXMLLabelRangesContext(this.owner);
    if (element === XMLToken.TABLE_CONSOLIDATION)
      return new ScXMLConsolidationContext(this.owner, attributes);
    if (element === XMLToken.TABLE_NAMED_EXPRESSIONS)
      return new ScXMLNamedExpressionsContext(this.owner, -1);
    if (element === XMLToken.TABLE_CALCULATION_SETTINGS) {
      this.hadCalculationSettings = true;
      return new ScXMLCalculationSettingsContext(this.owner);
    }
    if (element !== XMLToken.TABLE_TABLE)
      throw new Error("ODS spreadsheet feature is not implemented");
    return (
      createExternalRefTable(attributes.get(XMLToken.TABLE_NAME) ?? "", this.owner) ??
      new ScXMLTableContext(this.owner, attributes)
    );
  }
  /** Applies the ODF calculation defaults when the settings element is absent. @returns Nothing. */
  override endFastElement(): void {
    if (!this.hadCalculationSettings)
      new ScXMLCalculationSettingsContext(this.owner).endFastElement();
    if (this.protection) this.owner.GetDocument().SetDocProtection(this.protection);
  }
}

/** Handles the empty form of the native tracked-changes collection. */
class ScXMLTrackedChangesContext extends ScXMLImportContext {
  /** Preserves the unsupported-range boundary for change records. @returns No child. */
  override createFastChildContext(): never {
    throw new Error("ODS tracked change entries are not implemented");
  }

  /** Preserves the unsupported-range boundary for change records. @returns No child. */
  override createUnknownChildContext(): never {
    throw new Error("ODS tracked change entries are not implemented");
  }
}

/** Registers native threaded-comment persons on the spreadsheet document. */
class ScXMLPersonsContext extends ScXMLImportContext {
  /** Consumes one person's original metadata in spreadsheet-body order. @param element - Child token. @param attributes - Person attributes. @returns Context for remaining content. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.LOEXT_PERSON)
      this.GetScImport()
        .GetDocument()
        .AddPerson({
          maId: attributes.get(XMLToken.LOEXT_PERSON_ID) ?? "",
          maDisplayName: attributes.get(XMLToken.LOEXT_DISPLAY_NAME) ?? "",
          maUserId: attributes.get(XMLToken.LOEXT_USER_ID) ?? "",
          maProviderId: attributes.get(XMLToken.LOEXT_PROVIDER_ID) ?? "",
        });
    return new SvXMLIgnoreContext(true);
  }

  /** Ignores unrepresented person children as the source context does. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}
