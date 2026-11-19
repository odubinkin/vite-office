# Native document builder dependencies

The original CDocumentBuilder is now implemented and registered. Its stream
parsing, source error callbacks, current resolver/handler lookup and default
resolver run over native libxml2 and actual UNO owners. See the current
[service and ABI qualification](javascript-uno-exceptions-and-document-builder.md).
Real broker/file providers and complete URI fallback QA remain pending.
The measurements below describe earlier dependency checkpoints.

The original context_t, xmlIO_read_func and xmlIO_close_func bodies are now
represented using actual XInputStream References and sal_Int8 Sequences. Native
callback tests parse malformed XML through xmlCtxtReadIO and a real
MemoryInputStream. Caller-owned streams stay open. The source close/freeOnClose
order and early returns are preserved, including lack of deletion on close
failure or an empty resolver stream.

Native xmlError field access uses the pinned compiled headers. Original
make_error_message uses ASCII_US bytes followed by decimal line and int2;
throwEx produces an actual generated SAXParseException. Its Context,
WrappedException, PublicId and SystemId remain empty as in the source.
Error/warning preparation passes a real typed Any to genuine XErrorHandler
components and catches only actual UNO exceptions. The original callback bodies are now also reached through real C SAX callbacks.
The original stream QA now also runs through the registered builder; full provider/URI QA remains pending.

The generated SAXParseException keeps SAXException inheritance, real OUString
and Any owners, signed32 location fields, base-first copy/move assignment and
reverse member destruction. Its normal comprehensive type registration uses
existing CPPU factories. Logical LP64 member lvalues expose existing storage to
UNO data operations; no binary host ABI or independent layout provider is claimed.

Thirteen focused tests pass with the three new executable owners above the
approved 90% gate: 99.29% statements, 98.03% branches and 100% functions/lines.
A related eleven-file run passes 112 cases, including the whole changed SAXException
owner, with 99.44% statements, 98.50% branches and 100% functions/lines.
The first exception test exhausted memory because a TextEncoder array entered
the NUL-terminated OUString overload; the final code uses a counted constructor.
The native IO fixture also materializes its byte array in the test realm for the
existing pointer-array contract. These are corrected binding/fixture mistakes,
not upstream parser behavior changes.

Metadata initialization and complete DOCX/XLSX filter/UI acceptance remain open.


## Native callback and resolver qualification

The C varargs-to-fixed-signature bridge installs the original error, warning and
resolver callbacks on actual xmlParserCtxt instances. The original unused printf
arguments are erased in compiled C; error policy stays in unoxml. Realm-local
callback maps use the parser address and a unique registration scope, including
when the same callback object is reinstalled. Static table entries have native
module lifetime. The parser's original _private member is not repurposed.

The IO context's actual UNO stream owner remains in context_t. An opaque native
userdata address lowers that JS-side owner to the C callback ABI; this is not a
binary C++ Reference layout or a second stream provider. Only the source context
destructor unregisters/frees the address. Source early returns and failed-close
retention remain unchanged.

The original validTestFile, warningTestFile and errorTestFile XML byte content is
retained from domtest.cxx, including declaration position and UTF-8 octal data.
Real SequenceInputStream owners feed native xmlCtxtReadIO with source options
zero. Native warning/error callbacks produce the original generated exception
payloads; nested parsing retains separate contexts. This qualifies the native
path and original XML assertions, not the pending service-manager bootstrap.

The real resolve_func body now passes genuine XEntityResolver/InputSource streams
to xmlParserInputBufferCreateIO and xmlNewIOInputStream. Both calls retain
XML_CHAR_ENCODING_NONE. The resolver's returned encoding and identifier metadata
remain unused as in source (CALC-532/WRITER466). Public and system-only external
DTDs close and release their streams once; their main caller stream stays open.
These raw-library resolver cases explicitly select DTDLOAD to reach the callback;
the source builder zero-option default is not changed.

The related thirteen-file run passes 120 tests. The combined callback binding,
resolver and complete changed IO owner have 98.78% statements, 92.30% branches
and 100% functions/lines against the approved 90% gate. The resolver's null
system-ID branch and a host-only read failure remain unqualified; no fabricated
native graph is used to cover them. The broader DOM tree coverage gate remains
unmet.

Run the actual UNO graph qualification in Chromium main realm and a genuine
DOM-free module Worker:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/node_modules/.cache/ms-playwright" node --experimental-strip-types scripts/native-dom-worker-probe.mjs
```

It checks real parser callbacks, typed diagnostics, native stream IO, document
identity, namespace attributes, live mutation-list rebuilding and counted Unicode.
Only scalar observations cross the Worker boundary. The first fixture tried to
read a newly appended text wrapper after native text coalescing had invalidated
it; the fixture now uses an empty actual element. The source merge/invalidation
logic was preserved.


A genuine DOM regression also preserves insertBefore's old-child return and lack
of a subtree event: a cached element list remains stale until a later ordinary
attribute mutation. This original behavior is recorded as CALC-533/WRITER467;
no cache repair or synthetic event was added.


The source UCB command environment, active data sink and basic interaction
request/continuation owners are now available as actual components. Their
handler/stream ownership and source selection behavior are described in
[native UCB command context](native-ucb-command-context.md). UCB content/broker
and full DocumentBuilder/default resolver/service wiring remain pending.

The [registered DocumentBuilder](javascript-uno-exceptions-and-document-builder.md)
now implements source parsing, callbacks, default entity resolver and service
registration. Original valid/warning/error stream QA runs through the production
service manager. Real broker/file providers, full URI QA and metadata/format/UI
acceptance remain pending; earlier checkpoint measurements above are historical.


## Original FastParser SAX2 ABI and Emscripten profile

The common native library now also exposes the genuine C push-parser APIs needed
by `sax/source/fastparser/fastparser.cxx`: creation, incremental parsing, native
location queries, original options API and native entity allocation/lookup. The
small C binding supplies the exact original static SAX2 callback aggregate and
`xmlParserCtxt::myDoc` access. Namespaces and attributes retain libxml2's actual
borrowed two-pointer and five-pointer record arrays. JavaScript receiver handles
are scoped actual native opaque addresses, with independent lifetimes for live
contexts; no alternate parser or XML event/document state is created.

The rebuilt pinned artifact has154 exports and851 enum constants derived from
the same C headers, including the complete error enum needed by FastParser.
Archive/compiler pins and library configuration are unchanged; no download is
required for this rebuild. The actual artifact hash is in
`third_party/libxml2-wasm/artifact.json`. The ABI binding does not set parser
options, install a resolver or register a FastParser service. Its tests use the
C parser's unchanged default options.

Pinned `FastSaxParserImpl::parseStream` has an explicit `__EMSCRIPTEN__` branch
that assigns `mbEnableThreads = false`. Only its other-platform branch enables
producer/consumer threading using the environment/configuration and input-size
heuristics. The browser/WASM implementation must follow the original Emscripten
profile, rather than treating a host-imposed default as upstream behavior.
Earlier task notes requiring the non-Emscripten internal producer thread for
browser acceptance are superseded by this source finding. Running the entire
import in an outer module Worker is compatible with that original profile;
native pointers still remain local to each realm. This is not yet qualification
of a complete application import/export Worker protocol.

Twenty-eight related native library/DOM builder cases pass. The whole new ABI
binding reaches the authorized90 gate (all four measured metrics happen to
be100), including every actual C callback. A real custom entity is allocated and
freed through native C; overlapping C contexts continue callbacks after an older
receiver scope is destroyed. Main/DOM-free Worker tests also parse UTF8 chunks
split inside a supplementary codepoint and observe exact native names, namespace
counts, attribute values, PI data, characters and completion status.

The original FastParser UNO implementation, callback/error/context/namespace
algorithms, complete original parser QA and filter/model/UI acceptance remain
unfinished. The source Expat Parser service and LegacyFastParser service are
distinct registrations; this ABI layer does not replace either or repair the
legacy direct OFOPXMLHelper/SAX shortcut by aliasing services.

## Original FastParser entity and legacy callback consumers

`fastparser.entity.ts` now owns the original `ParserData`, `Event`, `SaxContext`
and `Entity` consumer responsibilities using actual RTL strings, UNO references,
native attribute sequences and caught-exception `Any` values. InputSource,
converter, shared event and raw C parser pointer are fields of that same Entity.
The former second input-only Entity is removed; existing host byte-reader callers
construct the canonical owner through `createInputEntity`. Native parser context
cleanup still belongs to the future original ParserCleanup implementation.

`legacyfastparser.handlers.ts` contains actual WeakImplHelper NamespaceHandler
and CallbackDocumentHandler owners. Known/unknown element and attribute routing,
queued namespace declarations, same-object child context references and first
callback exception handling are exercised against the registered native Writer,
FastTokenHandler and real native output streams. Closed streams supply genuine
UNO failures. There is no replacement positive document-handler provider.

The original empty NamespaceHandler URI lookup and unshifted high-bit token
lookup remain unchanged and are documented as CALC-580/581 and WRITER-517/518.
These observations concern the direct legacy adapters; complete legacy parser
namespace configuration and application reachability are not yet established.

The unified-input regression run passes61 cases in4 files. Whole Entity and
legacy-adapter coverage is S96.29/B95.83/F100/L97.32 at the authorized90 gate;
each owner independently exceeds90 in every metric. A Chromium main/DOM-free
Worker probe connects actual native Entity/adapter/Writer consumers using public
source events. The separate C push-parser probe independently qualifies actual
C-produced SAX callbacks. These two probes do not yet assemble C-produced events
into the new Entity, and do not qualify complete FastParser, DOCX/XLSX import,
package export/reopen or application UI acceptance. No FastParser service is
registered and no production import route is switched by this prerequisite.

## Native parser ownership, namespace registry and locator

The original private FastSaxParserImpl now owns configuration references, actual
Entity stack/current raw pointer, namespace registration and its native locator.
Entity owns original NameWithToken/NamespaceDefine values and namespace stacks.
Namespace keys use the existing actual RTL Unicode hash/equality and owned key
copies. Host bucket allocation/layout is not a native unordered_map ABI claim.
Live-prefix lookup scans only the active count in reverse, returns the original
borrowed definition value, and the public wrapper translates caught UNO failures
into the source default IllegalArgumentException. Default namespaces remain a
separate source stack; no invented empty-prefix definition is populated.

The separate original FastLocatorImpl is an actual WeakImplHelper<XLocator>.
It reads positions with native xmlSAX2 APIs from the current Entity C context,
returns real native string copies of source identifiers, and checks disposal
before accessing the native context. Actual nested Entity tests verify source
copy ownership, converter admission, stack restoration and borrowed input-stream
lifetime. Genuine native weak references observe configuration retention and
release. The privately owned locator's future document-callback handoff is not
yet exercised; current tests construct the real public locator explicitly.

The new SAX-to-external dependency follows fastparser.cxx's libxml/parser.h and
Library_sax.mk's libxml2 declaration. Reverse external-to-SAX/application
ownership remains rejected. The older comphelper/SAX cycle remains an open
failure; no cycle exemption is introduced.

Current related run passes69 cases in6 files. Complete Entity/implementation/
locator owner metrics are above90 independently. Real Chromium main and DOM-free
Worker observe actual C line/column state, Unicode source identifiers, borrowed
namespace identity and the existing native consumer/C-callback probes. Explicit
public source namespace aggregates are initialized by these owner fixtures;
this is not a claim that the unfinished callback producer populated them.
Mandatory original complete parser QA remains pending with that producer.

The user explicitly approved the original xmlCtxtUseOptions call with
XML_PARSE_NOENT|XML_PARSE_HUGE. The next parse-loop implementation may preserve
that call without a substitute parser-option policy. This ownership block does
not yet execute it or register FastParser. The older independent URL trust,
authentication and certificate scope question remains unanswered. Native parser
producer/parse/custom-entity/error/normalization/UNO service assembly and full
DOCX/XLSX model/package/UI acceptance remain unfinished.

## Native FastParser diagnostics and namespace alias rules

Entity now implements the original throwException preparation and fatal-callback
selection. The native libxml2 context supplies the last-error message; the source
ASCII_US conversion, unknown-error fallback, source-ID/line prefix and native
locator fields are retained. The stored first caught Any is assigned through the
actual shared CPPU Any owner, whose original copy implementation flattens an Any
operand. No JavaScript Error wrapper or fabricated nested exception is inserted.
Temporary native strings/References/Any values are destroyed before handler
execution. If the fatal handler throws, the local prepared exception unwinds;
otherwise the original source SAXParseException is thrown. Tests use the genuine
nil-handler configuration and actual registered Writer/closed-stream failure;
nonnull fatal-handler execution and native threaded-phase suppression remain
unqualified rather than supplied by a replacement positive handler.

The independent original NormalizeURI/NormalizeOasisURN/NormalizeW3URI copy now
uses actual native RTL values, source aliases/index checks and compiler-static
literal storage. It intentionally remains separate from xmloff, as the original
translation unit does. It preserves nonnumeric OASIS version suffixes and the
prefix/suffix-only W3 XForms rule, including absent/nonnumeric year components
(CALC583/WRITER520). The original implicit concat-to-OUString temporary and move
assignment retain self-referencing view lifetimes during OASIS rewriting.

Current related99cases/7files PASS. Whole Entity and normalization owners exceed
the authorized90 gate independently (combined S96.81/B95.37/F100/L97.84).
Normalization happens to reach100; no counter/source-mask manipulation is used.
Real C malformed UTF8-name XML verifies the source ASCII diagnostic conversion;
source identifiers independently retain their Unicode. Real Writer failure tests
prove saved Any equality through the source exception boundary. Actual browser
main/DOM-free Worker checks also observe the native malformed-context exception
and alias rewriting, without a browser XML driver.

This is still a prerequisite, not an assembled FastParser parseStream pipeline.
Native C callbacks have not yet been connected to Entity producers, and the
original stream loop/cleanup/custom-entity handling, full upstream parser QA and
UNO wrapper/service registration remain unfinished. The source XML option call
is explicitly approved but not yet executed by this block. Whole DOCX/XLSX
model/filter/package/UI acceptance and the existing broader failed gates remain
open; intentional browser document workflow behavior is unchanged.

## Native C callbacks connected to source producers

Four original SAX2 callbacks now drive actual FastSaxParserImpl start/end/text/PI
producers, then the same native Entity/legacy adapter/registered Writer/token/
stream owners. Namespace definitions grow in64-entry blocks, process before
attributes, normalize before token lookup, notify their original URI spellings
and resolve only active reverse scopes. Counted C bytes accumulate before native
UTF8 conversion; PI/element boundaries flush them in the original order. The
source XMap interface/normal type getter is declared completely, but a nonnull
map service is not fabricated to execute the optional translation path.

This browser/WASM target follows the pinned Emscripten profile, where parseStream
explicitly sets mbEnableThreads=false. Direct maSharedEvent access is precisely
the source getEvent single-thread result, including no maType assignment. The
other-platform event queues/threads remain an unported build profile; no
arbitrary change to an upstream browser thread default is made. Outer module
Worker execution remains independently exercised.

Actual libxml2 records now reach these four producers in Chromium main and a
DOM-free Worker, including UTF8 input split inside a supplementary codepoint.
The earlier supplied-Event browser consumer probe has been replaced by this
stronger connected C-to-Entity probe. The fifth fixture callback still calls the
genuine predefined C entity API; it does not claim to implement the missing
original custom-entity callback. Original converted-input parse/cleanup loop,
custom entities, full parser QA and UNO parser service/format routes remain
unfinished. The approved XML_PARSE_NOENT|XML_PARSE_HUGE call is not yet added.

The broad related run passes63 cases/6files. Current two-owner coverage run
passes20 cases/2files; complete callback owner S96.47/B90.75/F100/L97.71 and XMap
type binding100 independently pass90. Native NULL URI/PI operands are tested by
separate explicit public C-callback calls and are not misrepresented as values
emitted by the tested libxml2 version. No fake positive parser/handler/map, private
field patch, forced throw or counter/source masking is introduced. Unsupported
nonnull map execution, non-UNO host exceptions and other-platform threading
remain unqualified.

A previous owner fixture incorrectly requested namespace alias `w`; the actual
pinned namespace input calls the Word namespace `doc`. Its undefined value is
outside the native signed32 token domain. Both owner/producer fixtures now use
the real `doc` identity, and the connected fixture explicitly validates the ID
and URI. Older raw observations are retained as historical evidence; current
qualification supersedes the old claim of a real generated Word token in that
fixture. CALC585/WRITER522 preserve the unknown-prefixed-element default-context
replacement; CALC586/WRITER523 preserve map-lookup exception/flush catch boundaries.

## Converted-input loop and original custom-entity callback

The native FastSaxParserImpl now executes the original converted-input16KiB
parse/parseStream loop, all five C callbacks, native diagnostic/error polling,
start/end-document lifecycle and context/document-before-Entity cleanup. The
first converted chunk is passed directly to xmlCreatePushParserCtxt before its
result is assigned. The explicitly approved source xmlCtxtUseOptions call uses
XML_PARSE_NOENT|XML_PARSE_HUGE in the original location; no substitute limits or
resolver policy are introduced. A real attribute above10MiB crosses successive
input reads successfully. Empty input follows the original no-C-context shortcut
and succeeds; no host root rejection is added (CALC588/WRITER525).

Custom Pair<string,string> values are copied/sorted into native RTL owners and
looked up with the original mixed ASCII comparison/lower_bound. Each replacement
uses actual xmlNewEntity and remains owned until parser destruction, after which
it is unlinked/freed in source order. Numeric callback names use genuine pinned
Emscripten libc strtoul, source +2 offset and original UInt32/codepoint constructor.
The source decimal offset and non-ASCII custom-name comparison mismatches remain
CALC587/WRITER524 and CALC589/WRITER526. Direct numeric callback tests do not claim
that libxml2 sends ordinary XML numeric references through that callback.

The existing native artifact adds strtoul and actual entity-content accessors:
157exports/851header constants, SHA256
8ef858126ec1ec7909d6e25f7c4c539b882eb3f668bd839c579b3ca0292eac8d.
Source archive, Emscripten/compiler/configuration pins are unchanged; no download.
All declarations/constants are still derived from genuine C header AST data.

Missing RTL entry points are now actual original mixed Unicode/ASCII comparison,
Unicode-codepoint construction and corresponding C++ wrapper overloads. Every
createFromCodePoints assertion from the pinned rtl_OUString2.cxx test is ported,
including embedded zero/lone surrogate/maximum codepoint. Existing shared SAL
ownership/comparison helpers supply behavior, not a new string/provider layer.

A lazy per-parser opaque C receiver scope binds the same actual owner until
all context cleanup and member destruction complete. It is not freed as soon
as parse returns. The parser constructor/destructor do not require native library
access when no native entity/binding has been created. This lowers original
void* this lifetime without storing an alternate XML graph or stream state.

Current related64cases/9files PASS; whole parser owner S95.39/B91.32/F100/L96.51
at90. Actual closed native input/output streams and malformed later chunks test
cleanup/saved exception/native status paths without throwing stand-in providers.
Main/DOM-free Worker now runs actual InputSource/converter/parseStream/custom
entity/Writer output, replacing the former fixture-fed C chunk consumer. A
separate137-case21-file SAL run passes its tests but fails the broader whole
three-owner90 gate (S79.20/B75.47/F73.24/L80.62); it remains open, without slicing
or combining parser coverage to hide the failure. Native allocation/huge-count
failure boundaries and full shared SAL owner qualification remain unproven.

Original FastSaxParser/LegacyFastParser UNO wrappers/factories/complete parser QA,
optional nonnull map component, other-platform thread/queue profile and complete
metadata/storage/model/filter/Strict+Transitional package/UI acceptance remain
unfinished. Physical C++ mutex/allocator/exception ABI and independent compiled
original C++ component differential are not certified. Existing broader failed
gates are retained. The implementation is not yet registered as the production
FastParser service or promoted as full DOCX/XLSX acceptance.
