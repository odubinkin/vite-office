/** @fileoverview Original source-backed runtime module edges, kept separate from the dependency scanner without changing their authority or contents. */
export const allowedEdges = new Map([
  // Original Library_ucbhelper uses SDK interfaces and CPPU/cppuhelper; command, sink, request and identifier owners consume these exact modules.
  ["ucbhelper", new Set(["cppu", "cppuhelper", "offapi", "udkapi", "sal", "salhelper"])],
  // Native unoxml uses CPPU/SAL/SDK contracts and links the libxml2 external (Library_unoxml.mk).
  ["unoxml", new Set(["cppu", "cppuhelper", "external", "offapi", "sal", "udkapi"])],
  // Original comphelper extract.hxx and attributelist.hxx/cxx use UNO Any/TypeClass and OUString.
  // Original OFOPXMLHelper uses SAX; interfacecontainer3.hxx uses o3tl::cow_wrapper.
  // Original seqstream.hxx uses cppuhelper/implbase; Library_comphelper links cppuhelper.
  ["comphelper", new Set(["cppu", "cppuhelper", "o3tl", "offapi", "sal", "sax", "udkapi"])],
  // Original configuration nodes use SAL/UNO values and TypeClass IDL; shared SortedVector adapts config_map ordering.
  ["configmgr", new Set(["cppu", "o3tl", "sal", "udkapi"])],
  ["cppu", new Set(["sal", "o3tl", "udkapi"])],
  // Original cppuhelper uses UNO/SAL, o3tl/cow_wrapper and comphelper/sequence.
  ["cppuhelper", new Set(["cppu", "o3tl", "sal", "udkapi"])],
  ["cui", new Set(["editeng", "svl", "svx", "tools"])],
  // Desktop appinit.cxx uses the process factory and CPPU bootstrap; the browser binds linked constructors, including stocservices.component TypeConverter.
  [
    "desktop",
    new Set(["comphelper", "cppu", "cppuhelper", "i18npool", "lingucomponent", "stoc", "udkapi"]),
  ],
  // Original justifyitem/frmitems use UNO values, table/style enums and Tools/o3tl units.
  // Original UnoComplexColor uses implbase and XComplexColor; Library_docmodel links CPPU/cppuhelper.
  ["docmodel", new Set(["tools", "o3tl", "cppu", "cppuhelper", "offapi"])],
  // Original xmlcnitm.hxx includes xmloff/xmlcnimp.hxx; Library_editeng links xo.
  [
    "editeng",
    new Set([
      // Original paraitem.cxx includes comphelper/extract.hxx; Library_editeng links comphelper.
      "comphelper",
      "docmodel",
      "cppu",
      // Original impedit2.cxx includes unicode/ubidi.h; Library_editeng links icuuc and icu_headers.
      "external",
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
      "udkapi",
      "vcl",
      "xmloff",
    ]),
  ],
  ["external", new Set()],
  // Native Library_msfilter uses Tools colors for the Word highlight palette.
  // Native msfilter util.cxx returns rtl::OUString color values (Library_msfilter links sal).
  // Native Library_msfilter uses Tools colors and SAL rtl strings/converters in rtfutil.cxx.
  // util.cxx includes unotools/fontcvt.hxx/fontdefs.hxx; Library_msfilter.mk links utl.
  ["filter", new Set(["tools", "sal", "unotools"])],
  // Formula value owners reuse SAL/OUString and SVL/SharedString; token identity uses native JS references.
  // Original include/formula/grammar.hxx includes the shared FormulaLanguage.hpp IDL owner.
  ["formula", new Set(["offapi", "sal", "svl"])],
  ["framework", new Set(["sfx2", "svl"])],
  // Original lang.h strong_int/sal tags are erased into primitive numeric values.
  // Original isolang.cxx uses actual RTL strings and generated css::lang::Locale values.
  // Original languagetag.cxx includes liblangtag/langtag.h; Library_i18nlangtag links liblangtag and ICU.
  ["i18nlangtag", new Set(["external", "sal", "udkapi"])],
  // Original i18npool uses LanguageTag/MsLangId/Locale values and links CPPU/cppuhelper for UNO services.
  // Original numberformatcode uses UNO Sequence, NumberFormatCode, FormatElement and SAL/locale values.
  // Native Library_i18npool links ICU i18n/common; calendar_gregorian uses its real Calendar/TimeZone factories.
  // Original nativenumbersupplier.cxx uses comphelper/processfactory.hxx; Library_i18npool links comphelper.
  [
    "i18npool",
    new Set([
      "comphelper",
      "cppu",
      "cppuhelper",
      "external",
      "i18nlangtag",
      "i18nutil",
      "offapi",
      "sal",
      "udkapi",
    ]),
  ],
  // Original casefolding.cxx includes the generated RuntimeException.hpp API owned by CPPU.
  // Original paper.cxx includes o3tl/unit_conversion.hxx for physical paper constants.
  ["i18nutil", new Set(["cppu", "external", "o3tl", "offapi", "sal", "udkapi"])],
  // Original Library_numbertext links cppu/cppuhelper/i18nlangtag/SAL and libnumbertext, using SDK interfaces.
  [
    "lingucomponent",
    new Set(["cppu", "cppuhelper", "external", "i18nlangtag", "offapi", "sal", "udkapi"]),
  ],
  ["o3tl", new Set(["sal"])],
  // Original generated enum getters use actual CPPU static enum metadata.
  // Original XNumberFormatCode.idl uses the UDK lang.Locale value;generated headers depend on UDK API.
  ["offapi", new Set(["cppu", "sal", "udkapi"])],
  // XmlFilterBase/ZipStorage use shared ZIP/SAX/OFOPXML helpers and INetURLObject::decode (Library_oox).
  // Native attributelist.cxx/Library_oox.mk consume SAL Unicode conversion and buffers.
  // Original attributelist.cxx includes o3tl/string_view.hxx for numeric attribute conversions.
  // Original binary*stream headers include UNO Reference/Sequence and io XInputStream/XOutputStream/XSeekable.
  [
    "oox",
    new Set(["comphelper", "cppu", "o3tl", "offapi", "package", "sal", "sax", "tools", "udkapi"]),
  ],
  // Library_package2/Library_xstor link cppu/cppuhelper; native storage streams use embed SDK and actual component/value owners.
  ["package", new Set(["comphelper", "cppu", "cppuhelper", "offapi", "sal", "sax", "udkapi"])],
  ["sal", new Set(["o3tl"])],
  // Native SimpleReferenceObject uses SAL OSL interlocked operations;Library_salhelper links sal.
  ["salhelper", new Set(["sal"])],
  // Original saxwriter.cxx consumes SAL/OUString and published SAX IDL (Library_sax).
  // Native Library_sax links cppu/cppuhelper; FastSaxParser owns typed errors and a WeakImplHelper locator.
  // Original sax/fastattribs.hxx includes o3tl/string_view.hxx for zero-allocation typed value queries.
  ["sax", new Set(["comphelper", "cppu", "cppuhelper", "o3tl", "offapi", "sal", "udkapi"])],
  // Original stoc/source/typeconv/convert.cxx and Library_stocservices use CPPU values, helpers, SAL, o3tl and SDK script/lang declarations.
  ["stoc", new Set(["cppu", "cppuhelper", "sal", "o3tl", "udkapi"])],

  [
    "sc",
    new Set([
      // Original scerrors.hxx includes comphelper/errcode.hxx; Library_sc links comphelper.
      "comphelper",
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
  // Library_sfx links tl for objembed map units and SAL for objstor text encoding.
  // SfxBaseModel uses WeakImplHelper, UNO references, XChild and comphelper listener containers.
  // Native sfxhtml uses lang.h and o3tl/string_view.hxx.
  [
    "sfx2",
    new Set(["comphelper", "cppu", "cppuhelper", "offapi", "sal", "svl", "tools", "udkapi"])
      .add("i18nlangtag")
      .add("o3tl"),
  ],
  // Original enum items include comphelper/extract.hxx and UNO Any.hxx.
  // Original cintitem.cxx hashes unsigned values through o3tl/hash_combine.hxx.
  // Native grabbagitem.cxx consumes generated UDK beans PropertyValue.hpp.
  // Original SharedStringPool borrows CharClass; Library_svl links utl.
  // Original zforlist.cxx consumes generated i18n NumberFormatCode;Library_svl uses SDK API.
  // Original zforscan/zforlist use native LanguageTag/MsLangId;Library_svl links i18nlangtag.
  [
    "svl",
    new Set([
      // Original include/svl/itemprop.hxx uses cppuhelper/implbase.hxx; Library_svl links cppuhelper.
      "cppuhelper",
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
  // Original stream.cxx uses RTL text conversion and unicode/ucsdet.h; Library_tl links ICU.
  // time.hxx/datetime.hxx consume published util::Time/DateTime; Library_tl uses the SDK API.
  ["tools", new Set(["o3tl", "cppu", "comphelper", "external", "sal", "offapi"])],
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
