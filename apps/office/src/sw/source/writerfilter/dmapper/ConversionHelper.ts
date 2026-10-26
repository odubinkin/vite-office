/** @fileoverview Consumed original ConversionHelper twip-to-mm100 admission rules; shared integral and floating unit owners perform the actual conversion. */
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";
import {
  ConvertBorderStyleFromWord,
  ConvertBorderWidthFromWord,
  SvxBorderLineStyle,
} from "../../../../editeng/source/items/borderline";
import * as Colors from "../../../../tools/inc/color";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
/** Original legacy positive signed16 ceiling; negative values retain the native signed conversion. @param twips - Signed32 twips. @returns Mm100 or zero. */
export function convertTwipToMm100_Limited(twips: number): number {
  twips |= 0;
  return twips >= 0x8000 ? 0 : Number(convertTwipToMm100(BigInt(twips)));
}
/** Original floating conversion followed by ceil, with the same positive ceiling. @param twips - Signed32 twips. @returns Mm100 rounded upward. */
export function convertTwipToMm100_LimitedRoundUp(twips: number): number {
  twips |= 0;
  return twips >= 0x8000 ? 0 : Math.ceil(convert(twips, Length.twip, Length.mm100));
}
/** Original unsigned overload rejects negative input before the limited conversion. @param twips - Signed32 twips. @returns Nonnegative mm100. */
export function convertTwipToMm100_LimitedUnsigned(twips: number): number {
  twips |= 0;
  return twips < 0 ? 0 : convertTwipToMm100_Limited(twips);
}

/** Original OOXML border-style-to-Word bridge; unsupported identifiers fall back to Word0. @param token - Native resource identity. @returns Word style number. */
function lcl_convertBorderStyleFromToken(token: number): number {
  switch (token) {
    case N.LN_Value_ST_Border_nil:
      return 255;
    case N.LN_Value_ST_Border_none:
      return 0;
    case N.LN_Value_ST_Border_single:
      return 1;
    case N.LN_Value_ST_Border_thick:
      return 2;
    case N.LN_Value_ST_Border_double:
      return 3;
    case N.LN_Value_ST_Border_dotted:
      return 6;
    case N.LN_Value_ST_Border_dashed:
      return 7;
    case N.LN_Value_ST_Border_dotDash:
      return 8;
    case N.LN_Value_ST_Border_dotDotDash:
      return 9;
    case N.LN_Value_ST_Border_triple:
      return 10;
    case N.LN_Value_ST_Border_thinThickSmallGap:
      return 11;
    case N.LN_Value_ST_Border_thickThinSmallGap:
      return 12;
    case N.LN_Value_ST_Border_thinThickThinSmallGap:
      return 13;
    case N.LN_Value_ST_Border_thinThickMediumGap:
      return 14;
    case N.LN_Value_ST_Border_thickThinMediumGap:
      return 15;
    case N.LN_Value_ST_Border_thinThickThinMediumGap:
      return 16;
    case N.LN_Value_ST_Border_thinThickLargeGap:
      return 17;
    case N.LN_Value_ST_Border_thickThinLargeGap:
      return 18;
    case N.LN_Value_ST_Border_thinThickThinLargeGap:
      return 19;
    case N.LN_Value_ST_Border_wave:
      return 20;
    case N.LN_Value_ST_Border_doubleWave:
      return 21;
    case N.LN_Value_ST_Border_dashSmallGap:
      return 22;
    case N.LN_Value_ST_Border_dashDotStroked:
      return 23;
    case N.LN_Value_ST_Border_threeDEmboss:
      return 24;
    case N.LN_Value_ST_Border_threeDEngrave:
      return 25;
    case N.LN_Value_ST_Border_outset:
      return 26;
    case N.LN_Value_ST_Border_inset:
      return 27;
    case N.LN_Value_ST_Border_apples:
      return 64;
    case N.LN_Value_ST_Border_archedScallops:
      return 65;
    case N.LN_Value_ST_Border_babyPacifier:
      return 66;
    case N.LN_Value_ST_Border_babyRattle:
      return 67;
    case N.LN_Value_ST_Border_balloons3Colors:
      return 68;
    case N.LN_Value_ST_Border_balloonsHotAir:
      return 69;
    case N.LN_Value_ST_Border_basicBlackDashes:
      return 70;
    case N.LN_Value_ST_Border_basicBlackDots:
      return 71;
    case N.LN_Value_ST_Border_basicBlackSquares:
      return 72;
    case N.LN_Value_ST_Border_basicThinLines:
      return 73;
    case N.LN_Value_ST_Border_basicWhiteDashes:
      return 74;
    case N.LN_Value_ST_Border_basicWhiteDots:
      return 75;
    case N.LN_Value_ST_Border_basicWhiteSquares:
      return 76;
    case N.LN_Value_ST_Border_basicWideInline:
      return 77;
    case N.LN_Value_ST_Border_basicWideMidline:
      return 78;
    case N.LN_Value_ST_Border_basicWideOutline:
      return 79;
    case N.LN_Value_ST_Border_bats:
      return 80;
    case N.LN_Value_ST_Border_birds:
      return 81;
    case N.LN_Value_ST_Border_birdsFlight:
      return 82;
    case N.LN_Value_ST_Border_cabins:
      return 83;
    case N.LN_Value_ST_Border_cakeSlice:
      return 84;
    case N.LN_Value_ST_Border_candyCorn:
      return 85;
    case N.LN_Value_ST_Border_celticKnotwork:
      return 86;
    case N.LN_Value_ST_Border_certificateBanner:
      return 87;
    case N.LN_Value_ST_Border_chainLink:
      return 88;
    case N.LN_Value_ST_Border_champagneBottle:
      return 89;
    case N.LN_Value_ST_Border_checkedBarBlack:
      return 90;
    case N.LN_Value_ST_Border_checkedBarColor:
      return 91;
    case N.LN_Value_ST_Border_checkered:
      return 92;
    case N.LN_Value_ST_Border_christmasTree:
      return 93;
    case N.LN_Value_ST_Border_circlesLines:
      return 94;
    case N.LN_Value_ST_Border_circlesRectangles:
      return 95;
    case N.LN_Value_ST_Border_classicalWave:
      return 96;
    case N.LN_Value_ST_Border_clocks:
      return 97;
    case N.LN_Value_ST_Border_compass:
      return 98;
    case N.LN_Value_ST_Border_confetti:
      return 99;
    case N.LN_Value_ST_Border_confettiGrays:
      return 100;
    case N.LN_Value_ST_Border_confettiOutline:
      return 101;
    case N.LN_Value_ST_Border_confettiStreamers:
      return 102;
    case N.LN_Value_ST_Border_confettiWhite:
      return 103;
    case N.LN_Value_ST_Border_cornerTriangles:
      return 104;
    case N.LN_Value_ST_Border_couponCutoutDashes:
      return 105;
    case N.LN_Value_ST_Border_couponCutoutDots:
      return 106;
    case N.LN_Value_ST_Border_crazyMaze:
      return 107;
    case N.LN_Value_ST_Border_creaturesButterfly:
      return 108;
    case N.LN_Value_ST_Border_creaturesFish:
      return 109;
    case N.LN_Value_ST_Border_creaturesInsects:
      return 110;
    case N.LN_Value_ST_Border_creaturesLadyBug:
      return 111;
    case N.LN_Value_ST_Border_crossStitch:
      return 112;
    case N.LN_Value_ST_Border_cup:
      return 113;
    case N.LN_Value_ST_Border_decoArch:
      return 114;
    case N.LN_Value_ST_Border_decoArchColor:
      return 115;
    case N.LN_Value_ST_Border_decoBlocks:
      return 116;
    case N.LN_Value_ST_Border_diamondsGray:
      return 117;
    case N.LN_Value_ST_Border_doubleD:
      return 118;
    case N.LN_Value_ST_Border_doubleDiamonds:
      return 119;
    case N.LN_Value_ST_Border_earth1:
      return 120;
    case N.LN_Value_ST_Border_earth2:
      return 121;
    case N.LN_Value_ST_Border_eclipsingSquares1:
      return 122;
    case N.LN_Value_ST_Border_eclipsingSquares2:
      return 123;
    case N.LN_Value_ST_Border_eggsBlack:
      return 124;
    case N.LN_Value_ST_Border_fans:
      return 125;
    case N.LN_Value_ST_Border_film:
      return 126;
    case N.LN_Value_ST_Border_firecrackers:
      return 127;
    case N.LN_Value_ST_Border_flowersBlockPrint:
      return 128;
    case N.LN_Value_ST_Border_flowersDaisies:
      return 129;
    case N.LN_Value_ST_Border_flowersModern1:
      return 130;
    case N.LN_Value_ST_Border_flowersModern2:
      return 131;
    case N.LN_Value_ST_Border_flowersPansy:
      return 132;
    case N.LN_Value_ST_Border_flowersRedRose:
      return 133;
    case N.LN_Value_ST_Border_flowersRoses:
      return 134;
    case N.LN_Value_ST_Border_flowersTeacup:
      return 135;
    case N.LN_Value_ST_Border_flowersTiny:
      return 136;
    case N.LN_Value_ST_Border_gems:
      return 137;
    case N.LN_Value_ST_Border_gingerbreadMan:
      return 138;
    case N.LN_Value_ST_Border_gradient:
      return 139;
    case N.LN_Value_ST_Border_handmade1:
      return 140;
    case N.LN_Value_ST_Border_handmade2:
      return 141;
    case N.LN_Value_ST_Border_heartBalloon:
      return 142;
    case N.LN_Value_ST_Border_heartGray:
      return 143;
    case N.LN_Value_ST_Border_hearts:
      return 144;
    case N.LN_Value_ST_Border_heebieJeebies:
      return 145;
    case N.LN_Value_ST_Border_holly:
      return 146;
    case N.LN_Value_ST_Border_houseFunky:
      return 147;
    case N.LN_Value_ST_Border_hypnotic:
      return 148;
    case N.LN_Value_ST_Border_iceCreamCones:
      return 149;
    case N.LN_Value_ST_Border_lightBulb:
      return 150;
    case N.LN_Value_ST_Border_lightning1:
      return 151;
    case N.LN_Value_ST_Border_lightning2:
      return 152;
    case N.LN_Value_ST_Border_mapPins:
      return 153;
    case N.LN_Value_ST_Border_mapleLeaf:
      return 154;
    case N.LN_Value_ST_Border_mapleMuffins:
      return 155;
    case N.LN_Value_ST_Border_marquee:
      return 156;
    case N.LN_Value_ST_Border_marqueeToothed:
      return 157;
    case N.LN_Value_ST_Border_moons:
      return 158;
    case N.LN_Value_ST_Border_mosaic:
      return 159;
    case N.LN_Value_ST_Border_musicNotes:
      return 160;
    case N.LN_Value_ST_Border_northwest:
      return 161;
    case N.LN_Value_ST_Border_ovals:
      return 162;
    case N.LN_Value_ST_Border_packages:
      return 163;
    case N.LN_Value_ST_Border_palmsBlack:
      return 164;
    case N.LN_Value_ST_Border_palmsColor:
      return 165;
    case N.LN_Value_ST_Border_paperClips:
      return 166;
    case N.LN_Value_ST_Border_papyrus:
      return 167;
    case N.LN_Value_ST_Border_partyFavor:
      return 168;
    case N.LN_Value_ST_Border_partyGlass:
      return 169;
    case N.LN_Value_ST_Border_pencils:
      return 170;
    case N.LN_Value_ST_Border_people:
      return 171;
    case N.LN_Value_ST_Border_peopleWaving:
      return 172;
    case N.LN_Value_ST_Border_peopleHats:
      return 173;
    case N.LN_Value_ST_Border_poinsettias:
      return 174;
    case N.LN_Value_ST_Border_postageStamp:
      return 175;
    case N.LN_Value_ST_Border_pumpkin1:
      return 176;
    case N.LN_Value_ST_Border_pushPinNote2:
      return 177;
    case N.LN_Value_ST_Border_pushPinNote1:
      return 178;
    case N.LN_Value_ST_Border_pyramids:
      return 179;
    case N.LN_Value_ST_Border_pyramidsAbove:
      return 180;
    case N.LN_Value_ST_Border_quadrants:
      return 181;
    case N.LN_Value_ST_Border_rings:
      return 182;
    case N.LN_Value_ST_Border_safari:
      return 183;
    case N.LN_Value_ST_Border_sawtooth:
      return 184;
    case N.LN_Value_ST_Border_sawtoothGray:
      return 185;
    case N.LN_Value_ST_Border_scaredCat:
      return 186;
    case N.LN_Value_ST_Border_seattle:
      return 187;
    case N.LN_Value_ST_Border_shadowedSquares:
      return 188;
    case N.LN_Value_ST_Border_sharksTeeth:
      return 189;
    case N.LN_Value_ST_Border_shorebirdTracks:
      return 190;
    case N.LN_Value_ST_Border_skyrocket:
      return 191;
    case N.LN_Value_ST_Border_snowflakeFancy:
      return 192;
    case N.LN_Value_ST_Border_snowflakes:
      return 193;
    case N.LN_Value_ST_Border_sombrero:
      return 194;
    case N.LN_Value_ST_Border_southwest:
      return 195;
    case N.LN_Value_ST_Border_stars:
      return 196;
    case N.LN_Value_ST_Border_starsTop:
      return 197;
    case N.LN_Value_ST_Border_stars3d:
      return 198;
    case N.LN_Value_ST_Border_starsBlack:
      return 199;
    case N.LN_Value_ST_Border_starsShadowed:
      return 200;
    case N.LN_Value_ST_Border_sun:
      return 201;
    case N.LN_Value_ST_Border_swirligig:
      return 202;
    case N.LN_Value_ST_Border_tornPaper:
      return 203;
    case N.LN_Value_ST_Border_tornPaperBlack:
      return 204;
    case N.LN_Value_ST_Border_trees:
      return 205;
    case N.LN_Value_ST_Border_triangleParty:
      return 206;
    case N.LN_Value_ST_Border_triangles:
      return 207;
    case N.LN_Value_ST_Border_tribal1:
      return 208;
    case N.LN_Value_ST_Border_tribal2:
      return 209;
    case N.LN_Value_ST_Border_tribal3:
      return 210;
    case N.LN_Value_ST_Border_tribal4:
      return 211;
    case N.LN_Value_ST_Border_tribal5:
      return 212;
    case N.LN_Value_ST_Border_tribal6:
      return 213;
    case N.LN_Value_ST_Border_twistedLines1:
      return 214;
    case N.LN_Value_ST_Border_twistedLines2:
      return 215;
    case N.LN_Value_ST_Border_vine:
      return 216;
    case N.LN_Value_ST_Border_waveline:
      return 217;
    case N.LN_Value_ST_Border_weavingAngles:
      return 218;
    case N.LN_Value_ST_Border_weavingBraid:
      return 219;
    case N.LN_Value_ST_Border_weavingRibbon:
      return 220;
    case N.LN_Value_ST_Border_weavingStrips:
      return 221;
    case N.LN_Value_ST_Border_whiteFlowers:
      return 222;
    case N.LN_Value_ST_Border_woodwork:
      return 223;
    case N.LN_Value_ST_Border_xIllusions:
      return 224;
    case N.LN_Value_ST_Border_zanyTriangles:
      return 225;
    case N.LN_Value_ST_Border_zigZag:
      return 226;
    case N.LN_Value_ST_Border_zigZagStitch:
      return 227;
  }
  return 0;
}

/** Original static legacy border palette; index0 is automatic and becomes black. */
const aBorderDefColor = [
  Colors.COL_AUTO,
  Colors.COL_BLACK,
  Colors.COL_LIGHTBLUE,
  Colors.COL_LIGHTCYAN,
  Colors.COL_LIGHTGREEN,
  Colors.COL_LIGHTMAGENTA,
  Colors.COL_LIGHTRED,
  Colors.COL_YELLOW,
  Colors.COL_WHITE,
  Colors.COL_BLUE,
  Colors.COL_CYAN,
  Colors.COL_GREEN,
  Colors.COL_MAGENTA,
  Colors.COL_RED,
  Colors.COL_BROWN,
  Colors.COL_GRAY,
  Colors.COL_LIGHTGRAY,
];

/** Original border result writes style/total width/color only; inherited component widths are deliberately untouched. @param thickness - Signed32 twips. @param token - OOXML border style identity. @param color - Packed signed32 color or legacy palette index. @param result - Existing BorderLine2 result. @param isOOXML - Native format flag. @returns Nothing. */
export function MakeBorderLine(
  thickness: number,
  token: number,
  color: number,
  result: BorderLine2,
  isOOXML: boolean,
): void {
  thickness |= 0;
  color |= 0;

  if (!isOOXML && color >>> 0 < aBorderDefColor.length)
    color = (aBorderDefColor[color] as Readonly<Colors.Color>).toInt32();
  if (color === Colors.COL_AUTO.toInt32()) color = Colors.COL_BLACK.toInt32();
  const lineType = lcl_convertBorderStyleFromToken(token),
    style = ConvertBorderStyleFromWord(lineType);
  result.LineStyle = style;
  const converted =
    style === SvxBorderLineStyle.NONE ? 0 : ConvertBorderWidthFromWord(style, thickness, lineType);
  result.LineWidth = convertTwipToMm100_Limited(Math.trunc(converted));
  result.Color = color;
}
