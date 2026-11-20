/** @fileoverview Worksheet header/footer token parsing into Calc's native edit objects. */
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { EE_FEATURE_FIELD } from "../../../../editeng/inc/eeitem";
import {
  SvxPageField,
  SvxPagesField,
  SvxTableField,
  SvxFieldItem,
} from "../../../../editeng/inc/flditem";
import { CH_FEATURE } from "../../../../editeng/inc/editattr";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScDocument } from "../../../inc/document";
import { ScPageHFItem } from "../../../inc/attrib";
import { Font, type StylesBuffer } from "./stylesbuffer";
import { XlsColor } from "./stylesbuffer.color";

const portions = ["L", "C", "R"] as const;
/** Original left, center and right portion selectors. */
type Portion = (typeof portions)[number];

const boldNames = new Set(["bold", "fett", "demibold", "halbfett", "black", "heavy", "félkövér"]);
const italicNames = new Set(["italic", "kursiv", "oblique", "schrÄg", "schräg", "dőlt"]);

/** A single native edit paragraph and its physical height in twips. */
interface Paragraph {
  content: ReturnType<EditTextObjectImpl["CreateAndInsertContent"]>;
  text: string;
  height: number;
}

/** Parses Excel section controls and rich text into the page style's three native text objects. */
export class HeaderFooterParser {
  /** Binds the destination edit pool and workbook font defaults. @param document - Actual workbook. @param styles - Imported workbook styles. @returns Parser. */
  constructor(
    private readonly document: ScDocument,
    private readonly styles: StylesBuffer,
  ) {}

  /** Writes a header or footer occurrence and returns its tallest portion. @param source - Worksheet header/footer string. @param target - Native page style item identity. @returns Owned item and tallest content in twips. */
  parse(source: string, target: number): { content: ScPageHFItem; height: number } {
    const pool = this.document.GetEditEnginePool();
    const createPortion =
      /** Creates an independent native text value and first paragraph. @returns Editable portion. */ () => {
        const model = new EditTextObjectImpl(
          pool,
          MapUnit.MapTwip,
          false,
          TextRotation.NONE,
          SvtScriptType.NONE,
        );
        const current: Paragraph = { content: model.CreateAndInsertContent(), text: "", height: 0 };
        return { model, current, paragraphs: [current] };
      };
    const areas = { L: createPortion(), C: createPortion(), R: createPortion() };
    const base = this.styles.getDefaultFont() ?? new Font(this.styles.graphicHelper);
    let font = base.clone();
    let portion: Portion = "C";
    let buffer = "";
    const add =
      /** Commits text and formatting to the current native paragraph. @param value - Literal text or field character. @param field - Optional native field item. @returns Nothing. */ (
        value: string,
        field?: SvxFieldItem,
      ): void => {
        if (!value) return;
        const { model, current: paragraph } = areas[portion];
        const first = paragraph.text.length;
        paragraph.text += value;
        paragraph.height = Math.max(paragraph.height, font.getHeight());
        const items = new SfxItemSet(pool);
        try {
          font.fillToItemSet(items, true);
          const attributes = paragraph.content.GetCharAttribs();
          for (const item of items.entries())
            attributes.push(model.CreateAttrib(item, first, paragraph.text.length));
          if (field) attributes.push(model.CreateAttrib(field, first, paragraph.text.length));
        } finally {
          items.Dispose();
        }
      };
    const flush =
      /** Applies the current font to pending literal characters. @returns Nothing. */ (): void => {
        add(buffer);
        buffer = "";
      };
    const nul = source.indexOf("\0");
    if (nul !== -1) source = source.slice(0, nul);
    try {
      for (let i = 0; i < source.length; ++i) {
        const ch = source[i];
        if (ch === "\n") {
          flush();
          const area = areas[portion];
          area.current.height ||= font.getHeight();
          area.current = {
            content: area.model.CreateAndInsertContent(),
            text: "",
            height: 0,
          };
          area.paragraphs.push(area.current);
        } else if (ch !== "&") buffer += ch;
        else {
          flush();
          const token = source.charAt(++i);
          const code = token >= "a" && token <= "z" ? token.toUpperCase() : token;
          if (code === "&") buffer += "&";
          else if (code === "L" || code === "C" || code === "R") {
            if (portion !== code) {
              portion = code;
              font = base.clone();
            }
          } else if (code === "P" || code === "N" || code === "A") {
            const field =
              code === "P"
                ? new SvxPageField()
                : code === "N"
                  ? new SvxPagesField()
                  : new SvxTableField();
            add(String.fromCharCode(CH_FEATURE), new SvxFieldItem(field, EE_FEATURE_FIELD));
          } else if (code === "K") {
            if (i + 6 < source.length) {
              font.setColor(XlsColor.importHeaderFooterColor(source.slice(i + 1, i + 7)));
              i += 6;
            }
          } else if (code === '"') {
            const end = source.indexOf('"', i + 1);
            if (end === -1) break;
            const specification = source.slice(i + 1, end);
            const comma = specification.indexOf(",");
            const name = comma === -1 ? specification : specification.slice(0, comma);
            if (name)
              font.importAttribs("rFont", name === "-" ? base.getVclFont().GetFamilyName() : name);
            if (comma !== -1) {
              const style = specification
                .slice(comma + 1)
                .replace(
                  /[A-Z]/gu,
                  /** Lowercases ASCII as in the native style token. @param value - ASCII letter. @returns Lowercase letter. */ (
                    value,
                  ) => value.toLowerCase(),
                )
                .split(" ");
              font.importAttribs(
                "b",
                style.some(
                  /** Matches the native bold names. @param name - Font style word. @returns Whether bold. */ (
                    name,
                  ) => boldNames.has(name),
                )
                  ? "1"
                  : "0",
              );
              font.importAttribs(
                "i",
                style.some(
                  /** Matches the native italic names. @param name - Font style word. @returns Whether italic. */ (
                    name,
                  ) => italicNames.has(name),
                )
                  ? "1"
                  : "0",
              );
            }
            i = end;
          } else if (code >= "0" && code <= "9") {
            const start = i;
            while (source.charAt(i + 1) >= "0" && source.charAt(i + 1) <= "9") ++i;
            const size = source.slice(start, i + 1);
            const points = Number(size);
            if (i + 1 < source.length && points > 0 && points <= 1000)
              font.importAttribs("sz", size);
          } else font.toggleHeaderFooter(code);
        }
      }
      flush();
      let height = 0;
      for (const portion of portions) {
        let total = 0;
        for (const paragraph of areas[portion].paragraphs) {
          const value = unicode(paragraph.text);
          try {
            paragraph.content.SetText(value);
          } finally {
            value.dispose();
          }
          total += paragraph.height || font.getHeight();
        }
        height = Math.max(total, height);
      }
      const content = new ScPageHFItem(target);
      content.SetLeftArea(areas.L.model);
      content.SetCenterArea(areas.C.model);
      content.SetRightArea(areas.R.model);
      return { content, height };
    } finally {
      for (const portion of portions) areas[portion].model.dispose();
    }
  }
}
