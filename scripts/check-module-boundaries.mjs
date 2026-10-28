/**
 * @fileoverview Enforces the approved LibreOffice-shaped runtime module dependency graph for Vite Office.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";
import { isOriginalInputEventIdentifier } from "./module-boundaries/input-event-binding.mjs";
import { isOriginalEscapementConstantImport } from "./module-boundaries/escapement-imports.mjs";
export { isOriginalEscapementConstantImport } from "./module-boundaries/escapement-imports.mjs";
import { isOriginalCharacterValueImport } from "./module-boundaries/character-value-imports.mjs";
export { isOriginalCharacterValueImport } from "./module-boundaries/character-value-imports.mjs";
import { isSidebarPresentationImport } from "./module-boundaries/sidebar-imports.mjs";
import { isOriginalInlineDateImport } from "./module-boundaries/inline-date-imports.mjs";
import { isOriginalInlineSequenceImport } from "./module-boundaries/inline-sequence-imports.mjs";
const sourceRoot = path.resolve("apps/office/src");
const moduleNames = [
  "comphelper",
  "configmgr",
  "cppu",
  "cppuhelper",
  "cui",
  "docmodel",
  "editeng",
  "external",
  "filter",
  "formula",
  "framework",
  "i18nlangtag",
  "i18npool",
  "i18nutil",
  "o3tl",
  "offapi",
  "oox",
  "package",
  "sal",
  "salhelper",
  "sax",
  "sc",
  "sfx2",
  "stoc",
  "svl",
  "svtools",
  "svx",
  "sw",
  "tools",
  "udkapi",
  "unotools",
  "vcl",
  "xmloff",
  "xmlreader",
];
const knownModules = new Set(moduleNames);
const allowedEdges = new Map([
  // Original comphelper extract.hxx uses the actual Any and generated UNO TypeClass.
  // Original attributelist.hxx/cxx also owns actual OUString values.
  // Original OFOPXMLHelper uses the native SAX parser/writer services.
  // Original interfacecontainer3.hxx owns its vector through o3tl::cow_wrapper.
  // Original seqstream.hxx uses cppuhelper/implbase; Library_comphelper links cppuhelper.
  ["comphelper", new Set(["cppu", "cppuhelper", "o3tl", "sal", "sax", "udkapi"])],
  // Original configuration nodes use SAL/UNO values and TypeClass IDL; shared SortedVector adapts config_map ordering.
  ["configmgr", new Set(["cppu", "o3tl", "sal", "udkapi"])],
  ["cppu", new Set(["sal", "o3tl", "udkapi"])],
  // Original implbase.hxx includes udkapi XTypeProvider; queryinterface/weak use actual UNO/SAL owners.
  ["cppuhelper", new Set(["cppu", "sal", "udkapi"])],
  ["cui", new Set(["editeng", "svl", "svx", "tools"])],
  // Original justifyitem.cxx uses actual UNO Any and generated table/style enums.
  // Original frmitems.cxx uses common Tools/o3tl integer unit conversion.
  // Original UnoComplexColor.hxx includes cppuhelper/implbase and offapi XComplexColor;
  // Library_docmodel links cppuhelper/cppu for actual component references.
  ["docmodel", new Set(["tools", "o3tl", "cppu", "cppuhelper", "offapi"])],
  // Original xmlcnitm.hxx includes xmloff/xmlcnimp.hxx; Library_editeng links xo.
  [
    "editeng",
    new Set([
      // Original paraitem.cxx includes comphelper/extract.hxx; Library_editeng links comphelper.
      "comphelper",
      "docmodel",
      "cppu",
      // Original langitem.hxx uses i18nlangtag/lang.h language values.
      "i18nlangtag",
      // Original scripthintitem.hxx includes i18nutil/scriptchangescanner.hxx; Library_editeng links i18nutil.
      "i18nutil",
      // Original paraitem.cxx includes unotools/syslocale.hxx for numeric decimal defaults.
      "unotools",
      "o3tl",
      "offapi",
      "sal",
      "svl",
      "svtools",
      "tools",
      "vcl",
      "xmloff",
    ]),
  ],
  ["external", new Set()],
  // Native Library_msfilter uses Tools colors for the Word highlight palette.
  // Native msfilter util.cxx returns rtl::OUString color values (Library_msfilter links sal).
  // Native Library_msfilter uses Tools colors and SAL rtl strings/converters in rtfutil.cxx.
  ["filter", new Set(["tools", "sal"])],
  // Formula value owners reuse SAL/OUString and SVL/SharedString; token identity uses native JS references.
  // Original include/formula/grammar.hxx includes the shared FormulaLanguage.hpp IDL owner.
  ["formula", new Set(["offapi", "sal", "svl"])],
  ["framework", new Set(["sfx2", "svl"])],
  // Original lang.h strong_int/sal tags are erased into primitive numeric values.
  // Original isolang.cxx uses actual RTL strings and generated css::lang::Locale values.
  ["i18nlangtag", new Set(["sal", "udkapi"])],
  // Original localedata.cxx uses LanguageTag/MsLangId and the actual generated Locale triplet.
  // Original Library_i18npool links cppu and uses SDK API headers;numberformatcode.hxx/cxx consumes
  // real Sequence and NumberFormatCode/FormatElement/selector IDL values,alongside SAL/locale owners.
  ["i18npool", new Set(["cppu", "i18nlangtag", "i18nutil", "offapi", "sal", "udkapi"])],
  // Original casefolding.cxx includes the generated RuntimeException.hpp API owned by CPPU.
  // Original paper.cxx includes o3tl/unit_conversion.hxx for physical paper constants.
  ["i18nutil", new Set(["cppu", "external", "o3tl", "offapi", "sal", "udkapi"])],
  ["o3tl", new Set(["sal"])],
  // Original generated enum getters use actual CPPU static enum metadata.
  // Original XNumberFormatCode.idl uses the UDK lang.Locale value;generated headers depend on UDK API.
  ["offapi", new Set(["cppu", "sal", "udkapi"])],
  // XmlFilterBase/ZipStorage use shared ZIP/SAX/OFOPXML helpers and INetURLObject::decode (Library_oox).
  // Native attributelist.cxx/Library_oox.mk consume SAL Unicode conversion and buffers.
  // Original attributelist.cxx includes o3tl/string_view.hxx for numeric attribute conversions.
  // Original binary*stream headers include UNO Reference/Sequence and io XInputStream/XOutputStream/XSeekable.
  ["oox", new Set(["comphelper", "cppu", "o3tl", "package", "sal", "sax", "tools", "udkapi"])],
  // Original ManifestExport includes SAL,PropertyValue and comphelper::AttributeList;ManifestWriter consumes SAX Writer (Library_package2).
  ["package", new Set(["comphelper", "sal", "sax", "udkapi"])],
  ["sal", new Set(["o3tl"])],
  // Native SimpleReferenceObject uses SAL OSL interlocked operations;Library_salhelper links sal.
  ["salhelper", new Set(["sal"])],
  // Original saxwriter.cxx consumes SAL/OUString and published SAX IDL (Library_sax).
  // Native Library_sax links cppu/cppuhelper; FastSaxParser owns typed errors and a WeakImplHelper locator.
  // Original sax/fastattribs.hxx includes o3tl/string_view.hxx for zero-allocation typed value queries.
  ["sax", new Set(["comphelper", "cppu", "cppuhelper", "o3tl", "offapi", "sal", "udkapi"])],
  // Generic URI value/factory algorithms from stoc/source/uriproc have no cross-module runtime imports in this consumed binding.
  ["stoc", new Set()],

  // Original converter.cxx uses comphelper::date and published util::DateTime;
  // Library_sax links comphelper and uses the SDK API.
  [
    "sc",
    new Set([
      // Native richstring.cxx includes oox/helper/attributelist.hxx; Library_scfilt.mk links oox.
      "oox",
      // Original Calc attrib.cxx exposes actual UNO Any member query/extraction.
      "cppu",
      "cui",
      "editeng",
      "external",
      // Original Calc formularesult.hxx includes the shared formula error contracts.
      "formula",
      "framework",
      // Library_sc.mk links i18nlangtag; global.cxx includes i18nlangtag/mslangid.hxx.
      "i18nlangtag",
      // Library_sc.mk links i18nutil; global.cxx constructs its TransliterationWrapper with i18nutil flags.
      "i18nutil",
      "o3tl",
      "offapi",
      "package",
      // Original Calc global.hxx/token.hxx use rtl/ustring.hxx; hybrid results own OUString.
      "sal",
      // Native poolhelp.hxx derives SimpleReferenceObject;Library_sc links salhelper.
      "salhelper",
      "sax",
      "sfx2",
      "svl",
      "svtools",
      "svx",
      // Original docpool.cxx uses Tools font enums/colors; Library_sc links tl.
      "tools",
      "unotools",
      "vcl",
      "xmloff",
    ]),
  ],
  // Native objembed.cxx owns GetMapUnit/SetMapUnit; Library_sfx links tl.
  // Library_sfx.mk links SAL; objstor.cxx takes rtl_TextEncoding directly.
  // Original SfxBaseModel uses WeakImplHelper, actual UNO References/exceptions and XChild.
  // Library_sfx links cppu/cppuhelper and uses the SDK API.
  // Original SfxBaseModel listener containers use comphelper and published document/util SDK listeners.
  [
    "sfx2",
    new Set(["comphelper", "cppu", "cppuhelper", "offapi", "sal", "svl", "tools", "udkapi"]),
  ],
  // Original enum items include comphelper/extract.hxx and UNO Any.hxx.
  // Original cintitem.cxx hashes unsigned values through o3tl/hash_combine.hxx.
  // Original poolitem.hxx/setitem.hxx presentation signatures use tools/mapunit.hxx.
  // Native grabbagitem.cxx consumes generated UDK beans PropertyValue.hpp.
  // Original SharedStringPool borrows CharClass; Library_svl links utl.
  // Original zforlist.cxx consumes generated i18n NumberFormatCode;Library_svl uses SDK API.
  // Original zforscan/zforlist use native LanguageTag/MsLangId;Library_svl links i18nlangtag.
  [
    "svl",
    new Set([
      "comphelper",
      "cppu",
      "i18nlangtag",
      // Original ondemand.hxx includes i18nutil/transliteration.hxx; Library_svl links i18nutil.
      "i18nutil",
      "o3tl",
      "offapi",
      "sal",
      "tools",
      "udkapi",
      "unotools",
    ]),
  ],
  // Original svtools/source/misc/unitconv.cxx uses Tools map/field units and o3tl conversions.
  // Original sampletext.cxx consumes VCL font/charmap/capabilities, ICU script codes,
  // i18nutil Unicode classes, SAL encoding and UNO ScriptType. Library_svt links
  // i18nlangtag/i18nutil/utl/vcl/sal and ICU; retain these native dependency directions.
  [
    "svtools",
    new Set([
      // parhtml.cxx includes svl/lngmisc.hxx; Library_svt.mk links svl.
      "svl",
      "tools",
      "o3tl",
      "external",
      "i18nlangtag",
      "i18nutil",
      "unotools",
      "sal",
      "offapi",
      "vcl",
    ]),
  ],
  // Original sdangitm.hxx includes tools/degree.hxx.
  // Original rotmodit.cxx exposes Any and CellVertJustify2.
  // Original pageitem.cxx clears the actual rtl OUString presentation output.
  // Library_svxcore links i18nlangtag; style label analysis uses actual LANGUAGE_DONTKNOW.
  [
    "svx",
    new Set([
      // Native xcolit.hxx owns docmodel ComplexColor; Library_svxcore links docmodel.
      "docmodel",
      "i18nlangtag",
      "cppu",
      "editeng",
      "o3tl",
      "offapi",
      "sal",
      "svl",
      "svtools",
      "tools",
      "vcl",
    ]),
  ],
  [
    "sw",
    new Set([
      // sw/Library_sw.mk links i18npool; breakit.hxx exposes the actual script-query producer.
      "i18npool",
      // sw/Library_sw.mk links i18nlangtag; mdcallbcks.cxx consumes the application LanguageTag.
      "i18nlangtag",
      // sw/Library_sw.mk links the pinned external md4c parser.
      "external",
      // Native sw/source/writerfilter/ooxml/OOXMLPropertySet.cxx includes sax/tools/converter.hxx;
      // sw/Library_sw.mk links sax for these original OOXML lexical conversions.
      "sax",
      // OOXMLStreamImpl uses oox fast-token infrastructure and the UriReferenceFactory UNO service;
      // the host ZIP binding lives in oox and the generic URI service implementation in stoc.
      "oox",
      "stoc",
      // Native Writer package/filter composition uses shared MIME constants and beans::PropertyValue (Library_sw/sdk_api).
      "comphelper",
      "udkapi",
      // Original Library_sw links cppu; native property transport uses real Any values.
      "cppu",
      // Original sw/Library_sw.mk links cppuhelper; unosett.hxx uses cppuhelper/implbase.hxx.
      "cppuhelper",
      "cui",
      // Library_sw links docmodel; real SvxColorItem transfer retains complex-color state.
      "docmodel",
      "editeng",
      // Native Library_sw links msfilter for RTF color index conversion.
      "filter",
      "framework",
      // Original Library_sw.mk links i18nutil; shared PaperInfo owns physical page formats.
      "i18nutil",
      // Native sw/Library_sw.mk links i18npool and ICU (icui18n/icuuc).
      // writerwordglue.cxx::GetPseudoCharRuns calls the concrete break service and unicode/ubidi.h;
      // actual existing script queries/default-mode levels bind those dependencies without fake services.
      "i18npool",
      "external",
      "o3tl",
      "offapi",
      "package",
      // Native Writer font attributes and XML import use rtl/textenc.h identifiers.
      "sal",
      "sfx2",
      "svl",
      "svx",
      "svtools",
      "tools",
      // Native DocumentStylePoolManager includes shared fontdefs; Library_sw links utl.
      "unotools",
      "vcl",
      "xmloff",
    ]),
  ],
  // Native vcl/Library_vcl.mk links SAL; font.hxx includes sal/types.h.
  // Native Library_vcl.mk links utl and uses SDK API; GetDefaultFont consumes configured locale data.
  // Original FontVariation.cxx includes o3tl/string_view.hxx for token/trim/decimal input.
  // Original Library_vcl links i18nlangtag; GetDefaultFont consumes resolved language/Locale values.
  // Original field.cxx includes i18nutil/unicode.hxx; Library_vcl.mk links i18nutil.
  // Native PhysicalFontFace.cxx uses hb_face_collect_unicodes; Library_vcl.mk links external HarfBuzz.
  [
    "vcl",
    new Set([
      "external",
      "i18nutil",
      "i18nlangtag",
      "o3tl",
      "offapi",
      "sal",
      "svl",
      "tools",
      "unotools",
      "udkapi",
    ]),
  ],
  // Original cppumaker normal UDK .hpp bindings use CPPU static enum/struct types and Any.
  ["udkapi", new Set(["sal", "cppu"])],
  // Original include/unotools/textsearch.hxx includes rtl/ustring.hxx; SearchParam owns OUString.
  // Original LocaleDataWrapper constructs LocaleData2; i18npool.component binds its actual producer.
  // The browser field binding uses that producer and the original generated Locale triplet directly.
  // Original Library_utl.mk links i18nlangtag; fontcfg.hxx uses LanguageTag.
  // Original charclass.cxx catches generated UNO Exception; Library_utl links cppu.
  // Original transliterationwrapper.cxx includes i18nutil flags and generated i18n Transliteration API.
  // Original unotools/fontcfg.hxx includes tools/fontenum.hxx for configured weight/width values.
  // CalendarWrapper owns a native DateTime epoch; Library_utl links tl.
  [
    "unotools",
    new Set(["sal", "cppu", "udkapi", "i18npool", "i18nlangtag", "i18nutil", "offapi", "tools"]),
  ],
  // Original Tools/UnitConversion.hxx delegates to o3tl/unit_conversion.hxx.
  // Original tools/color.hxx owns Any color operators and includes com/sun/star/uno/Any.hxx.
  // Original tdate.cxx uses comphelper/date.hxx;Library_tl links comphelper.
  // Original stream.cxx includes rtl/string.hxx and rtl/ustring.hxx for text conversion.
  // time.hxx/datetime.hxx consume published util::Time/DateTime; Library_tl uses the SDK API.
  ["tools", new Set(["o3tl", "cppu", "comphelper", "sal", "offapi"])],
  // Native XML border handlers use published UNO structs; item mapping belongs to Writer xmlimpit/xmlexpit.
  // Original xmloff/Library_xo.mk links cppu; text import consumes real UNO property/cursor values.
  // Native NamedBoolPropertyHdl.cxx includes comphelper/extract.hxx for cppu::any2bool; Library_xo links comphelper.
  [
    "xmloff",
    new Set(["comphelper", "udkapi", "cppu", "o3tl", "offapi", "sal", "sax", "tools", "unotools"]),
  ],
  // Original xmlreader span.hxx/cxx exposes SAL strings and the generated UNO RuntimeException.
  ["xmlreader", new Set(["cppu", "sal"])],
]);
/** Reports whether a native module edge is outside the explicit allowlist. @param sourceModule - Importing owner. @param targetModule - Imported owner. @returns Forbidden flag. */
export function isForbiddenModuleEdge(sourceModule, targetModule) {
  return !allowedEdges.get(sourceModule)?.has(targetModule);
}
/** Retains the core/browser VCL gate while admitting only the source-backed pure dependencies consumed by ScDocumentPool and ScChartListenerCollection. Other VCL and all browser imports remain forbidden from domain core. @param relativeSource - Source-root-relative caller. @param relativeTarget - Source-root-relative target. @returns Forbidden flag. */
export function isForbiddenDomainVclImport(relativeSource, relativeTarget) {
  const source = relativeSource.split(path.sep).join("/"),
    target = relativeTarget.split(path.sep).join("/").replace(/\.ts$/u, "");
  if (!source.includes("/source/core/") || !target.startsWith("vcl/")) return false;
  // Native number.cxx SwDefBulletConfig owns a vcl::Font value, without a device/browser adapter.
  if (source === "sw/source/core/doc/number-bullet.ts" && target === "vcl/source/font/font")
    return false;
  // chartlis.hxx/cxx consume native Idle,TaskPriority and Application queued-input admission.
  // These kernel contracts use an explicitly bound platform;they never import browser adapters.
  if (
    source === "sc/source/core/tool/chartlis.ts" &&
    ["vcl/inc/idle", "vcl/inc/task", "vcl/inc/scheduler"].includes(target)
  )
    return false;
  // docpool.cxx consumes FontRelief and GetDefaultFont; these represented modules contain no browser/device adapter.
  return (
    source !== "sc/source/core/data/docpool.ts" ||
    !["vcl/inc/fntstyle", "vcl/source/outdev/font"].includes(target)
  );
}
const suiteModules = new Set(["sw", "sc"]);
const browserPackageImports = ["lucide-react", "react", "react-dom"];
const protectedBrowserGlobalSymbols = new Set([
  "ClipboardEvent",
  "DedicatedWorkerGlobalScope",
  "IDBDatabase",
  "IDBFactory",
  "InputEvent",
  "Worker",
]);
const protectedBrowserStorageSymbols = new Set(["downloadTarget", "indexedDbKey"]);
const protectedBrowserStorageValues = new Set(["browser-local", "indexeddb"]);
const protectedWriterTransferSymbols = new Set([
  "WriterClipboardPaste",
  "WriterClipboardPasteParagraph",
]);
const upstreamMechanismLayers = new Set([
  "writer-model-api",
  "sfx",
  "upstream-mechanism",
  "writer-core",
  "writer-filter",
  "writer-uibase",
]);

/** Returns the responsibility layer for one source-relative runtime path. @param relativePath - Path below apps/office/src. @returns Ownership layer or undefined. */
export function getRuntimeOwnershipLayer(relativePath) {
  const portablePath = relativePath.split(path.sep).join("/");
  if (/(?:^|\/)browser\//u.test(portablePath)) return "browser";
  if (portablePath.startsWith("sw/source/core/")) return "writer-core";
  if (portablePath.startsWith("sw/source/filter/")) return "writer-filter";
  // Native SwXTextDocument is implemented in uibase/uno but supplies the format-neutral model, not UI state.
  if (portablePath.startsWith("sw/source/uibase/uno/")) return "writer-model-api";
  if (portablePath.startsWith("sw/source/uibase/")) return "writer-uibase";
  if (portablePath.startsWith("sfx2/source/")) return "sfx";
  if (portablePath.startsWith("comphelper/inc/") || portablePath.startsWith("svl/inc/"))
    return "upstream-mechanism";
  if (portablePath.startsWith("docmodel/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("editeng/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("svx/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("xmlreader/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("tools/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("formula/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("o3tl/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("cppu/inc/")) return "upstream-mechanism";
  if (portablePath.startsWith("cppuhelper/inc/") || portablePath.startsWith("cppuhelper/source/"))
    return "upstream-mechanism";
  if (
    portablePath.startsWith("i18nlangtag/inc/") ||
    portablePath.startsWith("i18nutil/inc/") ||
    portablePath.startsWith("udkapi/") ||
    portablePath.startsWith("offapi/com/")
  )
    return "upstream-mechanism";
  if (portablePath.startsWith("external/mdds/include/")) return "upstream-mechanism";
  if (portablePath.startsWith("external/harfbuzz/src/")) return "upstream-mechanism";
  if (portablePath.startsWith("external/md4c/src/")) return "upstream-mechanism";
  if (
    portablePath.startsWith("sal/rtl/") ||
    portablePath.startsWith("sal/inc/rtl/") ||
    portablePath.startsWith("sal/osl/") ||
    portablePath.startsWith("sal/inc/osl/")
  )
    return "upstream-mechanism";
  if (/^[^/]+\/source\//u.test(portablePath)) return "upstream-mechanism";
  return undefined;
}

/** Reports a forbidden reverse dependency between runtime responsibility layers. @param sourcePath - Importing source-relative path. @param targetPath - Imported source-relative path. @param importName - Authored import specifier. @returns Diagnostic or undefined. */
export function getRuntimeOwnershipViolation(sourcePath, targetPath, importName) {
  const sourceLayer = getRuntimeOwnershipLayer(sourcePath);
  if (!upstreamMechanismLayers.has(sourceLayer)) return undefined;
  if (
    browserPackageImports.some(
      /** Matches one browser-presentation package or its subpath. @param packageName - Package root. @returns Whether the import is browser-owned. */ (
        packageName,
      ) => importName === packageName || importName.startsWith(`${packageName}/`),
    )
  )
    return `${sourceLayer} must not import browser presentation package ${importName}`;
  const portableTargetPath = targetPath
    .split(path.sep)
    .join("/")
    .replace(/\.[cm]?[jt]sx?$/u, "");
  if (portableTargetPath === "framework/source/services/worker-protocol")
    return `${sourceLayer} must receive worker protocol through a browser adapter`;
  const targetLayer = getRuntimeOwnershipLayer(targetPath);
  if (targetLayer === "browser")
    return `${sourceLayer} must receive browser adapters through an injected contract`;
  // Original docnew.cxx injects SwModule's attribute package into SwAttrPool;
  // hints.cxx's GetDfltAttr reads that same module-global package directly.
  const portableSourcePath = sourcePath.split(path.sep).join("/");
  const writerDefaultModuleRead =
    (portableSourcePath === "sw/source/core/doc/doc.ts" ||
      portableSourcePath === "sw/source/core/attr/hints.ts") &&
    portableTargetPath === "sw/source/uibase/app/swmodule";
  if (
    sourceLayer === "writer-core" &&
    !writerDefaultModuleRead &&
    (targetLayer === "writer-filter" ||
      targetLayer === "writer-uibase" ||
      targetLayer === "writer-model-api")
  )
    return `Writer core must not depend on ${targetLayer.replace("writer-", "")}`;
  if (
    sourceLayer === "writer-model-api" &&
    (targetLayer === "writer-filter" || targetLayer === "writer-uibase")
  )
    return "Writer model API must not depend on UI or format filters";
  if (sourceLayer === "writer-filter" && targetLayer === "writer-uibase")
    return "Writer filter must not depend on uibase";
  return undefined;
}

/** Finds browser-global identifiers that must remain behind adapters. Comments and larger domain names are ignored by parsing the source AST. @param sourceText - Authored TypeScript source. @param relativePath - Optional original source owner. @returns Stable forbidden symbol names. */
export function getProtectedBrowserGlobalReferences(sourceText, relativePath = "") {
  const sourceFile = ts.createSourceFile(
    "protected-source.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const references = new Set();
  /** Visits identifiers in the parsed source. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (
      ts.isIdentifier(node) &&
      protectedBrowserGlobalSymbols.has(node.text) &&
      !isOriginalInputEventIdentifier(sourceFile, node, relativePath)
    )
      references.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return [...references].sort();
}

/** Finds browser/storage DTO identities that must be converted before entering an upstream-shaped source layer. @param relativePath - Source-relative path. @param sourceText - Authored TypeScript. @returns Stable forbidden symbol names. */
export function getProtectedOwnershipReferences(relativePath, sourceText) {
  const layer = getRuntimeOwnershipLayer(relativePath);
  if (!upstreamMechanismLayers.has(layer)) return [];
  const protectedSymbols = new Set(protectedBrowserStorageSymbols);
  if (layer !== "writer-filter")
    for (const symbol of protectedWriterTransferSymbols) protectedSymbols.add(symbol);
  const references = new Set();
  const sourceFile = ts.createSourceFile(
    relativePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  /** Visits source identifiers without matching comments or string documentation. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (ts.isIdentifier(node) && protectedSymbols.has(node.text)) references.add(node.text);
    if (ts.isStringLiteral(node) && protectedBrowserStorageValues.has(node.text))
      references.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return [...references].sort();
}

/** Recursively collects runtime TypeScript sources in deterministic path order. @param directory - Directory to scan. @returns Ordered absolute source paths. */
function collectRuntimeSources(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(
      /** Expands one directory entry into its recursively collected source files. @param entry - Filesystem entry to inspect. @returns Nested or direct file paths. */
      (entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? collectRuntimeSources(entryPath) : [entryPath];
      },
    )
    .filter(
      /** Keeps authored runtime TypeScript while excluding colocated and shared tests. @param file - Candidate absolute path. @returns True for runtime source. */
      (file) =>
        /\.tsx?$/.test(file) &&
        !/\.test\.tsx?$/.test(file) &&
        !file.includes(`${path.sep}test${path.sep}`),
    )
    .sort();
}

/** Returns the configured module owning a source-relative path, or undefined for the composition root. @param relativePath - Path below apps/office/src. @returns Known module name or undefined. */
function getModule(relativePath) {
  const [candidate] = relativePath.split(path.sep);
  return candidate !== undefined && knownModules.has(candidate) ? candidate : undefined;
}

/** Formats one source path relative to the repository root. @param absolutePath - Absolute source path. @returns Portable repository-relative path. */
function displayPath(absolutePath) {
  return path.relative(process.cwd(), absolutePath).split(path.sep).join("/");
}

/** Adds a directed edge to the module graph. @param graph - Mutable module adjacency map. @param source - Importing module. @param target - Imported module. @returns Nothing. */
function addGraphEdge(graph, source, target) {
  const targets = graph.get(source);
  if (targets === undefined) throw new Error(`Dependency checker has no graph node for ${source}.`);
  targets.add(target);
}

/** Finds a directed module cycle, if one exists. @param graph - Complete module adjacency map. @returns Ordered cycle or undefined. */
function findCycle(graph) {
  const visited = new Set();
  const active = new Set();
  const stack = [];

  /** Visits one graph node depth-first. @param moduleName - Module to inspect. @returns Cycle when found. */
  function visit(moduleName) {
    if (active.has(moduleName)) {
      const cycleStart = stack.indexOf(moduleName);
      return [...stack.slice(cycleStart), moduleName];
    }
    if (visited.has(moduleName)) return undefined;
    visited.add(moduleName);
    active.add(moduleName);
    stack.push(moduleName);
    for (const target of graph.get(moduleName) ?? []) {
      const cycle = visit(target);
      if (cycle !== undefined) return cycle;
    }
    stack.pop();
    active.delete(moduleName);
    return undefined;
  }

  for (const moduleName of graph.keys()) {
    const cycle = visit(moduleName);
    if (cycle !== undefined) return cycle;
  }
  return undefined;
}

const originalSalO3tlBindings = new Map([
  // Original o3tl/string_view.hxx::iterateCodePoints calls exactly these rtl/character.hxx helpers.
  [
    "o3tl/inc/string_view.ts -> sal/inc/rtl/character.ts",
    ["isHighSurrogate", "isLowSurrogate", "combineSurrogates"],
  ],
  // Original o3tl/string_view.hxx::toDouble byte/UTF16 overloads call exactly these rtl/math.h functions.
  [
    "o3tl/inc/string_view.ts -> sal/inc/rtl/math.h.ts",
    ["rtl_math_uStringToDouble", "rtl_math_stringToDouble"],
  ],
  // Original unit_conversion.hxx uses these exact SAL signed64 bounds.
  ["o3tl/inc/unit_conversion.ts -> sal/inc/types.ts", ["SAL_MIN_INT64", "SAL_MAX_INT64"]],
  ["sal/rtl/strtmpl.ts -> o3tl/inc/string_view.ts", ["implIsWhitespace"]],
  // Original sal/rtl/ustring.cxx uses exactly o3tl::iterateCodePoints.
  ["sal/rtl/ustring.ts -> o3tl/inc/string_view.ts", ["iterateCodePoints"]],
  ["o3tl/inc/string_view.ts -> sal/inc/rtl/ustring.h.ts", ["rtl_ustr_toInt64_WithLength"]],
  // Original byte view overloads call the SAL byte signed64 entry point.
  ["o3tl/inc/string_view.ts -> sal/inc/rtl/string.h.ts", ["rtl_str_toInt64_WithLength"]],
  ["o3tl/inc/string_view.ts -> sal/inc/types.ts", ["SAL_MIN_INT32", "SAL_MAX_INT32"]],
]);

/** Checks the exact original mutual header dependency using named value-import syntax. @param sourcePath - Source-relative importer. @param targetPath - Resolved source-relative target. @param sourceText - Authored source. @param importName - Import specifier under inspection. @returns Whether every matching import is an approved original binding. */
export function isOriginalSalO3tlImport(sourcePath, targetPath, sourceText, importName) {
  const portableSource = sourcePath.split(path.sep).join("/");
  const portableTarget = targetPath.split(path.sep).join("/");
  const expected = originalSalO3tlBindings.get(
    `${portableSource} -> ${portableTarget.endsWith(".ts") ? portableTarget : `${portableTarget}.ts`}`,
  );
  if (expected === undefined) return false;
  const parsed = ts.createSourceFile(
    portableSource,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const bindings = new Set();
  let valid = true;
  /** Checks matching module references, rejecting every non-named-value import form. @param node - Current syntax node. @returns Nothing. */
  function visit(node) {
    if (ts.isStringLiteralLike(node) && node.text === importName) {
      const parent = node.parent;
      if (ts.isImportDeclaration(parent) && parent.moduleSpecifier === node) {
        const clause = parent.importClause;
        if (
          clause === undefined ||
          clause.isTypeOnly ||
          clause.name !== undefined ||
          clause.namedBindings === undefined ||
          !ts.isNamedImports(clause.namedBindings) ||
          clause.namedBindings.elements.length === 0
        ) {
          valid = false;
        } else {
          for (const binding of clause.namedBindings.elements) {
            if (
              binding.isTypeOnly ||
              binding.propertyName !== undefined ||
              !expected.includes(binding.name.text)
            )
              valid = false;
            bindings.add(binding.name.text);
          }
        }
      } else if (
        ts.isExportDeclaration(parent) ||
        ts.isExternalModuleReference(parent) ||
        ts.isLiteralTypeNode(parent) ||
        (ts.isCallExpression(parent) &&
          (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
            (ts.isIdentifier(parent.expression) && parent.expression.text === "require")))
      ) {
        valid = false;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return (
    valid &&
    bindings.size === expected.length &&
    expected.every(
      /** Requires all original named bindings rather than an empty witness. @param binding - Original symbol. @returns Whether present. */
      (binding) => bindings.has(binding),
    )
  );
}

/** Collects all reachable graph owners including the initial owner. @param graph - Module graph. @param start - Initial owner. @returns Reachable owners. */
function reachableModules(graph, start) {
  const reachable = new Set([start]);
  for (const owner of reachable) for (const target of graph.get(owner) ?? []) reachable.add(target);
  return reachable;
}

/** Finds forbidden cycles while admitting only the witnessed original two-owner SAL/o3tl component. @param graph - Complete module adjacency map. @param imports - All cross-owner SAL/o3tl witnesses with sourceModule, targetModule and approved fields. @returns Ordered forbidden cycle or undefined. */
export function findUnapprovedModuleCycle(graph, imports) {
  const reverse = new Map();
  for (const [source, targets] of graph)
    for (const target of targets) {
      if (!reverse.has(target)) reverse.set(target, new Set());
      reverse.get(target).add(source);
    }
  const forward = reachableModules(graph, "sal");
  const backward = reachableModules(reverse, "sal");
  const component = [...forward].filter(
    /** Selects the complete strongly connected component containing SAL. @param owner - Reachable owner. @returns Whether it can reach SAL. */
    (owner) => backward.has(owner),
  );
  if (
    component.length !== 2 ||
    !component.includes("o3tl") ||
    imports.length === 0 ||
    !imports.every(
      /** Requires every original cross-owner witness to pass syntax and binding checks. @param witness - Import observation. @returns Whether approved. */
      (witness) => witness.approved,
    ) ||
    !["sal", "o3tl"].every(
      /** Requires observed imports in both directions of the original component. @param owner - Importing owner. @returns Whether witnessed. */
      (owner) =>
        imports.some(
          /** Matches one correctly directed original edge. @param witness - Import observation. @returns Whether it belongs to this direction. */
          (witness) =>
            witness.sourceModule === owner &&
            witness.targetModule === (owner === "sal" ? "o3tl" : "sal"),
        ),
    )
  )
    return findCycle(graph);
  const projection = new Map();
  for (const [owner, targets] of graph) projection.set(owner, new Set(targets));
  projection.get("sal").delete("o3tl");
  return findCycle(projection);
}

/** Collects value-capable module imports, excluding fully erased import/export type clauses. Named type-only specifiers are conservatively retained because verbatim-module emit can preserve their empty side-effect import. Owner allowlisting still inspects all declarations. @param source - Authored TypeScript source. @returns Potential runtime module specifiers. */
export function getRuntimeImportSpecifiers(source) {
  const result = new Set();
  const parsed = ts.createSourceFile(
    "source.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  /** Selects value-capable imports/exports, side effects and dynamic imports; full type declarations/queries emit no module load. @param node - Current syntax node. @returns Nothing. */
  function visitRuntimeImport(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      if (node.importClause === undefined || !node.importClause.isTypeOnly)
        result.add(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      result.add(node.moduleSpecifier.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      !node.isTypeOnly &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression !== undefined &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      result.add(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      result.add(node.arguments[0].text);
    }
    ts.forEachChild(node, visitRuntimeImport);
  }
  visitRuntimeImport(parsed);
  return result;
}

const failures = [];
const graph = new Map(
  moduleNames.map(
    /** Creates one initially empty adjacency entry. @param moduleName - Known module name. @returns Module and mutable target set. */
    (moduleName) => [moduleName, new Set()],
  ),
);
const runtimeSources = collectRuntimeSources(sourceRoot);
const salO3tlImports = [];
let checkedImports = 0;

for (const sourceFile of runtimeSources) {
  const relativeSource = path.relative(sourceRoot, sourceFile);
  const sourceModule = getModule(relativeSource);
  if (sourceModule === undefined && relativeSource.includes(path.sep)) {
    failures.push(`${displayPath(sourceFile)}: unclassified runtime module`);
    continue;
  }
  const sourceText = fs.readFileSync(sourceFile, "utf8");
  const runtimeImports = getRuntimeImportSpecifiers(sourceText);
  if (upstreamMechanismLayers.has(getRuntimeOwnershipLayer(relativeSource))) {
    for (const browserProjectionSymbol of [
      "WriterPresentationProjection",
      "WriterViewSnapshot",
      "clipboardHandled",
      "paragraphId",
      "useSyncExternalStore",
    ])
      if (sourceText.includes(browserProjectionSymbol))
        failures.push(
          `${displayPath(sourceFile)}: Writer source layers must not declare browser projection symbol ${browserProjectionSymbol}`,
        );
    for (const browserGlobalSymbol of getProtectedBrowserGlobalReferences(
      sourceText,
      relativeSource.split(path.sep).join("/"),
    ))
      failures.push(
        `${displayPath(sourceFile)}: protected source layers must not reference browser global ${browserGlobalSymbol}`,
      );
    for (const ownershipSymbol of getProtectedOwnershipReferences(relativeSource, sourceText))
      failures.push(
        `${displayPath(sourceFile)}: protected source layers must receive ${ownershipSymbol} through an outer adapter`,
      );
  }
  const imports = ts.preProcessFile(sourceText, true, true).importedFiles;
  for (const imported of imports) {
    if (!imported.fileName.startsWith(".")) {
      const ownershipViolation = getRuntimeOwnershipViolation(
        relativeSource,
        "",
        imported.fileName,
      );
      if (ownershipViolation !== undefined)
        failures.push(`${displayPath(sourceFile)}: ${ownershipViolation}`);
      continue;
    }
    checkedImports += 1;
    const targetPath = path.resolve(path.dirname(sourceFile), imported.fileName);
    const relativeTarget = path.relative(sourceRoot, targetPath);
    if (relativeTarget.startsWith("..")) {
      failures.push(
        `${displayPath(sourceFile)}: relative import escapes runtime source root: ${imported.fileName}`,
      );
      continue;
    }
    const targetModule = getModule(relativeTarget);
    const ownershipViolation = getRuntimeOwnershipViolation(
      relativeSource,
      relativeTarget,
      imported.fileName,
    );
    if (ownershipViolation !== undefined) {
      failures.push(`${displayPath(sourceFile)}: ${ownershipViolation}`);
      continue;
    }
    if (sourceModule === undefined || targetModule === undefined || sourceModule === targetModule)
      continue;
    const constantHeader = isOriginalEscapementConstantImport(
      relativeSource,
      relativeTarget,
      relativeSource.split(path.sep).join("/") === "xmloff/source/style/escphdl.ts"
        ? fs.readFileSync(
            path.resolve(sourceRoot, "editeng/inc/escapementitem.constants.ts"),
            "utf8",
          )
        : "",
    );
    const inlineDate = isOriginalInlineDateImport(
      relativeSource.split(path.sep).join("/"),
      relativeTarget.split(path.sep).join("/"),
      sourceText,
      relativeSource.split(path.sep).join("/") === "sax/source/tools/converter.ts" &&
        relativeTarget.split(path.sep).join("/").replace(/\.ts$/u, "") ===
          "comphelper/source/misc/date"
        ? fs.readFileSync(path.resolve(sourceRoot, "comphelper/source/misc/date.ts"), "utf8")
        : "",
    );
    const inlineSequence = isOriginalInlineSequenceImport(
      relativeSource.split(path.sep).join("/"),
      relativeTarget.split(path.sep).join("/"),
      sourceText,
      relativeSource.split(path.sep).join("/") === "sax/source/expatwrap/xml2utf.ts" &&
        relativeTarget.split(path.sep).join("/").replace(/\.ts$/u, "") === "comphelper/inc/sequence"
        ? fs.readFileSync(path.resolve(sourceRoot, "comphelper/inc/sequence.ts"), "utf8")
        : "",
    );
    if (runtimeImports.has(imported.fileName) && !constantHeader && !inlineDate && !inlineSequence)
      addGraphEdge(graph, sourceModule, targetModule);
    if (
      (sourceModule === "sal" && targetModule === "o3tl") ||
      (sourceModule === "o3tl" && targetModule === "sal")
    ) {
      const approved = isOriginalSalO3tlImport(
        relativeSource,
        relativeTarget,
        sourceText,
        imported.fileName,
      );
      salO3tlImports.push({ sourceModule, targetModule, approved });
      if (!approved)
        failures.push(
          `${displayPath(sourceFile)}: non-original SAL/o3tl import ${imported.fileName}`,
        );
    }
    if (sourceModule === "framework" && suiteModules.has(targetModule)) {
      failures.push(
        `${displayPath(sourceFile)}: framework core must receive ${targetModule} through a registered module factory`,
      );
      continue;
    }
    if (isForbiddenDomainVclImport(relativeSource, relativeTarget)) {
      failures.push(
        `${displayPath(sourceFile)}: domain core must receive browser adapters through an injected contract`,
      );
      continue;
    }
    if (
      isForbiddenModuleEdge(sourceModule, targetModule) &&
      !isOriginalCharacterValueImport(relativeSource, relativeTarget) &&
      !isSidebarPresentationImport(relativeSource, relativeTarget)
    )
      failures.push(
        `${displayPath(sourceFile)}: non-allowlisted module edge ${sourceModule} -> ${targetModule}`,
      );
  }
}

const cycle = findUnapprovedModuleCycle(graph, salO3tlImports);
if (cycle !== undefined) failures.push(`runtime module cycle: ${cycle.join(" -> ")}`);

if (failures.length > 0) {
  console.error(
    `Module boundary check failed:\n${failures
      .map(
        /** Formats one boundary failure for command-line output. @param failure - Failure message. @returns Bulleted diagnostic. */
        (failure) => `- ${failure}`,
      )
      .join("\n")}`,
  );
  process.exitCode = 1;
} else {
  const edgeCount = [...graph.values()].reduce(
    /** Adds one module adjacency count to the graph total. @param total - Accumulated edge count. @param targets - Current module targets. @returns Updated count. */
    (total, targets) => total + targets.size,
    0,
  );
  console.log(
    `Module boundary check passed: ${runtimeSources.length} runtime sources, ${checkedImports} relative imports, ${edgeCount} allowed cross-module edges.`,
  );
}
