# Native UCB property read

Content now has the original getPropertyValue, getPropertyValues and
getPropertyValuesInterface method bodies. The singleton name initializer owns
its original temporary RTL string until the sequence has copied it. The property
sequence keeps native Type/Attributes defaults and writes only Name and Handle
(minus one). The real getPropertyValues command returns a normal acquired XRow;
getObject uses original one-based indexes and empty type-map references. Result
Any elements retain actual native sequence ownership and rvalue movement. No
positive row, provider, command processor, broker or document substitute is used.

Six complete original declarations cover XRow and its XArray, XRef, XBlob, XClob
and XResultSet dependencies. All methods are present with original direct roots
and normal CPPU factories. Hyper values use bigint and long values use number;
XClob.position deliberately keeps its original long start while positionOfClob
uses hyper. This source-only contract observation is recorded as
CALC-537/WRITER471, without widening the published interface or claiming a live
large-Clob witness. The Date struct keeps zero defaults, unsigned16 day/month and
signed16 year, without adding calendar normalization.

Any's nonvirtual private swap helper is now invoked through its qualified class
method binding. The same unchanged move body therefore operates on both an
owned public Any and an actual allocated Sequence element whose C record has no
JS class prototype. No wrapper value, type/default factory, record prototype
mutation or extra owner is introduced. Tests check both pReserved aliases after
swapping inline values and retain all earlier Any ownership/data/copy tests.
Property field accesses use existing logical LP64 member lvalues (sizeof32,
Name0, Handle8); their initialized native storage is owned by the sequence.
This is compiler address/mutability erasure, not a physical JS/C++ ABI claim.

Tests exercise real default Content property reads, empty and multiple names,
embedded NUL/Unicode and unchanged caller string ownership. Normal SDK type-cache
and typed-null transport tests do not supply positive SDBC implementations.
The original qadevOOo XRow method QA was located but still requires an actual
row/result-set service. Positive row execution and getObject exception unwinding
remain unqualified until the genuine PropertyValueSet/provider graph exists.

Property mutation, isDocument/openStream and default resolver/URI paths, full
DocumentBuilder, XPath, native metadata/model initialization, DOCX/XLSX filters,
shell routing and existing UI acceptance remain unfinished. The whole client
coverage gate remains unmet; this checkpoint is not a format/service certificate.

The command name retains its original static constexpr OUStringLiteral storage.
The actual RTL const-literal assignment overload now releases the prior string
before adopting the literal pointer without acquisition. The relevant original
checkOUStringLiteral constructor/assignment assertions are ported; its unrelated
append, comparison and search overloads are not claimed as covered here. An
additional retained-owner case observes only live data and original static flags.

Validation: 206 related cases pass in 30 files, including the unchanged prior
Any ownership/data/copy selection, RTL lifetime cases and new source-backed
property/SDK cases. Module boundaries pass 48 cases and resources pass 2 cases.
Coverage over 47 complete selected owners remains below 90: 76.62% statements,
72.82% branches, 87.32% functions and 77.93% lines. The set now includes the entire
Any and OUString owners; it is not directly comparable to earlier narrower
aggregates. Positive row/command/broker execution and other owner branches remain
unqualified. Types, build/static, scoped lint/format, source/registry/module
checks, resources, tree/size, doctor/routing and diff checks pass. JSDoc retains
only the existing css-style-matchers.ts errors at 17 and 76. Full suites were not
run under the approved once-per-ten-task cadence.
