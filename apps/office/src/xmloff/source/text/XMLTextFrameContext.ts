/** @fileoverview Native draw:frame and draw:text-box import for the represented Writer text frame. */
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLTextCursor } from "../../inc/txtimp";
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { XMLTextImportHelper } from "./txtimp";
import { importFrameConstant } from "./txtprhdl";

/** Represented ODF automatic graphic style values shared with text-frame export. */
export interface XMLTextFrameStyle {
  readonly horizontal?: number | undefined;
  readonly horizontalRelation?: number | undefined;
  readonly toggle?: boolean | undefined;
  readonly vertical?: number | undefined;
  readonly verticalRelation?: number | undefined;
  readonly wrap?: number | undefined;
  readonly anchorOnly?: boolean | undefined;
  readonly marginLeft?: number | undefined;
  readonly marginRight?: number | undefined;
  readonly marginTop?: number | undefined;
  readonly marginBottom?: number | undefined;
}

/** Original draw:frame attributes with dimensions read from the text box when present. */
export interface XMLTextFrameAttributes {
  readonly name: string;
  readonly anchor: "paragraph" | "char";
  readonly styleName: string;
  readonly x?: number | undefined;
  readonly y?: number | undefined;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly minimumWidth?: number | undefined;
  readonly minimumHeight?: number | undefined;
  readonly relativeWidth?: number | undefined;
  readonly relativeHeight?: number | undefined;
}

/** Shared SAX calls into the native Writer frame and text ownership. */
export interface XMLTextFrameImportTarget {
  beginTextFrame(value: XMLTextFrameAttributes): XMLTextCursor;
  endTextFrame(cursor: XMLTextCursor): void;
}

const converter = new SvXMLUnitConverter("twip");

/** Converts an optional frame measure in the original core unit. @param attrs - Owning attributes. @param token - Original property. @returns Parsed measure. */
function length(attrs: FastAttributeList, token: T): number | undefined {
  const value = attrs.get(token);
  return value === null ? undefined : (converter.convertMeasureToCore(value) ?? undefined);
}

/** Reads the original relative-size attribute, including scale. @param text - Optional ODF value. @returns Percentage or synced sentinel. */
function percent(text: string | null): number | undefined {
  if (text === "scale" || text === "scale-min") return 255;
  const value = text === null ? null : /^([0-9]+)%$/u.exec(text);
  const number = value === null ? 0 : Number(value[1]);
  return number > 0 && number < 255 ? number : undefined;
}

/** Imports one automatic or named graphic style's represented text-frame properties. */
export class XMLTextFrameStyleContext extends SvXMLImportContext {
  private style: XMLTextFrameStyle = {};
  private readonly name: string;
  private readonly parent: string | undefined;

  /** Captures source style identity and its parent. @param attrs - Style header. @param publish - Imports into the Writer style catalogue. @returns Context. */
  constructor(
    attrs: FastAttributeList,
    private readonly publish: (name: string, style: XMLTextFrameStyle, parent?: string) => void,
  ) {
    super();
    this.name = attrs.require(T.STYLE_NAME, "graphic style");
    this.parent = attrs.get(T.STYLE_PARENT_STYLE_NAME) ?? undefined;
  }

  /** Reads the consumed native graphic properties. @param element - Original token. @param attrs - Property attributes. @returns Inert child for scalar properties. */
  public override createFastChildContext(element: T, attrs: FastAttributeList): null {
    if (element !== T.STYLE_GRAPHIC_PROPERTIES) return null;
    const horizontal = attrs.get(T.STYLE_HORIZONTAL_POS);
    const horizontalMode = importFrameConstant("horizontal", horizontal);
    const wrapped = attrs.get(T.STYLE_NUMBER_WRAPPED_PARAGRAPHS);
    const count: [number] = [0];
    const anchorOnly =
      wrapped === "no-limit"
        ? false
        : wrapped !== null && Converter.convertNumber(count, wrapped)
          ? count[0] === 1
          : undefined;
    this.style = {
      horizontal: horizontalMode,
      horizontalRelation: importFrameConstant(
        "horizontalRelation",
        attrs.get(T.STYLE_HORIZONTAL_REL),
      ),
      toggle:
        horizontalMode === undefined || horizontal === null
          ? undefined
          : ["from-inside", "inside", "outside"].includes(horizontal),
      vertical: importFrameConstant("vertical", attrs.get(T.STYLE_VERTICAL_POS)),
      verticalRelation: importFrameConstant("verticalRelation", attrs.get(T.STYLE_VERTICAL_REL)),
      wrap: importFrameConstant("wrap", attrs.get(T.STYLE_WRAP)),
      anchorOnly,
      marginLeft: length(attrs, T.FO_MARGIN_LEFT),
      marginRight: length(attrs, T.FO_MARGIN_RIGHT),
      marginTop: length(attrs, T.FO_MARGIN_TOP),
      marginBottom: length(attrs, T.FO_MARGIN_BOTTOM),
    };
    return null;
  }

  /** Publishes the represented frame style. @returns Nothing. */
  public override endFastElement(): void {
    this.publish(this.name, this.style, this.parent);
  }
}

/** Owns draw:frame until the original text-box child creates the native frame. */
export class XMLTextFrameContext extends SvXMLImportContext {
  /** Keeps the frame header and active native text owner. @param target - Writer frame owner. @param helper - Shared text importer. @param attrs - Original outer frame attributes. @returns Context. */
  constructor(
    private readonly target: XMLTextFrameImportTarget,
    private readonly helper: XMLTextImportHelper,
    private readonly attrs: FastAttributeList,
  ) {
    super();
  }

  /** Switches to the original text-box cursor when the frame is a represented text object. @param element - Original child token. @param attrs - Text-box dimensions. @returns Text-box context or native inert fallback. */
  public override createFastChildContext(
    element: T,
    attrs: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== T.DRAW_TEXT_BOX) return null;
    const frame = this.attrs;
    const anchor = frame.get(T.TEXT_ANCHOR_TYPE) ?? "paragraph";
    if (anchor !== "paragraph" && anchor !== "char") return null;
    const cursor = this.target.beginTextFrame({
      name: frame.get(T.DRAW_NAME) ?? "",
      styleName: frame.get(T.DRAW_STYLE_NAME) ?? "",
      anchor,
      x: length(frame, T.SVG_X),
      y: length(frame, T.SVG_Y),
      width: length(frame, T.SVG_WIDTH),
      height: length(frame, T.SVG_HEIGHT),
      minimumWidth: length(frame, T.FO_MIN_WIDTH) ?? length(attrs, T.FO_MIN_WIDTH),
      minimumHeight: length(frame, T.FO_MIN_HEIGHT) ?? length(attrs, T.FO_MIN_HEIGHT),
      relativeWidth: percent(frame.get(T.STYLE_REL_WIDTH) ?? attrs.get(T.FO_MIN_WIDTH)),
      relativeHeight: percent(frame.get(T.STYLE_REL_HEIGHT) ?? attrs.get(T.FO_MIN_HEIGHT)),
    });
    this.helper.PushTextFrameCursor(cursor);
    return new XMLTextBoxContext(this.target, this.helper, cursor);
  }
}

/** Delegates text-box content to the same native paragraph/list/table contexts as other text owners. */
class XMLTextBoxContext extends SvXMLImportContext {
  /** Captures the active frame text cursor. @param target - Writer frame owner. @param helper - Shared text importer. @param cursor - Native frame text cursor. @returns Context. */
  constructor(
    private readonly target: XMLTextFrameImportTarget,
    private readonly helper: XMLTextImportHelper,
    private readonly cursor: XMLTextCursor,
  ) {
    super();
  }

  /** Dispatches one native text-box child. @param element - Child token. @param attrs - Child attributes. @returns Native child context. */
  public override createFastChildContext(
    element: T,
    attrs: FastAttributeList,
  ): SvXMLImportContext | null {
    return this.helper.CreateTextChildContext(element, attrs, "TextBox");
  }

  /** Removes the trailing import paragraph and restores the original parent cursor. @returns Nothing. */
  public override endFastElement(): void {
    try {
      this.target.endTextFrame(this.cursor);
    } finally {
      this.helper.PopTextFrameCursor();
    }
  }
}
