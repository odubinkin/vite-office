# Native Writer character defaults

All48 entries in RES_CHRATR_BEGIN..RES_CHRATR_END-1 now have their original
concrete static default classes in ItemInfoPackageSwAttributes and are registered
on the actual SwAttrPool. Defaults retain the pinned init.cxx values, original
slot metadata and shared module ownership. The source's three unused entries
remain SfxVoidItem, including the header/table mismatch recorded as WRITER457.
Character bidi direction remains signed16 minus one. Scale width remains100,
rotation zero with fit=false, revision ID unsigned zero, and variation/bag values
empty. This does not infer contiguous pool ranges from sparse registration.

SvxNoHyphenItem and SvxCharHiddenItem retain native bool constructors, implicit
copy and concrete Clone, inheriting the real SfxBoolItem transport. SvxRsidItem
has the original unsigned32 Any query/extraction instead of the signed32 base
implementation, concrete copy/Clone and empty false-returning presentation.
Localized bool presentation and revision diagnostics/instance caches remain
unported. Existing browser scalar reads remain explicit bindings.

The document previously omitted ScriptHint registration despite initializing its
global default. The48-entry owner test caught that omission. Tests now cover all
classes, clone identity, static ownership across documents, original slot lookup,
source values, genuine hidden-item defaults/direct formatting/reset, high-bit
revision IDs and typed Any rejection. DOCX attribute output tests consume the
actual document defaults and user overlays through its existing exporter and XML
serializer. They do not claim complete DOCX package or UI acceptance.

No focused original CppUnit for these three item classes exists in the inspected
editeng/qa tree. The hidden-text use in sw/qa/core/uwriter.cxx's
getModelToViewTestDocument additionally needs footnotes, redlining and model-to-view
expansion; it remains outstanding and is not relabeled as ported by these tests.
Full Writer/Sdr default packages, native stylesheet pool, SwXTextDefaults service,
and complete DOCX/XLSX filter and existing UI acceptance remain required.
