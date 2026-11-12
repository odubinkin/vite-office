# Writer stylesheet prerequisites: native pool and format metadata

The shared style pool now represents both original bases from
`include/svl/style.hxx`: the broadcaster and the independently named
`SfxStyleSheetBasePool_Base : cppu::WeakImplHelper<>`. They share one identity
through the existing broadcaster mixin and actual CPPU owner. Copies initialize a
fresh weak base while retaining source broadcaster subscriptions and the native
empty-copy collection behavior. Final strong release runs the virtual pool
teardown, clears indexed styles and then emits the broadcaster-base destruction
notification. The indexed styles and the item pool retain their original
ownership boundaries.

`SwFormat` now has the original help ID defaults (`USHRT_MAX` for uint32 help ID,
`UCHAR_MAX` for the document-local help-file index), declared unsigned setter
widths, hidden flag and optional favourite flag. Unknown favourite status remains
unset at construction. `IsDefault` depends on the actual parent pointer. The
inline `SetPoolFormatId(UNKNOWN)` side effect sets favourite to true. The existing
native character-copy branch copies the source help ID and explicitly resets the
help-file index to `UCHAR_MAX`, as the original `SwDoc::CopyFormat` does.

The native interop-bag getter/setter use the existing `SfxGrabBagItem`, genuine
`Any` and `Sequence<PropertyValue>` owners. An absent bag yields an actual empty
sequence. `SetGrabBagItem` ignores the original `PutValue` result and always
parses favourites. `qFormat` uses the original long extraction: zero is false,
nonzero is true, an absent key is false, and an existing nonconvertible key leaves
the previous optional state unchanged. This preserves the distinction needed by
the DOCX exporter between unknown metadata and an explicit imported false value.

The existing grab-bag implementation previously dropped owning `Any` values when
clearing/replacing the map and had no member-destruction binding. It now destroys
replaced maps, assigns an existing duplicate entry through `Any::assign`, and
destroys all entries at item teardown. The generated `PropertyValue` value binding
likewise destroys its nontrivial members in reverse declaration order. Actual
weak objects verify release and returned-Any lifetime; no synthetic positive
query provider or GC lifetime claim is used.

The represented `SwFormat` constructors do not include its native copy
constructor/operator= or shared interop-bag copy ownership. This change does not
claim those paths, the full Writer document stylesheet pool, `SwXTextDefaults`,
DOCX/XLSX filters, export or mounted UI completion. The original
`sw/qa/extras/ooxmlexport/ooxmlexport25.cxx::testQFormatPreservation`, using
`nospacing_hidden.docx`, still requires the actual complete DOCX import/export
path. These core metadata tests are not a substitute for that upstream
round-trip test.
