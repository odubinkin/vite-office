# Native UCB content contracts

This prerequisite continues the shared DOCX/XLSX native XML builder path. The
complete original ucbhelper ContentIdentifier component now implements the actual
XContentIdentifier interface with WeakImplHelper, a unique private implementation,
owned RTL fields, acquired UNO queries and independently owned string returns.
Its first-colon split and ASCII-only provider-scheme conversion are preserved.
The URL keeps its original scheme spelling despite the header comment; see
CALC-535/WRITER469 in the suspected-issue journals. Inputs without a colon leave
both fields empty, as in the source. No URI validator or browser URL replacement
is introduced.

Complete original XContentIdentifier, XContentIdentifierFactory, XCommandProcessor
and XCommandProcessor2 declarations preserve normal CPPU type registration and
the original direct bases. The real Command value preserves original Name,
Handle and Argument member order, empty/zero/void defaults, signed32 assignments,
copy ownership and the existing logical compound-address transport for UNO Any.
The default handle is zero; the Content client will explicitly choose minus one.

Focused tests use the real component, real RTL and Any owners, normal generated
SDK types and typed-null transport. No positive factory, command processor,
broker, process context or alternate document model is manufactured. The source
qadevOOo ifc.ucb._XContentIdentifierFactory::_createContentIdentifier case was
located: it requires a genuine factory service and remains pending with the
broker implementation. Component tests preserve its file-URI getter assertions
but do not claim execution of that factory method or its external office harness.
No dedicated ContentIdentifier helper unit tests were found in the bounded
ucbhelper/source and qadevOOo/ifc/ucb inspection.

Content/broker stream orchestration, default resolver/URI service wiring, full
DocumentBuilder, XPath, native metadata initialization, DOCX/XLSX import/export
and existing UI acceptance remain unfinished. This foundation does not certify
physical C++ ABI, source threading or complete upstream service QA.

Validation: 156 related DOM/SAX/UCB cases pass in 18 files, with 48 module-boundary
cases and two resource cases also passing. The complete UCB/SDK aggregate is
99.23% statements, 96.42% branches, 98.87% functions and 99.60% lines against the
approved 90% threshold. This aggregate includes twenty runtime owners, not a
per-file or complete service certification. The protected InteractionRequest
default-constructor path from the earlier block remains unqualified. Tools/app
typechecks, production/static build, scoped lint/format, provenance, registry,
boundaries, resources, source tree, size, doctor and routing pass. The repository
JSDoc check still reports only the pre-existing css-style-matchers.ts errors at
lines 17 and 76. Full suites were not run; the once-per-ten-task cadence remains.
