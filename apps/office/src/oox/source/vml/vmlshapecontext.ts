/** @fileoverview Original VML shape style declaration parsing for ShapeTypeModel. */
import { toInt32 } from "../../../o3tl/inc/string_view";
import type { FastAttribute } from "../../../sax/source/fastparser/fastparser";
import type { Relations } from "../core/relations";
import { namespaceTokens } from "../token/namespacemap";
import { getTokenFromUtf8 as token } from "../token/tokenmap";
import { decodeBool, separatePair } from "./vmlformatting";
import type { ShapeTypeModel } from "./vmlshape";

const coordOrigin = token("coordorigin");
const coordSize = token("coordsize");
const styleToken = token("style");
const office = namespaceTokens.get("vmlOffice") as number;
const officeRel = namespaceTokens.get("officeRel") as number;
const imageData = (namespaceTokens.get("vml") as number) | token("imagedata");
const wordWrap = (namespaceTokens.get("vmlWord") as number) | token("wrap");

/** Reads the original VML coordinate rectangles and style on a shape or template. */
export class ShapeTypeContext {
  /** Applies the shape-type geometry attributes at element entry. @param model - Active shape or template. @param attributes - Source native fast attributes. @returns Shape type context. */
  constructor(
    private readonly model: ShapeTypeModel,
    attributes: readonly FastAttribute[],
  ) {
    model.coordOrigin = decodeInt32Pair(attributes, coordOrigin);
    model.coordSize = decodeInt32Pair(attributes, coordSize);
    setStyle(model, stringAttribute(attributes, styleToken) ?? "");
    if (decodeBool(stringAttribute(attributes, office | token("hr")) ?? "")) {
      const width = stringAttribute(attributes, office | token("hrpct")) ?? "1000";
      if (width !== "0") model.widthPercent = String(toInt32(width));
      model.wrapDistanceLeft = "0";
      model.wrapDistanceRight = "0";
      model.positionHorizontal = stringAttribute(attributes, office | token("hralign")) ?? "left";
      model.wrapType = "topAndBottom";
    }
    const stroked = stringAttribute(attributes, token("stroked"));
    if (stroked !== undefined) model.stroked = decodeBool(stroked);
    const filled = stringAttribute(attributes, token("filled"));
    if (filled !== undefined) model.filled = decodeBool(filled);
  }

  /** Consumes child metadata owned by the shape context. @param id - Child element token. @param attributes - Child attributes. @param relations - Relationships for the containing OOXML part. @returns Nothing. */
  onCreateContext(id: number, attributes: readonly FastAttribute[], relations: Relations): void {
    if (id === imageData) {
      const rel =
        stringAttribute(attributes, office | token("relid")) ??
        stringAttribute(attributes, officeRel | token("id"));
      const model = this.model;
      model.graphicPath = rel === undefined ? undefined : relations.getFragmentPathFromRelId(rel);
      model.graphicTitle = stringAttribute(attributes, office | token("title"));
      model.cropBottom = stringAttribute(attributes, token("cropbottom"));
      model.cropLeft = stringAttribute(attributes, token("cropleft"));
      model.cropRight = stringAttribute(attributes, token("cropright"));
      model.cropTop = stringAttribute(attributes, token("croptop"));
      const gain = decodeFixedPoint(attributes, token("gain"), 0x10000);
      model.gain = gain < 0x10000 ? Math.trunc((gain * 101) / 0x10000) - 100 : gain;
      const blackLevel = (decodeFixedPoint(attributes, token("blacklevel"), 0) << 16) >> 16;
      model.blackLevel = Math.trunc(blackLevel / 327) || 0;
    } else if (id === wordWrap) {
      this.model.wrapAnchorX = stringAttribute(attributes, token("anchorx"));
      this.model.wrapAnchorY = stringAttribute(attributes, token("anchory"));
      this.model.wrapType = stringAttribute(attributes, token("type"));
      this.model.wrapSide = stringAttribute(attributes, token("side"));
    }
  }
}

/** Returns the original integer component of a fixed-point attribute. @param attributes - Image attributes. @param id - Native attribute token. @param fallback - Native attribute default. @returns Signed integer. */
function decodeFixedPoint(
  attributes: readonly FastAttribute[],
  id: number,
  fallback: number,
): number {
  const value = stringAttribute(attributes, id);
  return value?.endsWith("f") ? toInt32(value) : fallback;
}

/** Borrows the value of a present native attribute. @param attributes - Active shape attributes. @param id - Fast attribute token. @returns Lexical value or absence. */
function stringAttribute(attributes: readonly FastAttribute[], id: number): string | undefined {
  return attributes.find(
    /** Locates a matching fast attribute. @param item - Source attribute. @returns Whether its token matches. */
    (item) => item.token === id,
  )?.value;
}

/** Reads a present coordinate pair, retaining native zero for a missing component. @param attributes - Shape attributes. @param id - Unqualified VML coordinate token. @returns Original pair or absence. */
function decodeInt32Pair(
  attributes: readonly FastAttribute[],
  id: number,
): readonly [number, number] | undefined {
  const value = stringAttribute(attributes, id);
  if (value === undefined) return undefined;
  const [first, second] = separatePair(value, ",");
  return [toInt32(first), toInt32(second)];
}

const styleFields = {
  position: "position",
  "z-index": "zIndex",
  left: "left",
  top: "top",
  width: "width",
  height: "height",
  "margin-left": "marginLeft",
  "margin-top": "marginTop",
  "mso-position-vertical-relative": "positionVerticalRelative",
  "mso-position-horizontal-relative": "positionHorizontalRelative",
  "mso-position-horizontal": "positionHorizontal",
  "mso-position-vertical": "positionVertical",
  "mso-width-percent": "widthPercent",
  "mso-width-relative": "widthRelative",
  "mso-height-percent": "heightPercent",
  "mso-height-relative": "heightRelative",
  rotation: "rotation",
  flip: "flip",
  "mso-wrap-style": "wrapStyle",
  "v-text-anchor": "vTextAnchor",
  "mso-wrap-distance-left": "wrapDistanceLeft",
  "mso-wrap-distance-right": "wrapDistanceRight",
  "mso-wrap-distance-top": "wrapDistanceTop",
  "mso-wrap-distance-bottom": "wrapDistanceBottom",
} as const satisfies Record<string, keyof ShapeTypeModel>;

/** Applies the original lexical style fields in declaration order. @param model - Shape attributes. @param style - VML style text. @returns Nothing. */
function setStyle(model: ShapeTypeModel, style: string): void {
  for (const declaration of style.split(";")) {
    const [name, value] = separatePair(declaration, ":");
    if (!name || !value) continue;
    if (name === "mso-fit-shape-to-text") model.autoHeight = true;
    else if (name === "visibility") model.visible = value !== "hidden";
    else if (Object.hasOwn(styleFields, name))
      model[styleFields[name as keyof typeof styleFields]] = value;
  }
}
