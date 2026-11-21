/** @fileoverview Original Calc ODF calculation, null-date and iteration import contexts. */
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { toDouble } from "../../../../o3tl/inc/string_view";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { ScDocOptions } from "../../core/tool/docoptio";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Applies the ODF defaults and overrides to the original document options. */
export class ScXMLCalculationSettingsContext extends ScXMLImportContext {
  private readonly options: ScDocOptions;

  /** Initializes the original ODF defaults. @param owner - Active importer. @returns Context. */
  constructor(owner: ScXMLImport) {
    super(owner);
    this.options = new ScDocOptions(owner.GetDocument().GetDocOptions());
    this.options.SetDate(30, 12, 1899);
    this.options.SetYear2000(1930);
    this.options.SetFormulaRegexEnabled(true);
    this.options.SetIgnoreCase(false);
    this.options.SetCalcAsShown(false);
    this.options.SetLookUpColRowNames(true);
    this.options.SetMatchWholeCell(true);
    this.options.SetIter(false);
    this.options.SetIterCount(100);
    this.options.SetIterEps(0.001);
  }

  /** Reads the source settings in attribute order. @param _element - Current token. @param attributes - ODF settings attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    attributes.assertOnly(
      [
        XMLToken.TABLE_CASE_SENSITIVE,
        XMLToken.TABLE_PRECISION_AS_SHOWN,
        XMLToken.TABLE_AUTOMATIC_FIND_LABELS,
        XMLToken.TABLE_SEARCH_CRITERIA_MUST_APPLY_TO_WHOLE_CELL,
        XMLToken.TABLE_USE_REGULAR_EXPRESSIONS,
        XMLToken.TABLE_USE_WILDCARDS,
        XMLToken.TABLE_NULL_YEAR,
      ],
      "Calc calculation settings",
    );
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.TABLE_CASE_SENSITIVE:
          if (value === "false") this.options.SetIgnoreCase(true);
          break;
        case XMLToken.TABLE_PRECISION_AS_SHOWN:
          if (value === "true") this.options.SetCalcAsShown(true);
          break;
        case XMLToken.TABLE_AUTOMATIC_FIND_LABELS:
          if (value === "false") this.options.SetLookUpColRowNames(false);
          break;
        case XMLToken.TABLE_SEARCH_CRITERIA_MUST_APPLY_TO_WHOLE_CELL:
          if (value === "false") this.options.SetMatchWholeCell(false);
          break;
        case XMLToken.TABLE_USE_REGULAR_EXPRESSIONS:
          if (value === "false") this.options.SetFormulaRegexEnabled(false);
          break;
        case XMLToken.TABLE_USE_WILDCARDS:
          if (value === "true") this.options.SetFormulaWildcardsEnabled(true);
          break;
        case XMLToken.TABLE_NULL_YEAR: {
          const year: [number] = [0];
          Converter.convertNumber(year, value);
          this.options.SetYear2000(year[0]);
          break;
        }
      }
    }
  }

  /** Routes the original settings children to their own import contexts. @param element - Source token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    if (element === XMLToken.TABLE_NULL_DATE) return new ScXMLNullDateContext(this.options);
    if (element === XMLToken.TABLE_ITERATION) return new ScXMLIterationContext(this.options);
    return this.createUnknownChildContext();
  }

  /** Skips unrecognized settings metadata. @returns Ignored child context. */
  override createUnknownChildContext(): SvXMLImportContext {
    this.GetScImport().unsupported("calculation settings child");
    return new SvXMLIgnoreContext(true);
  }

  /** Applies the native options update, including the live number formatter. @returns Nothing. */
  override endFastElement(): void {
    this.GetScImport().GetDocument().SetDocOptions(this.options);
  }
}

/** Imports the original null-date child into its parent settings. */
class ScXMLNullDateContext extends SvXMLImportContext {
  /** Binds the parent options. @param options - Parent options. @returns Context. */
  constructor(private readonly options: ScDocOptions) {
    super();
  }

  /** Keeps the current null date if the source date fails conversion. @param _element - Current token. @param attributes - Null date attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    attributes.assertOnly([XMLToken.TABLE_DATE_VALUE], "Calc null date");
    const value = attributes.get(XMLToken.TABLE_DATE_VALUE);
    const date = new DateTime();
    if (value !== null && Converter.parseDateTime(date, value))
      this.options.SetDate(date.Day, date.Month, date.Year);
  }
}

/** Imports the original numeric iteration settings independently of activation. */
class ScXMLIterationContext extends SvXMLImportContext {
  /** Binds the parent options. @param options - Parent options. @returns Context. */
  constructor(private readonly options: ScDocOptions) {
    super();
  }

  /** Applies the fast-attribute conversions and the original UInt16 count storage. @param _element - Current token. @param attributes - Iteration attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    attributes.assertOnly(
      [XMLToken.TABLE_STATUS, XMLToken.TABLE_STEPS, XMLToken.TABLE_MAXIMUM_DIFFERENCE],
      "Calc iteration settings",
    );
    if (attributes.get(XMLToken.TABLE_STATUS) === "enable") this.options.SetIter(true);
    const steps = attributes.getAsInteger(XMLToken.TABLE_STEPS);
    if (steps !== null) this.options.SetIterCount(steps);
    const difference = attributes.get(XMLToken.TABLE_MAXIMUM_DIFFERENCE);
    if (difference !== null)
      this.options.SetIterEps(toDouble(new TextEncoder().encode(difference)));
  }
}
