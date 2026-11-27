/** @fileoverview Represented ScDocumentConfiguration properties from native confuno.cxx. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { Color, ColorToAny, extractColor } from "../../../../tools/inc/color";
import type { ScDocument } from "../../../inc/document";
import { ScGridOptions, ViewOption } from "../../../inc/viewopti";
import { ScCalcConfig } from "../../core/tool/calcconfig";

/** The original configuration booleans backed by ScViewOptions. */
export const configurationViewOptions: ReadonlyMap<string, ViewOption> = new Map([
  ["ShowZeroValues", ViewOption.NULLVALS],
  ["ShowNotes", ViewOption.NOTES],
  ["ShowNoteAuthor", ViewOption.NOTEAUTHOR],
  ["ShowFormulasMarks", ViewOption.FORMULAS_MARKS],
  ["ShowGrid", ViewOption.GRID],
  ["ShowPageBreaks", ViewOption.PAGEBREAKS],
  ["HasColumnRowHeaders", ViewOption.HEADER],
  ["HasSheetTabs", ViewOption.TABCONTROLS],
  ["IsOutlineSymbolsSet", ViewOption.OUTLINER],
]);

const rasterProperties = [
  "IsSnapToRaster",
  "RasterIsVisible",
  "RasterResolutionX",
  "RasterResolutionY",
  "RasterSubdivisionX",
  "RasterSubdivisionY",
  "IsRasterAxisSynchronized",
] as const;

/** The original raster property names stored in both the view and configuration groups. */
type RasterProperty = (typeof rasterProperties)[number];

const configurationProperties = new Set([
  ...configurationViewOptions.keys(),
  "GridColor",
  ...rasterProperties,
  "AutoCalculate",
  "SyntaxStringRef",
]);
const address = FormulaGrammar.AddressConvention;

/** Checks the native explicit SyntaxStringRef values. @param convention - Original numeric property. @returns Whether the value is represented in the document setting. */
function isConfigurationStringRefSyntax(
  convention: number,
): convention is
  | typeof address.CONV_OOO
  | typeof address.CONV_XL_A1
  | typeof address.CONV_XL_R1C1
  | typeof address.CONV_A1_XL_A1 {
  return (
    convention === address.CONV_OOO ||
    convention === address.CONV_XL_A1 ||
    convention === address.CONV_XL_R1C1 ||
    convention === address.CONV_A1_XL_A1
  );
}

/** Reads the native bool with the Calc UNO fallback. @param value - Native property. @returns Whether the extracted value is true. */
function getBool(value: Any): boolean {
  const result: [boolean] = [false];
  return value.extract(result, "bool") && result[0];
}

/** Reads the native 32-bit scalar with the Calc UNO fallback. @param value - Native property. @returns Extracted value or zero. */
function getInt32(value: Any): number {
  const result: [number] = [0];
  value.extract(result, "sal_Int32");
  return result[0];
}

/** Transfers a raster property to the native grid value. @param grid - Destination options. @param name - Calc UNO property name. @param value - Original property. @returns Nothing. */
function setRasterProperty(grid: ScGridOptions, name: RasterProperty, value: Any): void {
  switch (name) {
    case "IsSnapToRaster":
      grid.SetUseGridSnap(getBool(value));
      break;
    case "RasterIsVisible":
      grid.SetGridVisible(getBool(value));
      break;
    case "RasterResolutionX":
      grid.SetFieldDrawX(getInt32(value));
      break;
    case "RasterResolutionY":
      grid.SetFieldDrawY(getInt32(value));
      break;
    case "RasterSubdivisionX":
      grid.SetFieldDivisionX(getInt32(value));
      break;
    case "RasterSubdivisionY":
      grid.SetFieldDivisionY(getInt32(value));
      break;
    case "IsRasterAxisSynchronized":
      grid.SetSynchronize(getBool(value));
      break;
  }
}

/** Returns a raster property at its original UNO width. @param grid - Source options. @param name - Calc UNO property name. @returns Owned scalar. */
function getRasterProperty(grid: Readonly<ScGridOptions>, name: RasterProperty): Any {
  switch (name) {
    case "IsSnapToRaster":
      return new Any(grid.GetUseGridSnap());
    case "RasterIsVisible":
      return new Any(grid.GetGridVisible());
    case "RasterResolutionX":
      return new Any([grid.GetFieldDrawX() | 0], "sal_Int32");
    case "RasterResolutionY":
      return new Any([grid.GetFieldDrawY() | 0], "sal_Int32");
    case "RasterSubdivisionX":
      return new Any([grid.GetFieldDivisionX() | 0], "sal_Int32");
    case "RasterSubdivisionY":
      return new Any([grid.GetFieldDivisionY() | 0], "sal_Int32");
    case "IsRasterAxisSynchronized":
      return new Any(grid.GetSynchronize());
  }
}

/** Original document configuration over the same owners as ordinary Calc options. */
export class ScDocumentConfiguration {
  /** Borrows the actual destination document. @param document - Native workbook. @returns Configuration owner. */
  constructor(private readonly document: ScDocument) {}

  /** Reads one native configuration property. @param name - Calc UNO property name. @returns Owned property value. */
  getPropertyValue(name: string): Any {
    const options = this.document.GetViewOptions();
    const flag = configurationViewOptions.get(name);
    if (flag !== undefined) return new Any(options.GetOption(flag));
    if (name === "GridColor") return ColorToAny(options.GetGridColor());
    if (name === "AutoCalculate") return new Any(this.document.GetAutoCalc());
    if (name === "SyntaxStringRef") {
      const config = this.document.GetCalcConfig();
      const convention =
        config.meStringRefAddressSyntax === address.CONV_UNSPECIFIED
          ? this.document.GetAddressConvention()
          : config.meStringRefAddressSyntax;
      if (!config.mbHasStringRefSyntax && convention === address.CONV_OOO) return new Any();
      return new Any([isConfigurationStringRefSyntax(convention) ? convention : 9999], "sal_Int16");
    }
    if (configurationProperties.has(name))
      return getRasterProperty(options.GetGridOptions(), name as RasterProperty);
    throw new Error(`Unsupported Calc configuration property: ${name}`);
  }

  /** Writes one native property with the original typing and defaulting rules. @param name - Calc UNO property name. @param value - Borrowed property. @returns Nothing. */
  setPropertyValue(name: string, value: Any): void {
    const options = this.document.GetViewOptions();
    const flag = configurationViewOptions.get(name);
    if (flag !== undefined) options.SetOption(flag, getBool(value));
    else if (name === "GridColor") {
      const color = new Color();
      if (extractColor(value, color)) options.SetGridColor(color);
    } else if (name === "AutoCalculate") this.document.SetAutoCalc(getBool(value));
    else if (name === "SyntaxStringRef") {
      const syntax: [number] = [0];
      if (value.extract(syntax, "sal_Int16")) {
        const config = new ScCalcConfig(this.document.GetCalcConfig());
        try {
          config.SetStringRefSyntax(
            isConfigurationStringRefSyntax(syntax[0]) ? syntax[0] : address.CONV_UNSPECIFIED,
          );
          this.document.SetCalcConfig(config);
        } finally {
          config.dispose();
        }
      }
    } else if (configurationProperties.has(name)) {
      const grid = new ScGridOptions(options.GetGridOptions());
      setRasterProperty(grid, name as RasterProperty, value);
      options.SetGridOptions(grid);
    } else throw new Error(`Unsupported Calc configuration property: ${name}`);
  }

  /** Reports whether the represented native service exposes this name. @param name - Original property name. @returns Whether the property is supported. */
  hasPropertyByName(name: string): boolean {
    return configurationProperties.has(name);
  }

  /** Enumerates the represented original property map. @returns Native property names. */
  getPropertyNames(): Iterable<string> {
    return configurationProperties;
  }
}
