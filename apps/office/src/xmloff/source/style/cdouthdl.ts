/** @fileoverview Original crossed-out type/style/width/text XML handlers from cdouthdl.cxx,using actual UNO Any and ordered native maps. */
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontStrikeout as S } from "../../../offapi/com/sun/star/awt/FontStrikeout";
import type { SvXMLUnitConverter } from "../core/xmluconv";
/** Native ordered type map;first matching token wins on import. */
const typeMap: readonly (readonly [string, number])[] = [
  ["none", S.NONE],
  ["single", S.SINGLE],
  ["double", S.DOUBLE],
  ["single", S.BOLD],
  ["single", S.SLASH],
  ["single", S.X],
];
/** Native ordered style map,including supported lexical fallbacks to SINGLE. */
const styleMap: readonly (readonly [string, number])[] = [
  ["none", S.NONE],
  ["solid", S.SINGLE],
  ["solid", S.DOUBLE],
  ["solid", S.BOLD],
  ["solid", S.SLASH],
  ["solid", S.X],
  ["dotted", S.SINGLE],
  ["dash", S.SINGLE],
  ["long-dash", S.SINGLE],
  ["dot-dash", S.SINGLE],
  ["dot-dot-dash", S.SINGLE],
  ["wave", S.SINGLE],
];
/** Native ordered width map;thin/medium/thick import as NONE. */
const widthMap: readonly (readonly [string, number])[] = [
  ["auto", S.NONE],
  ["auto", S.SINGLE],
  ["auto", S.DOUBLE],
  ["bold", S.BOLD],
  ["auto", S.SLASH],
  ["auto", S.X],
  ["thin", S.NONE],
  ["medium", S.NONE],
  ["thick", S.NONE],
];
/** Merges one native enum property using the source candidate comparison and signed-short writeback. @param input - Lexical token. @param value - Actual shared property Any. @param map - Source ordered map. @param combine - Source merge rule. @returns Whether token conversion succeeded. */
function importStrikeout(
  input: string,
  value: Any,
  map: readonly (readonly [string, number])[],
  combine: (next: number, old: number) => number,
): boolean {
  for (const [token, next] of map)
    if (input === token) {
      const old: [number] = [0];
      if (value.extract(old, "sal_Int16") && old[0] !== S.NONE) {
        const result = combine(next, old[0]);
        if (result !== old[0]) value.insert([(result << 16) >> 16], "sal_Int16");
      } else value.insert([next], "sal_Int16");
      return true;
    }
  return false;
}
/** Original ordered enum export;failure leaves caller XML unchanged. @param output - XML output. @param line - Native value. @param map - Source ordered map. @returns Whether mapped. */
function exportStrikeout(
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
/** Native crossed-out type multi-property handler. */
export class XMLCrossedOutTypePropHdl {
  /** Retains native DOUBLE precedence over SINGLE/BOLD while preserving other existing styles. @param input - Token. @param value - Shared property. @param converter - Unused original converter. @returns Conversion success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    return importStrikeout(
      input,
      value,
      typeMap,
      /** Original reachable type switch;the ordered map admits only NONE/SINGLE/DOUBLE. @param next - New type. @param old - Existing value. @returns Merged value. */ (
        next,
        old,
      ) => (next === S.DOUBLE && (old === S.SINGLE || old === S.BOLD) ? next : old & 0xffff),
    );
  }
  /** Emits original type for all mapped values after native unsigned extraction. @param output - XML output. @param value - Actual Any. @param converter - Unused converter. @returns Whether emitted. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const line: [number] = [0];
    return value.extract(line, "sal_uInt16") && exportStrikeout(output, line[0], typeMap);
  }
}
/** Native crossed-out style multi-property handler. */
export class XMLCrossedOutStylePropHdl {
  /** Preserves any non-NONE existing style. @param input - Token. @param value - Shared property. @param converter - Unused converter. @returns Conversion success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    return importStrikeout(
      input,
      value,
      styleMap,
      /** Native nonzero-state preservation. @param next - New style. @param old - Existing value. @returns Existing value. */ (
        next,
        old,
      ) => {
        void next;
        return old;
      },
    );
  }
  /** Emits the original mapped style after unsigned extraction. @param output - XML output. @param value - Actual Any. @param converter - Unused converter. @returns Whether emitted. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const line: [number] = [0];
    return value.extract(line, "sal_uInt16") && exportStrikeout(output, line[0], styleMap);
  }
}
/** Native crossed-out width multi-property handler. */
export class XMLCrossedOutWidthPropHdl {
  /** BOLD upgrades only SINGLE;NONE and unsupported combinations retain existing styles. @param input - Token. @param value - Shared property. @param converter - Unused converter. @returns Conversion success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    return importStrikeout(
      input,
      value,
      widthMap,
      /** Original reachable width switch. @param next - New width. @param old - Existing style. @returns Merged style. */ (
        next,
        old,
      ) => (next === S.BOLD && old === S.SINGLE ? next : old & 0xffff),
    );
  }
  /** Original width export emits BOLD only. @param output - XML output. @param value - Actual Any. @param converter - Unused converter. @returns Whether emitted. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const line: [number] = [0];
    if (!value.extract(line, "sal_uInt16") || line[0] !== S.BOLD) return false;
    // The admitted source BOLD value has one guaranteed ordered-map entry.
    output[0] = "bold";
    return true;
  }
}
/** Native text strikeout handler;the first UTF16 code unit alone selects slash versus X. */
export class XMLCrossedOutTextPropHdl {
  /** Any nonempty value maps to SLASH when its first code unit is slash,otherwise X. @param input - Text. @param value - Actual property. @param converter - Unused converter. @returns Whether nonempty. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (!input.length) return false;
    value.insert([input.charCodeAt(0) === 47 ? S.SLASH : S.X], "sal_Int16");
    return true;
  }
  /** Emits only the source SLASH and X text markers after signed extraction. @param output - XML output. @param value - Actual property. @param converter - Unused converter. @returns Whether emitted. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const line: [number] = [0];
    if (!value.extract(line, "sal_Int16") || (line[0] !== S.SLASH && line[0] !== S.X)) return false;
    output[0] = line[0] === S.SLASH ? "/" : "X";
    return true;
  }
}
