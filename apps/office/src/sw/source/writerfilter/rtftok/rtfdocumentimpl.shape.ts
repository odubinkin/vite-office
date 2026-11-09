/** @fileoverview Original RTFShape state and shape-text destinations from rtfdocumentimpl.hxx and rtftok. */
import { RelOrientation } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import type { RtfBlock, RtfDocumentImplContext, RtfState } from "./rtfdocumentimpl.context";
import { FlushDeferredPageBreak } from "./rtfdocumentimpl.section";
import { RtfTextBuffer } from "./rtfdocumentimpl.textbuffer";

/** The shape geometry and ordered OfficeArt properties read by RTFSdrImport. */
export class RTFShape {
  readonly properties: [string, string][] = [];
  left = 0;
  right = 0;
  top = 0;
  bottom = 0;
  horizontalRelation = RelOrientation.FRAME;
  verticalRelation = RelOrientation.FRAME;
  wrap: WrapTextMode | undefined;
  blocks: readonly RtfBlock[] | undefined;
  initialPropertyCount = 0;

  /** Selects source shape types eligible for Writer text-frame attachment. @returns Whether SHPTXT belongs to a native text frame. */
  IsTextFrame(): boolean {
    const property = this.properties.find(
      /** Finds the first source shape type. @param property - OfficeArt property. @returns Whether it supplies the shape type. */
      ([name]) => name === "shapeType",
    );
    if (!property) return true;
    const type = toInt32(property[1]);
    return type === 202 || type === 1;
  }
}

/** A shape attached to the current paragraph stream position. */
export interface RtfShapeAnchor {
  readonly offset: number;
  readonly shape: RTFShape;
}

/** Dispatches RTF shape destinations and represented geometry under their native group owner. @param this - Original reader. @param name - RTF control. @param parameter - Parsed control value. @param state - Current group. @returns Whether consumed. */
export function DispatchShape(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  if (name === "shp" && state.destination === "body") {
    state.destination = "shape";
    state.shape = new RTFShape();
    state.shapeRoot = true;
    state.starred = false;
    return true;
  }
  const shape = state.shape;
  if (shape === undefined) return false;
  if (state.destination === "shape" || state.destination === "shapeinstruction") {
    switch (name) {
      case "shpinst":
        state.destination = "shapeinstruction";
        state.starred = false;
        return true;
      case "sp":
        state.destination = "shapeproperty";
        state.starred = false;
        return true;
      case "shptxt":
        state.starred = false;
        if (!shape.IsTextFrame() || shape.blocks !== undefined) {
          state.destination = "skip";
          return true;
        }
        this["checkFirstRun"]();
        FlushDeferredPageBreak.call(this, state);
        this["m_aTextBufferStack"].push(this["m_aTextBuffer"]);
        this["m_aTextBuffer"] = new RtfTextBuffer();
        shape.initialPropertyCount = shape.properties.length;
        shape.blocks = this["m_aTextBuffer"].blocks;
        state.shapeTextRoot = true;
        state.tableBuffer = undefined;
        state.destination = "body";
        this["DispatchBodyControl"]("pard", undefined, state);
        return true;
      case "shpbxpage":
        shape.horizontalRelation = RelOrientation.PAGE_FRAME;
        return true;
      case "shpbypage":
        shape.verticalRelation = RelOrientation.PAGE_FRAME;
        return true;
      case "shpwr":
        if (parameter === 1) shape.wrap = WrapTextMode.NONE;
        else if (parameter === 2 || parameter === 4) shape.wrap = WrapTextMode.PARALLEL;
        else if (parameter === 3 || parameter === 5) shape.wrap = WrapTextMode.THROUGH;
        return true;
      case "shpleft":
      case "shpright":
      case "shptop":
      case "shpbottom":
        shape[
          name === "shpleft"
            ? "left"
            : name === "shpright"
              ? "right"
              : name === "shptop"
                ? "top"
                : "bottom"
        ] = Number(convertTwipToMm100(BigInt(parameter ?? 0)));
        return true;
      default:
        return !state.starred;
    }
  }
  if (state.destination === "shapeproperty" && (name === "sn" || name === "sv")) {
    state.destination = name === "sn" ? "shapepropertyname" : "shapepropertyvalue";
    state.currentDestinationText = state.destinationText;
    state.starred = false;
    return true;
  }
  return false;
}

/** Completes the shape's text append context and then attaches the closed shape to its surrounding paragraph. @param this - Original reader. @param state - Closed group. @returns Nothing. */
export function FinishShapeGroup(this: RtfDocumentImplContext, state: RtfState): void {
  const shape = state.shape;
  if (shape === undefined) return;
  if (
    state.destinationText === state.currentDestinationText &&
    (state.destination === "shapepropertyname" || state.destination === "shapepropertyvalue")
  ) {
    let value = "";
    for (const unit of state.destinationText.view()) value += String.fromCharCode(unit);
    if (state.destination === "shapepropertyname") shape.properties.push([value, ""]);
    else {
      const property = shape.properties.at(-1);
      if (property) property[1] = value;
    }
  }
  if (state.shapeTextRoot) {
    const buffer = this["m_aTextBuffer"];
    if (buffer.HasParagraphContent() || (!buffer.blocks.length && !buffer.tableRows.length))
      this["CommitParagraph"](state);
    this["FlushTable"]();
    const parent = this["m_aTextBufferStack"].pop();
    if (parent === undefined) throw new Error("assert(original RTF shape text context)");
    // The finished shape now owns the recorded blocks. Release any incomplete row and run state.
    this["m_aTextBuffer"] = parent;
    buffer.DisposeIncomplete();
  }
  if (state.shapeRoot && shape.blocks !== undefined) {
    const buffer = this["m_aTextBuffer"];
    buffer.frames.push({ offset: buffer.GetTextLength(), shape });
    buffer.terminatedParagraph = false;
    buffer.m_bNeedCr = true;
  }
}
