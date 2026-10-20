/** @fileoverview Original underline type/style/width multi-property handlers over actual UNO Any; enum conversion uses original ordered maps. */
import type { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontUnderline as U } from "../../../offapi/com/sun/star/awt/FontUnderline";
/** Original ordered type map. */
const typeMap: readonly (readonly [string, number])[] = [
  ["none", U.NONE],
  ["single", U.SINGLE],
  ["double", U.DOUBLE],
  ["single", U.DOTTED],
  ["single", U.DASH],
  ["single", U.LONGDASH],
  ["single", U.DASHDOT],
  ["single", U.DASHDOTDOT],
  ["single", U.WAVE],
  ["single", U.BOLD],
  ["single", U.BOLDDOTTED],
  ["single", U.BOLDDASH],
  ["single", U.BOLDLONGDASH],
  ["single", U.BOLDDASHDOT],
  ["single", U.BOLDDASHDOTDOT],
  ["single", U.BOLDWAVE],
  ["double", U.DOUBLEWAVE],
  ["single", U.SMALLWAVE],
];
/** Original ordered style map. */
const styleMap: readonly (readonly [string, number])[] = [
  ["none", U.NONE],
  ["solid", U.SINGLE],
  ["solid", U.DOUBLE],
  ["dotted", U.DOTTED],
  ["dash", U.DASH],
  ["long-dash", U.LONGDASH],
  ["dot-dash", U.DASHDOT],
  ["dot-dot-dash", U.DASHDOTDOT],
  ["wave", U.WAVE],
  ["solid", U.BOLD],
  ["dotted", U.BOLDDOTTED],
  ["dash", U.BOLDDASH],
  ["long-dash", U.BOLDLONGDASH],
  ["dot-dash", U.BOLDDASHDOT],
  ["dot-dot-dash", U.BOLDDASHDOTDOT],
  ["wave", U.BOLDWAVE],
  ["wave", U.DOUBLEWAVE],
  ["small-wave", U.SMALLWAVE],
];
/** Original ordered width map. */
const widthMap: readonly (readonly [string, number])[] = [
  ["auto", U.NONE],
  ["auto", U.SINGLE],
  ["auto", U.DOUBLE],
  ["auto", U.DOTTED],
  ["auto", U.DASH],
  ["auto", U.LONGDASH],
  ["auto", U.DASHDOT],
  ["auto", U.DASHDOTDOT],
  ["auto", U.WAVE],
  ["bold", U.BOLD],
  ["bold", U.BOLDDOTTED],
  ["bold", U.BOLDDASH],
  ["bold", U.BOLDLONGDASH],
  ["bold", U.BOLDDASHDOT],
  ["bold", U.BOLDDASHDOTDOT],
  ["bold", U.BOLDWAVE],
  ["auto", U.DOUBLEWAVE],
  ["thin", U.NONE],
  ["medium", U.NONE],
  ["thick", U.BOLD],
];
/** Original enum import followed by multi-property merge into the same Any. @param input - XML token. @param value - Accumulated native line. @param map - Ordered source map. @param combine - Source merge body. @returns Success. */
function importLine(
  input: string,
  value: Any,
  map: readonly (readonly [string, number])[],
  combine: (next: number, old: number) => number,
): boolean {
  for (const [token, line] of map)
    if (input === token) {
      const old: [number] = [0];
      if (value.extract(old, "sal_Int16") && old[0] !== U.NONE) {
        const next = combine(line, old[0]);
        if (next !== old[0]) value.insert([next], "sal_Int16");
      } else value.insert([line], "sal_Int16");
      return true;
    }
  return false;
}
/** Original ordered enum export. @param output - XML destination. @param line - Native value. @param map - Source map. @returns Found. */
function exportLine(
  output: [string],
  line: number,
  map: readonly (readonly [string, number])[],
): boolean {
  for (const [token, value] of map)
    if (value === line) {
      output[0] = token;
      return true;
    }
  return false;
}
/** Original underline type multi-property handler. */
export class XMLUnderlineTypePropHdl {
  /** Merges native type with existing style/width. @param input - Token. @param value - Accumulated Any. @param unitConverter - Source converter contract; unused by this handler. @returns Success. */
  importXML(input: string, value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    return importLine(
      input,
      value,
      typeMap,
      /** Original three-value type switch; map excludes other values. @param next - New type. @param old - Existing line. @returns Merged line. */
      (next, old) => {
        if (next !== U.DOUBLE) return old;
        switch (old) {
          case U.SINGLE:
          case U.BOLD:
            return next;
          case U.WAVE:
          case U.BOLDWAVE:
            return U.DOUBLEWAVE;
          default:
            return old;
        }
      },
    );
  }
  /** Native type export emits only double/doublewave. @param output - XML. @param value - Any. @param unitConverter - Source converter contract; unused by this handler. @returns Whether emitted. */
  exportXML(output: [string], value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const line: [number] = [0];
    if (!value.extract(line, "sal_uInt16") || (line[0] !== U.DOUBLE && line[0] !== U.DOUBLEWAVE))
      return false;
    // Both admitted source values map to double; enum lookup cannot fail.
    output[0] = "double";
    return true;
  }
}
/** Original underline style multi-property handler. */
export class XMLUnderlineStylePropHdl {
  /** Merges style with existing type/width. @param input - Token. @param value - Accumulated Any. @param unitConverter - Source converter contract; unused by this handler. @returns Success. */
  importXML(input: string, value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    return importLine(
      input,
      value,
      styleMap,
      /** Original style switch preserves double/bold precedence. @param next - New style. @param old - Existing line. @returns Merged line. */
      (next, old) => {
        switch (next) {
          case U.NONE:
          case U.SINGLE:
            return old;
          case U.DOTTED:
            return old === U.BOLD ? U.BOLDDOTTED : next;
          case U.DASH:
            return old === U.BOLD ? U.BOLDDASH : next;
          case U.LONGDASH:
            return old === U.BOLD ? U.BOLDLONGDASH : next;
          case U.DASHDOT:
            return old === U.BOLD ? U.BOLDDASHDOT : next;
          case U.DASHDOTDOT:
            return old === U.BOLD ? U.BOLDDASHDOTDOT : next;
          case U.WAVE:
            return old === U.DOUBLE ? U.DOUBLEWAVE : old === U.BOLD ? U.BOLDWAVE : next;
          default:
            return next;
        }
      },
    );
  }
  /** Native ordered style export. @param output - XML. @param value - Any. @param unitConverter - Source converter contract; unused by this handler. @returns Success. */
  exportXML(output: [string], value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const line: [number] = [0];
    return value.extract(line, "sal_uInt16") && exportLine(output, line[0], styleMap);
  }
}
/** Original underline width multi-property handler. */
export class XMLUnderlineWidthPropHdl {
  /** Merges width while retaining native double/style priority. @param input - Token. @param value - Accumulated Any. @param unitConverter - Source converter contract; unused by this handler. @returns Success. */
  importXML(input: string, value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    return importLine(
      input,
      value,
      widthMap,
      /** Original two-value width switch; map admits NONE or BOLD. @param next - Width classification. @param old - Existing line. @returns Merged line. */
      (next, old) => {
        if (next === U.NONE) return old;
        switch (old) {
          case U.SINGLE:
            return next;
          case U.DOTTED:
            return U.BOLDDOTTED;
          case U.DASH:
            return U.BOLDDASH;
          case U.LONGDASH:
            return U.BOLDLONGDASH;
          case U.DASHDOT:
            return U.BOLDDASHDOT;
          case U.DASHDOTDOT:
            return U.BOLDDASHDOTDOT;
          case U.WAVE:
            return U.BOLDWAVE;
          default:
            return old;
        }
      },
    );
  }
  /** Native width export omits NONE. @param output - XML. @param value - Any. @param unitConverter - Source converter contract; unused by this handler. @returns Success. */
  exportXML(output: [string], value: Any, unitConverter: SvXMLUnitConverter): boolean {
    void unitConverter;
    const line: [number] = [0];
    return (
      value.extract(line, "sal_uInt16") &&
      line[0] !== U.NONE &&
      exportLine(output, line[0], widthMap)
    );
  }
}
