# Native calculation policy for workbook loading

XLSX workbook initialization copies `ScDocument::GetCalcConfig`, selects an
explicit Excel string-reference convention for Microsoft generators and writes
the result with `SetCalcConfig`. The actual document now owns that native value,
initialized from `ScInterpreter::GetGlobalConfig`. Assignment preserves the
existing owner and copies value fields while sharing the original opcode set.
The normal release-build `ScMutationGuard` is empty upstream; debug-only threading
diagnostics are not simulated here.

Each actual interpreter copies global calculation settings then merges the four
native document-specific fields. Its implicit calculation-value destruction is
bound to explicit `Dispose` in production formula-cell execution, including
exception paths. Documents release their calculation string member at teardown.
No replacement workbook settings provider or query service is introduced.

`ScGlobal::ConvertStringToValue` now retains all source policy branches and its
literal unambiguous date/time state machine. Locale conversion forwards through
`ScInterpreterContext::NFIsNumberFormat` to the existing real formatter; null dates
come from that formatter. Literal string operands and actual shared-string or
string-formula references use this conversion. Rich-edit string extraction still
requires the unported `ScEditUtil::GetString` service and rejects explicitly.
Other interpreter opcode families and formatter notification/thread services
remain outside the represented slice.

The conversion matrix from `sc/qa/unit/ucalc.cxx::testFuncParam` is ported with its
original five strings and six option combinations, asserted on actual compiled
formula cells. Existing aggregate tests already cover its numeric/missing
arguments. Additional tests cover global/document copy ownership, referenced
strings, native date/time delimiters and limits, caller error ordering and RTL
overflow. CALC-522 and CALC-523 record suspicious source behavior that is retained.
No original binary test execution or complete workbook import/export is claimed.

`ApplySelectionLineStyle` moves unchanged from the size-bounded document class to
its existing native selection-frame fragment. This keeps the same document,
selected sheets, order and calls. Complete XLSX workbook/model initialization,
metadata services, file filters and mounted DOCX/XLSX UI remain outstanding.
