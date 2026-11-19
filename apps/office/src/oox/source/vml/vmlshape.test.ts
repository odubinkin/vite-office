/** @fileoverview Native VML shape geometry through the original package parts and fast SAX tokens. */
import { existsSync, readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../offapi/com/sun/star/text/RelOrientation";
import { TextContentAnchorType as A } from "../../../offapi/com/sun/star/text/TextContentAnchorType";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { FastSaxParser, type FastContext } from "../../../sax/source/fastparser/fastparser";
import { SAL_MAX_INT32, SAL_MAX_INT64, SAL_MIN_INT32, SAL_MIN_INT64 } from "../../../sal/inc/types";
import { FastTokenHandler } from "../core/fasttokenhandler";
import { Relations } from "../core/relations";
import { XmlFilterBase } from "../core/xmlfilterbase";
import { ZipStorage } from "../helper/zipstorage";
import { GraphicHelper, getSystemColor } from "../helper/graphichelper";
import { namespaceTokens } from "../token/namespacemap";
import { getTokenFromUtf8 as token } from "../token/tokenmap";
import {
  decodeMeasureToEmu,
  decodeMeasureToHmm,
  decodePercent,
  decodeRotation,
} from "./vmlformatting";
import { setAnchorType, ShapeType } from "./vmlshape";
import { ShapeTypeContext } from "./vmlshapecontext";

const upstream = "../../vendor/libreoffice-reference/";
const pixels = new GraphicHelper(3780, 4724);
const vml = namespaceTokens.get("vml") as number;
const candidates = new Set(
  ["shape", "shapetype", "group", "rect", "oval"].map(
    /** Forms the exact native VML token. @param name - Local name. @returns Fast token. */
    (name) => vml | token(name),
  ),
);

/** Parses VML shape entries through the registered fast-token driver. @param xml - Actual Word part. @param relations - Containing part relationship owner. @returns Shape-type imports in document order. */
function importShapeTypes(xml: string, relations = new Relations("")): ShapeType[] {
  const parser = new FastSaxParser();
  const shapes: ShapeType[] = [];
  const scopes: (ShapeTypeContext | undefined)[] = [];
  const handler: FastContext = {
    /** Traverses known names. @returns Context. */ createFastChildContext: () => handler,
    /** Traverses surrounding Word markup. @returns Context. */ createUnknownChildContext: () =>
      handler,
    /** Creates the original shape context with fast attributes. @param id - Element token. @param attributes - Shape attributes. @returns Nothing. */
    startFastElement(id, attributes) {
      if (!candidates.has(id)) {
        scopes.at(-1)?.onCreateContext(id, attributes, relations);
        scopes.push(undefined);
        return;
      }
      const shape = new ShapeType(pixels);
      scopes.push(new ShapeTypeContext(shape.model, attributes));
      shapes.push(shape);
    },
    /** Shape scopes have no extra geometry at close. @returns Nothing. */ endFastElement() {
      scopes.pop();
    },
    /** Surrounding Word content has no geometry attributes. @returns Nothing. */ startUnknownElement() {
      scopes.push(undefined);
    },
    /** Surrounding Word content closes normally. @returns Nothing. */ endUnknownElement() {
      scopes.pop();
    },
    /** Shape geometry is supplied by attributes. @returns Nothing. */ characters() {},
  };
  parser.setTokenHandler(new FastTokenHandler());
  parser.registerNamespace("urn:schemas-microsoft-com:vml", vml);
  parser.registerNamespace(
    "urn:schemas-microsoft-com:office:office",
    namespaceTokens.get("vmlOffice") as number,
  );
  parser.registerNamespace(
    "urn:schemas-microsoft-com:office:word",
    namespaceTokens.get("vmlWord") as number,
  );
  parser.registerNamespace(
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    namespaceTokens.get("officeRel") as number,
  );
  parser.setFastDocumentHandler({
    ...handler,
    /** Starts the actual Word part. @returns Nothing. */ startDocument() {},
    /** Ends the actual Word part. @returns Nothing. */ endDocument() {},
  });
  try {
    parser.parseStream(xml);
    return shapes;
  } finally {
    parser.dispose();
  }
}

/** Loads unchanged package bytes from the pinned corpus. @param path - Upstream DOCX. @param part - Word XML entry. @returns Shape type models. */
async function fixture(path: string, part: string): Promise<ShapeType[]> {
  const bytes = new Uint8Array(readFileSync(upstream + path));
  const archive = await DocumentArchive.open(bytes);
  const filter = new XmlFilterBase(await ZipStorage.open(bytes));
  return importShapeTypes(await archive.readTextEntry(part), await filter.importRelations(part));
}

it.skipIf(!existsSync(upstream))(
  "reads the picture watermark geometry in the original testFooterMarginLost header",
  /** Checks the native source shape style and the actual Word package. @returns Completion. */ async () => {
    const [template, watermark] = await fixture(
      "sw/qa/extras/ooxmlexport/data/footer-margin-lost.docx",
      "word/header2.xml",
    );
    expect(template?.getCoordSystem()).toEqual({ X: 0, Y: 0, Width: 21600, Height: 21600 });
    expect(template?.model).toMatchObject({ stroked: false, filled: false });
    expect(watermark?.model).toMatchObject({
      zIndex: "-251656192",
      graphicPath: "word/media/image1.png",
      graphicTitle: "memorandum_HL_2012_word-03",
      wrapAnchorX: "margin",
      wrapAnchorY: "margin",
    });
    expect(watermark?.getRectangle()).toEqual({ X: 1, Y: 0, Width: 10934, Height: 1944 });
    expect(watermark && setAnchorType(watermark.model)).toEqual({
      AnchorType: A.AT_CHARACTER,
      HoriOrient: H.CENTER,
      HoriOrientRelation: R.PAGE_PRINT_AREA,
      VertOrient: V.CENTER,
      VertOrientRelation: R.PAGE_PRINT_AREA,
    });
  },
);

it.skipIf(!existsSync(upstream))(
  "converts the fixed-degree angle in the original tdf137314 VML fixture",
  /** Checks the native rotation prior to inserting the converted path. @returns Completion. */ async () => {
    const types = await fixture(
      "oox/qa/unit/data/tdf137314_vml_rotation_unit_fd.docx",
      "word/document.xml",
    );
    const arc = types.find(
      /** Selects the original thirty-degree operation. @param shape - VML model. @returns Whether the fixture angle matches. */
      (shape) => shape.model.rotation === "1966080fd",
    );
    expect(arc).toBeDefined();
    expect(decodeRotation(arc?.model.rotation ?? "")).toBe(33000);
  },
);

it("keeps VML lexical defaults, group geometry and anchor relations", /** Covers native malformed entries, coordinate guards and synthetic anchor choices. @returns Nothing. */ () => {
  const [parent, child, rule, inline, absolute, overflow] = importShapeTypes(
    '<body xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">' +
      '<v:group coordorigin="-10, 20" coordsize="10,20" style="left:-20mm;top:7mm;width:30mm;height:40mm">' +
      '<v:shape coordsize="0" style=" left : -10 ; top:20;width:;width:10;height:0;visibility:hidden;mso-fit-shape-to-text:false;unknown:x;broken;position:relative;mso-position-horizontal:inside;mso-position-vertical:outside" filled="true"/></v:group>' +
      '<v:rect o:hr="t" style="mso-width-percent:600;visibility:hidden;visibility:shown"/>' +
      '<v:rect o:hr="true" o:hrpct="0" o:hralign="right" style="mso-width-percent:500"/>' +
      '<v:shape style="position:absolute;mso-position-horizontal:outside;mso-position-horizontal-relative:inner-margin-area;mso-position-vertical-relative:bottom-margin-area"/>' +
      '<v:shape style="position:absolute;left:30000000cm;margin-left:1cm;top:30000000cm;margin-top:1cm"/></body>',
  );
  assert(parent);
  expect(parent.getRectangle()).toEqual({ X: -2000, Y: 700, Width: 3000, Height: 4000 });
  expect(child?.getCoordSystem()).toEqual({ X: 0, Y: 0, Width: 1, Height: 1 });
  expect(child?.model).toMatchObject({ autoHeight: true, filled: true, visible: false });
  expect(
    child?.getRectangle({ shapeRect: parent.getRectangle(), coordSys: parent.getCoordSystem() }),
  ).toEqual({
    X: -1999,
    Y: 700,
    Width: 3000,
    Height: 200,
  });
  expect(child && setAnchorType(child.model)).toEqual({
    AnchorType: A.AT_PARAGRAPH,
    HoriOrient: H.LEFT,
    HoriOrientRelation: R.PRINT_AREA,
    VertOrient: V.BOTTOM,
    PageToggle: true,
  });
  expect(rule?.getRectangle()).toEqual({ X: 0, Y: 0, Width: 1, Height: 1 });
  expect(rule?.model).toMatchObject({
    visible: true,
    widthPercent: "1000",
    wrapType: "topAndBottom",
    wrapDistanceLeft: "0",
  });
  expect(inline?.model.widthPercent).toBe("500");
  expect(inline && setAnchorType(inline.model)).toEqual({
    AnchorType: A.AS_CHARACTER,
    HoriOrient: H.RIGHT,
    HoriOrientRelation: R.FRAME,
    VertOrient: V.TOP,
  });
  expect(absolute && setAnchorType(absolute.model)).toEqual({
    AnchorType: A.AT_CHARACTER,
    HoriOrient: H.RIGHT,
    HoriOrientRelation: R.PAGE_RIGHT,
    VertOrient: V.NONE,
    VertOrientRelation: R.PAGE_PRINT_AREA_BOTTOM,
    PageToggle: true,
  });
  expect(overflow?.getRectangle()).toEqual({ X: 1, Y: 0, Width: 1, Height: 1 });
  expect(overflow && setAnchorType(overflow.model)).toMatchObject({ VertOrientRelation: R.FRAME });
});

it("preserves measurement units and the native asymmetric rounding and fallbacks", /** Verifies original suffixes and device scale including non-square pixels. @returns Nothing. */ () => {
  for (const [value, expected] of [
    ["1in", 914400n],
    ["1cm", 360000n],
    ["1mm", 36000n],
    ["1pt", 12700n],
    ["1pc", 152400n],
    ["-1pt", -12699n],
    ["152400", 152400n],
    ["1pt ", 300n],
    ["1xx", 1n],
    ["50%", 150n],
    ["", 0n],
    ["0%", 0n],
    ["auto", 300n],
    ["1e999cm", 0n],
    ["1e30cm", SAL_MAX_INT64],
    ["-1e30cm", SAL_MIN_INT64],
  ] as const)
    expect(decodeMeasureToEmu(pixels, value, 300, true, false)).toBe(expected);
  expect(decodeMeasureToHmm(pixels, "1px", 0, true, false)).toBe(26);
  expect(decodeMeasureToHmm(pixels, "1", 0, false, true)).toBe(21);
  expect(decodeMeasureToHmm(pixels, "1e30mm", 0, true, false)).toBe(SAL_MAX_INT32);
  expect(decodeMeasureToHmm(pixels, "-1e30mm", 0, true, false)).toBe(SAL_MIN_INT32);
  expect(decodeMeasureToEmu(new GraphicHelper(0, 0), "1", 0, true, true)).toBe(0n);
  for (const [value, expected] of [
    ["0.25", 0.25],
    ["25%", 0.25],
    ["16384f", 0.25],
    ["1e999", 0.9],
    ["1xx", 0.9],
    ["", 0.9],
  ] as const)
    expect(decodePercent(value, 0.9)).toBe(expected);
  for (const [value, expected] of [
    ["-60", 6000],
    ["30", 33000],
    ["30deg", 0],
    ["1e999", 0],
    ["", 0],
  ] as const)
    expect(decodeRotation(value)).toBe(expected);
});

it("resolves the VML picture relationship variants and reads crop and picture controls", /** Uses the native relationship owner for both Word and Excel VML attribute spellings. @returns Nothing. */ () => {
  const relations = new Relations("xl/drawings/vmlDrawing1.vml");
  relations.emplace("image", {
    maId: "image",
    maType: "image",
    maTarget: "../media/picture.png",
    mbExternal: false,
  });
  relations.emplace("linked", {
    maId: "linked",
    maType: "image",
    maTarget: "https://example.invalid/picture.png",
    mbExternal: true,
  });
  const [excel, linked, none] = importShapeTypes(
    '<v:group xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><v:shape><v:imagedata o:relid="image" r:id="linked" croptop="12f" cropleft="8f" cropright="7f" cropbottom="5f" gain="32768f" blacklevel="-3270f"/></v:shape><v:shape><v:imagedata r:id="linked"/></v:shape><v:shape><v:imagedata gain="0.5" blacklevel="5"/></v:shape></v:group>',
    relations,
  ).slice(1);
  expect(excel?.model).toMatchObject({
    graphicPath: "xl/media/picture.png",
    cropTop: "12f",
    cropLeft: "8f",
    cropRight: "7f",
    cropBottom: "5f",
    gain: -50,
    blackLevel: -10,
  });
  expect(linked?.model.graphicPath).toBe("");
  expect(none?.model).toMatchObject({ graphicPath: undefined, gain: 65536, blackLevel: 0 });
});

it("retains the existing shared GraphicHelper system palette", /** Verifies known colors and the existing optional lexical fallback. @returns Nothing. */ () => {
  expect(getSystemColor("windowText")?.toInt32()).toBe(0);
  const black = getSystemColor("windowText");
  expect(getSystemColor("missing", black)).toBe(black);
  expect(getSystemColor("missing")).toBeUndefined();
});
