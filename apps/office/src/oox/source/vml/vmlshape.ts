/** @fileoverview VML shape-type geometry, group scaling and original Writer anchor calculation. */
import { toInt32 } from "../../../o3tl/inc/string_view";
import type { Rectangle } from "../../../offapi/com/sun/star/awt/Rectangle";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../offapi/com/sun/star/text/RelOrientation";
import { TextContentAnchorType as A } from "../../../offapi/com/sun/star/text/TextContentAnchorType";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { SAL_MAX_INT32, SAL_MIN_INT32 } from "../../../sal/inc/types";
import type { GraphicHelper } from "../helper/graphichelper";
import { decodeMeasureToHmm } from "./vmlformatting";

/** Original shape-type style values retain lexical units until converted. */
export class ShapeTypeModel {
  position = "";
  zIndex = "";
  left = "";
  top = "";
  width = "";
  height = "";
  marginLeft = "";
  marginTop = "";
  positionVerticalRelative = "";
  positionHorizontalRelative = "";
  positionHorizontal = "";
  positionVertical = "";
  widthPercent = "";
  widthRelative = "";
  heightPercent = "";
  heightRelative = "";
  autoHeight = false;
  visible = true;
  rotation = "";
  flip = "";
  wrapStyle = "";
  vTextAnchor = "";
  wrapDistanceLeft = "";
  wrapDistanceRight = "";
  wrapDistanceTop = "";
  wrapDistanceBottom = "";
  coordOrigin: readonly [number, number] | undefined;
  coordSize: readonly [number, number] | undefined;
  stroked: boolean | undefined;
  filled: boolean | undefined;
  wrapType: string | undefined;
  wrapAnchorX: string | undefined;
  wrapAnchorY: string | undefined;
  wrapSide: string | undefined;
  graphicPath: string | undefined;
  graphicTitle: string | undefined;
  cropBottom: string | undefined;
  cropLeft: string | undefined;
  cropRight: string | undefined;
  cropTop: string | undefined;
  gain = 0x10000;
  blackLevel = 0;
}

/** Original parent anchor uses the device rectangle and group coordinate system. */
export interface ShapeParentAnchor {
  shapeRect: Rectangle;
  coordSys: Rectangle;
}

/** Native top-level and group-coordinate rectangles calculated from the shape type. */
export class ShapeType {
  readonly model = new ShapeTypeModel();

  /** Borrows the OOXML graphic conversion owner. @param graphic - Drawing filter device converter. @returns Shape type. */
  constructor(private readonly graphic: GraphicHelper) {}

  /** Resolves the original group coordinate system and guards zero extents. @returns Native coordinate rectangle. */
  getCoordSystem(): Rectangle {
    const [X, Y] = this.model.coordOrigin ?? [0, 0];
    const [width, height] = this.model.coordSize ?? [1000, 1000];
    return { X, Y, Width: width || 1, Height: height || 1 };
  }

  /** Uses absolute device units for top-level shapes or transforms group-local units. @param parent - Optional parent anchoring rectangle. @returns Physical rectangle. */
  getRectangle(parent?: ShapeParentAnchor): Rectangle {
    if (!parent) return this.getAbsRectangle();
    const { shapeRect, coordSys } = parent;
    const rel = this.getRelRectangle();
    const xRatio = shapeRect.Width / coordSys.Width;
    const yRatio = shapeRect.Height / coordSys.Height;
    return {
      X: Math.trunc(shapeRect.X + xRatio * (rel.X - coordSys.X) + 0.5),
      Y: Math.trunc(shapeRect.Y + yRatio * (rel.Y - coordSys.Y) + 0.5),
      Width: Math.trunc(xRatio * rel.Width + 0.5),
      Height: Math.trunc(yRatio * rel.Height + 0.5),
    };
  }

  /** Converts the shape size and positions, including checked margin additions. @returns Physical rectangle. */
  private getAbsRectangle(): Rectangle {
    const { left, top, width, height, marginLeft, marginTop, position } = this.model;
    const X = checkedAdd(
      decodeMeasureToHmm(this.graphic, left, 0, true, true),
      decodeMeasureToHmm(this.graphic, marginLeft, 0, true, true),
    );
    return {
      X: X === 0 && position === "absolute" ? 1 : X,
      Y: checkedAdd(
        decodeMeasureToHmm(this.graphic, top, 0, false, true),
        decodeMeasureToHmm(this.graphic, marginTop, 0, false, true),
      ),
      Width: decodeMeasureToHmm(this.graphic, width, 0, true, true) || 1,
      Height: decodeMeasureToHmm(this.graphic, height, 0, false, true) || 1,
    };
  }

  /** Uses group coordinate numbers without physical-unit parsing. @returns Parent-relative rectangle. */
  private getRelRectangle(): Rectangle {
    const { left, top, width, height } = this.model;
    return {
      X: toInt32(left),
      Y: toInt32(top),
      Width: toInt32(width) || 1,
      Height: toInt32(height) || 1,
    };
  }
}

/** Preserves the original zero fallback for overflow before absolute-position adjustment. @param n - Coordinate. @param margin - Additional coordinate. @returns Signed coordinate. */
function checkedAdd(n: number, margin: number): number {
  const sum = n + margin;
  return sum < SAL_MIN_INT32 || sum > SAL_MAX_INT32 ? 0 : sum;
}

const horizontal = new Map([
  ["center", H.CENTER],
  ["left", H.LEFT],
  ["right", H.RIGHT],
  ["inside", H.LEFT],
  ["outside", H.RIGHT],
]);
const vertical = new Map([
  ["center", V.CENTER],
  ["top", V.TOP],
  ["bottom", V.BOTTOM],
  ["inside", V.TOP],
  ["outside", V.BOTTOM],
]);
const horizontalRelations = new Map([
  ["page", R.PAGE_FRAME],
  ["margin", R.PAGE_PRINT_AREA],
  ["right-margin-area", R.PAGE_RIGHT],
  ["inner-margin-area", R.PAGE_RIGHT],
  ["left-margin-area", R.PAGE_LEFT],
  ["outer-margin-area", R.PAGE_LEFT],
]);
const verticalRelations = new Map([
  ["page", R.PAGE_FRAME],
  ["margin", R.PAGE_PRINT_AREA],
  ["top-margin-area", R.PAGE_PRINT_AREA_TOP],
  ["bottom-margin-area", R.PAGE_PRINT_AREA_BOTTOM],
]);

/** Properties set by the represented native VML positioning stage. */
export interface ShapeAnchorProperties {
  AnchorType: A;
  HoriOrient?: H;
  HoriOrientRelation: R;
  VertOrient: V;
  VertOrientRelation?: R;
  PageToggle?: boolean;
}

/** Resolves the native position options and orientation relations prior to shape insertion. @param model - Source shape style. @returns Original positioning properties. */
export function setAnchorType(model: ShapeTypeModel): ShapeAnchorProperties {
  const absolute = model.position === "absolute";
  const relative = model.position === "relative";
  const hori = horizontal.get(model.positionHorizontal);
  const vert = vertical.get(model.positionVertical);
  const honorMargins = (absolute || relative) && (hori === H.LEFT || hori === H.RIGHT);
  const properties: ShapeAnchorProperties = {
    AnchorType: absolute ? A.AT_CHARACTER : relative ? A.AT_PARAGRAPH : A.AS_CHARACTER,
    HoriOrientRelation:
      horizontalRelations.get(model.positionHorizontalRelative) ??
      (honorMargins ? R.PRINT_AREA : R.FRAME),
    VertOrient: vert ?? (absolute || relative ? V.NONE : V.TOP),
  };
  if (absolute)
    properties.VertOrientRelation =
      verticalRelations.get(model.positionVerticalRelative) ?? R.FRAME;
  if (hori !== undefined) properties.HoriOrient = hori;
  if (model.positionHorizontal === "inside" || model.positionHorizontal === "outside")
    properties.PageToggle = true;
  return properties;
}
