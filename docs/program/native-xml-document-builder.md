# Native document builder dependencies

The original builder service has not yet been implemented or registered. Its
remaining dependencies include the UCB default entity resolver/URI fallback,
parser callback wiring and full source QA. No alternate builder, process context
or positive interface substitute is installed.

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
components and catches only actual UNO exceptions. These tests exercise the
callback bodies directly; they do not certify native SAX callback wiring or
all original builder parser tests.

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
