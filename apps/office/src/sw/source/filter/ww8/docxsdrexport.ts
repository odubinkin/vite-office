/** @fileoverview Native WordprocessingDrawing serialization of Writer's embedded inline and floating graphic formats. */
import { GraphicExport } from "../../../../oox/source/export/drawingml";
import type { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { SAL_MAX_INT32, SAL_MIN_INT32 } from "../../../../sal/inc/types";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import type { SwFlyFrameFormat } from "../../core/layout/atrfrm";
import type { SwDoc } from "../../core/doc/doc";
import { CollectGraphicFlyFrames, type BoundGraphicFrame } from "../../core/layout/flycnt";
import type { SwTextNode } from "../../core/txtnode/ndtxt";

const w = token("w");
const wp = token("wp");
const a = token("a");
const pic = token("pic");
const pictureNamespace = "http://schemas.openxmlformats.org/drawingml/2006/picture";
const drawingNamespace = "http://schemas.openxmlformats.org/drawingml/2006/main";
const horizontalRelations: ReadonlyMap<number, string> = new Map([
  [R.PAGE_PRINT_AREA, "margin"],
  [R.PAGE_FRAME, "page"],
  [R.CHAR, "character"],
  [R.PAGE_RIGHT, "rightMargin"],
  [R.PAGE_LEFT, "leftMargin"],
]);
const verticalRelations: ReadonlyMap<number, string> = new Map([
  [R.PAGE_PRINT_AREA, "margin"],
  [R.PAGE_PRINT_AREA_TOP, "topMargin"],
  [R.PAGE_PRINT_AREA_BOTTOM, "bottomMargin"],
  [R.PAGE_FRAME, "page"],
  [R.FRAME, "paragraph"],
]);
const horizontalAlignments: ReadonlyMap<number, string> = new Map([
  [H.LEFT, "left"],
  [H.RIGHT, "right"],
  [H.INSIDE, "inside"],
  [H.OUTSIDE, "outside"],
  [H.CENTER, "center"],
]);
const verticalAlignments: ReadonlyMap<number, string> = new Map([
  [V.TOP, "top"],
  [V.CHAR_TOP, "top"],
  [V.LINE_TOP, "top"],
  [V.BOTTOM, "bottom"],
  [V.CHAR_BOTTOM, "bottom"],
  [V.LINE_BOTTOM, "bottom"],
  [V.CENTER, "center"],
  [V.CHAR_CENTER, "center"],
  [V.LINE_CENTER, "center"],
]);
const squareWrapTypes: ReadonlyMap<WrapTextMode, string> = new Map([
  [WrapTextMode.DYNAMIC, "largest"],
  [WrapTextMode.LEFT, "left"],
  [WrapTextMode.RIGHT, "right"],
]);

/** Owns the package-scoped raster exporter and the native paragraph anchor lookup. */
export class DocxSdrExport {
  private readonly images: GraphicExport;
  private readonly frames: ReturnType<typeof CollectGraphicFlyFrames>;
  private nextId = 1;

  /** Binds the current Writer graph and active package. @param document - Source Writer model. @param filter - Actual OPC filter. @returns Drawing exporter. */
  constructor(document: SwDoc, filter: XmlFilterBase) {
    this.images = new GraphicExport(filter, "word");
    this.frames = CollectGraphicFlyFrames(document, true);
  }

  /** Reports native character positions where the text run writer must split. @param node - Current story paragraph. @returns Anchor offsets. */
  Offsets(node: SwTextNode): readonly number[] {
    return (
      this.frames.get(node)?.map(
        /** Borrows the registered anchor content offset. @param frame - Source picture. @returns UTF16 boundary. */
        (frame) => frame.format.GetAnchor().GetAnchorContentOffset(),
      ) ?? []
    );
  }

  /** Writes all embedded graphics anchored at one character boundary. @param serializer - Active story serializer. @param node - Source paragraph. @param offset - UTF16 boundary. @returns Nothing. */
  WriteAt(serializer: FastSerializerHelper, node: SwTextNode, offset: number): void {
    for (const entry of this.frames.get(node) ?? [])
      if (entry.format.GetAnchor().GetAnchorContentOffset() === offset)
        this.WritePicture(serializer, entry);
  }

  /** Writes a complete embedded picture run in the XML part that owns the anchor. @param serializer - Active story. @param entry - Native frame and its graphic node. @returns Nothing. */
  private WritePicture(serializer: FastSerializerHelper, entry: BoundGraphicFrame): void {
    const { format, graphic } = entry;
    const inline = format.GetAnchor().GetAnchorId() === RndStdIds.FLY_AS_CHAR;
    const image = graphic.GetGraphic();
    const mode = format.GetSurround().GetSurround();
    if (
      !inline &&
      format.GetSurround().IsContour() &&
      mode !== WrapTextMode.THROUGH &&
      mode !== WrapTextMode.NONE
    )
      throw new Error("Writer cannot export this DOCX picture wrapping contour.");
    const relationship = this.images.writeToStorage(
      serializer.getOutputStream() as ZipFragmentStream,
      image.GetNativeData(),
      image.mediaType,
    );
    const id = String(this.nextId++);
    const size = format.GetFrameSize();
    const width = String(Math.min(Math.max(0, emu(size.GetWidth())), SAL_MAX_INT32)),
      height = String(Math.min(Math.max(0, emu(size.GetHeight())), SAL_MAX_INT32));

    serializer.startElementNS(w, token("r"));
    serializer.startElementNS(w, token("drawing"));
    if (inline)
      serializer.startElementNS(
        wp,
        token("inline"),
        token("distT"),
        "0",
        token("distB"),
        "0",
        token("distL"),
        "0",
        token("distR"),
        "0",
      );
    else startFloatingAnchor(serializer, format);
    serializer.singleElementNS(wp, token("extent"), token("cx"), width, token("cy"), height);
    serializer.singleElementNS(
      wp,
      token("effectExtent"),
      token("l"),
      "0",
      token("t"),
      "0",
      token("r"),
      "0",
      token("b"),
      "0",
    );
    if (!inline && (mode === WrapTextMode.THROUGH || mode === WrapTextMode.NONE))
      serializer.singleElementNS(
        wp,
        token(mode === WrapTextMode.THROUGH ? "wrapNone" : "wrapTopAndBottom"),
      );
    else if (!inline)
      serializer.singleElementNS(
        wp,
        token("wrapSquare"),
        token("wrapText"),
        squareWrapTypes.get(mode) ?? "bothSides",
      );
    serializer.singleElementNS(
      wp,
      token("docPr"),
      token("id"),
      id,
      token("name"),
      format.GetName(),
    );
    writePicture(serializer, relationship, format.GetName(), width, height);
    serializer.endElementNS(wp, token(inline ? "inline" : "anchor"));
    serializer.endElementNS(w, token("drawing"));
    serializer.endElementNS(w, token("r"));
  }
}

/** Emits the anchor-only placement fields before the shared size and picture. @param serializer - Active part. @param format - Writer frame. @returns Nothing. */
function startFloatingAnchor(serializer: FastSerializerHelper, format: SwFlyFrameFormat): void {
  const lr = format.GetLRSpace(),
    ul = format.GetULSpace();
  serializer.startElementNS(
    wp,
    token("anchor"),
    token("distT"),
    distance(ul.GetUpper()),
    token("distB"),
    distance(ul.GetLower()),
    token("distL"),
    distance(lr.ResolveLeft()),
    token("distR"),
    distance(lr.ResolveRight()),
    token("simplePos"),
    "0",
    token("relativeHeight"),
    "0",
    token("behindDoc"),
    format.GetOpaque().GetValue() ? "0" : "1",
    token("locked"),
    "0",
    token("layoutInCell"),
    "1",
    token("allowOverlap"),
    format.GetWrapInfluenceOnObjPos().GetAllowOverlap() ? "1" : "0",
  );
  serializer.singleElementNS(wp, token("simplePos"), token("x"), "0", token("y"), "0");
  const horizontal = format.GetHoriOrient();
  const hAlign = horizontal.GetHoriOrient();
  let alignH = horizontalAlignments.get(hAlign);
  if (horizontal.IsPosToggle()) {
    if (hAlign === H.LEFT) alignH = "inside";
    else if (hAlign === H.RIGHT) alignH = "outside";
  }
  position(
    serializer,
    "positionH",
    horizontalRelations.get(horizontal.GetRelationOrient()) ?? "column",
    alignH,
    horizontal.GetPos(),
  );
  const vertical = format.GetVertOrient();
  const vRel = verticalRelations.get(vertical.GetRelationOrient()) ?? "line";
  const line = vertical.GetRelationOrient() === R.TEXT_LINE;
  let alignV = verticalAlignments.get(vertical.GetVertOrient());
  if (line) {
    if (alignV === "top") alignV = "bottom";
    else if (alignV === "bottom") alignV = "top";
  }
  let offsetV = line ? -vertical.GetPos() : vertical.GetPos();
  // Preserve the original Word layout correction for zero top-relative positions.
  if (!offsetV && (vRel === "line" || vRel === "paragraph") && (!alignV || alignV === "top")) {
    alignV = undefined;
    offsetV = 1;
  }
  position(serializer, "positionV", vRel, alignV, offsetV);
}

/** Converts Writer's integer twips to the original serialized EMU unit. @param twips - Source length. @returns Lexical EMUs. */
function emu(twips: number): number {
  return twips * 635;
}

/** Applies the unsigned bound for through-frame wrap distances. @param twips - Frame spacing. @returns Nonnegative EMUs. */
function distance(twips: number): string {
  return String(emu(Math.max(0, twips)));
}

/** Emits one anchored axis with the schema's signed-32-bit coordinate bounds. @param serializer - Active part serializer. @param element - Source axis. @param reference - Relative frame. @param align - Optional alignment. @param offset - Writer twips. @returns Nothing. */
function position(
  serializer: FastSerializerHelper,
  element: string,
  reference: string,
  align: string | undefined,
  offset: number,
): void {
  const axis = token(element);
  serializer.startElementNS(wp, axis, token("relativeFrom"), reference);
  const child = token(align === undefined ? "posOffset" : "align");
  serializer.startElementNS(wp, child);
  serializer.writeEscaped(
    align ?? String(Math.max(SAL_MIN_INT32, Math.min(SAL_MAX_INT32, offset * 635))),
  );
  serializer.endElementNS(wp, child);
  serializer.endElementNS(wp, axis);
}

/** Emits the original DrawingML picture container, nonvisual fields, embedded blip and rectangular shape. @param serializer - Active story. @param relation - Story-local media relationship. @param name - Native frame name. @param width - Picture width in EMUs. @param height - Picture height in EMUs. @returns Nothing. */
function writePicture(
  serializer: FastSerializerHelper,
  relation: string,
  name: string,
  width: string,
  height: string,
): void {
  serializer.startElementNS(a, token("graphic"), FSNS(token("xmlns"), a), drawingNamespace);
  serializer.startElementNS(a, token("graphicData"), token("uri"), pictureNamespace);
  serializer.startElementNS(pic, pic);
  serializer.startElementNS(pic, token("nvPicPr"));
  serializer.singleElementNS(pic, token("cNvPr"), token("id"), "0", token("name"), name);
  serializer.singleElementNS(pic, token("cNvPicPr"));
  serializer.endElementNS(pic, token("nvPicPr"));
  serializer.startElementNS(pic, token("blipFill"));
  serializer.singleElementNS(a, token("blip"), FSNS(token("r"), token("embed")), relation);
  serializer.startElementNS(a, token("stretch"));
  serializer.singleElementNS(a, token("fillRect"));
  serializer.endElementNS(a, token("stretch"));
  serializer.endElementNS(pic, token("blipFill"));
  serializer.startElementNS(pic, token("spPr"));
  serializer.startElementNS(a, token("xfrm"));
  serializer.singleElementNS(a, token("off"), token("x"), "0", token("y"), "0");
  serializer.singleElementNS(a, token("ext"), token("cx"), width, token("cy"), height);
  serializer.endElementNS(a, token("xfrm"));
  serializer.startElementNS(a, token("prstGeom"), token("prst"), "rect");
  serializer.singleElementNS(a, token("avLst"));
  serializer.endElementNS(a, token("prstGeom"));
  serializer.endElementNS(pic, token("spPr"));
  serializer.endElementNS(pic, pic);
  serializer.endElementNS(a, token("graphicData"));
  serializer.endElementNS(a, token("graphic"));
}
