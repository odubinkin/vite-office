/** @fileoverview RtfDocumentImpl dispatch implementation, called with the original native owner as this. */
import { SvxTabAdjust, SvxTabStop } from "../../../../editeng/inc/tstpitem";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
import { RTF_CHARSET_CODEPAGE } from "./rtfcharsets";
import {
  RunType,
  CHARACTER_PROPERTY_CONTROLS,
  DEFAULT_CHARACTER,
  DEFAULT_PARAGRAPH,
  parseRtfHyperlinkInstruction,
  RTF_UNDERLINE_STYLES,
  SKIPPED_DESTINATIONS,
  STYLE_PROPERTY_CONTROLS,
  type RtfCellBorder,
  type RtfDocumentImplContext,
  type RtfState,
} from "./rtfdocumentimpl.context";
import { createRtfBorder, dispatchRtfBorder, RTF_BORDER_STYLES } from "./rtfdocumentimpl.border";
import { RtfSyntaxError, type RtfToken } from "./rtftokenizer";

/** Dispatches one lexical event under the current group state. @param token - Source event.  @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function Dispatch(this: RtfDocumentImplContext, token: RtfToken): void {
  if (token.kind === "group-start") {
    const previous = this["states"].at(-1);
    // Original pushState resets the current state before copying, except the two completed RTL pairs (fdo#85812).
    if (
      previous &&
      previous.runType !== RunType.LTRCH_RTLCH_2 &&
      previous.runType !== RunType.RTLCH_LTRCH_2
    )
      previous.runType = RunType.NONE;
    const destinationText = new OUStringBuffer(previous?.destinationText ?? 512);
    destinationText.setLength(0);
    this["states"].push({
      destination: previous?.destination ?? "body",
      characterSprms:
        previous === undefined ? new RTFSprms() : new RTFSprms(previous.characterSprms),
      paragraphSprms:
        previous === undefined ? new RTFSprms() : new RTFSprms(previous.paragraphSprms),
      sectionSprms: new RTFSprms(previous?.sectionSprms),
      tableSprms: new RTFSprms(previous?.tableSprms),
      tableAttributes: new RTFSprms(previous?.tableAttributes),
      listLevelEntries: new RTFSprms(previous?.listLevelEntries),
      runType: previous?.runType ?? RunType.NONE,
      starred: false,
      character: { ...(previous?.character ?? DEFAULT_CHARACTER) },

      ...(previous?.autoKerning === undefined ? {} : { autoKerning: previous.autoKerning }),
      paragraph: { ...(previous?.paragraph ?? DEFAULT_PARAGRAPH) },
      fontIndex: previous?.fontIndex ?? 0,
      currentCodepage: previous?.currentCodepage ?? this["defaultCodepage"],
      ...(previous?.fontCodepage === undefined ? {} : { fontCodepage: previous.fontCodepage }),
      colorIndex: previous?.colorIndex ?? 0,
      ...(previous?.paragraphBorder === undefined
        ? {}
        : { paragraphBorder: previous.paragraphBorder }),
      // Destination text buffers begin empty in every group; the old optional buffers did likewise.
      styleName: "",
      ...(previous?.basedOnStyleName === undefined
        ? {}
        : { basedOnStyleName: previous.basedOnStyleName }),
      ...(previous?.nextStyleName === undefined ? {} : { nextStyleName: previous.nextStyleName }),
      ...(previous?.currentCharacterStyleIndex === undefined
        ? {}
        : { currentCharacterStyleIndex: previous.currentCharacterStyleIndex }),
      ...(previous?.styleType === undefined ? {} : { styleType: previous.styleType }),
      ...(previous?.characterStyleIndex === undefined
        ? {}
        : { characterStyleIndex: previous.characterStyleIndex }),
      bookmarkName: "",
      levelText: "",
      levelNumbers: [...(previous?.levelNumbers ?? [])],
      levelNumbersValid: previous?.levelNumbersValid ?? true,
      listLevelNum: previous?.listLevelNum ?? 0,
      currentListIndex: previous?.currentListIndex ?? -1,
      currentListOverrideIndex: previous?.currentListOverrideIndex ?? -1,
      destinationText,
      currentDestinationText: previous?.currentDestinationText ?? null,
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
    if (this["states"].length === 1 && !this["firstRun"])
      FinishRtfSections.call(this, this["states"][0] as RtfState);
    const previous = this["states"].pop();
    try {
      const parent = this["states"].at(-1);
      if (this["m_nResetBreakOnSectBreak"] !== RTFKeyword.invalid && previous && parent) {
        const type = previous.sectionSprms.find(N.LN_EG_SectPrContents_type);
        try {
          if (type.is()) parent.sectionSprms.set(N.LN_EG_SectPrContents_type, type);
        } finally {
          type.dispose();
        }
      }
      if (previous?.destination === "fonttbl" && previous.fontIndex >= 0)
        this["CommitFont"](previous);
      if (
        previous?.destination === "fonttbl" &&
        this["states"].at(-1)?.destination !== "fonttbl" &&
        this["defaultFontIndex"] >= 0
      )
        putNestedAttribute(
          this["m_aDefaultCharacterSprms"],
          N.LN_EG_RPrBase_rFonts,
          N.LN_CT_Fonts_ascii,
          stringValue(this["fonts"].get(this["defaultFontIndex"]) ?? ""),
        );
      if (previous?.destination === "styleentry" && previous.styleIndex !== undefined) {
        const name = (previous.styleName.split(";")[0] as string).trim();
        if (name.length > 0) {
          const definition: RtfStyleDefinition = {
            name,
            ...(previous.basedOnStyleName === undefined
              ? {}
              : { basedOnStyleName: previous.basedOnStyleName }),
            ...(previous.nextStyleName === undefined
              ? {}
              : { nextStyleName: previous.nextStyleName }),
            styleType: previous.styleType ?? "paragraph",
            character: { ...previous.character },

            ...(previous.autoKerning === undefined ? {} : { autoKerning: previous.autoKerning }),
            paragraph: { ...previous.paragraph },
            controls: new Set(previous.styleControls),
            ...(previous.basedOnStyleIndex === undefined
              ? {}
              : { basedOnStyleIndex: previous.basedOnStyleIndex }),
            ...(previous.nextStyleIndex === undefined
              ? {}
              : { nextStyleIndex: previous.nextStyleIndex }),
          };
          this["m_aStyleNames"].set(previous.styleIndex, name);
          const properties = createRtfStyleProperties(
            definition,
            previous.characterSprms,
            previous.paragraphSprms,
          );
          if (!this["m_pStyleTableEntries"].has(previous.styleIndex)) {
            this["m_pStyleTableEntries"].set(previous.styleIndex, properties);
            this["styles"].set(previous.styleIndex, definition);
          } else properties.clear();
        }
      }
      if (previous?.destination === "bookmarkstart") {
        const name = previous.bookmarkName.trim();
        if (name.length > 0)
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
      if (previous) {
        FinishLegacyNumbering.call(this, previous);
        FinishListLevelGroup.call(this, previous);
      }
      if (previous?.destination === "fldinst" && previous.field !== undefined) {
        const hyperlink = parseRtfHyperlinkInstruction(previous.field.instruction);
        if (hyperlink !== undefined) previous.field.hyperlink = hyperlink;
      }
    } finally {
      previous?.characterSprms.dispose();
      previous?.destinationText.dispose();
      previous?.paragraphSprms.dispose();
      previous?.sectionSprms.dispose();
      previous?.tableSprms.dispose();
      previous?.tableAttributes.dispose();
      previous?.listLevelEntries.dispose();
    }
    return;
  }
  const state = this["states"].at(-1);
  if (state === undefined) throw new RtfSyntaxError("RTF content is outside the root group.");
  if (token.kind === "control" && state.destination !== "skip") {
    const symbol = getSymbolData(token.name);
    if (symbol) {
      this["setNeedSect"](true);
      if (symbol.index === RTFKeyword.PAR) token = { ...token, name: "par" };
      if (symbol.controlType === RTFControlType.VALUE && token.parameter === undefined)
        token = { ...token, parameter: symbol.defValue };
      else if (
        token.name !== "rtf" &&
        symbol.controlType !== RTFControlType.TOGGLE &&
        symbol.controlType !== RTFControlType.VALUE &&
        token.parameter !== undefined
      )
        token = { kind: "control", name: token.name };
    }
  }
  if (token.kind === "character-source") {
    if (state.destination === "levelnumbers")
      ReadLevelNumbers(state, token.firstByte, token.lastByte);
    return;
  }
  if (token.kind === "hex-break") {
    // resolveChars converts hex CR and LF into separate PAR controls except
    // in destinations such as LEVELTEXT, where their bytes remain data.
    if (state.destination === "body") this["Dispatch"]({ kind: "control", name: "par" });
    else if (state.destination === "leveltext") state.levelText += token.value;
    return;
  }
  if (token.kind === "control" && token.name === "u") {
    const value = token.parameter ?? 0;
    if (state.destination === "levelnumbers") {
      if (value === 59) state.levelNumbersValid = false;
      else state.levelNumbers.push(value);
    } else this["Dispatch"]({ kind: "text", value: String.fromCharCode(value & 0xffff) });
    return;
  }
  if (token.kind === "text" || token.kind === "ansi-bytes") {
    if (state.destination === "levelnumbers") {
      return;
    }
    const value = token.kind === "text" ? token.value : this["DecodeBytes"](token.value, state);
    if (state.destination === "fonttbl") this["ReadFontText"](value, state);
    else if (state.destination === "styleentry") state.styleName += value;
    else if (state.destination === "bookmarkstart" || state.destination === "bookmarkend")
      state.bookmarkName += value;
    else if (state.destination === "leveltext") state.levelText += value;
    else if (state.destination === "pntxta" || state.destination === "pntxtb") {
      const native = unicode(value);
      try {
        state.currentDestinationText?.append(native);
      } finally {
        native.dispose();
      }
    } else if (state.destination === "colortbl") this["ReadColorText"](value);
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
  if (token.name === "margmirror" && state.destination !== "skip") {
    this["m_aSettingsTableSprms"].set(N.LN_CT_Settings_mirrorMargins, new RTFValue(1));
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
  if (DispatchTextSymbol.call(this, token.name, state)) return;
  if (DispatchLegacyNumberingDestination(token.name, state)) return;
  if (token.name === "listid") state.currentListIndex = token.parameter ?? 0;
  if (
    state.destination !== "skip" &&
    DispatchLegacyNumbering.call(this, token.name, token.parameter, state)
  )
    return;
  if (state.destination === "stylesheet" && (token.name === "s" || token.name === "cs")) {
    state.starred = false;
    state.styleType = token.name === "cs" ? "character" : "paragraph";
    state.destination = "styleentry";
    state.styleIndex = token.parameter ?? 0;
    state.styleName = "";
    state.styleControls = new Set();
    delete state.basedOnStyleIndex;
    delete state.nextStyleIndex;
    delete state.basedOnStyleName;
    delete state.nextStyleName;
    return;
  }
  if (state.destination === "styleentry") {
    if (token.name === "sbasedon") {
      if (token.parameter !== undefined) {
        state.basedOnStyleIndex = token.parameter;
        state.basedOnStyleName = this["m_aStyleNames"].get(token.parameter) ?? "";
      }
      return;
    }
    if (token.name === "snext") {
      if (token.parameter !== undefined) {
        state.nextStyleIndex = token.parameter;
        state.nextStyleName = this["m_aStyleNames"].get(token.parameter) ?? "";
      }
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
    return;
  }
  if (
    (state.destination === "list" || state.destination === "lfolevel") &&
    token.name === "listlevel"
  ) {
    state.destination = "listlevel";
    this["m_nListLevel"]++;
    return;
  }
  if (state.destination === "list" && token.name === "listname") {
    state.destination = "listname";
    return;
  }
  if (state.destination === "listlevel" && token.name === "leveltext") {
    state.destination = "leveltext";
    state.levelText = "";
    return;
  }
  if (state.destination === "listlevel" && token.name === "levelnumbers") {
    state.destination = "levelnumbers";
    return;
  }
  if (
    (state.destination === "listoverridetable" || state.destination === "listoverride") &&
    token.name === "listoverride"
  ) {
    state.destination = "listoverride";
    return;
  }
  if (state.destination === "listoverride" && token.name === "lfolevel") {
    state.destination = "lfolevel";
    state.tableSprms.clear();
    return;
  }
  if (SKIPPED_DESTINATIONS.has(token.name) || state.starred) {
    state.destination = "skip";
    state.starred = false;
    return;
  }
  if (state.destination === "fonttbl") {
    if (token.name === "f" || token.name === "af") {
      this["CommitFont"](state);
      state.fontIndex = token.parameter ?? 0;
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
  if (
    state.destination === "pn" ||
    state.destination === "pntxta" ||
    state.destination === "pntxtb"
  ) {
    this["DispatchBodyControl"](token.name, token.parameter, state);
    return;
  }
  if (state.destination === "list" || state.destination === "listlevel") {
    if (
      state.destination === "listlevel" &&
      [
        "loch",
        "hich",
        "dbch",
        "ltrch",
        "rtlch",
        "ltrpar",
        "rtlpar",
        "ltrrow",
        "rtlrow",
        "plain",
      ].includes(token.name)
    ) {
      this["DispatchBodyControl"](token.name, token.parameter, state);
      return;
    }

    if (
      state.destination === "listlevel" &&
      dispatchAssociatedCharacter.call(this, token.name, token.parameter, state)
    )
      return;
    if (state.destination === "listlevel" && token.name === "s") {
      const name = this["m_aStyleNames"].get(token.parameter ?? 0);
      if (name) state.tableSprms.set(N.LN_CT_Lvl_pStyle, stringValue(name));
      return;
    }
    if (token.name === "listid") {
      if (state.destination === "list")
        state.tableAttributes.set(
          N.LN_CT_AbstractNum_abstractNumId,
          new RTFValue(token.parameter ?? 0),
        );
    } else if (state.destination === "listlevel") {
      if (token.name === "fi" && !state.levelNumbersValid)
        this["m_aInvalidListLevelFirstIndents"].set(this["m_nListLevel"], token.parameter ?? 0);
      dispatchNumberingValue(token.name, token.parameter, state);
    }
    return;
  }
  if (
    state.destination === "leveltext" ||
    state.destination === "levelnumbers" ||
    state.destination === "listname"
  )
    return;
  if (state.destination === "listoverride") {
    if (token.name === "listid") {
      state.tableSprms.set(N.LN_CT_Num_abstractNumId, new RTFValue(token.parameter ?? 0));
    } else if (token.name === "ls") {
      state.currentListOverrideIndex = token.parameter ?? 0;
      state.tableAttributes.set(N.LN_CT_AbstractNum_nsid, new RTFValue(token.parameter ?? 0));
    }
    return;
  }
  if (state.destination === "lfolevel") {
    if (["levelnfc", "levelstartat", "levellegal", "leveljc", "levelfollow"].includes(token.name))
      dispatchNumberingValue(token.name, token.parameter, state);
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
  dispatchStyleParagraphNumbering(name, parameter, state);
  if (name === "outlinelevel") {
    state.paragraphSprms.set(N.LN_CT_PPrBase_outlineLvl, new RTFValue(parameter ?? 0));
    return;
  }
  if (CHARACTER_PROPERTY_CONTROLS.has(name)) state.characterControls.add(name);
  if (dispatchLanguageValue.call(this, name, parameter ?? 0, state)) return;
  if (dispatchAssociatedCharacter.call(this, name, parameter, state)) return;
  if (name === "loch" || name === "hich" || name === "dbch") {
    state.runType = name === "loch" ? RunType.LOCH : name === "hich" ? RunType.HICH : RunType.DBCH;
    return;
  }
  if (name === "ltrch") {
    state.runType =
      state.runType === RunType.RTLCH_LTRCH_1 ? RunType.RTLCH_LTRCH_2 : RunType.LTRCH_RTLCH_1;
    return;
  }
  if (name === "rtlch") {
    state.runType =
      state.runType === RunType.LTRCH_RTLCH_1 ? RunType.LTRCH_RTLCH_2 : RunType.RTLCH_LTRCH_1;
    if (this["defaultCodepage"] === 1255) state.currentCodepage = 1255;
    return;
  }
  if (name === "ltrsect" || name === "rtlsect") {
    state.runType = RunType.NONE;
    state.paragraphSprms.set(
      N.LN_EG_SectPrContents_textDirection,
      new RTFValue(name === "rtlsect" ? 1 : 0),
    );
    return;
  }
  if (name === "ltrpar" || name === "rtlpar") {
    state.runType = RunType.NONE;
    state.paragraphSprms.set(N.LN_CT_PPrBase_bidi, new RTFValue(name === "rtlpar" ? 1 : 0));
    return;
  }
  if (["ltrrow", "rtlrow"].includes(name)) state.runType = RunType.NONE;
  if (DispatchSectionControl.call(this, name, parameter, state)) return;
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
    DispatchPageBreak.call(this, name, state);
    return;
  }
  if (name === "trowd") {
    this["m_bNeedPap"] = true;
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
    delete state.paragraphBorder;
    const edge =
      name === "clbrdrt"
        ? SvxBoxItemLine.TOP
        : name === "clbrdrl"
          ? SvxBoxItemLine.LEFT
          : name === "clbrdrb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    const border: RtfCellBorder = createRtfBorder();
    this["nextCellBorders"].set(edge, border);
    this["activeBorder"] = border;
    return;
  }
  if (["box", "brdrt", "brdrl", "brdrb", "brdrr", "brdrbtw"].includes(name)) {
    const edge =
      name === "box"
        ? "box"
        : name === "brdrbtw"
          ? "between"
          : name === "brdrt"
            ? SvxBoxItemLine.TOP
            : name === "brdrl"
              ? SvxBoxItemLine.LEFT
              : name === "brdrb"
                ? SvxBoxItemLine.BOTTOM
                : SvxBoxItemLine.RIGHT;
    state.paragraphBorder = edge;
    const borders = new Map(state.paragraph.borders);
    if (edge === "box")
      for (const side of [
        SvxBoxItemLine.TOP,
        SvxBoxItemLine.LEFT,
        SvxBoxItemLine.BOTTOM,
        SvxBoxItemLine.RIGHT,
      ])
        borders.set(side, createRtfBorder());
    else borders.set(edge, createRtfBorder());
    state.paragraph = { ...state.paragraph, borders };
    return;
  }
  if (
    Object.hasOwn(RTF_BORDER_STYLES, name) ||
    name === "brdrw" ||
    name === "brdrcf" ||
    name === "brsp"
  ) {
    if (state.paragraphBorder !== undefined) {
      const borders = new Map(state.paragraph.borders);
      const edges =
        state.paragraphBorder === "box"
          ? ([
              SvxBoxItemLine.TOP,
              SvxBoxItemLine.LEFT,
              SvxBoxItemLine.BOTTOM,
              SvxBoxItemLine.RIGHT,
            ] as const)
          : [state.paragraphBorder];
      for (const edge of edges) {
        const border = { ...(borders.get(edge) ?? createRtfBorder()) };
        dispatchRtfBorder(border, name, parameter);
        borders.set(edge, border);
      }
      state.paragraph = { ...state.paragraph, borders };
    } else if (this["activeBorder"] !== undefined)
      dispatchRtfBorder(this["activeBorder"], name, parameter);
    else {
      // putBorderProperty with border state NONE clears all paragraph borders.
      const borders = new Map(state.paragraph.borders);
      for (const side of [
        SvxBoxItemLine.TOP,
        SvxBoxItemLine.LEFT,
        SvxBoxItemLine.BOTTOM,
        SvxBoxItemLine.RIGHT,
      ])
        borders.set(side, createRtfBorder());
      state.paragraph = { ...state.paragraph, borders };
    }
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
    this["m_bNeedFinalPar"] = true;
    this["terminatedParagraph"] = true;
    return;
  }
  if (name === "par") {
    this["CommitParagraph"](state, true);
    return;
  }
  if (name === "kerning") {
    state.autoKerning = (parameter ?? 0) !== 0;
    return;
  }
  if (name === "plain") {
    state.runType = RunType.NONE;
    state.characterSprms.clear();
    for (const [id, value] of this["m_aDefaultCharacterSprms"]) state.characterSprms.set(id, value);
    delete state.characterStyleIndex;
    delete state.currentCharacterStyleIndex;
    delete state.autoKerning;
    state.character = { ...DEFAULT_CHARACTER };
    state.characterControls.clear();
    state.currentCodepage =
      this["fontCodepages"].get(this["defaultFontIndex"]) ?? this["defaultCodepage"];
    return;
  }
  if (name === "pard") {
    state.paragraphSprms.clear();
    this["m_bNeedPap"] = true;
    if (!this["inTable"] && this["tableRows"].length > 0) this["FlushTable"]();
    state.paragraph = { ...DEFAULT_PARAGRAPH };
    delete state.paragraphBorder;
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
  } else if (name === "strike" || name === "striked") {
    state.characterSprms.set(
      name === "strike" ? N.LN_EG_RPrBase_strike : N.LN_EG_RPrBase_dstrike,
      new RTFValue(Number(parameter !== 0)),
    );
    state.character = {
      ...state.character,
      strikeout:
        parameter === 0
          ? FontStrikeout.STRIKEOUT_NONE
          : name === "striked"
            ? FontStrikeout.STRIKEOUT_DOUBLE
            : FontStrikeout.STRIKEOUT_SINGLE,
    };
  } else if (name === "super" || name === "sub") {
    state.characterSprms.set(
      N.LN_EG_RPrBase_vertAlign,
      stringValue(name === "super" ? "superscript" : "subscript"),
    );
  } else if (name === "nosupersub") {
    state.characterSprms.erase(N.LN_EG_RPrBase_vertAlign);
  } else if (name === "up" || name === "dn") {
    state.characterSprms.set(
      N.LN_EG_RPrBase_position,
      new RTFValue((parameter ?? 6) * (name === "up" ? 1 : -1)),
    );
  } else if (name === "cs" && parameter !== undefined) {
    state.currentCharacterStyleIndex = parameter;
    if (this["styles"].has(parameter)) {
      state.characterStyleIndex = parameter;
      const name = this["m_aStyleNames"].get(parameter);
      if (name) state.characterSprms.set(N.LN_EG_RPrBase_rStyle, stringValue(name));
    }
  } else if (name === "s" && parameter !== undefined) {
    state.paragraph = { ...state.paragraph, styleIndex: parameter };
    const styleName = this["m_aStyleNames"].get(parameter);
    if (styleName && state.destination !== "styleentry")
      state.paragraphSprms.set(N.LN_CT_PPrBase_pStyle, stringValue(styleName));
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
    state.characterSprms.set(
      N.LN_EG_RPrBase_highlight,
      new RTFValue(writerColorFromPrimitive(highlight ?? "auto", "auto").toInt32()),
    );
    state.character = { ...character, ...(highlight === undefined ? {} : { highlight }) };
  } else if (name === "ql" || name === "qc" || name === "qr" || name === "qj" || name === "qd")
    state.paragraph = {
      ...state.paragraph,
      alignmentSet: true,
      distributeLastLine: name === "qd",
      alignment:
        name === "ql" ? "left" : name === "qc" ? "center" : name === "qr" ? "right" : "justify",
    };
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

import type { RtfStyleDefinition } from "./rtfdocumentimpl.context";
import { createRtfStyleProperties } from "./rtfdocumentimpl.character";

import { RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";

import { stringValue } from "./rtfdocumentimpl.character";

import { dispatchLanguageValue } from "./rtfdispatchvalue.language";

import { dispatchAssociatedCharacter } from "./rtfdispatchvalue.character";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";

import { FinishListLevelGroup, ReadLevelNumbers } from "./rtfdocumentimpl.numbering-state";
import { dispatchNumberingValue } from "./rtfdispatchvalue.numbering";

import { dispatchStyleParagraphNumbering } from "./rtfdispatchvalue.numbering";

import {
  FinishLegacyNumbering,
  DispatchLegacyNumbering,
  DispatchLegacyNumberingDestination,
} from "./rtfdocumentimpl.legacy-numbering";

import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { unicode } from "../../core/unocore/unocrsrhelper";

import { DispatchTextSymbol } from "./rtfdispatchsymbol";

import {
  FinishRtfSections,
  DispatchSectionControl,
  DispatchPageBreak,
} from "./rtfdocumentimpl.section";
import { RTFKeyword } from "./rtfcontrolwords";
import { getSymbolData, RTFControlType } from "./rtftokenizer";
