/** @fileoverview RtfDocumentImpl dispatch implementation, called with the original native owner as this. */
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop } from "../../../../editeng/inc/tstpitem";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
import { RTF_CHARSET_CODEPAGE } from "./rtfcharsets";
import {
  CHARACTER_PROPERTY_CONTROLS,
  DEFAULT_CHARACTER,
  DEFAULT_PARAGRAPH,
  fromRtfBorderStyle,
  fromRtfNfc,
  parseRtfHyperlinkInstruction,
  RTF_UNDERLINE_STYLES,
  SKIPPED_DESTINATIONS,
  STYLE_PROPERTY_CONTROLS,
  type RtfCellBorder,
  type RtfDocumentImplContext,
  type RtfSectionPage,
  type RtfState,
} from "./rtfdocumentimpl.context";
import { RtfSyntaxError, type RtfToken } from "./rtftokenizer";

/** Dispatches one lexical event under the current group state. @param token - Source event.  @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function Dispatch(this: RtfDocumentImplContext, token: RtfToken): void {
  if (token.kind === "group-start") {
    const previous = this["states"].at(-1);
    this["states"].push({
      destination: previous?.destination ?? "body",
      starred: false,
      character: { ...(previous?.character ?? DEFAULT_CHARACTER) },
      paragraph: { ...(previous?.paragraph ?? DEFAULT_PARAGRAPH) },
      fontIndex: previous?.fontIndex ?? 0,
      currentCodepage: previous?.currentCodepage ?? this["defaultCodepage"],
      ...(previous?.fontCodepage === undefined ? {} : { fontCodepage: previous.fontCodepage }),
      colorIndex: previous?.colorIndex ?? 0,
      ...(previous?.field === undefined ? {} : { field: previous.field }),
      ...(previous?.hyperlink === undefined ? {} : { hyperlink: previous.hyperlink }),
      ...(previous?.styleIndex === undefined ? {} : { styleIndex: previous.styleIndex }),
      ...(previous?.basedOnStyleIndex === undefined
        ? {}
        : { basedOnStyleIndex: previous.basedOnStyleIndex }),
      ...(previous?.nextStyleIndex === undefined
        ? {}
        : { nextStyleIndex: previous.nextStyleIndex }),
      styleControls: new Set(previous?.styleControls),
      characterControls: new Set(previous?.characterControls),
    });
    return;
  }
  if (token.kind === "group-end") {
    if (this["states"].length === 1 && this["runs"].length > 0)
      this["CommitParagraph"](this["states"][0]);
    const previous = this["states"].pop();
    if (previous?.destination === "fonttbl" && previous.fontIndex >= 0)
      this["CommitFont"](previous);
    if (previous?.destination === "styleentry" && previous.styleIndex !== undefined) {
      const name = previous.styleName?.split(";")[0]?.trim();
      if (name !== undefined && name.length > 0)
        this["styles"].set(previous.styleIndex, {
          name,
          character: { ...previous.character },
          paragraph: { ...previous.paragraph },
          controls: new Set(previous.styleControls),
          ...(previous.basedOnStyleIndex === undefined
            ? {}
            : { basedOnStyleIndex: previous.basedOnStyleIndex }),
          ...(previous.nextStyleIndex === undefined
            ? {}
            : { nextStyleIndex: previous.nextStyleIndex }),
        });
    }
    if (previous?.destination === "bookmarkstart") {
      const name = previous.bookmarkName?.trim();
      if (name !== undefined && name.length > 0)
        this["marks"].push({
          name,
          offset: this["runs"].reduce(
            /** Computes the length result. @param length - Length. @param run - Run. @returns The computed result. */ (
              length,
              run,
            ) => length + run.text.length,
            0,
          ),
        });
    }
    if (previous?.destination === "leveltext") {
      const glyph = [...(previous.levelText ?? "")].find(
        /** Computes the value result. @param value - Value. @returns The computed result. */ (
          value,
        ) => (value.codePointAt(0) ?? 0) > 0x20 && value !== ";",
      );
      if (glyph !== undefined) {
        const level = this["currentListLevels"].at(-1);
        const bullet = glyph.codePointAt(0);
        if (level !== undefined && bullet !== undefined) level.bullet = bullet;
      }
    }
    if (previous?.destination === "list")
      this["listFormats"].set(this["currentListId"], [...this["currentListLevels"]]);
    if (previous?.destination === "listoverride")
      this["listOverrides"].set(this["currentOverrideIndex"], this["currentOverrideListId"]);
    if (previous?.destination === "fldinst" && previous.field !== undefined) {
      const hyperlink = parseRtfHyperlinkInstruction(previous.field.instruction);
      if (hyperlink !== undefined) previous.field.hyperlink = hyperlink;
    }
    return;
  }
  const state = this["states"].at(-1);
  if (state === undefined) throw new RtfSyntaxError("RTF content is outside the root group.");
  if (token.kind === "hex-break") {
    // resolveChars converts hex CR and LF into separate PAR controls except
    // in destinations such as LEVELTEXT, where their bytes remain data.
    if (state.destination === "body") this["DispatchBodyControl"]("par", undefined, state);
    else if (state.destination === "leveltext")
      state.levelText = (state.levelText ?? "") + token.value;
    return;
  }
  if (token.kind === "text" || token.kind === "ansi-bytes") {
    const value = token.kind === "text" ? token.value : this["DecodeBytes"](token.value, state);
    if (state.destination === "fonttbl") this["ReadFontText"](value, state);
    else if (state.destination === "styleentry") state.styleName = (state.styleName ?? "") + value;
    else if (state.destination === "bookmarkstart" || state.destination === "bookmarkend")
      state.bookmarkName = (state.bookmarkName ?? "") + value;
    else if (state.destination === "leveltext") state.levelText = (state.levelText ?? "") + value;
    else if (state.destination === "colortbl") this["ReadColorText"](value);
    else if (state.destination === "fldinst" && state.field !== undefined)
      state.field.instruction += value;
    else if (state.destination === "body") this["AppendText"](value, state);
    return;
  }
  if (token.name === "*") {
    state.starred = true;
    return;
  }
  if (token.name === "rtf") {
    this["sawHeader"] = token.parameter === 1;
    return;
  }
  if (token.name === "deff" && token.parameter !== undefined) {
    this["defaultFontIndex"] = token.parameter;
    return;
  }
  if (token.name === "ansi") {
    state.currentCodepage = 1252;
    return;
  }
  if (token.name === "mac" || token.name === "pc" || token.name === "pca") {
    this["defaultCodepage"] = token.name === "mac" ? 10000 : token.name === "pc" ? 437 : 850;
    state.currentCodepage = this["defaultCodepage"];
    return;
  }
  if (token.name === "ansicpg" && token.parameter !== undefined) {
    this["defaultCodepage"] = token.parameter === 0 ? 1252 : token.parameter;
    state.currentCodepage = this["defaultCodepage"];
    return;
  }
  if (token.name === "cpg" && token.parameter !== undefined) {
    state.currentCodepage = token.parameter === 0 ? 1252 : token.parameter;
    if (state.destination === "fonttbl") state.fontCodepage = state.currentCodepage;
    return;
  }
  if (token.name === "fcharset" && token.parameter !== undefined) {
    const codepage = RTF_CHARSET_CODEPAGE.get(token.parameter);
    if (codepage !== undefined) {
      state.currentCodepage = codepage === 0 ? this["defaultCodepage"] : codepage;
      if (state.destination === "fonttbl") state.fontCodepage = state.currentCodepage;
    }
    return;
  }
  if (token.name === "field" && state.destination === "body") {
    state.destination = "field";
    state.field = { instruction: "" };
    return;
  }
  if (token.name === "fldinst" && state.destination === "field") {
    state.destination = "fldinst";
    state.starred = false;
    return;
  }
  if (token.name === "fldrslt" && state.destination === "field") {
    state.destination = "body";
    if (state.field?.hyperlink !== undefined) state.hyperlink = state.field.hyperlink;
    else Reflect.deleteProperty(state, "hyperlink");
    return;
  }
  if (token.name === "updnprop" && token.parameter !== undefined && state.starred) {
    this["pendingUpDn"] = {
      height: Math.floor(token.parameter / 100),
      automatic: token.parameter % 100 === 1,
    };
    state.starred = false;
    return;
  }
  if (state.destination === "body" && (token.name === "bkmkstart" || token.name === "bkmkend")) {
    state.destination = token.name === "bkmkstart" ? "bookmarkstart" : "bookmarkend";
    state.bookmarkName = "";
    state.starred = false;
    return;
  }
  if (
    token.name === "fonttbl" ||
    token.name === "colortbl" ||
    token.name === "stylesheet" ||
    token.name === "listtable" ||
    token.name === "listoverridetable"
  ) {
    state.destination = token.name;
    state.starred = false;
    return;
  }
  if (state.destination === "stylesheet" && token.name === "s") {
    state.destination = "styleentry";
    state.styleIndex = token.parameter ?? 0;
    state.styleName = "";
    state.styleControls = new Set();
    delete state.basedOnStyleIndex;
    delete state.nextStyleIndex;
    return;
  }
  if (state.destination === "styleentry") {
    if (token.name === "sbasedon") {
      if (token.parameter !== undefined) state.basedOnStyleIndex = token.parameter;
      return;
    }
    if (token.name === "snext") {
      if (token.parameter !== undefined) state.nextStyleIndex = token.parameter;
      return;
    }
    if (STYLE_PROPERTY_CONTROLS.has(token.name)) {
      state.styleControls.add(token.name);
      this["DispatchBodyControl"](token.name, token.parameter, state);
    }
    return;
  }
  if (state.destination === "stylesheet") return;
  if (state.destination === "listtable" && token.name === "list") {
    state.destination = "list";
    this["currentListId"] = 0;
    this["currentListLevels"] = [];
    return;
  }
  if (state.destination === "list" && token.name === "listlevel") {
    state.destination = "listlevel";
    this["currentListLevels"].push({
      kind: "numbered",
      start: 1,
      numberingType: SvxNumType.SVX_NUM_ARABIC,
    });
    return;
  }
  if (state.destination === "listlevel" && token.name === "leveltext") {
    state.destination = "leveltext";
    state.levelText = "";
    return;
  }
  if (state.destination === "listoverridetable" && token.name === "listoverride") {
    state.destination = "listoverride";
    this["currentOverrideListId"] = 0;
    this["currentOverrideIndex"] = 0;
    return;
  }
  if (SKIPPED_DESTINATIONS.has(token.name) || state.starred) {
    state.destination = "skip";
    state.starred = false;
    return;
  }
  if (state.destination === "fonttbl") {
    if (token.name === "f" && token.parameter !== undefined) {
      this["CommitFont"](state);
      state.fontIndex = token.parameter;
      Reflect.deleteProperty(state, "fontCodepage");
    }
    return;
  }
  if (state.destination === "colortbl") {
    if (token.name === "red") this["color"].red = token.parameter ?? 0;
    else if (token.name === "green") this["color"].green = token.parameter ?? 0;
    else if (token.name === "blue") this["color"].blue = token.parameter ?? 0;
    return;
  }
  if (state.destination === "list" || state.destination === "listlevel") {
    if (token.name === "listid") this["currentListId"] = token.parameter ?? 0;
    else if (token.name === "levelnfc") {
      const level = this["currentListLevels"].at(-1);
      if (level !== undefined) {
        level.kind = token.parameter === 23 ? "bullet" : "numbered";
        level.numberingType = fromRtfNfc(token.parameter ?? 0);
      }
    } else if (token.name === "levelstartat") {
      const level = this["currentListLevels"].at(-1);
      if (level !== undefined && token.parameter !== undefined)
        level.start = Math.max(0, token.parameter);
    }
    return;
  }
  if (state.destination === "leveltext") return;
  if (state.destination === "listoverride") {
    if (token.name === "listid") this["currentOverrideListId"] = token.parameter ?? 0;
    else if (token.name === "ls") this["currentOverrideIndex"] = token.parameter ?? 0;
    return;
  }
  if (state.destination === "listtable" || state.destination === "listoverridetable") return;
  if (state.destination === "skip") return;
  this["DispatchBodyControl"](token.name, token.parameter, state);
}

/** Applies one represented body control. @param name - RTF control. @param parameter - Optional value. @param state - Current group.  @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function DispatchBodyControl(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): void {
  if (CHARACTER_PROPERTY_CONTROLS.has(name)) state.characterControls.add(name);
  if (name === "sect") {
    if (this["runs"].length > 0) this["CommitParagraph"](state);
    this["FlushTable"]();
    this["currentSection"]++;
    this["sectionPages"].push({ ...this["defaultSectionPage"] });
    this["terminatedParagraph"] = true;
    return;
  }
  if (name === "sectd") {
    this["sectionPages"][this["currentSection"]] = { ...this["defaultSectionPage"] };
    this["sectionPageRestarts"].delete(this["currentSection"]);
    return;
  }
  if (name === "pgnrestart") {
    this["sectionPageRestarts"].add(this["currentSection"]);
    return;
  }
  {
    const page = this["sectionPages"][this["currentSection"]] as RtfSectionPage;
    if (name === "landscape" || name === "lndscpsxn") {
      page.landscape = true;
      if (name === "landscape") this["defaultSectionPage"].landscape = true;
    } else if (parameter !== undefined) {
      switch (name) {
        case "paperw":
          this["defaultSectionPage"].width = parameter;
          page.width = parameter;
          break;
        case "pgwsxn":
          page.width = parameter;
          break;
        case "paperh":
          this["defaultSectionPage"].height = parameter;
          page.height = parameter;
          break;
        case "pghsxn":
          page.height = parameter;
          break;
        case "margl":
          this["defaultSectionPage"].leftMargin = parameter;
          page.leftMargin = parameter;
          break;
        case "marglsxn":
          page.leftMargin = parameter;
          break;
        case "margr":
          this["defaultSectionPage"].rightMargin = parameter;
          page.rightMargin = parameter;
          break;
        case "margrsxn":
          page.rightMargin = parameter;
          break;
        case "margt":
          this["defaultSectionPage"].topMargin = parameter;
          page.topMargin = parameter;
          break;
        case "margtsxn":
          page.topMargin = parameter;
          break;
        case "margb":
          this["defaultSectionPage"].bottomMargin = parameter;
          page.bottomMargin = parameter;
          break;
        case "margbsxn":
          page.bottomMargin = parameter;
          break;
      }
    }
  }
  if (name === "deftab" && parameter !== undefined) {
    this["defaultTabStop"] = parameter;
    return;
  }
  if (name === "pagebb") {
    if (!this["firstRun"])
      state.paragraph = {
        ...state.paragraph,
        pageBreakBefore: true,
        pageBreakBeforeSet: true,
      };
    return;
  }
  if (name === "page" || name === "column") {
    // The represented document has one column: pinned COLUMN dispatches PAGE.
    // PAGE is ignored while the RTF table buffer owns the current row.
    if (this["inTable"]) return;
    if (this["runs"].length > 0 || (this["pendingPageBreak"] && this["tableRows"].length === 0))
      this["CommitParagraph"](state);
    if (this["tableRows"].length > 0) this["FlushTable"]();
    this["pendingPageBreak"] = true;
    return;
  }
  if (name === "trowd") {
    this["inTable"] = true;
    this["rowBoundaries"] = [];
    this["rowAlignment"] = "left";
    this["rowLeft"] = 0;
    this["rowHeight"] = 0;
    this["rowSplit"] = true;
    this["rowHeader"] = false;
    this["rowVerticals"] = [];
    this["nextCellVertical"] = undefined;
    this["rowBorders"] = [];
    this["nextCellBorders"] = new Map();
    this["activeBorder"] = undefined;
    this["rowPaddings"] = [];
    this["nextCellPaddings"] = new Map();
    this["rowDefaultPaddings"] = new Map();
    return;
  }
  if (name === "trpaddt" || name === "trpaddl" || name === "trpaddb" || name === "trpaddr") {
    const edge =
      name === "trpaddt"
        ? SvxBoxItemLine.TOP
        : name === "trpaddl"
          ? SvxBoxItemLine.LEFT
          : name === "trpaddb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    this["rowDefaultPaddings"].set(edge, parameter ?? 0);
    return;
  }
  if (name === "clpadl" || name === "clpadt" || name === "clpadb" || name === "clpadr") {
    const edge =
      name === "clpadl"
        ? SvxBoxItemLine.TOP
        : name === "clpadt"
          ? SvxBoxItemLine.LEFT
          : name === "clpadb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    this["nextCellPaddings"].set(edge, parameter ?? 0);
    return;
  }
  if (name === "clbrdrt" || name === "clbrdrl" || name === "clbrdrb" || name === "clbrdrr") {
    const edge =
      name === "clbrdrt"
        ? SvxBoxItemLine.TOP
        : name === "clbrdrl"
          ? SvxBoxItemLine.LEFT
          : name === "clbrdrb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    const border: RtfCellBorder = {
      style: BorderLineStyle.SOLID,
      width: 0,
      colorIndex: 0,
      wordStyle: 0,
    };
    this["nextCellBorders"].set(edge, border);
    this["activeBorder"] = border;
    return;
  }
  if (this["activeBorder"] !== undefined && name.startsWith("brdr")) {
    if (name === "brdrw") this["activeBorder"].width = parameter ?? 0;
    else if (name === "brdrcf") this["activeBorder"].colorIndex = parameter ?? 0;
    else if (name === "brdrth") this["activeBorder"].wordStyle = 2;
    else if (name === "brdrhair") {
      this["activeBorder"].style = BorderLineStyle.SOLID;
      this["activeBorder"].wordStyle = 5;
    } else this["activeBorder"].style = fromRtfBorderStyle(name);
    return;
  }
  if (name === "clvertalt" || name === "clvertalc" || name === "clvertalb") {
    this["nextCellVertical"] =
      name === "clvertalc"
        ? VertOrientation.CENTER
        : name === "clvertalb"
          ? VertOrientation.BOTTOM
          : VertOrientation.TOP;
    return;
  }
  if (name === "trrh") {
    this["rowHeight"] = parameter ?? 0;
    return;
  }
  if (name === "trkeep") {
    this["rowSplit"] = false;
    return;
  }
  if (name === "trhdr") {
    this["rowHeader"] = true;
    return;
  }
  if (name === "trql" || name === "trqc" || name === "trqr") {
    this["rowAlignment"] = name === "trqc" ? "center" : name === "trqr" ? "right" : "left";
    return;
  }
  if (name === "trleft") {
    this["rowLeft"] = parameter ?? 0;
    return;
  }
  if (name === "cellx") {
    if (parameter !== undefined) {
      this["rowBoundaries"].push(parameter);
      this["rowVerticals"].push(this["nextCellVertical"]);
      this["nextCellVertical"] = undefined;
      this["rowBorders"].push(this["nextCellBorders"]);
      this["nextCellBorders"] = new Map();
      this["rowPaddings"].push(this["nextCellPaddings"]);
      this["nextCellPaddings"] = new Map();
      this["activeBorder"] = undefined;
    }
    return;
  }
  if (name === "intbl") {
    this["inTable"] = true;
    return;
  }
  if (name === "cell") {
    if (this["runs"].length > 0 || this["tableCell"].length === 0) this["CommitParagraph"](state);
    this["tableRow"].push(this["tableCell"].splice(0));
    this["terminatedParagraph"] = true;
    return;
  }
  if (name === "row") {
    if (this["tableCell"].length > 0 || this["runs"].length > 0) {
      if (this["runs"].length > 0) this["CommitParagraph"](state);
      this["tableRow"].push(this["tableCell"].splice(0));
    }
    if (this["tableRow"].length > 0)
      this["tableRows"].push({
        cells: this["tableRow"].splice(0),
        header: this["rowHeader"],
        boundaries: this["rowBoundaries"].splice(0),
        alignment: this["rowAlignment"],
        left: this["rowLeft"],
        height: this["rowHeight"],
        split: this["rowSplit"],
        verticals: this["rowVerticals"].splice(0),
        borders: this["rowBorders"].splice(0),
        paddings: this["rowPaddings"].splice(0),
        defaultPaddings: this["rowDefaultPaddings"],
      });
    this["inTable"] = false;
    this["terminatedParagraph"] = true;
    return;
  }
  if (name === "par") {
    this["CommitParagraph"](state);
    return;
  }
  if (name === "line" || name === "tab" || name === "~" || name === "-") {
    this["AppendText"](
      name === "line" ? "\n" : name === "tab" ? "\t" : name === "~" ? "\u00a0" : "\u00ad",
      state,
    );
    return;
  }
  if (name === "plain") {
    state.character = { ...DEFAULT_CHARACTER };
    state.characterControls.clear();
    state.currentCodepage =
      this["fontCodepages"].get(this["defaultFontIndex"]) ?? this["defaultCodepage"];
    return;
  }
  if (name === "pard") {
    if (!this["inTable"] && this["tableRows"].length > 0) this["FlushTable"]();
    state.paragraph = { ...DEFAULT_PARAGRAPH };
    return;
  }
  if (name === "b" || name === "i") {
    state.character = {
      ...state.character,
      [name === "b" ? "bold" : "italic"]: parameter !== 0,
    };
    return;
  }
  const underlineStyle = Object.hasOwn(RTF_UNDERLINE_STYLES, name)
    ? RTF_UNDERLINE_STYLES[name]
    : undefined;
  if (underlineStyle !== undefined) {
    // rtftokenizer.cxx dispatches ULD and ULW as flags, ignoring numeric parameters.
    const style =
      parameter === 0 && name !== "uld" && name !== "ulw"
        ? FontLineStyle.LINESTYLE_NONE
        : underlineStyle;
    state.character = {
      ...state.character,
      underline: style !== FontLineStyle.LINESTYLE_NONE,
      underlineStyle: style,
      ...(name === "ulw" && style !== FontLineStyle.LINESTYLE_NONE
        ? { underlineWordMode: true }
        : {}),
    };
  } else if (name === "ulc" && parameter !== undefined) {
    state.character = {
      ...state.character,
      underlineColor: parameter === 0 ? "auto" : (this["colors"][parameter] ?? "auto"),
    };
  } else if (name === "strike" || name === "striked")
    state.character = {
      ...state.character,
      strikeout:
        parameter === 0
          ? FontStrikeout.STRIKEOUT_NONE
          : name === "striked"
            ? FontStrikeout.STRIKEOUT_DOUBLE
            : FontStrikeout.STRIKEOUT_SINGLE,
    };
  else if (name === "super" || name === "sub")
    state.character = {
      ...state.character,
      escapement: {
        offset: name === "super" ? DFLT_ESC_SUPER : DFLT_ESC_SUB,
        height: DFLT_ESC_PROP,
      },
    };
  else if (name === "nosupersub") {
    const character = { ...state.character };
    Reflect.deleteProperty(character, "escapement");
    state.character = character;
  } else if ((name === "up" || name === "dn") && parameter !== undefined) {
    const up = name === "up",
      fontHeight = state.character.fontSizeTwips ?? 240;
    const offset = this["pendingUpDn"]?.automatic
      ? up
        ? DFLT_ESC_AUTO_SUPER
        : DFLT_ESC_AUTO_SUB
      : Math.round(((parameter * 1000) / fontHeight) * (up ? 1 : -1));
    state.character = {
      ...state.character,
      escapement: { offset, height: this["pendingUpDn"]?.height ?? 100 },
    };
    this["pendingUpDn"] = undefined;
  } else if (name === "ls" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, listOverride: parameter };
  else if (name === "s" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, styleIndex: parameter };
  else if (name === "ilvl" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, listLevel: Math.max(0, Math.min(9, parameter)) };
  else if (name === "fs" && parameter !== undefined && parameter > 0)
    state.character = { ...state.character, fontSizeTwips: parameter * 10 };
  else if (name === "f" && parameter !== undefined) {
    state.fontIndex = parameter;
    state.currentCodepage = this["fontCodepages"].get(parameter) ?? this["defaultCodepage"];
    const character = { ...state.character };
    Reflect.deleteProperty(character, "fontFamily");
    const fontFamily = this["fonts"].get(parameter);
    state.character = { ...character, ...(fontFamily === undefined ? {} : { fontFamily }) };
  } else if (name === "cf" && parameter !== undefined) {
    state.colorIndex = parameter;
    const character = { ...state.character };
    Reflect.deleteProperty(character, "color");
    const color = parameter === 0 ? undefined : this["colors"][parameter];
    state.character = { ...character, ...(color === undefined ? {} : { color }) };
  } else if (name === "highlight" && parameter !== undefined) {
    const character = { ...state.character };
    Reflect.deleteProperty(character, "highlight");
    const highlight = parameter === 0 ? undefined : this["colors"][parameter];
    state.character = { ...character, ...(highlight === undefined ? {} : { highlight }) };
  } else if (name === "ql" || name === "qc" || name === "qr" || name === "qj" || name === "qd")
    state.paragraph = {
      ...state.paragraph,
      alignmentSet: true,
      distributeLastLine: name === "qd",
      alignment:
        name === "ql" ? "left" : name === "qc" ? "center" : name === "qr" ? "right" : "justify",
    };
  else if (name === "li" && parameter !== undefined)
    state.paragraph = {
      ...state.paragraph,
      left: Math.max(0, parameter),
      leftSet: true,
      // rtftok LI inserts firstLine=0 with Ignore conflict policy.
      ...(!state.paragraph.firstLineSet ? { firstLine: 0, firstLineSet: true } : {}),
    };
  else if (name === "lin" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, left: Math.max(0, parameter), leftSet: true };
  else if ((name === "ri" || name === "rin") && parameter !== undefined)
    state.paragraph = { ...state.paragraph, right: Math.max(0, parameter), rightSet: true };
  else if (name === "fi" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, firstLine: parameter, firstLineSet: true };
  else if (name === "sb" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, before: Math.max(0, parameter), beforeSet: true };
  else if (name === "sa" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, after: Math.max(0, parameter), afterSet: true };
  else if (name === "contextualspace")
    state.paragraph = { ...state.paragraph, contextual: true, contextualSet: true };
  else if (name === "keepn")
    state.paragraph = { ...state.paragraph, keepNext: true, keepNextSet: true };
  else if (name === "keep")
    state.paragraph = {
      ...state.paragraph,
      keepTogether: true,
      keepTogetherSet: true,
    };
  else if (name === "widctlpar" || name === "nowidctlpar")
    state.paragraph = {
      ...state.paragraph,
      widowControl: name === "widctlpar",
      widowControlSet: true,
    };
  else if (name === "tqr" || name === "tqc" || name === "tqdec")
    state.paragraph = {
      ...state.paragraph,
      tabAdjustment:
        name === "tqr"
          ? SvxTabAdjust.Right
          : name === "tqc"
            ? SvxTabAdjust.Center
            : SvxTabAdjust.Decimal,
    };
  else if (name === "tldot" || name === "tlul" || name === "tlth")
    state.paragraph = {
      ...state.paragraph,
      // Pinned rtftok maps both tlul and tlth to the underscore leader.
      tabFill: name === "tldot" ? "." : "_",
    };
  else if (name === "tx" && parameter !== undefined)
    state.paragraph = {
      ...state.paragraph,
      tabStops: [
        ...state.paragraph.tabStops,
        new SvxTabStop(parameter, state.paragraph.tabAdjustment, "\0", state.paragraph.tabFill),
      ],
      tabStopsSet: true,
      tabAdjustment: SvxTabAdjust.Left,
      tabFill: " ",
    };
  else if (name === "sl" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, lineSpace: parameter, lineSpacingSet: true };
  else if (name === "slmult" && parameter !== undefined)
    state.paragraph = { ...state.paragraph, lineMulti: parameter, lineSpacingSet: true };
}
