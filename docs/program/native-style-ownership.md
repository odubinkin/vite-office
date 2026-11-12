# Native shared stylesheet ownership prerequisite

The pinned `include/svl/style.hxx` declares `SfxStyleSheetBase_Base` as
`cppu::WeakImplHelper<>`. The actual shared stylesheet base now inherits this
specialization. Copy construction creates a fresh weak base, while copying the
original borrowed pool pointer, values and owned-versus-borrowed item-set state.
A null pool remains valid for the original index QA fixture; operations that
require a pool preserve the native non-null precondition.

`IndexedStyleSheets` now owns strong references in its main vector. Its family
vectors and positional return values remain borrowed pointers. Existing shared
`Reference` acquire/release operations bind the represented `rtl::Reference`
operations without adding a second lifetime implementation. Pointer arguments
construct the original implicit temporary; existing reference arguments are
borrowed. `Clear` copies each callback argument by value, destroys that argument,
and then clears the indexed reference in insertion order. The ordinary container
destructor releases remaining references without promising a standard-library
specific destruction order. The source omission of family-vector clearing,
already recorded as CALC146, is preserved.

The pool's `Remove` retains the source `xP` until after reparenting and erase
broadcast. `Clear` uses the actual optional `XComponent` query, catches only UNO
exceptions from component disposal, and broadcasts before dropping the indexed
owner. The current stylesheet classes do not implement `XComponent`; no positive
query provider has been manufactured. Last strong release disconnects the
existing weak adapter and dispatches the actual virtual stylesheet destructor.
The base destructor disposes its owned item set, then its strings in reverse
member order. Derived broadcaster/listener destruction keeps the existing order.

All nine original `svl/qa/unit/items/test_IndexedStyleSheets.cxx` scenarios now use
the source `MockedStyleSheet` shape: a subclass of the real stylesheet base with a
null pool and caller-owned strong references. Additional cases check independent
by-value callback ownership, destruction without `Clear`, the pool-only `Remove`
lifetime, copy weak lifetime and real pooled-item reference release. Existing
style and iterator cases use actual stylesheet owners. Browser fixtures use the
same destruction boundaries and release by-value preview sets.

This is a dependency of the native Writer document style pool and
`SwXTextDefaults`. It does not implement those owners or complete DOCX/XLSX
filters, export, document services or existing application UI acceptance.
