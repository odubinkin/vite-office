/** @fileoverview Original TDefTableHandler cell-border receiver and exact native border/theme lookup switches; generated UNO values retain actual ownership. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { ThemeColorType, ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { Transformation, TransformationType } from "../../../../docmodel/inc/color/Transformation";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import { MakeBorderLine } from "./ConversionHelper";
import { TablePropertyMap } from "./PropertyMap";
import { PropertyIds as P } from "./PropertyIds";
import type { Id, Properties, Sprm, Reference, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Original separate per-side vectors retain the first result; raw border state resets per child. */
export class TDefTableHandler implements Properties {
  private readonly m_aLeftBorderLines: BorderLine2[] = [];
  private readonly m_aRightBorderLines: BorderLine2[] = [];
  private readonly m_aTopBorderLines: BorderLine2[] = [];
  private readonly m_aBottomBorderLines: BorderLine2[] = [];
  private readonly m_aInsideHBorderLines: BorderLine2[] = [];
  private readonly m_aInsideVBorderLines: BorderLine2[] = [];
  private m_nLineWidth = 0;
  private m_nLineType = 0;
  private m_nLineColor = 0;
  private m_eThemeColorType = ThemeColorType.Unknown;
  private m_nThemeTint = 0;
  private m_nThemeShade = 0;
  private readonly m_aInteropGrabBagName = new OUString();
  private m_aInteropGrabBag: PropertyValue[] = [];
  /** Original native getBorderTypeString switch without token renumbering or fallback normalization. @param type - Native resource identity. @returns Original mapped value. */
  static getBorderTypeString(type: number): OUString {
    switch (type) {
      case N.LN_Value_ST_Border_nil:
        return OUString.createFromAscii(new TextEncoder().encode("nil\0"));
      case N.LN_Value_ST_Border_none:
        return OUString.createFromAscii(new TextEncoder().encode("none\0"));
      case N.LN_Value_ST_Border_single:
        return OUString.createFromAscii(new TextEncoder().encode("single\0"));
      case N.LN_Value_ST_Border_thick:
        return OUString.createFromAscii(new TextEncoder().encode("thick\0"));
      case N.LN_Value_ST_Border_double:
        return OUString.createFromAscii(new TextEncoder().encode("double\0"));
      case N.LN_Value_ST_Border_dotted:
        return OUString.createFromAscii(new TextEncoder().encode("dotted\0"));
      case N.LN_Value_ST_Border_dashed:
        return OUString.createFromAscii(new TextEncoder().encode("dashed\0"));
      case N.LN_Value_ST_Border_dotDash:
        return OUString.createFromAscii(new TextEncoder().encode("dotDash\0"));
      case N.LN_Value_ST_Border_dotDotDash:
        return OUString.createFromAscii(new TextEncoder().encode("dotDotDash\0"));
      case N.LN_Value_ST_Border_triple:
        return OUString.createFromAscii(new TextEncoder().encode("triple\0"));
      case N.LN_Value_ST_Border_thinThickSmallGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickSmallGap\0"));
      case N.LN_Value_ST_Border_thickThinSmallGap:
        return OUString.createFromAscii(new TextEncoder().encode("thickThinSmallGap\0"));
      case N.LN_Value_ST_Border_thinThickThinSmallGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickThinSmallGap\0"));
      case N.LN_Value_ST_Border_thinThickMediumGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickMediumGap\0"));
      case N.LN_Value_ST_Border_thickThinMediumGap:
        return OUString.createFromAscii(new TextEncoder().encode("thickThinMediumGap\0"));
      case N.LN_Value_ST_Border_thinThickThinMediumGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickThinMediumGap\0"));
      case N.LN_Value_ST_Border_thinThickLargeGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickLargeGap\0"));
      case N.LN_Value_ST_Border_thickThinLargeGap:
        return OUString.createFromAscii(new TextEncoder().encode("thickThinLargeGap\0"));
      case N.LN_Value_ST_Border_thinThickThinLargeGap:
        return OUString.createFromAscii(new TextEncoder().encode("thinThickThinLargeGap\0"));
      case N.LN_Value_ST_Border_wave:
        return OUString.createFromAscii(new TextEncoder().encode("wave\0"));
      case N.LN_Value_ST_Border_doubleWave:
        return OUString.createFromAscii(new TextEncoder().encode("doubleWave\0"));
      case N.LN_Value_ST_Border_dashSmallGap:
        return OUString.createFromAscii(new TextEncoder().encode("dashSmallGap\0"));
      case N.LN_Value_ST_Border_dashDotStroked:
        return OUString.createFromAscii(new TextEncoder().encode("dashDotStroked\0"));
      case N.LN_Value_ST_Border_threeDEmboss:
        return OUString.createFromAscii(new TextEncoder().encode("threeDEmboss\0"));
      case N.LN_Value_ST_Border_threeDEngrave:
        return OUString.createFromAscii(new TextEncoder().encode("threeDEngrave\0"));
      case N.LN_Value_ST_Border_outset:
        return OUString.createFromAscii(new TextEncoder().encode("outset\0"));
      case N.LN_Value_ST_Border_inset:
        return OUString.createFromAscii(new TextEncoder().encode("inset\0"));
      case N.LN_Value_ST_Border_apples:
        return OUString.createFromAscii(new TextEncoder().encode("apples\0"));
      case N.LN_Value_ST_Border_archedScallops:
        return OUString.createFromAscii(new TextEncoder().encode("archedScallops\0"));
      case N.LN_Value_ST_Border_babyPacifier:
        return OUString.createFromAscii(new TextEncoder().encode("babyPacifier\0"));
      case N.LN_Value_ST_Border_babyRattle:
        return OUString.createFromAscii(new TextEncoder().encode("babyRattle\0"));
      case N.LN_Value_ST_Border_balloons3Colors:
        return OUString.createFromAscii(new TextEncoder().encode("balloons3Colors\0"));
      case N.LN_Value_ST_Border_balloonsHotAir:
        return OUString.createFromAscii(new TextEncoder().encode("balloonsHotAir\0"));
      case N.LN_Value_ST_Border_basicBlackDashes:
        return OUString.createFromAscii(new TextEncoder().encode("basicBlackDashes\0"));
      case N.LN_Value_ST_Border_basicBlackDots:
        return OUString.createFromAscii(new TextEncoder().encode("basicBlackDots\0"));
      case N.LN_Value_ST_Border_basicBlackSquares:
        return OUString.createFromAscii(new TextEncoder().encode("basicBlackSquares\0"));
      case N.LN_Value_ST_Border_basicThinLines:
        return OUString.createFromAscii(new TextEncoder().encode("basicThinLines\0"));
      case N.LN_Value_ST_Border_basicWhiteDashes:
        return OUString.createFromAscii(new TextEncoder().encode("basicWhiteDashes\0"));
      case N.LN_Value_ST_Border_basicWhiteDots:
        return OUString.createFromAscii(new TextEncoder().encode("basicWhiteDots\0"));
      case N.LN_Value_ST_Border_basicWhiteSquares:
        return OUString.createFromAscii(new TextEncoder().encode("basicWhiteSquares\0"));
      case N.LN_Value_ST_Border_basicWideInline:
        return OUString.createFromAscii(new TextEncoder().encode("basicWideInline\0"));
      case N.LN_Value_ST_Border_basicWideMidline:
        return OUString.createFromAscii(new TextEncoder().encode("basicWideMidline\0"));
      case N.LN_Value_ST_Border_basicWideOutline:
        return OUString.createFromAscii(new TextEncoder().encode("basicWideOutline\0"));
      case N.LN_Value_ST_Border_bats:
        return OUString.createFromAscii(new TextEncoder().encode("bats\0"));
      case N.LN_Value_ST_Border_birds:
        return OUString.createFromAscii(new TextEncoder().encode("birds\0"));
      case N.LN_Value_ST_Border_birdsFlight:
        return OUString.createFromAscii(new TextEncoder().encode("birdsFlight\0"));
      case N.LN_Value_ST_Border_cabins:
        return OUString.createFromAscii(new TextEncoder().encode("cabins\0"));
      case N.LN_Value_ST_Border_cakeSlice:
        return OUString.createFromAscii(new TextEncoder().encode("cakeSlice\0"));
      case N.LN_Value_ST_Border_candyCorn:
        return OUString.createFromAscii(new TextEncoder().encode("candyCorn\0"));
      case N.LN_Value_ST_Border_celticKnotwork:
        return OUString.createFromAscii(new TextEncoder().encode("celticKnotwork\0"));
      case N.LN_Value_ST_Border_certificateBanner:
        return OUString.createFromAscii(new TextEncoder().encode("certificateBanner\0"));
      case N.LN_Value_ST_Border_chainLink:
        return OUString.createFromAscii(new TextEncoder().encode("chainLink\0"));
      case N.LN_Value_ST_Border_champagneBottle:
        return OUString.createFromAscii(new TextEncoder().encode("champagneBottle\0"));
      case N.LN_Value_ST_Border_checkedBarBlack:
        return OUString.createFromAscii(new TextEncoder().encode("checkedBarBlack\0"));
      case N.LN_Value_ST_Border_checkedBarColor:
        return OUString.createFromAscii(new TextEncoder().encode("checkedBarColor\0"));
      case N.LN_Value_ST_Border_checkered:
        return OUString.createFromAscii(new TextEncoder().encode("checkered\0"));
      case N.LN_Value_ST_Border_christmasTree:
        return OUString.createFromAscii(new TextEncoder().encode("christmasTree\0"));
      case N.LN_Value_ST_Border_circlesLines:
        return OUString.createFromAscii(new TextEncoder().encode("circlesLines\0"));
      case N.LN_Value_ST_Border_circlesRectangles:
        return OUString.createFromAscii(new TextEncoder().encode("circlesRectangles\0"));
      case N.LN_Value_ST_Border_classicalWave:
        return OUString.createFromAscii(new TextEncoder().encode("classicalWave\0"));
      case N.LN_Value_ST_Border_clocks:
        return OUString.createFromAscii(new TextEncoder().encode("clocks\0"));
      case N.LN_Value_ST_Border_compass:
        return OUString.createFromAscii(new TextEncoder().encode("compass\0"));
      case N.LN_Value_ST_Border_confetti:
        return OUString.createFromAscii(new TextEncoder().encode("confetti\0"));
      case N.LN_Value_ST_Border_confettiGrays:
        return OUString.createFromAscii(new TextEncoder().encode("confettiGrays\0"));
      case N.LN_Value_ST_Border_confettiOutline:
        return OUString.createFromAscii(new TextEncoder().encode("confettiOutline\0"));
      case N.LN_Value_ST_Border_confettiStreamers:
        return OUString.createFromAscii(new TextEncoder().encode("confettiStreamers\0"));
      case N.LN_Value_ST_Border_confettiWhite:
        return OUString.createFromAscii(new TextEncoder().encode("confettiWhite\0"));
      case N.LN_Value_ST_Border_cornerTriangles:
        return OUString.createFromAscii(new TextEncoder().encode("cornerTriangles\0"));
      case N.LN_Value_ST_Border_couponCutoutDashes:
        return OUString.createFromAscii(new TextEncoder().encode("couponCutoutDashes\0"));
      case N.LN_Value_ST_Border_couponCutoutDots:
        return OUString.createFromAscii(new TextEncoder().encode("couponCutoutDots\0"));
      case N.LN_Value_ST_Border_crazyMaze:
        return OUString.createFromAscii(new TextEncoder().encode("crazyMaze\0"));
      case N.LN_Value_ST_Border_creaturesButterfly:
        return OUString.createFromAscii(new TextEncoder().encode("creaturesButterfly\0"));
      case N.LN_Value_ST_Border_creaturesFish:
        return OUString.createFromAscii(new TextEncoder().encode("creaturesFish\0"));
      case N.LN_Value_ST_Border_creaturesInsects:
        return OUString.createFromAscii(new TextEncoder().encode("creaturesInsects\0"));
      case N.LN_Value_ST_Border_creaturesLadyBug:
        return OUString.createFromAscii(new TextEncoder().encode("creaturesLadyBug\0"));
      case N.LN_Value_ST_Border_crossStitch:
        return OUString.createFromAscii(new TextEncoder().encode("crossStitch\0"));
      case N.LN_Value_ST_Border_cup:
        return OUString.createFromAscii(new TextEncoder().encode("cup\0"));
      case N.LN_Value_ST_Border_decoArch:
        return OUString.createFromAscii(new TextEncoder().encode("decoArch\0"));
      case N.LN_Value_ST_Border_decoArchColor:
        return OUString.createFromAscii(new TextEncoder().encode("decoArchColor\0"));
      case N.LN_Value_ST_Border_decoBlocks:
        return OUString.createFromAscii(new TextEncoder().encode("decoBlocks\0"));
      case N.LN_Value_ST_Border_diamondsGray:
        return OUString.createFromAscii(new TextEncoder().encode("diamondsGray\0"));
      case N.LN_Value_ST_Border_doubleD:
        return OUString.createFromAscii(new TextEncoder().encode("doubleD\0"));
      case N.LN_Value_ST_Border_doubleDiamonds:
        return OUString.createFromAscii(new TextEncoder().encode("doubleDiamonds\0"));
      case N.LN_Value_ST_Border_earth1:
        return OUString.createFromAscii(new TextEncoder().encode("earth1\0"));
      case N.LN_Value_ST_Border_earth2:
        return OUString.createFromAscii(new TextEncoder().encode("earth2\0"));
      case N.LN_Value_ST_Border_eclipsingSquares1:
        return OUString.createFromAscii(new TextEncoder().encode("eclipsingSquares1\0"));
      case N.LN_Value_ST_Border_eclipsingSquares2:
        return OUString.createFromAscii(new TextEncoder().encode("eclipsingSquares2\0"));
      case N.LN_Value_ST_Border_eggsBlack:
        return OUString.createFromAscii(new TextEncoder().encode("eggsBlack\0"));
      case N.LN_Value_ST_Border_fans:
        return OUString.createFromAscii(new TextEncoder().encode("fans\0"));
      case N.LN_Value_ST_Border_film:
        return OUString.createFromAscii(new TextEncoder().encode("film\0"));
      case N.LN_Value_ST_Border_firecrackers:
        return OUString.createFromAscii(new TextEncoder().encode("firecrackers\0"));
      case N.LN_Value_ST_Border_flowersBlockPrint:
        return OUString.createFromAscii(new TextEncoder().encode("flowersBlockPrint\0"));
      case N.LN_Value_ST_Border_flowersDaisies:
        return OUString.createFromAscii(new TextEncoder().encode("flowersDaisies\0"));
      case N.LN_Value_ST_Border_flowersModern1:
        return OUString.createFromAscii(new TextEncoder().encode("flowersModern1\0"));
      case N.LN_Value_ST_Border_flowersModern2:
        return OUString.createFromAscii(new TextEncoder().encode("flowersModern2\0"));
      case N.LN_Value_ST_Border_flowersPansy:
        return OUString.createFromAscii(new TextEncoder().encode("flowersPansy\0"));
      case N.LN_Value_ST_Border_flowersRedRose:
        return OUString.createFromAscii(new TextEncoder().encode("flowersRedRose\0"));
      case N.LN_Value_ST_Border_flowersRoses:
        return OUString.createFromAscii(new TextEncoder().encode("flowersRoses\0"));
      case N.LN_Value_ST_Border_flowersTeacup:
        return OUString.createFromAscii(new TextEncoder().encode("flowersTeacup\0"));
      case N.LN_Value_ST_Border_flowersTiny:
        return OUString.createFromAscii(new TextEncoder().encode("flowersTiny\0"));
      case N.LN_Value_ST_Border_gems:
        return OUString.createFromAscii(new TextEncoder().encode("gems\0"));
      case N.LN_Value_ST_Border_gingerbreadMan:
        return OUString.createFromAscii(new TextEncoder().encode("gingerbreadMan\0"));
      case N.LN_Value_ST_Border_gradient:
        return OUString.createFromAscii(new TextEncoder().encode("gradient\0"));
      case N.LN_Value_ST_Border_handmade1:
        return OUString.createFromAscii(new TextEncoder().encode("handmade1\0"));
      case N.LN_Value_ST_Border_handmade2:
        return OUString.createFromAscii(new TextEncoder().encode("handmade2\0"));
      case N.LN_Value_ST_Border_heartBalloon:
        return OUString.createFromAscii(new TextEncoder().encode("heartBalloon\0"));
      case N.LN_Value_ST_Border_heartGray:
        return OUString.createFromAscii(new TextEncoder().encode("heartGray\0"));
      case N.LN_Value_ST_Border_hearts:
        return OUString.createFromAscii(new TextEncoder().encode("hearts\0"));
      case N.LN_Value_ST_Border_heebieJeebies:
        return OUString.createFromAscii(new TextEncoder().encode("heebieJeebies\0"));
      case N.LN_Value_ST_Border_holly:
        return OUString.createFromAscii(new TextEncoder().encode("holly\0"));
      case N.LN_Value_ST_Border_houseFunky:
        return OUString.createFromAscii(new TextEncoder().encode("houseFunky\0"));
      case N.LN_Value_ST_Border_hypnotic:
        return OUString.createFromAscii(new TextEncoder().encode("hypnotic\0"));
      case N.LN_Value_ST_Border_iceCreamCones:
        return OUString.createFromAscii(new TextEncoder().encode("iceCreamCones\0"));
      case N.LN_Value_ST_Border_lightBulb:
        return OUString.createFromAscii(new TextEncoder().encode("lightBulb\0"));
      case N.LN_Value_ST_Border_lightning1:
        return OUString.createFromAscii(new TextEncoder().encode("lightning1\0"));
      case N.LN_Value_ST_Border_lightning2:
        return OUString.createFromAscii(new TextEncoder().encode("lightning2\0"));
      case N.LN_Value_ST_Border_mapPins:
        return OUString.createFromAscii(new TextEncoder().encode("mapPins\0"));
      case N.LN_Value_ST_Border_mapleLeaf:
        return OUString.createFromAscii(new TextEncoder().encode("mapleLeaf\0"));
      case N.LN_Value_ST_Border_mapleMuffins:
        return OUString.createFromAscii(new TextEncoder().encode("mapleMuffins\0"));
      case N.LN_Value_ST_Border_marquee:
        return OUString.createFromAscii(new TextEncoder().encode("marquee\0"));
      case N.LN_Value_ST_Border_marqueeToothed:
        return OUString.createFromAscii(new TextEncoder().encode("marqueeToothed\0"));
      case N.LN_Value_ST_Border_moons:
        return OUString.createFromAscii(new TextEncoder().encode("moons\0"));
      case N.LN_Value_ST_Border_mosaic:
        return OUString.createFromAscii(new TextEncoder().encode("mosaic\0"));
      case N.LN_Value_ST_Border_musicNotes:
        return OUString.createFromAscii(new TextEncoder().encode("musicNotes\0"));
      case N.LN_Value_ST_Border_northwest:
        return OUString.createFromAscii(new TextEncoder().encode("northwest\0"));
      case N.LN_Value_ST_Border_ovals:
        return OUString.createFromAscii(new TextEncoder().encode("ovals\0"));
      case N.LN_Value_ST_Border_packages:
        return OUString.createFromAscii(new TextEncoder().encode("packages\0"));
      case N.LN_Value_ST_Border_palmsBlack:
        return OUString.createFromAscii(new TextEncoder().encode("palmsBlack\0"));
      case N.LN_Value_ST_Border_palmsColor:
        return OUString.createFromAscii(new TextEncoder().encode("palmsColor\0"));
      case N.LN_Value_ST_Border_paperClips:
        return OUString.createFromAscii(new TextEncoder().encode("paperClips\0"));
      case N.LN_Value_ST_Border_papyrus:
        return OUString.createFromAscii(new TextEncoder().encode("papyrus\0"));
      case N.LN_Value_ST_Border_partyFavor:
        return OUString.createFromAscii(new TextEncoder().encode("partyFavor\0"));
      case N.LN_Value_ST_Border_partyGlass:
        return OUString.createFromAscii(new TextEncoder().encode("partyGlass\0"));
      case N.LN_Value_ST_Border_pencils:
        return OUString.createFromAscii(new TextEncoder().encode("pencils\0"));
      case N.LN_Value_ST_Border_people:
        return OUString.createFromAscii(new TextEncoder().encode("people\0"));
      case N.LN_Value_ST_Border_peopleWaving:
        return OUString.createFromAscii(new TextEncoder().encode("peopleWaving\0"));
      case N.LN_Value_ST_Border_peopleHats:
        return OUString.createFromAscii(new TextEncoder().encode("peopleHats\0"));
      case N.LN_Value_ST_Border_poinsettias:
        return OUString.createFromAscii(new TextEncoder().encode("poinsettias\0"));
      case N.LN_Value_ST_Border_postageStamp:
        return OUString.createFromAscii(new TextEncoder().encode("postageStamp\0"));
      case N.LN_Value_ST_Border_pumpkin1:
        return OUString.createFromAscii(new TextEncoder().encode("pumpkin1\0"));
      case N.LN_Value_ST_Border_pushPinNote2:
        return OUString.createFromAscii(new TextEncoder().encode("pushPinNote2\0"));
      case N.LN_Value_ST_Border_pushPinNote1:
        return OUString.createFromAscii(new TextEncoder().encode("pushPinNote1\0"));
      case N.LN_Value_ST_Border_pyramids:
        return OUString.createFromAscii(new TextEncoder().encode("pyramids\0"));
      case N.LN_Value_ST_Border_pyramidsAbove:
        return OUString.createFromAscii(new TextEncoder().encode("pyramidsAbove\0"));
      case N.LN_Value_ST_Border_quadrants:
        return OUString.createFromAscii(new TextEncoder().encode("quadrants\0"));
      case N.LN_Value_ST_Border_rings:
        return OUString.createFromAscii(new TextEncoder().encode("rings\0"));
      case N.LN_Value_ST_Border_safari:
        return OUString.createFromAscii(new TextEncoder().encode("safari\0"));
      case N.LN_Value_ST_Border_sawtooth:
        return OUString.createFromAscii(new TextEncoder().encode("sawtooth\0"));
      case N.LN_Value_ST_Border_sawtoothGray:
        return OUString.createFromAscii(new TextEncoder().encode("sawtoothGray\0"));
      case N.LN_Value_ST_Border_scaredCat:
        return OUString.createFromAscii(new TextEncoder().encode("scaredCat\0"));
      case N.LN_Value_ST_Border_seattle:
        return OUString.createFromAscii(new TextEncoder().encode("seattle\0"));
      case N.LN_Value_ST_Border_shadowedSquares:
        return OUString.createFromAscii(new TextEncoder().encode("shadowedSquares\0"));
      case N.LN_Value_ST_Border_sharksTeeth:
        return OUString.createFromAscii(new TextEncoder().encode("sharksTeeth\0"));
      case N.LN_Value_ST_Border_shorebirdTracks:
        return OUString.createFromAscii(new TextEncoder().encode("shorebirdTracks\0"));
      case N.LN_Value_ST_Border_skyrocket:
        return OUString.createFromAscii(new TextEncoder().encode("skyrocket\0"));
      case N.LN_Value_ST_Border_snowflakeFancy:
        return OUString.createFromAscii(new TextEncoder().encode("snowflakeFancy\0"));
      case N.LN_Value_ST_Border_snowflakes:
        return OUString.createFromAscii(new TextEncoder().encode("snowflakes\0"));
      case N.LN_Value_ST_Border_sombrero:
        return OUString.createFromAscii(new TextEncoder().encode("sombrero\0"));
      case N.LN_Value_ST_Border_southwest:
        return OUString.createFromAscii(new TextEncoder().encode("southwest\0"));
      case N.LN_Value_ST_Border_stars:
        return OUString.createFromAscii(new TextEncoder().encode("stars\0"));
      case N.LN_Value_ST_Border_starsTop:
        return OUString.createFromAscii(new TextEncoder().encode("starsTop\0"));
      case N.LN_Value_ST_Border_stars3d:
        return OUString.createFromAscii(new TextEncoder().encode("stars3d\0"));
      case N.LN_Value_ST_Border_starsBlack:
        return OUString.createFromAscii(new TextEncoder().encode("starsBlack\0"));
      case N.LN_Value_ST_Border_starsShadowed:
        return OUString.createFromAscii(new TextEncoder().encode("starsShadowed\0"));
      case N.LN_Value_ST_Border_sun:
        return OUString.createFromAscii(new TextEncoder().encode("sun\0"));
      case N.LN_Value_ST_Border_swirligig:
        return OUString.createFromAscii(new TextEncoder().encode("swirligig\0"));
      case N.LN_Value_ST_Border_tornPaper:
        return OUString.createFromAscii(new TextEncoder().encode("tornPaper\0"));
      case N.LN_Value_ST_Border_tornPaperBlack:
        return OUString.createFromAscii(new TextEncoder().encode("tornPaperBlack\0"));
      case N.LN_Value_ST_Border_trees:
        return OUString.createFromAscii(new TextEncoder().encode("trees\0"));
      case N.LN_Value_ST_Border_triangleParty:
        return OUString.createFromAscii(new TextEncoder().encode("triangleParty\0"));
      case N.LN_Value_ST_Border_triangles:
        return OUString.createFromAscii(new TextEncoder().encode("triangles\0"));
      case N.LN_Value_ST_Border_tribal1:
        return OUString.createFromAscii(new TextEncoder().encode("tribal1\0"));
      case N.LN_Value_ST_Border_tribal2:
        return OUString.createFromAscii(new TextEncoder().encode("tribal2\0"));
      case N.LN_Value_ST_Border_tribal3:
        return OUString.createFromAscii(new TextEncoder().encode("tribal3\0"));
      case N.LN_Value_ST_Border_tribal4:
        return OUString.createFromAscii(new TextEncoder().encode("tribal4\0"));
      case N.LN_Value_ST_Border_tribal5:
        return OUString.createFromAscii(new TextEncoder().encode("tribal5\0"));
      case N.LN_Value_ST_Border_tribal6:
        return OUString.createFromAscii(new TextEncoder().encode("tribal6\0"));
      case N.LN_Value_ST_Border_twistedLines1:
        return OUString.createFromAscii(new TextEncoder().encode("twistedLines1\0"));
      case N.LN_Value_ST_Border_twistedLines2:
        return OUString.createFromAscii(new TextEncoder().encode("twistedLines2\0"));
      case N.LN_Value_ST_Border_vine:
        return OUString.createFromAscii(new TextEncoder().encode("vine\0"));
      case N.LN_Value_ST_Border_waveline:
        return OUString.createFromAscii(new TextEncoder().encode("waveline\0"));
      case N.LN_Value_ST_Border_weavingAngles:
        return OUString.createFromAscii(new TextEncoder().encode("weavingAngles\0"));
      case N.LN_Value_ST_Border_weavingBraid:
        return OUString.createFromAscii(new TextEncoder().encode("weavingBraid\0"));
      case N.LN_Value_ST_Border_weavingRibbon:
        return OUString.createFromAscii(new TextEncoder().encode("weavingRibbon\0"));
      case N.LN_Value_ST_Border_weavingStrips:
        return OUString.createFromAscii(new TextEncoder().encode("weavingStrips\0"));
      case N.LN_Value_ST_Border_whiteFlowers:
        return OUString.createFromAscii(new TextEncoder().encode("whiteFlowers\0"));
      case N.LN_Value_ST_Border_woodwork:
        return OUString.createFromAscii(new TextEncoder().encode("woodwork\0"));
      case N.LN_Value_ST_Border_xIllusions:
        return OUString.createFromAscii(new TextEncoder().encode("xIllusions\0"));
      case N.LN_Value_ST_Border_zanyTriangles:
        return OUString.createFromAscii(new TextEncoder().encode("zanyTriangles\0"));
      case N.LN_Value_ST_Border_zigZag:
        return OUString.createFromAscii(new TextEncoder().encode("zigZag\0"));
      case N.LN_Value_ST_Border_zigZagStitch:
        return OUString.createFromAscii(new TextEncoder().encode("zigZagStitch\0"));
      default:
        break;
    }
    return new OUString();
  }
  /** Original native getThemeColorTypeString switch without token renumbering or fallback normalization. @param type - Native resource identity. @returns Original mapped value. */
  static getThemeColorTypeString(type: number): OUString {
    switch (type) {
      case N.LN_Value_St_ThemeColor_dark1:
        return OUString.createFromAscii(new TextEncoder().encode("dark1\0"));
      case N.LN_Value_St_ThemeColor_light1:
        return OUString.createFromAscii(new TextEncoder().encode("light1\0"));
      case N.LN_Value_St_ThemeColor_dark2:
        return OUString.createFromAscii(new TextEncoder().encode("dark2\0"));
      case N.LN_Value_St_ThemeColor_light2:
        return OUString.createFromAscii(new TextEncoder().encode("light2\0"));
      case N.LN_Value_St_ThemeColor_accent1:
        return OUString.createFromAscii(new TextEncoder().encode("accent1\0"));
      case N.LN_Value_St_ThemeColor_accent2:
        return OUString.createFromAscii(new TextEncoder().encode("accent2\0"));
      case N.LN_Value_St_ThemeColor_accent3:
        return OUString.createFromAscii(new TextEncoder().encode("accent3\0"));
      case N.LN_Value_St_ThemeColor_accent4:
        return OUString.createFromAscii(new TextEncoder().encode("accent4\0"));
      case N.LN_Value_St_ThemeColor_accent5:
        return OUString.createFromAscii(new TextEncoder().encode("accent5\0"));
      case N.LN_Value_St_ThemeColor_accent6:
        return OUString.createFromAscii(new TextEncoder().encode("accent6\0"));
      case N.LN_Value_St_ThemeColor_hyperlink:
        return OUString.createFromAscii(new TextEncoder().encode("hyperlink\0"));
      case N.LN_Value_St_ThemeColor_followedHyperlink:
        return OUString.createFromAscii(new TextEncoder().encode("followedHyperlink\0"));
      case N.LN_Value_St_ThemeColor_none:
        return OUString.createFromAscii(new TextEncoder().encode("none\0"));
      case N.LN_Value_St_ThemeColor_background1:
        return OUString.createFromAscii(new TextEncoder().encode("background1\0"));
      case N.LN_Value_St_ThemeColor_text1:
        return OUString.createFromAscii(new TextEncoder().encode("text1\0"));
      case N.LN_Value_St_ThemeColor_background2:
        return OUString.createFromAscii(new TextEncoder().encode("background2\0"));
      case N.LN_Value_St_ThemeColor_text2:
        return OUString.createFromAscii(new TextEncoder().encode("text2\0"));
      default:
        break;
    }
    return new OUString();
  }
  /** Original native getThemeColorTypeIndex switch without token renumbering or fallback normalization. @param type - Native resource identity. @returns Original mapped value. */
  static getThemeColorTypeIndex(type: number): ThemeColorType {
    switch (type) {
      case N.LN_Value_St_ThemeColor_dark1:
        return ThemeColorType.Dark1;
      case N.LN_Value_St_ThemeColor_light1:
        return ThemeColorType.Light1;
      case N.LN_Value_St_ThemeColor_dark2:
        return ThemeColorType.Dark2;
      case N.LN_Value_St_ThemeColor_light2:
        return ThemeColorType.Light2;
      case N.LN_Value_St_ThemeColor_accent1:
        return ThemeColorType.Accent1;
      case N.LN_Value_St_ThemeColor_accent2:
        return ThemeColorType.Accent2;
      case N.LN_Value_St_ThemeColor_accent3:
        return ThemeColorType.Accent3;
      case N.LN_Value_St_ThemeColor_accent4:
        return ThemeColorType.Accent4;
      case N.LN_Value_St_ThemeColor_accent5:
        return ThemeColorType.Accent5;
      case N.LN_Value_St_ThemeColor_accent6:
        return ThemeColorType.Accent6;
      case N.LN_Value_St_ThemeColor_hyperlink:
        return ThemeColorType.Hyperlink;
      case N.LN_Value_St_ThemeColor_followedHyperlink:
        return ThemeColorType.FollowedHyperlink;
      case N.LN_Value_St_ThemeColor_none:
        return ThemeColorType.Unknown;
      case N.LN_Value_St_ThemeColor_background1:
        return ThemeColorType.Light1;
      case N.LN_Value_St_ThemeColor_text1:
        return ThemeColorType.Dark1;
      case N.LN_Value_St_ThemeColor_background2:
        return ThemeColorType.Light2;
      case N.LN_Value_St_ThemeColor_text2:
        return ThemeColorType.Dark2;
      default:
        break;
    }
    return ThemeColorType.Unknown;
  }
  /** Original native getThemeColorUsage switch without token renumbering or fallback normalization. @param type - Native resource identity. @returns Original mapped value. */
  static getThemeColorUsage(type: number): ThemeColorUsage {
    switch (type) {
      case N.LN_Value_St_ThemeColor_background1:
      case N.LN_Value_St_ThemeColor_background2:
        return ThemeColorUsage.Background;
      case N.LN_Value_St_ThemeColor_text1:
      case N.LN_Value_St_ThemeColor_text2:
        return ThemeColorUsage.Text;
      default:
        break;
    }
    return ThemeColorUsage.Unknown;
  }

  /** Original attribute switch retains integer truncation and distinct ignored frame/shadow fields. @param id - Native resource ID. @param value - Original value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const number = value.getInt();
    let name: string, text: OUString;
    switch (id) {
      case N.LN_CT_Border_sz:
        this.m_nLineWidth = Math.trunc((number * 5) / 2);
        name = "sz";
        text = new OUString(OUString.number(number));
        break;
      case N.LN_CT_Border_val:
        this.m_nLineType = number;
        name = "val";
        text = TDefTableHandler.getBorderTypeString(number);
        break;
      case N.LN_CT_Border_color:
        this.m_nLineColor = number;
        name = "color";
        text = ConvertColorOU(new Color(ColorTransparency, number, "ColorTransparencyTag"));
        break;
      case N.LN_CT_Border_space:
        name = "space";
        text = new OUString(OUString.number(number));
        break;
      case N.LN_CT_Border_shadow:
      case N.LN_CT_Border_frame:
        return;
      case N.LN_CT_Border_themeColor:
        this.m_eThemeColorType = TDefTableHandler.getThemeColorTypeIndex(number);
        name = "themeColor";
        text = TDefTableHandler.getThemeColorTypeString(number);
        break;
      case N.LN_CT_Border_themeTint:
        this.m_nThemeTint = number;
        return;
      case N.LN_CT_Border_themeShade:
        this.m_nThemeShade = number;
        return;
      default:
        return;
    }
    try {
      this.appendGrabBag(name, text);
    } finally {
      text.dispose();
    }
  }
  /** Original modifier switch admits cell edges, inside borders and diagonal interop only. @param modifier - Native modifier. @returns Nothing. */
  sprm(modifier: Sprm): void {
    switch (modifier.getId()) {
      case N.LN_CT_TcBorders_top:
      case N.LN_CT_TcBorders_start:
      case N.LN_CT_TcBorders_left:
      case N.LN_CT_TcBorders_bottom:
      case N.LN_CT_TcBorders_end:
      case N.LN_CT_TcBorders_right:
      case N.LN_CT_TcBorders_insideH:
      case N.LN_CT_TcBorders_insideV:
      case N.LN_CT_TcBorders_tl2br:
      case N.LN_CT_TcBorders_tr2bl:
        this.localResolve(modifier.getId(), modifier.getProps());
        break;
    }
  }
  /** Original per-child reset affects width/type/color only, retaining shared theme state. @param id - Original edge. @param properties - Nested properties or null. @returns Nothing. */
  private localResolve(id: Id, properties: Reference<Properties> | null): void {
    if (!properties) return;
    this.m_nLineWidth = this.m_nLineType = this.m_nLineColor = 0;
    let saved: PropertyValue[] = [];
    if (!this.m_aInteropGrabBagName.isEmpty()) {
      saved = this.m_aInteropGrabBag.map(
        /** Copies native vector members before clearing. @param value - Original value. @returns Value copy. */ (
          value,
        ) => new PropertyValue(value),
      );
      this.clearGrabBag();
    }
    resolveReturnedReference(properties, this);
    const line = new BorderLine2();
    MakeBorderLine(this.m_nLineWidth, this.m_nLineType, this.m_nLineColor, line, true);
    const capture =
      /** Native repeated case body, binding the temporary Unicode name lifetime around getInteropGrabBag. @param edge - Source edge spelling. @returns Nothing. */ (
        edge: string,
      ): void => {
        if (!this.m_aInteropGrabBagName.isEmpty()) {
          const name = OUString.createFromAscii(new TextEncoder().encode(edge + "\0"));
          try {
            saved.push(this.getInteropGrabBag(name));
          } finally {
            name.dispose();
          }
        }
      };
    switch (id) {
      case N.LN_CT_TcBorders_top:
        this.m_aTopBorderLines.push(line);
        capture("top");
        break;
      case N.LN_CT_TcBorders_start:
        this.m_aLeftBorderLines.push(line);
        capture("start");
        break;
      case N.LN_CT_TcBorders_left:
        this.m_aLeftBorderLines.push(line);
        capture("left");
        break;
      case N.LN_CT_TcBorders_bottom:
        this.m_aBottomBorderLines.push(line);
        capture("bottom");
        break;
      case N.LN_CT_TcBorders_end:
        this.m_aRightBorderLines.push(line);
        capture("end");
        break;
      case N.LN_CT_TcBorders_right:
        this.m_aRightBorderLines.push(line);
        capture("right");
        break;
      case N.LN_CT_TcBorders_insideH:
        this.m_aInsideHBorderLines.push(line);
        capture("insideH");
        break;
      case N.LN_CT_TcBorders_insideV:
        this.m_aInsideVBorderLines.push(line);
        capture("insideV");
        break;
      case N.LN_CT_TcBorders_tl2br:
        capture("tl2br");
        break;
      case N.LN_CT_TcBorders_tr2bl:
        capture("tr2bl");
        break;
    }
    if (!this.m_aInteropGrabBagName.isEmpty()) {
      this.clearGrabBag();
      this.m_aInteropGrabBag = saved;
    }
  }
  /** Original first-element selection, followed by construction of a theme value that is not inserted into the result map. @param properties - Actual target table map. @returns Nothing. */
  fillCellProperties(properties: TablePropertyMap): void {
    const sides = [
        this.m_aTopBorderLines,
        this.m_aLeftBorderLines,
        this.m_aBottomBorderLines,
        this.m_aRightBorderLines,
        this.m_aInsideHBorderLines,
        this.m_aInsideVBorderLines,
      ],
      ids = [
        P.PROP_TOP_BORDER,
        P.PROP_LEFT_BORDER,
        P.PROP_BOTTOM_BORDER,
        P.PROP_RIGHT_BORDER,
        P.META_PROP_HORIZONTAL_BORDER,
        P.META_PROP_VERTICAL_BORDER,
      ];
    for (let index = 0; index < sides.length; ++index) {
      const first = sides[index]?.[0];
      if (first) {
        const value = new Any(first, cppu_detail_getUnoType_BorderLine2);
        try {
          properties.Insert(ids[index] as P, value);
        } finally {
          value.dispose();
        }
      }
    }
    if (this.m_eThemeColorType !== ThemeColorType.Unknown) {
      const color = new ComplexColor();
      color.setThemeColor(this.m_eThemeColorType);
      if (this.m_nThemeTint > 0)
        color.addTransformation(
          new Transformation(
            TransformationType.Tint,
            (Math.trunc(((255 - this.m_nThemeTint) * 10000) / 255) << 16) >> 16,
          ),
        );
      if (this.m_nThemeShade > 0)
        color.addTransformation(
          new Transformation(
            TransformationType.Shade,
            (Math.trunc(((255 - this.m_nThemeShade) * 10000) / 255) << 16) >> 16,
          ),
        );
    }
  }
  /** Copies original name without clearing retained entries. @param name - Native name. @returns Nothing. */
  enableInteropGrabBag(name: OUStringConstReference): void {
    this.m_aInteropGrabBagName.assign(name);
  }
  /** Original getter copies and then clears the source vector. @param name - Optional native override. @returns Owned generated property. */
  getInteropGrabBag(name?: OUStringConstReference): PropertyValue {
    const result = new PropertyValue(),
      sequence = new PropertyValues(
        {
          /** Borrows original vector element at its declared native address. @param offset - Compound byte offset. @returns Property. */
          get: (offset) => this.m_aInteropGrabBag[offset / 48],
        },
        this.m_aInteropGrabBag.length,
      );
    try {
      result.Name = name && !name.isEmpty() ? name : this.m_aInteropGrabBagName;
      result.Value.insert(sequence.getAddress(), [
        "Sequence",
        cppu_detail_getUnoType_PropertyValue,
      ]);
    } finally {
      sequence.dispose();
    }
    this.clearGrabBag();
    return result;
  }
  /** Original vector append copies the generated Unicode and Any members. @param key - Literal native key. @param value - Borrowed native text. @returns Nothing. */
  private appendGrabBag(key: string, value: OUStringConstReference): void {
    const property = new PropertyValue(),
      name = OUString.createFromAscii(new TextEncoder().encode(key + "\0"));
    try {
      property.Name = name;
      property.Value.insert([value.pData], "OUString");
      this.m_aInteropGrabBag.push(property);
    } finally {
      name.dispose();
    }
  }
  /** Native vector element destruction, retaining its logical owner. @returns Nothing. */
  private clearGrabBag(): void {
    for (const property of this.m_aInteropGrabBag) {
      property.Name.dispose();
      property.Value.dispose();
    }
    this.m_aInteropGrabBag.length = 0;
  }
  /** Native Unicode/vector member lifetime bound to the filter caller. @returns Nothing. */
  dispose(): void {
    this.clearGrabBag();
    this.m_aInteropGrabBagName.dispose();
  }
}

import { resolveReturnedReference } from "../inc/dmapper/resourcemodel";
