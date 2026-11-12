/** @fileoverview Static browser bindings for the consumed i18npool, NumberText and stoc component registrations. */
import { com_sun_star_extensions_xml_sax_Writer_get_implementation } from "../../../sax/source/expatwrap/saxwriter";
import { com_sun_star_comp_comphelper_OPropertyBag } from "../../../comphelper/source/property/opropertybag";
import { unoxml_CXPathAPI_get_implementation } from "../../../unoxml/source/xpath/xpathapi";
import { unoxml_CDocumentBuilder_get_implementation } from "../../../unoxml/source/dom/documentbuilder";
import { com_sun_star_comp_stoc_TypeConverter_get_implementation } from "../../../stoc/source/typeconv/convert";
import type { Implementation } from "../../../cppuhelper/source/servicemanager";
import { com_sun_star_i18n_BreakIterator_get_implementation } from "../../../i18npool/source/breakiterator/breakiteratorImpl";
import { com_sun_star_i18n_BreakIterator_Unicode_get_implementation } from "../../../i18npool/source/breakiterator/breakiterator_unicode";
import { com_sun_star_i18n_CharacterClassification_Unicode_get_implementation } from "../../../i18npool/source/characterclassification/cclass_unicode";
import { com_sun_star_i18n_CharacterClassification_get_implementation } from "../../../i18npool/source/characterclassification/characterclassificationImpl";
import {
  i18npool_BreakIterator_ja_get_implementation,
  i18npool_BreakIterator_ko_get_implementation,
  i18npool_BreakIterator_zh_get_implementation,
  i18npool_BreakIterator_zh_TW_get_implementation,
} from "../../../i18npool/source/registerservices/registerservices";
import { lingucomponent_NumberText_get_implementation } from "../../../lingucomponent/source/numbertext/numbertext";

/** Original i18npool.component entries for the two break iterator families and the classifier, followed by the NumberText and stocservices.component converter entries. */
export const implementations: readonly Implementation[] = [
  {
    name: "com.sun.star.extensions.xml.sax.Writer",
    services: ["com.sun.star.xml.sax.Writer"],
    constructorFn: com_sun_star_extensions_xml_sax_Writer_get_implementation,
  },
  {
    name: "com.sun.star.comp.comphelper.OPropertyBag",
    services: ["com.sun.star.beans.PropertyBag"],
    constructorFn: com_sun_star_comp_comphelper_OPropertyBag,
  },
  {
    name: "com.sun.star.i18n.BreakIterator",
    services: ["com.sun.star.i18n.BreakIterator"],
    constructorFn: com_sun_star_i18n_BreakIterator_get_implementation,
  },
  {
    name: "com.sun.star.i18n.BreakIterator_Unicode",
    services: ["com.sun.star.i18n.BreakIterator_Unicode"],
    constructorFn: com_sun_star_i18n_BreakIterator_Unicode_get_implementation,
  },
  {
    name: "com.sun.star.i18n.BreakIterator_ja",
    services: ["com.sun.star.i18n.BreakIterator_ja"],
    constructorFn: i18npool_BreakIterator_ja_get_implementation,
  },
  {
    name: "com.sun.star.i18n.BreakIterator_ko",
    services: ["com.sun.star.i18n.BreakIterator_ko"],
    constructorFn: i18npool_BreakIterator_ko_get_implementation,
  },
  {
    name: "com.sun.star.i18n.BreakIterator_zh",
    services: ["com.sun.star.i18n.BreakIterator_zh"],
    constructorFn: i18npool_BreakIterator_zh_get_implementation,
  },
  {
    name: "com.sun.star.i18n.BreakIterator_zh_TW",
    services: ["com.sun.star.i18n.BreakIterator_zh_TW"],
    constructorFn: i18npool_BreakIterator_zh_TW_get_implementation,
  },
  {
    name: "com.sun.star.i18n.CharacterClassification",
    services: ["com.sun.star.i18n.CharacterClassification"],
    constructorFn: com_sun_star_i18n_CharacterClassification_get_implementation,
  },
  {
    name: "com.sun.star.i18n.CharacterClassification_Unicode",
    services: ["com.sun.star.i18n.CharacterClassification_Unicode"],
    constructorFn: com_sun_star_i18n_CharacterClassification_Unicode_get_implementation,
  },
  {
    name: "com.sun.star.lingu2.NumberText",
    services: ["com.sun.star.linguistic2.NumberText"],
    constructorFn: lingucomponent_NumberText_get_implementation,
  },
  {
    name: "com.sun.star.comp.stoc.TypeConverter",
    services: ["com.sun.star.script.Converter"],
    constructorFn: com_sun_star_comp_stoc_TypeConverter_get_implementation,
  },
  {
    name: "com.sun.star.comp.xml.dom.DocumentBuilder",
    services: ["com.sun.star.xml.dom.DocumentBuilder"],
    constructorFn: unoxml_CDocumentBuilder_get_implementation,
  },
  {
    name: "com.sun.star.comp.xml.xpath.XPathAPI",
    services: ["com.sun.star.xml.xpath.XPathAPI"],
    constructorFn: unoxml_CXPathAPI_get_implementation,
  },
];
