# Observed Writer upstream cases requiring review

These observations come from the pinned LibreOffice baseline
`9bc445578031fecf56086729d8e4940c77e14d65` (`libreoffice-26.8.0.2`). They document
suspicious source conditions and their consequences. They are not confirmed
upstream defect reports: complete consumer invariants, history and intended
behavior have not been established.

The user explicitly requires reproducing upstream behavior. Recording a case
here does not authorize fixing it, normalizing it or changing defaults. Writer
retains the original defined behavior. Undefined native arithmetic or invalid
lifetimes are outside parity certification; no invented successful result is
assigned to them.

Each entry records original source, an initialized example or proof, evidence,
remaining uncertainty and the current implementation decision, following
[the shared observation format](upstream-suspected-issues.md). No upstream issue
was filed or external publication performed.

## WRITER-001: Hanging first-line setters replace relative left units with empty-context twips

Status: suspicious unit/context loss; original source expressions verified and
portable initialized examples reproduced. Complete native consumer invariants
and a compiled native differential result remain unverified.

Original [`SvxLRSpaceItem::SetTextFirstLineOffset`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L738)
removes an old negative offset and adds a new negative offset by resolving both
measures with an empty `SvxFontUnitMetrics` context and assigning a fresh
`SvxIndentValue::twips` to the stored left margin. Original
[`SetTextLeft`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L775)
performs the same empty-context addition when the first-line offset is negative.
[`GetTextLeft`](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L862)
returns a newly resolved twip measure in that hanging-offset case. A font-relative
left value can therefore lose both its original unit and its font-dependent
contribution before a later layout receives initialized font metrics.

Initialized example: set text-left to `2 FONT_EM`, then first-line to
`-1 FONT_CJK_ADVANCE`. Empty metrics resolve both font contributions to zero;
the stored left margin and returned text-left value become `0 TWIP`.
With subsequently supplied metrics `em=100`, `ic=200`, first-line resolves to
`-200` and `ResolveTextLeft` returns `200` through its original subtraction,
while `GetTextLeft` still returns the empty-context `0 TWIP`. The original
first-line measure retains its `-1 FONT_CJK_ADVANCE` unit/value.

A second initialized example starts with left `200 TWIP`, right `70 TWIP` and
first-line `-30 TWIP`; stored left is `170 TWIP`. Applying the published
text-left unit member15 with `2.5 FONT_EM` changes stored left to `-30 TWIP`
and subsequent text-left resolution to zero, even with `em=120`. Applying the
right unit member14 instead retains the stored left `170 TWIP` and resolves
right to `300` with those metrics. This distinction is separate from the
locally corrected swapped member IDs; the ID swap was a port defect, not an
upstream suspected issue.

Evidence: exact pinned `frmitems.cxx` definitions and original metrics/unit
contracts in `include/editeng/lrspitem.hxx`; existing
[`native-lr-font-units.test.ts`](../../apps/office/src/editeng/source/items/native-lr-font-units.test.ts)
case `negative relative first line retains native empty-context conversion
while explicit metrics resolve it`, plus the independent initialized
hanging-side examples in
[`native-lr-member-routing.test.ts`](../../apps/office/src/sw/source/core/table/native-lr-member-routing.test.ts).
Task `202610101340-HB1SPN` records source hashes and upstream-absent acceptance.
These tests execute the portable implementation, not pinned upstream code.

Complete native callers may constrain LR items to absolute units when using
hanging indentation; the separate paragraph text-left/first-line item classes
also provide other layout contracts. Those invariants and historical intent
remain unreviewed. Decision: preserve the empty-context resolution, setter
order, twip reassignment and getter distinction. Do not retain a relative unit,
substitute later font metrics or normalize the original behavior.

## WRITER-002: Right-margin percentage writes change metadata without rescaling the measure

Status: suspicious setter asymmetry; pinned source expressions inspected and
portable initialized acceptance authored. Complete native consumer invariants
and a compiled native differential remain unverified.

Original [SvxRightMarginItem::PutValue](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L1582)
handles right-relative member7 by assigning only the unsigned percentage field.
It admits integer values from0 through65534; the typed SetRight setter instead
accepts an unsigned16 percentage including65535 and scales the supplied double.
The getters and UNO status cast percentage metadata to signed16. Consequently,
percentage metadata, stored measure and reported signed percentage can differ
from what a caller infers from the setter name alone.

Initialized example: create right-margin -72 TWIP, then PutValue(32768,7).
The stored margin remains -72 TWIP and ResolveRight remains -72. GetPropRight
returns32768, while QueryValue(7) and the full status ScaleRight return -32768.
Calling SetRight with1.25 FONT_EM and percentage65535 instead stores819.1875
FONT_EM. PutValue(65535,7) rejects without changing that item. Clone and native
paragraph Undo/Redo retain the stored double, unit and percentage independently.

Evidence: pinned frmitems.cxx SetRight and PutValue definitions, the unsigned16
field in include/editeng/lrspitem.hxx and initialized portable checks in
[native-right-margin-item.test.ts](../../apps/office/src/editeng/source/items/native-right-margin-item.test.ts)
and [native-paragraph-right-margin.test.ts](../../apps/office/src/sw/source/core/attr/native-paragraph-right-margin.test.ts).
Task202610101401-QJ0FFB records final source and acceptance evidence. Tests run
only the portable implementation with both ignored references absent.

Consumer order or historical API design may intentionally distinguish a
metadata-only UNO write from a value setter. These invariants remain unreviewed;
this is not a confirmed defect. Decision: preserve the setter asymmetry,
unsigned admission boundary and signed status cast. Do not rescale on member7,
clamp the percentage or reconstruct state through an inverse scaling adapter.

Additional original text-left observation:
[SvxTextLeftMarginItem::PutValue](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L1103)
uses the same metadata-only percentage contract on member6. A text-left item initialized with -72
TWIP keeps -72 after PutValue(32768,6), while GetPropLeft returns32768 and default status ScaleLeft
reports -32768. SetTextLeft accepts uint16 percentage65535 and scales the supplied double;
PutValue(65535,6) rejects. The initialized portable cases in
[native-text-left-margin-item.test.ts](../../apps/office/src/editeng/source/items/native-text-left-margin-item.test.ts)
and mutable paragraph-history cases in
[native-paragraph-text-left-margin.test.ts](../../apps/office/src/sw/source/core/attr/native-paragraph-text-left-margin.test.ts)
retain the distinction. Task202610101650-7RCNDA records this additional source observation. Consumer
order and native differential remain unverified; preserve the original stored measure, unsigned
admission and signed status metadata.

## WRITER-003: First-line default UNO query remains unsupported despite dispatcher comment

Status: suspicious default-query mismatch; pinned source switch and comment
inspected. Portable initialized cases are authored. Native dispatcher selection,
complete consumer invariants and a compiled native differential remain unverified.

Original [SvxFirstLineIndentItem::QueryValue](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/frmitems.cxx#L1323)
accepts only absolute indent member8, relative percentage9, automatic mode10
and double/unit pair13. Its default branch returns false and comments that
SfxDispatchController_Impl::StateChanged calls with hardcoded0. Unlike the
separate text-left and right classes, this switch has no member0 status case.
The declaration supplies a default member0 argument. A valid first-line item
can therefore expose its individual values while its default UNO query has
no supported result.

Initialized portable example: construct first-line -72 TWIP, enable automatic
mode and set percentage metadata32768. QueryValue(8) returns -72,
QueryValue(9) returns -32768 and QueryValue(10) returns true. QueryValue()
and QueryValue(0x80) remain unsupported; neither changes the original measure,
unit, percentage or automatic flag. The portable unsupported result is
undefined, representing native false admission rather than an invented
scalar, tuple or LeftRightMarginScale status.

Evidence: pinned frmitems.cxx switch, original default argument in
include/editeng/lrspitem.hxx and
[native-first-line-indent-item.test.ts](../../apps/office/src/editeng/source/items/native-first-line-indent-item.test.ts).
Task202610101510-P5FPXY records source and upstream-absent acceptance evidence;
tests execute only the portable implementation. Existing persistence records
are produced by the browser codec using native getters, not by changing the
native default query.

The dispatcher may avoid querying first-line items or provide an explicit
member elsewhere. Those invariants and historical intent remain unreviewed;
this is not a confirmed upstream defect. Decision: retain unsupported member0
and the original explicit native members. Do not add a status struct or keep
the old scalar/automatic tuple inside the core QueryValue contract.

## WRITER-004: Table attribute history resets only the first recorded WhichId

Baseline: LibreOffice26.8.0.2, commit
`9bc445578031fecf56086729d8e4940c77e14d65`. Source:
`sw/source/core/undo/rolbck.cxx`,
`SwHistorySetAttrSet::SetInDoc` around lines936..958.

The constructor partitions changed items into copied old values and a reset
array according to the originally present direct WhichIds. Content-node rollback
applies the old set and resets the whole array. Table-node rollback applies the
old frame set, then calls ResetFormatAttr with only the first array element.

A defined initialized table example has direct LR Which98 and UL Which99, with
both identities in the history reset partition. Rollback removes direct LR and
leaves direct UL in place. The portable acceptance preserves this literal result
in native-margin-history-boundaries.test.ts. Both items are real native pooled
format values; tests execute without either upstream reference.

This is an observation, not a confirmed upstream defect: whether original table
callers can produce more than one reset identity and whether surrounding
consumer contracts intentionally constrain the array remains unreviewed.
Decision: preserve the table first-only reset, retain the content-node complete
reset and do not normalize the two branches. Task202610101723-QH6XM1 records
source hashes and current portable acceptance evidence.

## WRITER-005: Margin admission reads legacy LR while mutation authors separate margin items

Baseline: LibreOffice26.8.0.2, commit
`9bc445578031fecf56086729d8e4940c77e14d65`. Source:
`sw/source/core/edit/edattr.cxx`, SwEditShell::IsMoveLeftMargin481..532;
`sw/source/core/doc/docfmt.cxx`, SwDoc::MoveLeftMargin1681..1755;
`sw/inc/node.hxx`, SwContentNode::GetAttr753..758;
`sw/source/core/bastyp/init.cxx`, original default LR item404.

Increase admission reads RES_LR_SPACE through the ordinary inherited attribute
getter. It resolves text-left, adds the unsigned16 default-tab distance and then
optionally snaps before comparing actual layout-frame width. Document mutation
instead copies and authors RES_MARGIN_FIRSTLINE and RES_MARGIN_TEXTLEFT, and
merges applicable list geometry. The getter directly returns GetSwAttrSet().Get;
it does not synthesize a legacy LR item from the separate paragraph margins.

A defined initialized item-profile example has inherited legacy LR text-left0
and independently authored typed text-left300. With default distance720,
admission compares720 plus5mm while unsnapped mutation authors1020. Independently
changing legacy LR changes the comparison without changing the authored typed
margin. Negative inputs also expose the source add-before-snap admission order,
which differs from the document snap-before-add mutation order.

This is not a confirmed upstream defect: original caller invariants, format
population and actual native paragraph-frame geometry remain unreviewed. The
portable frame-width accommodation cannot establish original frame admission.
Decision: preserve the literal WhichIds, independent item ownership and both
arithmetic orders; do not replace admission with a scalar prediction of mutation.
Task202610101813-PW1696 records source hashes and portable core/React/browser
acceptance. Tests execute without either upstream reference. Native frame lookup,
absence, vertical geometry and merged/redline paragraphs remain unverified.

The guard also narrows the default tab distance to unsigned 16 bits, while the
document operation retains its signed 32-bit value. A literal 65537 default
therefore becomes 1 for admission and remains 65537 for mutation; the port
keeps both contracts without normalizing them.

The native text-node and paragraph-style ranges in init.cxx155..188 include
RES_LR_SPACE through the complete frame-attribute range. The existing portable
ranges omitted this already registered item; taskPW1696 restores its membership
so the represented direct/inherited item-profile examples are admitted. Caller
population invariants and original layout-frame behavior remain unreviewed.

## WRITER-006: A zero-area rectangle contains its original point

Baseline: LibreOffice26.8.0.2, commit `9bc445578031fecf56086729d8e4940c77e14d65`.
Original [SwRect integer edges and emptiness](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/inc/swrect.hxx#L67)
return the left/top origin for zero width/height and define HasArea as both
dimensions being nonzero. Original [Contains](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/inc/swrect.hxx#L218)
compares inclusive integer edges without an area guard.

Initialized example: SwRect(7,11,0,0) has HasArea false and IsEmpty true,
but Right is7 and Bottom is11. Contains(Point(7,11)) and containment of another
zero-area rectangle at that origin both return true; Point(8,11) is outside.
Size::IsEmpty also differs from SwRect::IsEmpty for negative dimensions: Size
uses nonpositive dimensions, whereas SwRect tests zeros only.

Evidence: pinned swrect.hxx edge/Contains/HasArea definitions and literal
portable checks in [native-frame-area.test.ts](../../apps/office/src/sw/source/core/inc/native-frame-area.test.ts).
Task202610111735-R760SH checks these contracts on the portable implementation;
the tests never execute pinned upstream sources.

This is a suspicious empty-containment result, not a confirmed upstream defect.
Native consumer invariants and a compiled native differential remain unverified.
Decision: preserve zero-origin fallback, inclusive predicates and distinct size
and rectangle emptiness. Do not add an area guard or normalize negative sizes.

## WRITER-007: Absolute search normalizes typographic quotes differently by direction

Pinned `i18npool/source/search/textsearch.cxx`, `searchForward` and
`searchBackward`, tests `bSearchApostrophe && isReplacePunctuation(in_str)` in
both directions. Without a transliteration service, the forward branch replaces
only U+2019 with ASCII apostrophe. The backward branch calls
`replacePunctuation`, which maps all U+2018..U+201F quote forms. With a simple
transliteration service both directions call the complete helper.

Source-derived initialized example: searching ASCII apostrophe in the one-unit
string U+2018, with absolute algorithm and no transliteration, fails forward but
matches [1,0] backward. With IGNORE_CASE it matches in both directions. An ASCII
double quote similarly finds U+201C backward only without transliteration.
Portable tests in `i18npool/source/search/textsearch.test.ts` preserve all eight
quote forms; they do not execute the native implementation. Native consumer
invariants and a compiled differential remain unverified. Decision: retain the
original directional asymmetry, without broadening forward normalization.

## WRITER-008: Backward absolute search special-cases a lower bound at string end

Pinned `i18npool/source/search/textsearch.cxx`, `NSrchBkwrd`, assigns
`nEnd = sSearchKey.getLength()` when `endPos == searchStr.getLength()`, instead
of adding the key length to the lower bound as in the other branch.

Source-derived initialized example: source `abc`, key `b`, startPos=3 and
endPos=3 returns raw offsets [2,1], although the input interval appears empty.
The transliterated path prepares an empty string first and does not produce
this match. Normal callers may exclude this endpoint combination; that
consumer invariant and compiled native behavior remain unverified. Portable
exhaustive interval checks retain the literal source condition. Decision:
keep the backend condition; Writer range traversal must not call a text search
for an empty interval.

## WRITER-009: Search restores filtered soft-hyphen boundaries differently by direction

Pinned `sw/source/core/crsr/findtxt.cxx`, `DoSearch`, temporarily swaps the
wrapper-normalized match endpoints during backward filtered-position recovery.
The first boundary counts removed positions using `<=`; the second uses `<`.
After swapping back and exchanging point/mark, a soft hyphen exactly on a match
boundary can be included backward and excluded forward.

Source-derived examples: searching `ab` in `U+00AD ab` (without the separating
space in the actual input) yields forward point/mark [3,1], backward [0,3].
Searching `ab` in `ab U+00AD` (again with no space) yields forward [2,0], backward
[0,3]. An internal soft hyphen belongs to both matches. A one-character
U+00AD pattern disables stripping, while a multi-character literal pattern
containing U+00AD does not. These source predicates and cursor endpoints are
preserved in `sw/source/core/crsr/findtxt.test.ts`. Tests are portable source
contract checks; compiled upstream execution and complete consumer invariants
are unverified. Decision: retain the exact directional predicates and the
single-character-only literal exception.

The same predicates apply when `lcl_CleanStr` removes inline fly anchors.
With an anchor on each side of `😀a<U+00AD>b`, the key `😀ab` yields forward
point/mark [6,1] and backward [0,7] in UTF-16 coordinates. This includes both
boundary anchors in the backward result. The model regression test preserves
those endpoints. Replacement of an anchor itself still requires fly undo
history in the port.

## WRITER-010: Normal replacement history can remain consumed after redo

Pinned `sw/source/core/undo/unins.cxx`, `SwUndoReplace::Impl::UndoImpl`, clears
current hints and calls `m_pHistory->TmpRollback(rDoc, m_nSetPos, false)`.
`SwHistory::TmpRollback` increases `m_nEndDiff` for every restored entry.
In the normal no-footnote/fly/mark profile `m_nSetPos` is zero. Redo swaps this
history out while gathering an empty `DelContentIndex` history, swaps it back,
and calls `Move(0, emptyHistory)`. The inline `SwHistory::Move` in
`sw/source/core/inc/rolbck.hxx` immediately returns for an empty source and
never resets the destination's `m_nEndDiff`.

Source-derived initialized example: replace `b` in bold `abc`, undo, redo and
undo again, with no other content-index history. The first undo restores the
whole original hint. On the second undo the hint array is cleared, while
`TmpRollback` has no active entries, so the original hint is not restored.
Portable checks in `native-search-replace.test.ts` retain that consumed-end
state. They do not execute the native binary; full consumer invariants and a
compiled native differential remain unverified. Decision: do not add a
`SetTmpEnd(Count())` reset that does not exist in this source branch.

The adjacent-paragraph variant retains the same consumed end. A first undo
restores both paragraph alignments from the saved format history. After redo,
a second undo restores the boundary and text, while the newly split paragraph
can inherit the join survivor's alignment. The paragraph replacement
regression covers this extended source-derived sequence.

The same retained-history path can affect annotations outside the replaced
range. `SwHistory::CopyAttr` includes annotation hints with `bCopyFields`,
and `ClearSwpHintsArr(true)` removes them during Undo. In the portable Writer
view test, replacing the words on both sides of a ranged comment keeps the
comment through replacement, the first Undo, and Redo. A second Undo
restores the text with its annotation marker while leaving the field and
range unrestored. The pinned native code suggests the same consumed-history
path, and this result has been verified in the port.

## WRITER-011: Empty replacement can advance to the next content node

Pinned `sw/source/core/crsr/swcrsr.cxx`, `lcl_FindSelection`, compares the live
region start with the working cursor's end after a successful forward match.
When equal, it calls `fnMove.fnPos(GetPoint(), false)`. `paminit.cxx` binds
that function to `GoNextPos`; `pam.cxx` moves it to the next content node at
offset zero. This is a node move, not a one-character advance. The backward
branch uses `GoPreviousPos(GetMark(), false)`, also assigning offset zero.

Source-derived initialized example: body paragraphs `aa` and `next`, searching
`a` with an empty replacement, start-to-end and all-body scope. Deleting the
first match leaves the working end and region start at zero. The native
progress branch moves to `next`, leaving the remaining `a` in the first
paragraph. If there is no next content node, the move fails without changing
the cursor and the remaining matches can still be removed. This conditional
is preserved in `native-search-replace.test.ts`, including successful undo/redo
of the actual replacement count. Portable tests/source proof do not establish
full native UI behavior or a confirmed bug. Decision: preserve original node
movement and boundary predicates rather than silently implementing character
movement or bypassing this guard for empty replacements.

## WRITER-012: Backward wildcard preparation drops a trailing escape

Pinned `i18npool/source/search/textsearch.cxx`, `WildcardSrchBkwrd`, moves
an escape behind its following code point before negative iteration. If it is
the final code point, the branch explicitly removes it. `WildcardSrchFrwrd`
only treats the escape specially when another pattern code point follows.
Source-derived example with escape `~`: pattern `a~` matches literal `a~`
forward but matches `a` backward. In whole-selection mode, text `a` therefore
matches backward and fails forward. An escape-only pattern leaves an empty
reverse pattern, but substring setup still requests a negative iteration from
zero; the original shared iterator's debug precondition is violated. The
portable owner retains this iterator precondition rather than inventing a
match; native release behavior for that invalid request is not claimed.

Literal source-contract regressions in `textsearch-wildcard.test.ts` preserve
both branches. These are source-derived portable results, not a compiled
native differential or confirmed UI defect. Decision: do not synthesize a
literal trailing escape in backward preparation or repair the empty-pattern
setup absent an upstream change.

## WRITER-013: Disabled wildcard escape still reorders NUL backward

Pinned `i18npool/source/search/textsearch.cxx`, `WildcardSrchBkwrd`, checks
`cu == mcWildcardEscapeChar` when preparing the reversed pattern, without
the nonzero guard present in its matching loop and in `WildcardSrchFrwrd`.
With disabled escape zero, source pattern `a` + NUL + `b` remains literal
forward but is reordered to `ab` + NUL for backward traversal. It can match
that reordered string backward while failing the original literal string.

Portable source-contract checks retain this condition. The browser UI does
not yet expose this option/profile; native compiled execution and complete
consumer invariants remain unverified. Decision: preserve the missing nonzero
guard, rather than silently aligning preparation with the forward matcher.

## WRITER-014: Folded empty wildcard intervals can report zero offsets

Pinned `i18npool/source/search/textsearch.cxx`, `searchForward` and
`searchBackward`, transliterate only the requested interval. An empty interval
therefore produces empty prepared text and an empty offset sequence. The
wildcard loop can match an empty pattern or only asterisks at prepared `(0,0)`;
the caller does not map offsets back when the offset sequence is empty.
For text `ab`, a folded empty interval at source `(1,1)` can consequently
report `(0,0)`, whereas the nonfolded loop reports `(1,1)`. Folding can also
turn the nonfolded outer-boundary rejection at `(2,2)` into an empty match.

`textsearch-wildcard.test.ts` records both directions and folding states.
These observations apply to the shared engine; Writer's existing DoSearch
rejects zero-length results and the view/UI consumer is not yet implemented.
No native binary was executed. Decision: preserve original preparation and
conditional mapping instead of adding an unprovided base offset for an empty
map or an early original-text boundary rejection.

## WRITER-015: Whole-selection wildcard retry can miss overlapping matches

Pinned `i18npool/source/search/textsearch.cxx`, `WildcardSrchFrwrd`, enters
the greedy retry branch when the pattern is exhausted before the selected
string and a previous asterisk exists. It sets `nPattern = nLastAsterisk`
and continues without rewinding `nString` to the remembered suffix start.
The backward loop uses the symmetric branch. A suffix or prefix of two
characters already consumed before the retry may therefore be lost.

Source-derived example: whole-selection pattern `*aa` against `aaa` consumes
the first two characters, retries `aa` against the one remaining character,
and returns no match. Backward pattern `aa*` has the analogous result. An
independent dynamic-programming recognizer accepts both strings. The portable
bounded exhaustive check records 32 such directional false negatives across
5270 pattern/text/interval combinations (10540 directional comparisons), while
requiring all other results and every positive offset to match the independent
language recognizer. These exceptions are explicit fixed source-derived cases;
the reference recognizer is not changed to use the native rewind algorithm.

The original substring-mode QA fixtures still pass. Source proof and portable
checks do not establish a compiled native result, full service invariant or
UI defect. Decision: retain both original greedy retry branches; do not reset
`nString`, substitute a dynamic-programming matcher or add a special-case fix.

## WRITER-016: Normal replacement can delete bookmarks only when undo records

Pinned `sw/source/core/doc/DocumentContentOperationsManager.cxx`, normal
`ReplaceRangeImpl`, constructs `SwUndoReplace` only when `DoesUndo()` is true.
`SwUndoReplace::Impl` in `unins.cxx` immediately calls `DelContentIndex` with
`AllMask | Replace`, before replacing text. The ordinary collapsed bookmark
branch in `undobj.cxx` stores and deletes bookmarks at positions in the
half-open replacement range, including its start but excluding its end.
The no-recording branch has no corresponding `DelContentIndex` call and
uses `ReplaceText` directly.

Source-derived example: text `abc`, collapsed marks at offsets 0, 1 and 2,
replacing `[0,2)` with `xy`. With recording enabled, marks at 0 and 1 are
removed and restored by undo; the mark at 2 survives. With recording disabled,
equal-length `ReplaceText` leaves all three positions unchanged. The same
recording-dependent deletion can therefore occur for identical replacement
text. This follows source constructor side effects, not the search service.

Portable checks in `native-bookmark-replace-history.test.ts` retain both
states, boundary movement, actual history ownership and repeated undo/redo.
No compiled native bookmark implementation was executed and expanded/typed
marks, metadata, redlines and complete service/UI consumers remain unverified.
Decision: preserve the original constructor ownership and recording gate;
do not move bookmark deletion into the unconditional document replacement
path or silently preserve affected marks in the recording branch.

## WRITER-017: Search item construction may retain ignore-case for match-case

Pinned `svl/source/items/srchitem.cxx`, `SvxSearchItem(nId)`, initializes
`m_aSearchOpt.transliterateFlags` with `IGNORE_CASE`. After loading the
configured options, it only ORs that bit when `!aOpt.IsMatchCase()`; there is
no corresponding clear when the configured match-case value is true. The
constructor's Asian-options branch does not clear it either. In contrast,
`SvxSearchItem::Notify` calls `SetTransliterationFlags` with a new configured
`SvtSearchOptions().GetTransliterationFlags()`, whose match-case branch omits
the ignore-case bit when match-case is true.

This is source proof of different construction/notification expressions, not
a compiled native item/UI observation. Notification ordering, configuration
providers, other source consumers and complete native UI invariants remain
unverified. The current leaf implements only search value/service and public
command/member boundaries; the actual item/configuration constructor is still
pending. Decision: preserve its initialized bit and original conditional when
that owner is ported, rather than silently correcting the constructor to clear
the bit or presenting a fabricated item behavior as completed.

## WRITER-018: Ampersand replacement retains forward offsets for a backward result

Status: suspicious directional asymmetry; pinned source expressions and portable
initialized examples verified. Compiled native helper, full regex backend and
all Writer caller invariants remain unverified.

Original `utl::TextSearch::ReplaceBackReferences` in
`unotools/source/i18n/textsearch.cxx` uses `startOffset[0]` and
`endOffset[0] - startOffset[0]` directly for `&`. The `$0` through `$9` branch
instead swaps reversed capture endpoints before taking a substring. Native
`std::u16string_view::substr` converts a negative signed count to `size_t`,
therefore selecting the remainder from the original high start offset.

Initialized example: text `abcdef`, start `4`, end `1`, replacement `&|$0`.
Ampersand selects `ef`, while dollar-zero selects `bcd`, giving `ef|bcd`.
An actual portable backward search for `ab` in `x ab y` supplies start `4`,
end `2`; expansion of `&:$0` produces ` y:ab`. Forward expansion yields
`ab:ab`. The public wrapper normalizes its caller start/end outputs but retains
the raw directional `SearchResult`, as upstream does.

Evidence: original helper and `TextSearch::SearchBackward` definitions; tests in
`apps/office/src/unotools/source/i18n/textsearch-helpers.test.ts` cover raw pairs,
actual wrapper results and unchanged replacement on a throwing out-of-range
view start. No incomplete capture sequence or undefined native arithmetic is
certified. Writer consumer normalization or restrictions may prevent this
condition in some call paths and remain to be audited during integration.

Decision: preserve the exact separate ampersand and dollar-reference branches;
do not normalize ampersand or silently replace it with dollar-zero.

## WRITER-019: Forward and backward wrappers test expression count differently

Status: suspicious source-condition asymmetry; no evidence that an original
search service returns a negative expression count in normal execution.
Original `utl::TextSearch::SearchForward` in
`unotools/source/i18n/textsearch.cxx` accepts `subRegExpressions > 0`;
`SearchBackward` instead accepts any nonzero signed count.

Initialized boundary example: an injected generated `SearchResult` with count
`-2` and one valid capture is rejected forward but accepted backward. Backward
wrapper caller bounds are normalized and the negative raw count is copied.
Current represented normal/wildcard engines only return zero or one, so this
example does not assert an observed end-user defect or native backend result.

Evidence: pinned wrapper source and source-derived boundary tests in
`apps/office/src/i18npool/source/search/native-search-result.test.ts`, using a
real result/sequence value returned by a temporary test spy. Compiled native
service behavior and backend producers of negative counts remain unverified.

Decision: keep the separate exact conditions and avoid an invented common
positive-count guard. Neither the struct nor sequence owner validates that the
count equals its offset sequence lengths.

## WRITER-020: Numeric configuration lexical errors can become valid zero values

Status: source expressions and initialized portable examples verified; complete
compiled configuration-service behavior remains unverified. Original
`configmgr/source/valueparser.cxx` numeric `parseValue` overloads retain TODOs
for lexical validity. Int/long/double return success even when their underlying
numeric parser produces zero for an invalid prefix or overflow. Short only
checks the resulting signed32 range.

Examples: short text `garbage` becomes zero, hex short `0xffffffff` converts
unsigned32 to signed32 `-1` and is admitted, whereas `0xffff` is rejected as
65535. Int `4294967295` becomes zero through the bounded signed32 helper.
Long hex `0xffffffffffffffff` becomes signed64 `-1`. The unicode scalar
attribute also uses the int overload, so `oor:scalar="garbage"` becomes NUL,
which passes the original scalar whitelist. Booleans and hexBinary retain
their separate strict lexical checks.

Evidence: pinned value parser and SAL/o3tl conversion definitions; literal
expectations in `configmgr/source/valueparser.test.ts` and
`sal/rtl/byte-integer.test.ts`. Full schema constraints, service/caller
validation and native compiled outcomes remain unverified. Decision: retain
these conversions and success flags; do not add strict whole-token parsing.

## WRITER-021: Unicode control-byte accumulation can borrow a block-local byte

Status: suspected native lifetime issue from source inspection; no native
undefined-memory outcome is certified. In `ValueParser::startElement`, an
admitted control scalar creates block-local `char c` and calls
`pad_.add(&c, 1)`. Original `xmlreader::Pad::add` stores a borrowed Span when
its buffer is empty. With no prior buffered content, that borrowed byte may
outlive `c`'s block when parsing continues. The noncharacter UTF8 alternatives
use static string literals instead.

Evidence: pinned `configmgr/source/valueparser.cxx` and
`xmlreader/source/pad.cxx`. A preceding nonempty buffer can force immediate
copying, so this is conditional; actual optimized native caller lifetimes and
sanitizer reproduction remain unverified. Decision: preserve the call to
`Pad.add`, not substitute `addEphemeral`. The browser binding retains the
single-byte array through ordinary GC references; this is a stack lifetime
difference, not a claim to reproduce or repair undefined native memory.

## WRITER-022: XCS info descriptions share a buffer across ancestor nodes

Status: original control flow and initialized portable schema example verified;
complete compiled native configuration-service consumers remain unverified.
`XcsParser::characters` in `configmgr/source/xcsparser.cxx` appends all info
text to one `description_`. `endElement` drains that buffer only when closing
an ordinary or localized property, not when closing component/group info.
Ignored `desc` tags do not discard their characters while info mode is active.

Example: schema info `schema`, group info `group` and first property info
` property  one ` produce first property description
`schemagroup property one`. A following property's info is independent because
the previous property drained the buffer. Native trim only removes edge
whitespace and repeated ASCII double spaces are collapsed; an interior newline
remains. Test `retains shared description accumulation and ignored-tag character
flow` uses real Parser/ParseManager/XcsParser/Node owners and preserves this.

Decision: retain shared accumulation and the exact clearing/normalization order.
Do not reset descriptions on component/group or property begin. Intended schema
metadata inheritance, compiled behavior and UI consumer impact remain unverified.

## WRITER-023: Unknown nested info markup ends description mode early

Status: source control flow and initialized portable XML example verified;
compiled native configuration-service consumers remain unverified.
Pinned `configmgr/source/xcsparser.cxx`, `XcsParser::startElement`, accepts
arbitrary elements while `bIsParsingInfo_` is true without recording their
depth. `endElement` clears that flag on the first close event. The recognized
ignored tags, including `desc`, instead use `ignoring_` and retain info mode.

Example: `<info><extra>root</extra></info><component/>` clears info mode when
closing `extra`; closing `info` then advances the component-schema state to
component-done. The following `component` is rejected as a bad member.
The parser regression suite preserves this result through real XMLReader,
ParseManager and XcsParser owners. Plain info text and recognized `desc`
markup retain their original behavior.

Decision: retain the original depth-free info flag and close ordering. Do not
introduce nested-info depth tracking. Intended acceptance of unknown nested
markup and the effect on extension schemas remain unverified.

## WRITER-024: Failed whole-body FindAll retains its saved cursor ring member

Status: original control-flow and constructor/destructor source proof; full
compiled native Writer reproduction remains unverified.
Pinned `sw/source/core/crsr/swcrsr.cxx`, `SwCursor::FindAll`, creates
`pSav = Create(this)` in its `InSelAll` branch after selection/other-area
branches. `SwCursor::Create` constructs a point-only cursor linked to that
ring. On no match, FindAll restores the point, clears the primary mark when
the saved cursor has none, then returns before the successful-path ring
deletion. The saved cursor therefore remains linked.

`SwCursorSaveState` in `sw/inc/swcrsr.hxx` calls `RestoreState` at scope exit,
but that operation only pops `m_vSavePos`; it does not remove ring members.
For a single marked cursor on text `abc`, whole-body find-all for `z` can
return zero while leaving two unmarked cursors at the original point.
Plain single-match and selection-only branches have different control flow.
The adjacent `InOther` branch also creates `pSav` in the ring. Its unmatched
return and its successful single-match branch both leave that owner linked.
The current port keeps the cursor-level ring contract. The view's working copy
releases the saved member before exposing the single match to presentation
and before trying another search area.

Decision: retain the saved member and mark loss on this exact failed branch;
do not silently restore the previous ring shape. The normal
`SwCursorShell` destructor in `crsrsh.cxx` separately deletes every cursor in
the ring before its head, and the portable shell close must do the same.
Higher-level UI cleanup, UNO cursor overrides and the intended reason for
retaining the saved cursor remain unverified.

The preceding `InOther` branch also creates a saved point-only cursor. Its
non-all success branch copies the found result without deleting that saved
member. Initialized plain-text inserts-section cases therefore retain two
members after a successful single match. Preserve this related source
retention as well; complete other-area selection helpers, note/field services
and higher-level cleanup remain outside this observation's certification.

## WRITER-025: New transliteration module loading checks a different table index

Status: original table and control-flow source proof; compiled native service
reproduction and consumer consequences remain unverified.
Pinned `i18npool/source/transliteration/transliterationImpl.cxx`,
`TransliterationImpl::loadModuleNew` (lines 250–273), searches `TMlist[j]` for
the requested `modType[i]`. It initializes and checks the ignore/non-ignore
mask using `TMlist[i].tm`, then loads `TMlist[j].implName`. The input sequence
position and the matching table position need not agree.

For example, the initialized request sequence
`[LOWERCASE_UPPERCASE, IGNORE_CASE]` matches the uppercase conversion entry
and the ignore-case entry respectively. However, the mask checks use table
entries zero (`IGNORE_CASE`) and one (`IGNORE_WIDTH`). Both are ignore
entries, so the explicit mixed-family rejection does not run. If both native
module loads succeed, the cascade accepts both requested modules. This is a
source-derived conditional consequence, not a compiled-service test result.

Decision: preserve the original index expressions when this owner is ported;
do not replace `i` with `j` or add a new mixed-family rejection. The portable
owner and this initialization path are not implemented yet. Actual service
loading, valid consumer request restrictions and the intended compatibility
behavior remain to be established.

## WRITER-026: Partial root inclusion is omitted from an empty-path result

Status: initialized source proof; compiled native execution and consumer
reachability remain unverified.
Pinned `configmgr/source/partial.cxx`, `Partial::Partial` (lines 58–102)
and `Partial::contains` (lines 106–129), accept an included path `/` with
no exclusions. The helper and `Data::parseSegment` in `data.cxx` parse its
last segment as empty; `Data::createSegment` keeps that empty value. The
constructor therefore stays at `root_`, clears its children and sets its
`startInclude` to true.

For an empty query path vector, `contains` starts with `bIncludes = false`
and performs no descent. The final expression sees an included root leaf
but the unchanged false accumulator, returning `CONTAINS_SUBNODES`.
The adjacent source comment describes an included leaf as `CONTAINS_NODE`.
A nonempty path whose first segment is absent instead returns
`CONTAINS_NODE` through the missing-child branch. This comparison follows
the original initialized values without modifying private state.

Decision: preserve the false accumulator and both result branches when
porting `Partial`; do not initialize the accumulator from the root flag or
special-case the empty query. The portable owner is not implemented yet.
Whether XCU or another consumer actually queries this empty path, and why
the distinction exists, remain unverified; no confirmed defect is claimed.

## WRITER-027: Ordinary mark restoration can move an unmarked find result

Status: initialized generic-strategy source proof; concrete native search
consumer reachability and compiled execution remain unverified.
Pinned `sw/source/core/crsr/swcrsr.cxx`, the ordinary `SwCursor::FindAll`
branch, saves `*GetMark()` before `DoFind(*this, ...)`. If the original cursor
had a mark and the range flags equal `InBody`, a successful return restores
that saved value through `*GetMark()` without calling `SetMark()`.
`sw/inc/pam.hxx` defines an unmarked cursor's mark pointer as its point
pointer after `DeleteMark()`.

For a real cursor at point 2, mark 0 on `abc`, a generic strategy can move
the point to 1, delete its mark and return `FIND_NO_RING`. The ordinary
caller counts one result, then its restoration writes position 0 into the
aliased point. The result is an unmarked point at 0, rather than a marked
range from 0 to 1. The managed initialized strategy regression preserves
this exact result through the actual public cursor operations; it does not
substitute a TextSearch backend or inject private state.

Decision: retain direct `GetMark()` assignment and the alias effect. Do not
create a mark while transferring this ordinary result. Whether any concrete
upstream search strategy returns a successful unmarked cursor under these
conditions remains unknown, so this is a conditional contract observation,
not a confirmed user-facing defect.

## Recording future observations

Add a stable `WRITER-###` case ID, pinned source location, original condition,
concrete defined result or a clearly labelled source proof, existing acceptance
evidence, consumer uncertainty and the preservation decision. Update an entry
when stronger evidence arrives. An unusual source expression is sufficient for
an observation, not sufficient for a confirmed defect classification or an
implementation change.


## WRITER-028: RingContainer merge only rejects adjacent same-ring origins

- Upstream: `sw/inc/ring.hxx`, `RingContainer::merge`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65` (`libreoffice-26.8.0.2`).
- Observation: the comment says to check that the containers are not already merged because swapping would unmerge them. The implementation checks only `source.prev != destination` and `source != destination.prev`, then swaps the previous members’ next links and the origins’ previous links. Nonadjacent origins in the same ring pass both checks.
- Source-derived example: construct `A -> B -> C -> D -> A`, then call `A.GetRingContainer().merge(C.GetRingContainer())`. Both assertions hold (`D != C`, `A != B`); the two swaps produce `A -> B -> A` and `C -> D -> C`, rather than one merged ring.
- Preserved behavior: port both original assertions and both swaps verbatim in meaning. Do not add a full membership scan, no-op or stronger rejection. Portable tests cover the original `testIntrusiveRing` valid distinct-ring sequence, both adjacency assertions and this nonadjacent same-ring split.
- Evidence boundary: this is a direct source/portable execution observation, not a compiled native differential or proof that a Writer consumer supplies two nonadjacent origins from one ring. Native result search rings are separately allocated and merged with the editing ring. Consumer reachability and upstream intent remain unverified; this is a suspected contract issue, not a confirmed product defect.


## WRITER-029: FindSelection undo restoration is bypassed by a strategy exception

- Upstream: `sw/source/core/crsr/swcrsr.cxx`, `lcl_FindSelection`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`. The helper captures `DoesUndo()` at entry and calls `DoUndo(bDoesUndo)` only after its search loop and no-ring fallback. At 60000 replacements, RET_YES discards history and disables undo before the next `DoFind` call.
- Observation: an exception escaping that subsequent strategy call bypasses the explicit restoration. There is no local guard in this helper to restore the captured undo state on exception. The enclosing cursor save state owns cursor positions, not the captured undo flag.
- Preserved behavior: retain ordinary/threshold-cancellation restoration at the explicit normal exit. Remove the portable unconditional finally-restoration rather than introducing an exception guarantee absent from the original helper.
- Evidence boundary: an actual generic SwFindParas strategy visits 60000 existing model characters with the default SwCursor RET_YES response, then throws; the portable undo state remains disabled. This proves the generic helper exit contract and source placement, not that a concrete native text strategy throws at this exact point or that a higher native layer fails to restore state. Native consumer reachability, outer exception policy and product impact remain unverified.


## WRITER-030: Partial ignores a deep exclusion when an intermediate tree node is missing

- Upstream: `configmgr/source/partial.cxx`, `Partial::Partial`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`. Include insertion may collapse descendants; exclusion insertion only creates its final segment and stops when any intermediate segment is missing.
- Source-derived example: include `/a` and exclude `/a/b/c`. The include makes `a` an included leaf; exclusion visits `a`, cannot find `b` and stops. Consequently `contains([a,b,c])` remains CONTAINS_NODE. In contrast, excluding `/a/b` creates the excluded `b` leaf. An excluded root `/` also clears an empty-name child rather than clearing the root itself.
- Preserved behavior: keep the original missing-child break, final-child creation and empty-segment behavior. Portable tests cover both depths and the root; no ordinary path-prefix subtraction replaces the source tree algorithm.
- Evidence boundary: source and initialized portable public-constructor/contains tests, not a compiled upstream differential. Native import caller policy and concrete product reachability are unverified. The existing included-root empty-query finding remains WRITER-026.

## WRITER-031: XCU property-level partial gate skips a specifically included locale

- Upstream: `configmgr/source/xcuparser.cxx`, `handleGroupProp`, same pinned commit. The original TODO explicitly notes that the property is ignored when only localized subnodes are included: the property gate requires CONTAINS_NODE, rather than allowing CONTAINS_SUBNODES for subsequent locale filtering.
- Source-derived example: a schema localized property `/test.C/G/L`, partial include `/test.C/G/L/en`, and an update containing `<prop oor:name="L"><value xml:lang="en">new</value></prop>`. The property path reports CONTAINS_SUBNODES and the update is ignored before `handleLocpropValue` can visit `en`.
- Preserved behavior: retain the exact gate and source ignored-state path ownership. An actual XCS/Data/XMLReader/XcuParser integration test confirms no `en` child is created. This is source/portable evidence; complete native import/service/UI reachability remains unverified.

## WRITER-032: XCU metadata can mutate before a later rejection

- Upstream: `configmgr/source/xcuparser.cxx`, `handlePlainGroupProp`, `handleLocalizedGroupProp` and `handleSetNode`, same pinned commit. Plain/localized properties apply a requested finalized layer before validating a conflicting type. Existing set members apply minima to finalized/mandatory metadata before checking the member visibility layer or the previously captured finalized predicate.
- Source-derived examples: an integer property updated with finalized=true and type=xs:string retains the new finalized layer when the type check throws; a set member at layer2 can retain a newly requested finalized layer1 even though its layer2 content update is ignored by a layer1 parser.
- Preserved behavior: retain this mutation ordering, not a prevalidation or transaction wrapper. Portable tests assert both the refusal and retained metadata, using actual schema/parser/node owners. Source ordering alone does not establish an unintended product defect; native consumer intent, recovery policy and UI impact remain unverified.


## WRITER-033: Partial canonical set-element segments can mismatch XCU paths

- Upstream: `configmgr/source/partial.cxx`, its anonymous `parseSegment` helper and `Partial::contains`, same pinned commit. Construction canonicalizes a template-qualified element through `Data::createSegment(templateName,name)`, but containment compares each supplied path segment literally. The original TODO explicitly notes that recorded names need not match corresponding set-element path segments.
- Source-derived example: include `/a/T['x']`; `contains([a,T['x']])` reports CONTAINS_NODE, while `contains([a,x])` reports CONTAINS_NOT. XCU set-member path tracking appends the raw member name rather than the template-qualified representation.
- Preserved behavior: keep literal stored/query comparison and native canonicalization; do not strip qualifiers or introduce a name-normalization fallback. Public Partial tests exercise both paths and escaped element names. This is source/portable evidence; supported import caller path conventions and concrete native service reachability remain unverified.

## WRITER-034: Ignore-loop skip sentinel also removes literal U+FFFF

- Upstream: `i18npool/source/transliteration/transliteration_Ignore.cxx` and `ignoreKashida_CTL.cxx`, pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`. The generic function/table loop suppresses every mapped `0xffff`; the Kashida translator returns its input unchanged unless it is U+0640.
- Source-derived example: Kashida folding of UTF16 `a U+FFFF b` returns `ab`, although the input contains no Kashida. Literal U+FFFF collides with the deletion marker. Scalar `transliterateChar2Char(U+FFFF)` still returns that marker. Pair-map modules use a separate loop and do not impose this same filter.
- Preserved behavior: retain the exact sentinel comparison and translator identity fallback. Real module/Sequence tests assert output `ab` and original offsets `[0,2]`; no normalization or replacement-character policy is added.
- Evidence boundary: initialized source/portable UTF16 API behavior, not a compiled native differential. U+FFFF is a noncharacter; document import/input admission and concrete native UI reachability remain unverified. This is a suspected sentinel collision, not a confirmed user-visible defect.

## WRITER-035: Generic Ignore equals reports absolute offsets for nonzero starts

- Upstream: `i18npool/source/transliteration/transliteration_Ignore.cxx`, `equals`, same pinned commit. Successful prefix match outputs are `offset[nmatch-1] + 1`, with offsets initialized from each original `startPos`. The `XTransliteration.idl` description calls these outputs the number of matched code points.
- Source-derived example: compare `xـa` from position1/count2 with `a` from position0/count1 through actual Kashida ignore. Both fold to `a` and equality is true, but match outputs are3 and1. The first exceeds the requested two-unit substring because it includes the starting position.
- Preserved behavior: keep absolute source-offset-plus-one assignment and zero output when no folded unit matches. Do not subtract start positions or replace the original UTF16-unit counts with a codepoint iterator. Actual module tests assert equality and `[3,1]` outputs.
- Evidence boundary: source/portable contract and IDL-description discrepancy; complete native caller expectations and any UI effect remain unverified. The separate caseignore compare keeps its own relative iterator counters.

## WRITER-036: Caseignore comparison can discard a pending final folding expansion

- Upstream: `i18npool/source/transliteration/transliteration_caseignore.cxx`, `compare`, and `i18nutil/source/utility/casefolding.cxx`, `getNextChar`, same pinned commit. Compare's NOT_END predicates allow iteration while a MappingElement has pending output. However, `getNextChar` checks consumed input length first and resets the element/returns zero before draining pending expansion units at the end.
- Source-derived examples after loading IGNORE_CASE: string folding of final `ß` produces `ss`, while compare/equals of `ß` versus `ss` returns -1/false and match counters `[0,1]`. Reversing the inputs returns1 and `[1,0]`. The nonterminal expansion `ßx` versus `ssx` compares equal, and `ß` versus itself compares equal because both iterators hit the same terminal reset.
- Preserved behavior: keep the original NOT_END expressions, input-first iterator guard, decrement-before-mismatch and sign/match outputs. Do not replace compare with comparison of pre-folded strings or drain the expansion before the source guard.
- Evidence boundary: actual portable Caseignore/MappingElement/getNextChar/module/Sequence tests and pinned source placement, not a compiled complete UNO service differential. Aggregate-service/native caller reachability and product impact remain unverified.

### WRITER037 — Diacritic folding composes differently depending on offset output

- Source: `i18npool/source/transliteration/ignoreDiacritics_CTL.cxx`, `ignoreDiacritics_CTL::foldingImpl`, pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: with `pOffset`, the complete `NFD; [:M:] Remove; NFC` chain runs separately for each source codepoint. Without offsets, it runs once on the requested whole substring. Thus `가` (U+1100 U+1161) remains two Jamo with offsets `[0,1]`, while the no-offset result is `가` (U+AC00). The difference persists without any marks to remove.
- Preservation: keep both call scopes; do not normalize the joined offset-mode result. Portable actual-module tests and Chromium observations preserve this distinction. Native service/consumer reachability and intended API equivalence remain unverified; this is not a claimed UI defect.

### WRITER038 — Offset-mode diacritic folding reads a full surrogate pair beyond the requested unit count

- Source: the same `foldingImpl` calls `rInStr.iterateCodePoints(&nIndex)` on the entire original string, bounded only by `nPosition < nStartPos+nCount` before each step.
- Observation: for `x😀z`, start `1`, count `1`, offset mode returns the whole `😀` and two offsets `[1,1]`. The no-offset ICU substring call receives only the high surrogate and retains that lone UTF16 unit. Starting at the low surrogate retains it separately. This can make offset-mode output include one source unit outside the nominal request.
- Preservation: use the actual complete-string OUString/rtl/o3tl iterator rather than clipping its view to the requested range. Tests cover bisected and malformed UTF16. Whether production callers can request a bisected range is unverified; no native process differential or user-facing defect is claimed.

### WRITER039 — largeToSmall uses a small-to-large table

- Source: `i18npool/source/transliteration/largeToSmall_ja_JP.cxx`, `large2small`, pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: all31 active rows have the same key/value direction as `small2large` in `smallToLarge_ja_JP.cxx`: for example U+3041 maps to U+3042,while U+3042 remains unchanged. Consequently the reverse helper used by `ignoreSize_ja_JP::transliterateRange` can produce the same endpoints as the forward helper.
- Preservation: retain table direction and the resulting two-string range instead of synthesizing an inverse. Complete BMP source-table fingerprints and actual logical-module tests preserve this behavior. Native factory/UI reachability remains unverified.

### WRITER040 — half-to-full width offsets lose the original nonzero start

- Source: `i18npool/source/transliteration/halfwidthToFullwidth.cxx`, all three `transliterateImpl` variants.
- Observation: one-to-one mapping first copies the requested source fragment with no offsets;composition then runs on that local string at start zero. For `xxAｶﾞ`,start2,count3,the normal result is `Ａガ` with offsets `[0,2]`,rather than absolute `[2,4]`. The kana-only and JIS variants have the same reset.
- Preservation: keep the two-stage call and local positions;do not add the original start in the directional module. The aggregate's own substring-copy/offset adjustment remains separate unported integration. Tests use nonzero source starts and second-unit contraction offsets;no UI defect is claimed.

### WRITER041 — full-to-half scalar conversion throws for literal U+FFFF

- Source: `i18npool/source/transliteration/fullwidthToHalfwidth.cxx`,all three `transliterateChar2Char` variants;`i18nutil/source/utility/widthfolding.cxx`,scalar decomposition helper.
- Observation: the helper returns U+FFFF both for a decomposable Katakana unit and for an unchanged literal U+FFFF input. Each width module throws `MultipleCharsOutputException` whenever that value is returned,including the literal noncharacter. String conversion keeps literal U+FFFF as an unchanged unit.
- Preservation: keep the sentinel guard and source exception rather than testing only decomposition-table membership. Scalar and string tests distinguish the calls;native consumer reachability remains unverified.

### WRITER042 — traditional Kanji folding maps U+FEFF to U+4E9C

- Source: `i18npool/source/transliteration/ignoreTraditionalKanji_ja_JP.cxx`,last active `traditionalKanji2updateKanji` entry.
- Observation: the table explicitly maps U+FEFF (BOM/zero-width no-break space) to the ideograph U+4E9C `亜`. It is not a commented-out row or an input-decoding BOM rule.
- Preservation: retain the active table row and its BMP projection. Tests separately ensure the nearby commented-out U+5B9D-to-U+73CD entry is absent. Native import/search reachability and intended behavior are unverified;no product defect is claimed.

### WRITER043 — kana conversion exchanges the YORI and KOTO digraphs

- Source: `i18npool/source/transliteration/hiraganaToKatakana.cxx`, `toKatakana`,and `katakanaToHiragana.cxx`, `toHiragana`;the inclusive U+309D..U+309F/U+30FD..U+30FF ranges use a constant U+0060 shift.
- Observation: U+309F is HIRAGANA DIGRAPH YORI,with compatibility decomposition U+3088 U+308A,whereas U+30FF is KATAKANA DIGRAPH KOTO,with decomposition U+30B3 U+30C8. The arithmetic therefore maps `ゟ` to `ヿ` and vice versa despite their different text/readings. Names and decompositions are confirmed by the authorized ICU78.3 Unicode17 `UnicodeData.txt` reference.
- Preservation: retain both complete source intervals and the resulting ignoreKana mapping;do not special-case or decompose the digraphs. Tests cover every point in both intervals,including both digraphs. Native aggregate/UI reachability and intent remain unverified;this is a suspected semantic issue rather than a claimed product defect.

### WRITER044 — prolonged-sound folding can insert U+0000

- Source: `i18npool/source/transliteration/ignoreProlongedSoundMark_ja_JP.cxx`, `table_normalwidth`, `table_halfwidth` and `foldingImpl`,pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: a prolonged mark following a unit within either table range is replaced unconditionally by that row,including zero entries. `ンー` therefore folds to `ン` plus U+0000,with native logical length2 and offsets `[0,1]`. A later mark sees the already-transformed zero;`ンーー` becomes `ン`,U+0000,`ー`. Halfwidth `ﾝ` lies outside its table range,while halfwidth `ｰ` lies inside a zero row,so related chains differ by width.
- Preservation: retain zero rows,range limits,transformed previous state and explicit string length. Do not delete the zero or replace the mark by an inferred vowel/identity. Actual module tests preserve embedded-NUL results. Native aggregate/UI reachability and whether zero denotes an intended unmapped entry remain unverified.

### WRITER045 — aggregate loadModuleNew chooses its mask using input position

- Source: `i18npool/source/transliteration/transliterationImpl.cxx`, `TransliterationImpl::loadModuleNew`.
- Observation: the inner loop finds a requested enum in `TMlist[j]` and loads its implementation,but the mask initialization and subsequent ignore/non-ignore checks consult `TMlist[i]`,where `i` is the request's position. The first catalog entries are ignore modules,so a short request such as `[UPPERCASE_LOWERCASE,IGNORE_CASE]` is checked against those entries rather than the matched module categories. This appears inconsistent with the nearby exception comment prohibiting mixed ignore/non-ignore modules.
- Preservation requirement: when porting this aggregate,retain the original indices/branch order until upstream changes. The aggregate is currently unported;this finding comes from source inspection and is not a claim that a native process,portable aggregate or UI scenario has reproduced the issue. No substitute loader or corrective mask policy is introduced by the catalog work.

### WRITER046 — ruler sticky rounding adds a half tick before rounding

- Source: `svx/source/dialog/svxruler.cxx`, `SvxRuler::MakePositionSticky`, pinned LibreOffice `9bc445578031fecf56086729d8e4940c77e14d65`.
- Observation: after translating the reference point and converting pixels to the selected logical map, the method evaluates `rtl::math::round((aPositionLogic + aHalfTick) / aTick) * aTick`. With frame-margin snapping disabled and a positive tick interval, an exact zero logical position therefore produces one tick in this arithmetic; an exact positive tick also advances. This differs from ordinary nearest-grid rounding and appears asymmetric around zero. Device conversion and caller behavior may constrain its observable effect.
- Preservation requirement: retain the half-tick addition and native rounding/order when this complete method is ported. The current browser paragraph/tab gesture projection still uses its existing nearest-grid policy with the actual native unit interval; full `MakePositionSticky`, frame-margin attraction and device conversion are not claimed by task XBHM4Z. This is a source-inspection finding, not a reproduced native UI defect, and no corrective native policy is introduced.


### WRITER047 — combined paragraph indent slot reapplies percentage scaling

- Source: pinned `sw/source/uibase/shells/textsh1.cxx`, `SwTextShell::Execute`, `SID_ATTR_PARA_LRSPACE` direct-item branch; `sw/source/uibase/shells/txtattr.cxx`, `SwTextShell::GetAttrState`, combined indent state; `editeng/source/items/frmitems.cxx`, `SetTextLeft`, `SetRight`, `SetTextFirstLineOffset` for combined and split items.
- Observation: Execute copies each already-scaled measure from the combined item into a split Writer attribute using the original percentage again. GetAttrState copies the split measure back into a combined item with that percentage yet again. For a combined item initialized from1200 twips at75 percent, the item contains900;Execute stores675 in the text-left attribute;state reconstruction stores506.25,which resolves to506 twips. Corresponding900-at125 right spacing goes1125 →1406.25 →1757.8125,while-400-at50 first-line offset goes-200 →-100 →-50. The automatic-first flag is copied independently.
- Preservation: retain the literal source setter/getter sequence and percentages,without inverse scaling or replacement setters. Independent frame/slot tests assert the literal attribute and state values,including Undo/Redo and independent returned items. Normal sidebar edits create fresh items with100-percent defaults,as in ModifyIndentHdl_Impl. This finding is based on source inspection and the portable implementation;native application reproduction and intent remain unverified.

### WRITER048 — table sidebar From left resets the frame width

- Source: pinned `sw/source/uibase/shells/tabsh.cxx`, `SwTableShell::Execute`, `SID_ATTR_TABLE_ALIGNMENT`; `sw/sdi/swriter.sdi`, `TableAlignment`; `sw/source/uibase/sidebar/TableEditPanel.cxx`, `AlignmentModify`.
- Observation: the LEFT_AND_WIDTH branch says “width doesn't change” but retains `nWidth = nSpace` initialized before the switch and publishes that width. The old frame width is never read. The SDI declares SfxUInt32Item for this slot, while Execute and the sidebar explicitly exchange SfxUInt16Item. These may be intentional internal conventions; native UI reproduction and intent remain unverified.
- Preservation: retain the full available width in LEFT_AND_WIDTH and the actual UInt16 handler/sidebar transport. Do not infer the existing frame width or change the typed request to UInt32. Portable slot/history/ODT regressions assert the literal behavior.

### WRITER049 — single-column width uses the right coordinate

- Source: pinned `sw/source/uibase/table/tablemgr.cxx`, `SwTableFUNC::GetColWidth`, zero-separator branch.
- Observation: multi-column widths subtract the left edge, while the single-column case returns `m_aCols.GetRight()` directly. A table with left=100 and right=6100 therefore reports6100 rather than6000. Native callers or geometry conventions may constrain this asymmetry; native UI reproduction and intent remain unverified.
- Preservation: retain GetRight without subtracting GetLeft. The consumed native manager regression uses nonzero-left geometry and checks the literal6100 result, plus the native SetColWidth right-maximum cap.

### WRITER050 — row-height average accumulates into a signed 32-bit total

- Source: pinned `sw/source/core/docnode/ndtbl1.cxx`, `SwDoc::BalanceRowHeight`; `include/tools/long.hxx`.
- Observation: each frame height uses `tools::Long`, but `nTotalHeight` is `sal_Int32`. In optimize mode the total is divided by `aRowArr.size()`. On the 64-bit reference profile a wrapped negative total is promoted to unsigned `size_t` for that division, producing a very large positive minimum height. Two literal heights of1073741824 yield a total of-2147483648 and an unsigned quotient of9223372035781033984. Physical layout limits may keep ordinary documents away from this boundary; native UI reproduction and intent remain unverified.
- Preservation: retain signed32 accumulation and unsigned64 division in the portable core. Independent actual-frame/document tests check the boundary before applying the original row-size item. Do not silently widen the accumulator or replace the source average with a safer arithmetic mean.

### WRITER051 — optimal row height appends history in both passes

- Source: pinned `sw/source/uibase/shells/tabsh.cxx`, `FN_TABLE_OPTIMAL_HEIGHT`; `sw/source/core/frmedt/fetab.cxx`, `SwFEShell::BalanceRowHeight`; `sw/source/core/docnode/ndtbl1.cxx`, `SwDoc::BalanceRowHeight`.
- Observation: the slot invokes optimize mode and then normal mode. Each document invocation appends `SwUndoAttrTable`, including an unchanged second-pass item, and the inspected slot/shell path contains no enclosing undo group. This can leave a first Undo with no visible height change when both passes choose the same item. Additional native dispatch context could affect the user-facing history; native application reproduction remains unverified.
- Preservation: keep both source document actions and the intervening layout completion. Tests assert their actual item states and original cursor/row owners across both Undo and Redo steps; do not merge or suppress the second action merely because its numeric height is unchanged.


### WRITER052 — only-text attribute queries distinguish a full default hint from adjacent default hints

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `sw/source/core/txtnode/thints.cxx`, `SwTextNode::GetParaAttr`, `bOnlyTextAttr` partial-hint accumulation and final `aFormatSet.Get(nWh)` comparison.
- Observation: a single full-cover explicit `STRIKEOUT_NONE` hint is merged into the format set and returned as SET. With two contiguous equal NONE hints covering the same query, `bOnlyTextAttr=true` records the partial candidates, but the final candidate equals the empty format set's pool default and is suppressed; the result remains DEFAULT. Therefore equivalent effective values can expose different explicitness depending on stored hint boundaries. Whether a native producer retains this exact adjacent-hint shape, and whether this difference is intended by callers, remain unverified.
- Preservation: keep both the `bOnlyTextAttr` admission and final default comparison. Actual native-owner portable tests assert both outcomes without normalizing the hint maps or changing the query algorithm. This is source/portable state evidence, not compiled native application reproduction or a confirmed product defect.

### WRITER053 — text-position empty tokens are converted rather than rejected

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `xmloff/source/core/xmluconv.cxx`, `SvXMLTokenEnumerator::getNextToken`; `sax/source/tools/converter.cxx`, `lcl_parseMeasure`, `lcl_convertMeasure`, `Converter::convertPercent`; `xmloff/source/style/escphdl.cxx`, both escapement handlers.
- Observation: original ASCII-space token enumeration preserves empty tokens, and percent parsing permits an empty numeric part. Consequently an empty position becomes signed16 zero, while `super ` or `super  75%` gives signed8 height zero instead of the one-token default58; later tokens are ignored. The later native `SvxEscapementItem::PutValue(MID_ESC_HEIGHT)` rejects zero, so the XML handler result and the accepted item state are distinct. This is surprising lexical behavior, not a confirmed native application defect; native file-producer reachability and caller intent remain unverified.
- Preservation: retain exact empty tokens, decimal rounding, signed narrowing and independent original item validation. Portable tests use the actual shared Any, converter, handlers, SAX attributes and Writer items; no whitespace normalization or stricter XML grammar is substituted.

### WRITER054 — manual page-size recognition does not normalize landscape dimensions

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `cui/source/tabpages/page.cxx`, `SvxPageDescPage::Reset` and `PaperSizeModify_Impl`; `editeng/source/items/paperinf.cxx`, `SvxPaperInfo::GetSvxPaper`; `svx/source/dialog/papersizelistbox.cxx`, `set_active_id`.
- Observation: Reset swaps an oriented page size back before matching its paper identity. The manual-size handler instead derives the landscape radio state from width greater than height and sends the unswapped physical size to the nonrotating `GetSvxPaper`. An unchanged landscape A4 size can therefore select USER after a manual metric event while Reset recognizes A4. If a rotated size matches another original paper, that identity is used before list fallback (for example Tabloid versus Ledger). Native producer/widget event reachability and whether this is intentional remain unverified; this is source and portable-owner evidence, not a native application reproduction.
- Preservation: keep orientation-sensitive matching and the actual list USER fallback. Tests distinguish Reset, manual modification, explicit known-paper selection and USER-preserving orientation changes; no automatic portrait normalization is inserted in the manual branch.

### WRITER055 — manual dimensions can be ignored when the known paper identity stays unchanged

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `cui/source/tabpages/page.cxx`, `PaperSizeModify_Impl` and the known-paper branch of `FillItemSet`.
- Observation: manual dimensions are recognized through sloppy fitting. If the resulting known paper ID and orientation equal their saved values, the known-paper export branch does not inspect changed width/height controls. A near-A4 manual width can remain visible in the preview while no page-size item is emitted. Reset also snaps known sizes in the controls without necessarily writing them back on an unchanged acceptance. Native widget precision/event reachability and intended editing semantics remain unverified; portable integer-twip tests are not a compiled native reproduction.
- Preservation: distinguish preview geometry from accepted item values. USER checks paper, both dimensions and orientation; known formats check paper/orientation and emit the canonical paper size. Keep the original physical item when no eligible change exists.

### WRITER056 — changed page margins narrow to uint16 despite large configured paper limits

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `cui/source/tabpages/page.cxx`, `FillItemSet` left/right/top/bottom assignments; `officecfg/registry/schema/org/openoffice/Office/Common.xcs`, Drawinglayer maximum-paper defaults.
- Observation: the page dialog supports large physical dimensions, but changed margin values pass through `static_cast<sal_uInt16>(GetCoreValue(...))` before entering LR/UL items. In Writer's twip profile, an accepted changed margin100000 becomes34464. Unchanged old items bypass this cast and retain their previous value. Whether this narrowing is intentional and whether a particular native metric-widget/configuration combination reaches it remain unverified; no compiled native UI defect is claimed.
- Preservation: apply the source uint16 narrowing only to margins changed from the saved control values, retain untouched original fields, and test both paths with actual original geometry and source handler owners.

### WRITER057 — activating an empty font-size entry can dispatch zero despite the regular 2pt minimum

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `svtools/source/control/ctrlbox.cxx`, `FontSizeBox::get_value`; `svx/source/tbxctrls/tbunocontroller.cxx`, `SvxFontSizeBox_Base::Select` and `ActivateHdl`; `editeng/source/items/textitem.cxx`, `SvxFontHeightItem::PutValue`, `MID_FONTHEIGHT`.
- Observation: the absolute font-size getter initializes its result to zero and clamps to20..9999 tenths of a point only for nonempty entry text. Entry activation dispatches the result divided by10 as a float. An empty entry therefore dispatches0pt, which the font-height item accepts because its lower-bound check rejects negative values rather than zero. Invalid nonempty text instead becomes the regular2pt minimum. Native combo event order and application-level reachability remain unverified; source, portable owner and React event evidence do not constitute a compiled native UI reproduction.
- Preservation: retain the empty/nonempty distinction, original float dispatch and independent native item admission. Test actual numeric/controller owners, editable browser activation and native Writer all-script item state without substituting a preset or introducing a positive-only kernel guard.

### WRITER058 — Writer font shrinking can wrap below the regular minimum

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `sw/source/uibase/shells/txtattr.cxx`, Grow/Shrink branches of `ExecCharAttr` and `GetAttrState`.
- Observation: the enabled state disables Shrink only at exactly40twips. Execution subtracts40 from an unsigned32 height before comparing the result with40. A height below40 therefore wraps; zero becomes4294967256. Grow likewise performs unsigned addition before its upper-limit comparison. Native dialog/event/item producer reachability and intended behavior remain unverified; this is initialized source arithmetic and portable original-owner evidence rather than a compiled native application defect.
- Preservation: retain original unsigned32 arithmetic and equality-based disabled states. Do not replace subtraction with pre-clamping or saturating arithmetic. Tests distinguish regular limits, zero-height admission and the wrapped native item result.

### WRITER059 — mixed font contributions do not automatically include uncovered defaults

- Source: pinned commit `9bc445578031fecf56086729d8e4940c77e14d65`, `sw/source/core/edit/edattr.cxx`, `SwEditShell::GetItemWithPaM`; `sw/source/uibase/shells/txtattr.cxx`, mixed/table Grow/Shrink branch.
- Observation: the traversal emits a whole-node contribution only when the node has a direct attribute set, followed by matching automatic/style-hint contributions. Its default branch tests the last visited item pointer: a nonempty set without the requested Which leaves that pointer non-null and emits no default. An empty set can instead emit a null user-default contribution. Thus uncovered inherited/default text is not unconditionally represented, and contributions can overlap rather than form a disjoint partition. Native producer allocation/style/layout conditions and intended editing semantics remain unverified; this is source and initialized portable-state evidence, not a compiled native UI defect.
- Preservation: keep source contribution order, overlap, clipping, null admission and nonmatching-item suppression. Do not fill missing runs, synthesize pool defaults or normalize the contribution vector into effective font runs. Tests inspect actual original item/range owners and grouped edits.

### WRITER060 — line-spacing popup dimensional values narrow before item assignment

- Source: pinned `svx/source/sidebar/paragraph/ParaLineSpacingControl.cxx`, `ExecuteLineSpace` and `SetLineSpace`; `paralinespacingcontrol.ui` metric range; `include/editeng/lspcitem.hxx` signed additive spacing.
- Observation: the popup reads dimensional values in the module core unit and casts them to `sal_uInt16` before assigning minimum, fixed or leading spacing. The leading item then stores signed16. In Writer's twip profile, an admitted100cm becomes56693twips, which leading stores as-8843. Larger minimum/fixed values also wrap modulo65536. The resource's large upper bound does not itself constrain the dimensional value to the item domain. Native platform-widget reachability and the intended application behavior remain unverified; this is source/portable evidence, not a compiled native application defect claim.
- Preservation: keep the original uint16 narrowing and signed leading setter, together with source numeric ranges and unit conversion. Do not silently cap physical values or widen the item. Portable popup/item tests assert the exact behavior.

### WRITER061 — a partial tab-page disable mask disables its entire group

- Source: pinned `cui/source/tabpages/tabstpge.cxx`, `SvxTabulatorTabPage::DisableControls`; `include/svx/flagsdef.hxx` masks.
- Observation: after disabling individual controls, the page disables the entire Type or Fill frame whenever any bit of the corresponding mask is present. A TypeLeft flag therefore also disables interaction with the other type radios through their parent frame. Whether this is the intended caller convention is unverified; no compiled GUI defect is claimed.
- Preservation: retain any-bit mask tests and both individual and parent sensitivity. Do not replace them with an all-bits equality check.

### WRITER062 — Delete All can retain hidden current-tab fields after resetting radios

- Source: pinned `cui/source/tabpages/tabstpge.cxx`, `DelAllHdl_Impl`, empty `InitTabPos_Impl` branch, `NewHdl_Impl`; `include/vcl/weld/Toggleable.hxx` notification suppression.
- Observation: Delete All constructs default stops and strips them from the list. The empty path sets Left/No Fill radios but retains `aCurrentTab`, decimal/fill text and entry sensitivity. Programmatic radio assignments suppress user handlers. A later new Left tab can retain the prior custom filler despite No Fill being selected. Native GUI event reachability and intended behavior remain unverified.
- Preservation: keep the source current-tab retention, radio assignment and handler ordering; portable controller tests assert the literal result.

### WRITER063 — matching a displayed tab position can store its offset as a real position

- Source: pinned `cui/source/tabpages/tabstpge.cxx`, `InitTabPos_Impl`, `ModifyHdl_Impl`, `NewHdl_Impl` and type/fill replacement handlers.
- Observation: list rows include the input left-border offset. New subtracts that offset, but Modify assigns the displayed `GetCurrentValue()` directly to `aCurrentTab.GetTabPos()`. A subsequent type/fill replacement can therefore store the offset-inclusive value. A720twip tab with360twip offset displays1.91cm after field rounding and this handler sequence stores1083twips. Exact native platform signal routing remains unverified; this is source/portable handler evidence.
- Preservation: retain the distinct New and Modify assignments and original field rounding; do not apply an inferred inverse offset in Modify.

- Additional portable consequence: with original Writer1440twip indent offset and explicit tabs1440/2880twips, selecting the first displayed5.08cm value through Modify and changing its type moves it to the second tab's internal position. `SvxTabStopItem::Insert` replaces that equal position, so two visible rows can correspond to one actual item. Deleting the first row then leaves one visible row and no actual tab. This initialized source sequence is tested without mutating a widget/provider facade; native GUI reachability remains unverified.

### WRITER064 — non-mm100 tab-page Reset does not copy independent default-distance metadata

- Source: pinned `cui/source/tabpages/tabstpge.cxx`, constructor, `Reset` and `FillItemSet`; `editeng/source/items/paraitem.cxx`, `SvxTabStopItem` constructors/equality.
- Observation: the non-mm100 Reset branch clones input only into a temporary, clears the page-owned item and copies individual converted stops. Its independent default-distance field remains the page constructor's zero. An input item with a nonzero default-distance field can consequently compare different on acceptance even when visible positions stay unchanged. Native caller intent and GUI impact are unverified.
- Preservation: keep metadata zero in this branch and the original full-item comparison. Do not copy the field merely to make unchanged acceptance appear cleaner.

### WRITER065 — Tab-page exchange inserts an internal default zero without rebuilding visible row indices

Pinned `cui/source/tabpages/tabstpge.cxx` `FillItemSet` inserts a Default tab at zero into `aNewTabs` for a negative first-line indent in a non-mm100 pool. The displayed list is not rebuilt. A later `SelectHdl_Impl` still indexes `aNewTabs` using the displayed row index. With a single Decimal stop, exchange followed by activation of its still-visible row loads the internal Default-zero stop; `SetFillAndTabType_Impl` leaves the previous type radio but disables the decimal field. The portable source test reproduces this actual item/lifecycle sequence. Preserve it; this is a suspected contract issue, not a compiled native GUI confirmation.

### WRITER066 — tab deletion retains a trailing empty-list branch dominated by an earlier return

- Source: pinned `cui/source/tabpages/tabstpge.cxx`, `SvxTabulatorTabPage::DelHdl_Impl`.
- Observation: a missing row returns immediately; a list of exactly one row delegates to Delete All and returns. The remaining branch therefore begins with at least two rows. It removes one displayed row; subsequent native item removal and current-row assignment do not remove another displayed row. Consequently its trailing `get_count() == 0` block cannot execute under the original non-reentrant page handler contract. The browser's focus-without-select projection is only called by that block. This is a source control-flow proof; compiled/native reentrancy or corrupt-widget behavior is not claimed.
- Preservation: retain the original empty-list block, flags and focus operation. Do not delete it or infer normal UI reachability from coverage. Explicitly named synthetic-only tests, requested by the user, deliberately violate the displayed-list removal invariant and separately invoke the actual browser callback with false to pin the preserved branch bodies. These executions cover the isolated contracts and do not invalidate the source control-flow proof. The actual offset-collision state from WRITER063 is separately tested and still leaves a displayed row after deletion.

### WRITER067 — new-style validation precedes leading-space removal

- Source: pinned `sfx2/source/dialog/newstyle.cxx`, `SfxNewStyleDlg::OKClickHdl` and `ModifyHdl`; `include/sfx2/newstyle.hxx`, `GetName`.
- Observation: collision/protected-builtin lookup uses the exact raw entry. `GetName` subsequently strips leading ASCII spaces. Thus an entry such as ` Heading 1` bypasses the exact builtin-name guard and delivers `Heading 1` to Writer. Whitespace-only validation removes ASCII spaces only; tabs and other whitespace remain accepted. Preserve this order rather than silently normalizing before validation. Independent dialog tests pin the contracts; this is a source-derived finding, not native GUI confirmation.

### WRITER068 — NewByExample records creation history even for an existing style

- Source: pinned `sw/source/uibase/app/docst.cxx`, `SwDocShell::MakeByExample`; `sw/source/core/undo/SwUndoFmt.cxx`, `SwUndoFormatCreate::UndoImpl` and `SwUndoTextFormatCollCreate::Delete`.
- Observation: `Find` may return an existing paragraph style, including a user style accepted after overwrite confirmation. After filling it and changing its parent, `MakeByExample` still appends `SwUndoTextFormatCollCreate`. Undo of that separate history entry deletes the style by name, rather than restoring an overwritten style definition. Keep the original history shape. The browser's bounded single-default representation still protects its document root; complete hidden native default/style-table parity is not claimed.

### WRITER069 — FontCharMap counting below its first endpoint can return a negative population

- Source: pinned `vcl/source/font/fontcharmap.cxx`, `FontCharMap::findRangeIndex` and `CountCharsInRange`.
- Observation: the binary search returns endpoint zero for characters below the first range. `CountCharsInRange` does not clamp its upper bound to the first character before subtracting the remainder of that range. For actual ranges `[32,35),[80,82)`, the inclusive interval `[0,10]` consequently returns `-21`, although it contains no represented characters. Preserve the arithmetic. The portable source test pins this boundary result; no native GUI path to that interval is claimed. Separately, negative population indices are caller-contract violations: `GetCharFromIndex(-1)` follows original unsigned arithmetic rather than the out-of-bounds-at-end fallback. Synthetic-only tests pin that operation without claiming real dropdown reachability.

### WRITER070 — OutputDevice HasGlyphs tests UTF16 units rather than Unicode scalar values

- Source: pinned `vcl/source/outdev/font.cxx`, `OutputDevice::HasGlyphs`; `vcl/source/font/PhysicalFontFace.cxx`, `GetFontCharMap`.
- Observation: the physical face collects Unicode codepoint ranges, but `HasGlyphs` passes individual `rStr[i]` UTF16 units to `FontCharMap::HasChar` and increments the offset by one. A charmap containing U+1F600 therefore still fails a text containing its surrogate pair unless the map also advertises the surrogate code units themselves. Keep the source loop and its returned UTF16 failure offsets, including the empty-string initial-index return. This is a source-derived contract finding, not a compiled native rendering result. It matters to font-name/sample eligibility; it does not imply that the browser text renderer cannot paint the actual character.

### WRITER071 — sampletext retains a final codepage test whose false edge is dominated by the CJK mask

- Source: pinned `svtools/source/misc/sampletext.cxx`, internal `getScript`.
- Observation: the codepage mask contains only CP932, CP936, CP949, CP950 and CP1361. CP1361 is subsequently folded into CP949 and cleared. In the `count() == 1` branch, unsuccessful CP932, CP949 and CP936 tests therefore entail CP950. The final CP950 test's false edge cannot execute with a consistent native bitset. Preserve the original conditional and subsequent Han fallback. This is a source invariant proof, not a claim of a functional native bug. In accordance with the user's request to pin preserved unreachable bodies, an explicitly synthetic-only test temporarily violates the copied Set's membership consistency. It covers the retained false edge but proves no physical font, installed-font capability or real dropdown reachability; production capability data is never altered this way.

### WRITER072 — font-name fallback can replace a full script sample with a minimal one

- Source: pinned `svtools/source/control/ctrlbox.cxx`, `DrawPreview`.
- Observation: when a font cannot render its own family name and its advertised-script sample is empty, the first fallback loop searches full samples and stops at the first supported script. The following Hebrew/Greek minimal-sample loop is not guarded by another empty-sample check. It can therefore replace that already chosen full sample. A Latin-named face whose actual map supports the Arabic full sample and Greek `ΑΒ`, with no usable advertised-script classification, ends with `ΑΒ`. Preserve both loops and this overwrite order. The deterministic device/map test pins the source decision; it does not claim an installed font or compiled native GUI reproduction.

### WRITER073 — style preview script boundaries are sampled through preceding-character cursor semantics

- Source: pinned `svx/source/tbxctrls/tbcontrl.cxx`, `CheckScript`; `editeng/source/editeng/editeng.cxx`, `EditEngine::GetScriptType`; `editeng/source/editeng/impedit2.cxx`, `ImpEditEngine::GetItemScriptType`.
- Observation: `CheckScript` samples collapsed selections at UTF16 positions zero through text length and stores a change at the current position before assigning the new script. The collapsed-selection owner uses the preceding character at nonzero positions, while position zero uses the next character. Given plain strong-script runs Latin `[0,1)` and Asian `[1,2)` for `A字`, the sampled script sequence is Latin, Latin, Asian. The loop emits only a Latin segment ending at two; the final Asian assignment has no following iteration. In longer mixed names this can put the first character of a new script in the preceding preview-font segment. This is a source-level inference conditional on those scanner runs, not a compiled native scanner or GUI observation. Complex direction, hints and weak-character resolution remain the scanner's responsibility.
- Preservation: when implementing the actual style-preview script path, retain the collapsed-selection owner and original `CheckScript` positions and emission order. Do not silently replace this with ordinary Unicode script-run boundaries to make mixed-script preview look more intuitive. The actual EditEngine script/direction scanner and production preview caller are still unported at this checkpoint.

### WRITER074 — short OS/2 coverage reads reuse the previous successfully read word

- Source: pinned `vcl/source/font/PhysicalFontFace.cxx`, `GetFontCapabilities` and `appendBitset`; `tools/source/stream/stream.cxx`, `SvStream::ReadNumber`/`ReadUInt32`; `vcl/inc/font/TrueTypeFont.hxx`, coverage offsets 42 and 78.
- Observation: the capability reader appends its output variable after each read without checking each read result. `ReadNumber` assigns the caller's output only while the stream is good. Once a complete Unicode word has been read, subsequent short reads therefore reuse the last successful word. A valid version-zero OS/2 table ending at byte 78 still enters the codepage branch after its complete Unicode block; both failed codepage reads append the last Unicode word at bit offsets zero and 32. A table with one complete codepage word repeats that word for a missing second word. No OS/2 version test suppresses these codepage bitsets.
- Preservation: retain last-word reuse and the optional-bitset distinction for these defined inputs; tests pin short Unicode, version-zero and partial codepage tables. If even the first Unicode word is unavailable, native `nValue` has never been initialized: its bit results have no portable defined contract. The browser byte-input boundary leaves such capability data unknown instead of inventing zero coverage or emulating uninitialized C++ memory. This is a source-level contract finding, not a compiled native GUI observation or evidence of actual glyph support.

### WRITER075 — style preview ink bounds do not accumulate run advances

- Source: pinned `svx/source/tbxctrls/tbcontrl.cxx`, `SvxStyleBox_Base::CalcBoundRect`, `UserDrawEntry` and `CalcOptimalExtraUserWidth`; `vcl/source/outdev/text.cxx`, `OutputDevice::GetTextBoundRect`.
- Observation: measurement calls `GetTextBoundRect` with both base and index equal to each run start, then unions the resulting rectangles without translating by earlier runs' advances. The device's explicit prefix offset applies only when base and index differ. Drawing separately advances the pen after each run using cached `textWidth`. Consequently a multiscript label can have a measured width close to the widest single run while drawing the sum of its advances, potentially underestimating the popup's extra width. This is a source-derived inference over the supplied run metrics, not native GUI confirmation; actual layout and script analysis still own their inputs.
- Preservation: retain the unshifted ink union and independent per-run advances. A deterministic fixture pins a union spanning x=-2 through20 while drawing advances21,31,41. Do not change the measurement into a cumulative-width union to make this case look more intuitive.

### WRITER076 — style preview assigns case mapping to a derived font but draws through the base device font

- Source: pinned `svx/source/tbxctrls/tbcontrl.cxx`, `SvxStyleBox_Base::SetupEntry`, `CalcBoundRect` and `UserDrawEntry`; `include/editeng/svxfont.hxx`, `SvxFont::eCaseMap`/`SetCaseMap`; `vcl/source/outdev/font.cxx`, `OutputDevice::SetFont`.
- Observation: `SetupEntry` assigns the style's case-map item to each `SvxFont`, whose case-map value is a derived-class field. The subsequent preview measurement/drawing passes those fonts into `OutputDevice::SetFont(const vcl::Font&)`, which creates and stores a base `vcl::Font` value. The original label then goes directly to the device's measurement and drawing methods, without the `SvxFont` case-mapping text helpers. This path therefore appears to discard the case-map setting rather than previewing uppercase, lowercase or small caps. This is a source-level finding, not a native GUI observation.
- Preservation: keep the original label and device-font path. Do not add browser label case conversion merely because `SetupEntry` assigns a case-map item. Full `SvxFont` and `SetupEntry` implementation remain pending at this checkpoint.

### WRITER077 — GetItemScriptType ignores a script span strictly inside a selection

- Source: pinned `editeng/source/editeng/impedit2.cxx`, `ImpEditEngine::GetItemScriptType`.
- Observation: a cached script span contributes flags only if it contains the selection start or selection end under the two original endpoint tests. A span entirely between those endpoints contributes nothing. For initialized Latin `[0,1)`, Asian `[1,2)` and Complex `[2,3)` spans, selection `[0,3)` therefore returns Latin|Complex, omitting Asian. This is a source-level finding over the original range algorithm, not native GUI confirmation.
- Preservation: retain the endpoint tests rather than replacing them with a generic interval-overlap test. The extracted single-paragraph operation pins flags5 for this case, and copied reversed selections produce the same result without mutating the input. Actual paragraph storage,selection resolution and ICU analysis remain their owners' responsibilities.

### WRITER078 — GTK font-history restoration reverses saved order and does not apply the maximum

- Source: pinned `vcl/unx/gtk3/gtkinst.cxx`, `GtkInstanceComboBox::set_mru_entries`, `get_mru_entries`; `svtools/source/control/ctrlbox.cxx`, `FontNameBox::Fill`, `LoadMRUEntries`, `SaveMRUEntries`.
- Observation: saving enumerates current recent rows in order, but restoring inserts every accepted name at index zero. Saved `[A,B]` therefore restores as `[B,A]`. The restore loop also does not trim to `m_nMaxMRUCount`; only a later `update_mru` trims the list. Existing nonempty widget history passes through this same restoration on refill. This is source-derived behavior, not native GUI confirmation.
- Preservation: retain prepend order, exact main-list membership filtering and absence of restore-time truncation. Focused tests cover reversal and restoring more than five entries; production Writer and Calc tests cover restored order, including actual Calc page teardown and reload.

### WRITER079 — GTK history duplicate removal excludes the old last row

- Source: pinned `vcl/unx/gtk3/gtkinst.cxx`, `GtkInstanceComboBox::update_mru`.
- Observation: after prepending the accepted text, duplicate search uses `i < m_nMRUCount - 1`. The previous last row is excluded. Accepting `A` with history `[B,A]` and maximum five therefore leaves `[A,B,A]`. Tail trimming may hide this at capacity, but does not remove the duplicate below capacity. This is source-derived behavior, not native GUI confirmation.
- Preservation: retain the loop boundary and subsequent tail trimming. Deterministic value and actual populated widget tests pin the duplicate below capacity instead of replacing this with general deduplication.

### WRITER080 — style color visibility adjustment can turn COL_AUTO into a transparent explicit color

- Source: pinned `svx/source/tbxctrls/tbcontrl.cxx`, `SetupEntry`, `TestColorsVisible`; `tools/source/generic/color.cxx`, `DecreaseContrast`; `include/tools/color.hxx`, `COL_AUTO`; `vcl/source/rendercontext/drawmode.cxx`, `GetTextColor`.
- Observation: with an automatic or absent foreground and a solid white background, `SetupEntry` passes `COL_AUTO` to `TestColorsVisible`. Both colors have white RGB channels and the same brightness category. The contrast operation changes RGB from255 to225 while retaining the original transparency byte255, producing packed `0xffe1e1e1`. That value differs from `COL_AUTO`, so `SetupEntry` assigns it as explicit text color. The normal draw-mode color function retains that value. This is a source-derived value/dispatch finding, not confirmation of the final native raster: native backend handling and active draw mode can affect output.
- Preservation: retain the original alpha, automatic sentinel comparisons and explicit-color assignment. Do not invent an opaque contrasting foreground. Deterministic tests pin the packed result; the real Canvas adapter separately confirms that its projection is transparent and leaves the painted white background visible.

### WRITER081 — HarfBuzz format4 unicode collection does not apply idDelta to glyph-array entries

- Source: pinned LibreOffice HarfBuzz14.2.1 archive, `src/hb-ot-cmap-table.hh`, `CmapSubtableFormat4::accelerator_t::collect_unicodes` and `get_glyph`.
- Observation: for a nonzero range offset, collection removes a character only when its raw glyph-array word is zero. Nominal glyph lookup subsequently adds idDelta, masks to16 bits and rejects a resulting zero. A raw glyph1 with delta-1 therefore remains in the collected character map although nominal lookup rejects it. This is a source-derived finding, not native UI confirmation.
- Preservation: retain the raw-word collection check, whole-cmap remaining-byte bounds and ordered add/delete behavior. Focused tests pin the glyph1/delta-1 discrepancy rather than replacing collection with nominal glyph lookup.

### WRITER082 — HarfBuzz long-group collection includes the glyph-count boundary

- Source: pinned LibreOffice HarfBuzz14.2.1 archive, `src/hb-ot-cmap-table.hh`, `CmapSubtableLongSegmented::collect_unicodes`.
- Observation: when a group's computed final glyph reaches the population limit, the inclusive end is set to `start + num_glyphs - gid`, without subtracting one. Format12 group `[65,67]` starting at glyph2 with population4 therefore includes character67, whose sequential glyph would equal4. The shared template also limits constant-glyph format13 using this sequential expression. Malformed reversed ranges can expand after unsigned arithmetic. This is a source-derived finding, not native UI confirmation.
- Preservation: retain the inclusive bound, shared template logic and unsigned arithmetic. Focused tests cover both formats, glyph zero, Unicode clamping and reversed/wrapping source inputs.

### WRITER083 — FontList assigns SEMILIGHT and MEDIUM the same comparison rank

- Source: pinned `svtools/source/control/ctrltool.cxx`, `sortWeightValue`, `ImplCompareFontMetric`, `FontList::ImplInsertFonts`; `include/tools/fontenum.hxx`, `FontWeight`.
- Observation: WEIGHT_NORMAL has enum value5. The normal-first transform returns `weight+1` below NORMAL and `weight-1` above it. SEMILIGHT4 and MEDIUM6 therefore both become rank5. With equal italic and style name, the comparator returns zero despite different weights. Insertion treats the incoming record as a duplicate and discards it,except when its charset matches the system charset and the old record's does not. That exception replaces the old metric,including its weight. This is a source-derived finding,not native GUI confirmation.
- Preservation: retain the rank collision and existing charset replacement. Focused tests verify both lost-record and replacement cases;do not repair the transform or add a weight tie-breaker.

### WRITER084 — paragraph-direction guessing does not enter an FSI isolate

- Source: pinned `i18nutil/source/utility/guessparadirection.cxx`, `GuessParagraphDirection`; `include/i18nutil/guessparadirection.hxx`; `i18nutil/qa/cppunit/test_guessparadirection.cxx`, `testIsolate`.
- Observation: the source increments isolate depth for LRI and RLI, but not for FSI (`U_FIRST_STRONG_ISOLATE`). For `FSI + Hebrew + PDI`, the Hebrew strong character is therefore considered outside an isolate and the function returns RightToLeft. The analogous LRI/RLI-only input returns Ambiguous. This appears inconsistent with the function's stated paragraph-level/isolate rule. Existing upstream isolate QA covers LRI, RLI and PDI, but omits FSI. This is a source-level inference, not a native GUI observation or a finding about ICU's bidi resolver.
- Preservation: retain the omission if this direction-guessing helper is consumed or ported; do not silently substitute ICU base-direction guessing. The present style-label path follows native `EditEngine::SetText`/`ImpInsertText` and the default LTR pool direction, which do not invoke the typing/paste `UpdateAutoParaDirection` hook. The newly ported ICU resolver independently handles FSI as the original ICU does; this finding does not change that algorithm.


### WRITER085 — object-bar Invisible registration is normalized to Standard

- Source: pinned `include/sfx2/shell.hxx`, `SfxVisibilityFlags`; `sfx2/source/control/objface.cxx`, `CreateObjectBarUI_Impl` and `SfxInterface::IsObjectBarVisible`; `sw/source/uibase/shells/listsh.cxx`, `SwListShell::InitInterface_Impl`.
- Observation: the `Invisible` enum value is zero and documented as “Never visible”, but `CreateObjectBarUI_Impl` adds `Standard` when that exact value is passed. `IsObjectBarVisible` subsequently returns true for a registered bar. Writer registers its numbering object bar with `Invisible`, so interpreting the registration name literally would incorrectly hide it. This is a surprising source API/comment contract, possibly retained for compatibility; no desktop GUI defect or unintended behavior is confirmed.
- Preservation: retain the actual normalizing/visible behavior when connecting the represented numbering toolbar. Select it from native NumberList context and preserve the table shell's priority at the same object-bar position. Browser integration does not claim to port the complete SFX object-bar/configuration subsystem or repair the upstream enum comment.


### WRITER086 — forbidden bookmark text can still enable actions for a sanitized existing name

- Source: pinned `sw/source/ui/misc/bookmark.cxx`, `SwInsertBookmarkDlg::ModifyHdl`; `sw/source/ui/inc/bookmark.hxx`, `BookmarkTable::aForbiddenChars`.
- Observation: forbidden characters are removed only from the temporary matching string. `A/B` can therefore select an existing `AB` while the raw entry remains `A/B`. The forbidden flag disables Insert but is absent from Delete/GoTo/Rename admission. This is a source-derived control-state observation,not a confirmed harmful desktop operation.
- Preservation: retain raw input,temporary matching and distinct button conditions. Value and actual browser-control tests cover the sanitized existing-name path rather than applying an invented global rejection.

### WRITER087 — exhausted bookmark copy counters return an empty or still-colliding name

- Source: pinned `sw/source/core/doc/docbm.cxx`, `MarkManager::getUniqueMarkName`.
- Observation: after a collision,the candidate string starts empty and the loop runs only while the cached signed counter is below INT32_MAX. A cache already at INT32_MAX returns empty. At INT32_MAX-1,a colliding final candidate is returned when the counter reaches the bound. Reaching these cache values requires billions of allocations and is not practical ordinary document behavior;no native GUI defect is claimed.
- Preservation: retain loop,cache update and return values in the extracted normal naming helper. Direct helper tests use explicitly artificial counter values to preserve coverage;they do not claim these states are practically reachable.

### WRITER088 — Internet query removal also truncates a question mark inside a fragment

- Source: pinned `cui/source/dialogs/hyperlinkinternettabpage.cxx`, `HyperlinkInternetTP::RemoveQueryString`.
- Observation: the handler finds the first literal `?` without checking for a preceding `#`. Thus `https://example.test/a#fragment?keep` becomes `https://example.test/a#fragment`, even though the question mark is inside the URI fragment. A following hash and its suffix are preserved literally. This is a source control-handler observation,not a confirmed desktop defect after all native URL normalization paths.
- Preservation: retain literal string slicing and source event/session preference behavior. Tests cover this ordinary string input;using `URL.search` would change the source contract.

### WRITER089 — imported line-number intervals wrap through signed16 before property admission

- Source: pinned `xmloff/source/text/XMLLineNumberingImportContext.cxx`, interval attribute and `CreateAndInsert`; `XMLLineNumberingSeparatorImportContext.cxx`; `sw/source/core/unocore/unosett.cxx`, Interval/SeparatorInterval setters.
- Observation: SAX converts with a minimum of zero,then the importer narrows to signed16. Values32768..65535 become negative and are ignored;65537 becomes1. Main interval0 is ignored by the property owner,whereas separator interval0 is accepted. Property reads/export also narrow unsigned core intervals to signed16,so rare direct-core values can serialize as negative intervals. This discontinuous range behavior may be surprising;no desktop defect is confirmed.
- Preservation: reuse the existing SAX converter,retain narrowing and distinct admission conditions. Tests include ordinary and synthetic range boundaries,invalid lexemes and actual ODT re-export;no invented range rejection replaces native fallback behavior.

### WRITER090 — paragraph split sensitivity depends on which off-handler ran last

- Source: pinned `cui/source/tabpages/paragrph.cxx`, `SvxExtParagraphTabPage::AllowSplitHdl`, `WidowHdl`, `OrphanHdl` and Reset handler order.
- Observation: Widow false when Orphan is false disables Allow Split; Orphan false when Widow is false enables it. Reset calls Widow then Orphan,so both-off initial state permits splitting,while later unchecking Widow last can disable that control. AllowSplit changes checkbox sensitivity but does not directly disable checked numeric rows. This is a source control-state observation,not a confirmed desktop defect.
- Preservation: retain exact handler order and definite-state sensitivity effects;tests exercise both orders and retained numeric rows. Complete mixed-state/native widget services remain unrepresented.

### WRITER091 — paragraph page-number widget permits zero and stops at 55535

- Source: pinned `cui/uiconfig/ui/textflowpage.ui`, `adjustment3`; `SvxExtParagraphTabPage::FillItemSet` and `sw/source/uibase/utlui/uitool.cxx`, `SfxToSwPageDescAttr`.
- Observation: the page-number spin has an implicit lower bound zero and upper 55535,although the item is unsigned16 and Writer permits offsets through65535. Reset visually clamps imported larger values but unchanged saved widget state does not emit a replacement. Whether the upper limit is intentional remains unconfirmed.
- Preservation: keep original widget bounds,retained saved-state semantics and unsigned16 item including zero. Do not change imported out-of-widget-range offsets merely by opening and accepting the dialog.

### WRITER092 — page offset XML import saturates signed16 while export exposes unsigned16 as signed

- Source: pinned `sw/source/core/layout/atrfrm.cxx`, `SwFormatPageDesc::QueryValue`/`PutValue`; `xmloff/source/style/xmlbahdl.cxx`, `XMLNumberWithAutoForVoidPropHdl` and `lcl_xmloff_setAny`; `xmloff/source/text/txtexppr.cxx`, `CTF_PAGENUMBEROFFSET`.
- Observation: native offset65535 queries as signed16 -1 and exports as -1. Importing positive65535 saturates to32767,whereas importing -1 reaches unsigned65535. Thus numerically equivalent modulo65536 XML inputs can produce different offsets. Zero is valid in ODF1.3;older-version special handling is outside the current fixed1.3 writer. This is preserved source behavior,not a confirmed upstream defect.
- Preservation: use the original Any member projection,SAX lexical conversion,signed16 saturation and signed XML output. Invalid lexical input leaves a property unset;exact auto means void. Tests pin boundaries and actual Writer ODT/browser worker cycles.

### WRITER120 — OOXML content-type helper searches extension defaults before full-part overrides

- Source: pinned `comphelper/source/xml/ofopxmlhelper.cxx`, `OFOPXMLHelper::GetContentTypeByName`.
- Observation: the helper searches the extension key in Overrides and Defaults before searching the full part key. Given default `xml = application/xml` and override `/word/document.xml = document-main`, it returns `application/xml`. This is surprising relative to OPC override precedence. The separate `ZipPackage::parseContentType` applies defaults then overrides; no incorrect desktop document result or reachable consumer defect is established here.
- Preservation: retain exact search order, case-sensitive matching and first duplicate. `apps/office/src/comphelper/source/xml/ofopxmlhelper.test.ts` pins this result. Main-part selection uses the native office-document relationship path rather than changing this helper to infer a format from an extension. Shared finding also appears in the other application's issue ledger.

### WRITER121 — PropertyMap overwrite insertion discards an explicit document-default marker

- Source: pinned `sw/source/writerfilter/dmapper/PropertyMap.cxx`, `PropertyMap::Insert`; `PropertyMap.hxx`, `PropValue` constructors.
- Observation: `Insert(id, value, true, NO_GRAB_BAG, true)` constructs the two-argument `PropValue`, leaving its document-default flag false. The non-overwrite branch forwards the explicit flag. Thus the marker's effect depends on overwrite mode even for a previously missing property. This may be intentional caller discipline; no incorrect desktop document result is established.
- Preservation: retain both constructor selections. The actual property-map tests check default-marker reads and inherited merges rather than normalizing overwrite insertion.

### WRITER122 — PropertyMap caches the first nonempty character-grab-bag projection across later flag changes

- Source: pinned `sw/source/writerfilter/dmapper/PropertyMap.cxx`, `PropertyMap::GetPropertyValues`.
- Observation: a nonempty cached property vector returns before consulting `bCharGrabBag`. With one ordinary property and one character grab-bag entry, calling with false first makes a later true call omit that bag; reversing the order retains it on a later false call. If false produces an empty vector, a later true call recomputes. Consumer call ordering and whether any desktop defect follows remain unverified.
- Preservation: retain the nonempty-cache test and invalidation rules. Native typed-sequence tests cover both call orders and recomputation after invalidation.

### WRITER123 — imported-style property lookup guards a direct self-parent but not longer inheritance cycles

- Source: pinned `sw/source/writerfilter/dmapper/DomainMapper_Impl.cxx`, `GetPropertyFromStyleSheet` and `lcl_getParent`.
- Observation: lookup walks base style IDs until a property is found, no parent exists, or the next entry equals the current entry. A two-entry cycle with the requested property absent satisfies none of those conditions. Whether earlier style admission guarantees a cycle-free graph for every caller is unverified; this is not a confirmed desktop defect.
- Preservation: keep the direct-self guard and lookup order. Tests cover direct-self termination, missing parents, inherited properties and paragraph-before-character DocDefaults. They do not execute a nonterminating cycle or silently introduce a visited-set repair.

### WRITER124 — a factory definition without generated child cases uses the root/start fallback

- Source: pinned `sw/source/writerfilter/ooxml/factoryimpl_ns.py`, `factoryCreateElementMap`, `factoryCreateElementMapFromStart` and `factoryGetResourceId`; `factoryimpl.py`, `createFastChildContextFromFactory`.
- Observation: only definitions with child cases appear in the generated element switch. Its default branch searches namespace start elements. Therefore the known leaf definition `CT_OnOff` can resolve a `w:document` child through the same fallback as the initial context. This is outside the WordprocessingML schema and may be intentional permissive parser behavior. No incorrect desktop result on a valid document is established.
- Preservation: retain case-versus-default selection and unchanged failure output cells. Factory tests distinguish a paragraph context with generated cases, which rejects a document child, from the no-child-case leaf and initial contexts, which use the original start fallback. No schema-tightening repair is introduced.

### WRITER125 — Word kerning minimum-size thresholds collapse to one boolean

- Source: pinned `sw/source/writerfilter/dmapper/DomainMapper.cxx`, `LN_EG_RPrBase_kern`; `sw/source/core/bastyp/init.cxx`, `RES_CHRATR_AUTOKERN`.
- Observation: the importer assigns `CharAutoKerning = (nIntValue != 0)` and explicitly notes that Writer does not bind automatic kerning to Word's minimum font size. Thus positive thresholds 2 and 28 have the same native model value. This is a known format/model limitation rather than a newly confirmed upstream defect.
- Preservation: keep the boolean projection and original concrete `SvxAutoKernItem` with false pool default, Which17 and slot10067. Actual-model and primary ODT roundtrips test zero and multiple nonzero thresholds. Do not add a font-size-dependent substitute or raw-threshold document DTO.

### WRITER126 — underline type mapping sets word-only mode for words but does not clear it for other types

- Source: pinned `sw/source/writerfilter/dmapper/DomainMapper.cxx`, `handleUnderlineType`.
- Observation: `words` inserts `CharWordMode = true` before selecting single underline. The other underline cases update `CharUnderline` without inserting a false word-mode value. On the same property context, `words` followed by `single` therefore retains true word mode. The effect on every style-inheritance path and whether a valid desktop document exposes an unintended result remain unverified.
- Preservation: keep the separate property writes. Tests pin word mode remaining true after a later single underline; they do not normalize that update into a false word-mode reset.

### WRITER127 — nested textbox content overwrites one saved group state

- Source: pinned `sw/source/writerfilter/ooxml/OOXMLParserState.cxx`, `startTxbxContent` and `endTxbxContent`.
- Observation: entering nested textbox content emits a warning but still overwrites the single saved paragraph/character/last-paragraph flags. The first close restores the inner entry state; the second close warns and returns, so the outer entry flags are not restored. Whether a valid supported document reaches this nesting remains unverified; no desktop defect is confirmed.
- Preservation: keep the single saved state and unmatched-close return. Do not introduce a textbox state stack. Tests exercise ordinary, nested and unmatched transitions while retaining the section flag throughout.

### WRITER128 — MCE Choice uses exact Requires spelling and does not stop after an earlier supported Choice

- Source: pinned `sw/source/writerfilter/ooxml/OOXMLFastContextHandler.cxx`, `prepareMceContext`.
- Observation: the handler compares the entire Requires value against four literal prefixes (`wps`, `wpg`, `w14`, `wpc`), without splitting the whitespace-separated list or resolving feature namespace aliases. It also sets the took-choice flag without testing whether an earlier supported Choice was already taken. Consequently a multi-prefix Requires goes to Fallback, while two separately supported Choices both deliver content. Reachability and desktop impact for valid supported documents remain unverified.
- Preservation: retain the exact spelling tests, supported-prefix array, multiple-Choice delivery and nested alternate-state save/restore. Do not replace these checks with a standards-correct feature set or first-choice selection.

### WRITER129 — SAX callback failures retain the first cause but report the locator after the input block

- Source: pinned `sax/source/fastparser/fastparser.cxx`, `Entity::saveException`, `Entity::throwException` and `FastSaxParserImpl::parse`.
- Observation: a consumer failure is saved without immediately stopping the remaining callbacks in the current16KiB block. Later failures are discarded, and the SAXParseException locator is read after the block, rather than captured at the first failing callback. The reported location may consequently differ from where the wrapped first failure arose. The continuation is explicitly intentional for fdo#81214; whether the diagnostic location causes a user-visible defect is unverified.
- Preservation: retain first-failure selection, continued callbacks, null failed-start frames,16KiB checkpoints and current locator wrapping. Tests do not replace this behavior with immediate cancellation or the first-failure position.

### WRITER130 — default page mode updates two frames and undo restores only the pool default

- Source: pinned `sw/source/core/doc/docdesc.cxx`, `SwDoc::SetDefaultPageMode`; `sw/source/core/undo/unattr.cxx`, `SwUndoDefaultAttr::UndoImpl`.
- Observation: the mode setter changes the pool default, then directly converts each descriptor's master and left grid. It does not convert first-master or first-left grids. Default-attribute undo restores the pool item through `SetDefault`, without rerunning the page-mode setter, leaving authored master/left grid conversions in place. Valid document impact in the desktop application remains unverified.
- Preservation: retain all four actual frame owners, the two-frame conversion and pool-only undo. The actual-model test checks authored first-page grids and repeated undo/redo without extending the undo scope.

### WRITER131 — default-tab mutation retains one trailing default and reports change without removal

- Source: pinned `sw/source/core/doc/docfmt.cxx`, `lcl_SetNewDefTabStops` and `SwDoc::SetDefault`; `sw/source/core/doc/doc.cxx`, `SwDoc::ForEachParaAtrTabStopItem`.
- Observation: after finding the last non-default tab, the helper increments its index before removal, retaining the first trailing default. For every nonempty item with unequal old/new widths it reports true, even when no stop was removed. Traversal can visit the same inherited item through a node and its style; upstream explicitly notes that mutation of shared pooled items needs further consideration. Desktop impact remains unverified.
- Preservation: retain the exact increment, unconditional true result, shared-item traversal and non-short-circuit accumulation. Tests cover repeated visits and unchanged-but-true calls; no unique-item registry or corrected removal boundary is introduced.

### WRITER132 — failed document page-mode bool extraction changes mode to false

- Source: pinned `sw/source/uibase/uno/unotxdoc.cxx`, `SwXTextDocument::setPropertyValue`, `WID_DOC_DEFAULT_PAGE_MODE` case.
- Observation: the setter initializes a bool to false, ignores the result of Any extraction and calls `SetDefaultPageMode`. An incompatible value therefore sets false instead of raising a type error. Whether this is intended API behavior remains unverified.
- Preservation: retain the failed-extraction false fallback and the separate document property dispatch identity. Tests use real typed Any values and actual pool/page owners.

### WRITER133 — drawing attribute membership excludes the inclusive final attribute

- Source: pinned `sw/inc/hintids.hxx`, `isDrawingLayerAttribute`; `include/svx/xdef.hxx`, `XATTR_END`.
- Observation: XATTR_END aliases the inclusive XATTR_TEXT_LAST (XATTR_FORMTXTSHDWTRANSP,1047), while the predicate requires WhichId strictly less than XATTR_END. The final drawing attribute is therefore excluded from this predicate, including its default-format notification branch. Desktop impact remains unverified.
- Preservation: retain the strict upper comparison and the original constants in their SVX owner. Boundary tests explicitly reject1047; no inclusive-end correction is introduced.

### WRITER134 — section style creation failure retains its name and prevents creation on retry

- Source: pinned `sw/source/writerfilter/dmapper/PropertyMap.cxx`, `SectionPropertyMap::GetPageStyle`.
- Observation: the method stores an unused page-style name before calling the document factory. A UNO exception from that factory is caught while the name remains nonempty. A later call enters lookup for the retained name instead of trying creation again; when no style was inserted, lookup fails again. Reachability in supported desktop imports and user-visible impact remain unverified.
- Preservation: retain name assignment order, the UNO-only catch and lookup-on-retry path. Tests inject a real UNO failure at the actual model factory and confirm the missing style is not created on retry. Host implementation errors remain visible.

### WRITER135 — fast serializer assumes an existing x-escape prefix is already escaped

- Source: pinned `sax/source/tools/fastserializer.cxx`, `FastSaxSerializer::write`.
- Observation: an input matching `_x005F_xHHHH_` is emitted unchanged rather than escaping its leading underscore. `_x0020_` is also deliberately retained. The source explicitly assumes the first form was already escaped but not unescaped earlier. If it instead originated as literal document text and the consumer decodes that value as an OOXML basic string, literal content may change. Desktop reachability and impact remain unverified.
- Preservation: retain exact hex/case checks, the blank exception and suppression positions for adjacent escapes. Byte-output tests pin the source behavior without normalizing all literal patterns.

### WRITER136 — sorted serializer marks omit the initial unknown bucket

- Source: pinned `sax/source/tools/fastserializer.hxx`, `ForSort` initialization; `fastserializer.cxx`, `ForSort::setCurrentElement`, `append` and `sort`.
- Observation: the current token starts at zero and changes only for tokens present in the supplied order. Output before the first recognized token accumulates under zero and is omitted if zero is absent from that order. Later unrecognized elements stay in the preceding recognized bucket. Repeated order entries repeat their bucket. Whether valid Writer export paths reach unintended omissions remains unverified.
- Preservation: retain the original buckets and supplied-order traversal, including sorted PREPEND acting as APPEND. Tests pin each behavior; no fallback bucket or order deduplication is added.

### WRITER137 — cached SAX output reuses a sequence buffer after forwarding a shared sequence

- Source: pinned `sax/source/tools/CachedOutputStream.hxx`, `flush` and `writeBytes`; `include/com/sun/star/uno/Sequence.hxx`, `toUnoSequence`.
- Observation: flush changes the cached sequence length and passes its UNO reinterpretation to the output stream. Subsequent writes reuse the same raw buffer. A stream retaining a copied native Sequence may therefore observe changed content or length despite ordinary sequence value expectations. This is source-level suspicion; native retention/copy-on-write behavior and desktop impact have not been compiled or demonstrated.
- Preservation: retain buffer reuse, flush order and synchronous output calls. Host byte views are explicitly borrowed and actual ZIP output copies them immediately; a simulated native allocator or copy-on-write layer is not introduced. Exact native ABI/retention behavior remains unverified.

- The native byte-owner connection now has a local witness using genuine SAL ByteSequence/toUnoSequence and retained UNO Sequence copies: overwriting the cache changes the earlier value, and a later flush changes its observed length. The port deliberately retains this mutation and adds no COW repair. This is not a compiled upstream ABI witness or evidence of an application-visible defect. Actual ZIP output consumes the native sequence synchronously and copies at the archive transport boundary.

### WRITER138 — failed initial serializer mark setup leaves its empty flag inconsistent

- Source: pinned `sax/source/tools/fastserializer.cxx`, `mark`, `mergeTopMarks` and element start methods.
- Observation: mark pushes its object before switching cache output, and updates the separate empty-stack flag after that switch. If flushing the previous stream throws, the stack retains a mark while the flag remains true. Later merge calls return based on that flag and element starts bypass mark setup. The native end-document invariant fails. Desktop reachability and impact remain unverified.
- Preservation: keep the separate flag and exact fallible-operation order. A real closed ZIP stream test confirms translated failure behavior. Do not derive the flag from stack length or roll back the pushed mark.

### WRITER139 — full-list VML attribute prefix bypasses all XML escaping

- Source: pinned `sax/source/tools/fastserializer.cxx`, `FastSaxSerializer::writeFastAttributeList`.
- Observation: the prefix exception for `#_x0000_t` or `_x0000_t` disables the entire escape path, including quotes and ampersands, rather than only OOXML x-escaping. A matching value containing XML punctuation can therefore produce malformed attribute syntax. Desktop reachability is unverified. Native duplicate attributes are also emitted in release builds; their check is debug-only.
- Preservation: retain prefix checks and raw emission, duplicate ordering and the independent queued token/value vector. Exact byte tests cover both prefixes and ordinary escaped attributes without introducing a sanitizer.

### WRITER140 — RunText symbol font affects only its final control-delimited segment

- Source: pinned `sw/source/filter/ww8/docxattributeoutput.cxx`, `RunText` and `impl_WriteRunText`.
- Observation: delimiter flush calls omit the symbol-font argument; only the final flush receives it. A symbol run containing a tab therefore emits preceding characters as ordinary text and the final characters as symbols. Symbols are emitted per UTF16 code unit, including surrogate halves. The break-emission condition also retains a false branch that appears unreachable for immutable text: an empty segment follows a control character and thus satisfies `prevUnicode < 32`. Desktop impact remains unverified.
- Preservation: retain exact argument propagation, UTF16 iteration, short-circuit condition and schema marks. Tests cover bytes without replacing the condition or excluding it from instrumentation. The scoped100 branch coverage gate remains open for that native branch.

### WRITER141 — configured font lower_bound does not select a shorter prefix entry

- Source: pinned `unotools/source/config/fontcfg.cxx`, `StrictStringSort` and `FontSubstConfiguration::getSubstInfo`.
- Observation: the source comment discusses matching a longer search name with a shorter configured prefix. Strict Unicode `lower_bound` already excludes such a shorter prefix because it sorts before the longer search. The subsequent length/prefix guards therefore admit exact names but do not implement that described prefix fallback. A search for `liberationsansblack` misses the configured `liberationsans` entry. Desktop font-export impact remains unverified.
- Preservation: keep native lower_bound direction and both guards, with no predecessor/longest-prefix fallback. Tests over the shipped VCL data retain exact matching and the missed prefix behavior.

### WRITER093 — ASCII numbering is suppressed for a one-paragraph document

- Source: pinned `sw/source/filter/ascii/ascatr.cxx`, `OutASC_SwTextNode`, computes `bIsOneParagraph` solely from the original range endpoints and suppresses the list prefix when it is true. The complete document export range can also have endpoints in the same node.
- Observation: exporting a document containing only one numbered paragraph omits its visible number, while adding a second paragraph causes the number to appear. The condition also serves clipboard selection, so whether full-document suppression was intended is unconfirmed.
- Preservation: keep the upstream endpoint condition in `OutASC_SwTextNode`; `SwASCWriter.WriteDocument` passes the complete body block count. Native desktop behavior and the `SW_ASCII_COPY_NUMBERING` environment override remain unverified.

### WRITER094 — Markdown table-cell pipes are not escaped by the writer

- Source: pinned `sw/source/filter/md/wrtmd.cxx`, `OutEscapedChars` and `OutMarkdown_SwTextNode`. The escape switch omits `|` and carries a TODO asking whether to escape it; table output uses the same escaping path.
- Observation: a literal pipe in a table cell can be emitted as a column delimiter, so re-import may split or shift cells. This is a source-level inference; native desktop round-trip behavior is not independently confirmed.
- Preservation: keep the upstream escape set in `SwMDWriter`, including the missing pipe escape. The Markdown reader recognizes escaped pipes in incoming files, but the export path does not silently correct the upstream behavior.

### WRITER095 — RTF export omits nonstandard escapement at the default proportional height

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::OutputCharEscapement`. When proportional height equals `DFLT_ESC_PROP` (58), the function enters the super/subscript branch and returns after testing only the standard super/sub offsets and their automatic markers.
- Observation: an item with height 58 and another valid offset, such as 25, emits no position control. The same offset with a different supported height emits `\up` or `\dn`. This is a source-derived finding, not confirmed desktop behavior for a typical UI action.
- Preservation: keep this branch in `RtfExport.WriteEscapement`; do not emit a custom position for the height-58 case. Focused tests distinguish this source behavior from the represented custom-height round trip.

### WRITER096 — RTF list restart duplicates a rule but emits the original identifier

- Source: pinned `sw/source/filter/ww8/ww8atr.cxx`, `AttributeOutputBase::ParaNumRule`, and `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::ParaNumRule_Impl`; `sw/source/filter/ww8/rtfexport.cxx`, `RtfExport::WriteNumbering`.
- Observation: the shared paragraph exporter calls `DuplicateNumRule` when a Writer text node restarts its list, assigning the duplicate identifier to the `nNumId` argument. The RTF implementation accepts this argument but, after checking for zero or `USHRT_MAX`, writes `\\ls` using `GetNumberingId(*pRule) + 1` on the node's original rule instead. `WriteNumbering` has already emitted the list tables before body paragraphs are written. The explicit restart value therefore does not reach the RTF list reference from this path. This is a source-level inference, not a confirmed desktop round-trip observation.
- Preservation: retain the original-rule `\\ls` selection in the current RTF exporter; do not add a restart override solely to improve a round trip. Keep the local capability audit explicit about this upstream behavior.
- Local evidence: `rtf-paragraph-numbering.test.ts` now exercises real common dispatch and temporary-rule ownership for Writer level9 restarts, including signed16 restart32768 and the65535 reset sentinel. It confirms the original-rule reference and pre-body list table ordering in the browser port; no native desktop observation is claimed.

### WRITER097 — RTF tab leaders are not symmetric across writer and reader

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::ParaTabStop`, emits `\\tlth` for a hyphen fill and `\\tleq` for an equals fill. Pinned `sw/source/writerfilter/rtftok/rtfdispatchflag.cxx` maps both `TLTH` and `TLUL` to the underscore leader and has no `TLEQ` case in the tab-leader switch.
- Observation: exporting a tab with a hyphen or equals leader and importing the RTF through the source reader appears to change that leader to underscore or the default fill, respectively. This is a source-level inference, not a confirmed desktop round trip.
- Preservation: retain the source writer controls and reader mapping in the current RTF path. Focused tests pin `\\tlth` import to underscore; do not silently reinterpret it as hyphen.

### WRITER098 — RTF hyperlink export omits the hyperlink name

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::StartURL`, accepts `rName` but leaves it unused, while writing the URL and optional `\\t` target. Pinned `sw/source/writerfilter/dmapper/DomainMapper_Impl.cxx` accepts the `\\o` field switch and assigns it to the hyperlink name.
- Observation: exporting a Writer hyperlink with a name and importing the RTF through the source reader appears to lose that name, while an incoming RTF `\\o` name is retained. This is a source-level inference; native desktop round-trip behavior is not independently confirmed.
- Preservation: keep the current RTF exporter limited to the source URL and target controls. The importer accepts `\\o` into the existing native hyperlink item; focused tests distinguish import support from the source export omission.

### WRITER099 — standalone page-after RTF break has no emitted control

- Source: pinned `sw/source/filter/ww8/ww8atr.cxx`, `AttributeOutputBase::FormatBreak`, calls `SectionBreak(msword::PageBreak, true)` for `SvxBreak::PageAfter` and direct `PageBoth` without passing section information. Pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::SectionBreak`, writes page-break section properties only when `pSectionInfo` is non-null. The method therefore writes nothing for that standalone call.
- Observation: a direct page-after or page-both item without a separately prepared section appears to disappear in RTF output. This is a source-level inference, not a confirmed desktop round trip. Column breaks also produce no RTF control when the document has one column and the pinned `TREAT_SINGLE_COLUMN_BREAK_AS_PAGE_BREAK` default is false; that column branch is conditional by design.
- Preservation: the current RTF exporter keeps the standalone page-after/page-both no-op and does not invent a `\\page` token. Focused tests pin all represented non-page-before break modes without section or column context; section transitions remain a separate open implementation area.

### WRITER100 — RTF table-header export omits repeat-row metadata

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::TableDefinition`, emits row orientation, height, split, padding and cell properties but does not read `SwTable::GetRowsToRepeat` or write `\\trhdr`. Its WW8 and DOCX counterparts do read the repeat count. Pinned `sw/source/writerfilter/rtftok/rtfdispatchflag.cxx` maps incoming `TRHDR` to `tblHeader`; `DomainMapperTableManager.cxx` counts only the initial contiguous header rows and clears the count when an eleventh is marked.
- Observation: an authored Writer table header appears to lose its repeat-row status on RTF export and re-import, although incoming RTF can restore the status. This is a source-level inference, not an independently confirmed desktop round trip.
- Preservation: the current RTF exporter keeps the source omission. The RTF importer maps `\\trhdr` through the represented `SwTable::SetRowsToRepeat` contract, including the source ten-row workaround. Focused tests distinguish these directions.

### WRITER101 — Markdown hyperlink and character delimiters can cross

- Source: pinned `sw/source/filter/md/wrtmd.cxx`, `OutFormattingChange`, closes code, strikeout, posture and weight before hyperlinks, then opens strikeout, posture and weight before hyperlinks. It retains active state across consecutive text chunks.
- Observation: when a hyperlink and bold hint start together but bold ends before the link, the emitted sequence can be `**[Bold**Plain](url)`, with crossed delimiters. This is a source-level inference, not an independently confirmed desktop output or parsing result.
- Preservation: the Markdown writer now follows the source transition order and holds the same link open across adjacent differently formatted runs. Focused tests pin the contiguous-link case and the crossed-delimiter case instead of rearranging markers for syntactic neatness.

### WRITER102 — Markdown character output changes when direct paragraph items are allocated

- Source: pinned `sw/source/filter/md/wrtmd.cxx`, `OutMarkdown_SwTextNode`, iterates `rNode.GetSwAttrSet()` for paragraph formatting. Pinned `sw/inc/node.hxx`, `SwContentNode::GetSwAttrSet`, returns the paragraph style's item set when the node has no direct set, but returns only the direct set once one exists. The pinned `ApplyItem` weight branch treats every value except `WEIGHT_DONTKNOW`, including `WEIGHT_NORMAL`, as an opening bold contribution.
- Observation: text inheriting a bold style can be emitted with `**` until an unrelated direct item such as color is assigned; then the inherited bold item is absent from the iterated set and its Markdown markers disappear. Conversely, a direct normal-weight item can produce bold markers. This is a source-level inference, not independently confirmed desktop output.
- Preservation: the local Markdown writer now iterates the same selected native item set and ranged auto-format hints, including the source non-unknown weight rule. Focused tests pin both branches and the Western-script-only item switch.

### WRITER103 — RTF page-number restart value appears to be discarded on import

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::SectionPageNumbering`, writes `\\pgnstartsN` and `\\pgnrestart` for a section restart. Pinned `sw/source/writerfilter/rtftok/rtftokenizer.cxx` recognizes `pgnstarts` as a value token, but `rtfdispatchvalue.cxx` has no `PGNSTARTS` branch; `rtfdispatchflag.cxx` handles `PGNRESTART` by setting the section page-number start to 1.
- Observation: an explicit restart at a value other than 1 appears to be imported as 1 through this tokenizer/dispatch path. This is a source-level inference, not an independently confirmed desktop round trip.
- Preservation: retain the source section export controls. A later native import implementation must follow the pinned dispatcher rather than silently restoring the emitted numeric value to improve round trips.

### WRITER104 — RTF soft-page split may omit a later node's section break

- Source: pinned `sw/source/filter/ww8/wrtw8nds.cxx`, `MSWordExportBase::NeedTextNodeSplit` and `OutWW8_SwTextNode`, split a text node at soft page positions when its follow style needs another Word section, then call `RtfExport::PrepareNewPageDesc`. Pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::SectionBreaks`, stores the next text node's page descriptor as `m_pPrevPageDesc`; `RtfExport::PrepareNewPageDesc` suppresses `SectionBreak` when that descriptor's follow equals the requested page.
- Observation: when a noninitial text node uses a first/follow style, the stored previous descriptor can already be that node's first style. Its soft split then creates two output paragraphs while the `\\sect` token is suppressed. This is a source-level control-flow inference, not a compiled desktop reproduction.
- Preservation: the current RTF writer retains the split and the source suppression for that state. Focused tests distinguish the first text node from a later one without inventing a section to improve round trips.

### WRITER105 — Markdown thematic-line export branch appears unreachable

- Source: pinned `sw/source/filter/md/wrtmd.cxx` writes a paragraph only inside `if (!rNodeText.isEmpty())`; within that block, its `COLL_HTML_HR` case checks `if (rNodeText.isEmpty())` before writing `___`.
- Observation: an empty horizontal-line paragraph imported by pinned `SwMarkdownParser::AddHR` cannot satisfy both conditions. This is a source-level inference, not a compiled desktop reproduction.
- Preservation: the local Markdown writer retains the empty-paragraph behavior and does not synthesize `___` merely to improve the round trip.

### WRITER106 — Markdown entity callbacks discard recognized source text

- Source: pinned `sw/source/filter/md/mdcallbcks.cxx`, `SwMarkdownParser::text_callback`, inserts `MD_TEXT_NORMAL` and `MD_TEXT_CODE` but has an empty branch for `MD_TEXT_ENTITY` and `MD_TEXT_NULLCHAR`.
- Observation: syntactic entities such as `&amp;` and unknown `&madeup;` contribute no text. Pinned md4c 0.5.3 recognizes ASCII named-entity syntax without an HTML entity dictionary; malformed sequences remain normal text. A compiled md4c helper fixture confirms recognition; the Writer callback switch supplies omission. This is not a compiled desktop result.
- Preservation: the local Markdown reader uses the source md4c entity recognizer and omits every syntactic entity, including unknown names, while retaining escaped text and literal code-span content. Null-character callbacks are likewise omitted. The earlier HTML-dictionary approximation was removed after the pinned dependency became available.

### WRITER107 — Markdown nested list type can retain the earlier marker kind

- Source: pinned `sw/source/filter/md/swmd.cxx`, `SwMarkdownParser::StartNumberedBulletList`, changes a level format to ordered or bullet only when `GetNumFormat(nLevel) == nullptr`. A later list of the other type at the same level reuses the existing rule and skips that change. `StartNumberedBulletListItem` then assigns the same rule to the paragraph.
- Observation: sibling nested lists of different Markdown marker types can display the first level's marker kind for both, until the outer list ends and a new rule is created. This is a source-level inference, not a compiled desktop reproduction.
- Preservation: the local Markdown importer now shares one document-owned rule across nested lists and keeps the first format used at a level. A focused test covers the reused-level case.

### WRITER108 — Negative RTF Unicode fallback width suppresses later text

- Source: pinned `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx` accepts signed 16-bit `\uc` values and assigns the value to `RTFParserState::m_nCharsToSkip` after `\u`. Pinned `rtfdocumentimpl.cxx`, `RTFDocumentImpl::resolveChars`, appends a character only when that counter equals zero and otherwise decrements it. The `uc` keyword has a bare default of one in `rtftokenizer.cxx`.
- Observation: `\uc-1\u233ABC` appears to import the Unicode character and suppress all three subsequent literal characters, because the negative counter moves farther from zero. This is source-level inference, not a compiled desktop result.
- Preservation: the local RTF tokenizer keeps the signed width, decrements it for fallback characters and retains the source bare-`uc` default. A focused test pins the negative case.

### WRITER109 — IBM 850 reverse table aliases dotless i to the Euro byte

- Source: pinned `sal/textenc/tcvtlat1.tab`, `aImplIBM850ToUniTab`, maps byte `0xD5` to `U+20AC` after the documented Euro-sign change. Its `aImplIBM850ToCharTabEx` still maps both `U+0131` (dotless i) and `U+20AC` to byte `0xD5`.
- Observation: converting dotless i to IBM 850 and back appears to produce a Euro sign. This is a source-table inference, not an independently compiled desktop conversion result.
- Preservation: the shared SAL table port retains both reverse entries and the forward Euro mapping exactly. Writer RTF import uses the forward table; no corrective alias is introduced.

### WRITER110 — Markdown underline callback uses the strikeout item ID

- Source: pinned `sw/source/filter/md/mdcallbcks.cxx`, `SwMarkdownParser::enter_span_callback`, creates `SvxUnderlineItem(LINESTYLE_SINGLE, RES_CHRATR_CROSSEDOUT)` for `MD_SPAN_U`. Pinned `sw/inc/hintids.hxx` declares `RES_CHRATR_UNDERLINE` separately from `RES_CHRATR_CROSSEDOUT`.
- Observation: if md4c emits an underline span, the item's type and Which ID appear inconsistent when `SetAttrs` passes it to `InsertPoolItem`. The configured `MD_DIALECT_GITHUB | MD_FLAG_WIKILINKS` may not emit this span; reachability and resulting desktop behavior remain unverified.
- Preservation: retain the pinned item-ID choice if this callback is added to the current Markdown parser. Do not silently substitute `RES_CHRATR_UNDERLINE` without source differential evidence.

### WRITER111 — Third DBCS EUDC trail range uses only the second range length

- Source: pinned `sal/textenc/tcvtmb.cxx`, `ImplDBCSToUnicode`, computes the offset for a third EUDC trail range after reassigning `nTrailCount` to the second range length, rather than adding it to the first range length.
- Observation: a three-range EUDC descriptor with unequal first and second range sizes would overlap or misplace Unicode points in its third range. The pinned `.tab` descriptors reviewed for this Writer RTF path declare at most two trail ranges, so this is a source-level conditional concern, not an observed failure in MS-932/936/949/950.
- Preservation: the shared DBCS converter retains this calculation exactly. No corrective sum is applied without an upstream change.

### WRITER112 — EUC-JP undefined-pair classification and source advancement

- Source: pinned `sal/textenc/tcvtmb.cxx`, `ImplEUCJPToUnicode`, subtracts `JIS_EUC_LEAD_OFF` and `JIS_EUC_TRAIL_OFF` from a double-byte pair before testing those same variables against the offsets in the undefined-character branch. Its multibyte-undefined branch advances the source pointer before action handling, then the common output path advances it again; with `FLUSH`, it resets the pointer to the character start before the common advance.
- Observation: an unmapped JIS double-byte pair whose original bytes are in range is classified as invalid after subtraction. An undefined SS2 pair can report a consumed-byte count different from its full byte width. These conclusions follow source control flow; compiled desktop behavior has not been compared.
- Preservation: the local EUC-JP converter retains the branch order, classification and pointer updates exactly. Focused tests cover an invalid pair and the SS2 `FLUSH` path.

### WRITER113 — ISCII lookahead reads beyond the supplied source span

- Source: pinned `sal/textenc/convertisciidevangari.cxx`, `IsciiDevanagariToUnicode::convert`, computes `nNext` under `nConverted < nSrcBytes + 1` and then reads `pSrcBuf[nConverted + 1]`. For the last byte of a nonempty buffer this condition is still true, so the read lies one byte beyond the supplied span.
- Observation: the out-of-span value can affect whether a final byte combines with nukta. The actual allocation may contain an accessible extra byte, but the conversion contract does not provide it; compiled desktop behavior at that boundary remains unverified.
- Preservation: the local converter retains the same lookahead condition and combination order. JavaScript's bounded source view supplies zero when the adjacent byte is absent, avoiding an out-of-bounds read while leaving the in-span source behavior unchanged.

### WRITER114 — UTF-7 converter ignores saved streaming context

- Source: pinned `sal/textenc/tcvtutf7.cxx`, `ImplUTF7ToUnicode`, comments out the branch that restores `mbShifted`, `mbFirst`, `mbWroteOne`, `mnBitBuffer` and `mnBufferBits` from its context, while still writing the resulting values to that context at return. The source marks the implementation unfinished.
- Observation: a shifted Base64 sequence split across converter calls cannot resume from the preceding chunk even when the caller retains the native context. This is a source-level finding; compiled desktop behavior remains unverified.
- Preservation: the local converter initializes conversion state on every call and still stores the final values in the context, matching the pinned source. The current RTF byte path supplies a complete byte run to one call.
- Reverse evidence: `ImplUnicodeToUTF7` likewise disables restoration of `mbShifted`, `mnBitBuffer`, and `mnBufferBits`, stores the final fields and ignores its flags argument. The port preserves this. The isolated unchanged-source ASan/UBSan witness confirms reverse outputs and saved state for 589824 BMP/capacity cases and 240 mixed vectors with a deliberately nonzero incoming context; full desktop behavior is not certified.

- SAX-input follow-up: actual public RTL calls consume a nonfinal `+A` tail with ERROR|SRCBUFFERTOOSMALL, then an empty FLUSH reports no error because saved shift state is not restored. A real fragmented InputSource containing a complete XML root plus that tail consequently reaches endDocument under the tested read schedule. Preserve this conditional source behavior and its regression; see CALC-389. No complete native SAX backend comparison or private-state injection is claimed.

### WRITER115 — Apple Arabic and Hebrew code pages have no SAL converter

- Source: pinned `sal/textenc/tencinfo.cxx`, `rtl_getTextEncodingFromWindowsCodePage`, maps Windows code pages 10004 and 10005 to `RTL_TEXTENCODING_APPLE_ARABIC` and `RTL_TEXTENCODING_APPLE_HEBREW`; pinned `sal/textenc/tables.cxx` records `nullptr` with `TODO!` for both entries. `sal/textenc/textcvt.cxx`, `rtl_convertTextToUnicode`, routes a missing converter to `ImplDummyToUnicode`.
- Observation: RTF byte sequences marked with those code pages decode each byte as U+00xx rather than Arabic or Hebrew characters. The source explicitly marks the converter entries unfinished. Compiled desktop behavior remains unverified.
- Preservation: the local RTF path dispatches missing converters to the same SAL dummy byte mapping and does not synthesize an Apple Arabic/Hebrew table.

### WRITER116 — Empty leading Markdown code paragraph can leave an unmatched closing fence

- Source: pinned `sw/source/filter/md/wrtmd.cxx`, `OutMarkdown_SwTextNode`, enters its fence logic only for nonempty text. For a nonempty preformatted paragraph, it decides whether to open the fence by checking the preceding node's pool style, even when that preceding node was empty and wrote no fence.
- Observation: an empty preformatted paragraph followed by a nonempty one emits no opening fence, but the last nonempty paragraph still emits a closing fence. This is a source-level inference, not a compiled desktop reproduction.
- Preservation: the local Markdown writer makes the same independent text and neighboring-style decisions. A focused test pins the resulting unmatched fence.

### WRITER117 — Markdown automatic encoding detection is bypassed by the default reader option

- Source: pinned `sw/source/filter/basflt/shellio.cxx`, `SwAsciiOptions::Reset`, initializes the charset to `osl_getThreadTextEncoding()`. Pinned `sw/source/filter/md/swmd.cxx`, `MarkdownReader::Read` passes that value to `SwMarkdownParser::CallParser`, which calls `SvStream::DetectEncoding()` only for `RTL_TEXTENCODING_DONTKNOW`. Pinned Unix thread initialization replaces an unknown locale encoding with US-ASCII; Windows uses the active code page.
- Observation: ordinary Markdown opening does not reach BOM/ICU detection unless a caller explicitly supplies an unknown charset. This is a source-level inference, not a compiled desktop reproduction. A UTF-16 BOM alone does not override the default charset through this path.
- Preservation: the browser Writer reader keeps its default UTF-8 byte path and does not unconditionally detect UTF-16 BOMs. The explicit unknown-charset branch is not yet represented locally.

### WRITER118 — RTF underline color may arrive at export as black

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::OutputCharUnderline`, emits `\\ulc` from `rUnderline.GetColor()` after each supported underline style. Its adjacent `NEEDSWORK` comment says that this value appears always black even when an ODT underline is, for example, green.
- Observation: the source explicitly flags a possible loss before the color-table emission point. The earlier producer of `rUnderline` and compiled desktop behavior have not been traced, so this remains a suspected issue rather than a confirmed reproduction.
- Preservation: the local RTF output takes the actual native `SvxUnderlineItem` color and writes its color-table index, following the cited emission logic. It does not force a correction or a black value based on the comment.

### WRITER119 — Registered RTF hairline underline is ignored by the reader

- Source: pinned `sw/source/writerfilter/rtftok/rtftokenizer.cxx` registers `ulhair` as an RTF toggle, but `RTFDocumentImpl::dispatchToggle` has no `ULHAIR` case; it reaches the default `TODO handle toggle` branch and leaves the character underline unchanged.
- Observation: a hairline-underline control does not reach the document's underline value. This follows the source dispatch table and default branch; compiled desktop behavior remains unverified.
- Preservation: the local RTF reader likewise leaves `\\ulhair` without an underline-style item. A focused test pins the ignored control.

### WRITER142 — run font attributes retain the family list while fontTable uses its first token

- Source: pinned `sw/source/filter/ww8/docxattributeoutput.cxx`, `CharFont`; `writerwordglue.cxx`, `FontMapExport`; `wrtw8sty.cxx`, `wwFont::WriteDocx`.
- Observation: CharFont writes the original GetFamilyName value into w:ascii/w:hAnsi, but font registration tokenizes that value and the font table uses the first family token. For `Liberation Sans;Fallback`, run attributes retain the complete list while fontTable contains `Liberation Sans`. Consumer lookup behavior and desktop impact remain unverified.
- Preservation: keep original values and registration-before-guards order. A real ZIP font-part test pins the mismatch without normalizing the run attribute or dropping fonts registered by later duplicate-attribute calls.

### WRITER143 — pseudo character runs retain the initial script font charset

- Source: pinned `sw/source/filter/ww8/writerwordglue.cxx`, `sw::util::GetPseudoCharRuns`.
- Observation: the function selects and extends a font charset from the first script before it builds the script boundaries. Every emitted CharRunEntry receives that same charset even when later runs use another script with a different paragraph font charset. Empty text uses Latin. Effects on encoding-dependent Word filters remain unverified; DOCX RunText ignores its charset parameter.
- Preservation: keep first-script font lookup and charset reuse, with no per-script refresh or guessed UTF8 replacement. Real three-script node tests retain this behavior for Latin-, CJK- and CTL-first text. The negative-script-end and missing-table guards are also kept despite remaining uncovered with the concrete successful backend.

### WRITER144 — DOCX character width narrows to signed16 before clamping

- Source: pinned `sw/source/filter/ww8/docxattributeoutput.cxx`, `DocxAttributeOutput::CharScaleWidth`; unsigned storage is `SvxCharScaleWidthItem`.
- Observation: the explicit `std::min<sal_Int16>` template parameter converts the unsigned width before the advertised OOXML range clamp. On the current native compiler, stored values 32768 and 65535 therefore become negative and export as 1 rather than 600. The real short Any width contract can store 65535 from -1, so this is more than an arbitrary widened JavaScript input. Desktop producer reachability and document impact remain unverified.
- Preservation: perform original signed16 narrowing before min/max; do not widen to a JavaScript unsigned clamp. Literal real-item DOCX tests pin 0/1/100/600/601/32767/32768/65535. The task evidence char-width-narrowing-probe.json records a compiled C++ template-conversion check only; it does not claim a compiled native DOCX export or whole-module parity.

### WRITER145 — property-table delivery bypasses resource-table forwarding guards

- Source: pinned `sw/source/writerfilter/ooxml/OOXMLFastContextHandler.cxx`, `OOXMLFastContextHandlerPropertyTable::lcl_endFastElement` and `OOXMLFastContextHandlerTable::lcl_endFastElement`.
- Observation: Table sends a cloned table only when event forwarding is enabled and its resource ID is nonzero. PropertyTable instead clones its property set, appends it, and calls `Stream.table` unconditionally, including when forwarding is disabled or the ID is zero; its endAction runs afterwards. Effects on suppressed substreams/MCE and desktop producer reachability remain unverified. This may be intentional for settings/numbering, so no defect is asserted.
- Preservation: retain both distinct callback contracts; do not add Table guards to PropertyTable. Real native context/resource objects test disabled forwarding, zero IDs, copied property sets, accumulated table snapshots and the ordinary Table guards. Native import orchestration and downstream mapper-table application remain incomplete.

### WRITER146 — conditional table column borders use different insertion and merge checks

- Source: pinned `sw/source/writerfilter/dmapper/StyleSheetTable.cxx`, `TableStyleSheetEntry::AddTblStylePr` and `lcl_mergeProps`.
- Observation: insertion checks RIGHT for FirstCol and LEFT for LastCol before erasing an inside vertical border from the supplied map. Later merging clears the accumulated inside vertical border for LEFT on FirstCol and RIGHT on LastCol. Row border checks are consistent. This may reflect different conflict stages, but their effect differs for a column style containing only one edge; desktop table-layout intent/impact remain unverified.
- Preservation: keep both original arrays and their order. Literal tests with actual typed BorderLine2 values retain the right-only FirstCol inside border during merge, clear it for a left-only FirstCol, and verify insertion mutates the supplied map.

### WRITER147 — imported stylesheet property inheritance only guards a direct self-reference

- Source: pinned `sw/source/writerfilter/dmapper/StyleSheetTable.cxx`, `StyleSheetEntry::GetMergedInheritedProperties`.
- Observation: recursive lookup skips only an empty base ID and a base equal to the entry's own ID. A longer imported ID cycle has no visited-set or depth guard in this helper. Whether upstream callers exclude such cycles before reaching it remains unverified; no crashing native reproduction or document-impact claim is made.
- Preservation: retain original recursion and direct-self/missing-parent behavior. Tests cover real acyclic table identities, ordered overrides, missing parents and direct self references. Do not insert a local cycle repair into this kernel helper.

### WRITER148 — stylesheet outline setter accepts negative signed16 values beyond the unset sentinel

- Source: pinned `sw/source/writerfilter/dmapper/PropertyMap.hxx`, `StyleSheetPropertyMap::SetOutlineLevel`.
- Observation: WW_OUTLINE_MIN is zero, but the setter checks only the upper bound WW_OUTLINE_MAX (9). The normal unset value is -1; other negative signed16 values are retained as well. Native producer reachability and later UNO/application behavior for those values remain unverified.
- Preservation: retain signed16 argument narrowing and the original upper-only check. Actual owner tests keep -2, reject 10 after 9, and retain the conversion of 65545 to signed16 value 9 without adding a lower clamp.

### WRITER149 — conditional table-style header advertises parent properties that the method does not merge

- Source: pinned `sw/source/writerfilter/dmapper/StyleSheetTable.hxx`, `TableStyleSheetEntry::GetProperties` comment, versus its body in `StyleSheetTable.cxx`.
- Observation: the declaration describes properties corresponding to the mask plus parent styles. The implementation creates a plain PropertyMap and merges only GetLocalPropertiesFromMask; it performs no imported-parent lookup. Parent merging may be deliberately performed by callers, and the comment may be stale. No desktop rendering defect is asserted.
- Preservation: retain the local-only body and separate GetMergedInheritedProperties helper. Literal tests keep conditional results independent of the entry's ordinary base properties and unmasked whole-table bucket; imported ancestor-property precedence is tested separately. Do not combine these stages solely to match the header comment.


### WRITER150 — cell-margin raw metadata outlives the converted temporary

- Source: pinned `sw/source/writerfilter/dmapper/CellMarginHandler.cxx`, `CellMarginHandler::lcl_sprm`, `lcl_attribute` and `createGrabBag`.
- Observation: after each modifier only m_nValue resets to zero. m_nWidth and m_nType persist, so an empty following edge is marked valid with converted zero while its interop entry can retain the preceding edge's nonzero raw width and unit. A non-dxa unit only warns; the width still undergoes the absolute twip conversion. Missing-width input and non-dxa units may be excluded by conforming producers; native document/layout impact remains unverified.
- Preservation: keep all three independent fields and the exact resolution/reset order. Real nested resource tests retain raw width1440 in an empty next edge while its applied margin is0, and retain conversion of a pct-typed width. Do not synthesize missing attributes or clear the raw fields locally.

### WRITER151 — cell-margin start/end mapping keeps a hardcoded LTR direction

- Source: pinned `sw/source/writerfilter/dmapper/CellMarginHandler.cxx`, `CellMarginHandler::lcl_sprm`, `const bool rtl = false; // TODO`.
- Observation: start/end map to left/right without consulting the document/table direction. Upstream explicitly leaves direction detection as a TODO; whether later table import stages compensate remains unverified. No native RTL rendering reproduction is claimed.
- Preservation: retain the effective native LTR mapping and all twelve table/cell edge aliases. Tests cover exact source spelling in interop values, last-write overwrite and independent edge validity. Do not introduce a local text-direction guess into this handler.


### WRITER152 — cell-border theme color is constructed without insertion into the property map

- Source: pinned `sw/source/writerfilter/dmapper/TDefTableHandler.cxx`, `TDefTableHandler::fillCellProperties`.
- Observation: the helper creates a local ComplexColor, assigns the last retained theme type, and appends tint/shade transformations, but never inserts or returns that value. Only the six first border-line values are inserted into the supplied map. The interop grab bag can preserve the theme lexeme separately. Later import stages may compensate, so native document/rendering impact remains unverified.
- Preservation: retain the local construction and its lack of output; do not silently add complex-color properties. Tests keep six actual BorderLine2 map properties with theme/tint/shade input and verify the separate interop data. The standalone BorderHandler::getComplexColor continues returning its actual native value through its distinct contract.

### WRITER153 — Resolved false positive: Markdown quotation depth starts at minus one

- Source: pinned `sw/source/filter/md/swmd.cxx`, `SwMarkdownParser::EndBlockQuote`, restores Text Body only when `m_nBlockQuoteDepth == 0`, then decrements the depth. The declaration in `swmd.hxx` initializes the depth to -1.
- Correction (HTML60): the original observation assumed an initial depth of zero and incorrectly attributed quotation-style leakage to upstream. Entering the usual outer quote increments -1 to zero, so its exit restores Text Body before decrementing back to -1. The previous local default of zero was a porting error, not an upstream defect. Actual nested quote and md4c document regressions now cover the corrected constructor state and style restoration.
- Preservation: retain the exact -1 default and test/decrement order. This entry records the withdrawn suspicion; no workaround for upstream is justified.

### WRITER154 — track-change dates retain local clock fields and an unknown timezone

- Source: pinned `sw/source/writerfilter/dmapper/ConversionHelper.cxx`, `ConvertDateStringToDateTime`, and `TrackChangesHandler::getRedlineProperties`.
- Observation: the helper explicitly describes an MS Office compatibility workaround: it separates the time at uppercase Z, parses integer clock fields, and leaves DateTime.IsUTC at its default false. Numeric timezone offsets and fractional seconds are not applied. A lexical Z therefore does not set IsUTC, and +02:30 does not shift 10:42:05. This is documented native compatibility behavior; downstream metadata/display intent remains unverified, and no defect is asserted.
- Preservation: retain the original signed32 getToken overload, prefix integer conversion and generated field assignments. Tests keep identical local clock fields for Z/positive/negative offsets, zero nanoseconds and false IsUTC; committed Strict/Transitional ZIP TrackChange attributes reach the actual receiver before clearProps. Do not route this helper through the generic SAX ISO parser or a browser Date conversion.

### WRITER155 — the optional signed year in the date comment is split as a delimiter

- Source: pinned `sw/source/writerfilter/dmapper/ConversionHelper.cxx`, `ConvertDateStringToDateTime`, whose format comment includes an optional leading minus.
- Observation: the implementation unconditionally reads the first year token using '-' as a delimiter. For -2024-01-02 it therefore assigns Year0, Month2024 and Day1; there is no special leading-sign path or calendar validation. The public DateTime IDL has a signed year, but this helper also narrows the parsed year through unsigned16 before assignment. Native producer reachability and document impact for BCE/large years remain unverified.
- Preservation: keep the exact token split and original unsigned16 assignments, followed by the DateTime field's declared signed16 year width. Literal owner tests retain the negative-year result and the signed narrowing of year32768; no local calendar repair is introduced.

### WRITER156 — complex-color resolution ignores the supplied theme

- Source: pinned `docmodel/source/uno/UnoComplexColor.cxx`, `UnoComplexColor::resolveColor`, and `offapi/com/sun/star/util/XComplexColor.idl`.
- Observation: the interface accepts an XTheme when resolving a color, but the concrete component explicitly ignores that argument and returns its previously stored final color, including transparency. Changing the supplied theme therefore cannot recompute a theme-indexed color through this method. This may be intentional cached-color behavior; native document/UI impact and the intended resolution contract remain unverified.
- Preservation: retain the unused argument and signed32 final-color conversion. The actual component test supplies a nonnull theme whose virtual methods detect any lookup, changes the original source value after construction, and retains the copied final color. Do not add theme lookup or transformation application to this method.

### WRITER157 — explicit shading fill leaves automatic-fill state sticky

- Source: pinned `sw/source/writerfilter/dmapper/CellColorHandler.cxx`, `CellColorHandler::lcl_attribute` and `getProperties`.
- Observation: an explicit fill sets m_bAutoFillColor false, but a later auto fill only converts the raw fill to white and does not restore that flag. Reusing the receiver for explicit fill followed by auto therefore produces opaque white and paragraph FillStyle SOLID; a fresh receiver with auto produces the automatic sentinel and FillStyle NONE. Normal producer duplication/reuse and visible document impact remain unverified.
- Preservation: retain the one-way flag assignment and independent fill-specified state. Actual resource tests retain both fresh-auto and explicit-then-auto results; do not reset the flag when parsing auto.

### WRITER158 — paragraph nil shading falls through to character properties

- Source: pinned `sw/source/writerfilter/dmapper/CellColorHandler.cxx`, `CellColorHandler::getProperties`.
- Observation: the paragraph branch excludes the nil token, but the following branch treats every non-Form mode as character output. Paragraph mode with nil and a specified fill therefore emits CharBackColor, and emits CharBackgroundComplexColor when a fill theme is present, instead of paragraph fill properties. Whether later native consumers discard or compensate for this output remains unverified.
- Preservation: keep the exact branch structure and conditions. The owner test retains a paragraph nil witness with CharBackColor and no FillColor; do not replace the fallthrough with an early return or paragraph-specific clearing policy.

### WRITER159 — shading complex colors retain a default final color beside a computed scalar

- Source: pinned `sw/source/writerfilter/dmapper/CellColorHandler.cxx`, `getComplexColor`, `getFillComplexColor` and `getProperties`; `docmodel/source/uno/UnoComplexColor.cxx`, `resolveColor`.
- Observation: the handler computes a scalar brush color, while its independent ComplexColor builders set only theme identity and transformations. They do not copy that scalar or raw RGB into final color. The created UNO component can therefore resolve to default black alongside a nonblack FillColor or CharBackColor. Paragraph output creates a component even for an Unused color; character output creates one only for a themed fill. Whether downstream color-item application intentionally fills the cached final color is unverified; no native rendering defect is claimed.
- Preservation: retain the separate scalar and theme-only values, insertion conditions and unchanged component resolver. Real Any/Reference tests check the copied theme/transforms, scalar background and zero final color independently; do not initialize final color locally or add palette resolution.

### WRITER160 — SvRef self-move drops its reference

- Source: pinned `include/tools/ref.hxx`, `tools::SvRef::operator=(SvRef&&)`; native PropertyMap inherits SvRefBase and uses this pointer owner.
- Observation: move assignment releases the existing object, reads the source pointer and then clears the source, with no self-move guard. When source and destination are the same SvRef, the result is empty and its reference is released. A separate alias can keep the pointee alive. This may be an allowed moved-from contract rather than a defect; no Writer document failure is claimed.
- Preservation: retain the exact release/read/clear order and empty self-move result. Complete original normal and ASan/UBSan caller traces retain a surviving alias while the self-moved reference becomes empty. Do not replace the implementation with a self-move no-op or swap policy.

### WRITER161 — cell validity ignores the end and the returned start pointer

- Source: pinned `sw/source/writerfilter/dmapper/TableManager.cxx`, `CellData::IsValid`, and `sw/source/writerfilter/dmapper/TableData.hxx`.
- Observation: validity requires a nonnull stored start and a getStart call that does not throw RuntimeException. The returned Reference is discarded without a null check, and the stored end/open state is not examined. A nonnull start whose getStart returns an empty Reference is therefore accepted, including a cell with an empty end. This may intentionally test range accessibility; native producer reachability and document impact remain unverified.
- Preservation: retain the start-only check, temporary destruction and catch-only RuntimeException. Actual component caller tests retain empty result/end acceptance, disposed/runtime failure rejection and foreign exception propagation. Do not add an end check, returned-pointer check or catch-all repair.

### WRITER162 — shared sequence-map overloads reset and merge differently

- Source: pinned `comphelper/source/misc/sequenceashashmap.cxx`, SequenceAsHashMap operator<< overloads.
- Observation: typed NamedValue/PropertyValue sequences clear the map and accept empty names or VOID values. Sequence<Any> instead merges without clearing, skips VOID elements, rejects empty names/values and retains earlier writes if a later element throws. An outer Any accepts only the typed named/property sequences, not Sequence<Any>. These are explicit implementation differences; downstream intent and document impact remain unverified.
- Preservation: keep all overload distinctions, exact IllegalArgumentException messages/position-1 and partial mutation. Actual Any/Sequence tests cover both reset and merge paths and every rejection; do not normalize them to a transactional replace operation.

### WRITER163 — shared map extraction preserves reused PropertyValue metadata

- Source: pinned `comphelper/source/misc/sequenceashashmap.cxx`, SequenceAsHashMap operator>> for Sequence<PropertyValue>.
- Observation: extraction reallocates the destination and assigns only Name and Value. Existing slots retain Handle and State, while a fresh sequence starts with generated default metadata. Equal map contents can therefore yield different output Handle/State depending on destination history. This may intentionally preserve caller metadata; downstream document impact remains unverified.
- Preservation: retain the two-field assignment. The actual Sequence test reuses a slot with Handle123/AMBIGUOUS_VALUE, verifies those fields survive and checks a copied alias retains its original Name through native copy-on-write. Do not rebuild every output slot from a fresh PropertyValue.

### WRITER164 — unknown floating-table anchors leave orientation relations uninitialized

- Source: pinned `sw/source/writerfilter/dmapper/TablePositionHandler.cxx`, getTablePosition.
- Observation: horizontal and vertical relation locals have no initializer. Only margin/page/text assign a value before insertion into the frame property map. A different anchor therefore reads an indeterminate native short. Normal schema/producer reachability and document impact remain unverified; no native value or repeatable invalid-input result is claimed.
- Preservation: retain the three exact branches with no repair default. Host locals remain uninitialized rather than defaulting to FRAME/PAGE_FRAME. Valid-input tests check all three source relations. A separate host diagnostic covers the unknown-anchor branches and checks only independent initialized properties; it never inspects or asserts the relation payload and does not certify native undefined behavior or ABI.

### WRITER165 — floating-table position equality ignores wrapping distances and overlap

- Source: pinned `sw/source/writerfilter/dmapper/TablePositionHandler.cxx`, operator==.
- Observation: comparison includes the two anchors, two spec strings and x/y coordinates, but omits four distances from surrounding text and the table-overlap ID. Equal handlers can therefore return different margin or AllowOverlap properties. Whether downstream table grouping intentionally ignores these differences remains unverified; no native document defect is claimed.
- Preservation: retain the six-field comparison and original short circuit. Public attribute tests vary every compared field, then show that differing margins/overlap leave equality true while actual output properties differ. Do not add those fields to equality.

### WRITER166 — non-character automatic-style families share a tree without a set-subtype discriminator

- Source: pinned `sw/source/core/doc/swstylemanager.cxx`, generic getAutomaticStyle/getByName, and `svl/source/items/stylepool.cxx`, StylePoolImpl::insertItemSet.
- Observation: RUBY/PARA/NOTXT select one paragraph pool, whose tree is keyed by parent identity and concrete items, with no SfxItemSet subtype key. A generic non-character set inserted first can therefore supply the retained leaf for equal later SwAttrSet input. The generic PARA overload asserts only its input; later getByName for PARA asserts that a found handle is SwAttrSet. Native application reachability and compiled differential behavior remain unverified; no document defect is claimed.
- Preservation: retain shared family routing and the exact tree key; do not add a pool-identity/subtype discriminator or silently convert the retained set. Source-backed public-owner tests retain the original generic leaf for equal Writer input and preserve the later paragraph subtype assertion. The separate native typed-overload behavior and native assert process/ABI are not certified by these tests.
### WRITER120 — Wide RTF borders lose the exporter's thick-width flag on import

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `OutTBLBorderLine`, emits `\\brdrth` and halves the converted width when the native line exceeds 255 twips. The pinned tokenizer registers `brdrth` as a flag, while `rtfdispatchflag.cxx` has no `BRDRTH` case. The flag therefore does not double the border width on import.
- Observation: the source path writes a 300-twip solid border as `\\brdrs\\brdrth\\brdrw150`, which the reader passes onward as 150 twips. A bare `\\brdrth` does not establish a line style. This is a source-level trace; compiled desktop reproduction remains unverified.
- Preservation: both local paragraph and cell borders retain the ignored flag. Tests pin the reduced round-trip width and the absence of a line for a bare thick flag. No compensating width multiplier is added to the importer.

### WRITER142 — Positive paragraph-style position substitutes automatic superscript

- Source: pinned `sw/source/writerfilter/dmapper/DomainMapper.cxx`, `LN_EG_RPrBase_position`, defers ordinary run positions and negative paragraph-style positions. Other nonzero stylesheet positions instead insert `DFLT_ESC_AUTO_SUPER` or `DFLT_ESC_AUTO_SUB` with `DFLT_ESC_PROP`; the source explicitly says `DON'T FIXME` and describes the missing final-font-size calculation.
- Observation: a positive paragraph-style position does not retain its numeric half-point offset, while a negative paragraph-style position follows the deferred calculation. This asymmetric branch is source-derived; compiled desktop differential behavior remains unverified.
- Preservation: the represented RTF paragraph-style owner retains positive substitution and negative deferred resolution. Tests distinguish positive automatic superscript from negative numeric displacement; no compensating style normalization is added. Character-style import now also retains the automatic positive/negative substitutions, independent of the supplied magnitude and font size. Ordinary run position normalization remains a separate filter gap.

### WRITER143 — md4c tag recognizer accepts a slash in a closing tag

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_is_html_tag`, sets attribute state to -1 for closing tags but tests `attr_state <= 2` for both `>` and `/>`.
- Observation: the compiled native helper accepts `</a/>` even though its comment permits the optional slash only on an opening tag. This is a dependency-level scanner finding, not a native Writer rendering result.
- Preservation: the TypeScript tag automaton retains the numeric state comparisons and the compiled fixture pins this accepted form; no HTML normalization is inserted.

### WRITER144 — md4c HTML declaration detection uses ASCII instead of uppercase letters

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_is_html_block_start_condition`, comments that HTML type four begins with `<!` followed by an uppercase letter, but tests `ISASCII(off+1)`.
- Observation: compiled native helpers select type four for `<!lowercase>` and `<![CDATA[x]]>`. The latter reaches this branch before the type-five CDATA test, so it uses the generic `>` closer instead of the CDATA-specific branch. Full native Writer HTML import has not been reproduced.
- Preservation: retain this ASCII test and branch order. The block scanner and complete block-queue differential fixtures pin this behavior.
- B8TCAE invariant audit: for an input buffer that remains stable during the synchronous call, an exact `![CDATA[` match necessarily has ASCII `[` at off+1 and has already returned type four. The later type-five return is therefore shadowed. An additional independently compiled original helper confirms4/0/0/7 for CDATA, short/long non-ASCII declarations and a whitespace-suffixed custom tag; the real TypeScript scanner profile now leaves only this return and a separate optional-end type guard uncovered. The latter helper contract is distinct: original `md_line_contains` always writes `*p_end`, both on match and on failure; the local helper likewise always returns an `end` property. The user separately approved M01 (only the shadowed return/true alternative) and M02 (only the absent-end alternative). Exact runtime-token/remapped-counter comparison removes one zero-hit statement and two zero-hit alternatives; all other positions and14 functions remain unchanged. Fresh1912 assertions give strict100 coverage for this owner. No parser fix or full native Writer behavior claim is introduced.

### WRITER145 — md4c raw pre/script/style/textarea blocks accept name prefixes

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_is_html_block_start_condition`, checks each type-one tag name by case-insensitive prefix without a following delimiter test.
- Observation: the compiled scanner classifies `<prefix>` as a type-one `pre` block, which can continue until `</pre>` or EOF. This is a native dependency grammar result, not proof of native Writer rendering.
- Preservation: keep the prefix test and source closers; do not replace it with a host HTML tokenizer or an exact-tag check.

### WRITER146 — md4c wiki delimiter disabling has a reversed interval

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_resolve_links`.
- Observation: The wiki-label branch calls md_disable_marks with delim_index + 1 as the first index and delim_index as the end. Its half-open loop performs no iterations. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Keep the original bounds and mark resolution; the native callback corpus covers wiki labels.

### WRITER147 — md4c nested autolink suppression retests the first nested mark

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_resolve_links`.
- Observation: Both nested-boundary loops test first_nested->ch, including the loop moving last_nested. This can retain a different right boundary than a last_nested test would. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Retain the first-mark condition in both loops; native callback fixtures cover nested spans and links.
- B8TCAE adds actual public-parser inputs with resolved inline constructs crossing destination boundaries. The local repeated-first-mark loop body executes under this expanded original-C span/text differential corpus; a speculative M03 exception draft was withdrawn before requesting approval or changing runtime code. The existing native source issue remains preserved, with no full native Writer/model or branch-counter equivalence claim.

### WRITER148 — md4c NULL replacement retains the NULL in the following verbatim chunk

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_text_with_null_replacement`.
- Observation: After the NULL callback, off advances but the source pointer does not. A following CODE or HTML chunk can include the same NULL byte. Compiled callback fixtures reproduce this sequence. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Preserve both the NULL callback and following raw chunk; do not insert a host replacement character in the parser.

### WRITER149 — md4c empty table intervals shift later cells left

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_process_table_row`.
- Observation: Zero-width pipe intervals are skipped; subsequent nonempty cells are emitted first and missing cells are appended at the end. Compiled callbacks preserve this cell order. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Keep interval skipping and trailing cell completion, including their order.

### WRITER150 — md4c collapsed tab marks have no space-emission branch

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_collect_marks and md_process_inlines`.
- Observation: The whitespace-collapse option records the actual tab byte, but inline emission handles the space-byte mark. A tab can consequently disappear rather than emit a space. LibreOffice does not enable this option. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Keep the source flag-specific behavior; option fixtures compare compiled callbacks.

### WRITER151 — md4c URI scheme recognition accepts an ASCII digit first

- Source: pinned md4c 0.5.3 `src/md4c.c`, `md_is_autolink_uri`.
- Observation: The initial scheme-byte check uses ISASCII instead of an alphabetic predicate. Compiled native callbacks recognize forms such as <1a:x> as a URI autolink. This is dependency behavior, not a compiled native Writer model reproduction.
- Preservation: Retain the source predicate and subsequent scheme checks; do not substitute URL validation.

### WRITER152 — Native HTML control filtering truncates scalar input to UTF-16

- Source: pinned `include/svl/lngmisc.hxx`, `linguistic::IsControlChar(sal_Unicode)`, returns only `cChar < ' '` and explicitly questions excluding DEL. `svtools/source/svhtml/parhtml.cxx` passes its UTF-32 `nNextCh` and numeric-entity `cChar` to that UTF-16 parameter.
- Observation: DEL and C1 characters pass the predicate. Scalars such as U+10000 have a low UTF-16 word below space and therefore follow the control branch after argument conversion. This is a source-level trace; compiled Writer behavior remains unverified.
- Preservation: keep the original predicate and the native 16-bit argument conversion in the shared scalar owner. Do not replace it with a Unicode control category predicate.

### WRITER153 — Markdown quotation exit tests depth before decrement against zero

- Source: pinned `sw/source/filter/md/swmd.cxx`, `SwMarkdownParser::EndBlockQuote`, restores Text Body only when `m_nBlockQuoteDepth == 0`, then decrements the depth.
- Observation: leaving the usual outer quote at depth one does not restore Text Body. Source paragraph append retains the quotation collection, so following ordinary paragraphs can retain it. This is a source-level trace, not a compiled Writer reproduction.
- Preservation: keep the exact test/decrement order and paragraph collection inheritance; do not reset the style merely because a quote closes.

### WRITER154 — Markdown ordered-list callbacks discard the source start detail

- Source: pinned `sw/source/filter/md/mdcallbcks.cxx`, `enter_block_callback`, calls `StartNumberedBulletList(type)` for ordered lists without forwarding `MD_BLOCK_OL_DETAIL::start`. `swmd.cxx` initializes the native format and start sentinel independently.
- Observation: an ordered Markdown list beginning with a value other than one does not transfer that value through this callback. The md4c parser itself retains it correctly. This is a source-level Writer trace.
- Preservation: retain the type-only callback and native format/start-sentinel decisions; do not compensate in the dependency parser or document adapter.

### WRITER155 — Inline Markdown HTML remains buffered until a block HTML exit

- Source: pinned `sw/source/filter/md/mdcallbcks.cxx`, `text_callback`, appends all `MD_TEXT_HTML` text to `m_htmlData`; only `SwMarkdownParser::EndHtmlBlock` invokes `InsertHtmlData` and clears the buffer.
- Observation: inline HTML callbacks have no immediate native HTMLReader invocation. A later raw HTML block exit can consume that earlier buffered markup as well. This is a source-level trace; compiled Writer behavior remains unverified.
- Preservation: retain the shared buffer and block-only flush point; do not immediately interpret inline tags around ordinary Markdown text. The connected native HTML/model integration test now confirms that an unclosed inline bold tag affects a later raw block while the earlier Markdown text remains plain; this is port evidence, not a compiled desktop differential.

### WRITER156 — SvParser's explicit UCS2 setter does not select the UTF-16 read branch

- Source: pinned `svtools/source/svrtf/svparser.cxx`, `SvParser::SetSrcEncoding`, accepts UCS2 in its outer condition but still resets the encoding to DONTKNOW when `rtl_createTextToUnicodeConverter` returns null. `sal/textenc/tables.cxx` has no UCS2 entry in its bounded descriptor table. The BOM-detection path in `GetNextChar` instead assigns UCS2 directly.
- Observation: explicit encoding selection and BOM selection take different paths; the former can fall back to raw-byte reading while the latter reads UTF-16. This is a source-level trace, not a compiled desktop reproduction.
- Preservation: keep the explicit setter's missing-converter fallback and the separate direct assignment during the source BOM probe.

### WRITER157 — Invalid in-family character pool IDs retain their original identity

- Source: pinned `sw/source/core/doc/DocumentStylePoolManager.cxx`, `GetFormatFromPool`, character-format branch.
- Observation: the invalid-ID comment says to return the first format, but the code only substitutes its UI resource name. It still searches and creates using the original invalid pool ID. Repeated invalid IDs can therefore produce distinct owners sharing the first character format's UI name. This is a source-level trace, not a compiled Writer reproduction.
- Preservation: retain the original invalid ID and name fallback independently; do not normalize the ID or deduplicate formats by name.

### WRITER158 — Unbound character-format items return before clearing a dying style

- Source: pinned `sw/source/core/txtnode/fmtatr2.cxx`, `SwFormatCharFormat::Notify`.
- Observation: the method immediately returns when no text attribute is bound. Its later `SwObjectDying` branch clears the character-format pointer only after forwarding to the bound text attribute. An unbound copied item therefore does not take that clearing branch. This is a source-level lifetime concern; no claim is made about dereferencing an expired native pointer.
- Preservation: retain the early return and the bound-item forwarding/clear order. JS collection handles object lifetime; no native address/refcount model or unsafe native dereference is emulated.

### WRITER159 — Character-style replacement can duplicate native sort numbers

- Source: pinned `sw/source/core/txtnode/thints.cxx`, `SwpHints::BuildPortions`, named character-format branch.
- Observation: under `DONTREPLACE`, replacing an already present style removes the equal style, counts surviving distinct styles and assigns that count as the new sort number. It does not renumber survivors or choose their maximum plus one. A portion initially containing style orders zero and one can therefore end with two order-one styles. Native comparators subsequently use pointer identity for a remaining tie. This is a source-level trace, not a compiled Writer reproduction.
- Preservation: keep the count-based assignment and surviving sort numbers. Do not repair them by renumbering. Native address tie-breaking is not claimed by the portable JS graph; no synthetic pointer allocator is introduced.

### WRITER160 — CSS1 six-hex recognition is independent of grammatical context

- Source: pinned `sw/source/filter/html/parcss1.cxx`, `CSS1Parser::GetNextToken`, numeric and identifier branches.
- Observation: six hexadecimal characters become `CSS1_HEXCOLOR` even when the grammar expects an identifier. A selector such as `.abcdef` cannot take the normal class branch; subsequent tokens can be interpreted as a new selector during recovery. This is a source-level trace, not compiled Writer evidence.
- Preservation: keep the context-independent lexer priority and the original selector recovery/callback order. Numeric evidence added in HTML32: padding:999999pt starts with a HEXCOLOR token and does not set padding;70000pt enters the actual LENGTH path. Keep both behaviors, rather than normalizing six-digit numeric input.

### WRITER161 — Empty CSS strings enter the scanner's unconditional first append

- Source: pinned `sw/source/filter/html/parcss1.cxx`, quoted `CSS1Parser::GetNextToken` branch.
- Observation: after reading the opening quote, the scanner uses a do-while loop. An immediately closing quote is appended as content, and later input can be consumed until another matching quote or EOF. An opening quote followed directly by EOF appends the UTF16 EOF sentinel. This is source-level behavior.
- Preservation: retain the do-while and EOF branches; do not replace them with a CSS string tokenizer or special-case empty strings.

### WRITER162 — Eight-hex CSS color conversion omits leading zeroes before right padding

- Source: pinned `sw/source/filter/html/parcss1.cxx`, hash scanner and `CSS1Expression::GetColor`.
- Observation: the scanner blends eight-digit RGBA over white and converts the RGB integer to an unpadded hexadecimal string. GetColor subsequently reads six positions and supplies zeroes at missing positions on the right. For example, the source trace for `#0000ffff` becomes the token `ff` and then RGB `ff0000`. This is a source trace, not a compiled desktop reproduction.
- Preservation: retain the unpadded integer conversion and the original right-padding loop independently.

### WRITER163 — CSS URL extraction strips single quotes despite its double-quote comment

- Source: pinned `sw/source/filter/html/parcss1.cxx`, `CSS1Expression::GetURL`.
- Observation: the comment mentions double quotes, but the implemented three stripping passes remove spaces, single quotes and spaces. Double quotes remain in the returned URL text. URL resolution after this helper is not certified by this observation.
- Preservation: keep the exact stripping characters and pass order.

### WRITER164 — Skipped CSS declarations can retain a numeric value for a later identifier

- Source: pinned `sw/source/filter/html/parcss1.cxx`, `ParseStyleOption`, `ParseDeclaration` and scanner numeric fields.
- Observation: malformed-property recovery advances tokens without clearing `m_nValue`. A skipped numeric declaration can therefore leave its scalar value on a later identifier expression, until normal term construction resets it. The source trace for `font-weight:bold; -vendor-x:1px; color:blue` gives the blue identifier a numeric field of one. This concerns callback fields, not a claim about visible final color.
- Preservation: retain numeric-field reset only at the original initialization and expression-construction points.

### WRITER165 — Fractional CSS RGB components use the alpha-like multiplication branch

- Source: pinned `sw/source/filter/html/parcss1.cxx`, `CSS1Expression::GetColor` RGB branch.
- Observation: after an integer-prefix check, any component containing a decimal point is multiplied by 255 and narrowed to an unsigned byte. This applies to RGB components as well as alpha. A negative fractional prefix between minus one and zero can bypass the initial negative check because its integer prefix is zero. This is a source-level trace.
- Preservation: retain the original condition order, multiplication, integer truncation and byte narrowing; do not apply channel-specific normalization.

### WRITER166 — UTF-8 encoding consumes a non-low unit after a pending high surrogate

- Source: pinned `sal/textenc/tcvtutf8.cxx`, `ImplConvertUnicodeToUtf8` bad-input branch.
- Observation: after a high surrogate, the next UTF-16 unit is consumed before checking that it is low. If it is not low, the replacement/ignore/error branch processes that consumed pair without retrying the second unit. With default flags, high-surrogate plus ASCII A emits one question mark and consumes both units. This is a source-contract trace, not compiled native evidence.
- Preservation: retain the original pointer advancement, pending-state reset and bad-input actions. Do not substitute host Unicode replacement grouping.

### WRITER167 — UTF-8 encoder FLUSH retains a trailing high surrogate and the string wrapper drops it

- Source: pinned `sal/textenc/tcvtutf8.cxx`, `ImplConvertUnicodeToUtf8` final pending-surrogate branch; `sal/rtl/string.cxx`, `rtl_impl_convertUStringToString`.
- Observation: with FLUSH set, a pending high surrogate reports SRCBUFFERTOSMALL and remains pending; without FLUSH it enters bad-input handling. The string wrapper sets FLUSH, uses a null context and retries only DESTBUFFERTOSMALL, so a trailing high surrogate produces no bytes. This is a source-level trace; compiled native reproduction remains unverified.
- Preservation: retain the source flag polarity and wrapper retry condition independently.


### WRITER168 — Brush-to-fill clearing excludes the last fill attribute

- Source: pinned `svx/source/unodraw/unobrushitemhelper.cxx`, `setSvxBrushItemAsFillAttributesToTargetSet`, iterates while `a < XATTR_FILL_LAST`; the fill range itself includes its final Which ID.
- Observation: a pre-existing `XATTR_FILLUSESLIDEBACKGROUND` item remains after conversion because it is the inclusive range end. This is a source-level trace, not compiled Writer evidence.
- Preservation: retain the original exclusive clearing bound. Do not clear or reset the final slide-background flag as a cleanup.

### WRITER169 — Copying the default NameOrIndex sets a flag absent on its source

- Source: pinned `svx/source/xoutdev/xattr.cxx`, `NameOrIndex` constructors.
- Observation: the default constructor initializes Which zero and palette index minus one without `setNameOrIndex`; named, indexed and copy constructors call that setter. Copying or cloning the default item therefore changes this metadata flag. This is a source-level trace.
- Preservation: keep the original per-constructor calls and the default false pool-item flag; do not normalize the source or its copy to the same flag.


### WRITER170 — Exact text-attribute deletion skips the next shifted same-span hint

- Source: pinned `sw/source/core/txtnode/thints.cxx`, `SwTextNode::DeleteAttributes`; its preceding FIXME says that sort numbers for character formats are not respected.
- Observation: after deleting an exact family/start/end match, the forward loop increments its index without compensating for the shifted array. With three same-span character-style hints, the first and third are deleted and the second remains. This is a source-level trace, not compiled Writer evidence.
- Preservation: retain the exact forward traversal and family/range matching. Do not delete all equal-span character styles in one call or repair sort-number handling. Native new-attribute reset history continues to use this original owner.


### WRITER171 — An empty hyperlink inside another hyperlink is removed by recursive repair

- Source: pinned `sw/source/core/txtnode/thints.cxx`, `SwpHints::TryInsertNesting`, asymmetric `isNestedAny` and pass-four recursive insertion.
- Observation: an empty new INET strictly inside an existing INET is initially inserted. Re-inserting the old right-hand fragment then treats that empty attribute as overwritten and destroys it. The original URL remains as two adjacent fragments; InsertHint returns success while InsertItem returns no surviving incoming pointer. Empty insertions at the old boundaries take a different path. This is a source-level trace, not compiled native evidence.
- Preservation: retain insertion-before-repair order, the asymmetric boundary predicate and the original recursion. Do not force an empty incoming hyperlink to survive or merge the two original fragments.


### WRITER172 — Exact range reset bypasses selectors and omits final change notifications

- Source: pinned `sw/source/core/txtnode/txtedt.cxx`, `SwTextNode::RstTextAttr`, `bExactRange` branch and final `bChanged` test.
- Observation: exact matching is evaluated independently of `nWhich` and `pSet`. Among the represented ranged families, it deletes exact-span AUTOFMT hints while retaining INET and CHARFMT hints. The branch never sets `bChanged`, so final range/style notifications and MergePortions are skipped even after deletion. This is a source-level trace, not compiled native evidence.
- Preservation: retain the branch precedence, deletion/history owner and missing final notifications; do not infer change from the deletion list.

### WRITER173 — Default character-style range reset can return false after changing hints

- Source: pinned `sw/source/core/txtnode/thints.cxx`, `SwTextNode::SetAttr(const SfxItemSet&, ...)`, default CHARFMT branch and final insertion count.
- Observation: setting the document default character style invokes RstTextAttr and DontExpandFormat without incrementing the insertion counter. With no other inserted items, the node method returns false although existing character styles were removed or split and a boundary flag may have changed. This concerns the node-level result; document-level modified and undo behavior requires independent owner verification. This is a source-level trace, not compiled native evidence.
- Preservation: retain the insertion-only counter and the original reset/boundary calls; do not replace this result with a generic mutation flag.


### WRITER174 — Real-script lookup at a supplementary character's end can select the application script

- Source: pinned `sw/source/core/bastyp/breakit.cxx`, `SwBreakIt::GetRealScriptOfText`, initial end-of-text decrement; `i18npool/source/breakiterator/breakiteratorImpl.cxx`, `beginOfScript` and `endOfScript`.
- Observation: end-of-text lookup subtracts one UTF16 unit. For a single supplementary CJK character this lands on its low surrogate, which has weak classification. The backward weak-run search can advance beyond that offset after meeting the preceding strong scalar; neither direction then recovers the CJK script, so the result falls back to the application language's script. At offset zero the same text is Asian. This is a source-level trace, not compiled native evidence.
- Preservation: keep the original code-unit decrement, unnormalized input offsets and backward-run advancement. Do not replace them with codepoint-aware caret adjustment.


### WRITER175 — Non-RTL COMPLEX character properties select the Western normal-keyword group

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::MoveProperties`, non-RTL run switch; the COMPLEX case carries the source question about using CTL.
- Observation: with an explicit COMPLEX script and false bidi RTL flag, CTL values are emitted as associated properties before the normal Western group. The COMPLEX branch shares the LATIN/default path instead of the RTL path that emits normal CTL keywords last. This is a source-level trace, not compiled native or rendering evidence.
- Preservation: retain the independent bidi/script state and the original COMPLEX switch branch. Do not infer the RTL flag merely from script or make CTL the normal-keyword group for every complex run.


### WRITER176 — Reverse DBCS/JIS table ranges can exceed their actual arrays

- Source: pinned `sal/textenc/tcvtmb.cxx`, `ImplUnicodeToDBCS` and `ImplUnicodeToEUCJP`; original high-table entries and arrays in `tcvtkr2/5/6.tab`, `tcvttcn2/6.tab`, `tcvtscn4/6.tab` and `tcvtjp3/5/6.tab`.
- Observation: some inclusive high-table limits exceed the actual pointed-to array length. For example KSC5601 high page 0x77 advertises low bytes 0x01 through 0xFB while its array ends at low 0xF3; BIG5 page 0x8B advertises through 0xFF while its array ends at 0x9F. The unchanged converter dereferences those offsets without a physical array bound check. The compiled source audit classifies 269 affected descriptor/unit pairs among 786432 BMP cases across the represented eleven DBCS descriptors plus EUC-JP. These reads are C++ undefined behavior; observed neighboring-array bytes are not a portable native result.
- Preservation: retain the original arrays, inclusive limits and lookup decisions. Do not pad tables, clamp limits or synthesize mappings. The native witness audits and records these cases before executing converter bodies; byte digests cover the 786163 defined cases. The existing JS array/bitwise binding has no certified corresponding native byte value for undefined reads.

### WRITER177 — DBCS private-byte conversion passes through a signed plain char

- Source: pinned `sal/textenc/tcvtmb.cxx`, `ImplUnicodeToDBCS` private-byte assignment and following zero check.
- Observation: with PRIVATE_MAPTO0, the assignment narrows the low byte through plain char before storing it in unsigned16 cConv. In the explicit signed-char profile, U+F180 becomes cConv 0xFF80 and emits two bytes FF 80; U+F1FF emits FF FF. Low byte zero re-enters the shared undefined handler, as the preceding source FIXME describes. The compiled unchanged source confirms this profile; other plain-char ABI profiles are not certified.
- Preservation: retain the original assignment and zero recheck. Keep signedness explicit in the native witness and the current logical byte binding instead of silently emitting one unsigned byte for every private character.

### WRITER178 — RTF CanEncode uses text-to-Unicode flags for Unicode-to-text conversion

- Source: pinned `sw/source/filter/ww8/writerwordglue.cxx`, `CanEncode`; `include/rtl/textcvt.h` flag definitions.
- Observation: UNDEFINED_ERROR has the same value in both flag families, but TEXTTOUNICODE INVALID_ERROR is 0x0100, which is UNICODETOTEXT UNDEFINED_REPLACE rather than UNICODETOTEXT INVALID_ERROR (0x0010). The RTF predicate therefore requests undefined-character replacement and does not request the apparent invalid-input error action. The current CanEncode/RTF charset owner retains these literal flags and uses the real checked SAL byte-string wrapper. This is a source-level flag trace with separate core SAL conversion evidence; full Writer/OUString/OString predicate compilation and font-table integration remain unverified.
- Preservation: retain the original flag values when connecting the native font-name conversion path. Do not replace them with the similarly named flags from the opposite family.


### WRITER179 — UTF-7 directly emits form feed but shifts carriage return

- Source: pinned `sal/textenc/tcvtutf7.cxx`, `aImplMustShiftTab` and `ImplUnicodeToUTF7`. The table marks 0x0C as direct, with a comment naming it CR, while 0x0D is marked for Base64 shifting.
- Observation: the unchanged compiled source emits U+000C as byte 0C and U+000D as `+AA0-`. The source table differs from its own control-character comment. The isolated ASan/UBSan native witness confirms the output.
- Preservation: retain the original 128-entry table. Do not swap 0x0C/0x0D or normalize line endings inside the converter.

### WRITER180 — ISCII reverse conversion retains a trailing high surrogate when FLUSH is set

- Source: pinned `sal/textenc/convertisciidevangari.cxx`, `UnicodeToIsciiDevanagari::convert`, final pending-surrogate branch.
- Observation: when a high surrogate remains and neither ERROR nor DESTBUFFERTOSMALL is set, the source sets SRCBUFFERTOSMALL if FLUSH is present and leaves the surrogate in the context. Without FLUSH it invokes the invalid-input helper, which may replace the surrogate and clear state. The isolated unchanged-source ASan/UBSan witness confirms these branches, status, output and source counts.
- Preservation: retain the source condition and state transitions. Do not reverse the FLUSH test to follow another codec's streaming behavior.
- Additional evidence: the original ISO-2022-JP/KR reverse owners use the same final pending-high-surrogate FLUSH condition as ISCII. The isolated ASan/UBSan ISO witness verifies these branches and final shift/designation state for mixed and saved-context vectors. The port retains the condition and any separate final shift reset.


### WRITER181 — ISCII context requirements differ from the generic string wrapper's null context

- Source: pinned `sal/textenc/convertisciidevangari.cxx`, `ImplConvertUnicodeToIsciiDevanagari`, casts its context and unconditionally calls its member function; that function reads `m_cHighSurrogate`. Pinned `sal/rtl/string.cxx`, `rtl_impl_convertUStringToString`, calls `rtl_convertUnicodeToText` with a null context. The ISCII descriptor in `convertisciidevangari.tab` supplies this context-dependent reverse callback.
- Observation: the generic string-wrapper route provides no ISCII context despite the converter's unconditional object access. This is a source-level contract finding; null-object execution is undefined and is excluded from the native witness. Direct reverse-call tests use the actual context constructor and reset contract.
- Preservation: keep the converter's context ownership requirement. Do not manufacture a context inside its callback or silently substitute another encoding to conceal the source contract mismatch.
- Forward evidence: `rtl_string2UString_status` in pinned `sal/rtl/ustring.cxx` likewise calls its converter with nullptr. `ImplConvertIsciiDevanagariToUnicode` unconditionally calls `pCtx->convert`, whose loop reads `m_cPrevChar`. RTF `checkUnicode` uses this OStringToOUString route. The former local RTF-only context construction was removed; the null-context callback binding raises TypeError, while native null-object execution remains undefined and excluded from sanitized witnesses.


### WRITER182 — JIS X 0201 exposes an encoding descriptor with a null forward callback

- Source: pinned `sal/textenc/tcvtjp6.tab`, `aImplJISX0201TextEncodingData`, sets the text-to-Unicode function pointer to nullptr while retaining `convertUnicodeToChar` as its reverse function. `rtl_createTextToUnicodeConverter` in `sal/textenc/textcvt.cxx` returns that descriptor, and `rtl_convertTextToUnicode` unconditionally invokes the descriptor's forward callback.
- Observation: an existing encoding descriptor does not guarantee a callable forward converter. Invoking the null callback is undefined native execution, not the missing-descriptor dummy path. This is a source-level contract finding; no null callback is executed by the native witnesses.
- Preservation: retain descriptor identity, reverse conversion, stateless context and explicit null forward callback. The JavaScript callback binding raises a TypeError at invocation instead of supplying a decoder or routing to the missing-descriptor fallback; this does not claim a portable C++ undefined-execution outcome.

### WRITER183 — JIS X 0201 maps U+FF65 to ASCII Z and lacks yen/overline mappings

- Source: pinned `sal/textenc/tcvtjp6.tab`, `aImplJISX0201Tab`, contains 0x5A at offset 4 of the U+FF61..U+FF9F range, between 0xA4 and 0xA6. Its byte-converter descriptor supplies this range and no extra Unicode-to-byte mapping table.
- Observation: the original data maps U+FF65 to byte 5A; yen U+00A5 and overline U+203E have no mapping and follow the undefined-input policy. This is source table/algorithm evidence; the generic JIS factory is not independently compiled by the ISO-2022 witness.
- Preservation: retain the captured original table and missing aliases. Do not replace 0x5A with 0xA5 or add familiar JIS Roman mappings to make a conventional encoder result.


### WRITER184 — Checked Unicode-to-byte conversion tests ERROR before retrying a small destination

- Source: pinned `sal/rtl/string.cxx`, `rtl_impl_convertUStringToString`, returns false for checked conversions on INFO_ERROR before its DESTBUFFERTOSMALL retry. Pinned `sal/textenc/convertsimple.cxx`, `convertUnicodeToChar`, sets ERROR together with DESTBUFFERTOSMALL when a mapped two-byte result does not fit. Encoding metadata may estimate one byte per unit while allowing two.
- Observation: a checked conversion can reject an encodable single unit because the initial estimate is too small. For the MS1258 U+1EAF two-byte mapping, the source metadata estimates one byte, so the native control flow returns false instead of growing the buffer; unchecked conversion retries. This combined case is a source/control-flow trace plus local test; the isolated compiled string-wrapper witness covers the four core encodings, not MS1258.
- Preservation: retain the original estimate and ERROR-before-DESTBUFFERTOSMALL order. Do not retry checked failures first or redefine CanEncode as a direct mapping-membership check.

### WRITER185 — RTF numbering-level text emits only the first UTF16 unit of a bullet

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::NumberingLevel`, takes `rNumberingString[0]` for CHAR_SPECIAL/BITMAP and writes its signed16 value followed by a space and question mark. `wrtw8num.cxx`, `GetNumberingLevelBulletStringAndFont`, creates that string from the UCS4 bullet value.
- Observation: a supplementary bullet is represented as a surrogate pair in the numbering string, but the level-text writer emits only its high surrogate. This is a source-level trace, not a compiled full Writer differential. A zero bullet is likewise emitted as U+0000; the exporter must not replace it with an invented default bullet.
- Preservation: retain first-unit indexing and the exact signed Unicode control with its space and fallback. Normal run text still emits all UTF16 units through OutString; do not reuse that different behavior for numbering-level text.

### WRITER186 — Used-style iteration omits a style whose whole path is ignorable

- Source: pinned `svl/source/items/stylepool.cxx`, `Iterator::getNext` and `Node::nextItemSet`. A newly selected root is tested for its own item set, then traversal skips ignorable children. The ignorable-child representative check is performed only after obtaining a subsequent node.
- Observation: a used style whose entire path consists of ignorable items is omitted by `getAllStyles`; an ordinary non-ignorable prefix makes its used ignorable tail visible. The unchanged compiled Node/Iterator/StylePoolImpl witness confirms this with real standard shared pointers under ASan/UBSan. Item/set/iterator values in that witness are explicit probe carriers, not a full native SfxItemSet/Writer ABI.
- Preservation: retain the root transition and child-skip order. Do not add a special root-tail representative to make iteration appear exhaustive.

### WRITER187 — Complete style-name cache population selects one non-shareable representative per node

- Source: pinned `svl/source/items/stylepool.cxx`, `Node::getUsedOrLastAddedItemSet`, `Iterator::getNext` and `StylePool::populateCacheMap`.
- Observation: even with unused/ignorable filtering disabled, iteration returns one shared set for each populated node: the newest externally used non-shareable copy, or the last-added copy if all are unused. Cache population consequently cannot recover every older non-shareable pointee name from the pool. The unchanged compiled Node/Iterator/StylePoolImpl witness confirms representative selection and usage transitions with real shared ownership; the full UNO cache-service graph is not compiled by that witness.
- Preservation: keep representative selection and one-node/one-result iteration. Do not flatten all retained non-shareable handles into the name cache or font collection.


### WRITER188 — Forward string conversion can leave a released old pointer in its target after allocation failure

- Source: pinned `sal/rtl/ustring.cxx`, `rtl_string2UString_status`, releases `*ppThis` before allocating the general converter temporary. On temporary allocation failure it records ERROR/DESTBUFFERTOOSMALL and returns without assigning the target slot. The ASCII retry can likewise retain its released temporary pointer until successful replacement.
- Observation: the target slot can still alias the old allocation although its owned reference was already consumed. With a sole former owner this is a dangling native pointer; with an independently retained reference it aliases that other owner's string. This is source control-flow evidence plus a local failure-injection test; the sanitized native witness covers successful allocations and does not dereference this failure state.
- Preservation: retain the original release order, failure status and target-slot alias. Do not make forward checked conversion preserve ownership like the reverse checked wrapper. Access to freed data remains outside the native contract.


### WRITER189 — Font map-name digit removal never updates its output family

- Source: pinned `unotools/source/config/fontcfg.cxx`, `FontSubstConfiguration::getMapName`, constructs an OUStringBuffer from `rFamilyName`, removes ASCII digits in that buffer, and returns without assigning the buffer back to `rFamilyName`.
- Observation: the family-name output retains those digits despite the final removal loop. Preserve the returned value and do not silently apply the discarded edits. The unchanged compiled function is exercised with numeric names by the map-name witness; string storage is an explicit carrier rather than a full SAL ABI claim.
- Preservation: the port retains the unchanged family output after ordered attribute removal. Digit normalization is not added to this owner.

### WRITER190 — Font equality and hashing omit the stored width classification

- Source: pinned `vcl/source/font/font.cxx`, `ImplFont::EqualIgnoreColor` and `ImplFont::GetHashValueIgnoreColor`, compare/hash weight, italic, family and pitch but never `meWidthType`. The one-shot `mbConfigLookup` flag is also outside value equality.
- Observation: two otherwise equal Font values can have different stored width classifications and still compare equal. This is source-level value-contract evidence, not a compiled full VCL ABI certificate.
- Preservation: expose width getters/setters and configuration lookup while leaving width and the lookup flag out of Font equality. Do not infer a new comparison field from the newly represented metadata.


### WRITER191 — Font family-name assignment does not invalidate completed configuration lookup

- Source: pinned `vcl/source/font/font.cxx`, `ImplFont::AskConfig`, sets `mbConfigLookup` before any lookup and returns immediately on subsequent calls. `Font::SetFamilyName` delegates to `ImplFont::SetFamilyName` in `vcl/inc/impfont.hxx`, which changes only `maFamilyName`; the flag is copied by the ImplFont copy constructor.
- Observation: a font queried under an unrecognized name can remain unresolved after its family name is changed to a configured family. Copy-on-write does not reset the copied flag. This is source control-flow evidence and a local value test, not a complete compiled VCL witness.
- Preservation: keep the one-shot flag and the setter's lack of invalidation. A new Font created with the configured name can resolve independently.


### WRITER192 — The Baekmuk special case tests a different second UTF16 unit

- Source: pinned `unotools/source/config/fontcfg.cxx`, `ImplKillLeading`, labels its Korean special case Baekmuk but tests the units U+BC31, U+BC35. The usual `백묵` sequence is U+BC31, U+BB35, so it does not enter this branch.
- Observation: the unchanged compiled helper retains the usual Korean prefix, while it strips the source's literal U+BC31/U+BC35 sequence. The port's initial word-based transcription was caught by this differential witness and replaced with the exact source numeric predicates.
- Preservation: keep U+BC35 in the predicate. Do not correct the second unit or replace it with the usual family spelling.


### WRITER193 — AskConfig classifies SCRIPT family from Italic rather than Script flags

- Source: pinned `vcl/source/font/font.cxx`, both family-selection sequences in `ImplFont::AskConfig` test `ImplFontAttrs::Italic` to assign `FAMILY_SCRIPT`. They do not test `ImplFontAttrs::Script`, Handwriting or BrushScript. The `getMapName` table in `unotools/source/config/fontcfg.cxx` assigns Script/BrushScript for the `script` word and Italic for `italic`/`oblique`.
- Observation: an otherwise unclassified name containing `script` can remain FAMILY_DONTKNOW while a name containing `italic` becomes FAMILY_SCRIPT. This is a source-level branch trace and local value test, not an independently compiled full AskConfig witness.
- Preservation: keep the exact flag and priority order in configured and heuristic branches. Do not substitute the generic Script bit.


### WRITER194 — ResetAllFormatAttr leaves a numbering rule's paragraph-style client registered

- Source: pinned `sw/source/core/doc/fmtcol.cxx`, `SwTextFormatColl::SetFormatAttr` and `ResetFormatAttr`, explicitly remove a direct numbering client's registration. `SwTextFormatColl::ResetAllFormatAttr` instead calls `SwFormatColl::ResetAllFormatAttr`; the inherited implementation in `sw/source/core/attr/format.cxx` clears `m_aSet` directly and does not call the virtual single/range reset. The numbering-related notification branch only checks outline assignment and does not unregister that client.
- Observation: clearing all attributes can leave `SwNumRule::GetParagraphStyleListSize()` nonzero after the style no longer has a direct numbering item, so the numbering overload of `SwDoc::IsUsed` still reports use. This is source control-flow evidence and a local owner test; a complete native Writer execution is not claimed.
- Preservation: keep the explicit registration boundaries of the source single-item/set/range operations. Do not add cleanup to the inherited reset-all path while porting used-numbering-table prerequisites.


### WRITER195 — Duplicate numbering-rule names replace the lookup while retaining the previous default list

- Source: pinned `sw/source/core/doc/docnum.cxx`, `SwDoc::AddNumRule`, appends the transferred rule to the table and assigns `maNumRuleMap[pRule->GetName()]` without rejecting an existing name. `DocumentListsManager::createListForListStyle` in its corresponding `.cxx` returns after a nonfatal diagnostic when the style already has a default list.
- Observation: both rule objects remain in table order; name lookup resolves the newly appended rule while the existing default-list mapping still refers to its previous list. A fresh duplicate can retain an empty DefaultListId. This is a source control-flow trace and an actual local owner test, not a complete compiled Writer witness.
- Preservation: remove the old port's duplicate-name exception and implicit clone. Retain actual transferred identities, table insertion, last-name lookup and the existing default-list mapping.


### WRITER196 — InitFontTable does not visit Writer's tenth list level

- Source: pinned `sw/source/filter/ww8/wrtw8sty.cxx`, `wwFontHelper::InitFontTable`, uses `WW8ListManager::nMinLevel` for continuous rules and `nMaxLevel` otherwise. The pinned `sw/source/filter/ww8/ww8par.hxx` defines those bounds as 1 and 9, while SwNumRule supports ten levels.
- Observation: a bullet font referenced only at zero-based level 9 is absent from this initialization traversal, even when the rule is used. Continuous rules contribute only level 0. This is exact source-bound evidence and a real RTF integration test, not a complete compiled Writer witness.
- Preservation: retain the original bounds instead of expanding the Word exporter to ten levels. The used-numbering table still includes the actual outline owner independently of its use.

### WRITER197 — StarSymbol duplicate-key font preference depends on the standard multimap find

- Source: pinned `unotools/source/misc/fontcvt.cxx`, `StarSymbolToMSMultiFontImpl` inserts conservative and aggressive reverse tables into `std::multimap` in its stated preference order, but `ConvertChar` calls `find`, not `lower_bound`. Selection among equivalent keys is a standard-library binding detail rather than an explicit first-preference choice.
- Observation: the unchanged locally compiled constructor/ConvertChar/factory selects Webdings for U+0020 rather than the first inserted Symbol entry. A simple first-entry JavaScript map port therefore disagreed at the first mapped unit. The browser binding now retains duplicate nodes and the measured red/black insertion/direct-lookup behavior; all 65536 UTF16 inputs match the unchanged native witness. This certifies the fixed input tables on that native runtime, not cross-standard-library identity or the SAL ABI.
- Preservation: do not silently replace find with a first-preference lookup. RTF still keeps its original m_bSubstituteBullets=false branch, so its bullet strings and fonts bypass this conversion exactly as upstream does.


### WRITER198 — Word numbering separator suppression can retain adjacent separators

- Source: pinned `sw/source/filter/ww8/wrtw8num.cxx`, `MSWordExportBase::NumberingLevel`, `oEraseFrom` handling for unsupported forward references and `%10%`.
- Observation: at level 2, `%3%/%9%/suffix` keeps the slash already appended before `%9%` and appends `/suffix` from the remembered suffix start. The resulting level string is U+0002 followed by `//suffix`. `%3%/%10%/end` similarly retains two slashes. This follows the source loop directly; it is not a compiled full-Writer or desktop defect confirmation.
- Preservation: keep the original append/erase state and suffix restoration rather than normalizing separators. Focused actual-owner RTF tests assert both strings, the source nine-byte positions and their unsigned-byte overflow.


### WRITER199 — Character-item visitors revisit accumulated automatic styles

- Source: pinned `sw/source/core/doc/doc.cxx`, template `ForEachCharacterItem`; `svl/source/items/stylepool.cxx`, `StylePool::getAllStyles`; `sw/source/core/doc/swstylemanager.cxx`, family-to-pool routing.
- Observation: the template allocates its vector outside the four-family loop, getAllStyles appends, and each iteration visits the entire accumulated vector. With one used character and one used non-character style, callbacks visit the character four times and the other style six times because RUBY/PARA/NOTXT share the paragraph pool. RTF color insertion deduplicates colors, but a different callback can observe the repeated visits. This is source-bound evidence, not a complete native runtime certification.
- Preservation: retain append-only collection, repeated callback order and immediate false-stop behavior. Browser shared handles release every appended reference on completion, false return and callback exceptions; focused actual-owner tests check the order and reference counts.


### WRITER200 — Numbering lifetime and temporary-rule counters are unsigned16

- Source: pinned `sw/inc/numrule.hxx`, static `sal_uInt16 snRefCount`; `sw/source/core/doc/number.cxx`, rule constructors/destructor; `sw/source/filter/ww8/wrtww8.hxx`, `sal_uInt16 m_nUniqueList`; `wrtw8num.cxx`, `DuplicateNumRuleImpl`; `wrtww8.cxx`, base destructor.
- Observation: more than65535 simultaneously live rules can wrap the global reference count, making first/last-rule tests unreliable for the four shared base tables. After enough temporary export rules the unsigned16 unique counter also wraps, so the destructor's borrowed-prefix/owned-tail split can no longer describe all created temporaries. The per-document rule-table limit does not bound rule totals across documents and exporters. This is a source-level edge-case inference, not a compiled stress witness or confirmed desktop defect.
- Preservation: retain both unsigned16 counters and original post-increment/decrement and tail-split logic rather than silently widening them. Ordinary valid-owner lifetimes and actual client release are covered by focused tests; native overflow/undefined-behavior equivalence is not certified.


### WRITER201 — GetSlot(null) finds an empty reserved style entry

- Source: pinned `sw/source/filter/ww8/wrtw8sty.cxx`, `MSWordStyles::GetSlot` compares every entry's format pointer with the supplied pointer without a null guard. `MSWordExportBase::GetId(const SwCharFormat*)` applies fallback10 only when that lookup returns0x0fff.
- Observation: a valid table with Standard at0 and no headings returns1 for null; after filling heading slots1..9 it returns10. Thus the character GetId comment about default character style does not describe every null-pointer call. The unchanged native lookup compiled with a vector-entry carrier confirms1/10 under ASan/UBSan. This does not certify the full Writer ABI or desktop rendering.
- Preservation: use actual pointer identity, including null/undefined entries, instead of returning the missing sentinel early for a null argument. Actual-exporter tests check both slot layouts and the different fallback for a non-null default character format absent from the table.

### WRITER202 — RTF style normalization can replace active style properties with hard-coded run defaults

- Source: pinned `sw/source/writerfilter/rtftok/rtfsprm.cxx`, `getDefaultSPRM`, `cloneAndDeduplicateSprm` and `RTFSprms::cloneAndDeduplicate`; `rtfdocumentimpl.cxx`, `RTFDocumentImpl::getProperties`; `sw/source/filter/ww8/rtfattributeoutput.cxx`, `TextCharFormat` and `OutputTextCharFormat`.
- Observation: for character normalization, an absent direct property can introduce an override over the flattened paragraph/character-style reference. The helper supplies bold/italic zero, underline none, 24 half-points, literal color zero and `Times New Roman` for the applicable font families. Thus a selected named style is not sufficient to inherit these values when the run omits their commands. Other families, including kerning, strikeout and highlight, have no default in this helper. The exporter explicitly comments that character style properties must accompany the run and repeats them. This may be intentional RTF normalization; the surprising hard-coded style override is recorded without classifying it as a confirmed upstream defect.
- Preservation: retain the named `SwCharFormat` reference and produce native direct defaults for the represented families instead of flattening all style values into the text or assuming universal inheritance. Export the actual `\\cs` identifier before repeated effective properties. `\\plain` clears the direct kerning property; it does not invent a false override over an otherwise inherited style value.
- Evidence: `scripts/rtf-style-defaults-native-probe.mjs` compiles unchanged pinned `getDefaultSPRM` and `getParagraphBorder` with original generated OOXML IDs, recognizing nine defaults among 35 queried tokens under ASan/UBSan. Scalar/nested value carriers do not prove the full `RTFValue`/`RTFSprms`, mapper or desktop Writer ABI. `rtf-character-styles.test.ts` covers actual browser owners, direct/default differences, named references, parent changes, group/plain behavior, unknown lookup and Worker/RTF round trips. No native desktop run is claimed.

### WRITER203 — RTFValue equality ignores the force-string discriminator

- Source: pinned `rtfvalue.cxx`, `RTFValue::equals`, `getString`, `getAny` and `Clone`.
- Observation: an integer-default value and an empty forced-string value compare equal because the equality predicate checks integer/string contents and nested lists but omits `m_bForceString`. Their string/Any results differ. Style deduplication uses this predicate. No confirmed desktop-document symptom is claimed.
- Preservation/evidence: keep the omitted flag comparison. Compiled unchanged scalar query/equality functions report `forceEquality=true`; actual owner tests retain distinct `"0"` and empty-string queries and clone the force flag. The witness's remaining value/string transport is explicitly bounded in `rtf-properties-native.json`.

### WRITER204 — Nested RTF attribute erase can mutate a shared outer value

- Source: pinned `rtfdocumentimpl.cxx`, `eraseNestedAttribute`; `rtfsprm.cxx`, `RTFSprms::find`, `ensureCopyBeforeWrite` and `deduplicateList`.
- Observation: nested insertion uses `find(..., true, true)` to detach the outer shared payload. Nested erase instead performs a read lookup, then mutates the attribute list on the shared value object. Copying an outer RTFSprms followed by nested erase can therefore change both original and copy. Its use by invalid-list-indent deduplication retains this alias behavior.
- Preservation/evidence: do not add an outer write barrier to erase. Unchanged compiled RTFSprms/nested-helper/SvRef algorithms and runtime owner tests match `nestedEraseA/B` and subsequent isolated `nestedWriteA/B` cases. These are source-container observations, not a complete Writer desktop round trip.

### WRITER205 — Expected-child normalization can leave the original modifier intact

- Source: pinned `rtfsprm.cxx`, `cloneAndDeduplicateSprm` and `isSPRMChildrenExpected`.
- Observation: for unequal parent values whose normalized children become empty, an expected-child modifier skips the replacement `set` call. The direct tree was already copied into the result, so its original modifier can remain unchanged; the guard does not explicitly erase it. This differs from the apparent reading of the nearby removal comment.
- Preservation/evidence: retain the skipped replacement without inserting an erase. The compiled `emptyExpectedChildren` case and actual runtime property-tree test preserve the original scalar2 parent and first-line120 attribute. No broader desktop symptom is asserted.


### WRITER206 — RTF parent and follow links capture unknown names before later declarations

- Source: pinned `rtfdispatchvalue.cxx`, SBASEDON/SNEXT dispatch; `rtfdocumentimpl.cxx`, getStyleName and stylesheet insertion; `rtfvalue.cxx`, getString.
- Observation: these commands immediately call getStyleName with the numeric index. An index whose name has not yet been read returns an empty OUString. The resulting non-forced RTFValue reports the string `"0"`; later style declarations do not rewrite the stored name. A forward link can therefore fail to select the later named style. This is an inference from the source owner chain, not a confirmed desktop-document result.
- Preservation/evidence: capture the current name at control dispatch and preserve the original empty-string query semantics. Actual RTFValue tests already compare the empty non-forced value with `"0"`; native character-style tests distinguish backward parent/follow links from forward declarations. Do not introduce deferred numeric-index resolution to repair this behavior.


### WRITER207 — Style-name suffix removal requires more than one prefix character

- Source: pinned `SwStyleNameMapper.cxx`, lcl_SuffixIsUser, lcl_CheckSuffixAndDelete and character-family FillProgName/FillUIName.
- Observation: the shared suffix predicate requires total UTF16 length greater than8 before recognizing the seven-unit ` (user)` suffix. Thus `A (user)` remains unchanged, while `AB (user)` can lose its suffix. The upstream comment itself questions the one-character-prefix exclusion and records its historical origin.
- Preservation/evidence: retain the strict greater-than8 guard in both admitted character-name directions. Actual character-family tests compare zero-, one- and two-character prefixes, programmatic/UI hyperlink aliases and collision lookup. This is source-contract evidence, not a desktop-document certification.


### WRITER208 — Ignored character-style highlighting can remove an equal direct run highlight

- Source: pinned `DomainMapper.cxx`, LN_EG_RPrBase_highlight, ignores character-style highlighting; `rtfdocumentimpl.cxx`, raw style references/getProperties; `rtfsprm.cxx`, cloneAndDeduplicate.
- Observation: the raw RTF style reference still contains its highlight. An equal direct run value may therefore deduplicate away even though the materialized character style ignores the value, leaving that run without the requested highlight. A different direct color survives. This is a source-chain inference, not a confirmed desktop-document result.
- Preservation/evidence: retain the mapper exclusion and original raw-reference normalization. Actual RTF owner tests distinguish an equal inline highlight from a different inline RGB value, while paragraph-style highlighting remains supported. No corrective fallback applies character-style highlighting.


### WRITER209 — RTF exporter writes updnprop but writerfilter does not recognize it

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::OutputCharEscapement`, writes a starred `updnprop` group carrying proportional height and an automatic-position flag before numeric `up`/`dn`. The pinned `sw/source/writerfilter/rtftok/rtftokenizer.cxx` keyword table has no updnprop entry; its dispatch/value/flag handlers consume position and vertAlign independently. The older editeng RTF importer is a different consumer.
- Observation: the current writerfilter import path cannot recover that extension's height/automatic metadata through this keyword. For ordinary numeric displacement it uses the final font height and sets proportional height to 100. Thus the exporter and reader do not promise exact escapement item roundtrips. Desktop document differential behavior remains unverified.
- Preservation/evidence: remove our custom pendingUpDn interpretation and preserve the actual unknown starred group handling. Tests exercise real exported bytes and actual document import, distinguish conventional super/sub from numeric position, and retain the native reader's height reduction. No compensating parser extension is introduced.


### WRITER210 — Markdown HTML insertion passes an empty base URL

- Source: pinned `sw/source/filter/md/swmd.cxx`, `SwMarkdownParser::InsertHtmlData`, constructs SwReader with two empty OUString arguments; the stream insertion constructor in `sw/source/filter/basflt/shellio.cxx` assigns the second string as its base URL.
- Observation: the embedded native HTML reader receives an empty base URL even when the surrounding Markdown reader has a nonempty source base URL. Relative-resource behavior may therefore differ across Markdown and embedded HTML paths. This is a source-level finding; desktop differential behavior is unverified.
- Preservation: the connected raw HTML path retains empty path/base URL arguments. No compensation using the Markdown parser's m_sBaseURL is introduced; link/font/CSS/table producers remain separately tracked work.

### WRITER211 — CSS property-info copying and resetting omit whitespace/visibility flags

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, `SvxCSS1PropertyInfo` copy constructor, `Clear` and `Merge`; member defaults in `svxcss1.hxx`.
- Observation: copy construction leaves `m_bPreserveSpace=false` and `m_bVisible=true` instead of copying them; `Clear` and `Merge` leave the destination flags unchanged. A parsed `white-space: pre` can therefore behave differently through an inline property-info owner and a copied stylesheet map entry.
- Local behavior: scalar owners retain these omissions. This is source-level evidence; visible stylesheet/whitespace integration and compiled upstream differential behavior remain unverified.

### WRITER212 — Unknown CSS text-decoration values enable underline

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, `ParseCSS1_text_decoration` default switch branch.
- Observation: an admitted identifier/string other than the recognized decoration values sets single underline rather than discarding that value.
- Local behavior: the native property handler and actual HTML/Markdown document insertion retain this fallback. `swhtml.native.integration.test.ts` checks unknown-value underline and restoration after the closing tag. This is not a compiled upstream differential certificate.

### WRITER213 — CSS font shorthand consumes keyword sizes as prefix identifiers

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, `ParseCSS1_font` prefix loop and subsequent font-size dispatch.
- Observation: the prefix loop consumes every identifier/string/number with no operator, including `medium` and subsequent family identifiers. If no later expression remains, the handler returns without applying any font reset. The separate `font-size` handler does recognize size keywords. This is source-level evidence, not a compiled desktop result.
- Preservation: do not replace the loop with browser CSS shorthand parsing. Actual HTML insertion verifies that `font: medium Example` leaves the outer bold attribute intact.

### WRITER214 — Incomplete CSS font shorthand can apply partial attribute changes

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, `ParseCSS1_font` writes posture/case/weight resets and font size before checking for the optional slash and font-family expression.
- Observation: `font: 18pt` has no family, but can still reset weight/posture and set height. The declaration is not transactionally rejected after the missing family is found. This is source-level evidence, not compiled upstream differential behavior.
- Preservation: actual native HTML attribute insertion keeps these partial writes, including explicit normal weight inside an outer bold span. Tests cover restoration after the closing span and real Markdown/Worker font-item transport.

### WRITER215 — Legacy FONT uses Western attribute heads for all three scripts

- Source: pinned `sw/source/filter/html/swhtml.cxx`, `SwHTMLParser::NewFontAttr` branch without style options. All three height items are passed to `pFontHeight`, and all three font items to `pFont`; the CSS/InsertAttrs branch and NewBasefontAttr use separate Western/CJK/CTL heads.
- Observation: script-specific items are linked through one shared Western head rather than their individual script heads. This can change deferred-chain ordering and interactions with nested font attributes. This is source-level evidence; no compiled desktop symptom is asserted. A simple mixed-script case still applies all three values after native range selection.
- Preservation: retain the exact head selection. Actual parser-state tests distinguish the shared chain from the CSS branch, and actual selected-range tests cover Western, CJK and CTL family/height items. Do not normalize the head wiring merely because it looks like a copy/paste error.

### WRITER216 — FONT without SIZE pushes a zero logical size affecting nested BIG

- Source: pinned `sw/source/filter/html/swhtml.cxx`, `SwHTMLParser::NewFontAttr` initializes `nSize=0`, changes it only for SIZE or BIG/SMALL, and unconditionally appends it to `m_aFontStack`. The next font element reads the stack tail masked with FONTSIZE_MASK.
- Observation: a face-only FONT can cause a nested BIG to choose logical size 1 rather than enlarging the inherited logical size. In the consumed default configuration, `<font face="Example"><big>A</big></font>` produces the first configured height (7pt). This is source-derived actual-model behavior, not a compiled LibreOffice defect confirmation.
- Preservation: retain the zero entry and original seven-step arithmetic. Do not infer a missing SIZE from the effective font item or replace it with the base logical size.

### WRITER217 — Unmatched legacy font closing tags still pop the size stack

- Source: pinned `sw/source/filter/html/swhtml.cxx`, `SwHTMLParser::EndFontAttr` calls EndTag and then independently removes the last size when above the stack minimum; it does not require a matching context to have been found.
- Observation: in `<font size="5">A</big><big>B</big>C</font>D`, the unmatched BIG closer removes the size-5 stack entry while the FONT context remains open. The following BIG consequently uses base size 3 and emits logical size 4. Existing FONT attributes still cover A/C. This is source-derived actual-model evidence; compiled upstream differential behavior remains unverified.
- Preservation: retain the independent token-context search and stack pop, including minimum guards. Do not make size removal conditional on context lookup success.

### WRITER218 — CSS margin and text-indent handlers ignore bare zero

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, ParseCSS1_margin_left/right/top/bottom, ParseCSS1_margin and ParseCSS1_text_indent switch on LENGTH/PIXLENGTH, with no NUMBER-zero branch.
- Observation: `margin-left: 0` does not reset an earlier authored margin, although `margin-left: 0pt` does. Unsupported shorthand tokens still consume their positional index; earlier sides remain applied rather than rolling back the declaration. This is source-level evidence, not a compiled desktop defect confirmation.
- Preservation: actual HTML insertion retains both behaviors. A shorthand `margin: 1pt auto 3pt` keeps 1pt on both horizontal sides and 3pt below; a later bare-zero left margin leaves that value intact.

### WRITER219 — CSS auto margin recognition uses a case-sensitive string comparison

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, ParseCSS1_margin_left/right compare `pExpr->GetString() == "auto"` rather than an ASCII-insensitive CSS keyword comparison.
- Observation: lowercase `auto` sets the margin flag/type without producing a numeric margin item; differently cased spellings do not enter that branch. Other recognized CSS property handlers use ASCII-insensitive lookup. This is a source-level finding; a compiled document/layout effect is not established.
- Preservation: retain the literal comparison and source flag/type state. Do not substitute a browser CSS declaration normalizer.

### WRITER220 — CSS text-indent clamps absolute lengths but wraps pixel lengths

- Source: pinned `sw/source/filter/html/svxcss1.cxx`, ParseCSS1_text_indent LENGTH branch rounds/clamps to signed16, while the PIXLENGTH branch converts truncated pixels to twips then casts directly to short.
- Observation: physically equivalent `text-indent: 2250pt` and `text-indent: 3000px` become 32767 and -20536 twips respectively. The pixel path can reverse the indent sign through signed16 narrowing. This is source-derived actual-model evidence; compiled LibreOffice differential behavior is unverified.
- Preservation: retain both conversion branches and their distinct outcomes; do not unify them through browser CSS length conversion or a common clamp.

### WRITER221 — HTML duplicate bookmark names depend on deferred queue flush boundaries

- Source: pinned `sw/source/filter/html/htmlgrin.cxx`, InsertBookmark appends a filter-private HTMLAttr to m_aSetAttrTab; swhtml.cxx SetAttr_ walks that queue backward and suppresses only an existing original-name mark at the same point before makeMark allocates a unique name.
- Observation: two same-name targets in one paragraph are created in reverse pending order, so the later target keeps the original name and the earlier gets a copy suffix. A paragraph boundary can flush the earlier target first, reversing which position receives the original name. This is source-derived actual-model behavior; no compiled LibreOffice defect is asserted.
- Preservation: keep queued raw positions, reverse processing and exact name/position deduplication. Actual parser tests distinguish same-point suppression, within-paragraph allocation and cross-paragraph allocation; no eager bookmark creation or input-order normalization is introduced.

### WRITER222 — URI domain scanning admits underscores despite its domain grammar

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::scanDomain`, accepts `_` alongside ASCII alphanumeric characters in its Dot, Label and Hyphen states. The surrounding source grammar describes labels using alphanumeric characters and hyphens.
- Observation: the lexical scanner admits underscore-containing labels, including labels beginning or ending with an underscore. This is a source-level grammar/implementation discrepancy; acceptance by the complete URL parser and a visible Writer symptom are not established.
- Preservation: retain the scanner's character tests when porting the native URI path required by HTML HREF. Do not substitute browser hostname validation or infer that this scanner alone certifies a complete URL. The local scanner port is covered by `urlobj.lexical.test.ts`; complete native HREF resolver/filter integration remains pending.

### WRITER223 — URI IPv6-reference scanner leaves address validation as a TODO

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::scanIPv6reference`, explicitly contains `TODO: check for valid IPv6address (RFC 2373)` and scans only hexadecimal digits, colons and dots between brackets.
- Observation: the lexical scanner can recognize `[]` and `[:]` as bracketed references. This does not establish that the complete URL parser accepts them: the separate host parser has additional validation. This is a source-level finding, not a confirmed LibreOffice document defect.
- Preservation: retain the scanner's recognition and cursor-advance rules when porting the consumed native URI path; preserve downstream host validation separately. Do not silently strengthen the scanner or weaken the complete parser. The local scanner port is covered by `urlobj.lexical.test.ts`; complete native HREF resolver/filter integration remains pending.

### WRITER224 — URI UCS4 escape output includes sequences rejected by its scalar decoder

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::appendUCS4Escape` supports values below 0x80000000 with up to six escaped bytes and has no surrogate exclusion. `INetURLObject::getUTF32` accepts escaped UTF8 only through lead byte 0xF4, requires a Unicode scalar and rejects overlong encodings.
- Observation: the low-level writer can emit `%ED%A0%80` for an isolated surrogate or five/six-byte sequences for values beyond Unicode, while the decoder preserves these as escaped octets rather than reconstructing the input value. This is a source-level asymmetry, not proof that Writer's complete URL path generates every such input or a confirmed desktop defect.
- Preservation: retain the distinct writer and decoder ranges rather than replacing both with a browser TextEncoder/TextDecoder pair. Native lexical tests cover raw surrogate input, rejected escaped surrogates, the Unicode upper bound and the legacy output branch boundaries; full native HREF integration remains pending.

### WRITER225 — URI host IPv4 components have no 255 upper bound

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::parseHost`, STATE_IP4 and STATE_IP6_IP4 accumulate up to three decimal digits per component without checking the value against 255; the embedded IPv4 ambiguity branches likewise convert decimal digits without a range check.
- Observation: the host parser admits `999.888.777.666` and corresponding embedded numeric components, and canonicalizes leading zeros. This is confirmed against the unchanged extracted native host function under ASan/UBSan; complete LibreOffice URL/filter/UI behavior is not certified by that isolated probe.
- Preservation: keep source digit-count and state admission rather than applying browser IP-address validation. `urlobj.components.test.ts` pins canonical output and caller cursor behavior. Complete native HREF integration remains pending.

### WRITER226 — URI host IPv6 state machine does not enforce the total group count

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::parseHost`, STATE_IP6_HEXSEQ1/STATE_IP6_HEXSEQ2 accept a closing bracket without counting total groups; colon transitions do not track an eight-group maximum.
- Observation: the isolated host function admits `[a]` and `[1:2:3:4:5:6:7:8:9]`. It still rejects other invalid transitions such as `[1::2::3]`, so replacing it with the separate permissive bracket lexer would also change behavior. Extracted native differential evidence establishes the host-function result, not complete document/UI behavior.
- Preservation: retain the exact native state machine, numeric normalization and pointer commits. Host tests distinguish admitted and rejected forms; no browser IPv6 validator or silent group-count repair is introduced.

### WRITER227 — Generic and SFTP path emptiness checks include the existing URI prefix

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::parsePath`, the Generic/Sftp branch checks `rSynPath.isEmpty()` rather than the change from `nSynPathBeforeLen`. Other branches explicitly compare the appended path length.
- Observation: an empty path succeeds when the caller already populated the output buffer with a scheme/authority, but fails with an empty output buffer. This is a source-level dependency on buffer state; it is not a compiled complete-parser or desktop defect confirmation.
- Preservation: the local path function retains the full initial output string and that exact emptiness check. A focused test distinguishes empty and populated buffer calls; do not normalize the branch to a path-length check or add a default slash.

### WRITER228 — SFTP path scanning consumes the query delimiter despite its scheme flag

- Source: pinned `tools/source/fsys/urlobj.cxx`, SchemeInfo marks Sftp as supporting a query, but `INetURLObject::parsePath` handles it with Generic and stops only at the fragment delimiter. The later `setAbsURIRef` query branch can only run if the path parser stopped at `?`.
- Observation: the SFTP path production consumes `/a?q` as its path, whereas the HTTP path production stops before `?`. The resulting URL spelling can conceal the internal path/query difference. This is source-level evidence and a local path-function result; complete LibreOffice URL/filter behavior remains unverified.
- Preservation: retain the scheme flag and path stop condition independently. A focused path test pins the source cursor/output, and no browser query splitter or HTTP-path substitution is introduced.

### WRITER229 — A query-only relative URI is resolved against the base directory

- Source: pinned `tools/source/fsys/urlobj.cxx`, `INetURLObject::convertRelToAbs`, STATE_AUTH treats an initial query delimiter as STATE_REL_PATH; that branch first copies the base path only through its last slash, then appends the new query.
- Observation: resolving `?q` against `http://host/dir/file` produces `http://host/dir/?q`, dropping the base filename. Empty and leading-fragment inputs take a different path and retain the full base path. This is source-derived local-value behavior, not a compiled complete-LibreOffice differential certificate.
- Preservation: retain the state selection and base-directory copy. `urlobj.object.test.ts` checks query-only, empty and fragment-only cases separately; no browser URL query-resolution rule is substituted.

### WRITER230 — HTTP and HTTPS authority flags reject user information

- Source: pinned `tools/source/fsys/urlobj.cxx`, getSchemeInfo marks Http/Https with m_bUser=false; setAbsURIRef consequently passes the entire authority containing an unescaped `@` to the host parser, whose complete-consumption check fails.
- Observation: `http://user@host/` is rejected by this native path rather than parsed into user and host fields, although FTP/SFTP admit user information through separate flags. This is a source-derived local parser result; intentional policy versus defect and compiled desktop behavior remain unverified.
- Preservation: keep the original flags and host admission. URI-value tests check rejection and full invalidation rather than adopting browser user-info parsing.

### WRITER231 — Extended UNC relative detection retains the pre-prefix delimiter distance

- Source: pinned `tools/source/fsys/urlobj.cxx`, convertRelToAbs computes `n` from q after the initial double backslash, then can advance q past `?\\` and `UNC\\` while constructing qe from the original `q + n` distance.
- Observation: the tentative host range can describe only the first host character after an extended UNC prefix instead of the full server name. A later smart absolute parse still validates the resulting reference; this finding alone does not prove acceptance of an invalid full URL. Native OUString's terminating NUL also matters when the tentative range extends through the terminator. This is source-level evidence, not a compiled defect confirmation.
- Preservation: retain the original distance reuse and native terminating-NUL view in the relative-value port. Original Windows long-drive and extended-UNC CppUnit cases are represented in URI-value tests; no opportunistic range recalculation is introduced.

### WRITER232 — Recognized private sub-prefixes are stored outside the path range

- Source: pinned `tools/source/fsys/urlobj.cxx`, getPrefix recognizes `private:factory/` and similar longer internal prefixes; setAbsURIRef appends that entire prefix before recording the later m_aPath start offset.
- Observation: `private:factory/swriter` retains that complete main URL, but GetURLPath(NONE) returns only `swriter`. A reference admitted through the shorter `private:` prefix records a different path boundary. This is source-derived local coordinate behavior; downstream desktop effects and whether the split is intentional remain unverified.
- Preservation: retain longest-prefix selection and original path-start timing rather than reconstructing a browser-style scheme/path split. URI-value tests assert the native path substring alongside complete main-URL checks.

### WRITER233 — HTML HREF presence creates an internet item even when resolution yields no URL

- Source: pinned `sw/source/filter/html/htmlgrin.cxx`, SwHTMLParser::NewAnchor tests bHasHRef before URI resolution and unconditionally constructs SwFormatINetFormat afterward. It does not recheck the resolved string before inserting the native attribute. Native MakeTextAttr and TryInsertHint in `sw/source/core/txtnode/thints.cxx` admit the INET item without a URL-nonempty guard.
- Observation: an empty HREF with no valid source-medium parent, or a nonempty HREF rejected by SmartRel2Abs, still creates a native internet range with empty URL and retained name/target/style identities. It does not fall back to the name-only bookmark branch. This is source-derived local-model behavior; a compiled desktop symptom is not certified.
- Preservation: actual HTML insertion and Worker transport retain the complete empty native item. The old local owned-map pruning and nonempty-only native item decoder were removed; the separate portable UI link validator still rejects blank destinations. Focused tests cover HREF presence, native ranges, style IDs and serialized restoration.

### WRITER234 — Shared MemoryInputStream can be reopened by seeking after closure

- Source: pinned `comphelper/source/streaming/seqstream.cxx`, `MemoryInputStream::closeInput/seek/avail/getPosition/getLength`.
- Observation: closeInput stores -1 in the position, while an in-range seek replaces that value without a closure check. Later reads succeed again; closed position/length queries remain readable. This is shared stream source/local-value evidence, not a claim about full DOCX/stream-service/native-thread behavior.
- Preservation: retain the exact sentinel, validation and seek behavior. Use real Sequence/Reference/exception owners in tests rather than adding a second closed flag. The shared finding is also recorded as CALC-359; existing browser document workflows are unchanged.


### WRITER235 — Shared OOXML binary input ignores its autoclose flag

Pinned `oox/source/helper/binaryinputstream.cxx#BinaryXInputStream::close` always calls `closeInput()` when its input reference exists. The stored `mbAutoClose` is consulted only by the diagnostic, unlike the header documentation and output wrapper. Both explicit close and the destructor therefore close an input supplied with `bAutoClose=false`. This source behavior is preserved; see CALC-360 and the actual component tests in `oox/source/helper/binary-streams.test.ts`. Native synchronization, ABI and complete filter/UI integration remain unverified.

### WRITER236 — Shared OOXML copy can write an untouched buffer from an EOF input

Pinned `oox/source/helper/binaryinputstream.cxx#BinaryInputStream::copyToStream` allocates a32KiB Sequence and calls `writeData(aBuffer)` even when `readData()` returns zero without reallocating that Sequence. `BinaryXInputStream` in EOF does exactly that. Copying an initially absent input therefore writes32768 zero bytes to a valid output. This original behavior is preserved and exercised through actual comphelper input/output components; see CALC-361. Related original native package/SAX workflows are not certified by this bounded test.

### WRITER237 — Shared MIME charset lookup uses permissive alias prefixes

Pinned `sal/textenc/tencinfo.cxx#rtl_getTextEncodingFromMimeCharset` checks exact VIP names before ordered prefix aliases after30-byte ASCII normalization. A trailing suffix rejects UTF-8 but can still select an ISO alias. The complete original40/184 tables, their duplicates and matching order are retained rather than replaced with browser alias rules. See CALC-362 and `sal/textenc/native-mime-charset.test.ts`. SAX encoding transport and complete DOCX model/filter/UI acceptance remain pending; this finding does not certify native ABI or all encoding conversion behavior.

### WRITER238 — Shared XML converter can discard a short initial source prefix

Pinned `sax/source/expatwrap/xml2utf.cxx#XMLFile2UTFConverter::readAndConvert` concatenates buffered prefix bytes only when the latest read is nonzero. EOF before recognition therefore loses accumulated input, including a four-byte `<a/>`. Preserve this flow, as exercised by actual fragmented SequenceInputStream callers; see CALC-363. Complete SAX parser and DOCX model/filter/UI acceptance remain pending.

Package-input follow-up: actual OOXML ZIP parts now pass through this converter. Empty input and short `<a/>`/`<root>` fragments consequently finish document callbacks without a parsed root and can return successful optional-fragment import. Tests preserve this behavior explicitly. Cancellation and malformed-input tests use recognized inputs to exercise their intended error paths independently of prefix loss.

Native-service follow-up: the real registered FastParser over MemoryInputStream accepts the seven-byte malformed `<b></a>` as an empty converted stream; a recognized longer malformed input throws SAXParseException. This does not reproduce the original parser.cxx Pipe fixture: pinned io/source/stm/opipe.cxx::OPipeImpl::readSomeBytes returns0 on closed-output EOF without resizing its prior output Sequence, whereas MemoryInputStream empties it. Preserve both source boundaries. Pipe and the complete original QA fixture remain unported; no replacement Pipe provider or parser recovery is introduced.

### WRITER239 — Shared XML declaration quote selection prefers an absent single quote

Pinned XMLFile2UTFConverter scanForEncoding/removeEncoding compare the single-quote index directly with the double-quote index, allowing -1 to win. A double-quoted encoding with no later single quote is not captured or removed. Preserve exact quote ordering, lexical matching and first-line scanning; see CALC-364. Tests use actual OString values and source byte owners.

Additional actual SAX-input consequence: an ASCII document declaring the unknown charset `x-no-such-charset` with single quotes is accepted after the original converter removes that attribute despite lacking a converter. With double quotes and no later single quote, the attribute survives and the current host byte engine rejects the unsupported label. Real fragmented SequenceInputStream/InputSource/parser owners reproduce both outcomes. This is pinned-source/control-flow plus local end-to-end admission evidence; it does not certify a compiled complete native SAX parser or identical native backend error messages. Preserve the original quote/declaration flow and its conditional admission difference.

### WRITER240 — Shared SAX converter replaces separately supplied surrogate halves

Pinned Unicode2TextConverter passes its original no-FLUSH default flags to RTL. The UTF8 converter's original trailing-surrogate branch replaces a split high surrogate immediately; a later low surrogate is independently invalid. Separate calls produce two `?`, while a complete pair in one call produces valid UTF8. Preserve these flags and existing RTL state behavior; see CALC-365. No synthetic converter context or private pending-state mutation is supplied.

### WRITER241 — Shared Shift-JIS retains upstream MS-compatible wave mapping

Pinned `sal/textenc/tcvtjp1.tab` intentionally uses U+FF5E for8160 in Shift-JIS for Microsoft compatibility. The complete original SJIS descriptor is now wired separately from MS932, reusing actual original forward/reverse payload tables and the same EUDC object. All512 pointer/range entries match source. Compiled original reverse conversion over all BMP units and the extended151032-case profile confirm the represented defined scope; see CALC-366. Native undefined reads, ABI and full document services remain unverified.

### WRITER242 — Shared empty ByteSequence COW leaves the old count unchanged

Pinned `sal/rtl/byteseq.cxx#rtl_byte_sequence_reference2One` omits old-count decrement in its zero-element allocation branch. Preserve this behavior; actual owner tests and compiled unchanged SAL C/C++ bodies reproduce it. See CALC-367. Allocation failure and native resource lifetime outside the witness domain remain unverified.

### WRITER243 — Shared serializer cache writes can bypass retained Sequence COW

Pinned `sax/source/tools/CachedOutputStream.hxx` writes through a cached original pSeq and changes its nElements while `toUnoSequence` can expose that same header/storage to a retaining output sink. This conditional aliasing is suspected from source; full sink/service reproduction remains pending. Preserve the raw-pointer flow rather than adding a defensive copy during output migration. See CALC-368.

### WRITER244 — Legacy tenth-level RTF numbering fallback closes a group it never opens

- Pinned source: `sw/source/filter/ww8/rtfattributeoutput.cxx`, `RtfAttributeOutput::NumberingLevel`, lines1986..1991 and2178..2180; `include/svtools/rtfkeywd.hxx` defines IGNORE as `\*` and SOUTLVL as `\soutlvl`, without an opening brace.
- Observation: for level9 the callback writes `\*\soutlvl` before the ordinary `{\listlevel...}` group, then writes an extra closing brace after the normal level terminator. Thus a self-contained level fragment has one more closing group than opening groups. The adjacent paragraph fallback separately writes an explicit `{` before the same ignore/soutlvl controls.
- Actual local source-contract reproduction: a real Writer rule admits level9; its actual `SwNumFormat` supplies a single standard `%1%.` placeholder, legal flag, centered alignment and zero geometry to the common `NumberingLevel` writer and genuine RTF exporter. The resulting fragment starts with `\*\soutlvl{\listlevel...` and ends with `\fi0\li0}}`, with group balance-1. No placeholder array, output callback, font/color provider or private state is manufactured.
- Boundary: ordinary abstract-list traversal emits only levels0..8, so this observation does not establish failure in normal full-document export. It covers the legacy higher-level callback branch; it is direct pinned-source/control-flow evidence plus local actual-owner execution, not a newly compiled full native RTF binary comparison.
- Suspected issue: the intended ignored extension group appears to lack its opening brace. Preserve the original controls/closing behavior and record the regression in `rtfattributeoutput.style-values.test.ts`; do not silently add a group or change the ordinary level limit.

### WRITER245 — MD4C reference helpers assume a covering paragraph line

- Pinned source: `vendor/md4c-reference/src/md4c.c`, `md_is_link_reference` lines2298..2309 and `md_is_inline_link_spec` lines2351..2366; local bindings are in `external/md4c/src/md4c.ref.ts`.
- Source contract: the reference helper asserts bracket marks, looks up their paragraph line, and immediately reads `beg_line->end` without a null-result check. The inline helper initializes its line index, calls the same lookup, and proceeds with that index without an absent-line result. Its caller supplies an actual collected opening parenthesis and the corresponding paragraph lines.
- Conditional risk: inconsistent bracket offsets/paragraph storage would violate these assumptions and could cause an invalid read or incorrect line selection. No ordinary-input failure is established: the real parser supplies the covering lines, and no native invalid dereference is executed for coverage.
- Resolution: preserve the original caller contract and both existing local defensive returns. The user separately approved A02/A03 to exclude only those unreachable guard alternatives and their returns from coverage. Explicit empty normal-path blocks retain the covered source-map positions; source tokens otherwise match the prior implementation. A fresh1907-case parser profile covers all131 statements,98 branch arms,8 functions and108 lines after these two precise exceptions.

### WRITER246 — RTF underline projection has a redundant fallback under its value contract

- Origin boundary: this is a local adaptation audit requested alongside upstream findings, not evidence of a new C++ defect. Pinned `sw/source/filter/ww8/rtfattributeoutput.cxx` lines3128..3177 receives an actual `SvxUnderlineItem` and handles its line-style enum directly. The local `WriteCharacter` also accepts the existing readonly boolean/optional-enum projection.
- Invariant: its outer guard requires `underline` or a defined `underlineStyle`. The nullish fallback is evaluated only when the optional enum is absent, so `underline` must already be true. The inner `LINESTYLE_NONE` alternative is unreachable for admitted stable `WriterCharacterAttributes` values. Null enum values and getters that change between reads fall outside that declared projection contract.
- Resolution: retain the expression and all native NONE/reset handling. The user approved A06 to exclude only this one false alternative. Exact counter/source comparison confirms zero statements/functions removed, one branch arm removed, and the true-arm counter retained. The formatted source-map end differs only by the separator colon; no other alternative is excluded. A fresh443-case RTF/HTML consumer profile covers all385 statements,351 arms,43 functions and333 lines. The separate genuine upstream tenth-level grouping concern remains WRITER244.

### WRITER247 — StylePool traversal assumes a live tree and stable representative lookup

- Pinned source: `svl/source/items/stylepool.cxx`, `Node::nextItemSet` lines128..156 describes a non-null/nonself traversal token as a given child. The internal callers pass only null, self or a direct child when climbing to its parent. Nodes remain linked until pool destruction; native iterator use after destruction is outside the lifetime contract.
- Representative precondition: `Node::getItemSetOfIgnorableChild` lines205..209 explicitly asserts `hasIgnorableChildren` with the same usage filter. In the represented host API, only `getAllStyles` enables ignorable-tail collapsing, and it simultaneously requires a used leaf. Its existence check and selection run in one synchronous step over private nodes and pure WeakMap ownership reads, with no external callback or await between them.
- Boundary: these facts prove the two defensive alternatives unreachable for the admitted live, synchronous binding. They do not certify concurrent native shared_ptr ownership changes, ABI/threading behavior or invalid lifetime use. The fallback code remains present; no private tree/owner state is fabricated to force it.
- Resolution: the user separately approved A01a for the negative child-index alternative and A01b for the empty representative return/alternative. Exact source/counter comparison excludes only one zero-hit statement and two zero-hit arms; all26 functions and all other source positions remain. Four actual ownership/style suites41 tests cover all145 statements,108 arms,26 functions and126 lines after these precise exceptions. No normal-input upstream failure is newly claimed by this invariant audit.

### WRITER248 — Converted XML bytes can acquire a second encoding-signature interpretation

- Pinned source boundary: `sax/source/fastparser/fastparser.cxx` creates its push parser from the first XMLFile2UTFConverter output chunk. The converter can transform an explicitly named legacy transport into UTF8 bytes; the current host byte-engine binding then performs its own XML signature detection.
- Actual local observation: canonical UTF7 NUL shifts and direct ASCII can encode units whose UTF8 output is byte-identical to BOM-free UTF16BE or UTF16LE XML. An actual InputSource with explicit UTF7 encoding and the original RTL/Sequence converter consequently reaches the host UTF16 signature branches and produces a successful `wire` text event/endDocument. No decoder callback, private field, factory result or synthetic Entity chunk is supplied.
- Conditional concern: the UTF7-decoded text contains XML-forbidden NUL units before that second interpretation, so transport conversion alone does not establish the assumed final XML character stream. This records a source-format boundary assumption and actual host admission result, not a newly confirmed full native libxml2/SAX defect. Complete native backend equality remains unverified.
- Resolution: preserve the existing source/converter and host-signature behavior, retain both regression cases, and avoid declaring the signature branches unreachable merely because ordinary direct UTF16 input receives an upstream-added BOM. See CALC-390.


### WRITER249 — md4c span collection assumes a covering paragraph line

- Original `md4c.c` lines3118..3126 and3169..3175 assign a successfully recognized code/HTML span closing offset and call `md_lookup_line` directly to advance the current paragraph line. The original caller assumes that this lookup succeeds; it has no absent-line recovery contract.
- Both recognizers operate on a suffix of the same nonempty immutable paragraph line array and bound a successful closing offset by that suffix. The lookup uses the full covering paragraph and maps gaps to the following line. Under that synchronous source ownership contract, a valid matched offset cannot fall beyond the last line.
- The local binding retains separate defensive throws for absent code-span and HTML-span lines. The user independently approved M04/M05 for those exact guards. Exact runtime-token/remapped-counter comparison excludes only two zero-hit throws and two zero-hit alternatives, retaining all3 functions and every other source position. A fresh1999-case corpus covers all167 statements,149 alternatives,3 functions and155 lines for this owner. Existing matched/multiline/failed span tests execute genuine public parser owners; no private marks, corrupted line arrays or invalid native pointer dereferences are introduced. This records a native caller precondition, not a newly confirmed ordinary-input Writer failure.

### WRITER250 — Short numeric-region Locale depends on registry initialization order

- Source: pinned `i18nlangtag/source/languagetag/languagetag.cxx`, `LanguageTagImpl::cacheSimpleLSCV`, `getRegionFromLangtag`, `isIsoLocale`, `LanguageTag::registerImpl` and `getKnowns`.
- Observation: the simple cache stores country and discards the separately extracted numeric region. Without an external parser, `getRegionFromLangtag` returns that country cache. A fresh string-origin `es-419` can therefore become the ISO Locale `(es, "", "")` with suggested primary ID 10. If `getKnowns` initializes numeric owners first, the existing ID 22538 owner retains its non-ISO decision from qlt conversion; a later `es-419` uses `(qlt, "", es-419)`, ID 22538. Upstream QA observes the latter after earlier initialization.
- Resolution: preserve both source paths and registry side effects. Do not prime the registry artificially or change the cache to retain numeric regions. Isolated managed tests exercise both paths; this finding is source-derived, not an executed native differential. The earlier deferred snapshot called this CALC-184; this is its active Writer consumer record.

### WRITER251 — Default RTF language controls retain zero-child nesting

- Source: pinned `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx`, `RTFDocumentImpl::dispatchValue`, DEFLANG/ADEFLANG branches. The function initializes `nSprm=0`; these branches do not assign it. DEFLANG nests the BCP47 value under `LN_EG_RPrBase_lang` with child ID 0. ADEFLANG instead uses parent `LN_CT_Language_bidi`, also with child ID 0. This differs from LANG/ALANG/LANGFE and does not select the mapper's normal language attributes.
- Resolution: preserve both malformed property trees and normal LANG handling. Do not silently replace zero with `LN_CT_Language_val` or fix ADEFLANG's parent. Tests inspect the actual owned property trees before normal insertion. This is source-derived evidence, not an executed full native import oracle.

### WRITER252 — HICH language import targets CTL despite Western export properties

- Source: pinned `sw/source/filter/ww8/rtfattributeoutput.cxx`, MoveProperties, emits Western associated properties after HICH. Pinned `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx`, dispatchCharacterAttributeValue, instead routes LANG/ALANG under RunType::HICH to `LN_CT_Language_bidi`. For `\rtlch\alang1025\ltrch\hich\alang1031` the later HICH value therefore replaces the earlier CTL language with 1031.
- Resolution: preserve native associated output order and native HICH dispatch. Do not remap HICH language to Western to repair inactive-script metadata. Actual script/bidi run splitting is required to preserve the language used by each visible script; it does not imply that every inactive-script property on every run survives a round-trip unchanged. The literal native control sequence is covered by managed import tests; this is source-derived evidence, not an executed full native round-trip oracle.


### WRITER253 — ListAutoFormat public read/state/default/reset are asymmetric

- Pinned source: `sw/source/core/unocore/unocrsrhelper.cxx`, `GetParaListAutoFormat` and `getCursorPropertyValue`; `sw/source/core/unocore/unoobj.cxx`, ListAutoFormat setter and virtual property default/reset routing.
- Observation: the setter stores `RES_PARATR_LIST_AUTOFMT` on ordinary paragraphs too, and the internal getter can read its handle. The public cursor getter returns the sequence only when the point paragraph `IsInList()`. A property-state query remains DIRECT_VALUE even without a list/handle; its default is VOID and resetting the virtual property leaves the handle unchanged.
- Resolution: preserve this asymmetry rather than hiding marker formatting in a separate local property or making reset clear it. Actual typed NamedValue input, real handle ownership and ordinary paragraph cursor calls reproduce the represented behavior. This is pinned-source plus managed-owner evidence, not a compiled full native UNO differential.

### WRITER254 — Any terminal non-character-style hint suppresses paragraph marker fallback

- Pinned source: `sw/source/filter/ww8/wrtw8nds.cxx`, `MSWordExportBase::OutputTextNode` paragraph-marker collection (lines3284–3337).
- Observation: a zero-length hint at paragraph end sets `bCharFormatOnly=false` whenever its Which differs from `RES_TXTATR_CHARFMT`, even when the collector does not copy that hint. In particular a terminal internet hint suppresses direct paragraph character formatting while contributing no marker item. Only a character-style hint preserves paragraph-direct fallback.
- Resolution: keep the exact selection/order. Real terminal internet, automatic and named-style attributes test the three branches and precedence. This is source/control-flow and actual managed-owner evidence; it does not certify all terminal attribute types or compiled Writer output.


### WRITER255 — HICH chooses Western font but complex size and toggles

- Pinned source: `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx`, F/AF and `dispatchCharacterSprmValue`; `sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx`, `dispatchToggle`.
- Observation: under HICH, F/AF selects `LN_CT_Fonts_ascii`, whereas FS/AFS selects `szCs`, B/AB selects `bCs`, and I/AI selects `iCs`. Under DBCH, the font is `eastAsia` but size/toggles use ordinary `sz`/`b`/`i`; DomainMapper applies those ordinary properties to Western and Asian items. Together with associated Western export properties after HICH, this can overwrite inactive complex-script formatting, like the language behavior in WRITER252.
- Resolution: preserve the distinct native selectors, not a single generalized script-slot rule or a rule based on the A prefix. Literal controls across all eight original RunType states are tested through actual Writer items and ranges. This is source-derived plus managed-owner evidence; full compiled native round-trip behavior is not certified.


### WRITER256 — RTF font-table metadata is deliberately lost before document font application

- Pinned source: `sw/source/writerfilter/rtftok/rtfdispatchflag.cxx`, FNIL/FROMAN/FSWISS/FMODERN/FSCRIPT/FDECOR/FTECH/FBIDI branches; `rtfdispatchvalue.cxx`, FPRQ/FCHARSET; `rtfdocumentimpl.cxx`, handleFontTableEntry; `sw/source/writerfilter/dmapper/FontTable.cxx`, lcl_attribute/lcl_sprm; `DomainMapper.cxx`, Fonts_ascii/eastAsia/cs.
- Observation: the RTF family flags simply break with an old TODO claiming CT_Font_family is ignored, although the current FontTable receiver handles roman/swiss. Thus those family tokens never reach it. FPRQ emits a pitch attribute, but every recognized pitch branch in FontTable does nothing. FCHARSET changes the byte decoder and intentionally does not emit font-table charset information. DomainMapper only projects symbol charset from a FontEntry when that entry actually has symbol encoding, so the RTF reader's decoder-only charset does not supply that document property. StyleName is not produced by this path either.
- Resolution: preserve these losses. Do not turn family flags into family properties, force Symbol/document charset from FCHARSET, or synthesize pitch/style metadata to improve round-trip fidelity. Eight family flags, three pitches and eighteen charsets across all three font slots are exercised with real parser/document/item owners; all represented metadata remains at its script pool default while the chosen family name is applied. This is source/control-flow and managed-owner evidence; it is not a full compiled font-table/service differential.


### WRITER257 — Numbering CharStyleName fallback assumes a DocShell after finding a document

- Pinned source: `sw/source/core/unocore/unosett.cxx`, SwXNumberingRules::SetPropertiesToNumFormat, CharStyleName branch (lines1808–1847).
- Observation: after choosing pLocalDoc from DocShell or pDoc, a nonempty name first queries FindCharFormatByName. If missing, the branch immediately dereferences pLocalDoc->GetDocShell()->GetStyleSheetPool() without a separate shell check. Other numbering font-name handling does check for an available shell. Thus an unknown name on a shell-less document is outside this branch's valid source domain; it is not evidence that the style should be silently created by a local shortcut.
- Resolution: the native list importer creates the actual ListLabel style before assigning CharStyleName, so the consuming path uses the existing-style branch. The current no-DocShell binding asserts that precondition for an unknown nonempty name; no desktop fallback, native crash behavior or exception-message parity is certified. This is source/precondition evidence, not an executed compiled null-dereference oracle. Existing styles, empty-name reset, source pointer ownership and programmatic-name conversion are preserved.


### WRITER258 — Numbering level-text regex rewrites only the first digit of percent10

- Pinned source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, ListsManager::lcl_attribute, CT_LevelText_val branch. After soft-hyphen normalization and UTF8 conversion, the expression `(%\\d)` replaces each match with `$1%`.
- Observation: literal level text `%10` becomes `%1%0`, not `%10%`. This is relevant to evaluating the represented tenth-level format, but the observation alone does not establish that ordinary RTF input produces this exact unescaped placeholder.
- Resolution: preserve the original single-digit regex and strict OUString UTF8 conversions. A real ListLevel/DomainMapper and native resource container verify the literal receiver outcome together with soft hyphen and non-BMP text. Full tenth-level parser/export production and compiled native behavior remain separate audit obligations; no broader failure is asserted.

### WRITER259 — Numbering start visitation persists across list managers

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListsManager::lcl_sprm` (pinned baseline).
- Observation: the function-static `bIsStartVisited` starts false once per process. A start modifier sets it true; a numbering-format modifier sets start zero only while it remains false. It is not reset for the next definition or document.
- Impact: whether an otherwise absent start becomes explicitly present can depend on an earlier list/import, particularly for overrides generated without defaults.
- Local behavior: retain the module-lifetime flag and original assignments. Do not make it per-level or reset it to improve apparent consistency. Full override consumers remain under audit.

### WRITER260 — Explicit levellegal zero still enables legal numbering

- Source: `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx`, `RTFDocumentImpl::dispatchTableSprmValue`; `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListLevel::SetValue`.
- Observation: the reader stores the supplied numeric `levellegal` value, but `ListLevel::SetValue` sets `m_bIsLegal = true` based only on the modifier identity.
- Impact: `\levellegal0` produces `LevelIsLegal=true`, just like the bare control.
- Local behavior: retain presence semantics through native rule assignment and Worker transport. Covered by `rtf-numbering.test.ts`.

### WRITER261 — Bullet materialization truncates supplementary symbols to one UTF16 unit

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListLevel::GetLevelProperties`; `sw/source/core/unocore/unosett.cxx`, `SwXNumberingRules::SetPropertiesToNumFormat`.
- Observation: a nonempty bullet text is copied with `copy(0, 1)`, independently of Unicode scalar boundaries. A supplementary symbol therefore reaches the numbering setter as a lone high surrogate; the setter consumes that one-unit string.
- Impact: the stored bullet value can differ from the intact supplementary symbol retained in `ListFormat`; strict re-export conversion may encounter invalid UTF16.
- Local behavior: retain the one-unit copy and native code-point admission. Do not silently repair or preserve the complete scalar in BulletChar. Covered by `rtf-numbering.test.ts`; no complete malformed-Unicode re-export parity claim is made.

### WRITER262 — Empty bullet producer uses a character Any while its consumer extracts a string

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListLevel::GetLevelProperties`; `sw/source/core/unocore/unosett.cxx`, `SwXNumberingRules::SetPropertiesToNumFormat`.
- Observation: the empty case emits `Any(sal_Unicode(0))`. The BulletChar setter performs an unchecked extraction into a default-empty `OUString` and then sets a zero bullet when that string is empty.
- Impact: the producer/consumer type mismatch achieves the zero bullet through failed extraction rather than a matching string type; other non-string values also reach the same empty-string fallback.
- Local behavior: keep the original character Any and unchecked string extraction/default behavior, rather than converting characters into strings or rejecting the consumed empty case.

### WRITER263 — LEVELNUMBERS ordinary text stores the read-loop terminator

- Source: `sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx`, `RTFDocumentImpl::resolveChars`.
- Observation: LEVELNUMBERS checks `aStr.toChar() != ';'`, then appends `sal_Int32(ch)`. In normal mode `ch` is the delimiter which ended the run and was rewound; in hex mode it is the single decoded signed char. The branch also does not apply the earlier hex fallback skip guard.
- Impact: literal position bytes and equivalent hex escapes need not produce the same position vector; skipped hex fallback can still contribute a position. Reinterpreting all decoded destination text as positions changes native behavior.
- Local behavior: preserve resolveChars source events separately from decoded text and keep the signed Unicode control parameter. Tests distinguish source-origin positions, ASCII termination and invalidating Unicode semicolons. The signed-char profile follows the pinned source's default signed-char build; no cross-platform ABI certification is claimed.

### WRITER264 — RTF list override flags do not produce paragraph start overrides

- Source: `sw/source/writerfilter/rtftok/rtftokenizer.cxx`, `rtfdispatchflag.cxx`, `rtfdispatchvalue.cxx`; `sw/source/writerfilter/dmapper/NumberingManager.cxx`.
- Observation: `listoverridestartat` and `listoverrideformat` are recognized keywords but have no active dispatch cases; `listoverridecount` is explicitly ignored. `levelstartat` emits ordinary `CT_Lvl_start`, including in LFOLEVEL, rather than `CT_NumLvl_startOverride`.
- Impact: an LFO start updates the concrete format's StartWith through ordinary numeric merging. It does not reach the DomainMapper paragraph restart branch which consumes GetStartOverride, even when listoverridestartat is present.
- Local behavior: preserve ignored flags/count and ordinary starts; do not synthesize ParaIsNumberingRestart or NumberingStartValue from these flags. Covered by `rtf-list-overrides.test.ts`.

### WRITER265 — Concrete label character properties merge into an unused temporary

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListDef::CreateNumberingRules`.
- Observation: the abstract character sequence is passed as the source to lcl_mergeProperties and the concrete character sequence as the destination. Style creation subsequently consumes the unchanged abstract sequence, while the merged concrete temporary is discarded.
- Impact: concrete bold/italic/script-font character overrides do not reach the generated ListLabel style. Numeric BulletFontName and explicit concrete ListFormat still have their separate override paths.
- Local behavior: retain the source/destination direction and unused temporary, with owned sequence cleanup. Do not correct the merge direction. Covered through actual character styles and concrete bullet-font assignment.

### WRITER266 — A concrete LISTTAB follower cannot reset an abstract space/nothing follower

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListLevel::GetLevelProperties` and `ListDef::GetMergedPropertyValues`.
- Observation: concrete numeric collection uses bDefaults=false. A following character equal to LISTTAB is omitted even if SetValue explicitly assigned it, so it does not replace an abstract LabelFollowedBy property during the subsequent name merge.
- Impact: explicit concrete levelfollow0 leaves an abstract space or nothing follower active; omission differs from an explicit typed LabelFollowedBy=LISTTAB call to the final numbering setter.
- Local behavior: retain the omission and merge order. Covered by `rtf-list-overrides.test.ts`.

### WRITER267 — Geometry-only concrete levels are classified as stub overrides

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListLevel::SetValue`, `ListsManager::lcl_attribute`, `ListDef::GetMergedPropertyValues`.
- Observation: HasValues tracks calls to SetValue. Indent attributes insert directly into PropertyMap, while text and character properties also do not set that flag. Numeric merging requires HasValues in addition to a nonempty property sequence.
- Impact: an explicit geometry-only concrete level does not override abstract indentation. An otherwise ineffective numeric SetValue call, such as legacy or negative start, can admit the same geometry into the merge. Explicit concrete text still follows its separate presence check.
- Local behavior: preserve the native flag boundary and the separate numeric, text and character paths. Tests compare actual typed numeric property vectors before and after a SetValue visit.

### WRITER268 — An inherited LISTLEVEL destination advances its parent's level counter

- Source: `sw/source/writerfilter/rtftok/rtfdocumentimpl.cxx`, `RTFDocumentImpl::pushState`, `afterPopState` and LEVELNUMBERS before-pop handling.
- Observation: a plain nested group copies LISTLEVEL as its destination. Closing it takes the LISTLEVEL after-pop branch and increments the parent's listLevelNum even though no new listlevel keyword occurred. Later LEVELNUMBERS uses that modified counter when generating placeholders.
- Impact: a nested formatting group before level text can change a first-level placeholder from percent1 to percent2; the child level entry remains separate from the enclosing level's table modifiers.
- Local behavior: retain copied destinations, original counter mutation and placeholder equation. Covered by `rtf-list-overrides.test.ts`; do not normalize nesting into a flat level descriptor.

### WRITER269 — AddParaProperties treats property indices as booleans

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `lcl_findProperty` and `ListLevel::AddParaProperties`.
- Observation: lcl_findProperty returns an index or minus one. AddParaProperties assigns that integer directly to bool instead of comparing it with minus one. A property at index zero becomes false, while an absent property becomes true.
- Impact: when both geometry properties are absent, the method returns without adding paragraph margins. A geometry property at index zero can instead receive a duplicate property copied from the paragraph style; later sequential setters/merging can give the appended value priority.
- Local behavior: preserve index-zero and minus-one conversion, the early return, names and append order. Tests query actual owned PropertyValue vectors for absent/default and duplicate cases. Do not repair the checks to conventional presence tests.


### WRITER270 — Outline assignment can remove another numbering rule's name index

- Source: `sw/source/core/doc/number.cxx`, `SwNumRule::operator=` and `SwNumRule::SetName`; `sw/source/core/doc/docnum.cxx`, `SwDoc::SetOutlineNumRule`.
- Observation: assignment copies the incoming name without updating the retained recipient map pointer. SetOutlineNumRule then calls SetName("Outline"), which erases the incoming name from that map before registering Outline. It does not check which rule owns the erased entry.
- Impact: assigning a differently named registered donor leaves the donor in the rule table while its name lookup disappears; default-list style references also follow the original rename callback. Ordinary chapter-service calls copy Outline itself and do not trigger this case.
- Local behavior: preserve assignment, map erasure and callback order. `chapter-numbering.test.ts` verifies persistent outline identity and the donor table/index disagreement. Do not repair the map based on owner identity.

### WRITER271 — List-level validation deliberately leaves the property vector stale

- Source: `sw/source/writerfilter/dmapper/DomainMapper_Impl.cxx`, `DomainMapper_Impl::ValidateListLevel`.
- Observation: when another paragraph style has claimed a list level, validation sets StyleSheetPropertyMap list-level metadata to WW_OUTLINE_MAX (9). The existing PROP_NUMBERING_LEVEL property is not changed; the source explicitly warns about the disagreement.
- Impact: metadata lookup reports body level9 while consumers of the original property vector still read the previous level. A direct paragraph NumberingLevel continues to take precedence.
- Local behavior: retain first-claim ownership and update only the metadata. `numbering-style-postprocess.test.ts` verifies both results on actual property owners.

### WRITER272 — Chapter selection narrows an ID before comparing it with full-width IDs

- Source: `sw/source/writerfilter/dmapper/NumberingManager.cxx`, `ListsManager::CreateNumberingRules` and `ListDef::CreateNumberingRules`.
- Observation: the selected concrete ID is stored in sal_Int16, while ListDef retains its full-width ID. Rule creation compares GetId() against the narrowed selection.
- Impact: a suitable concrete ID65540 becomes4, so that candidate creates WWNum65540 instead of Outline; a separate ID4 can compare equal to the selection. This differs from ordinary low-range IDs.
- Local behavior: preserve signed16 selection and full-width comparison. `numbering-style-postprocess.test.ts` verifies weight6 and the resulting ordinary style for ID65540.


### WRITER273 — No-numbering margin lookup treats absent list metadata as a list

- Source: `sw/source/writerfilter/dmapper/DomainMapper_Impl.cxx`, `lcl_GetPropertyFromParaStyleSheetNoNum`.
- Observation: the first matching margin is rejected when GetListId() converts to true. The absent metadata sentinel is minus1, which also converts to true; only zero passes this check.
- Impact: a style with no list metadata can stop margin lookup with an empty Any instead of contributing its margin or continuing to its parent. The numId0/no-definition recovery phase can consequently insert unsigned zero margins.
- Local behavior: preserve the truth test, first-match stop, native unsigned-zero fallback and self-parent guard. `paragraph-numbering.test.ts` compares otherwise identical metadata minus1 and zero.

### WRITER274 — RTF export does not preserve shared SwList identity across different rules

- Source: `sw/source/filter/ww8/ww8atr.cxx`, `AttributeOutputBase::ParaNumRule`; `wrtw8num.cxx`, `AbstractNumberingDefinitions` and `NumberingDefinitions`.
- Observation: shared-list/abstract-rule remapping is guarded by GetExportFormat()==DOCX, with an upstream FIXME. RTF follows the ordinary one-numbering-rule to one-abstract-definition path, regardless of a shared paragraph ListId.
- Impact: RTF import can join different concrete definitions through one abstract list, but native RTF re-export separates their abstract definitions. Reopening that export gives distinct list identities even though the original imported paragraphs shared one.
- Local behavior: retain the RTF path and the format-specific DOCX guard. `rtf-paragraph-numbering.test.ts` verifies shared imported IDs and distinct IDs after RTF re-export, plus retained numbering and paragraph level. Do not introduce a synthetic RTF identity extension.

### WRITER275 — Body-level9 cancellation depends on resolving a stylesheet entry

- Source: `sw/source/writerfilter/dmapper/DomainMapper.cxx`, LN_CT_NumPr_ilvl; `DomainMapper_Impl.cxx`, `finishParagraph`.
- Observation: ilvl9 is initially admitted as native level9. Its conversion to no numbering sits inside the finishParagraph block guarded by a resolved paragraph-style entry. When that entry is absent, the conversion is skipped.
- Impact: the same direct ilvl9 produces an unnumbered paragraph with a resolved source paragraph style, but can remain the tenth native numbering level without that entry.
- Local behavior: retain the entry guard, original level range and cancellation sequence. `rtf-paragraph-numbering.test.ts` exercises both paths. Do not manufacture a default style entry or unconditionally reinterpret level9.


### WRITER276 — RTF exports wide positive indentation that its native importer turns into zero

- Source: `sw/source/filter/ww8/rtfattributeoutput.cxx`, `FormatFirstLineIndent`; `sw/source/writerfilter/dmapper/DomainMapper.cxx`, LN_CT_Ind_firstLine; `ConversionHelper.cxx`, `convertTwipToMm100_Limited`.
- Observation: export writes the full authored first-line item, such as fi40000. Import calls the limited conversion helper, which returns zero for positive twips at or above32768; negative values are not subject to the same ceiling. The source comment attributes this to legacy MSO handling.
- Impact: a positive wide indentation can export intact and return as zero on native re-import. An equally wide negative value follows the signed conversion instead. This is an intentional source compatibility rule, not a confirmed upstream defect.
- Local behavior: preserve raw item export and original asymmetric import admission. `rtfexport.table-list.test.ts` verifies fi40000 emission and zero re-import; `rtf-paragraph-numbering.test.ts` pins32767,32768 and minus40000. Do not restore the former scalar import bypass to make the roundtrip lossless.

### WRITER277 — Legacy PN fixed IDs can reuse an earlier definition or collide with modern lists

- Source: `sw/source/writerfilter/rtftok/rtfdispatchflag.cxx`, PNLVLBODY/PNLVLBLT; `rtfdocumentimpl.cxx`, PARAGRAPHNUMBERING after-pop; `dmapper/NumberingManager.cxx`, GetList/GetAbstractList.
- Observation: old paragraph numbering always uses ID2 for body numbering and ID1 for bullets. Each PN group emits another abstract/concrete definition, while native mapper lookup retains the first matching ID.
- Impact: a later pnstart can create another unused style without changing the numbering used by its paragraph. A modern concrete list with the same ID can also remain the rule used by a later PN paragraph, despite the new PN definition.
- Local behavior: preserve fixed IDs, independent table callbacks, first-match lookup and unused style allocation. `rtf-legacy-numbering.test.ts` covers repeated PN starts and modern/legacy ID2 collision. Do not allocate synthetic unique IDs or paragraph restarts.

### WRITER278 — Registered legacy PN switches have no native dispatch handler

- Source: `sw/source/writerfilter/rtftok/rtftokenizer.cxx`, PNUCRM/PNLCRM/PNFS registrations; `rtfdispatchflag.cxx`, `rtfdispatchvalue.cxx` and `rtfdocumentimpl.cxx` dispatch implementations.
- Observation: pnucrm, pnlcrm and pnfs are known tokenizer spellings but have no implementation in those native dispatch switches. The consumed legacy format handler implements pndec, while the numbering writer's default fallback remains Arabic when no format was assigned.
- Impact: Roman-numbering switches can leave Arabic numbering active, and pnfs does not assign the requested label height. This is a native implementation omission, not evidence that the local core lacks Roman numbering or font-height support.
- Local behavior: preserve these no-ops. Tests verify Arabic numbering and unchanged native label height against the same PN definition without the switch. Do not implement additional semantics merely to make old PN more feature-complete than upstream.

### WRITER279 — LINE uses direct singleChar emission even inside PN text destinations

- Source: `sw/source/writerfilter/rtftok/rtfdispatchsymbol.cxx`, the early LINE branch; `rtfdocumentimpl.cxx`, `singleChar` and PN text after-pop handling.
- Observation: ordinary text symbols call destination-aware text(), but LINE calls singleChar with runProps=true. That operation emits directly to the mapper/current buffer and does not call checkNeedPap.
- Impact: a LINE inside a PN prefix can become visible body text while surrounding prefix characters remain in the numbering pattern. Paragraph properties emitted after PN must still apply to that run.
- Local behavior: preserve separate text() versus singleChar paths. The atomic adapter snapshots the direct LINE run without prematurely capturing paragraph properties. `rtf-text-symbol.test.ts` verifies a body LF, an AB prefix pattern and the final PN numbering rule. Do not redirect LINE into the PN text buffer for consistency with TAB.

### WRITER280 — LINE alone does not initialize the RTF first-run section

- Source: `sw/source/writerfilter/rtftok/rtfdispatchsymbol.cxx`, early LINE dispatch; `rtfdocumentimpl.cxx`, singleChar, runProps, setNeedSect and root-pop finalization.
- Observation: LINE calls singleChar with runProps=true; neither singleChar nor runProps calls checkFirstRun. setNeedSect ignores pre-first-run requests in the ordinary one-column/non-table profile, and root-pop section finalization is guarded by !m_bFirstRun.
- Impact: a stream containing paper geometry and a lone LINE can insert a body LF without applying its pending section geometry. Adding ordinary text after LINE invokes checkFirstRun and causes that geometry to be applied. This follows the inspected source control flow; it is not a compiled desktop ABI claim.
- Local behavior: preserve the direct LINE run and native first-run guard; do not initialize the section from LINE for consistency with ordinary text. `rtf-section-properties.test.ts` compares a LINE-only stream with the same stream followed by ordinary text and verifies actual page geometry and body text.

### WRITER281 — Continuous sections can retain a requested page restart without applying it

- Source: `sw/source/writerfilter/dmapper/PropertyMap.cxx`, continuous branch of CloseSectionGroup; `rtfdispatchflag.cxx`, PGNRESTART.
- Observation: page-number assignment in the continuous branch is under the fallback for changed header/footer linkage. With the original all-linked defaults, a first continuous section only attaches its style name; later continuous sections inherit that name. Neither branch applies m_nPageNumber to a range.
- Impact: a requested restart can be dropped even though it exists in the native section properties. The only-section final continuous type is erased by RTF sectBreak, so the same request then reaches ordinary page-section assignment and survives.
- Local behavior: preserve both paths. Actual RTF fixtures compare an explicit continuous section followed by SECT with an only-section continuous stream, checking the real SwFormatPageDesc offset. Do not add a compensating restart outside the native branch.

### WRITER282 — Default section grid line count precedes the item's minimum-height clamp

- Source: `sw/source/writerfilter/dmapper/PropertyMap.cxx`, section defaults and CloseSectionGroup grid calculation; `sw/source/core/layout/atrfrm.cxx`, SwTextGridItem::PutValue.
- Observation: the default section grid pitch is1mm100, so the Letter page with one-inch body margins computes22860 lines. Applying GridBaseHeight then converts units and clamps to100twips in the item, while the previously computed line count stays22860.
- Impact: stored line count and effective base height describe different pitches. The default grid mode is NONE, so this observation does not by itself establish a visible layout bug.
- Local behavior: keep original calculation, property ordering and item clamp. Actual section tests verify22860 lines and100twip base height, plus the original ten-point default/Standard Asian-height preference for base width. Do not recalculate line count after item insertion.

### WRITER283 — The native RTF writer does not emit represented text-grid properties

- Source: `sw/source/filter/ww8/rtfattributeoutput.cxx`, FormatTextGrid.
- Observation: FormatTextGrid contains an explicit TODO/logging body and emits no RTF controls.
- Impact: authored native grid mode and dimensions can be lost on native RTF export/import; the reader applies its own section defaults. Existing core grid support does not imply RTF syntax support in this pinned writer.
- Local behavior: retain the export no-op. A real document with LinesAndChars and800twip base height re-imports with NONE and the original100twip item-clamped default. Do not invent RTF grid controls to force lossless output.

### WRITER284 — Language-only input stays pending without an initial native run

- Source: `sw/source/writerfilter/rtftok/rtfdispatchvalue.cxx`, dispatchCharacterAttributeValue LANG branch; `rtfdocumentimpl.cxx`, text/checkFirstRun and guarded root-pop finalization.
- Observation: LANG writes character sprms and, while needPap is true, paragraph sprms, but does not initialize the first run. Root-pop finalization is guarded by !m_bFirstRun. Ordinary body text or an explicit PAR initializes the run and emits those properties.
- Impact: a language-only empty stream can retain the document's initial language rather than its authored LANG value; adding PAR applies the language to the empty paragraph. The former local test incorrectly promised the same authored language for both forms.
- Local behavior: preserve the native guard and pending-property ownership. `rtf-language.test.ts` checks initial LANGUAGE_DONTKNOW for control-only input, German for explicit empty PAR, and both outcomes after native export/import. Do not initialize a run solely to retain formatting-only input.


### WRITER285 — A recognized no-op after terminal SECT can create another section

- Source: `sw/source/writerfilter/rtftok/rtftokenizer.cxx`, dispatchKeyword; `rtfdispatchflag.cxx`, `rtfdispatchvalue.cxx`, `rtfdispatchsymbol.cxx`, `rtfdispatchdestination.cxx` and `rtfdocumentimpl.cxx`, dispatch entry points and setNeedSect/root-pop.
- Observation: recognized commands enter a dispatcher that calls setNeedSect(true) before its switch. This includes registered commands without a handled case, such as PNFS. Unknown spellings return in the tokenizer without reaching that operation.
- Impact: a registered no-op after terminal SECT can cause another final section/page style; an unknown word at the same location does not. This follows source control flow rather than an intentional new format feature.
- Local behavior: preserve the distinction with the complete native metadata table. `rtf-break-state.test.ts` checks PNFS, known section/character flags and unknown words, including grouped suffixes. Do not classify commands by their local visible effects.

### WRITER286 — A deferred trailing PAGE does not force a page-break paragraph

- Source: `sw/source/writerfilter/rtftok/rtfdispatchsymbol.cxx`, PAGE; `rtfdocumentimpl.cxx`, root-pop; `dmapper/DomainMapper.cxx`, lcl_utext newline and non-newline paths.
- Observation: PAGE defers a break in the mapper. With the original SplitPgBreakAndParaMark=false profile, PAR does not consume it. Non-newline text consumes it, but root-pop alone need not provide such text.
- Impact: a final PAGE can leave the deferred break unused rather than creating another paragraph with PAGE_BEFORE. This is a source-level finding, not a compiled desktop pagination claim.
- Local behavior: preserve the deferred lifecycle. Tests distinguish trailing PAGE from leading, consecutive and PAGE-PAR-text cases. Do not add a synthetic final page-break paragraph to make the input appear more regular.

### WRITER287 — Continuous PAGE retains an empty styled paragraph despite upstream uncertainty

- Source: `sw/source/writerfilter/rtftok/rtfdispatchsymbol.cxx`, PAGE/SECT; `sw/qa/extras/rtfimport/rtfimport.cxx`, testContSectionPageBreak and its unchanged fixture.
- Observation: the upstream test explicitly questions the ideal paragraph count between SECOND and THIRD but asserts an empty third paragraph carrying PageDescName, followed by THIRD without a direct break/style and a final empty paragraph.
- Impact: removing the apparently redundant empty paragraph changes the pinned native regression contract.
- Local behavior: preserve the asserted sequence and native synthetic section/reset logic. Both a required standalone literal case and the unchanged upstream fixture check the actual model. No alternative paragraph normalization is applied.


### WRITER288 — FirstIsShared has no setter target without header/footer item sets

- Source: `sw/source/core/unocore/unostyle.cxx`, lcl_GetHeaderFooterItem and SwXPageStyle property setter; `sw/source/writerfilter/dmapper/PropertyMap.cxx`, setHeaderFooterProperties; `sw/source/filter/ww8/rtfexport.cxx`, OutPageDescription.
- Observation: the FirstIsShared setter searches for an existing header or footer set. When neither exists, its shared-first case does not create either set or write the core sharing flag. The getter can likewise return an empty Any. Export independently reads SwPageDesc::IsFirstShared and can emit TITLEPG without a follow chain.
- Impact: in the represented no-header/footer profile, an authored unshared-first bit can emit TITLEPG and return to the ordinary shared default after import. This is a conditional source-control-flow finding, not a claim about every desktop document with inactive headers.
- Local behavior: preserve export of the original bit and do not introduce a direct TITLEPG-to-core-bit bypass on import. `rtfexport.first-page.test.ts` verifies this loss alongside initial/later emission, actual frame-item chain admission, side restrictions and independent sharing flags. Full header/footer services remain outside the represented model.


### WRITER289 — Ordered TYPE=1 can cancel installation of a fresh HTML level format

- Source: `sw/source/filter/html/htmlnumreader.cxx`, NewNumberBulletList TYPE switch and bChangeNumFormat checks.
- Observation: new-level defaults first set bChangeNumFormat=true, but ordered TYPE resets it to false for any first character other than A/a/I/i, including the ordinary-looking value1. Without START or CSS setting it again, the new default format is not copied into the rule.
- Impact: fallback numbering can still look Arabic while the explicit level format and label character style remain absent; outer-close completion also has no reference level to copy.
- Local behavior: retain the flag overwrite. `swhtml.numbering.integration.test.ts` checks absent explicit level/character style and Arabic fallback for TYPE=1. Do not treat1 as an additional recognized TYPE branch.

### WRITER290 — HTML CSS bullet keywords do not necessarily change an ordered list's numbering type

- Source: `sw/source/filter/html/svxcss1.cxx`, ParseCSS1_list_style_type; `htmlnumreader.cxx`, new-level CSS application.
- Observation: the CSS parser sets independent numbering and bullet flags. The list reader applies the numbering type only for m_bNumbering and the glyph only for m_bBullet.
- Impact: an OL with list-style-type:disc can retain Arabic numbering while storing the legacy disc glyph. The glyph is present in the format but does not itself force bullet numbering.
- Local behavior: retain both independent assignments. Tests inspect the actual native numbering type and glyph; do not reinterpret CSS using browser list rendering.

### WRITER291 — Folded whitespace after LI can remain in the preceding item text

- Source: `sw/source/filter/html/swhtml.cxx`, TEXTTOKEN/CDATA and AppendTextNode; `htmlnumreader.cxx`, EndNumberBulletListItem.
- Observation: explicit LI close ends attributes without immediately appending a paragraph. A subsequent folded newline-space token is inserted after the item text; the next item then appends. AppendTextNode strips trailing hard line feeds, not ordinary spaces.
- Impact: the native underlying paragraph string can contain a trailing space even though visual layout may hide it. A Markdown raw-HTML block follows the same reader path.
- Local behavior: preserve the actual space in HTML and transported Markdown paragraphs. Tests use exact strings instead of trimming input or output to conceal the native state.


### WRITER292 — Empty-paragraph script filtering can discard displaced style attributes

- Source: `sw/source/filter/html/swhtml.cxx`, SetTextCollAttrs and EndAttr; `htmlcss1.cxx`, InsertParaAttrs; `i18npool/source/breakiterator/breakiteratorImpl.cxx`, getScriptType.
- Observation: displaced block-style items are converted to LikePara attributes. EndAttr(false) still performs script-dependent filtering on their current empty range. The break iterator returns WEAK outside an empty string, which matches none of the Western/CJK/CTL posture families; LikePara does not bypass this optimization.
- Impact: an outer HTML-mode ADDRESS can lose its italic posture when an inner definition style replaces it on an empty paragraph. Non-script items such as underline can still survive the original hard-attribution path. This is a source-control-flow finding, not compiled desktop certification.
- Local behavior: retain the source filtering and document the loss. Real document tests compare ADDRESS posture loss with retained authored underline on the same nested definition structure; do not force the empty script family to Latin or postpone filtering to make the result look consistent.

### WRITER293 — Definition-list margin subtraction can wrap to a large unsigned indent

- Source: `sw/source/filter/html/swhtml.cxx`, SetTextCollAttrs DD/DT margin phase; `DocumentStylePoolManager.cxx`, HTML_DD/HTML_DT defaults.
- Observation: DD subtracts the DT style's margin, then explicitly narrows that signed difference to sal_uInt16 before adding it to the unsigned context margin. DT itself contributes zero extra margin even when its source style has been edited.
- Impact: default DD567twips with an authored DT700twips produces65403twips after narrowing, rather than a negative offset or a zero clamp. This need not establish a visible layout defect in every document.
- Local behavior: retain source subtraction and narrowing. Tests inspect actual node items for ordinary567/0 defaults, edited600-minus100 and right80-minus30 cases, nested accumulation and the negative wrap. Do not clamp it using browser CSS expectations.


### WRITER294 — CSS border shorthand gives zero and one pixel a hairline

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_border_xxx versus ParseCSS1_border_xxx_width.
- Observation: shorthand uses the literal1twip branch whenever pixel width is not greater than1, including0 and negative values. The separate width handler converts integer pixels normally. Thus border:0px solid and border:1px solid produce1twip, whereas border:solid;border-width:0px clears the line and explicit1px width gives15twips in the consumed96DPI profile.
- Preservation: retain the distinct source handlers and their admission/narrowing. Actual HTML tests inspect original box lines; no browser CSS normalization is applied. This is source-derived evidence, not compiled upstream certification.

### WRITER295 — CSS padding saturation feeds a signed box distance

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_padding_xxx/SetBoxItem; include/editeng/boxitem.hxx, signed sal_Int16 SetDistance.
- Observation: CSS pending padding saturates at65534 and is compared against minimum28 before calling the signed16box setter. A valid LENGTH70000pt saturates to65534, becomes-2 in the real box, and ordinary GetDistance suppresses that negative value to0. Six-digit999999pt is a different scanner case (WRITER160).
- Preservation: retain both unsigned CSS admission and signed native storage/read policy. Tests inspect raw and ordinary values; Worker transport must preserve the raw native value rather than repair or re-quantize it.

### WRITER296 — Border shorthand without color retains a preceding border color

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_border_xxx bColor branch.
- Observation: width/style are assigned for every selected side, while aColor is replaced only if an accepted color expression occurred. A preceding border-color:red followed by border:solid retains red instead of resetting the side's color through the shorthand.
- Preservation: keep that conditional assignment and source pending-value copies. Real HTML tests verify the retained red native line. Do not substitute browser shorthand reset semantics.


### WRITER297 — Unitless zero is not admitted as CSS padding or border width

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_padding_xxx and ParseCSS1_border_xxx_width.
- Observation: NUMBER has no admitted length branch. After padding:3pt, padding:0 leaves60twips pending, whereas padding:0px sets zero and the eventual border minimum produces28. In the width-only handler, an unrecognized NUMBER still assigns the default medium named width, so border:3pt solid;border-width:0 produces10twips rather than no line.
- Preservation: retain original token admission and nontransactional width defaults. Do not add a CSS-spec unitless-zero normalization; tests inspect actual HTML paragraph items.


### WRITER298 — An absolute border width can collide with the unset sentinel

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_border_xxx/ParseCSS1_border_xxx_width and SvxCSS1BorderInfo::SetBorderLine.
- Observation: GetULength is narrowed to unsigned16, whose65535value also denotes an unset absolute width. A source-level trace of border:3276.75pt solid gives65535twips, then selects the medium named fallback (10twips) instead of that absolute value. This is a defined scalar/source-control-flow finding, not a compiled desktop observation.
- Preservation: retain the original sentinel and named fallback. Do not replace it with an optional value or clamp the parsed width to a different maximum to force a CSS-spec result.


### WRITER299 — CSS pagination accepts only the first expression, with no positive count minimum

- Source: sw/source/filter/html/svxcss1.cxx, ParseCSS1_page_break_xxx, ParseCSS1_widows and ParseCSS1_orphans.
- Observation: the handlers inspect only the first expression. For example, page-break-inside:avoid trailing writes split=false and widows:3 trailing writes3. Widow/orphan NUMBER values accept zero, truncate fractional values, and clamp only values above255; a CSS-spec minimum or whole-expression validity check is absent. The existing scanner's six-hex priority still precedes numeric admission (WRITER160).
- Preservation: retain first-expression admission, zero/fractional values and upper-bound handling. Tests exercise defined source conversion cases, including -0.5, whose truncated value is0. Negative floating values whose truncated value is outside uint8 are not treated as a portable upstream result or a desktop certificate; no claim of defined C++ behavior is made for them.


### WRITER300 — CSS after:auto does not erase a before result already computed

- Source: sw/source/filter/html/htmlcss1.cxx, SwCSS1Parser::SetFormatBreak.
- Observation: before:always assigns PageBefore; after:auto sets write flags but does not reset that enum, so the resulting break remains PageBefore. Before:left followed by after:auto still writes the left page pointer, plus break=NONE and keep=false. The source's return value is bSetBreak: a left/right page reference alone returns false despite an item write.
- Preservation: retain both switch order and field/write-flag distinctions; do not replace them with independent normalized before/after properties.

### WRITER301 — HTML page copy changes requested left/right usage to All

- Source: sw/source/filter/html/htmlcss1.cxx, SwCSS1Parser::GetPageDesc; sw/source/core/doc/DocumentStylePoolManager.cxx, GetPageDescFromPool; sw/source/core/doc/docfmt.cxx, SwDoc::CopyPageDesc.
- Observation: pool creation makes the mutually following Left/Right pair with native side flags. The HTML parser then copies the HTML page's complete use flags onto only the requested page. A requested left becomes All while its right companion remains Right; requested right behaves symmetrically. CopyPageDesc(false) preserves the requested pool ID but still copies use flags.
- Preservation: keep the original order of pool materialization, HTML frame copy and subsequent follow rewiring, without correcting the side flag to match the CSS keyword.

### WRITER302 — CopyPageDesc skips follow mutation for a self-following source

- Source: sw/source/core/doc/docfmt.cxx, SwDoc::CopyPageDesc.
- Observation: only a non-self source follow enters the copy/lookup branch. Copying a self-following source into a target already following another page leaves that target follow unchanged. Other source fields and four independent frame item sets are still copied.
- Preservation: do not make self-follow an unconditional target reset. Cross-document non-self follow graphs use destination names and retain native recursive materialization.

### WRITER303 — Native page copies retain the original source follow pointer

- Source: sw/source/core/layout/pagedesc.cxx, SwPageDesc copy constructor; sw/source/core/doc/docdesc.cxx, SwDoc::MakePageDesc.
- Observation: native copy construction copies m_pFollow directly, including a source's self-pointer. MakePageDesc then changes the name and resets pool identity for a new name, without rebasing that pointer to the new owner. The prior local MakePageDesc incorrectly used a browser Clone helper that rebased self-follow.
- Preservation: native MakePageDesc now uses the original constructor; the explicit browser value-copy Clone helper remains separate. Do not normalize a copied native source follow.

### WRITER304 — ChgPageDesc mutates supplied frames and copies a selective page table

- Source: sw/source/core/doc/docdesc.cxx, SwDoc::ChgPageDesc and lcl_DescSetAttr.
- Observation: despite the const source reference, ChgPageDesc changes its left/first frame attributes before transferring them into the registered target. The page table excludes RES_BACKGROUND and RES_HEADER_FOOTER_EAT_SPACING and does not copy arbitrary paragraph attributes; drawing fill attributes participate separately. Mirroring constructs a fresh LR item, swaps margin measures and writes the original gutter into the right gutter.
- Preservation: retain source-frame mutations, selective copy/reset behavior, pool ID propagation and original margin operations. Do not flatten this native change into the existing browser geometry setter or a blanket item-set copy.


### WRITER305 — An empty first inline declaration prevents later declarations

- Source: sw/source/filter/html/parcss1.cxx, CSS1Parser::ParseStyleOption.
- Observation: after the initial ParseDeclaration, a missing expression returns from ParseStyleOption immediately. For page-break-before:;page-break-after:always the after declaration is never processed. This first-declaration branch differs from the later declaration loop's recovery behavior.
- Preservation: retain the original early return. Tests for an absent before/after property omit that declaration; a separate regression checks the actual empty-first-declaration behavior rather than normalizing it.


### WRITER306 — Table FRAME/RULES are discarded without a nonzero BORDER option

- Source: sw/source/filter/html/htmltab.cxx, HTMLTableOptions::HTMLTableOptions.
- Observation: explicit FRAME/RULES normally take precedence over border-derived defaults, regardless of their order. The final constructor branch nevertheless replaces both with Void/NONE when nBorder is0 or65535, including the initial unset sentinel. A table with FRAME=box RULES=all but no BORDER therefore retains no visible frame/rules in these options; explicit BORDER=65535 has the same effect.
- Preservation: keep the final source branch and sentinel distinction. Do not infer an implied BORDER from FRAME/RULES or normalize explicit65535 into a different width.

### WRITER307 — Table width is narrowed before percent clamping and COLS fallback

- Source: sw/source/filter/html/htmltab.cxx, HTMLTableOptions::HTMLTableOptions.
- Observation: numeric WIDTH is first narrowed to uint16, then the presence of any percent sign in its source string sets the percent flag and only values above100 are clamped. WIDTH=65536% thus becomes0%, while65537% becomes1%. If COLS is nonzero and the narrowed width is0, the final constructor branch substitutes100% even for an explicit zero width.
- Preservation: retain GetNumber conversion, narrowing, percent detection and final COLS fallback in their source order; do not clamp the original number before narrowing or distinguish absent width from explicit zero.


### WRITER308 — HTML cell replacement/protection retains prior width and metadata

- Source: sw/source/filter/html/htmltab.cxx, HTMLTableCell::Set and SetProtected; sw/inc/htmltbl.hxx, SwHTMLTableLayoutCell::SetProtected.
- Observation: Set assigns content/span/format/value/wrapping flags but does not reset m_nWidth or m_bRelWidth. SetProtected clears contents and resets spans, clones only the shared background brush, and keeps box/numeric/width/orientation/no-wrap/covered fields. The corresponding layout-cell protection also keeps width/percent/no-wrap options. A reused or protected cell can therefore expose earlier width metadata despite losing its content.
- Preservation: retain these selective writes and original shared/independent identities. Do not replace protection or Set with a fresh default cell. This is a source-state finding, not a confirmed desktop defect.

### WRITER309 — HTML content layout caching does not follow late source-chain mutations

- Source: sw/source/filter/html/htmltab.cxx, HTMLTableCnts::Add, SetNoBreak, SetTableBox and CreateLayoutInfo.
- Observation: CreateLayoutInfo recursively constructs the next content first, then caches its own layout reference once. Later Add or SetNoBreak do not invalidate those cached next links/no-break flags. SetTableBox checks that layout already exists; before construction it has no effect in release control flow, with a diagnostic in the source.
- Preservation: keep the original build-order behavior and borrowed actual section/box references. Tests distinguish cached layout links from later source chain links without private state writes. Late mutations are outside the normal build order; no desktop reproduction or debug assertion certificate is claimed.

### WRITER310 — HTML row span maintenance treats protected cells as contentless

- Source: sw/source/filter/html/htmltab.cxx, HTMLTableRow::Expand and Shrink; HTMLTable::CloseRow uses the same content-presence condition.
- Observation: a protected cell reports IsUsed=true but has no contents. Shrink walks trailing cells while GetContents is null, so it can change a protected cell's column span away from the1 assigned by SetProtected. Expand(oneCell=true) assigns decreasing spans only to newly appended cells; earlier cells retain their values.
- Preservation: retain the original GetContents condition and span update order. Do not substitute IsUsed or normalize the whole row on resize; actual cell/section tests preserve the source state transitions.


### WRITER311 — Table layout reconstruction and content layout caching have different lifetimes

- Source: sw/source/filter/html/htmltab.cxx, HTMLTable::CreateLayoutInfo and HTMLTableCnts::CreateLayoutInfo.
- Observation: the table method replaces m_xLayoutInfo on every call, whereas the content method constructs its next content first, then its nested table, and caches the resulting layout exactly once. A repeated outer-table layout creation therefore reuses cell-content layouts, including their originally captured nested layout, even when the nested table's latest layout pointer has changed.
- Preservation: retain the two different cache contracts and next-first construction order. Do not globally memoize tables or invalidate source content caches; normal construction order controls these references. This is a source-state observation, not a desktop defect reproduction.

### WRITER312 — Empty fixed-column tables can finish with zero columns

- Source: sw/source/filter/html/htmltab.cxx, HTMLTable::CloseTable and CreateLayoutInfo; BuildTable context admission.
- Observation: CloseTable first adds missing rows/columns, then trims columns to m_nFilledColumns. For an empty table with a nonzero initial COLS, filled columns remain zero, so the final trim removes all columns after the fallback row was created. CreateLayoutInfo assumes column zero exists; normal BuildTable does not materialize a table without its context.
- Preservation: keep the original fallback/trim order and caller admission. Do not synthesize a populated cell to repair this source edge case or treat invalid native vector access as a defined result; the TypeScript binding asserts the nonempty-layout precondition.

### WRITER313 — Opposite-side spacing tests the current column's left border

- Source: sw/source/core/doc/htmltbl.cxx, SwHTMLTableLayout::GetLeftCellSpace and GetRightCellSpace.
- Observation: an interior cell's right minimum spacing tests GetColumn(nCol)->HasLeftBorder(), rather than the next column's border. The left calculation can also add MIN_BORDER_DIST for a spanning cell reaching the table's right border even without its own left border. These conditions are asymmetric with simple geometric edge lookup.
- Preservation: retain current-column/span tests and uint16 assignment narrowing. Do not substitute a next-column lookup or a uniform border/padding rule; source-backed tests cover both border-aware and Netscape-only accounting.


### WRITER314 — Paragraph join admission excludes an exact remaining-capacity fit

- Source: sw/source/core/docnode/node.cxx, lcl_CheckMaxLength and SwContentNode::CanJoinNext/CanJoinPrev; SwTextNode::GetSpaceLeft.
- Observation: text joins require preceding.GetSpaceLeft() > following.Len(), rather than greater-or-equal. GetSpaceLeft already reserves two signed32 positions, so an exact fit in that reported remaining space is still rejected. Both directions use preceding capacity and leave the supplied output unchanged on failure; successful position output is assigned to the other node at offset zero.
- Preservation: retain the strict comparison and output timing. The current text-only graph has no transparent SwSectionNode family to skip; no synthetic section owner is introduced. The capacity boundary is source-reviewed, without allocating multi-gigabyte test strings or replacing real node lengths with mocks.

### WRITER315 — HTML table constraints use an OR condition rather than lexicographic ordering

- Source: sw/source/core/doc/htmltbl.cxx, SwHTMLTableLayoutConstraints::InsertNext.
- Observation: traversal stops when either an existing row is greater than the new row or its column is greater than the new column. Thus an existing row0/column5 constraint can be placed after an incoming row1/column2 constraint. This is not ordinary row-then-column lexicographic ordering despite the later pass's line-by-line commentary.
- Preservation: retain the original OR condition when porting the pending constraint owner and first layout pass. Do not silently substitute a comparator or sorted array with lexicographic semantics. This is a source-state finding; table constraint/pass implementation and desktop reproduction are not claimed here.

### WRITER316 — Existing-document HTML insertion can retain an empty suffix paragraph

- Source: sw/source/filter/html/swhtml.cxx, SwHTMLParser::CallParser and Continue.
- Observation: existing-document mode splits twice at the target cursor. After a closing block leaves a zero-offset paragraph, Continue joins that paragraph into the original suffix using suffix.JoinPrev; it does not apply the new-document trailing-node removal branch. Inserting a single block into an initially empty target can therefore retain an original empty suffix paragraph.
- Preservation: retain the separate insertion/new-document paths and original surviving suffix owner. Do not restore the previous section-EOF-only deletion shortcut. Actual graph tests distinguish the two modes; this is a source-state observation, without a compiled desktop defect claim.

### WRITER317 — HTML mark lookup scans primary positions in a vector sorted by range starts

- Source: sw/source/filter/html/htmlgrin.cxx, SwHTMLParser::HasCurrentParaBookmarks; sw/source/core/doc/docbm.cxx, mark ordering; sw/source/core/crsr/bookmark.cxx, MarkBase and UnoMark constructors.
- Observation: all marks are sorted by GetMarkStart, but the HTML lookup compares GetMarkPos and stops on the first later node. An expanded UNO mark retains the input primary/other orientation. If its range starts before the current paragraph but its primary position is later, early termination can hide a subsequent mark whose primary position is on the current paragraph.
- Preservation: retain the original primary-position comparison and early break, including UNO marks in the actual all-mark vector. Do not substitute range-start comparisons or the user-visible bookmark catalog. Tests use real oriented UNO ranges and real bookmarks; no compiled desktop reproduction is claimed.

### WRITER318 — Empty HTML insertion prefixes retain their list level during the first join

- Source: sw/source/filter/html/swhtml.cxx, Continue prefix repair; sw/source/core/txtnode/ndtxt.cxx, JoinNext and CutImpl hard-item transfer.
- Observation: an empty original prefix adopts the first imported paragraph collection and joins its text. CutImpl copies the source hard paragraph items but explicitly excludes RES_PARATR_LIST_LEVEL. Thus a deeply nested first list paragraph can retain the insertion prefix level zero even though the imported source had a clamped deeper level. A preceding imported body paragraph avoids this first-join case.
- Preservation: retain original collection/join ordering and list-level exclusion. Keep separate real imports testing level clamping after a body paragraph and first-paragraph level retention. Do not silently copy the excluded item or rewrite list nesting. This is a source-state observation, not a compiled desktop defect reproduction.

### WRITER319 — Nested-table background inheritance does not clear an earlier inherited brush

- Source: sw/source/filter/html/htmltab.cxx, HTMLTable::InheritBorders and SetBorders.
- Observation: InheritBorders replaces its inherited background only if a parent source brush is found. A later call with no qualifying brush leaves the previous clone intact. SetBorders also skips a nested table whose BordersSet flag is already true, so repeating the outer operation after changing an outer background does not refresh that nested inheritance.
- Preservation: retain conditional cloning and the source completion guard. Do not clear or refresh nested inherited brushes on repeated calls. Real parent/child grid tests distinguish own and inherited brushes and retain actual object identity; no desktop defect reproduction is claimed.

### WRITER320 — RULES rows and columns also admit group separators on the opposite axis

- Source: sw/source/filter/html/htmltab.cxx, HTMLTable::SetBorders.
- Observation: RULES=rows still creates a vertical border after a column group, and RULES=cols still creates a horizontal border after a row group. RULES=groups uses both group conditions. The source tests the opposite-axis group boundary in addition to the ordinary rows/columns rule.
- Preservation: retain the exact OR conditions and end-of-group ownership. Do not interpret rows/cols as excluding all opposite-axis separators. Actual column-group tests cover rows/cols/groups distinctions; row-side source ordering is retained for the pending box-format consumer. This is a source-state observation without a compiled desktop defect claim.

### WRITER321 — Table-tag style completion can precede the existence of any matching CSS entry

- Source: sw/source/filter/html/htmlcss1.cxx, SwCSS1Parser::SetTableTextColl; swcss1.hxx, SetTDTagStyles/SetTHTagStyles/SetDelayedStyles.
- Observation: the TD/TH completion flag is set even when neither the tag nor tag-P map entry exists. A matching entry added later is therefore ignored by subsequent one-shot calls, including terminal SetDelayedStyles. Existing entries also remain one-shot after later map changes.
- Preservation: retain lazy collection materialization, unconditional completion and original TH/TD/A terminal order. Do not invalidate the completion flag on map insertion or replay the cascade. Tests use real parsed declaration sets, original InsertTag/GetTag operations and actual pooled paragraph styles; no private flags or stylesheet producer are fabricated. This is a source-state observation, not a compiled desktop defect reproduction.

### WRITER322 — Empty-cell section construction assigns two-point fonts through only one overload

- Source: sw/source/filter/html/htmltab.cxx, the two SwHTMLParser::InsertTableSection overloads.
- Observation: the predecessor-start overload selects the table-body collection and explicitly applies font height40twips (2pt) at100percent to Western, CJK and CTL on the first paragraph. The pool-ID overload changes the requested collection without these direct height items. MakeTableLine uses the predecessor overload when creating missing or covered cell contents, so the small height may be intentional for empty cells, despite resembling a missing zero or a default-font inconsistency.
- Preservation: retain the overload distinction and exact40twip values when connecting the pending section consumers. Do not normalize them to ordinary table font height or400twips. This is source review evidence; the parser section consumers and a compiled desktop comparison are not claimed in this checkpoint.

### WRITER323 — A completed table with no enclosing table remains the section-insertion target

- Source: sw/source/filter/html/htmltab.cxx, the pool-ID SwHTMLParser::InsertTableSection overload.
- Observation: when the current table already has an HTML layout, the do/while searches enclosing tables. If no outer table exists, the last table variable still refers to that completed current table; a new section is inserted before its end. The finished-layout marker alone does not cause failure or require a different insertion target.
- Preservation: retain the do/while assignments and same-table fallback. Do not reject the table solely because its layout exists or manufacture an outer table. Tests assign a real layout reference and inspect actual new section ownership; no desktop defect reproduction is claimed.

### WRITER324 — Column percentage syntax is treated as absolute width while only an asterisk selects relative width

- Source: sw/source/filter/html/htmltab.cxx, SwHTMLParser::BuildTableColGroup group/COL width options and HTMLTable::InsertCol.
- Observation: WIDTH reads a uint16 numeric prefix and selects relative width only when the original string contains an asterisk. Thus50percent becomes an absolute50pixel column option, converted to750twips;3asterisk remains relative3. The table WIDTH option has a separate percent path, so the two option owners differ.
- Preservation: retain numeric narrowing, asterisk detection and the native column conversion. Do not route a percent sign through the relative-column flag or table percent-width parser. Actual byte-stream column tests cover these families; no compiled desktop defect claim is made.

### WRITER325 — Zero SPAN differs between an empty COLGROUP and a COL

- Source: sw/source/filter/html/htmltab.cxx, BuildTableColGroup, TableColGrpSaveStruct::CloseColGroup, HTMLTable::CloseColGroup and InsertCol.
- Observation: SPAN is narrowed to uint16 before values above256 are replaced by1. A zero empty-group span bypasses column insertion, whereas a zero COL span reaches InsertCol and becomes1. Consequently65536 also becomes zero before these different downstream rules. Any child COL sets the saved group span to zero to suppress extra group columns.
- Preservation: retain the narrowing/limit order and separate close/insert rules. Do not globally clamp every span to at least1. Tests use actual lexer options and native column owners, including the source zero-column layout admission boundary; full table materialization remains pending.

### WRITER326 — Table-section font protection wraps at uint16 depth while context protection does not

- Source: sw/source/filter/html/swhtml.hxx, m_nBaseFontStMin/m_nFontStMin/m_nFontStHeadStart; htmltab.cxx, SectionSaveStruct constructor/Restore; swhtml.cxx, NewHeading/EndFontAttr.
- Observation: font-stack sizes are assigned to uint16 lower bounds, whereas context-stack bounds are size_t. At65536 open font entries a section freezes the font bound at0 but protects all65536 contexts. A font closer cannot pop its protected context yet still pops a font entry; Restore truncates the font stack at the wrapped bound. This appears capable of losing outer font-stack state for extremely deep input.
- Preservation: retain uint16 narrowing and independent font/context bounds, including the heading font-stack start width. Do not clamp or widen the original counters. The focused regression builds the actual deep stack through65536 native NewFontAttr calls, then observes original save/close/restore operations. It does not certify complete table token orchestration or pending-device behavior.

### WRITER327 — A cell SDVAL without SDNUM publishes a present numeric value of zero

- Source: sw/source/filter/html/htmltab.cxx, CellSaveStruct constructor and InsertCell.
- Observation: SDVAL sets the independent has-value flag and retains its text, but conversion runs only when SDNUM was also present. With SDVAL42 alone the initialized numeric value0 is published with has-value true and has-number-format false. This appears capable of discarding a supplied value while marking a different value as present.
- Preservation: retain independent flags, zero initialization and the SDNUM-only conversion gate. Do not infer a format, parse SDVAL independently or clear its presence flag. The focused real-byte-stream cell case observes the original grid flags/value and confirms no document formatter was constructed.

### WRITER328 — HTML table numeric options ignore recognition and format-insertion failure

- Source: sfx2/source/bastyp/sfxhtml.cxx, SfxHTMLParser::GetTableDataOptionsValNum; svl/source/numbers/zforfind.cxx, ImpSvNumberInputScan::IsNumberFormat.
- Observation: the helper ignores numeric recognition success and both format insertion results/error positions. Failed normal numeric recognition yields0; an explicitly empty format suffix reaches PutEntry's early failure and key reset0, while the supplied format-language output is retained. The helper still returns the numeric value and does not reject the cell.
- Preservation: retain source status erasure and output assignment order. Do not add validation failure, a replacement format key or a separate number parser. Focused helper cases consume the actual formatter/scanner/table, including invalid numeric input, empty suffix and independent parse/display locales. This does not certify unrepresented input-device/desktop profiles.

### WRITER329 — Zero cell width discards the percentage-width selector

- Source: sw/source/filter/html/htmltab.cxx, CellSaveStruct width parsing and HTMLTable::InsertCell.
- Observation: WIDTH is narrowed to uint16 before the percent clamp, but InsertCell only assigns the width and its relative selector when numeric width is nonzero. Thus65536percent narrows to0 and publishes width0 with percent false, whereas65537percent publishes width1 with percent true. The option's percent syntax is lost in the zero case.
- Preservation: retain the narrowing, percentage clamp and conditional grid assignment. Do not independently publish the percentage flag for zero width or replace the original guard. Focused actual-byte-stream cases observe the original intermediate layout option fields.

### WRITER330 — Ordinary RTF paragraph direction output collapses vertical modes to LTRPAR

- Source: sw/source/filter/ww8/rtfattributeoutput.cxx, RtfAttributeOutput::FormatFrameDirection.
- Observation: page-description output handles vertical RL_TB through stextflow1 and RTF fly syntax has separate txflTextFlow properties. After those branches, ordinary paragraph output emits RTLPAR only for Horizontal_RL_TB and LTRPAR for every other resolved mode, including vertical modes. This appears lossy for an explicitly vertical paragraph item.
- Preservation: retain the original context branches and final horizontal token choice when connecting direction export. Do not manufacture a vertical paragraph control or treat all non-LTR modes as RTL. This finding is pinned source-review evidence; HTML45 implements import/typed property flow and does not yet claim the RTF export/default-direction owner or rendered layout profile.

### WRITER331 — table attribute split tests unequal raw offsets rather than increasing ranges

Pinned `sw/source/filter/html/swhtml.cxx`, `SwHTMLParser::SplitAttrTab(shared_ptr<HTMLAttrTable>, bool)`, clones a same-paragraph range whenever the raw start content differs from the end content. It does not require start < end. Moving the actual cursor behind an open attribute therefore queues an inverted raw range before resetting the original owner at the new position. This may look like a missing increasing-range check; preserve the original comparison and let the existing deferred consumer decide admission. The HTML46 native-state regression retains start4/end2 and reopened start2. This observation does not assert a confirmed upstream defect.

### WRITER332 — standalone CutText append leaves preexisting destination-end indices in place

Pinned `sw/source/core/txtnode/ndtxt.cxx`, three-argument `SwTextNode::CutText`, constructs an append boundary and calls `CutImpl(..., false)`. Consequently the destination text grows while registered indices at its former end do not advance; source indices instead receive the original negative update. This may look like stale destination cursor/bookmark positions if the operation is confused with a join or ordinary insertion. Preserve the original distinction: joins perform their own source-position relocation. The HTML47 regression observes destination index6 while text grows from6to10, and source indices0/2/4 remain on their original node at0. This is an observation of a potentially surprising contract, not a confirmed upstream defect.

### WRITER333 — selected paragraph ends include a mark at the nominal upper boundary

Pinned `sw/source/core/doc/docbm.cxx`, `lcl_Lower`, ordinarily uses a strict content upper bound, but explicitly returns true when the requested end content is the end text node's length. A collapsed bookmark exactly at that paragraph end is therefore included, while the same mark at an interior selected end is excluded. This may look like inconsistent half-open range handling; preserve the source exception. Native HTML49 tests compare selected2..4 and2..6 on six-character text, including both regular bookmarks and internal UNO marks. This is not a confirmed upstream defect.

### WRITER334 — expulsion can preserve an expanded UNO mark with equal endpoints

Pinned `docbm.cxx`, `lcl_FindExpelPosition`/`lcl_FixCorrectedMark`, falls back to the other endpoint when no neighboring content is available. The fix clears the other position only for a cross-cell selection; equal positions in the same context are not enough. `sw/inc/IMark.hxx` defines IsExpanded by presence of its second position, so the result can remain expanded with equal coordinates. This may look like a missing empty-range collapse. Preserve it; HTML49 authors actual extra/body endpoints across fixed-section boundaries and retains the equal-position expanded result. This is not a confirmed upstream defect.

### WRITER335 — absolute PaM correction can report a change only to an inactive bound

Pinned `sw/source/core/doc/doccorr.cxx`, `lcl_PaMCorrAbs`, processes both `GetBound()` and `GetBound(false)` regardless of HasMark. `sw/inc/pam.hxx` exposes those permanent physical positions independently of Point/Mark aliases. Consequently an unmarked PaM whose inactive bound lies in the closed correction interval can return true even when its active Point is outside and unchanged. This may look like an incorrect changed result. Preserve both evaluations and the return value; the HTML50 native-public-operation regression retains that exact case. Global edit-shell/UNO-cursor traversal and notification consumers are not certified by the primitive test, and this is not a confirmed upstream defect. HTML52 extends evidence to the actual UNO notification consumer: an inactive-bound-only match sets changed, while the pre-correction active Point and target have different fixed sections, so UnoCursorHint invalidates the pointer even though the active Point remains unchanged. Preserve the hint as well as the primitive result. The full global edit-shell traversal and production deletion composition remain uncertified.

### WRITER336 — UnoCursorPointer reset starts a duplicate subscription for the same cursor

Pinned `sw/inc/unocrsr.hxx`, `sw::UnoCursorPointer::reset`, calls StartListening(pNew->m_aNotifier) before EndListening(m_pCursor->m_aNotifier). If pNew and m_pCursor refer to the same cursor, the initial subscription violates SfxListener default DuplicateHandling::Unexpected before the old subscription ends. Copy assignment instead ends the old subscription first. This looks surprising for a shared-owner reset operation but is not a confirmed upstream defect: callers may exclude same-owner resets. Preserve source ordering and duplicate-subscription preconditions. The native cursor regression exercises this case without adding a self-reset shortcut or changing SfxListener. Wider debug/release assertion and ABI behavior is not certified.

### WRITER337 — Any bottom ALIGN wins in duplicate caption attributes

Pinned `sw/source/filter/html/htmltab.cxx`, `SwHTMLParser::BuildTableCaption`, initializes bTop=true and scans all options in reverse. It sets bTop=false on every case-insensitive ALIGN=bottom and never sets it true for ALIGN=top. Consequently either ordering of duplicate top/bottom attributes yields a bottom caption, rather than the ordinary reverse-scan first-attribute precedence used by table STYLE. This may look inconsistent, but is not a confirmed upstream defect. Preserve the one-way flag update. The real lexer/caption-lifecycle regressions cover bottom/top and top/bottom duplicate orders and uppercase BOTTOM without replacing option or parser state. Whole recursive table/caption grammar and native differential behavior are not certified by this component evidence.

### WRITER338 — Table insertion redo drops the original shell and model flags

Pinned `sw/source/core/undo/untbl.cxx`, `SwUndoInsTable::RedoImpl`, calls `SwDoc::InsertTable` with arguments only through the saved column vector. The original `bCalledFromShell` and `bNewModel` arguments are not stored by the undo action, so reconstruction uses the declaration defaults false and true. A first insertion using the old table model is therefore recreated with the new model; shell paragraph adjustment propagation also differs on redo. The saved table name is restored separately with SetFormatName after construction. This looks surprising for undo/redo but is not a confirmed upstream defect. Preserve the omitted flags and separate rename, and keep the browser's existing initial-operation bridge distinct from redo. Native table insertion regressions cover model reset and the live page-attribute transfer; whole old-model table algorithms and non-null table autoformat are not certified.

### WRITER339 — Numbering-aware HTML margins retain narrowing overflow

Pinned `sw/source/filter/html/htmlcss1.cxx`, `SwHTMLParser::GetMarginsFromContextWithNumberBullet`, adds GetAbsLSpace to a sal_uInt16 output and assigns GetFirstLineOffset to a short output. Both statements carry source TODO overflow comments. Large context/list spacing can therefore wrap the left margin and narrow the signed first-line indent rather than saturating either output. This is source-acknowledged surprising behavior, not a verified upstream defect for the admitted document domain. Preserve both conversions and the depth-to-MAXLEVEL clamp. Actual parser/context/rule regressions cover a wrapped left margin, signed indent narrowing and excessive list depths; no safer widened-margin replacement is used.

### WRITER340 — Nested table break transfer deliberately leaves the parent's items set

Pinned `sw/source/core/docnode/ndtbl.cxx`, lcl_transferTableBreaks, copies direct RES_PAGEDESC and RES_BREAK from a containing table when insertion is before the first paragraph of its first cell. Both corresponding ResetFormatAttr calls are commented out; the page-descriptor comment says TODO: not transferred back on table delete. This duplicates the break/page attributes on parent and nested table instead of transferring ownership. Preserve both copies and the original first-paragraph/first-cell guards. Actual document/box regressions verify parent items remain and that nested insertion does not instead move the following paragraph's own page attributes. This is source-acknowledged surprising behavior, not a confirmed defect or certification of whole nested-table rendering.

### WRITER341 — Default table naming reserves numbers from noncanonical suffixes

Pinned `sw/source/core/docnode/ndtbl.cxx`, SwDoc::GetUniqueTableName, tests only the localized default prefix and converts the remaining suffix with o3tl::toInt32 before setting its bitmap. Leading zeros, an explicit plus and trailing nonnumeric text can therefore reserve the same number as a canonical name, even when that exact canonical table name does not exist. Preserve native integer conversion and byte-flag selection rather than adding a strict-digit check. Actual table regressions exercise Table01, Table+1 and Table1tail, and crossing the first bitmap byte. This may look surprising for first-unused naming but is not a confirmed upstream defect; mail merge, localization and unused/default native format owners remain outside this evidence profile.

### WRITER342 — Markdown table callbacks retain an unchecked nullable table result

Pinned `sw/source/filter/md/mdtab.cxx`, SwMarkdownParser::StartTable, stores the pointer returned by SwDoc::InsertTable without a null check. StartCell subsequently dereferences MDTable::GetTable. The document constructor explicitly returns null for positions in the inserts/footnote interval (`sw/source/core/docnode/ndtbl.cxx`). If a parser is supplied such a position and reaches a table callback, these contracts appear to permit a null dereference. This is a source-based suspected issue, not a confirmed reachable upstream crash: reader/caller constraints may exclude the state. Preserve the nullable stored pointer and the requirement for an actual table at StartCell; do not fabricate an empty table or silently accept a rejected insertion. The current pointer regression proves null initialization/assignment, not whole reader reachability or native crash behavior.

### WRITER343 — Markdown table end retains the existing trailing paragraph and appends another

Pinned `sw/source/filter/md/mdtab.cxx`, SwMarkdownParser::EndTable, first moves the actual PaM forward from the final cell and then unconditionally calls AppendTextNode(AM_SPACE) before resetting its table owner. SwDoc::InsertTable leaves the original insertion paragraph after the table, so the ordinary new-document path retains that paragraph and appends a further paragraph for following content. The new-document Markdown reader has no EndPaste cleanup. This may produce an extra empty paragraph around a table; it is not a confirmed upstream defect. Preserve actual movement, append, spacing and release order, rather than consuming the original paragraph to normalize the output. Regression evidence uses real md4c/document callbacks; whole insertion-mode reader/paste behavior is not certified.


### WRITER344 — Content-box index lookup can return another table's layout box

Pinned `sw/source/core/table/swtable.cxx`, `SwTable::GetTableBox(SwNodeOffset)`, scans this document from the supplied index plus one and returns the first content/table frame's containing cell without checking that the cell belongs to the queried table. Only the no-cell fallback searches this table's own content-pointer registry. An index from another table in the same document can therefore yield no box without layout and that other table's box with layout. Preserve the original scan, first-frame ascent and return; do not add an ownership check to normalize the two branches. This is a source-based suspected asymmetry, not a confirmed reachable compiled Writer defect: caller contracts may require the index to name a content cell of the queried table. The translated regression uses real same-document tables, actual registered content/table/cell frames and both layout states; no frame/result provider is replaced.


### WRITER345 — Anchor replacement has a potential optional-position self-alias hazard

Pinned `sw/source/core/layout/atrfrm.cxx`, `SwFormatAnchor::SetAnchor`, validates its position argument and then calls `m_oContentAnchor.emplace(*pPos)`. The public GetContentAnchor getter can return the existing contained position. If that pointer is passed back to SetAnchor on the same item, replacement destroys the existing optional position before constructing the new copy from the supplied reference. This is a source-based suspected self-alias/lifetime hazard, not a compiled Writer reproduction or a claim of a defined native result; caller constraints may exclude the input. Preserve the original destroy/reconstruct order for valid distinct input positions rather than converting replacement to in-place assignment or copying ahead of destruction. The translated normal-case regression observes real owner disposal before new position construction; native self-alias reachability and undefined-behavior details are not certified.

### WRITER346 — FrameFormats default insertion skips the list back-reference

Pinned `sw/inc/frameformats.hxx`, `FrameFormats::newDefault(const value_type&)`, inserts directly through `GetByPos().push_front`, whereas `push_back` first assigns the format's `m_ffList`. A fresh default can therefore be found in container storage while `ContainsFormat` returns false, and virtual frame rename does not dispatch through that collection. Existing-position relocation also leaves the back-reference unchanged. This is a source-based suspected inconsistency, not a confirmed compiled upstream defect or assertion about reachable document setup. Preserve the original distinction; actual format/container tests cover insertion, relocation and membership without manufacturing a format provider.

### WRITER347 — Base format rename builds its old-name field after assigning the new name

Pinned `sw/source/core/attr/format.cxx`, `SwFormat::SetFormatName`, first assigns `m_aFormatName = rNewName` and then constructs `sw::NameChanged(m_aFormatName, rNewName)` when broadcasting. Both fields therefore contain the new name, and the represented original SwFormat/SwModify notification filters discard NameChanged. By contrast, registered `SwFrameFormat::SetFormatName` constructs the hint before collection rename and broadcasts it directly through `GetNotifier()`. This looks inconsistent for name observers; no compiled native reproduction or broader accessibility behavior is certified. Preserve both source branches and their distinct dispatch channels when porting the full rename route. The registered special-frame branch now retains actual old/new payload behavior. The pre-existing general base-setter browser inheritance notification is still a local divergence: removing it in isolation breaks the current style selector update path, because native SwDoc::RenameFormat, rename undo and BroadcastStyleOperation are not implemented. That separate route must be migrated together before base setter behavior can be certified; this prerequisite checkpoint does not claim it.

### WRITER348 — SectionDown output endpoints depend on deleted boundary sentinels

Pinned `sw/source/core/docnode/nodes.cxx`, `SwNodes::SectionDown`, decrements `aEnd`, optionally deletes that StartNode through `DelNodes`, then decrements the corrected `aEnd` again. The shared `SectionUpDown` scan continues until its start stack empties at or beyond that boundary; it does not retarget `aEnd` to the matching final EndNode. Consequently, when the trailing StartNode is removed, the returned endpoint can refer to preceding content rather than the result's section end. If an initial EndNode and that trailing StartNode are both removed, native index correction can leave `aStart` after `aEnd`, while the actual section graph is consistently rebuilt. This is a source-derived suspected endpoint-contract ambiguity, not a confirmed compiled upstream defect or proof that a user-visible caller relies on the output as a normalized interval. Preserve both DelNodes corrections, the final decrement and the continuing stack walk; do not sort or repair the returned range. Actual node/index/section fixtures cover these branches without supplying fake mutation results or constructing a fly-format provider.

### WRITER349 — Formula frame-pool defaults repeat the same vertical item write

Pinned `sw/source/core/doc/DocumentStylePoolManager.cxx`, `DocumentStylePoolManager::GetFormatFromPool`, shares the FRM_FORMEL/FRM_INLINE_HEADING branch. It first inserts CHAR_CENTER/FRAME vertical orientation for both styles, then the Formula-only else branch inserts that identical vertical item again. This looks like a redundant retained write, not a confirmed functional defect; no compiled upstream notification, allocation or performance effect is claimed. Preserve both source Put operations. The native default-set consumer keeps the ordinary one-item-per-Which final value; it does not add an invented second attribute or remove the repeated source operation.

### WRITER350 — DateTimeToOUString appends Z without converting local fields to UTC

Pinned `tools/source/datetime/datetimeutils.cxx`, `DateTimeToStringImpl`, keeps the UTC conversion commented out and serializes the supplied date/time fields with a trailing `Z`. `sw/source/core/doc/doclay.cxx`, `lcl_GetUniqueFlyName`, passes `DateTime(DateTime::SYSTEM)` for mail-merge names, so this source path labels local system fields with that suffix. Preserve the original fields, omitted fractions and suffix in our serializer and native name allocation. This is a source-observed semantic suspicion; no compiled LibreOffice differential, uniqueness defect or platform precision equivalence is asserted.

### WRITER351 — Frame-format create undo reads the retained format pointer during recreation

Pinned `sw/source/core/undo/SwUndoFmt.cxx`, `SwUndoFormatCreate::UndoImpl`, saves the item set/pool-range bits/auto flag and calls the virtual `Delete()` without clearing `m_pNew`. The frame subtype's `Delete()` calls `SwDoc::DelFrameFormat`, whose ordinary-format branch in `sw/source/core/doc/docfmt.cxx` erases and deletes the format. Later `SwUndoFrameFormatCreate::Create` passes `m_pNew->IsAuto()` to `MakeFrameFormat`, before the base redo replaces `m_pNew`; the base already retains `m_bAuto` separately. This appears to read a stale native pointer. Record and preserve the source contract when that undo responsibility is implemented, rather than silently substituting a saved boolean. This is source inspection only: no compiled native UAF, allocator reuse or observable redo outcome is asserted. The undo/factory responsibility is still unported in our current slice.

### WRITER352 — Format-create undo does not retain auto-update-on-direct-format

Pinned `sw/source/core/undo/SwUndoFmt.cxx`, `SwUndoFormatCreate::UndoImpl`/`RedoImpl`, retains the direct item set, pool range bits and `IsAuto()` but never reads or restores `IsAutoUpdateOnDirectFormat()`. The independent bit is initialized to false by the regular `SwFormat` constructor in `sw/source/core/attr/format.cxx`; the paragraph create subtype recreates through the regular constructor. Thus a true independent auto-update bit is not retained across this source create-history cycle, while ordinary `IsAuto()` is restored. Preserve this omission in the generic owner; do not add another captured flag to repair it. The actual local paragraph history test retains the original false result. This is source-backed behavior/suspicion, not compiled LibreOffice differential evidence or a claim about every UI/style-family workflow.

### WRITER353 — Generic paragraph create/delete history does not retain its follow-style pointer

Pinned `sw/source/core/undo/SwUndoFmt.cxx` generic create/delete owners retain direct item sets, names, parent names, range bits and IsAuto, with no paragraph follow-style pointer/name. Their paragraph subtypes recreate through `MakeTextFormatColl`. The regular `SwTextFormatColl` constructor in `sw/source/core/doc/fmtcol.cxx` initializes `mpNextTextFormatColl = this`; `sw/inc/fmtcol.hxx` stores this relationship outside the item set. Consequently the source recreation path retains the new self-follow default instead of an old explicit follow style. Preserve that omission in both actual local history paths rather than adding a private follow snapshot. Source-backed local tests cover a real nondefault parent/follow style; this is not compiled LibreOffice differential evidence or a claim about every composite UI history workflow.

WRITER352 extension (HTML72): the generic delete owner has the same independent auto-update-on-direct-format omission as the generic create owner. Its eager snapshot stores IsAuto and direct items, and its regular recreation retains the original false independent auto-update default. The local delete-history test preserves this result without an extra captured flag or native compiled/out-of-domain outcome claim.

### WRITER354 — Generic delete history assumes a nonnull derived parent

Pinned `sw/source/core/undo/SwUndoFmt.cxx`, `SwUndoFormatDelete` constructor, dereferences `_pOld->DerivedFrom()` to obtain its name without checking null. The regular `SwFormat` constructor in `sw/source/core/attr/format.cxx` explicitly accepts a null parent, and `SwDoc::MakeTextFormatColl` in `sw/source/core/doc/docfmt.cxx` forwards that pointer unchanged. Document deletion protects its particular default collection but does not itself check every nondefault format's derived parent before constructing delete history. If a nondefault parentless format reaches that recording-enabled path, the source assumes a parent that the constructor graph need not supply. Preserve the precondition; do not synthesize a default/empty parent or claim a defined native exception/success outcome for that input. The host port rejects the missing-parent precondition and releases its partially constructed value set. This is a conditional source-level suspicion, not proof that a normal LibreOffice UI workflow reaches it or compiled-native crash evidence.

WRITER330 extension (HTML73): the actual RTF byte writer now exercises the
ordinary paragraph callback. A direct Vertical_LR_BT item emits LTRPAR and
reimport produces Horizontal_LR_TB. Vertical section and table-cell controls
use their original separate dispatch. This is source-backed local evidence.

### WRITER355 — Environment fly direction depends on an acyclic anchor chain

Pinned `SwDoc::GetTextDirection` in `sw/source/core/doc/doclay.cxx` and
`MSWordExportBase::TrueFrameDirection` in `sw/source/filter/ww8/wrtw8nds.cxx`
walk from an Environment fly format to its anchor node's owning fly format.
They stop at an explicit direction, an at-page anchor, or an absent owner.
Neither loop checks for a repeated format. A cycle of Environment fly anchors
would leave neither loop a terminating condition. Preserve the original walk
and the expectation of an acyclic model. This observation concerns the loop
contract and makes no claim that the native UI can construct such a cycle.

### WRITER356 — Section grid size treats horizontal RTL as a width-based mode

Pinned `SectionPropertyMap::CloseSectionGroup` in
`sw/source/writerfilter/dmapper/PropertyMap.cxx` selects usable page height
only when WritingMode is exactly LR_TB. Every other value selects usable page
width, including RL_TB, which the native DomainMapper can insert for section
BiDi. Preserve this comparison rather than switching it to a vertical-mode
test. The RTF STEXTFLOW path exercises the vertical width case. The horizontal
RTL observation is source-level.

### WRITER357 — RTF section BiDi flags publish raw values to paragraph sprms

Pinned `RTFDocumentImpl::dispatchFlag` in
`sw/source/writerfilter/rtftok/rtfdispatchflag.cxx` inserts LTRSECT/RTLSECT
as raw 0/1 under `LN_EG_SectPrContents_textDirection` in the paragraph sprms
and resets associated run type. The native mapper's textDirection switch
instead recognizes generated TextDirection identities, as sent by STEXTFLOW.
Both raw values reach its default LR_TB branch. Preserve the original sprm
owner, value, and mapper fallback. This is not evidence of an identical
outcome in every native section-layout context.

### WRITER358 — Hidden UNO cell direction applies Environment when conversion fails

Pinned `SwXCell::setPropertyValue` in `sw/source/core/unocore/unotbl.cxx`
handles the hidden FRMDirection property with a fresh Environment item.
It ignores the boolean result of PutValue and applies that item to the
current box format without ClaimFrameFormat. An invalid Any therefore
replaces the previous direction with Environment. Preserve the original
conversion and direct-format behavior. The local test exercises the invalid
Any result on an actual imported cell.

### WRITER359 — HTML table maximum-width expansion drops per-column rounding remainders

Pinned `SwHTMLTableLayout::AutoLayoutPass2` in
`sw/source/core/doc/htmltbl.cxx` independently truncates each column in the
ordinary maximum-width branch. Unlike the constrained and mixed-width
branches, it does not assign the remaining twips to the last column. The
calculated table width can therefore differ from the sum of the actual column
widths. Preserve the branch's independent truncation. The local layout test
uses a 302-twip table with three equal maxima and observes 100 twips per column.

### WRITER360 — HTML table minimum constraint subtracts an absolute baseline from a relative width

In the same source method, the constrained nested-width branch subtracts the
absolute content-and-border baseline from the relative table width in
`sal_uLong`. If the relative width is smaller, the subtraction wraps.
The represented 64-bit integral path retains that arithmetic and the later
16-bit narrowing. This observation concerns the calculation on the supplied
layout inputs. Reachability from a particular native HTML document and
platform-width variants remain unverified.

### WRITER361 — Import text-width measurement replaces the ordinary left margin with the first-line offset

Pinned `SwTextNode::GetMinMaxSize` in `sw/source/core/text/itratr.cxx`
replaces the accumulated left margin whenever `GetFirstLineOfsWithNum`
returns false. That method returns false for a non-list paragraph even though
it writes the actual first-line offset. The source can therefore measure an
ordinary paragraph with the first-line value instead of its text-left margin.
Preserve the replacement and the signed-short conversion.

### WRITER362 — Anchored fly width measurement clamps different sides of zero

Pinned `lcl_MinMaxNode` in `sw/source/core/text/itratr.cxx` clamps positive
remaining right space for a non-FRAME right relation and negative remaining
left space for a non-FRAME left relation. The original comparison is preserved
on each side. Focused local tests use actual attached fly formats and preserve
their source order.

### WRITER363 — HTML spanning-cell constraints are not ordered lexicographically

Pinned `SwHTMLTableLayoutConstraints::InsertNext` in
`sw/source/core/doc/htmltbl.cxx` stops on either a greater row or a greater
column. A constraint in a later row can consequently be inserted before one
in an earlier row if its column is smaller. Preserve this condition because
successive constraints operate on column widths already changed by the
preceding constraints.

### WRITER364 — HTML spanning-cell maxima discard fractional remainders

Pinned `SwHTMLTableLayout::AutoLayoutPass1` assigns the remainder of a
proportional minimum increase to the last spanned column. The maximum increase
instead truncates each share independently. The sum of maximum widths can
therefore fall short of the constraint. The local regression preserves a
210-twip constraint with a 209-twip result.

### WRITER365 — HTML inferred percentages include ineligible fixed columns in the denominator

The same first pass uses the maximum of all non-percent columns when it
distributes unclaimed percentages, including fixed-width columns. It only
assigns percentages to nonempty columns with no authored width, and it
independently truncates each share. Preserve the source denominator and
assignment conditions. The local regression retains an inferred 45% from
60 unclaimed points when a fixed column occupies one quarter of the
denominator.

### WRITER366 — ICU tests completion before storing a lookahead position

Pinned ICU 78.3 `RuleBasedBreakIterator::handleNext` in
`vendor/icu-reference/source/common/rbbi.cpp` checks the accepting row before
recording the current position for a lookahead rule. The source comment
describes the effect on hard breaks with no following context and notes
line-break test failures when reversing the checks (ICU-20837). Preserve
the ordering. All three compiled LibreOffice dictionary word tables have
zero lookahead slots, so this observation does not establish a discrepancy
for their word boundaries.

### WRITER367 — ICU UTF16 dictionary matcher feeds supplementary scalars to single-unit lookup

Pinned `UCharsDictionaryMatcher::matches` in
`vendor/icu-reference/source/common/dictionarydata.cpp` reads a scalar from
`UText` and passes it to `UCharsTrie::first` or `next`. Those methods only
match a single UTF-16 unit. Preserve this path. A native gendict fixture
containing U+20000 consumes both units and reports a one-scalar prefix with
no dictionary word for that input.

### WRITER368 — LibreOffice Khmer patch ignores results after advancing the trie

The pinned `external/icu/icu4c-khmerbreakengine.patch.1` tests its
`ignoreSet` after advancing the trie and counting the code point. Its early
continuation also bypasses the stop and maximum-length checks for that unit.
The minimum-length continuation occurs before the final-value stop. Preserve
this order for both trie formats.

### WRITER369 — ICU dictionary offset transform can treat out-of-range input as ZWJ

Pinned `BytesDictionaryMatcher::transform` returns U_SENTINEL (-1) for a
scalar outside its offset alphabet. `BytesTrie::first` and `next` add 256
to negative inputs, so this sentinel enters the same trie branch as the
ZWJ transform (255). Preserve the two native operations. The compiled
byte-dictionary fixture reports the same match for Thai letter KO KAI
followed by U+0061 and by U+200D.

### WRITER370 — PossibleWord reuses candidates when only the starting offset matches

Pinned `PossibleWord::candidates` caches by the original native offset.
The pinned LibreOffice patch adds an ignore set and minimum length to the
query without adding them to the cache key. Range-end changes also leave
the cache eligible. Preserve the original cache condition. The local test
reuses the same slot and observes a previously selected candidate after
the range end shrinks.

### WRITER371 — Thai and Lao/Burmese admit different four-character spans

Pinned ICU 78.3 `ThaiBreakEngine::divideUpDictionaryRange` moves four code
points and returns when the resulting position reaches the range end.
`LaoBreakEngine` and `BurmeseBreakEngine` compare the span length in code
units with four and return only if it is smaller. Preserve the exact
comparison and unit on each path. Native gendict fixtures cover spans of
three, four and five script characters.

### WRITER372 — Patched Khmer cluster scans track cursor and offset separately

The pinned LibreOffice ICU patch advances the cursor through ignored joiners
without advancing the parallel cluster counter on those paths.
`scanAfterEnd` also takes the scalar returned by the advancing operation,
which is the character at the old position. Preserve the cursor movements
and independent counter changes. The native comparison covers joiners,
adjacent punctuation and nonzero UTF-16 subranges.

### WRITER373 — Patched Khmer inhibitor scan rechecks the old scalar

In the same patch, `DictionaryBreakEngine::scanWJ` keeps the scalar that
triggered the cluster scan. It tests that scalar again after the scan.
Because the enclosing branch already admitted ZWSP or WJ, the check always
continues there. The port preserves the continuation and the original
updated scan position without rereading the character.

### WRITER374 — Patched Khmer candidate vectors retain a reduced logical size

The Khmer weighted segmentation removes candidates immediately before marks.
The native UVector32 size shrinks, but later dictionary matches still write
through the raw twenty-entry buffers. Subsequent vector reads continue to
use the reduced logical size. Preserve both the raw capacity and the logical
size. The boundary result is compared against the compiled patch.

### WRITER375 — Patched Khmer compares the word/line bitmask with a scalar break type

The Khmer constructor stores the combined word and line bits in `fTypes`.
Its boundary conditions compare that combined value numerically with
`UBRK_LINE`. The resulting branches apply the same checks on the compiled
Khmer engine regardless of the caller's phrase flag. The port keeps the
effective conditions for the fixed Khmer constructor.

### WRITER376 — The Katakana group heuristic excludes exactly twenty characters

Pinned ICU 78.3 `CjkBreakEngine::divideUpDictionaryRange` grows a Katakana
group to its limit of twenty. It considers the group as a weighted
candidate only while its length is strictly below that limit. The
previous-Katakana flag also prevents trying the same heuristic at later
positions inside that run. Preserve the original limit and entry
condition. The compiled fixture compares nineteen- and twenty-character
runs against native ICU.

### WRITER377 — ICU unhandled engine replaces its script set

`UnhandledEngine::handleCharacter` says it applies the entire script of
an unhandled character. The called UnicodeSet property filter clears the
old set before adding the new script. Keep only the most recently applied
script in this engine. The iterator still checks its cached supported
engines first.

### WRITER378 — ICU cached next leaves the existing completion flag untouched

The native inline `BreakCache::next` updates the current position and rule
status on its fast path and leaves `fDone` untouched. The source comment in
`following` describes the interaction with an earlier query that ran past
the text. Preserve the explicit completion reset in `following` and the
original fast-path behavior.

### WRITER379 — LibreOffice dictionary range direction can override the caller's flag

Pinned `BreakIteratorImpl::getWordBoundary` examines both sides of the
requested position. If a dictionary character is already on the requested
edge of a gap, the source can select that edge regardless of the supplied
direction. If the text has no qualifying character on either side, it
returns the original position as both range endpoints. Preserve both cases.
Native comparisons cover punctuation-only strings, surrogate interiors
and positions at either edge of skipped text.

### WRITER380 — Hard separators alone do not receive the paragraph width allowance

`SwTextNode::GetMinMaxSize` adds 20 twips when `lcl_MinMaxString` reports
a nonblank range. The nonbreaking space and nonbreaking hyphen branches
increase both word minima and row width directly and leave this allowance
unset. Preserve the distinction even when either separator is the entire
paragraph.

### WRITER381 — HTML table first-pass identity wraps at eight bits

`SwHTMLTableLayout::AutoLayoutPass1` increments a `sal_uInt8` pass
reference, and `SwHTMLTableLayoutCnts::IsPass1Done` compares only that
value. A newly attached content object starts at zero, the same reference
as a wrapped pass. Retain the original initial value, wrap and equality
test.

### WRITER382 — HTML MakeTable returns after layout when the child has no SwTable

Pinned `HTMLTable::MakeTable` takes an optional upper box and is called
with that box for intermediate nested tables. First-cell initialization
binds a core `SwTable` only for the outer table. `MakeTable` calculates
the child layout, then returns on a null core table before adding rows to
the upper box. Retain that source branch.

### WRITER383 — HTML leaf format uses the table's right border flag on every cell

`HTMLTable::FixFrameFormat` tests the table-wide right border flag
without checking the cell's ending column. The left edge uses its
column's flag. Preserve the original per-box right-edge assignment.

### WRITER384 — Two field marker characters count as an empty Writer cell

For a single text node with exactly two U+0001 characters,
`SwTableBox::IsEmpty` returns true. The source records this as
compatibility behavior for imported OOXML cells. HTML numeric format
publication uses the same test, including its marker-only case.

### WRITER385 — A fresh nested HTML reader replaces the current table identity

`SwHTMLParser::BuildTable` replaces `m_xTable` on fresh entry, even when
called recursively from a cell. First-cell initialization uses pointer
equality to identify a top table. In the fresh recursive case it creates
an actual table section and the caller restores the previous identity
after the recursive parse. Keep both the replacement and restoration.

### WRITER386 — The default fly width constant occupies the height field

Without an effective frame-size item, `SwDoc::MakeFlySection_` passes
`0, DEF_FLY_WIDTH` as width and height to the variable-size constructor.
Preserve the literal argument order. HTML tables supply their own size
item before that fallback.

### WRITER387 — Covered ODF cell styles depend on a compatibility flag

`SwXMLExport::ExportTableLine` writes the covered box's style so its
border can be recovered. `SwXMLTableContext::InsertCoveredCell` applies
that style only with `TABLE_ROW_KEEP`. Keep the inherited spanning-cell
style in the represented default import profile.

### WRITER388 — An ordinary row does not close an open vertical merge group

`lcl_ApplyCellProperties` in `unotext.cxx` closes earlier groups only
when a new merge starts at a similar left position. An ordinary row
without a merge property leaves the group open, so a continuation can
join it after a gap. Preserve the group's signed cell-count sequence.
Bottom-border selection still follows the separate contiguous-row scan
in `DomainMapperTableHandler`.

### WRITER389 — An ordinary cell does not end a horizontal merge range

`DomainMapperTableHandler::endTableGetCellProperties` assigns each
continuation to the most recently collected restart. It does not close
that range at an unmarked cell. A continuation after a gap in the same
row therefore includes the intermediate cell when the table cursor
merges the endpoints. Preserve that range and the source rule that a
restart with no continuation does not attempt a merge.

### WRITER390 — The preceding cell's top edge can prevent bottom-border handoff

`lcl_SaveUpperLowerBorder` checks the predecessor's bottom edge when
considering transfer to the next row, then checks the predecessor's
top edge when considering transfer to the predecessor's bottom edge.
Keep the source's different edge tests.

### WRITER391 — The right-overlap branch uses a different sum threshold

In `SwTable::CollectBoxSelection` the left-overlap branch compares the
sum of a box's borders with twice the minimum boundary. The corresponding
right-overlap branch compares that sum with the maximum boundary itself.
Preserve both comparisons during ragged-row width correction.

### WRITER392 — ITAP zero does not clear the active RTF table buffer

Pinned `RTFDocumentImpl::dispatchTableValue` prepends the ITAP depth
sprm, leaving the original INTBL sprm later in the paragraph map.
Only a positive depth switches to the active table buffer through
INTBL. Preserve the precedence and keep the active buffer at ITAP zero
until the ordinary row or nested-row boundary closes it.

### WRITER393 — The RTF destination does not check the version number

The pinned tokenizer classifies `rtf` as a destination.
`RTFDocumentImpl::dispatchDestination` accepts it without inspecting a
numeric parameter. The upstream horizontal-merge test even uses a
bare RTF destination. Preserve admission for a present destination
with an omitted or different version number.

### WRITER394 — Markdown table separators belong only to exact text-node boundaries

`OutMarkdown_SwTableNode` marks the first and last node positions of a
cell. Only `OutMarkdown_SwTextNode` consumes those flags. A nested table
that begins the outer cell owns a structural node at the marked start,
so the outer opening pipe can be omitted. The nested table suppresses
its own pipes and writes a space after each of its text nodes. Preserve
both source behaviors.

### WRITER395 — TXT table continuation compares coordinates across table boundaries

`SwASCWriter::WriteTable` advances the text cursor and compares
`SwTableBox::GetCoordinates` without testing the table identity.
An inner cell can continue a paragraph run from the outer cell with
the same coordinates, while a different inner coordinate can advance
the outer column. Retain this traversal and its tab and line separators.

### WRITER396 — RTF registers cell foreground controls without a value consumer

The tokenizer recognizes CLCFPAT and CLCFPATRAW. The pinned value
dispatcher has no case for either control, so a cell shade uses the
default automatic foreground through `CellColorHandler` even if one
of these controls appears. Keep that source behavior.

### WRITER397 — An out-of-range RTF palette index resolves to opaque black

`RTFDocumentImpl::getColorTable` returns color zero when an index is
absent. A present palette entry with no RGB components instead returns
`COL_AUTO`. Preserve the distinction in character and cell color
consumers, including an authored color at index zero.

### WRITER398 — ODF table backgrounds flatten any nonopaque brush to transparent

The `MID_BACK_COLOR` path in `SvXMLExportItemMapper::QueryXMLValue`
writes `transparent` whenever the brush color has any transparency.
On import the matching path sets alpha to zero on the existing brush.
An ODT save and reopen therefore loses a partially transparent
table, row or cell fill. Preserve the pinned ODF behavior and retain
the original packed value in native Worker transfer.

### WRITER399 — TXT switches to the first frame only for a single empty body paragraph

When the full-document PaM selects exactly one empty body text node,
`SwASCWriter::WriteStream` uses the section of the first registered
special format. It neither searches subsequent formats nor appends
their contents. The new selection ends at the structural section end,
so the last frame paragraph retains its separator. Preserve these
conditions and keep ordinary TXT selection on the original range.

### WRITER400 — ODF text frames reopen variable height as a minimum height

`XMLTextParagraphExport::addTextFrameAttributes` writes zero
`fo:min-height` for a variable-height text frame without relative
height. `XMLTextFrameContext_Impl::Create` sees the minimum-height
attribute and sets `SizeType::MIN`, even though the dimension is zero.
Keep the resulting minimum sizing type on reopen.

### WRITER401 — RTF floating-table left and top controls are emitted without an import consumer

`RtfAttributeOutput::TablePositioning` writes TPOSXL for left and
TPOSYT for top. Both words are registered in the tokenizer, but
`RTFDocumentImpl::dispatchFloatingTableFlag` only consumes the center
and right horizontal specifications and center and bottom vertical
specifications. With an otherwise positioned row, the left and top
words leave the corresponding imported orientation at NONE. Preserve
the source writer and reader behavior.

### WRITER402 — RTF ordinary text frames export padding and wrap details the reader does not restore

`RtfAttributeOutput::FormatBox` emits the four dxText/dyText padding
properties. `RTFSdrImport::getTextFrameDefaults` sets the new-style
Writer text frame to 254 mm100 at the sides and 127 mm100 at the top
and bottom. `RTFSdrImport::resolve` does not consume the emitted
padding properties. `RTFDocumentImpl::dispatchValue` records SHPWRK
and tight wrap in character drawing properties, while the text-frame
service gets its Surround from RTFShape's coarser wrap value. A
dynamic frame written with SHPWR2/SHPWRK3 therefore reopens as
parallel. Preserve both asymmetries.

### WRITER403 — RTF ordinary text-frame automatic height reopens as fixed

`RTFSdrImport::applyProperty` consumes fFitShapeToText and enables
minimum height when its value is one. The ordinary Writer text-box
branch of `RtfAttributeOutput::OutputFlyFrame_Impl` writes height
geometry and relative sizing properties without that flag. The new
RTF text frame uses the fixed default on reopen. Preserve the
original producer and consumer.

### WRITER404 — A leading nested table can redirect an outer RTF horizontal merge

The pinned `SwXTextTableCursor` starts at a cell's section start and
uses GoInNode, which walks to the first content node. When the cell
starts with a nested table, this can be a paragraph in the nested
table. `SwCursor::GotoTableBox` looks up the next cell name in the
table containing that paragraph. If the nested table also has that
name, the mapper's outer cell merge can merge the nested cells and
leave the outer row intact. Preserve the original lookup scope for
the flat new-table model and keep this separate from moves of whole
nested sections selected through their outer cell paragraphs.

### WRITER405 — RTF grid-after uses the width value without its unit control

The tokenizer knows both TRWWIDTHA and TRFTSWIDTHA.
`RTFDocumentImpl::dispatchValue` stores TRWWIDTHA without consulting
TRFTSWIDTHA, and the ROW handler adds a borderless filler cell for
each positive stored width as a twip value. Preserve the original
interpretation even when the width-type control specifies another unit.

### WRITER406 — RTF's numeric percent width misses the mapper's percent branch

`RTFDocumentImpl::dispatchTableValue` stores TRFTSWIDTH as the raw
RTF number. `MeasureHandler::getMeasureValue` accepts the numeric
value 3 as an absolute twip unit. `DomainMapperTableManager::sprm`
checks the separate generated OOXML percent resource identifier for
relative sizing. The ordinary numeric RTF percent value 2 therefore
falls back to the cell grid. Preserve the original unit distinction.

### WRITER407 — RTF treats the half-gap as padding and reopens left alignment with a width

The pinned TRGAPH handler explicitly notes that it writes a half-gap
as left and right cell padding. It uses the TblCellMar left resource
identifier, while the table-indent subtraction checks the distinct
TcMar left identifier used by TRPADDL. The half-gap can therefore
affect padding without participating in that subtraction. The
original table justification conversion maps TRQL to LEFT_AND_WIDTH,
including when RTF was exported from a Writer table with NONE.
Retain these reader and writer choices.

### WRITER408 — Legacy RTF paragraph frames increment the vertical position

The pinned POSY value handler clears vertical alignment and adds one
twip before storing the position. POSY0 can therefore trigger a
frame through a nonzero Y position, while POSY-1 leaves the default
zero. Preserve the adjustment before conversion to the mapper's
measure units.

### WRITER409 — Legacy RTF frame wrapping and page breaks take different mapper paths

The legacy WRAPTHROUGH control maps to dynamic wrapping. WRAPTIGHT
falls through to no wrapping, while OVERLAY maps to through
wrapping. The pinned RTF fixtures also expect a PAGE in a frame to be
lost and a SECT there to end a paragraph. Explicit PAGEBB is sent
between two paragraph ends to retain the break before the frame.
Preserve those distinctions in the original reader and mapper paths.

### WRITER410 — An all-header RTF table can lose its headers without becoming unsplittable

The shared table manager first replaces a prefix of eleven or more
repeating rows with a zero header count. The table handler later
compares the surviving count with the total row count. All-header
tables with two to ten rows therefore become unsplittable, while
larger all-header tables pass through that check with zero headers
and keep their original split state. Preserve the order of both
source decisions.

### WRITER411 — The RTF auto row-height rule resolves to a minimum

TRRH0 emits the string auto and a zero height. MeasureHandler only
special-cases exact, so auto reaches the table row as SizeType.MIN.
Its IsAutoHeight getter reports true only for variable height. The
same measure conversion also returns zero for positive twip
values at or above 32768. Retain these row property results.

### WRITER412 — RTF paragraph line-number exclusion clears the section distance

The exporter writes NOLINE for a paragraph excluded from the line
count. The reader dispatches NOLINE by erasing the distance from
the section line-number properties. It leaves the paragraph's count
item alone. The mapper can therefore use the default distance and
count the paragraph on reopen. Keep the reader and writer behaviors.

### WRITER413 — Later RTF line numbering can precede the section break

The RTF attribute writer emits the line-number controls to its
stream even while StartSection holds SECT and SECTD in the
section-break buffer. A section transition buffered by a preceding
text node can therefore write the new line-number controls into
the preceding section. Preserve the order of the stream and
the buffered section controls.

### WRITER414 — RTF cannot clear an earlier paragraph shading with CBPAT0

The paragraph CBPAT value handler omits index zero, so a later
CBPAT0 does not clear an earlier nonzero shading value in the
same paragraph. The writer emits CBPAT only for a fully opaque
brush, so an explicit transparent drawing fill has no equivalent
output through this path. Preserve the original import and export
admission rules.

### WRITER415 — An HTML insertion join can drop the first paragraph's drawing fill

The HTML filter converts pending paragraph brushes into drawing
fill items. In insertion mode it joins the first imported text
node with the destination prefix. CutImpl copies complete
paragraph properties only through Writer's HINT_END, below
the drawing fill range. The first paragraph can lose that fill
at the join, including when Markdown invokes the HTML filter.
Retain the source range and join behavior.

### WRITER416 — RTF cell borders retain the first repeated edge

The cell border flag appends each edge as a separate modifier.
TDefTableHandler collects those modifiers in order and inserts the
first result for each side. A later definition of the same side
does not replace the earlier one. The handler initializes width
to zero. ConvertBorderWidthFromWord interprets that value as the
0.75 pt default when a single line is specified without a size.
Preserve the source append, selection and conversion order.

### WRITER417 — RTF row border words have no corresponding flag handler

The pinned tokenizer recognizes TRBRDRT, TRBRDRL, TRBRDRB,
TRBRDRR, TRBRDRH and TRBRDRV. The reader has no row-border
dispatch case for these tokens. Cell border flags do reach the
mapper. Preserve the reader's admitted control set.

### WRITER418 — RTF BOX attributes can survive a nested group's pop

BOX stores the same RTFValue at four direct paragraph edge IDs.
The later attribute setter uses read lookup. A child group that
updates an inherited BOX value therefore changes the shared
attributes, even though the parser restores the parent's
selector and resource list when the child ends. An edge declared
by the child uses a write lookup and can have its own owner.
Preserve both source operations.

### WRITER419 — RTF BOX and explicit edges compete in resource order

BOX inserts top-level edge modifiers. Explicit BRDRT, BRDRL,
BRDRB, BRDRR and BRDRBTW append beneath pBdr. When both
representations target a side, the later top-level resource
wins. Appending a side to an earlier pBdr does not move that
parent after an already-inserted BOX. PARD clears paragraph
resources but retains the border selector. Preserve this order
and the original fallback when the selected border parent is
missing.

### WRITER420 — Markdown writes a text fly as an empty image

SwMDWriter places anchored flies into the native text positions.
ApplyFlyFrameFormat only fills the graphic URL for graphic and
OLE content, but still inserts an image record for a text fly.
Without object metadata this emits `![]()`. Equal image records
at one offset collapse. An empty anchor paragraph bypasses the
formatting loop, so its fly is omitted. Preserve these results
for the current Writer text-frame model.

### WRITER421 — A legacy title inside UPR has no fallback without UD

The RTF reader in UPR dispatches only the nested UD destination.
A TITLE destination in the legacy branch is skipped, including
when the stream provides no Unicode alternative. The previously
read title, if any, is retained. Preserve the source selection.

### WRITER422 — ODF settings accept only the literal true token for a true boolean

XMLConfigItemContext compares the complete character buffer with
XML_TRUE. Other boolean lexical forms, including 1 and text with
surrounding spaces, produce false. Preserve that behavior in the
represented configuration-settings stream.

### WRITER423 — RTF export omits the Writer page text grid

The pinned RtfAttributeOutput::FormatTextGrid logs a TODO and emits
no control. The pinned RTF tokenizer also recognizes the section
grid flags without a corresponding dispatch handler. Preserve the
lack of a portable grid mapping.

### WRITER424 — Numbering property order changes explicit pattern metadata

The pinned SwXNumberingRules::SetPropertiesToNumFormat applies
ListFormat and ParentNumbering inside the same ordered property
loop (sw/source/core/unocore/unosett.cxx). SetListFormat derives
the upper-level count from the explicit placeholders, but a later
ParentNumbering overwrites that count. Consequently an explicit pattern can retain its text and label
while its upper-level metadata reflects the later property. The
native XML importer avoids this by emitting ListFormat after
ParentNumbering (xmloff/source/style/xmlnumi.cxx). Preserve that
sequence, including in ODT and internal-codec round-trip coverage.
The order-sensitive UNO API contract remains a suspected upstream
issue; the incorrect property ordering in the local port was fixed.

### WRITER425 — DirectoryHelper may leave an old right token at path boundaries

- Source: `vendor/libreoffice-reference/comphelper/source/misc/directoryhelper.cxx`, `DirectoryHelper::splitAtLastToken`.
- A delimiter at offset zero returns an empty left view and does not modify `rRight`. A trailing delimiter returns the prefix and also leaves `rRight` unchanged. With right initially `old`, `.xml` yields empty/old and `a.` yields a/old. A source with no delimiter explicitly clears the output instead.
- Preserve the branch and mutation order. `ZipPackage::WriteContentTypes` passes a fresh empty extension each time, so its leading/trailing-dot paths still produce overrides. The shared helper tests retain the nonempty-output cases independently. No upstream correction is applied.

### WRITER426 — OInputCompStream custom query bypasses its inherited type provider

- Source: `vendor/libreoffice-reference/package/source/xstor/ocompinstream.hxx` derives from `cppu::WeakImplHelper`, which implements `XTypeProvider`. The override in `ocompinstream.cxx`, `OInputCompStream::queryInterface`, checks the five common stream/component/property interfaces, conditionally checks `XRelationshipAccess`, then calls `OWeakObject::queryInterface` directly.
- Consequently the inherited `XTypeProvider` implementation is not reached by this query path. Preserve the original override and format-dependent relationship identity. The local genuine component test expects the type-provider query to be empty; no native compiled component witness or upstream correction is claimed.

### WRITER427 — UNOMemoryStream close resets its cursor without disconnecting

- Source: `vendor/libreoffice-reference/comphelper/source/streaming/memorystream.cxx`, `UNOMemoryStream::closeInput`, `closeOutput`, `readBytes` and `writeBytes`.
- Both close methods only set the shared cursor to zero. Reads and writes remain available; writing after closeOutput overwrites the start of the existing data rather than raising NotConnectedException. This appears inconsistent with `udkapi/com/sun/star/io/XOutputStream.idl`, which forbids further writes after closeOutput. Intentional reliance by storage-cache consumers remains possible.
- Preserve the original state changes without adding a disconnected flag. The genuine component and BinaryXInputStream/BinaryXOutputStream tests cover cursor reset and reuse. The outer OInputCompStream/OInputSeekStream keeps its own disposed guard, so closing that wrapper still prevents subsequent operations. No upstream correction is applied.

### WRITER428 — Interface container2 rejects null despite its insertion contract

- Source: pinned `include/comphelper/interfacecontainer2.hxx`, `OInterfaceContainerHelper2::addInterface` documentation, and `comphelper/source/container/interfacecontainer2.cxx`, the method body.
- The documentation allows insertion of a null interface, but the implementation asserts nonnull and immediately returns0 for null. It neither inserts nor returns the existing count: a one-listener container still contains one listener after the method returns0. The multi-type wrapper also creates and retains an empty keyed container when its first insertion is null.
- Preserve this early return, state and key lifetime. The translated native-container tests assert both empty and nonempty cases, including retained multi-type keys. No assertion is promoted into a new production exception or API correction.


### WRITER429 — Interface container2 clear diagnoses a normal unshared list

- Source: pinned `comphelper/source/container/interfacecontainer2.cxx`, `OInterfaceContainerHelper2::clear`, uses `OSL_ENSURE(!bIsList || bInUse, ...)` immediately before its conditional detachment.
- A normal list with no active iterator has bIsList=true and bInUse=false, so clearing it emits that debug diagnostic even though clear is a supported operation and the upstream IfTest::testEnumerate scenario does exactly this. This looks like a stale diagnostic predicate copied from disposeAndClear; it does not change the release-build operation.
- Preserve the state transitions and release behavior. The browser port does not simulate debug logging or add a corresponding exception. Native debug-diagnostic execution and downstream impact remain unverified.

### WRITER430 — Storage copy treats a short ByteReader result as completion

- Source: pinned `comphelper/source/misc/storagehelper.cxx`, `OStorageHelper::CopyInputToOutput`; `include/comphelper/bytereader.hxx`, `ByteReader::readSomeBytes`.
- The fast path repeats only while the raw reader returns exactly32000 bytes. A reader returning a smaller initialized chunk while more data remains causes copying to stop without checking availability or retrying until zero. The ByteReader declaration does not state that every nonfinal call fills the requested buffer; whether existing native producers rely on such an implicit convention is unverified.
- Preserve the continuation condition and final short/empty write. A genuine MemoryInputStream subclass returning7 bytes leaves23 bytes available and copies only7. This is a local native-owner witness, not a compiled upstream or application-level truncation claim. No retry repair is added.


### WRITER431 — Published transaction listener keeps the commited spelling

- Source: pinned `offapi/com/sun/star/embed/XTransactionListener.idl` declares `commited`, and package OWriteStream/OStorage call that same method after commit.
- The spelling has one t, while surrounding identifiers use COMMITTED. It looks like a historical naming typo but is part of the published contract. Renaming it or silently adding an alias would change that contract.
- Preserve `commited` exactly in the SDK declaration and actual listener dispatch. The interface/query tests use the published spelling. No upstream correction or compatibility alias is introduced.

### WRITER432 — ZIP name helper accepts empty names and repeated internal separators

- Source: pinned `comphelper/source/misc/storagehelper.cxx`, `OStorageHelper::IsValidZipEntryFileName`; consumed by `package/source/zipapi/ZipFile.cxx` central-directory parsing.
- The helper initializes its dot counter to zero and returns true for empty input. Slashes after the first position reset that counter, so `a//b` and `a//` also return true. OStorage explicitly rejects empty element names separately; the inspected ZipFile call does not add that check. Whether later package construction rejects or collapses such names remains unverified. This is a potentially surprising contract, not a demonstrated native exploit or full-package acceptance claim.
- Preserve this helper and call-site behavior without adding normalization or an extra rejection. The bounded local ZIP catalog retains exact names. The same helper rejects every UTF16 surrogate unit, including both units of a valid supplementary character. Local boundary tables and actual ZIP read/write exercise these decisions; no compiled upstream witness or correction is claimed.

### Shared package source correction — CALC-164 withdrawn

The previously recorded Calc/shared folder-overwrite suspicion is withdrawn: pinned `package/source/zippackage/ZipPackageFolder.cxx`, `ZipPackageFolder::LookForUnexpectedODF12Streams`, exits the loop immediately after the first true inconsistency result. The local port had omitted that exit. Restoring it preserves upstream behavior and also corrects Writer's shared ODF metadata path; this is not a new upstream defect or an intentional browser persistence-policy change. See the corrected CALC-164 entry and `native-package-folder-consistency.md` for evidence and limitations.

### WRITER433 — ByteGrabber returns zero after consuming a partial integer

- Source: pinned `package/source/zipapi/ByteGrabber.cxx`, ReadUInt16/ReadUInt32/ReadUInt64. A read count different from the requested width returns zero without restoring the cursor or throwing. Raw ByteReader uses readSomeBytes once; fallback uses XInputStream.readBytes. Thus a zero result alone does not distinguish an encoded zero from a truncated/partial number. A legal short raw result can occur before EOF.
- Preserve these calls and return values; do not add a retry, rewind or truncation exception. Actual input owners verify both raw/UNO EOF boundaries; a genuine nonfinal MemoryInputStream subclass returns7 of8 while23 bytes remain. This is a local contract witness, not a compiled upstream or full ZIP parsing defect claim.

### WRITER434 — ByteChucker cached raw pointers bypass later Sequence COW checks

- Source: pinned `package/inc/ByteChucker.hxx` caches writable pointers for its2/4/8-byte Sequence members once. Integer writes subsequently fill those pointers directly and pass the same Sequence to output. An output retaining native Sequence copies can therefore observe an earlier argument changing when a later same-width integer is written.
- Preserve pointer reuse and alias effects, without a fresh Sequence or getArray COW repair on each write. A complete caller XOutputStream retaining actual Sequence copies verifies the effect independently for all three buffers; normal UNOMemoryStream output copies bytes during the call. This is source-derived and local value-owner evidence, not a compiled ABI witness or an established application-visible corruption.

### WRITER435 — MemoryByteGrabber unsigned method names retain signed return declarations

- Source: pinned `package/source/zipapi/MemoryByteGrabber.hxx` declares ReadUInt8 as sal_Int8 and ReadUInt16 as sal_Int16, although their local accumulators are unsigned. On the existing signed SAL binding, octet255 returns-1 and word0xffff returns-1. ReadUInt32 and ReadUInt64 have genuinely unsigned return declarations. The similarly named stream ByteGrabber::ReadUInt16 returns unsigned16 instead.
- Preserve the actual signed return widths, without renaming or an unsigned compatibility alias. Source ZipFile::readCEN also reads path/extra/comment lengths explicitly as signed16 and rejects negative results;32768-byte filenames are rejected while32767 is nonnegative. Local literal scalar tests and independently changed real ZIP records retain these distinctions. This is source-derived logical SAL behavior, not a compiled native signed-conversion/ABI witness or a full ZIP64/package-service claim.

### WRITER436 — END directory-disk sentinel check consults the other disk field

- Source: pinned `package/source/zipapi/ZipFile.cxx`, `ZipFile::findCentralDirectory` / `ZipFile::readExtraFields`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- findCentralDirectory allows disk0 or0xffff, then checks directory disk with `nEndDirDisk != 0 && nEndDisk != 0xFFFF`. Thus disk0xffff suppresses rejection of an arbitrary nonzero directory-disk value. The source comment says only single disk is supported; this looks like a copied operand. Preserve that exact condition. A complete real ZIP64 fixture with disk0xffff and directory disk7 retains normal catalog reading; no compiled native multi-disk/service acceptance is claimed.

### WRITER437 — END comment length is not validated by directory search

- Source: pinned `package/source/zipapi/ZipFile.cxx`, `ZipFile::findCentralDirectory` / `ZipFile::readExtraFields`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- findCentralDirectory scans backward for PK0506 and reads the disk/count/size/offset fields, but does not read or validate the final comment-length field. A mismatched declared comment count alone therefore does not reject a package. The first signature found backward is not retried when later checks fail. Preserve this scan and field consumption, without reinstating the old local exact-comment-length gate. Real ordinary and ZIP64 archive cases cover the ignored field; no general native producer defect is established.

### WRITER438 — Zip64 extras unconditionally overwrite size outputs

- Source: pinned `package/source/zipapi/ZipFile.cxx`, `ZipFile::findCentralDirectory` / `ZipFile::readExtraFields`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- readExtraFields always reads an unsigned64 size when header ID is1, then compressed size at dataSize>=16 and optional offset at dataSize>=24. It does not condition those assignments on corresponding32-bit sentinel values, and reads the first size even when dataSize<8. Preserve the original ordered lvalue writes and extra-tail skipping rather than introducing a spec-derived conditional field layout. Actual archives with stale nonsentinel CEN sizes and matching64-bit fields retain source successful reading. Invalid/short native view/allocation domains are not certified.

### WRITER439 — Unicode Path extra forms dataSize-minus-five view without a minimum check

- Source: pinned `package/source/zipapi/ZipFile.cxx`, `ZipFile::findCentralDirectory` / `ZipFile::readExtraFields`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- readExtraFields checks remainingSize against dataSize and checks Version1, then reads CRC and forms the UnicodeName string_view with dataSize-5, without an explicit dataSize>=5 guard. A smaller field cannot satisfy the original valid native view-range contract. Preserve the source branch/operation order; do not claim a deterministic compiled outcome for malformed under-five fields. Tests exercise valid view ranges, wrong versions, insufficient declared remaining data and mismatched names. The typed-storage lowering does not certify physical pointer/size_t behavior for invalid native views.

### WRITER440 — Empty ZIP retains an unclaimed zero-length interval

- Source: pinned `package/source/zipapi/ZipFile.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- ZipFile::readCEN initializes unallocated to {{0, nCenPos}} even when nTotal and nCenPos are zero. No entry erases that interval, so the final nonempty check throws "Zip file has holes! It will leak!". Preserve this normal-open result for a complete22-byte empty ZIP; do not special-case it as valid. This is source-derived and locally exercised, not a compiled native witness.

### WRITER441 — LOC descriptor placeholder compares UINT64_MAX, not UINT32_MAX

- Source: pinned `package/source/zipapi/ZipFile.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- ZipFile::readLOC_Impl compares local compressed/uncompressed sizes against sal_uInt64(-1). A32-bit all-ones field widened to64bits does not equal this sentinel, whereas an actual64-bit Zip64 extra-field value can. Preserve both outcomes instead of broadening the placeholder rule. Actual external ZIP fixtures exercise acceptance and rejection.

### WRITER442 — Zero data-descriptor values survive conditional final comparisons

- Source: pinned `package/source/zipapi/ZipFile.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- ZipFile::readLOC_Impl accepts zero duplicated LOC values and copies descriptor values into them; its final CRC/size comparisons only reject nonzero disagreement. Thus a complete descriptor containing zero CRC/size values can survive construction against nonzero CEN values. Preserve these conditions. The real payload still undergoes size/CRC verification when read by the bounded transport. No stricter descriptor check is introduced.

### WRITER443 — ZIP output narrows UTF8 name length before LOC offset calculation

- Source: pinned `package/source/zipapi/ZipOutputStream.cxx`, writeLOC/writeCEN, commit9bc445578031fecf56086729d8e4940c77e14d65.
- The full UTF8 OString length is narrowed to sal_Int16 for header lengths, but the full byte sequence is written. writeLOC then computes nOffset as current position minus (LOCHDR + the signed name length). A real32768-byte ASCII path therefore emits name bits0x8000, then records offset65536 for a LOC that began at0; readCEN rejects its negative name length. Preserve the original narrowing and arithmetic in the admitted output path rather than silently repairing it. A real public writer call exercises the boundary without private-state forcing. This is source-derived/local owner evidence, not a compiled native ABI witness or a general ZIP64 output claim.

### WRITER444 — TimeValue seconds wrap before the DOS upper-year boundary

- Source: pinned `package/source/zipapi/ZipOutputStream.cxx`, `package/source/zippackage/ZipPackageStream.cxx`, `include/osl/time.h`, `sal/osl/unx/time.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- include/osl/time.h declares Seconds as sal_uInt32 and warns about2106. OSL assigns signed platform seconds into that field. Values before1970 or after the uint32 epoch range wrap; a clock value-1ms becomes seconds0xffffffff with nanoseconds999000000. getCurrentDosTime later sees the wrapped UTC year, not the original clock year. Preserve the source width and warning; local initialized-value/platform tests cover the wrapping without a compiled native clock witness.

### WRITER445 — DOS time assertion excludes the valid ZIP year1980

- Source: pinned `package/source/zipapi/ZipOutputStream.cxx`, `package/source/zippackage/ZipPackageStream.cxx`, `include/osl/time.h`, `sal/osl/unx/time.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- ZipOutputStream::getCurrentDosTime asserts Year>1980 and Year<2108, though the subsequent year subtraction can encode DOS year0. Thus a real1980 calendar value stops in the checked binding. Preserve this assertion, its original calendar alternatives and odd-second truncation rather than widening the range. NDEBUG fallback behavior is not certified.

### WRITER446 — Signed CRC-1 sentinel collides with a legitimate STORE checksum

- Source: pinned `package/source/zipapi/ZipOutputStream.cxx`, `package/source/zippackage/ZipPackageStream.cxx`, `include/osl/time.h`, `sal/osl/unx/time.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- ZipOutputStream::setEntry interprets nCrc==-1 as unknown, setting compressed size0 and descriptor bit3. Four real ff bytes have CRC32 ffffffff, whose sal_Int32 value is-1. ZipPackageStream::ImplSetStoredData supplies the actual CRC before setEntry; the STORE save branch then writes the bytes and rawCloseEntry emits no descriptor for STORE. The local current STORE transport retains this sequence: zero LOC fields and inconsistent CEN compressed size, rejected by readCEN. This is a source-derived pipeline inference plus actual local caller evidence, not a compiled full native package-service reproduction. Preserve the sentinel and conditions.

### WRITER447 — DOS clock caller ignores failed OSL output statuses

- Source: pinned `package/source/zipapi/ZipOutputStream.cxx`, `package/source/zippackage/ZipPackageStream.cxx`, `include/osl/time.h`, `sal/osl/unx/time.cxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- getCurrentDosTime ignores boolean results from osl_getSystemTime and osl_getDateTimeFromTimeValue, then reads calendar members. Original non-MACH clock failure returnsfalse before initializing TimeValue, and failed gmtime leaves the output calendar unchanged. This can enter an indeterminate native value domain. Preserve the calls and lack of a retry/status repair; the browser Date backend has no represented OS failure path. That failure/undefined-data behavior remains unverified, without fake failures or invented fallback calendar values.

### WRITER448 — Fast-substream errors leave the document's current stream switched

- Source: pinned `sw/source/writerfilter/ooxml/OOXMLDocumentImpl.cxx`, `OOXMLDocument::resolveFastSubStream`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- The method saves mpStream and switches it to the selected part before parser setup, parsing and closeInput. Restoration occurs only after those operations. An exception therefore leaves the failed part current, and subsequent target/relationship lookups use that part rather than the original document. Preserve that order and ownership; do not introduce restoration in a finally/RAII guard. Real malformed settings and a second relationship-selected malformed part exercise this behavior through actual ZIP input and SAX. This is source-derived/local mechanism evidence, not a compiled complete native document service witness.

### WRITER449 — Three compatibility flags ignore an explicit false value

- Source: pinned `sw/source/writerfilter/dmapper/SettingsTable.cxx`, `SettingsTable::lcl_sprm`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- doNotExpandShiftReturn, balanceSingleByteDoubleByteWidth and ulTrailSpace assign true on the modifier's presence, ignoring the already parsed integer value. Thus an explicit false/zero turns these flags on and a later false cannot reset them, unlike neighboring boolean compatibility settings. Preserve those assignments rather than normalizing them to nIntValue!=0. Tests use actual OOXMLProperty/OOXMLValue resources and the real DomainMapper settings owner. Full native layout/export QA remains separate and unverified here.

### WRITER450 — MAYBEVOID can retain and normalize a previous output value

- Source: pinned `svl/source/items/itemprop.cxx`, `SfxItemPropertySet::getPropertyValue`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- When no readable item is available and MAYBEVOID is set, the out-parameter overload does not clear rAny. Its later enum normalization still runs, so a previous integer output can survive and become the declared enum despite an UNKNOWN/INVALID state. Preserve this sequence. A real Writer pool, a narrowed real SfxItemSet, the original BreakType descriptor and a caller-owned Any reproduce it locally. The by-value overload constructs a fresh Any and yields void in this case. This is source/local-helper evidence, not a complete native document/UI witness.

### WRITER451 — Ignore-unknown also suppresses known-property value rejection

- Source: pinned `svl/source/items/itemprop.cxx`, `SfxItemPropertySet::setPropertyValue`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- bIgnoreUnknownProperty is described as suppressing unknown-property errors, but the static setter also uses it after a known item's PutValue rejects an incompatible Any. Thus a known TabStopDistance assignment of bool silently does nothing when the flag is true, while false throws IllegalArgumentException. Preserve the broader source condition and unchanged destination rather than narrowing suppression to name lookup. Tests use the actual Writer tab item and genuine typed Any values; full filter/UI parity is not certified here.

### WRITER452 — Extended property metadata changes negative handles to unsigned WhichIds

- Source: pinned `svl/source/items/itemprop.cxx`, `SfxExtItemPropertySetInfo` constructor, and `include/svl/itemprop.hxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- Extension descriptors carry signed32-bit Property.Handle, but construction first uses checked sal_Int16 conversion and then stores the result in unsigned16-bit nWID. Enumeration and named lookup subsequently expose nWID as the handle. An admitted Handle=-1 therefore becomes65535, and -32768 becomes32768; handles above32767 fail the original checked conversion even though nWID is unsigned. Preserve the conversions rather than retaining the original external handle or extending its accepted range. Tests use genuine Sequence<Property>, the real metadata component and actual UNO queries; no whole Writer filter or UI reproduction is claimed.

### WRITER453 — Rejected grab-bag input still changes or reparses favourite status

- Source: pinned `sw/source/core/attr/format.cxx`, `SwFormat::SetGrabBagItem` and `ParseFavourites`, and `svl/source/items/grabbagitem.cxx`, `SfxGrabBagItem::PutValue`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- SetGrabBagItem ignores PutValue's false result and always calls ParseFavourites. On the first rejected non-sequence input it allocates an empty bag, then changes unknown favourite status to false because qFormat is absent. If a previous bag exists, it reparses that retained bag and can overwrite a favourite flag set separately since the last successful bag import. An existing qFormat key with a nonconvertible value instead preserves the prior optional flag. Keep these differences and call order. Tests use actual Writer formats, genuine typed Any/PropertyValue sequences and the real grab-bag item; no full filter/native binary reproduction is claimed.

### WRITER454 — Character-format copy can change an explicit false favourite to true

- Source: pinned `sw/source/core/doc/docfmt.cxx`, `SwDoc::CopyFormat`, and `sw/inc/format.hxx`, `SwFormat::SetPoolFormatId`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- CopyFormat creates a destination format, copies its attributes, then calls SetPoolFormatId with the source ID. That setter marks UNKNOWN formats as favourite=true. CopyFormat does not subsequently copy the source optional favourite, hidden flag or interop bag. A source with UNKNOWN pool ID and an explicit false favourite therefore produces a fresh copy with favourite=true. Its help ID is copied while its document-local help-file index is deliberately reset to UCHAR_MAX. Preserve these source operations instead of copying the extra flags to make the result look more consistent. The represented native character branch is verified through real source/destination SwDoc owners; full format-copy families and DOCX round-trip QA remain outstanding.

### WRITER455 — The optional mapper diagnostic uses stale arguments and the wrong final name

- Source: pinned `sw/source/core/doc/SwStyleNameMapper.cxx`, `_NEED_TO_DEBUG_MAPPING` `testNameTable`, and declarations in `sw/inc/SwStyleNameMapper.hxx`, commit9bc445578031fecf56086729d8e4940c77e14d65.
- The conditional diagnostic calls GetProgName with family first and name second, while the current name-based overload takes name then family and the numeric overload takes a distinct SwPoolFormatId enum. It also computes the UI result into bString but performs the final UI-name hash lookup with aString, which still contains the programmatic name. That final lookup would not round-trip differing spellings such as Text body/Body Text even after correcting the call signature. Normal source builds exclude this diagnostic. Do not alter the production conversion logic to make it work or invent a runtime outcome for the unbuildable conditional C++ code. Local table/owner tests verify the represented normal-build contracts; they are not presented as execution of this diagnostic.

### WRITER456 — Table-style programmatic suffix handling differs from other families

- Source: pinned `sw/source/core/doc/SwStyleNameMapper.cxx`, FillProgName and FillUIName, commit9bc445578031fecf56086729d8e4940c77e14d65.
- When an unknown UI name already has a recognized ` (user)` suffix, FillProgName removes it for non-table families but appends another suffix for TableStyle; the source marks this branch FIXME. FillUIName also explicitly accepts table-style UI names for old ODF files. Preserve both branches and the existing WRITER207 UTF16 length guard rather than making all families symmetric. For example AB (user) becomes AB for a paragraph family but AB (user) (user) for TableStyle, whose reverse Fill removes one suffix. Tests exercise actual static mapper operations without a synthetic translated UI provider or full table-autoformat document claim.

### WRITER457 — An unused character WhichId declares a different concrete item type

- Source: pinned `sw/inc/hintids.hxx`, RES_CHRATR_UNUSED3, and `sw/source/core/bastyp/init.cxx`, ItemInfoPackageSwAttributes, commit9bc445578031fecf56086729d8e4940c77e14d65.
- The header declares RES_CHRATR_UNUSED3 as TypedWhichId<SfxInt16Item>, while the actual default table constructs SfxVoidItem for that identity. Preserve the table's concrete empty item rather than replacing it with a signed integer to match the declaration. The local complete character-default test checks the actual SfxVoidItem. No native typed retrieval, binary cast outcome or reachable document defect is inferred from this source mismatch.

### WRITER458 — Shared native DOM event cancellation has inconsistent public and stored flags

- Sources: `unoxml/source/events/event.cxx`, `uievent.cxx`, and `eventdispatcher.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with Calc (CALC-524).
- `stopPropagation` only marks events with the stored cancelable flag, `preventDefault` is empty, and `initEvent` does not reset previous cancellation. The UI-event getter returns false unconditionally despite its initializer accepting and storing true in the base. The source comment refers to mutation events in this UI-event override.
- Retain the source bodies and stored/public distinction. Genuine component tests cover public defaults and UI cancelability. Private dispatcher/tree effects are source-only until actual DOM nodes are available; do not introduce test-only state access or fake targets.

### WRITER459 — Shared native mouse events discard their related target

- Source: `unoxml/source/events/mouseevent.cxx`, same pinned baseline; shared with Calc (CALC-525).
- The initializer ignores `relatedTargetArg`; the getter always returns an empty reference. Preserve the original behavior.
- The valid empty-target case runs through an actual event owner. Nonempty-target discard remains a source-only observation until genuine native DOM targets are available.

### WRITER460 — DOM listener removal retains a positive listener-presence result

- Source: `unoxml/source/events/eventdispatcher.cxx`, `CEventDispatcher::removeListener` and `hasListeners`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-526.
- Removal erases matching nonempty references from the inner multimap but never removes the outer event-type entry. `hasListeners` checks only outer map emptiness, so removing every callback still returns true and keeps mutation-event construction enabled. Empty callback references cannot be removed by this method either. Preserve these conditions. Focused tests use actual native listener components and raw XML nodes; full tree dispatch remains unverified.

### WRITER461 — DOM implementation factory methods remain source-unimplemented

- Source: `unoxml/source/dom/domimplementation.cxx`, all three XDOMImplementation methods, same pinned baseline; shared with CALC-527.
- The process-lifetime singleton implements `createDocument` and `createDocumentType` as empty reference returns and `hasFeature` as false, with source diagnostics citing #i113683#. Preserve these bodies rather than delegating to the JavaScript backend's functioning factories. Actual document construction belongs to CDocumentBuilder. Direct singleton/query/default tests pass; document-mediated upstream QA remains pending.

### WRITER462 — DOM clone ownership differs between the wrapper and the copied C node

- Source: `unoxml/source/dom/node.cxx`, `CNode::cloneNode` and `appendChild`, LibreOffice baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-528. The pinned libxml2 2.15.3 `tree.c` calls `xmlStaticCopyNode(node, NULL, NULL, extended)` from `xmlCopyNode`.
- The wrapper factory keeps the original CDocument owner, while the copied native node has a null `doc` pointer. `appendChild` compares raw `cur->doc` with the receiving node's raw document before insertion. Consequently its source checks reject such a clone as WRONG_DOCUMENT even though the wrapper reports the original document owner. Do not repair this by assigning a document pointer during clone wrapping.
- The actual pinned native C build reproduces the null document pointer for a deep element clone in Node and Chromium. Wrapper-level append rejection is now also covered through the actual CDocument/CNode graph: the clone reports the original wrapper owner, and append rejects it as WRONG_DOCUMENT_ERR. No compiled C++ UNO differential witness is claimed.


### WRITER463 — Detached DOM attribute namespace lookup reuses a differing URI

- Source: `unoxml/source/dom/attr.cxx`, `CAttr::GetNamespace`, pinned LibreOffice baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-529.
- After looking up the requested prefix on the receiving element, the source returns that namespace when its URI differs from the detached attribute's requested URI (`0 != xmlStrcmp`). Preserve this condition. Do not invert it to the expected equality test or replace the receiver declaration.
- The actual native document/tree test creates `p:root` in `urn:existing` and a detached `p:a` in `urn:requested`. Appending the attribute creates a distinct attached copy in `urn:existing`, while the original stays detached in `urn:requested`. This is a source-backed UNO wrapper witness over the pinned C library, not a compiled C++ UNO differential test.

### WRITER464 — DOM DTD identifiers read name bytes using identifier lengths

- Source: `unoxml/source/dom/documenttype.cxx`, `CDocumentType::getPublicId` and `getSystemId`, same pinned baseline; shared with CALC-530.
- Both getters pass the DTD name pointer to the UTF-8 string constructor, with the byte length of ExternalID or SystemID respectively. Preserve the pointer and length selection rather than returning the actual identifier strings.
- A parsed DTD named `rootname` with public identifier `pub` and system identifier `sys` returns `roo` for both getters on the actual native tree. These short identifiers keep the reads within the allocated name bytes. Null identifier pointers and lengths exceeding the name allocation are undefined native cases and are not certified or manufactured for coverage.


### WRITER465 — DOM builder resolver IO contexts are not deleted on every close path

- Source: `unoxml/source/dom/documentbuilder.cxx`, `resolve_func` and `xmlIO_close_func`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-531.
- The resolver allocates a context with freeOnClose=true. The close callback returns zero immediately if its input reference is empty. It also catches a UNO closeInput failure and returns minus one before reaching delete. Preserve both orders; do not move deletion into a finally guard.
- Actual IO callback tests demonstrate that a close failure retains the context's genuine input reference until explicit caller cleanup. The empty-stream allocation leak is source-derived; no compiled native allocator leak witness or complete resolver-service integration is claimed.


### WRITER466 — DOM entity resolution discards returned encoding and identifier metadata

- Sources: `unoxml/source/dom/documentbuilder.cxx`, `resolve_func`, and `offapi/com/sun/star/xml/sax/InputSource.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-532.
- InputSource documents sEncoding as the parser's conversion encoding. The DOM resolver uses only aInputStream and passes XML_CHAR_ENCODING_NONE to both xmlParserInputBufferCreateIO and xmlNewIOInputStream. It does not transfer the returned sEncoding, sPublicId or sSystemId into the native parser input. Preserve these calls and omission rather than applying the metadata as a new override.
- A genuine user XEntityResolver returns UTF-8 DTD bytes but sEncoding=UTF-16. The actual helper/native pipeline reads the UTF-8 entity correctly and closes/releases its stream once. Raw DTDLOAD is explicitly selected to qualify this callback; the source builder default remains options zero. Full default-resolver/UCB and compiled C++ UNO differential behavior remain unverified.


### WRITER467 — DOM insertBefore returns the reference child and omits mutation notifications

- Sources: `unoxml/source/dom/node.cxx`, `CNode::insertBefore`, and `unoxml/source/dom/elementlist.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-533.
- The non-attribute insertion path splices native sibling pointers, then returns refChild rather than newChild. It does not emit DOMNodeInserted or DOMSubtreeModified. Preserve this return and absence of notifications rather than adopting host DOM behavior.
- A genuine cached getElementsByTagName list remains at one result after a second matching element is inserted, while getChildNodes immediately reports two. A later ordinary setAttribute emits the source subtree event and rebuilds the list to two. This is covered on actual CDocument/CNode wrappers over pinned C memory, without private cache access or an alternate node provider. No compiled C++ UNO differential claim is made.


### WRITER468 — UCB continuations borrow a request that need not outlive acquired continuation results

- Sources: `include/ucbhelper/interactionrequest.hxx` and `ucbhelper/source/provider/interactionrequest.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-534.
- InteractionContinuation keeps a raw InteractionRequest pointer. getContinuations returns an acquired Sequence of continuation references, so those references can remain live after their request is released. recordSelection then dereferences the borrowed parent. Preserve the raw relationship rather than introducing a strong parent reference or expiry fallback.
- Actual weak-reference tests demonstrate parent destruction while a returned sequence still retains its continuation. No select call is made after parent destruction: that would enter an undefined native lifetime case. This may be an intended caller precondition rather than a reachable filter defect; no compiled C++ failure is claimed.


### WRITER469 — UCB identifier keeps URL scheme spelling despite its normalization comment

- Sources: `ucbhelper/source/provider/contentidentifier.cxx`, `ContentIdentifier_Impl::ContentIdentifier_Impl`, and `include/ucbhelper/contentidentifier.hxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-535.
- The implementation assigns `aScheme.toAsciiLowerCase()` to the provider scheme, then replaces the URL prefix with the original `aScheme`. Thus `FiLe:///tmp/a.xml` remains unchanged as the content identifier, while its provider scheme is `file`. The header promises lowercase URL schemes. Preserve the original replacement argument rather than silently repairing this discrepancy.
- Without a colon, both stored strings remain empty, even for a nonempty relative input. Actual complete-component tests cover first-colon splitting, ASCII-only conversion, empty prefixes, relative inputs, acquired UNO queries and independent returned-string ownership. No compiled C++ differential or broker/factory integration claim is made.


### WRITER470 — UCB content exchange retains an already cached URL

- Sources: `ucbhelper/source/client/content.cxx`, `Content_Impl::reinit`, `getURL_NoLock` and `ContentEventListener_Impl::contentEvent`, plus `offapi/com/sun/star/ucb/ContentEvent.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-536.
- EXCHANGED delegates to reinit with the event's new Content. The source explicitly retains m_aURL under its issue-92581 comment. A nonempty cached URL therefore prevents getURL_NoLock from reading the replacement content's identifier. For an exchange to a different identifier after URL caching, the old URL can remain visible. Preserve both the cache retention and lazy getter condition rather than resetting on exchange.
- This is source inspection, not a compiled differential or positive provider/event witness. The source comment indicates deliberate cache preservation and may encode a caller requirement; no confirmed reachable filter defect is claimed. The real broker/provider notification graph is still pending.


### WRITER471 — SDBC Clob string-pattern search has a narrower start offset than Clob-pattern search

- Sources: `offapi/com/sun/star/sdbc/XClob.idl` and `XBlob.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-537.
- XClob.length and its position result are hyper, but position with a string pattern accepts long start. XClob.positionOfClob and XBlob.position accept hyper start instead. The string-pattern Clob signature therefore cannot express starts beyond signed32, even when the object length fits signed64. Preserve the original long/hyper distinction rather than widening the published declaration.
- This is an interface-contract observation and may be an intentional legacy ABI limitation. Compile-time SDK tests retain number for the original long and bigint for hyper; no large live Clob, database/provider execution or compiled differential witness is claimed.


### WRITER472 — PropertyValueSet reports different wasNull states for void Any and appendVoid

- Source: `ucbhelper/source/provider/propertyvalueset.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-538.
- The cached Object path sets m_bWasNull=false without testing aObject.hasValue. appendObject with a void Any therefore makes getObject return void with wasNull=false; appendVoid returns void with wasNull=true. Reading the same void Object through getString instead leaves wasNull=true. Preserve the Object flag and getter-specific behavior. Genuine component tests reproduce all three observations through public APIs.
- This may encode an intentional helper/caller convention. No compiled C++ differential, live database or full filter/UI defect is claimed. Native wasNull thread scheduling and service reconfiguration remain unqualified.


### WRITER473 — PropertyValueSet does not retry converter creation after a thrown first attempt

- Source: `ucbhelper/source/provider/propertyvalueset.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-539.
- getTypeConverter sets m_bTriedToGetTypeConverter before calling Converter.create. When real service creation throws, the flag remains true and the converter reference remains empty. A later incompatible read returns its default instead of retrying or repeating that creation exception. Preserve this one-shot ordering. A genuine ComponentContext/ServiceManager with an empty registry reproduces first-call DeploymentException followed by getInt returning zero; no injected converter or private flag mutation is used.
- This may encode an intentional helper/caller convention. No compiled C++ differential, live database or full filter/UI defect is claimed. Native wasNull thread scheduling and service reconfiguration remain unqualified.


### WRITER474 — Converter numeric failures report the source type as DestinationTypeClass

- Source: `stoc/source/typeconv/convert.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-540.
- The toHyper and toDouble helpers initialize aDestinationClass from rAny.getValueTypeClass and use it in CannotConvertException. Converting LONG128 to BYTE therefore reports LONG rather than BYTE; genuine converter tests preserve that field and OUT_OF_RANGE reason. This may be an intentional helper convention; no compiled C++ differential or full filter defect is claimed.


### WRITER475 — Converter integer strings accept decimal prefixes but inspect x anywhere first

- Source: `stoc/source/typeconv/convert.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-541.
- getNumericValue accepts a nonzero decimal prefix without checking the parsed end. getHyperValue first searches the entire trimmed string for x/X and rejects a non-hex occurrence before using that decimal path. Genuine converter tests therefore retain 12tail as twelve but reject 12suffix. Empty, whitespace-only, plus-only and empty-hex strings also retain the original zero outcomes. No stricter full-string numeric validation is added; no compiled differential or full filter defect is claimed.


### WRITER476 — Converter sequence conversion skips danger-reference releases on an element exception

- Source: `stoc/source/typeconv/convert.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-542.
- convertTo obtains acquired source/destination element descriptions with TYPELIB_DANGER_GET, recursively converts elements, and releases both only after the loop. A thrown element conversion bypasses both releases. Preserve the source control flow rather than placing these two manual releases in a finally guard. The ordinary TypeDescription and Any/sequence locals still unwind normally. This finding is source-derived; no compiled allocator/leak witness or full service/filter defect is claimed.


### WRITER477 — First failed numeric row read can report wasNull=false before the Object cache exists

- Source: `ucbhelper/source/provider/propertyvalueset.cxx`, `getValue` and `getObjectImpl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-543.
- getValue first sets m_bWasNull=true, but calls getObjectImpl when a natively appended string has no Object cache yet. getObjectImpl sets the flag to false. If the genuine converter then throws CannotConvertException, getValue swallows it without restoring the flag. Thus appendString followed by an invalid numeric read returns zero/false on the first call and zero/true on the second call. Tests and both real Chromium realms reproduce this through the production context/manager/converter, with no private mutation. Preserve the source cache and flag order; no compiled C++ differential or full filter defect is claimed.


### WRITER478 — XPath unregisterNS dereferences an unchecked map lookup

- Source: `unoxml/source/xpath/xpathapi.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-544.
- CXPathAPI::unregisterNS dereferences m_nsmap.find(prefix) before comparing the URI. An absent prefix therefore has no defined C++ result. Preserve the lookup-before-comparison contract; do not add a silently successful no-op. The local binding qualifies only existing-prefix calls; no native undefined-behavior outcome is claimed.


### WRITER479 — XPath namespace collection passes nullable namespace prefixes to strlen

- Source: `unoxml/source/xpath/xpathapi.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-545.
- lcl_collectNamespaces calls strlen on both href and prefix without checking for NULL. A default namespace can have a NULL prefix. Preserve the declared nonnull source precondition rather than substituting an empty prefix or URI. The browser boundary reports an explicit host precondition failure for those undefined native inputs; it does not claim native crash parity. Original named-prefix QA remains unchanged.


### WRITER480 — XPath evaluation resets a global libxml error callback instead of restoring its previous value

- Source: `unoxml/source/xpath/xpathapi.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-546.
- CXPathAPI::eval installs xmlSetGenericErrorFunc globally and resets it to NULL after xmlXPathEval, while structured errors are context-local. A previously installed generic callback is not restored; a thrown extension callback before evaluation can also bypass the reset. Preserve the source reset placement and global side effect. This is source-derived; native concurrent callback scheduling and cross-thread interference are unqualified.


### WRITER481 — Removing a dynamic property retains its old backing value until helper destruction

- Source: `comphelper/source/property/propertycontainerhelper.cxx` (`revokeProperty`) and `comphelper/source/property/propertybag.cxx` (`removeProperty`), pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-547.
- Revocation erases the description but does not erase or clear its slot in m_aHoldProperties. PropertyBag then erases the default, while the old held Any remains owned until helper destruction. A genuine ActiveDataSink interface value and weak reference reproduce that retained lifetime through the public bag methods. This may preserve stable vector indices intentionally, but repeated removals can retain otherwise unused values. Preserve the original retention and index layout; do not compact or clear the old slot. No compiled native leak/allocator or complete metadata/service defect is claimed.


### WRITER482 — Hybrid property lookup handles repeated names differently as its heuristic changes

- Source: `cppuhelper/source/propshlp.cxx`, `OPropertyArrayHelper::fillHandles`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-548.
- The linear branch leaves pCur at a match, whereas the binary branch advances it to pMid+1. A second equal name can therefore match again in the linear branch but miss in the binary branch. With 64 unique sorted descriptors, two requests for p016 give one hit; 64 repeated requests give 58 hits before the changing request-count heuristic advances past the match. Preserve both cursor updates and the original heuristic. This is a source-backed low-level observation; XMultiPropertySet::setPropertyValues explicitly requires unique sorted names, so duplicate setter input does not establish a defect in that UNO contract. Other higher-level duplicate-name legality, a compiled native differential and a complete filter defect remain unqualified.


### WRITER483 — Published listener container accepts null but can report an inconsistent count or dereference it during collapse

- Source: `include/cppuhelper/interfacecontainer.h` and `cppuhelper/source/interfacecontainer.cxx`, `addInterface`/`removeInterface`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-549.
- The published declaration explicitly permits null. Adding null to an empty singleton stores null and returns1, while getLength/getElements report zero. If a vector later shrinks to one remaining null reference, removeInterface unconditionally calls p->acquire before collapsing it into singleton storage, an undefined native dereference. Preserve the union transitions and return values. Ordinary null insertion is tested through actual public calls; the undefined collapse is represented by an explicit host precondition failure, without inventing a native crash result or a successful no-op. Complete property-service/filter impact and compiled native differential are unqualified.


### WRITER484 — Single-value property notifications carry the requested type while batch/dependent notifications carry the normalized type

- Source: `cppuhelper/source/propshlp.cxx, setFastPropertyValue/setFastPropertyValues/setDependentFastPropertyValue`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-550.
- The single setter stores aConvertedVal but fires veto/bound events using rValue. Batch and dependent paths use converted values. A real long property set from short therefore stores long but notifies short; source TODO already questions this difference. Preserve all three paths. Native tests and both real browser realms reproduce the type difference without replacement values; no complete filter defect or compiled differential is claimed.


### WRITER485 — Ordinary and dependent property setters wrap unexpected UNO exceptions with different type preservation

- Source: `cppuhelper/source/propshlp.cxx, setFastPropertyValue and setDependentFastPropertyValue`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-551.
- The ordinary catch serializes the statically typed Exception base into WrappedTargetException.TargetException, while the dependent catch uses getCaughtException and retains dynamic members. Preserve field assignment order, source allowed-exception filters, and this truncation difference. Tests verify the ordinary base type and a dependent actual CommandFailedException with Reason88 and nonempty real Context. It may be legacy design; do not normalize both paths into a common exception policy.


### WRITER486 — Disposed-state checks in property setters are diagnostics rather than guards

- Source: `cppuhelper/source/propshlp.cxx, setFastPropertyValue and setFastPropertyValues`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-552.
- These setters only diagnose bDisposed/bInDispose and continue their value/conversion/event logic. Listener registration/removal returns early for those flags. Preserve the difference; the concrete owner may be responsible for guarding external calls. The source-owned broadcaster flag and actual bag values qualify this helper behavior; no complete disposed service lifecycle or UI acceptance is claimed.


### WRITER487 — Bulk property-state lookup stops at a missing name and returns remaining DIRECT defaults instead of the declared exception

- Source: `comphelper/source/property/propstate.cxx, getPropertyStates; udkapi/com/sun/star/beans/XPropertyState.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-553.
- The forward-only find loop breaks at the first missing property without throwing. Remaining elements keep the native enum default0 DIRECT_VALUE, including later existing properties whose true state may be DEFAULT_VALUE. The IDL declares UnknownPropertyException for a missing property. Preserve the source loop, output cursor and zero initialization: actual A/B/C requests with A/C default-valued return1/0/0; both real browser realms also return1/0 for A/missing. No fallback state repair or new exception is added; native shared-memory scheduling and compiled differential remain unqualified.


### WRITER488 — Repeated PropertyBag initialization unions types and cannot revoke empty-name permission

- Source: `comphelper/source/property/opropertybag.cxx`, `OPropertyBag::initialize`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-554.
- Both initialization forms insert into the existing allowed-type set without clearing it. Empty-name permission is assigned only when true, so a later explicit false does not revoke it. Missing named AutomaticAddition preserves its previous value; the positional form always assigns it after successful extraction. Preserve these source transitions. Actual registered-service tests repeat named, empty and positional initialization, prove long/string type union and sticky empty names, and verify explicit positional false disables automatic addition. This may assume initialization occurs once; no complete metadata/filter defect or compiled native differential is claimed.


### WRITER489 — Classic DOM SAX omits CDATA and processing instructions for a basic document handler

- Source: `unoxml/source/dom/cdatasection.cxx`, `CCDATASection::saxify`; `processinginstruction.cxx`, `CProcessingInstruction::saxify`; `offapi/com/sun/star/xml/sax/XDocumentHandler.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-555.
- Both implementations put every callback behind a successful XExtendedDocumentHandler query. CDATA therefore emits no characters for a basic handler, and PI is omitted even though processingInstruction belongs to the basic interface. Preserve those gates and callback ordering rather than adding a fallback characters/PI call. Actual native document tests compare basic and extended handlers and verify raw CDATA, comments, PI and text ordering. This may be a legacy serialization assumption; full metadata/filter impact and a compiled native differential are unqualified.


### WRITER490 — DateTime formatting ignores nanoseconds when deciding whether to emit time

- Source: `sax/source/tools/converter.cxx, lcl_convertDateTime`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-556.
- The time-suffix predicate checks Hours, Minutes, Seconds and the explicit force flag, but omits NanoSeconds. A real DateTime with date2024-01-02, zero H/M/S, NanoSeconds9 and IsUTC true formats as2024-01-02Z with the default flag; forcing time emits2024-01-02T00:00:00.000000009Z. Preserve this predicate. Sfx dateTimeToText forces time and therefore avoids this particular omission. Native-value tests record both formatter choices; full format/UI impact and compiled native differential are unqualified.


### WRITER491 — Editing-duration conversion ignores a parsed negative sign and fractions

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx, textToDuration(OUString const&)`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-557.
- The scalar overload approximates years365/months30 and sums Days/Hours/Minutes/Seconds without reading Duration.Negative or NanoSeconds. A real typed parse retains Negative=true for -P1D, while the editing-duration helper returns positive86400. Preserve the sign/fraction omission and zero-on-invalid result; do not normalize or reject negative XML in this helper. Signed32 arithmetic overflow is not certified. The XML contract may constrain callers; no complete document/UI defect or compiled native differential is claimed.


### WRITER492 — String property compatibility uses descriptor index before transient and unsupported entries are skipped

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx, propsToStrings`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-558.
- The legacy string value-type omission checks4<=i where i indexes all descriptors. Transient entries and unsupported values advance that index despite producing no output row. A real registered PropertyBag with a transient descriptor, unsupported sequence and three strings emits the third string with meta:value-type=string while the first two omit it. Preserve descriptor ordering, skipped entries and this exact predicate; do not replace i with an emitted-string/property count. This may reflect a legacy slot assumption rather than a defect; no full old-OOo interoperability claim is made.


### WRITER493 — Duration parsing can wrap unsigned16 fields and accept signed64 reader overflow as zero

- Source: `sax/source/tools/converter.cxx, readUnsignedNumber/convertDurationHelper; sal/rtl/strtmpl.hxx, toInt`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-559.
- The reader rejects parsed signed64 values >=INT32_MAX, but the shared RTL signed64 parser itself returns zero on overflow. P9223372036854775808Y therefore passes the local source algorithm as zero years. The duration helper also accepts P65536Y and explicitly casts its component to unsigned16, producing zero. Preserve the original shared reader, bounds and casts instead of adding a clamp or a new numeric parser. Actual generated Duration/RTL tests reproduce both witnesses; native allocation/undefined excessive helper instantiations and a compiled binary differential remain unqualified.


### WRITER494 — UTC normalization counts offset minutes twice or cancels them

- Source: `sax/source/tools/converter.cxx`, `lcl_ConvertToUTC`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with existing CALC-297.
- The helper adds offset minutes before choosing the sign branch, adds them again for negative offsets and subtracts the already added minutes for positive offsets. Parsing2024-01-02T03:04:05-01:30 yields05:04:05 UTC; +01:30 yields02:04:05 UTC. Preserve the arithmetic, including calendar rollover and declared scalar widths. The generalized parser retains this original helper; passing the optional raw-timezone output intentionally bypasses UTC adjustment as upstream does. Existing authored witnesses and full source temporal QA remain unchanged. Complete Writer metadata/filter/UI effect and compiled native differential remain unqualified.


### WRITER495 — UTC calendar rollover can produce year zero that strict parsing rejects

- Source: `sax/source/tools/converter.cxx`, `lcl_ConvertToUTC/lcl_parseDate`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC-560.
- UTC adjustment increments/decrements the signed year directly without skipping zero. Parsing -0001-12-31T23:00:00-02:00 yields year0/month1/day1/hour1. Forced DateTime formatting produces 0000-01-01T01:00:00Z, which the strict parser rejects. Preserve the source arithmetic and parser guard rather than using a host calendar to repair them. Actual generated values and public converter tests record this boundary; XMLSchema version assumptions, full document/UI impact and compiled native differential remain unqualified.

### WRITER496 — Metadata text access reads only the first direct text node

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx`, `getNodeText`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC561.
- The function walks immediate children and returns the first TEXT_NODE. It ignores CDATA and text inside elements, and does not concatenate text separated by comments or other nodes. Consequently a metadata element containing CDATA followed by two separate text nodes yields only the first ordinary text fragment. Preserve this source selection rather than using DOM textContent. Native DOM tests exercise alternate prefixes, nested elements, CDATA and separated text; no compiled native differential or full format-impact claim is made.

### WRITER497 — Metadata float ingestion accepts nonnumeric text as zero

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx`, `init` float branch; `sax/source/tools/converter.cxx`, `Converter::convertDouble`; shared with CALC562 and existing CALC-170, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- The float branch checks only the SAX converter's status result. The source-tested RTL no-digit result is zero with status Ok, so `bad` is accepted as a double property with value zero; overflow such as `1e9999` is skipped. The metadata caller does not inspect the unconsumed suffix. Preserve the original caller check. Actual native DOM-to-PropertyBag tests retain this behavior alongside invalid boolean/date/duration rejection; compiled C++ differential and full document-service acceptance remain pending.

### WRITER498 — Empty custom entity replacement can prevent conversion progress

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SaxWriterHelper`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC563.
- setCustomEntityNames accepts empty replacement strings. findXMLReplacement then returns the zero-length prefix, and convertToXML adds replacement.length-1 to the loop index before continuing; the loop increment leaves the cursor unchanged. Keep this source algorithm without an invented nonempty-value policy. The nontermination is documented by source analysis only; no hanging/OOM workload is run.

### WRITER499 — Exact-full custom entity output skips the common cache flush

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SaxWriterHelper`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC564.
- The custom-entity branch executes continue after copying the replacement name. It bypasses the common rPos==1024 writeSequence and surrogate reset. A replacement ending exactly at the cache boundary can leave rPos==1024 for a subsequent pointer write, unlike ordinary characters and escapes. Preserve the branch and deferred position; native out-of-bounds/allocator behavior is unqualified and is not repaired or positively certified by JS logical storage.

### WRITER500 — XML byte estimation counts characters that conversion rejects

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SaxWriterHelper`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC565.
- calcXMLByteLength routes invalid XML control characters and U+FFFE/U+FFFF through the non-ASCII sizing branch and counts two or three bytes, whereas convertToXML drops them and returns false. Surrogate failure statuses also differ from size estimates. Preserve the separate original algorithms rather than unifying them under one host encoder; actual helper tests retain five estimated bytes for NUL+U+FFFE and no emitted bytes.

### WRITER501 — Raw comment and CDATA content delimiters are not validated

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SaxWriterHelper`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC566.
- The helper writes comment and CDATA marker/content strings directly, applying only UTF16/XML-character validation. It does not reject -- or a trailing minus in comments, nor split ]]> inside CDATA; processingInstruction similarly does not reject ?> in its data. Preserve these source emission routines rather than adding a different XML well-formedness policy. Normal safe marker ordering is executed in tests; full Writer service/DOM serialization QA and compiled native differential are still pending.

### WRITER502 — Writer stream replacement retains pending line-break flags

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SAXWriter`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC567.
- setOutputStream replaces the helper and resets document-start, level and CDATA state for a different stream, but does not reset either force/allow-line-break flag. A pending allowLineBreak therefore survives a new output and startDocument; a second allowLineBreak throws until another source event consumes it. Preserve the exact source reset set. Tests use two genuine output streams and public calls without private state mutation.

### WRITER503 — Empty-element completion leaves the optional line-break request pending

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SAXWriter`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC568.
- endElement handles FinishEmptyElement by clearing only m_bForceLineBreak. It skips getIndentPrefixLength, so m_bAllowLineBreak stays true after an empty child closes and another allowLineBreak throws. Preserve this source branch and ordering. Tests continue with actual characters and complete a valid native document.

### WRITER504 — Writer endDocument keeps the document-started flag set

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SAXWriter`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC569.
- endDocument writes and closes output without resetting m_bDocStarted. Assigning the same stream afterwards enters the flush-only branch of setOutputStream rather than resetting state; startDocument still rejects the call. A distinct stream takes the reset branch and can start a new document. Preserve these source transitions and actual stream identity; native output/allocator reuse after final Sequence shrink remains unqualified.

### WRITER505 — Writer unknown skips every raw string beginning with the XML declaration prefix

- Source: `sax/source/expatwrap/saxwriter.cxx`, `SAXWriter`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC570.
- unknown returns immediately for startsWith("<?xml"), including <?xml-stylesheet ...?>, and does not consume pending indentation flags. Preserve this prefix check instead of parsing a declaration token or re-emitting the stylesheet PI. Actual registered Writer tests observe both omitted bytes and the retained pending optional-break request; normal processingInstruction remains separately available.

### WRITER506 — OFOP relationships writer can emit an entry rejected by its reader

- Source: `comphelper/source/xml/ofopxmlhelper.cxx`, `WriteRelationsInfoSequence` and `OFOPXMLHelper_Impl::startElement`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC571.
- The writer validates only attribute names and accepts a missing or empty Id. The reader requires a nonempty Id and throws SAXException otherwise. Preserve this asymmetry, original validation timing after root callbacks and partial-output behavior; do not invent required-field validation in the writer. The output-only null-stream guard and illegal-name exception retain their original native types and fields.

### WRITER507 — Duplicate hierarchical URL descriptors return a partial metadata bag

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx`, `SfxDocumentMetaData::getURLProperties`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC572.
- Each HierarchicalDocumentName immediately adds StreamRelPath to the real PropertyBag. A duplicate raises PropertyExistException inside the catch covering the full descriptor loop and later BaseURI/StreamName additions. The exception is ignored and the partially populated property set is returned; even StreamName can be absent. Preserve source catch scope, first inserted value and failure timing. Genuine native-sequence/property-bag tests observe this without a replacement provider or synthetic exception.

### WRITER508 — Initialized metadata can retain the user bag modified flag

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC573.
- init clears m_isModified but populated user properties were added to the real PropertyBag, whose modified flag remains true. isModified combines both flags. Preserve this source state: actual TEST.odt initialization reports modified until setModified(false) clears the bag too. Native compiled differential, storage integration and full source QA remain unqualified.

### WRITER509 — Compatibility clone discards the additional manager category and company values

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC574.
- CompatWriterDocPropsImpl setters only update their own strings without changing metadata modified state. createMe constructs a fresh compatibility owner, while inherited createClone copies DOM only. Preserve the resulting empty extra strings in the clone, while standard metadata and interface identity remain intact. The actual ported source subclass test observes this; no corrective copy is inserted. Native compiled differential, storage integration and full source QA remain unqualified.

### WRITER510 — OOXML stream URI resolution keeps the first successful component context

- Source: `sw/source/writerfilter/ooxml/OOXMLStreamImpl.cxx`, `OOXMLStreamImpl::lcl_getTarget`, function-local `static Reference<XUriReferenceFactory> xFac = UriReferenceFactory::create(mxContext)`; `stoc/source/uriproc/UriReferenceFactory.cxx`, `Factory::m_context`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- The URI factory is initialized on the first successful call and retains that context. Later streams with another mxContext reuse the first factory and its scheme-parser service manager. This may be surprising for distinct component contexts, although the ordinary single-context desktop profile does not demonstrate a failure. Preserve the source successful-once cache, retry after failed initialization and first-context ownership when replacing the existing string-facing Writer URI binding; do not silently use a per-stream factory or the process-global context instead of the source mxContext.
- Qualification: actual OOXMLStreamImpl now requires the root caller context and copies it through child constructors. A cold-module test uses genuine empty and bundled bootstrap contexts: initialization fails on the first missing service, succeeds when supplied the bundled context, and later succeeds with the empty context because the original successful factory is retained. No fake service/provider or private cache reset is used. Independent compiled native different-context observation, physical shutdown and complete filter/UI acceptance remain unqualified. No equivalent Calc caller has been established.

### WRITER511 — Internal OOXML target resolution removes the first path unit unconditionally

- Source: `sw/source/writerfilter/ooxml/OOXMLStreamImpl.cxx`, `OOXMLStreamImpl::lcl_getTarget`, `xFac->makeAbsolute(...)`, `xAbs->getPath()` and unconditional `copy(1)`; `stoc/source/uriproc/UriReferenceFactory.cxx`, `Factory::makeAbsolute`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`.
- The stream resolver assumes the resolved URI path starts with a slash and removes its first UTF16 unit. However, makeAbsolute deliberately clones an already absolute URI, including an opaque URI with a relative path. For a malformed internal relationship target such as `scheme:abc`, that composition can turn the path `abc` into `bc`; an empty path also reaches copy(1)'s original producer precondition. Ordinary valid package part paths do not establish a failure. Preserve the original URI factory behavior and exact native copy/precondition when migrating this caller; do not add scheme rewriting, a leading-slash check or a forgiving host slice as a corrective replacement.
- Qualification: OOXMLStreamImpl tests with the native URI service show that `opaque:abc` opens the real package entry `bc` and `opaque:` reaches the SAL copy assertion. A Strict DOCX package test confirms that the latter error propagates through the document resolver when its referenced header is encountered. The tests use the real bootstrap, URI and package components. Compiled LibreOffice debug and release behavior remains unverified. No equivalent Calc caller has been established.

### WRITER512 — Malformed URI exception assignment returns an owned value

- Source: `include/rtl/malformeduriexception.hxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC575.
- Unlike the usual reference-returning assignment contract, operator= returns MalformedUriException by value after assigning m_aMessage. Preserve the additional copied exception and its independent lifetime, including self-assignment. The port uses the actual OUString field owner and explicit copy/destruction; source-contract tests do not claim an independent compiled native differential.

### WRITER513 — Strict URI UTF8 encoding accepts a non-scalar surrogate that strict decoding rejects

- Source: `sal/rtl/uri.cxx`, writeEscapeChar and readUcs4, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC576.
- The UTF8 encoder checks only isUnicodeCodePoint and manually emits three octets for a lone UTF16 surrogate even with UriEncodeStrict. The decoder checks isUnicodeScalarValue and UriDecodeStrict returns empty for those same bytes. Preserve this asymmetry instead of inserting a host Unicode replacement or scalar check. Actual native-owner tests retain U+D800 -> %ED%A0%80 -> empty; original surrogate QA remains unchanged. Physical ABI and compiled native differential remain unqualified.

### WRITER514 — Script URL admission skips a malformed name delimiter without checking for a question mark

- Source: `stoc/source/uriproc/UriSchemeParser_vndDOTsunDOTstarDOTscript.cxx`, parsePart and parseSchemeSpecificPart, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC577.
- parsePart can return a nonempty name prefix while leaving its index on a malformed percent escape. parseSchemeSpecificPart then increments the index as though it had stopped at ? and validates parameters without checking that delimiter. Preserve admission of abc%key=value, decoded name abc and first parameter key=value; do not add stricter URI validation. Actual registered parser tests exercise this source behavior. Independent native compiled differential and physical mutex/ABI behavior remain unqualified.

### WRITER515 — Fast serializer constructor failure bypasses the raw double-buffer destructor

- Source: `sax/source/tools/fastserializer.cxx`, FastSaxSerializer constructor/destructor, and `sax/source/tools/fastserializer.hxx`, mpDoubleStr, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC578.
- The constructor allocates mpDoubleStr before obtaining FastTokenHandler through the process component context. If context/service construction throws, C++ destroys constructed members but does not call the class destructor body containing rtl_string_release(mpDoubleStr). Preserve this ordering and the missing raw-buffer release rather than silently adding a new RAII owner or constructor cleanup. The port explicitly unwinds actual reference/cache members and keeps the source raw-buffer behavior. Source analysis only: no synthetic throwing service, private-state leak counter or independent compiled native allocation claim is used.

### WRITER516 — Terminated RTL boolean conversion accepts trailing characters beyond its documented values

- Source: `include/rtl/string.h`, rtl_str_toBoolean documentation; `sal/rtl/strtmpl.hxx`, rtl::str::toBoolean; `include/sax/fastattribs.hxx`, FastAttributeIter::toBoolean, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC579.
- The header documents true for the strings 1 or true in any ASCII case, otherwise false. The implementation tests only the leading 1 or four true units, with no terminating-NUL check, so 1false and trueish also return true. The native SAX iterator directly uses that function, unlike a full lexical boolean check. Preserve the prefix behavior and lack of whitespace trimming; do not tighten validation in the port. Actual byte/Unicode template and iterator cases observe the ported behavior. Independent compiled native differential, physical pointer/ABI and complete document-format acceptance remain unqualified.

### WRITER517 — Legacy namespace handler always returns an empty URI

- Source: `sax/source/fastparser/legacyfastparser.cxx`, NamespaceHandler::registerNamespace/getNamespaceURI; `offapi/com/sun/star/xml/sax/XFastNamespaceHandler.idl`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC580.
- The IDL describes retrieval of a namespace prefix URI, but this concrete legacy notification handler ignores its argument and always returns an empty OUString, even immediately after a matching declaration is queued. Preserve the empty result and separate declaration queue; do not implement an invented scope resolver. Actual ported owner tests observe it. This does not describe FastSaxParserImpl's separate namespace resolver, and no ordinary application failure or independent compiled native differential is claimed.

### WRITER518 — Legacy tokenized QName conversion passes unshifted high bits to the token handler

- Source: `sax/source/fastparser/legacyfastparser.cxx`, CallbackDocumentHandler::getNamespacePrefixFromToken/startFastElement/endFastElement, and `oox/source/core/fasttokenhandler.cxx`, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC581.
- The adapter requests getUTF8Identifier(nToken & 0xffff0000), without shifting. With the actual oox handler and a combined lexical namespace/local token, the masked value exceeds the local-token table, returns empty and drops the prefix for element/attribute names. Preserve the exact mask and native empty result; no shift or replacement token provider is inserted. Actual ported Entity/adapter/registered Writer/token services observe this direct tokenized-contract case. The ordinary LegacyFastParser namespace registration profile is not established to reach this path; full parser/application failure and independent compiled native differential remain unqualified.

### WRITER519 — FastParser namespace registration accepts the documented excluded boundary

- Source: `offapi/com/sun/star/xml/sax/XFastParser.idl`, registerNamespace parameter documentation, and `sax/source/fastparser/fastparser.cxx`, FastSaxParserImpl::registerNamespace, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC582.
- The IDL says NamespaceToken must be greater than FastToken::NAMESPACE, while the implementation rejects only values less than that constant and therefore accepts equality. Preserve the exact `<` comparison, including acceptance of the first generated namespace identity; do not add a greater-than or token-alignment requirement. Actual ported-owner tests cover equality, the immediately lower value and duplicate native Unicode keys. This is a documentation/implementation boundary discrepancy, not proof of document corruption or an independent compiled native differential.

### WRITER520 — FastParser XForms normalization does not enforce its commented year grammar

- Source: `sax/source/fastparser/fastparser.cxx`, NormalizeW3URI, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC583.
- The comment describes a numeric year component, but the code checks only the W3 prefix and `/xforms` suffix. It rewrites `http://www.w3.org/not-a-year/xforms`, nested path components and even `http://www.w3.org/xforms`, where the prefix's final slash overlaps the suffix's first slash. Preserve these exact matches and the canonical 2002 URI rather than adding year/path validation. Actual native RTL-value tests observe the ported source behavior. This is a source-comment/implementation discrepancy; no independent compiled native differential or application corruption is claimed.

### WRITER521 — FastParser decodes native diagnostic names as ASCII_US

- Source: `sax/source/fastparser/fastparser.cxx`, lclGetErrorMessage, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC584.
- The original helper explicitly constructs OUString from libxml2's message bytes with RTL_TEXTENCODING_ASCII_US. A genuine pinned libxml2 mismatched-tag diagnostic for a non-ASCII XML name contains that name in UTF8, but the source helper's conversion cannot preserve it. Keep the original ASCII decoder; source identifiers independently remain native Unicode. Actual C/RTL owner tests observe the raw UTF8 name and its loss in the converted message. This concerns diagnostics, not proof of document-content corruption or an independent compiled original C++ differential.

### WRITER522 — An unknown prefixed element can replace the inherited default namespace

- Source: `sax/source/fastparser/fastparser.cxx`, callbackStartElement and NameWithToken/maNamespaceStack, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC585.
- The unknown-element fallback replaces sNamespace/nNamespaceToken with the prefixed element's URI/token, then pushes those values as the context inherited by unprefixed descendants. A prefixed element with an unknown local token can therefore cause an unprefixed child in a different declared default namespace to receive the prefixed namespace's known token. Preserve the source assignments/stack and resulting token; do not substitute libxml2's child URI or a corrected separate default context. Actual C callbacks, ported producers and the genuine OOX token handler reproduce this with an unknown Word-prefixed parent, default `urn:default` and an unprefixed `p` child classified with the Word namespace token. Complete application corruption and independent compiled original C++ differential remain unqualified.

### WRITER523 — Character-map lookup can throw outside the callback exception-saving region

- Source: `sax/source/fastparser/fastparser.cxx`, sendPendingCharacters and callbackStartElement/callbackEndElement/callbackProcessingInstruction; `udkapi/com/sun/star/container/XMap.idl`, get raises declarations, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC586.
- Entity's source comment requires callback exceptions to be saved until outside the C parser, but sendPendingCharacters calls XMap::get for underscore-prefixed text. The start callback flushes pending text before its try block, and end/PI callbacks have no surrounding save-exception catch. A declared map lookup exception can consequently leave that saving region and skip clearing pending bytes. Preserve these original catch/clear boundaries rather than adding a new catch or reset. Source analysis only: a genuine nonnull map component is not supplied in this slice, and no fabricated throwing map, reproduced native allocation leak or application failure is claimed.

### WRITER524 — FastParser decimal entity callback skips the first decimal digit

- Source: `sax/source/fastparser/fastparser.cxx`, callbackGetEntity, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC587.
- Both hexadecimal and decimal branches call strtoul at name+2. For the decimal callback input `#65`, that parses `5`, not `65`; the newly allocated entity contains U+0005. Preserve the offset and genuine libc conversion, including partial parsing and zero fallback. Actual native libc/RTL/entity owner tests observe this direct callback contract. Normal XML numeric character references are handled by libxml2 itself, so this is not a claim that an ordinary `&#65;` document imports incorrectly or an independent compiled original C++ differential.

### WRITER525 — FastParser accepts an empty input without creating an XML parser

- Source: `sax/source/fastparser/fastparser.cxx`, parse/parseStream, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC588.
- If the converter first returns zero, mpParser remains null and the loop does not ask libxml2 to validate a document/root. parseStream still calls the document handler's start/end methods and returns successfully. Preserve the empty-stream acceptance instead of inserting a host root check. Actual native input/source loop/registered Writer tests observe completion with only the XML declaration. Whether callers intentionally rely on this shortcut is not established; no complete document-filter/application success or independent compiled original C++ differential is claimed.

### WRITER526 — Unicode custom entity names are looked up as ASCII rather than decoded UTF8

- Source: `sax/source/fastparser/fastparser.cxx`, setCustomEntityNames/ReplacementPair comparisons/callbackGetEntity, and `include/rtl/ustring.hxx`, compareToAscii, pinned baseline `9bc445578031fecf56086729d8e4940c77e14d65`; shared with CALC589.
- Custom names are stored/sorted as Unicode strings, but lower_bound compares them to libxml2's UTF8 bytes with compareToAscii. A Greek `Ω` name supplied through the public string sequence is therefore not found for the same valid XML entity name, and parsing reports an undeclared entity. Preserve the mixed-width comparison rather than adding UTF8 decoding. Actual pinned C parser, real RTL comparison and native replacement-sequence tests observe this path. Independent compiled original C++ differential and complete application impact remain unqualified.


### WRITER527 — LegacyFastParser ignores namespace Pair extraction failures

- Source: pinned `sax/source/fastparser/legacyfastparser.cxx`, SaxLegacyFastParser::initialize; shared with CALC590.
- The registerNamespaces branch default-constructs one Pair<string,long> outside the loop, ignores each Any extraction result, then calls registerNamespace with its current fields. An incompatible first argument therefore reaches the token0 minimum check. An incompatible argument after a valid Pair repeats that preceding URI/token and triggers duplicate registration; earlier successful registrations remain installed. Preserve the unchecked extraction and mutation order. Actual native Any/Pair/public service tests observe both failures and retained registration, without private field patches or a replacement provider. Independent compiled original C++ differential and full application consequences remain unqualified.


### WRITER528 — AttributeList fixed-width dates ignore UTC suffix and calendar validity

- Source: pinned `oox/source/helper/attributelist.cxx`, AttributeList::getDateTime; shared with CALC591.
- The source accepts a 19-byte date or the same text with an uppercase Z suffix, but assigns only Year/Month/Day/Hours/Minutes/Seconds. IsUTC remains the generated DateTime default false even with Z. Its validity predicate checks only length and separators; out-of-range fields and partial/non-numeric components reach the original o3tl conversion and unsigned16 casts, followed by declared signed16 Year assignment. Preserve those checks/defaults/casts rather than adding ISO/calendar validation or setting UTC. Actual FastAttributeList/AttributeList/generated DateTime tests cover Z, malformed components, numeric prefixes, signed fields and copied defaults; real main/Worker owners cover the Z/default path. Independent compiled C++ differential and full document-model/UI consequences remain unqualified.


### WRITER529 — ZipStorage opens existing substorages READ even for a writable parent

- Source: pinned `oox/source/helper/zipstorage.cxx`, ZipStorage::implOpenSubStorage and child constructor; shared with CALC592.
- The existing-element branch always calls openStorageElement(name, READ), including when bCreateMissing is true and the parent is writable. The child wrapper nevertheless inherits isReadOnly() from its parent. READWRITE is used only after NoSuchElementException when creation is requested. Preserve the original open mode, exception distinction and inherited wrapper flag. This is a source-observed possible mismatch between wrapper mode and backend access; actual positive XStorage write behavior/document impact and independently compiled C++ differential remain unverified. No positive backend/provider was invented to assert a write failure.


### WRITER530 — SwitchablePersistenceStream Sequence partial-read delegates to full read

- Source: pinned `package/source/xstor/switchpersistencestream.cxx`, Sequence and pointer readSomeBytes overloads; shared with CALC593.
- The Sequence overload calls the retained input's readBytes rather than readSomeBytes. The pointer overload instead calls ByteReader::readSomeBytes, or XInputStream::readSomeBytes followed by memcpy. Preserve that overload distinction. It can matter for a source whose full read waits for a requested count while partial read returns currently available bytes. Actual memory-stream tests cover both consumed overloads but do not prove blocking behavior; a real such stream/backend and independently compiled original C++ differential remain unverified. No timed fake stream or fabricated count was used to assert the difference.


### WRITER531 — TempFileFastService narrows seek offsets before validating the result

- Source: pinned `unotools/source/ucbhelper/tempfile.cxx`, TempFileFastService::seek; shared with CALC594.
- The method accepts sal_Int64 but passes static_cast<sal_uInt32>(nLocation) to SvStream::Seek, then compares the returned position with the original signed64 request. For a nonnegative request beyond uint32, a successful lower-width seek can therefore move the cursor before the method rejects the original request with IllegalArgumentException. Preserve this cast/call/compare order when porting the service; do not replace it with a preflight range rejection or a direct64-bit seek. The actual Emscripten filesystem supports a seek beyond uint32 without file growth, but TempFileFastService/SvFileStream are not ported yet, so service-level mutation behavior, compiled original C++ differential and document impact remain unverified. No replacement temporary stream or fabricated service result was used as evidence.


### WRITER532 — SvMemoryStream shrinking excludes the last allocated byte from logical data

- Source: pinned `tools/source/stream/stream.cxx`, SvMemoryStream::ReAllocateMemory/SetSize; shared with CALC595.
- Shrinking a nonempty allocation sets nEndOfData to nNewSize-1 whenever the old logical end is at least the new size. If nPos equals nNewSize, the strict greater-than position guard does not reset it, leaving the backing cursor beyond logical end. GetData computes the remaining count as unsigned size_t subtraction; a subsequent read may reach an invalid native pointer domain. Preserve the shrink-minus-one, strict position comparison and unsigned arithmetic. Actual memory-owner tests observe the defined initialized-prefix result (resize3 yields logical size2); out-of-bounds reads/native undefined behavior and independently compiled C++ differential remain unqualified, without private state patches or fabricated read results.


### WRITER533 — SvStream relative seek temporarily uses an absolute buffer-pointer offset

- Source: pinned `tools/source/stream/stream.cxx`, SvStream::SeekRel; shared with CALC596.
- After deriving an absolute stream position, the method assigns m_pBufPos = m_pRWBuf.get() + nActualPos before calling Seek, which establishes the final buffer-relative pointer. An absolute position can exceed the current read/write buffer allocation even when the subsequent seek is valid. Preserve the assignment and call order; the port keeps the corresponding logical pointer displacement, including this transient step. Native physical out-of-range pointer arithmetic/compiler effects are unqualified. Negative underflow keeps the old position; the positive overflow guard uses a strict comparison. No invalid physical pointer or synthetic position provider was used to claim a native differential.


### WRITER534: FD constructor assumes writeable before actual descriptor access is known

- Source: `sal/osl/unx/file.cxx`, `osl::detail::createFileHandleFromFD`, `FileHandle_Impl::writeFileAt`, `FileHandle_Impl::syncFile`.
- Observation: The constructor unconditionally sets `State::Writeable`. With a genuine readonly regular descriptor, a small buffered `osl_writeFile` can return success and advance the logical cursor; only later writeback reports `osl_File_E_BADF`. `osl_closeFile` still closes the descriptor after that failed writeback and returns the original failure. This may surprise a caller expecting the first write to reject readonly access.
- Fidelity: Preserve the explicit source assumption and original deferred-error/close behavior. Tests open an actual readonly descriptor in the linked Emscripten filesystem; no fake error source, private state mutation or descriptor permission emulation. Whether callers ever provide such descriptors upstream is not established.


### WRITER535: ENXIO maps to generic IO despite a distinct NXIO enum

- Source: `sal/osl/unx/file_error_transl.cxx`, `oslTranslateFileError`, and `include/osl/file.h`, `oslFileError`.
- Observation: The `ENXIO` case returns `osl_File_E_IO`, although the public enum also defines `osl_File_E_NXIO`. Whether this is deliberate normalization is not established; the distinct native errno cannot round-trip through this switch.
- Fidelity: Preserve `ENXIO -> IO` exactly. The direct conversion test uses pinned Emscripten libc ENXIO value60, independently of any fake filesystem error or provider. No mapping to NXIO is introduced.


### WRITER536: seekable output wrapper narrows the requested position to32bits

- Source: `unotools/source/streaming/streamwrap.cxx`, `OSeekableOutputStreamWrapper::seek`, compared with `OSeekableInputStreamWrapper::seek`.
- Observation: Output converts signed64 `_nLocation` to `sal_uInt32` before `SvStream::Seek`; input instead converts it to `sal_uInt64`. An output seek to `0x100000002` therefore seeks to2. Whether this historical difference is intended is not established.
- Fidelity: Preserve both casts; real memory streams verify output narrowing without a multi-gigabyte allocation or injected position. Native assertion/overflow/invalid-pointer domains are not simulated.


### WRITER537: shared stream wrapper dereferences a cleared stream after input closure

- Source: `unotools/source/streaming/streamwrap.cxx`, `OInputStreamWrapper::closeInput` and `OStreamWrapper::writeBytes`, `flush`, `truncate`.
- Observation: Input close clears the shared `m_pSvStream`. Output methods and truncate subsequently dereference that pointer without `checkConnected`; previously acquired output facets retain the same component. Unlike input methods, these calls can therefore reach a native null-pointer domain.
- Fidelity: Preserve the original missing guards; do not add a replacement NotConnected exception or claim JS TypeError as a native differential test. Tests verify shared facet identity and input disconnection, and avoid executing the undefined native domain.


### WRITER538: direct pipe copy does not advance the source pointer before storing a remaining suffix

- Source: `svl/source/misc/strmadpt.cxx`, `SvDataPipe_Impl::write`.
- Observation: After bypass-copying a prefix into the attached read buffer, the code reduces `nRemain` but does not advance `pBuffer`. If input exceeds the attached destination's remaining capacity, the page suffix starts with the original input prefix. Source input adapter requests normally constrain the count; broader direct pipe callers are not established.
- Fidelity: Preserve the missing advance. The actual pipe test attaches3bytes, writes `[1,2,3,4,5]`, reads `[1,2,3]` directly and then retained `[1,2]`. No fake pointer or private state mutation.

### WRITER539: nonseekable forward seek reports requested position without checking actual skipped count

- Source: `svl/source/misc/strmadpt.cxx`, `SvInputStream::SeekPos`.
- Observation: The forward fallback calls `readBytes` but ignores its result and reports `nPos`. Seeking beyond physical EOF can therefore move logical position past the actual input position. It also narrows the displacement to signed32.
- Fidelity: Preserve the report/narrowing; a genuine input-only wrapper over5bytes reaches physical5 while adapter seek reports9. Do not add an EOF/count correction.

### WRITER540: output flush suppresses IOException without setting a stream error

- Source: `svl/source/misc/strmadpt.cxx`, `SvOutputStream::FlushData`.
- Observation: Missing output sets INVALIDDEVICE, but a genuine underlying IOException is caught and discarded without setting an error. A caller can consequently observe successful SvStream state after an underlying flush failure.
- Fidelity: Preserve this source asymmetry. A real readonly memory stream/output wrapper produces the IOException; after resetting the adapter error, Flush leaves the adapter error unset. No injected failure or provider replacement.


### WRITER541: memory ZIP UInt8/UInt16 methods return signed scalar types

- Source: `package/source/zipapi/MemoryByteGrabber.hxx`, `ReadUInt8` and `ReadUInt16`.
- Observation: Their declared return types are `sal_Int8` and `sal_Int16`, although local assembly uses unsigned values and names suggest unsigned reads. On the selected compiler profile high-bit values narrow to negative results; streaming ByteGrabber ReadUInt16 instead returns unsigned16. Whether callers depend on this historical mismatch is not established.
- Fidelity: Preserve declared return casts; actual native sequence reads of FF/FFFF return-1 while ByteGrabber retains unsigned behavior. No caller correction, fake numeric provider or exception shim.


### WRITER542: ZIP output position assumes the supplied stream supports seekability

- Source: `package/source/zipapi/ByteChucker.cxx`, constructor and `GetPosition`, compared with ByteGrabber seek methods.
- Observation: Construction queries XSeekable without throwing, but GetPosition dereferences the possibly empty reference without a guard. ByteGrabber explicitly throws IOException when XSeekable is absent. Nonseekable output can therefore reach a native null-pointer domain if position is requested.
- Fidelity: Preserve the missing guard. Genuine seekable output is tested; no JS assertion is claimed as a native undefined-behavior differential, and no fallback position is invented.


### WRITER543: OSL mutex destruction frees native storage even after pthread destroy reports failure

- Source: `sal/osl/unx/mutex.cxx`, `osl_destroyMutex`.
- Observation: A nonzero `pthread_mutex_destroy` result is logged, then the mutex allocation is freed unconditionally. On a platform that reports a busy/in-use mutex, this can release storage still associated with that mutex. Whether real callers reach the erroneous lifetime domain is not established.
- Fidelity: Preserve the destroy/free order. The pinned non-pthread Emscripten libc uses real no-op pthread stubs and does not reproduce a busy failure; no fake mutex state or error injector is introduced. Native threaded/busy-lifetime/diagnostic behavior remains unqualified. Original acquire_002 single-thread assertions are retained, including its unbalanced recursion before scope destruction.


### WRITER544: ZIP directory disk check uses the other disk field for its sentinel exception

- Source: `package/source/zipapi/ZipFile.cxx`, `findCentralDirectory`.
- Observation: The directory-disk condition is `nEndDirDisk != 0 && nEndDisk != 0xFFFF`; its second comparison uses `nEndDisk`, not `nEndDirDisk`. This can accept a nonzero directory disk when the first disk is FFFF, or reject the directory field sentinel when the first disk is zero. Intent is not established.
- Fidelity: Retain the original field choice. The original directory reader now accepts an actual ZIP64 byte image with disk FFFF and directory disk 7 through genuine native UNO streams; the focused ZipFile test records this outcome. Native multi-disk/service acceptance is not claimed.

### WRITER545: empty ZIP directory leaves an unallocated zero-length interval

- Source: `package/source/zipapi/ZipFile.cxx`, `readCEN`.
- Observation: `unallocated` starts with `[0,nCenPos]`. With zero entries and directory position zero, the loop does not remove `[0,0]`; the final nonempty-vector check rejects it as a hole. A conventional empty ZIP can therefore reach the hole rejection. No special empty interval exception appears in this body; intent is not established.
- Fidelity: Preserve the initial interval and final rejection. The actual ZipFile reader rejects the conventional 22-byte empty ZIP with the original hole diagnostic through genuine native UNO streams. No replacement empty-package result is introduced.


### WRITER546: ZIP eager ByteReader constructor has no zero-progress exit

- Source: `package/source/zipapi/ZipFile.cxx`, anonymous `XBufferedStream`.
- Observation: The fast constructor sizes the vector from available(), then loops while remaining>0 and subtracts the actual read count. A real provider returning zero before that advertised remainder is exhausted leaves this loop without progress; no zero-read break appears here, unlike the Sequence fallback.
- Fidelity: Preserve the original loop. No artificial zero-read provider or fabricated hang test is used; genuine inputs return the advertised bytes. Threaded/misbehaving provider behavior remains unqualified.


### WRITER547: ZIP buffered EOF leaves its output Sequence unchanged

- Source: `package/source/zipapi/ZipFile.cxx`, anonymous `XBufferedStream`.
- Observation: The initial hasBytes guard returns zero before rData.realloc. Existing output content/length therefore survives EOF, unlike other input owners that resize to zero. Whether callers always respect the returned count is not established.
- Fidelity: Preserve the early return. Actual buffered input/Sequence tests verify unchanged previous output and original no-op closeInput.


### WRITER548: ZIP buffered skip can move past end or wrap unsigned position

- Source: `package/source/zipapi/ZipFile.cxx`, anonymous `XBufferedStream`.
- Observation: skipBytes adds its signed count to size_t mnPos without bounding or validating it, provided the stream initially has bytes. Over-end positions remain observable and subsequent skips at EOF do nothing. Negative counts follow unsigned target arithmetic.
- Fidelity: Preserve the source arithmetic. Actual input tests exercise over-end positions and the pinned wasm32 unsigned-wrap profile. Physical native pointer/iterator and other target-width behavior remain unqualified.


### WRITER549: STORED getDataStream selects RAW and omits payload CRC

- Source: package/source/zipapi/ZipFile.cxx and XUnbufferedStream.cxx.
- Observation: ZipFile::getDataStream selects UNBUFF_STREAM_RAW for STORED. XUnbufferedStream final CRC block runs only for !mbRawStream || mbWrappedRaw, so a plain STORED entry bypasses it. Matching CEN/LOC CRC fields can therefore differ from real stored payload CRC and still be read by this path. Raw-byte extraction itself intentionally does not validate decompressed CRC; intent of the STORED data-path omission is not established.
- Fidelity: Preserve mode selection and guards. A complete actual ZIP with both headers carrying the same wrong CRC rejects in DEFLATED mode and reads in STORED mode through original getDataStream. No stricter validation is inserted.


### WRITER550: Empty eager data stream does not reach CRC validation

- Source: package/source/zipapi/ZipFile.cxx and XUnbufferedStream.cxx.
- Observation: XBufferedStream only reads while advertised available()>0; XUnbufferedStream CRC work also sits inside the nonzero-request block. A zero-length DEFLATED entry with nonzero header CRC can therefore produce an empty data stream without a payload CRC check.
- Fidelity: Preserve zero-request/constructor guards. Actual ZIP construction/read verifies the outcome; no synthetic empty decode/CRC call or service success provider is added.


### WRITER551: Declared-size output can be accepted without final DEFLATE completion

- Source: package/source/zipapi/ZipFile.cxx and XUnbufferedStream.cxx.
- Observation: XUnbufferedStream breaks immediately when a nonzero inflate result fills the request (or compressed physical end is reached), before checking finished/error. Final validation checks logical size and CRC but does not require inflater finished(). A real non-final stored DEFLATE block containing all advertised plaintext can omit its next/final block and still satisfy size/CRC.
- Fidelity: Preserve this order. An actual incomplete DEFLATE byte image is rejected by independent strict Node inflateRawSync but accepted by the native stream with exact plaintext/CRC; an overstated size returns the decoded prefix and the next read fails on the remaining byte. No fake inflater status or private field forcing.


### WRITER552: ZIP compressed remainder narrows to signed32 before chunk selection

- Source: package/source/zipapi/XUnbufferedStream.cxx; include/comphelper/documentconstants.hxx; package/source/manifest/ManifestExport.cxx.
- Observation: XUnbufferedStream keeps archive positions/end as signed64 but casts mnZipEnd-mnZipCurrent to sal_Int32 before checking <=0 and choosing a read chunk. A remainder of80000000 hex becomes negative before any source read.
- Fidelity: Preserve the narrowing/order. A genuine input stream with a public declared compressed extent80000000 hex takes the original broken-stream branch before reading; this is not a physical multi-gigabyte file/ABI acceptance claim.


### WRITER553: Report MIME constants named OASIS retain Sun XML literals

- Source: package/source/zipapi/XUnbufferedStream.cxx; include/comphelper/documentconstants.hxx; package/source/manifest/ManifestExport.cxx.
- Observation: include/comphelper/documentconstants.hxx defines MIMETYPE_OASIS_OPENDOCUMENT_REPORT and REPORT_CHART as application/vnd.sun.xml.report and application/vnd.sun.xml.report.chart. ManifestExport.cxx lists16 other OASIS MIME values and does not include these report constants in that branch. Macro names therefore do not reliably identify the MIME namespace.
- Fidelity: Preserve literals and source exporter decisions. The OASIS manifest regression enumerates actual application/vnd.oasis.opendocument. values and asserts all16, preserving its original intended scope as legacy Sun XML constants are added. The missing legacy exporter path remains a separate admitted gap; no kernel MIME/manifest behavior is repaired here.


### WRITER554: ZIP64 header and descriptor thresholds differ at FFFFFFFF

- Source: package/source/zipapi/ZipOutputStream.cxx, getTruncated and writeDataDescriptor; ZipFile.cxx readLOC_Impl.
- Observation: getTruncated sets the ZIP64 header flag for sizes >=FFFFFFFF, while descriptor widths switch only for sizes >=100000000. At the reserved32-bit sentinel boundary, LOC can contain ZIP64 extra fields but the descriptor still uses32-bit sizes. The reader selects64-bit descriptor sizes when the LOC extra is ZIP64. Intent of the differing predicates is not established.
- Fidelity: Preserve both thresholds. Actual public metadata/byte-output calls verify the16/24-byte descriptor and32-byte extra-field images on either side; this is not physical multi-gigabyte payload/native ABI acceptance. No stricter producer or reader correction is added.

### WRITER555: Package buffer growth uses logical end rather than write position

- Source: package/source/zippackage/ZipPackageBuffer.cxx, writeBytes; package/inc/ZipPackageBuffer.hxx, realloc.
- Observation: Capacity demand is computed as m_nEnd plus input length even when overwriting at an earlier cursor. A one-byte overwrite at position0 in a full32768-byte buffer doubles its allocation although logical data still fits. The public realloc method changes only the Sequence, without synchronizing capacity/end/cursor fields; shrinking below accessible data is therefore an unsafe native caller domain.
- Fidelity: Preserve these calculations and public method behavior. Tests observe actual Sequence capacity growth and safe public realloc calls without forcing private state or invoking out-of-bounds accesses. No alternative memory allocator or manual JS buffer lifetime is introduced.

### WRITER556: Parented rename removes container membership before validating the new name

- Source: package/source/zippackage/ZipPackageEntry.cxx, setName; ZipPackageFolder.cxx, removeByName; ZipContentInfo destructor.
- Observation: setName removes the old key first. Erasing ZipContentInfo calls clearParent, so a failed new-name validation leaves the old name detached; even a successful rename cannot reach the final parent insertion after that erase. replaceByName similarly removes the old value before validating its replacement.
- Fidelity: Preserve this order without rollback. Actual folder/child tests verify detached failed/successful rename and failed replacement using real generated exceptions and native UNO objects.

### WRITER557: Moved ZipContentInfo temporary retains its raw child pointer

- Source: package/source/zippackage/ZipPackageFolder.cxx, doInsertByName and defaulted ZipContentInfo move constructor/destructor; ZipPackageEntry.cxx, doSetParent.
- Observation: emplace receives a ZipContentInfo temporary. Its default move transfers the RTL reference but leaves bFolder and the raw folder/stream pointer intact; its destructor unconditionally clears that child's parent. doInsertByName(..., true) then restores the parent, but doSetParent inserting an absent key uses false and can finish with the key present and its child parent null. Duplicate-key emplace also destroys the temporary.
- Fidelity: Preserve temporary destruction before the optional setParent call. Actual two-folder transitions and direct insertion tests cover present/absent keys and removal mode. Native hash iteration/ABI and invalid native pointer domains remain unqualified; no new parent rollback or dangling-pointer behavior is promised.

### WRITER558: Shared-stream read methods omit the mutex used by other operations

- Source: package/source/zippackage/wrapstreamforshare.cxx, readBytes and both readSomeBytes overloads.
- Observation: Reads seek the shared source then delegate without acquiring m_xMutex, while skip/available/close/seek/position/length use MutexGuard. Concurrent native read calls could interleave their seek/read pairs despite having separate logical cursors.
- Fidelity: Preserve guard placement. Actual synchronous interleaved readers are tested, but true native thread races are not simulated and no extra synchronization guarantee is claimed.

### WRITER559: Shared-stream available reports the shared source cursor

- Source: package/source/zippackage/wrapstreamforshare.cxx, available.
- Observation: Unlike read and skip, available delegates without first seeking to m_nCurPos. The reported count can therefore reflect another wrapper's latest read/seek or an initial source EOF even though this wrapper starts at zero.
- Fidelity: Preserve this delegation. Actual two-wrapper tests verify source EOF and differing positions; ordinary reads still reposition before delegation.

### WRITER560: Shared-stream construction asserts a ByteReader even for otherwise valid seekable inputs

- Source: package/source/zippackage/wrapstreamforshare.cxx constructor; ZipPackageStream.cxx GetOwnSeekStream/getInputStream; package/inc/ZipPackageBuffer.hxx.
- Observation: GetOwnSeekStream only ensures XSeekable, but WrapStreamForShare additionally asserts a ByteReader crosscast. ZipPackageBuffer is a real XInputStream/XOutputStream/XSeekable implementation without ByteReader. In a release build, Sequence reads can work while the raw-pointer overload would dereference the null crosscast.
- Fidelity: Preserve the original interfaces and crosscast; do not add ByteReader to ZipPackageBuffer or manufacture a fallback. Actual Sequence-only operation is tested as a release-profile domain. Native debug assertion and raw null-pointer access are unqualified, not executed or claimed safe.

### WRITER561: Seekable-wrapper constructor exception retains a reference to the failing object

- Source: comphelper/source/streaming/seekableinput.cxx, OSeekableInputWrapper constructor.
- Observation: A null component context triggers IllegalArgumentException with *this as Context from inside the constructor. Native construction failure destroys members/base and releases allocation, while the exception may retain that interface reference. The exact native exception-unwind/self-reference lifetime requires independent SDK auditing; dereferencing a failed-constructor Context must not be treated as a supported object lifetime.
- Fidelity: Preserve the original validation/message/Context/ArgumentPosition1 and native member cleanup. This invalid native lifetime domain is unqualified and not exercised through dangling-pointer access or fake state. Normal seekable identity with an absent context, and lazy wrapping with a real context, are tested.

### WRITER562: Invalid file handles collapse into the general stream error

- Source: include/comphelper/errcode.hxx, SVSTREAM_INVALID_HANDLE; tools/source/stream/strmunx.cxx, both GetSvError overloads.
- Observation: SVSTREAM_INVALID_HANDLE aliases ERRCODE_IO_GENERAL. EBADF and osl_File_E_BADF therefore lose their distinct handle classification and return the same packed value as an unknown error. The displayed diagnostic cannot distinguish these cases from this code alone.
- Fidelity: Preserve the macro alias and both tables. A real MEMFS invalid-descriptor failure and every source table vector retain the general code; no more specific diagnostic is invented.

### WRITER563: File allowed-path matching is a literal prefix rather than a path-component boundary

- Source: sal/osl/unx/file.cxx, isForbidden.
- Observation: The source compares strncmp(resolvedPath, allowedPrefix, prefixLength) only. An allowed path prefix such as /tmp/allowed also matches a sibling /tmp/allowed-other; there is no following-slash/end check.
- Fidelity: Preserve this original comparison when the requested security-hook port is approved. This is source review only: local security implementation/execution is pending explicit approval, and no stronger boundary rule or claimed sandbox guarantee is added.

### WRITER564: An empty read allowlist disables all file-path checks

- Source: sal/osl/unx/file.cxx, setAllowedPaths and isForbidden.
- Observation: isForbidden returns false immediately when allowedPathsRead is empty, before choosing read/write/execute lists. An execute-only configuration therefore does not enforce its execute list. The setter also treats every one-character token as a mode, so a literal root / token is not registered as a path and can leave the read list empty.
- Fidelity: Preserve the original default/parser/early-return behavior after explicit approval. No local security implementation or runtime proof is claimed at this checkpoint; the concrete proposal describes the exact upstream path and the existing realm-local MEMFS boundary.

### WRITER565: Locale registration identifies records by XOR hash alone

- Source: sal/rtl/locale.cxx, rtl_locale_register and rtl_locale_equals.
- Observation: The table is keyed only by the XOR of Language, Country and Variant string hashes; a matching key returns the existing record without comparing fields. Swapping Country and Variant produces the same key, so a subsequent registration can return different fields than requested. Equality then reports true because the returned records have identical addresses.
- Fidelity: Preserve the original hash-only lookup and identity equality. Tests exercise a real collision through the public registration API. JS garbage collection owns ordinary objects; existing RTL string reference operations retain the source observable lifecycle contract, without introducing a manual JS allocator.

### WRITER566: Emscripten's native ASCII codeset has no alias in the selected locale table

- Source: sal/osl/unx/nlsupport.cxx, compose_locale/osl_getTextEncodingFromLocale and Linux/Emscripten nl_language_list; sal/osl/unx/thread.cxx, getThreadTextEncodingForInitialization.
- Observation: The pinned Emscripten libc reports CODESET ASCII for C/POSIX, but the selected LibreOffice table contains no ASCII entry. The locale query therefore returns DONTKNOW and thread initialization applies the original ASCII fallback. A one-character C language is also rejected by compose_locale, leaving an empty native locale name: native newlocale then consults its environment again. With no locale environment variables, the RTL process locale is C while the SDK libc defaults to C.UTF-8, producing UTF8 instead.
- Fidelity: Preserve the selected table, two/three-character composition rule, empty native locale name and thread fallback. Tests use actual libc environment/locale calls for C and unset environment, without a replacement locale provider. Other platforms' tables are not substituted.

### WRITER567: Path access fallback accepts an existing regular file as a parent

- Source: sal/osl/unx/file.cxx, isForbidden.
- Observation: If realpath fails for a path such as allowed/file/child, fallback resolves allowed/file and appends /child without checking that the resolved parent is a directory. The prefix decision may allow the path even though opening it fails.
- Fidelity: Preserve the predicate's decision and let actual native open report its error. A real regular-file fixture exercises this result; the initial test expectation of rejection was corrected to match the source.

### WRITER568: Allowed-path setup can return before refreshing the abort flag

- Source: sal/osl/unx/file.cxx, setAllowedPaths.
- Observation: A missing parent or length failure returns immediately after lists have already been cleared or partially populated. The assignment from SAL_ABORT_ON_FORBIDDEN is below the loop, so that return retains the previous abort flag rather than the current environment value.
- Fidelity: Preserve partial list state and the original environment-publication order. Native abort is tested in an isolated real runtime; no caller resumes native operations after that test.

### WRITER569: Missing relative names can form a pointer before the path buffer

- Source: sal/osl/unx/file.cxx, setAllowedPaths/isForbidden/getParentFolder.
- Observation: lastIndexOf('/') returns -1 for a missing relative basename. The fallback can then pass getStr()+n to strcat, forming a pointer before the string buffer. For a missing root-level path, getParentFolder's n<1 rule instead resolves dot rather than slash.
- Fidelity: Preserve the source slash index, parent rule and valid-path fallback. The full active Forbidden::forbidden logical assertions are ported, including relative/empty inputs. Native physical out-of-bounds reads/compiler effects remain unqualified; passing logical assertions is not evidence for that undefined native domain.

### WRITER570: File URL converters retain the first caller's thread encoding

- Source: sal/osl/unx/file_url.cxx, UnicodeToTextConverter_Impl::getInstance and TextToUnicodeConverter_Impl::getInstance.
- Observation: Each function-static converter captures osl_getThreadTextEncoding only in its constructor. Later thread-encoding changes do not rebuild it. The two directions initialize independently and can therefore use different encodings, despite conversion routines looking like current-thread helpers.
- Fidelity: Preserve first-use capture, independent converter instances and source null contexts. Isolated real ASCII/UTF8 tests verify cached failure and opposite-direction initialization without injecting or resetting a converter. Native multi-thread first-initializer races and shutdown are unqualified.

### WRITER571: OStringBuffer setLength does not initialize newly exposed bytes

- Source: include/rtl/strbuf.hxx, OStringBuffer::setLength.
- Observation: The documentation promises null characters when length increases, but the body only reserves capacity or writes the new terminator and then updates length. It does not initialize the newly exposed range; the reserve branch also leaves termination at the new logical end to existing storage contents.
- Fidelity: Preserve the exact mutation/reserve order. Tests fill reserved bytes before observing them; JS zero-initialized allocations are not claimed as equivalent to native uninitialized storage. No extra zero-fill or repaired source default is added.

### WRITER572: Emscripten security context retains mobile identity and home fallback

- Source: sal/osl/unx/security.cxx, osl_getCurrentSecurity and osl_psz_getHomeDir.
- Observation: The Emscripten branch shares the iOS-simulator fallback and explicitly stores mobile, Mobile User and /var/mobile, with native effective UID/GID. Home lookup prefers a matching current user's nonempty HOME only when access(HOME,0) succeeds; otherwise it returns the stored directory without checking that it exists. The hardcoded fallback can therefore name an absent directory in a browser runtime.
- Fidelity: The approved selected-profile current-security and byte-home bodies now preserve these values and precedence in the actual WASM runtime. Tests exercise unset, empty and nonexistent HOME fallbacks and dynamic existing paths. Public URL conversion remains unfinished; no host user-directory access is added.


### WRITER573: Empty-folder ZIP failures lose diagnostics and retain partial output

- Source: package/source/zippackage/ZipPackageFolder.cxx, saveContents, pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65; shared with CALC636.
- Observation: Empty-subfolder serialization catches ZipException and IOException and throws a default RuntimeException without preserving the original message or cause. A failed write may already have transferred its entry to ZipOutputStream and emitted a partial local header; no rollback is attempted.
- Fidelity: Preserve the original exception translation and mutation order. Tests use genuine invalid paths, a read-only stream and a bounded writable SvMemoryStream; the latter retains the first two ZIP signature bytes after failure. No synthetic output provider or injected error flag is used.


### WRITER574: HOME existence check accepts a regular file

- Source: sal/osl/unx/security.cxx, osl_psz_getHomeDir, pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65; shared with CALC637.
- Observation: For the current UID, a nonempty HOME is accepted when access(path,0) succeeds. The code does not require a directory or an absolute path. A regular file can therefore be returned as the home directory.
- Fidelity: Preserve access-only admission. The native MEMFS test sets HOME to a real file and observes the exact unchanged path; no fabricated security record or access result is supplied. Public Unicode/URL home conversion remains unfinished.


### WRITER575: Tilde expansion encodes escaped HOME characters again

- Source: sal/osl/unx/file_url.cxx, osl_getFileURLFromSystemPath, pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65; shared with CALC638.
- Observation: Tilde expansion obtains an already encoded home URL, removes file:// and substitutes the remaining text before calling rtl_uriEncode with IgnoreEscapes. Percent escapes from HOME are encoded again: a real HOME `/tmp/home é` produces `file:///tmp/home%2520%25C3%25A9/child/name` for `~//child///name`.
- Fidelity: Preserve the original calls, slash index adaptation and encoding order. A genuine MEMFS directory/native HOME test observes this result; no browser URL or alternative decoder is substituted.

### WRITER576: Public home lookup ignores system-path conversion failure

- Source: sal/osl/unx/security.cxx, osl_getHomeDir; shared with CALC639.
- Observation: The function returns the byte-home lookup status after converting to Unicode, ignoring osl_getFileURLFromSystemPath's status. An accessible relative filename `file:public-home` supplied as native HOME yields true while leaving the output `file:public-home`, which the path conversion rejected.
- Fidelity: Retain the original status and output order. The test creates the actual MEMFS file and uses the genuine current-security handle; authentication and host filesystem operations are not involved.


### WRITER577: The FQDN helper can return the short native hostname

- Source: sal/osl/unx/socket.cxx, getFullQualifiedDomainName and lcl_getLocalHostname; shared findings CALC640/CALC641/CALC642.
- Observation: The helper accepts the canonical name returned by getaddrinfo without requiring a dot. The pinned Emscripten runtime returns `emscripten` for both the regular and FQDN paths. The file URL authority check therefore admits that exact short hostname (ignoring ASCII case), while still rejecting a final dot.
- Fidelity: Preserve both actual libc lookup paths and independent static caches; do not invent a domain suffix or substitute browser location.hostname. Tests observe the real pinned SDK result. No socket connection or external DNS lookup is introduced.

### WRITER578: Reverse URL home recognition checks only the second path character

- Source: sal/osl/unx/file_url.cxx, getSystemPathFromFileUrl, pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65.
- Observation: Home recognition checks path[1] for tilde and the next separator, without requiring path[0] to be slash. Consequently the relative URL `a~/child` also resolves through HOME.
- Fidelity: Retain the exact source predicate, URL-tail indexing and guarded recursion. A genuine MEMFS HOME test covers the relative spelling and expected resolved path.

### WRITER579: The legacy CJK file URL QA literal contains UTF8 byte values as UTF16 units

- Source: sal/qa/osl/file/osl_File_Const.h, aTmpName10/aSysPath5; osl_File.cxx getSystemPathFromFileURL_005.
- Observation: The u-prefixed literal spells the UTF8 bytes of 未命名 using separate hexadecimal escapes, producing U+00E6, U+009C and further byte-valued UTF16 units instead of those three CJK codepoints. The fixture therefore does not itself verify the CJK text described in its comment.
- Fidelity: Port the exact original UTF16 units and actual directory setup/cleanup. Separate Unicode tests cover real non-ASCII and supplementary scalars; the legacy vector is not silently corrected.


### WRITER580: File URL open removes trailing separators before opening a regular file

- Source: sal/osl/unx/file_url.cxx FileURLToPath, file_path_helper.cxx osl_systemPathRemoveSeparator and file.cxx openFile; shared with CALC643.
- Observation: FileURLToPath removes trailing path separators before native open. Thus a URL ending in `/file///` can successfully open an existing regular file instead of preserving the native trailing-separator ENOTDIR distinction.
- Fidelity: Preserve original separator removal, capacity-check order and native open delegation. An actual MEMFS regular-file create/write/close/reopen/read test uses the trailing-separator spelling and observes the same bytes.


### WRITER581: Directory item identity compares inode without the device

- Source: sal/osl/unx/file_stat.cxx, osl_identicalDirectoryItem; shared with CALC644.
- Observation: After pointer and path equality fast paths, the UNIX implementation compares only st_ino, omitting st_dev. Equal inode numbers on different filesystems could therefore be treated as identical.
- Fidelity: Preserve the inode-only predicate and original lstat ordering. Actual MEMFS alias/different-file identity is tested; no second filesystem, host mount or fabricated inode/device provider is introduced. The cross-filesystem collision is source review only.

### WRITER582: Directory item identity does not resolve symlink targets as documented

- Source: include/osl/file.hxx DirectoryItem::isIdenticalTo and sal/osl/unx/file_stat.cxx osl_identicalDirectoryItem; shared with CALC645.
- Observation: The public comment describes resolving links to the target. The selected UNIX body uses lstat, so a symlink and its regular-file target have different inode identities. Same-pointer/path fast paths can also report identity after the pathname has been removed.
- Fidelity: Preserve the body. Real MEMFS symlink/target, dot-path alias and deleted-path cases exercise these results without a replacement identity provider.

### WRITER583: FileStatus scalar getters can return retained invalid values

- Source: include/osl/file.hxx FileStatus getters and sal/osl/unx/file_stat.cxx osl_getFileStatus; shared with CALC646.
- Observation: Status queries reset uValidFields but do not reset all stored values. Scalar getters return the stored attributes/size/time without checking validity. Reusing a status for a directory after a three-byte regular file leaves getFileSize()==3 with an invalid FileSize bit, contrary to the getter comment promising zero otherwise.
- Fidelity: Preserve constructor zeroing, selective publication and scalar getters; string/type getters keep their original validity guards. The actual file-to-directory reuse and independent returned filename/time values are tested.

### WRITER584: Legacy file time QA uses a one-sided time difference

- Source: sal/qa/osl/file/osl_File.cxx, t_compareTime and FileStatus access/modify time tests; shared with CALC647.
- Observation: t_compareTime returns signed(end-start milliseconds)<delta without an absolute-value or lower-bound check. Arbitrarily old timestamps can satisfy the comparison; these assertions alone do not establish closeness to current time.
- Fidelity: Port the exact signed borrow/truncation and UNIX delta=2000 predicate for the original assertions. Additional native stat metadata tests do not turn these source QA results into a stronger clock certificate.

### WRITER585: UNIX attribute QA root expectations conflict with selected Emscripten access semantics

- Source: sal/qa/osl/file/osl_File.cxx getAttributes_001/_002; sal/osl/unx/file_stat.cxx set_file_access_rights; sal/osl/unx/uunxapi.cxx osl::access; pinned SDK libsyscall.js __syscall_faccessat. Shared with CALC648.
- Observation: The source QA removes ReadOnly from its expectation when actual geteuid()==0. In the pinned Emscripten runtime geteuid() is zero, but access(W_OK) follows MEMFS node permissions without a root bypass. Modes0444 and0111 consequently produce ReadOnly: actual4673 versus expected4672 and actual9361 versus expected9360. Both original POSIX assertions fail when run verbatim on this SDK.
- Fidelity: The pinned native QA retains its original root-dependent expectations. The ported fixtures assert all original mode flags apart from ReadOnly, and check ReadOnly separately against the selected MEMFS permissions with the real SDK UID. Kernel access calls and SDK behavior remain as before. No host identity or filesystem access is involved.


### WRITER586: Cheap stat publication marks attributes valid before access-right flags are computed

- Source: sal/osl/unx/file_stat.cxx set_file_attributes/set_file_access_rights; shared with CALC649.
- Observation: Every stat publishes hidden/mode attributes and marks Attributes valid, but ReadOnly and Executable are computed only when the requested mask includes Attributes. On the selected SDK, a real mode0444 file queried for Type alone has valid Attributes without ReadOnly; an explicit Attributes query supplies ReadOnly.
- Fidelity: Preserve the source mask-dependent work and validity publication. Both actual metadata queries are tested; no permission/root bypass or extra eager access check is introduced.


### WRITER587: The basename helper can mutate its const/shared input allocation

- Source: sal/osl/unx/file_path_helper.cxx, osl_systemPathGetFileNameOrLastDirectoryPart; shared with CALC650.
- Observation: The const rtl_String input is const-cast into a sharing OString, then passed to in-place separator removal without detaching. Calling the basename helper on `a///` changes the logical length/terminator observed by other owners of that same allocation.
- Fidelity: Preserve original reference sharing, trim mutation and basename computation. A real OString copy observes the same trimmed length in the critical helper tests; no new defensive copy is substituted.

### WRITER588: Public file copy uses a predictable destructive backup name

- Source: sal/osl/unx/file_misc.cxx, oslDoCopy; shared with CALC651.
- Observation: copying over an existing destination renames it to destination + `.osl-tmp`, without reserving a unique name. An existing regular backup-name file is replaced and later unlinked. A rename failure other than ENOENT is reported as fixed EXIST. Copying a file onto itself renames away its own source, fails opening it and restores it.
- Preservation: retain source naming, error mapping and rollback ordering. Real MEMFS tests cover the collision, rename failure and same-path rollback. No host filesystem is mounted.

### WRITER589: Public copy depends on global errno after higher-level stream failures

- Source: sal/osl/unx/file_misc.cxx, oslDoCopyFile; readwrite_helper.cxx, safeWrite.
- Observation: source-open failure returns current errno rather than translating the OSL return value; incomplete reads/writes use current errno or ENOSPC, and source-close errors are ignored. Destination open omits O_TRUNC/O_EXCL. The write loop retries EINTR and asserts a positive count after any nonnegative write.
- Preservation: retain these contracts and publish only actual captured SDK syscall errno from the JS file owner. Real descriptor/error tests cover EBADF and the nontruncating raw open. SDK interruption, zero-progress native write, allocation failure and concurrent source-size changes remain unqualified; no injected error provider is used.

### WRITER590: SvFileStream constructor stores a system path but internal locking expects a URL

- Source: tools/source/stream/strmunx.cxx, filename constructor, Open and lockFile; shared Writer/Calc prerequisite.
- Observation: The filename constructor converts a file URL to a system path, then Open stores that path unchanged. Internal lockFile passes GetFileName directly to DirectoryItem::get, whose URL conversion rejects the system path; failed lookup returns true without registering a lock. Public Open called with an actual file URL can reach the table.
- Preservation: Keep original conversion/lookup order. Real two-stream tests distinguish constructor path bypass from direct URL Open denial; no lock provider or fake item is installed.

### WRITER591: Read-lock numeric zero bypasses the source internal share table

- Source: tools/source/stream/strmunx.cxx, SvFileStream::LockFile; selected SDK fcntl.h; shared Writer/Calc prerequisite.
- Observation: Original nLockMode starts at zero and uses F_RDLCK for readonly DENYALL/DENYWRITE. The pinned selected SDK defines F_RDLCK=0 and F_WRLCK=1, so if(!nLockMode) returns true before the table. A stream without share denial likewise bypasses existing table entries. Readonly DENYREAD instead reports LOCKING_VIOLATION.
- Preservation: Retain actual selected constants and source decisions, with real open/lock tests. No substituted nonzero read-lock flag.

### WRITER592: Readonly retry retains create/truncate flags and original stream mode

- Source: tools/source/stream/strmunx.cxx, SvFileStream::Open; shared Writer/Calc prerequisite.
- Observation: On write-open failure only the OSL Write bit is removed; Create/Trunc remain. OSL Create still selects O_RDWR, so a readonly existing file can fail the retry when Create is present but open successfully when NOCREATE is supplied. The public stream mode keeps originally requested WRITE (and clears only TRUNC), even after actual readonly fallback.
- Preservation: Preserve exact flags/mode publication. Real permission tests exercise both outcomes without simulating syscall failures.

### WRITER593: Unsigned file-stream error sentinel advances the base cursor

- Source: tools/source/stream/strmunx.cxx, GetData/PutData; tools/source/stream/stream.cxx, ReadBytes/WriteBytes; shared Writer/Calc prerequisite.
- Observation: GetData/PutData return size_t(-1) on OSL errors. The unbuffered base stream adds the returned unsigned count to m_nBufFilePos. In wasm32 a real OSL ssize_t request overflow therefore returns 4294967295 and advances Tell by that count despite the packed error; GetSvError has no specific OVERFLOW mapping.
- Preservation: Keep sentinel and base bookkeeping. Tests invoke actual OSL admission above SSIZE_MAX, before any buffer dereference, without huge allocation or fake errno.

### WRITER594: ResetError comment promises seeking but implementation only clears flags

- Source: tools/source/stream/strmunx.cxx, SvFileStream::ResetError; shared Writer/Calc prerequisite.
- Observation: The source comment says set filepointer to beginning of file, but the body only calls ClearError. Position is unchanged.
- Preservation: Preserve body and test EOF/error reset at end of the actual file without seeking.

### WRITER595: COPY_ON_SYMLINK ignores copy failure after deleting the link

- Source: tools/source/stream/strmunx.cxx, SvFileStream::Open COPY_ON_SYMLINK branch; shared Writer/Calc prerequisite.
- Observation: After successful File::remove of a symbolic link, File::copy(target,url) status is ignored. The subsequent normal write/create open can create an empty replacement even when target copying failed.
- Preservation: Preserve source order and ignored status. A genuine unreadable MEMFS target produces the original successful-open/empty-replacement outcome while target bytes remain unchanged; no injected failure provider or host mount.

### WRITER596: Temp directory selection treats an empty variable as present

- Source: sal/osl/unx/tempfile.cxx, osl_getTempDirURL; shared Writer/Calc prerequisite.
- Observation: TMPDIR/TEMP/TMP fallback tests only null getenv results. An empty higher-priority variable prevents fallback and produces invalid URL conversion; trailing slashes are removed except the final root slash. The function does not validate directory existence or accessibility.
- Preservation: Keep original precedence/default/conversion/output order. Real SDK environment tests cover empty, absent, root/trailing slash and normal access assertions.

### WRITER597: Named TempFile can fall back to memory after filesystem creation fails

- Source: unotools/source/ucbhelper/tempfile.cxx, getTempNameBase_Impl/ConstructTempDir_Impl/TempFileNamed::GetStream; xtempfile.cxx constructor; shared Writer/Calc prerequisite.
- Observation: Directory creation status is ignored and a successfully converted base URL is cached. Failed exclusive naming yields an empty name, and GetStream then returns SvMemoryStream. OTempFileService checks optional owner presence rather than IsValid, so it can provide working IO with empty Uri/ResourceName after an actual creation failure.
- Preservation: Preserve default file-only branch and original fallback. Actual denied creation and cold empty-TMPDIR/retry tests use the real manager/runtime; no fake tempfile or private cache reset. Other constructors/Fast/directory owners remain unbound.

### WRITER598: TempFile seek validates64 bits then narrows position to32

- Source: unotools/source/ucbhelper/xtempfile.cxx, OTempFileService::seek; shared Writer/Calc prerequisite.
- Observation: The source compares signed64 nLocation with signed64 TellEnd, but calls Seek(static_cast<sal_uInt32>(nLocation)). A valid location beyond4GiB therefore narrows before seeking.
- Preservation: Retain the UInt32 cast and source bounds/order. Ordinary real seek tests pass; the beyond4GiB observation is source review only, without huge MEMFS allocation or fabricated size/cursor.

### WRITER599: TempFile type list contains XPropertySet twice

- Source: unotools/source/ucbhelper/XTempFile.hxx and xtempfile.cxx, OTempFileBase/getTypes; shared Writer/Calc prerequisite.
- Observation: OTempFileBase already declares XPropertySet, while OTempFileService::getTypes prepends the same type through OTypeCollection. The source collection does not deduplicate.
- Preservation: Preserve the original base order and duplicate. The registered real component exposes two XPropertySet entries in its actual type sequence; physical native ABI/compiled C++ oracle remains unqualified.

### WRITER600: TempFile listener methods only assert and have no release body

- Source: unotools/source/ucbhelper/xtempfile.cxx, four property/veto listener methods; shared Writer/Calc prerequisite.
- Observation: Each listener method contains assert(false) and no registration/removal logic. Unknown property getters/setters similarly assert before throwing UnknownPropertyException. A normal release profile exposes no-op listener calls, while native debug assertion termination differs.
- Preservation: Bind post-assert release behavior and original UNO exceptions, without an invented listener registry. Source native debug assertion termination remains explicitly unqualified; tests use actual empty listener references and real property changes.

### WRITER601: TempFile property table gives a sorted hint for unsorted entries

- Source: unotools/source/ucbhelper/xtempfile.cxx, getPropertySetInfo; shared Writer/Calc prerequisite.
- Observation: The source comment requires name sorting and supplies true to OPropertyArrayHelper, but initializes Uri, RemoveFile, ResourceName. The original helper diagnoses this ordering and still sorts it; getPropertyValues separately retains the original initializer order.
- Preservation: Keep the initializer, true hint and actual original helper behavior. Real descriptor/property tests assert alphabetical metadata, original handle order1/2/3 and DEFAULT_VALUE states, without fake metadata providers.

### WRITER602: Selected SDK mkdir passes mode without applying host umask

- Source: sal/osl/unx/file_misc.cxx, directory mode helpers; pinned Emscripten4.0.19 src/lib/libsyscall.js __syscall_mkdirat; shared Writer/Calc prerequisite.
- Observation: The selected SDK calls FS.mkdir(path,mode,0) directly. Its MEMFS observations retain0777/0222 as requested rather than host-style0755/0200 after an assumed022 mask. This is a selected runtime distinction, not a correction to LibreOffice mode calculation.
- Preservation: Preserve original read/write/private mode derivation and actual native syscall behavior. Tests removed the unsupported host-umask assumption; no host filesystem is mounted and no synthetic permission policy is added.

### WRITER603: Directory readdir null discards the distinction between EOF and read errors

- Source: sal/osl/unx/file_misc.cxx, osl_getNextDirectoryItem and osl_readdir_impl_; shared Writer/Calc prerequisite.
- Observation: Any null readdir result returns E_NOENT without checking errno. The C function leaves an existing output item intact on this path, while Directory::getNextItem releases and clears its item before calling it.
- Preservation: Keep both original contracts. Actual native EOF and C/wrapper slot tests pass; native readdir error delivery remains unqualified rather than being injected through a fake provider.

### WRITER604: Opening an already-open Directory overwrites its previous cursor

- Source: include/osl/file.hxx Directory::open and sal/osl/unx/file_misc.cxx osl_openDirectory.
- Observation: The wrapper forwards its existing output slot; successful open assigns a new DirectoryImpl without closing the previous handle. An unsuccessful open leaves the old slot intact. This can leak the original cursor on repeated successful open.
- Preservation: Do not add an upstream-absent already-open guard or automatic close. Real failed-open preservation is tested; repeated-success leak behavior is source-reviewed and is not executed as a passing resource-lifetime fixture.

### WRITER605: Recursive directory deletion skips links and leading-dot single-token files

- Source: comphelper/source/misc/directoryhelper.cxx, scanDirsAndFiles/deleteDirRecursively; shared Writer/Calc prerequisite.
- Observation: The scanner collects only directories and regular files. It skips symlinks, including dangling links. Splitting a regular filename like .hidden at its leading dot returns an empty basename, so that entry is also omitted. The subsequent parent removal fails while later siblings are still attempted.
- Preservation: Keep the type filter, empty-basename guard and accumulated true-on-error result. Real MEMFS fixtures verify remaining skipped entries and successful removal of later siblings, without injected statuses or fake providers.

### WRITER606: Recursive deletion reconstructs a trailing-dot filename without its dot

- Source: comphelper/source/misc/directoryhelper.cxx, splitAtLastToken/scanDirsAndFiles/deleteDirRecursively.
- Observation: For name., the fresh extension remains empty and the basename becomes name. Deletion appends a dot only for nonempty extensions, so it attempts name instead. If both files exist, their set pairs coincide; name is removed and name. remains. Literal percent and space names are separately encoded by the original IgnoreEscapes mechanism and are not conflated.
- Preservation: Keep splitting, set equivalence and reconstruction unchanged. Actual scan/delete tests assert retained name. and error return; percent/space files are independently removed correctly.

### WRITER607: Temporary parent validation accepts a regular file and may fail instead of falling back

- Source: unotools/source/ucbhelper/tempfile.cxx, ConstructTempDir_Impl and TempFileNamed parent constructor.
- Observation: An existing parent passes DirectoryItem::get without checking whether it is a directory. A regular-file parent is accepted, so creating its child fails and returns an empty name rather than selecting the default temporary directory. The original GetStream then uses its empty-name SvMemoryStream fallback.
- Preservation: Retain existence-only validation and original fallback ordering. Real regular-file parent tests assert invalid names and the actual native memory-stream owner; directory creation failure is also exercised without a fake syscall or private-state injection.

### WRITER608: ZipFileAccess excludes an extra code unit from interior wildcard searches

- Source: package/source/zippackage/zipfileaccess.cxx, StringGoodForPattern_Impl.
- Observation: The reverse search uses substr(0, nEndInd - 1), although nEndInd already marks the excluded suffix boundary. Consequently *ab*c rejects abc but accepts ab-c.
- Preservation: Retain the shortened search prefix and exact UTF16 boundaries. Direct source-pattern tests cover both results without replacing the matcher with regular expressions.

### WRITER609: ZipFileAccess distinguishes an empty pattern from a counted string beginning with NUL

- Source: package/source/zippackage/zipfileaccess.cxx, GetPatternsFromString_Impl and StringGoodForPattern_Impl.
- Observation: A truly empty string creates zero segments and matches nothing. A nonempty counted string beginning with NUL creates one empty segment because pointer parsing stops immediately; the matcher accepts every candidate. Embedded NUL also truncates the remaining pattern.
- Preservation: Retain the counted empty guard, NUL-terminated parser and one-empty-segment match behavior. Test the actual native string/sequence owners rather than normalized host strings.

### WRITER610: File-UCP available can return a negative byte count

- Source: ucb/source/ucp/file/filinpstr.cxx and filstr.cxx, available.
- Observation: The implementation subtracts getPosition from getLength and caps only the upper bound at SAL_MAX_INT32. A legal seek beyond EOF therefore gives a negative result; seeking to8 in a5-byte file returns minus3.
- Preservation: Keep signed64 subtraction and signed32 return conversion without clamping to zero. Actual input and bidirectional file owners are tested over real MEMFS/OSL files.

### WRITER611: File-UCP skipBytes silently ignores file errors

- Source: ucb/source/ucp/file/filinpstr.cxx and filstr.cxx, skipBytes.
- Observation: The method delegates the relative seek and discards its result. It does not check the open flag, so skipBytes after close returns without IOException while readBytes, seek and position queries fail. Negative displacements retain the original unsigned64 then signed64 call conversions.
- Preservation: Keep the unchecked relative seek and source conversion order. Public closed-stream tests verify the no-throw skip beside failing reads and position queries; no syscall error injection is used.

### WRITER612: UCB Regexp equality omits fields that affect matching and serialization

- Source: ucb/source/inc/regexp.hxx, operator==; ucb/source/inc/regexpmap.hxx, add/find.
- Observation: Equality compares only kind, prefix and infix. It ignores the empty-domain flag, translation flag and reverse prefix. Consequently domain patterns using star and plus compare equal despite different empty-domain matches; translated and untranslated patterns with identical prefix/infix also collide. RegexpMap retains the first value and treats later equal patterns as duplicates.
- Preservation: Keep exact source equality, duplicate retention and lookup. Tests assert differing match results alongside equal patterns and actual native mapped value identity.

### WRITER613: UCB serialization can omit a reverse-prefix literal required by its own parser

- Source: ucb/source/regexp/regexp.cxx, getRegexp and parse.
- Observation: Translated authority/domain patterns accept an explicitly quoted empty reverse prefix. Serialization omits that empty literal, but the corresponding parser branches require scanStringLiteral to succeed. The serialized form therefore fails to parse. Prefix translation allows the omitted literal and is unaffected.
- Preservation: Retain both serializer omission and branch-specific parser requirements. Source-derived tests verify accepted original forms and rejected canonical output without normalizing either behavior.

### WRITER614: Persistence replacement and completion query bypass the stream mutex

- Source: package/source/xstor/switchpersistencestream.hxx and switchpersistencestream.cxx, SwitchPersistenceTo, CloseAll_Impl and waitForCompletion.
- Observation: Public IO, seek and logical endpoint methods guard m_pStreamData with m_aMutex, but persistence replacement and the completion query access the same unique owner without that guard. Concurrent replacement/completion versus guarded IO could race unless callers serialize those operations externally. This is a suspected contract hazard, not a demonstrated race; the selected non-pthread runtime and current tests cannot establish native thread safety or whether all callers provide external serialization.
- Preservation: Restore exactly the source guarded methods and retain unlocked replacement/completion/destructor paths. Do not add a broader lock or claim that main/Worker execution proves shared-memory race safety.

### WRITER615: Fast temporary-service seek narrows before reporting an invalid offset

- Source: unotools/source/ucbhelper/tempfile.cxx, TempFileFastService::seek.
- Observation: The method casts a nonnegative signed64 location to UInt32, performs Seek, then compares the resulting position to the original location. Requesting 0x100000001 therefore seeks to1 and throws IllegalArgumentException afterward. A rejected seek can consequently change the stream position without requiring a file larger than4GiB.
- Preservation: Keep original cast, seek, comparison and error-check order. Actual MEMFS/SvFileStream tests assert the exception and changed position; do not add a pre-seek upper bound or rollback.

### WRITER616: Deflater reset retains accumulated counter overflow

- Source: package/source/zipapi/Deflater.cxx, reset, doDeflateBytes and getTotalIn/getTotalOut.
- Observation: reset clears zlib counters and current input offsets, but does not clear nTotalIn64/nTotalOut64. On a platform with32-bit zlib totals, reusing an owner after a counter rollover can therefore report previous-stream multiples of4GiB in the next stream. This is a source inspection finding; no greater-than4GiB execution or private counter injection is claimed.
- Preservation: Keep the original accumulators across reset. Actual ordinary-size reset/reuse is tested through the real library API.

### WRITER617: Retrying entry close after final output failure can commit unwritten totals

- Source: package/source/zipapi/ZipOutputEntry.cxx, processDeflated, doDeflate, finishDeflater, write and closeEntry.
- Observation: Deflate can report stream end before processDeflated writes its final compressed bytes. If that real output write throws, closeEntry exits before metadata/reset while the compressor remains finished. A later write silently skips input, and retrying closeEntry skips the failed output and updates entry totals/CRC before resetting. This is a suspected retry-contract hazard; normal ZipPackageStream catches the IOException and marks save unsuccessful rather than retrying, so this does not establish corrupted successful normal saves.
- Preservation: Keep the original order and finished-state behavior, without rollback, retry or a new error latch. A real readonly SvMemoryStream/OOutputStreamWrapper test proves the failure, unchanged initial metadata, skipped later input and retry totals.

### WRITER618: DOCX text fill writes transparency directly into the alpha value

- Source: sw/source/filter/ww8/docxattributeoutput.cxx, CharColor and WriteCollectedRunProperties; sw/qa/extras/ooxmlexport/ooxmlexport14.cxx, the CharTransparence=75 assertion.
- Observation: CharColor stores 255 minus Color.GetAlpha(). The writer converts that transparency to a rounded percentage and writes it as w14:alpha rather than its complement. Alpha64 therefore produces75000. The original QA explicitly expects the transparency percentage in this element, so this is a suspected source contract issue, not a failed local assertion or a demonstrated full-document rendering defect.
- Preservation: Keep the subtraction, rounding and original alpha value. Actual item/exporter/serializer tests assert75000; full fixture import/export and external rendering remain pending.

### WRITER619: DOCX complex-color transformation export multiplies stored values by1000

- Source: sw/source/filter/ww8/docxattributeoutput.cxx, lclAddThemeValuesToCustomAttributes and WriteCollectedRunProperties; include/oox/drawingml/drawingmltypes.hxx, PER_PERCENT=1000.
- Observation: The theme attribute helper interprets LumMod7500 as75percent, producing themeShade=bf. The accompanying solid-fill loop multiplies the same stored value by1000, producing w14:lumMod=7500000 rather than75000. This is a source-level unit inconsistency reproduced through the actual local value and serializer owners; full upstream fixture rendering has not been reproduced.
- Preservation: Keep the original multiplication, signed32 result and transform order. Tests retain both themeShade=bf and lumMod=7500000 without silently rescaling the source behavior.

### WRITER620: Iroha numbering export swaps fullwidth and halfwidth compared with import

- Source: sw/source/filter/ww8/docxattributeoutput.cxx, lcl_ConvertNumberingType; sw/source/writerfilter/dmapper/ConversionHelper.cxx, ConvertNumberingType; offapi/com/sun/star/style/NumberingType.idl.
- Observation: Import maps iroha to IROHA_HALFWIDTH_JA24 and irohaFullWidth to IROHA_FULLWIDTH_JA23. Export maps23 to iroha and24 to irohaFullWidth. Thus the two width variants exchange across these source conversion owners. Actual local conversion-owner tests reproduce this mismatch; complete source DOCX fixture load/save and rendering are not claimed reproduced.
- Preservation: Retain both source mappings without swapping the export values to make the roundtrip symmetric. Page-numbering XML and direct conversion tests pin the original spellings.

### WRITER621: Invalid escapement proportions can still feed explicit DOCX font sizing

- Source: sw/source/filter/ww8/docxattributeoutput.cxx, CharEscapement; editeng/source/items/textitem.cxx, SvxEscapementItem value/PutValue contracts.
- Observation: The branch detecting proportional heights outside1..100 only selects a preset vertical alignment when the offset matches a standard super/subscript value. A custom offset with proportion0 therefore reaches explicit position/size output: height240, offset17 and proportion0 produce position4 and size0. The raw item constructor/setter admits this value, while the UNO MID_ESC_HEIGHT setter rejects it. This is a malformed/raw-item contract hazard reproduced with actual value/export owners, not evidence of a normal UNO property operation creating invalid formatting.
- Preservation: Keep the original branch, raw value admission, UNO rejection and explicit zero result. Do not clamp proportions or replace the source offset. Tests retain the zero font-size optional value and source rounding.


### WRITER622: ValueRangeSet adjacency handling can invert the range order

- Source: oox/source/helper/containerhelper.cxx, ValueRangeComp and ValueRangeSet::insert; include/oox/helper/containerhelper.hxx, ValueRange::intersects.
- Observation: Inserting[4,5] after[1,3] finds the end iterator and then moves it to the adjacent previous range. Since intersects excludes adjacency, insertion takes the non-merge branch at that previous position, yielding[[4,5],[1,3]]. Reverse insertion leaves two separate ranges. This contradicts the class's ordered/consecutive-merge description and can invalidate a later lower_bound precondition. Twelve witnesses from the unchanged native declarations/function compiled with UBSan confirm the exact value results; no later search on the broken ordering, signed overflow or full document import failure is claimed.
- Preservation: Retain the original lower-bound predicate, previous-adjacency step and intersection/insert order. Do not sort, expand intersection or silently repair adjacency. The local range-set tests match all twelve compiled native witnesses.

### WRITER623: Text media types can override an explicit no-compression setting

- Source: `package/source/zippackage/ZipPackageStream.cxx`, `ZipPackageStream::setPropertyValue`.
- Observation: Setting `Compressed=false` records an explicit outside setting, but a later nonempty `MediaType` containing `text` or equal to `application/vnd.sun.star.oleobject` unconditionally sets compression back to true. Only the non-text fallback checks `m_bCompressedIsSetFromOutside`. This makes an explicit compression request depend on later metadata assignment order; no invalid package output or failed normal document save is established.
- Preservation: Keep the exact branch order and flag updates. Actual package/stream property tests retain false-then-text enabling compression and true-then-image retaining compression. Whole native package commit is not claimed executed by those state tests.

### WRITER624: A trailing-slash folder lookup can cache its parent under the folder path

- Source: `package/source/zippackage/ZipPackage.cxx`, `ZipPackage::getByHierarchicalName`, trailing `bFolder` branch (`m_aRecent[sDirName] = pPrevious`).
- Observation: A fresh tree containing `a.xml` and `dir/a.xml` returns the actual `dir` folder for `dir/`, but records its parent under `dir`. A subsequent `dir/a.xml` cache hit can select the outer `a.xml`. This witness uses ordinary public factory, name, parent and hierarchy operations. No claim is made about a failed complete document import, undefined null-cache domains or native unordered-map layout.
- Preservation: Retain the original parent pointer and lookup/cache-validation order. The actual package-member tests pin the outer selection without injecting private cache state or replacing folder owners.

### WRITER625: Disabling compression can leave a loaded DEFLATED member compressed

- Source: `package/source/zippackage/ZipPackageStream.cxx`, `ZipPackageStream::saveChild`, raw-stream seek prepass, changed-format branch and JPEG special case.
- Observation: The loaded member's raw input is nonseekable. With `Compressed=false`, the prepass does not call `ImplSetStoredData`, raw-copy selection fails for an originally DEFLATED entry, and the ordinary branch does not change its method to STORED. For non-JPEG media the entry is consequently deflated again, despite the explicit false property. A real member of the unchanged `hello.docx` fixture reproduces the DEFLATED output method. No complete native document save or universal byte-identical compression outcome is claimed.
- Preservation: Retain the original seekability checks, method assignment and JPEG-only correction. Tests independently inflate the actual emitted output and retain method8 for this witness. Do not insert an unconditional STORED assignment.

### WRITER626: A new plain stream can retain Size minus one after a successful write

- Source: `package/source/zippackage/ZipPackageStream.cxx`, `saveChild`, `successfullyWritten` and `getPropertyValue`.
- Observation: Before ordinary saving, `m_nOwnStreamOrigSize` is assigned the current entry size. For a new DATA-mode stream this is minus one. Writing corrects the output entry size and copies it back, but `successfullyWritten` does not update that separate property snapshot. Thus the stream's `Size` property remains minus one while its ZIP record and central-directory size contain the actual length. This is a state/property witness; no full package reload failure is established.
- Preservation: Keep the snapshot and success update order unchanged. Actual empty and nonempty stream save tests assert the minus-one property alongside correct entry sizes and independently checked ZIP bytes.

### WRITER627: A no-worker pool task can deadlock when it submits work to the same pool

- Source: `comphelper/source/misc/threadpool.cxx`, `ThreadPool::waitUntilDone`, `shutdownLocked` and `pushTask`.
- Observation: In the explicit no-worker branch, `waitUntilDone` retains `maMutex` while calling `ThreadTask::exec`; `shutdownLocked` also executes tasks under the caller's pool lock. A task that calls `pushTask` on that same pool attempts to acquire the same nonrecursive mutex. The ordinary worker implementation instead unlocks the pool mutex before executing work. This finding follows the original lock scopes; a hanging reentrant task is deliberately not executed by the local tests, and no normal document-operation deadlock is claimed.
- Preservation: Retain the source lock order and no-worker execution scopes. Do not release the pool lock around the callback to repair the suspected issue. The explicit no-worker profile remains distinct from the still-unported shared optimal worker backend.

### WRITER628: InputStream presence can report success without a usable stream

- Source: `unotools/source/misc/mediadescriptor.cxx`, `impl_addInputStream`, initial map-presence branch.
- Observation: The function returns true whenever the InputStream key exists, before checking its type or nonempty interface value. A VOID item or integer therefore reports success although later XInputStream extraction yields no usable input. Public map/function tests reproduce these two value profiles; no normal document import failure is claimed.
- Preservation: Keep presence-only success and leave the descriptor untouched. Do not validate, replace or synthesize a stream in this branch. The actual-input test also retains the same interface and cursor.

### WRITER629: A failed storage catalog read can suppress later validation

- Source: `package/source/xstor/xstorage.cxx`, `OStorage_Impl::ReadContents`, assignment to `m_bListCreated` before the enumeration loop.
- Observation: In OFOPXML mode a genuine package stream named `_rels` triggers the original IOException because relationships require a folder. The list-created flag is already true. A second ReadContents/HasChildren call returns the cached empty catalog without repeating that validation. Actual ZipPackage/ZipPackageFolder owners reproduce this internal storage witness; complete native document import failure is not claimed.
- Preservation: Keep the original flag timing and exception. Do not reset or defer the list-created flag on failure. The same timing also retains previously enumerated rows on later errors.

### WRITER630: A failed package transfer can report an empty backup URL

- Source: `package/source/zippackage/ZipPackage.cxx`, `writeTempFile` and `DisconnectFromTargetAndThrowException_Impl`, and `include/unotools/tempfile.hxx`, `TempFileFastService_Base`.
- Observation: The temporary save uses TempFileFastService, which lacks XPropertySet. On a failed final transfer the throwing query for Uri and RemoveFile is caught, so the subsequent UseBackupException can have an empty TemporaryFileURL even though the package has switched to the temporary stream.
- Preservation: Keep the actual fast temporary stream and original property-query/error order. No backup URL is synthesized.

### WRITER631: Renaming from a catalog row with tombstones can retain the old name

- Source: `package/source/xstor/xstorage.cxx`, `OStorage::renameElement` and its by-value `rVec`.
- Observation: With a removed destination followed by a staged rename into that destination, the destination row contains both the removed record and the renamed element. Renaming that live element again erases it from a copy of the row. Because the copy still contains the removed record, the old map entry remains and both names reach the same live element.
- Preservation: Keep the original catalog decisions and test the aliased lookup before commit or revert. Native duplicate-pointer destruction is undefined. JavaScript teardown releases the actual element once.

### WRITER632: A lazy catalog read can clear staged relationships on a truncated storage

- Source: `package/source/xstor/xstorage.cxx`, `OStorage::setPropertyValue`, `OStorage_Impl::ReadContents` and `OStorage_Impl::Commit`.
- Observation: Setting the `RelationsInfo` property before first opening a truncated storage's catalog succeeds and marks it modified. Commit reads the catalog and clears the staged relationship information. Setting the same property after the catalog has been read persists the relationship part.
- Preservation: Keep the setter independent of catalog loading and retain the first-read TRUNCATE reset. The storage test verifies both orders against actual ZIP output.

### WRITER633: Renaming a closed OFOPXML member can reopen it by the removed name

- Source: `package/source/xstor/xstorage.cxx`, unchanged-member branch of `OStorage_Impl::Commit` and `OStorage_Impl::OpenSubStream`.
- Observation: For a root or already committed folder, the unchanged-member branch removes the old package name and inserts the new one. It then opens the stream for relationship synchronization if no stream owner exists. The lookup still uses the old original name and raises `NoSuchElementException` before the catalog name is updated.
- Preservation: Keep the source lookup and mutation order. The test closes the actual stream owner through Revert and verifies the exception and the intermediate package catalog.

### WRITER634: A disjoint vertical merge continuation can use an earlier group

- Source: `sw/source/core/unocore/unotext.cxx`, `lcl_ApplyCellProperties` and `lcl_MergeCells`.
- Observation: A pending group stays open across an intervening cell without a VerticalMerge property. A new restart with a similar left edge closes the group. In a document with a restart, an ordinary intervening cell, and a later continuation at the same left edge, the latter can still be grouped with the restart.
- Preservation: Retain the original group lifetime, two-unit edge tolerance and signed span assignment. The source ordering is useful for faithfully reading the represented malformed-input case.

### WRITER635: Negative line spacing changes meaning when the same rule is explicit

- Source: `sw/source/writerfilter/dmapper/DomainMapper.cxx`, `LN_CT_PPrBase_spacing`, and `DomainMapper_Impl::SetLineSpacing`.
- Observation: With a negative line height, an explicit exact rule changes the effective mode to minimum. The same exact rule inherited from the paragraph style keeps the effective mode fixed. The declarations use the same height and describe the same exact line rule.
- Preservation: Keep the source negative-height conversion and the explicit-versus-inherited flag. The existing `tdf125469_singleSpacing.docx` fixture exercises both paths.

### WRITER636: Consecutive DOCX list overrides can repeat a level

- Source: `sw/source/filter/ww8/docxattributeoutput.cxx`, `DocxAttributeOutput::OverrideNumberingDefinition`.
- Observation: The cursor advances while emitting gap fillers. Emitting the requested override leaves that cursor at the current level. When a higher level also needs an override, filling the gap can write the previous level a second time using the ordinary level start.
- Preservation: Keep the cursor updates and both output paths in their original order.

### WRITER637: The terminal DOCX section margin assertion is disabled upstream

- Source: `sw/qa/extras/ooxmlexport/ooxmlexport13.cxx`, `testendingSectionProps` and `testTdf124637_sectionMargin`.
- Observation: The terminal-section regression keeps a commented assertion for `SectionLeftMargin` of 2540 mm100 and marks it as a regression associated with tdf124637. The separate tdf124637 fixture expects a zero left margin on its own text section. The disabled assertion leaves the terminal fixture's margin unverified.
- Preservation: Retain native section margin handling. Replaying the disabled assertion requires the content-section model and terminal header/footer ownership.

### WRITER638: DOCX hyperlink output omits a screen tip when a target frame is set

- Source: `sw/source/filter/ww8/docxattributeoutput.cxx`, `DocxAttributeOutput::StartURL`.
- Observation: The hyperlink element can contain both a target frame and a screen tip. The exporter writes the target frame first and writes the screen tip only when the frame is empty.
- Preservation: Keep the original attribute precedence. The fragment-link test opens the actual exported XML and verifies that the target frame survives.

### WRITER639: Paragraph-mark formatting participates in Word list labels

- Source is [checkApplyParagraphMarkFormatToNumbering](../../vendor/libreoffice-reference/sw/source/core/text/txtfld.cxx).
- Observation. The source notes an apparent discrepancy between the OOXML purpose of `w:pPr/w:rPr` and Word rendering. Word also applies these properties to the numbering label. LibreOffice gives list-level character formatting precedence and excludes the marker underline and escapement.
- Preservation. Keep the native setting and the represented precedence. The original fixtures keep a red label or a green normal-weight label next to bold text after an ODT round trip. [Marker format regression tests](../../apps/office/src/sw/source/filter/ww8/docx-paragraph-marker.test.ts).


### WRITER-640 — Relationship XML diagnostics repeat the storage directory

Status: suspicious diagnostic identifier. Source expressions verified and the
result reproduced through the registered SAX service.

The upstream root storage reader passes `_rels/.rels` to the package helper.
The stream storage reader likewise passes `_rels/*.rels`. The helper prepends
`_rels/` before setting `InputSource.sSystemId`. A parse error in root
relationship metadata therefore reports `_rels/_rels/.rels` while the
actual ZIP entry is `_rels/.rels`. The string labels the parser input and the
ZIP lookup uses its own path. The duplication may be intended as an internal
diagnostic convention.

The port preserves both diagnostic identifiers. A registered-service test
asserts the root identifier on the resulting `SAXParseException`.

- [Storage root caller](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L500)
- [Per-stream caller](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/owriteablestream.cxx#L914)
- [Package helper](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/comphelper/source/xml/ofopxmlhelper.cxx#L81)
- [Registered parser regression](../../apps/office/src/sax/source/expatwrap/sax_expat.test.ts)


### WRITER-641 — Malformed original relationship streams have different retry rules

Status: suspicious distinction between storage and part relationships. Source
behavior reproduced using malformed relationship parts in a real OOXML package.

`OStorage_Impl::ReadRelInfoIfNecessary` leaves `RELINFO_NO_INIT` when parsing
the original root relationship stream throws a UNO exception. Each later
getter opens and parses the original stream again. `OWriteStream_Impl` marks
the original part's stream `RELINFO_BROKEN` and retains that state. A malformed
replacement root relationship stream instead becomes `RELINFO_CHANGED_BROKEN`,
and its commit fails. All three getters report `Wrong relinfo stream!`.
The part stream can be nonseekable, which may account for its different retry
policy.

The port retains the original transition and failure at each call site. Tests
read the same malformed root and part twice, exercise failed commit of a staged
malformed replacement, and verify that reverting a change permits reading again.

- [Storage owner](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L487)
- [Part stream owner](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/owriteablestream.cxx#L903)
- [Native storage regression](../../apps/office/src/package/source/xstor/xstorage.relations.test.ts)


### WRITER-642 — Custom document property stream getter prepends empty references

Status: source observation. The importer stream getter is pending in the port.

`DocumentPropertiesImport::getCustomPropertiesStreams` constructs a vector of
size `N` before appending all `N` stream references. A package with one custom
properties part therefore produces two entries, with an empty UNO reference
first. The separate `importProperties` method iterates the original streams
directly. Caller impact from the getter remains unverified.

Preserve the leading empty references when porting the getter.

- [Original stream getter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/docprop/ooxmldocpropimport.cxx#L205)
- [Original import loop](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/docprop/ooxmldocpropimport.cxx#L177)


### WRITER-643 — Storage reports children after all visible entries are removed

Status: source behavior reproduced using persisted entries staged for removal.

`OStorage_Impl::HasChildren` checks whether the catalog map is empty.
`OStorage_Impl::GetElementNames` skips removed entries. Removing every
persisted element can therefore leave `OStorage::hasElements()` returning
true while `getElementNames()` returns an empty sequence. The catalog keeps
removed entries to apply those mutations during commit.

The port retains this distinction and tests both internal results before commit.

- [Original presence check](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L453)
- [Original name enumeration](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L1457)


### WRITER-644 — Seekable sibling readers share the cached part's position

Status: source behavior reproduced over two attached seekable readers.

`OWriteStream_Impl::GetTempFileAsInputStream` returns the same memory cache's
input facet when present, and `OInputSeekStream` seeks that facet directly.
Two seekable wrappers on one small part therefore share a position. A seek
through one wrapper changes the other's next-read offset. The port retains
the shared input identity and tests both directions.

- [Original cache input selection](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/owriteablestream.cxx#L584)
- [Original seekable input wrapper](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/oseekinstream.cxx)


### WRITER-645 — StorageFactory distinguishes empty bytes from an empty ZIP

Status: source admission difference reproduced through the registered factory.

`CheckPackageSignature_Impl` accepts a zero-length stream for storage creation.
A nonempty stream must begin with a local-file header. It therefore refuses an
otherwise conventional empty ZIP containing only its end-of-central-directory
record. This check runs before ZIP directory parsing, independently of that
reader's separate empty-archive restriction.

The port preserves the storage creation admission and local-header test.

- [Original factory signature check](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xfactory.cxx#L43)
- [Factory regression](../../apps/office/src/package/source/xstor/xfactory.test.ts)

### WRITER-646 — Private stream transfer can report success after a write fails

Status: source result reproduced through the original medium descriptor and a
caller-owned output stream.

`SfxMedium::Transfer_Impl` catches and discards UNO exceptions while copying
the temporary package to an `OutputStream` at a `private:stream` URL.
`SfxMedium::Commit` then returns based on the retained medium error. If the
copy fails with no previously reported error, `Commit` can return true even
though the caller did not receive the complete package. A missing output
stream takes a distinct branch that sets the general I/O error.

- [Original transfer branch](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sfx2/source/doc/docfile.cxx#L2476-L2528)
- [Medium regression](../../apps/office/src/sfx2/source/doc/docfile.storage.test.ts)

### WRITER-647 — Lazy truncation can discard an already accepted root relationship stream

Status: source ordering preserved. A filter export regression verifies the
catalog is initialized before accepting the root relationship stream.

A direct `RelationsInfoStream` assignment to a root opened with `TRUNCATE`
sets the pending relationship stream. The initial `ReadContents` call
unconditionally clears that value and changes the relationship status. If the
caller assigns the property first, a later child open or commit can erase it.
The export binding forces catalog initialization before assigning the property,
as the relationship lookup in the source filter does before inserting a row.

- [Original storage initialization](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L591-L600)
- [Original root property setter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L4361-L4382)
- [Filter regression](../../apps/office/src/oox/source/core/xmlfilterbase.test.ts)

### WRITER-648 — Writable stream RelationsInfo replaces rows without marking them changed

Status: source property assignment preserved.

`OWriteStream::setPropertyValue("RelationsInfo")` extracts into the pending
relationship rows, but this branch does not change the relationship status.
The commit reads that status to determine whether to produce a relationship
member, so setting the property alone can leave the member unchanged. The
seekable `RelationsInfoStream` property takes a distinct path that sets
`RELINFO_CHANGED_STREAM`. The export binding uses that property.

- [Original writable stream property setter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/owriteablestream.cxx#L2715-L2737)
- [Original per-part relationship commit](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/owriteablestream.cxx#L1419-L1499)

### WRITER-649 — Raw STORED member reads bypass per-stream CRC

Status: original native read mode retained. Browser admission regression
checks payload CRC before passing the immutable package to native storage.

`ZipFile::getInputStream` uses the raw stream mode for a STORED member.
`XUnbufferedStream::readBytes` tests the CRC for decoded data and wrapped
raw streams, so an ordinary raw STORED member can deliver bytes with a
bad CRC. The browser importer keeps CRC verification at its package
admission boundary before using the native ZIP reader.

- [Original raw mode selection](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/zipapi/ZipFile.cxx#L833)
- [Original CRC condition](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/zipapi/XUnbufferedStream.cxx#L295-L309)
- [Browser admission regression](../../apps/office/src/package/source/zippackage/native-archive-admission.test.ts)

### WRITER-650 — Storage relationship mutations leave the modification flag unchanged

Status: source staging behavior retained.

The `XRelationshipAccess` mutations on `OStorage` replace the relationship
value and set its relationship status to changed. These methods do not set
the storage's separate modification flag. A relationship-only change after a
successful transaction can therefore be skipped by the early return in
`OStorage_Impl::Commit` when no other operation dirties the storage. The
`XPropertySet` relationship property has a distinct modification path.

- [Original early return](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L938-L943)
- [Original relationship mutation](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/xstor/xstorage.cxx#L4740-L4785)

### WRITER-651 — ZipStorage discards transaction failures

Status: original default retained. The browser export requests error propagation.

`ZipStorage::implCommit` catches `uno::Exception` and emits a diagnostic without
returning or throwing the error. A failed child transaction can therefore be
followed by a root commit. The browser export requests propagation through the
same child-first traversal so its Save or Download command receives the failure.

- [Original commit](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/helper/zipstorage.cxx#L189-L200)
- [Disposed child regression](../../apps/office/src/oox/source/helper/native-storage.test.ts)

### WRITER-652 — Block DEFLATE treats `available()` as end of input

Status: source read and finish conditions retained.

`ThreadedDeflater::deflateWrite` stops reading and marks its last block when
`XInputStream::available()` reaches zero. The UNO interface reports the
amount readable without blocking, so a nonseekable stream can temporarily
return zero before EOF. Seekable package-part inputs report their remaining
bytes and can use the block writer without that ambiguity.

- [Original block loop](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/package/source/zipapi/ThreadedDeflater.cxx#L89-L113)
- [Original `available()` contract](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/udkapi/com/sun/star/io/XInputStream.idl#L108-L116)

### WRITER-653 — Contextual alternates lose their explicit value on DOCX export

The Word 2010 `CT_OnOff` factory delivers `cntxtAlts` as a scalar SPRM.
The domain mapper passes it through the nested-property handler, which
pushes another `cntxtAlts` and returns when the scalar has no properties.
Finalizing the native grab bag adds that empty child to its parent. The
exporter consequently writes `<w14:cntxtAlts><w14:cntxtAlts/></w14:cntxtAlts>`
even for an explicit `w14:val="0"`. Writer preserves the pinned source
behavior.

- [Original scalar factory](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/ooxml/model.xml#L5288-L5295)
- [Original mapper fallback](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/DomainMapper.cxx#L3758-L3763)
- [Original nested-property handling](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/TextEffectsHandler.cxx#L759-L790)
- [Original grab bag closure](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/helper/grabbagstack.cxx#L34-L43)
- [Original recursive XML output](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxattributeoutput.cxx#L3638-L3658)

### WRITER-654 — Missing compatibility attributes inherit the preceding row

The Word settings importer allocates three current property slots once.
Attribute handlers replace only the slots present in the next
`w:compatSetting`. The modifier handler copies the current sequence into the
document data without clearing it. A following row with only `w:val="14"`
therefore reuses the previous name and URI. Writer preserves this behavior
when reading the same input.

- [Original initial slot allocation](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/SettingsTable.cxx#L110-L119)
- [Original attribute assignment](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/SettingsTable.cxx#L207-L221)
- [Original row handling](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/SettingsTable.cxx#L364-L374)

### WRITER-655 — Compatibility export normalizes same-name rows from other URIs

The compatibility mode reader considers only rows whose name is
`compatibilityMode` and whose URI is `http://schemas.microsoft.com/office/word`.
Once that mode is selected, the exporter replaces the value of every row
named `compatibilityMode`, including rows with a different URI. The
serializer retains the foreign URI with the overwritten value.

- [Original mode selection](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxexport.cxx#L2363-L2394)
- [Original row output](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxexport.cxx#L1631-L1657)

### WRITER-656 — A rejected scalar text-default value still completes the setter

`SwXTextDefaults::setPropertyValue` clones the existing item, calls
`PutValue` and passes the clone to `SwDoc::SetDefault`. The return value
from `PutValue` is ignored. For example, setting `TabStopDistance` to
zero leaves the prior distance in place and returns normally. Writer
retains the same call sequence for the tab-distance property.

- [Original text defaults setter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/core/unocore/SwXTextDefaults.cxx#L113-L120)

### WRITER-657 — Equal custom tab entries can produce an empty DOCX tab list

The exporter compares entire tab items and then compares their individual
stops before writing the difference. The entire-item comparison includes
the default-distance field, but the stop comparison does not. A direct
tab item and its parent style can have identical custom positions and
different default distances. The exporter opens and closes `w:tabs`
without writing any children in that case. Writer keeps that behavior.

- [Original item comparison](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/editeng/source/items/paraitem.cxx#L1185-L1200)
- [Original tab export](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxattributeoutput.cxx#L9520-L9595)

### WRITER-658 — Import can turn on a header or footer exported as hidden

The ODF exporter writes `style:display="false"` when an inactive header or
footer still has text. The master-page importer ignores that attribute
and turns the header or footer on when it encounters content. An empty
first-page variant can also turn off an already imported ordinary
header or footer. Writer retains both source decisions.

- [Original hidden-header output](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/xmloff/source/text/XMLTextMasterPageExport.cxx#L147-L155)
- [Original import and empty-variant handling](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/xmloff/source/text/XMLTextHeaderFooterContext.cxx#L117-L186)
- [Writer regression](../../apps/office/src/sw/source/filter/xml/odt-page-stories.test.ts)

### WRITER-659 — Solid RGB text fill retains the fallback run color

`TextFillHandler::updateComplexColor` prefers `srgbClr` when both solid-fill color choices are present. In the RGB case it reads the transformations without assigning the RGB value itself. The separate `w:color` value remains the run color even if it differs from the solid fill's RGB value. The DOCX import preserves this behavior.

- [Original solid-fill color selection](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/TextEffectsHandler.cxx#L888-L982)
- [Writer regression](../../apps/office/src/sw/source/writerfilter/filter/WriterFilter.test.ts)

### WRITER-660 — Word text scenes discard camera rotation

The Word 2010 text-effect model declares only the preset attribute under
`w14:camera`. The sibling `w14:lightRig` exposes the spherical rotation
resource to the importer. A rotation under the Word text camera therefore
disappears when the scene is saved again, while a light rotation survives.
Writer retains this source behavior.

- [Original Word 2010 camera and light definitions](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/ooxml/model.xml#L4644-L4658)
- [Original text-effect property mapping](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/TextEffectsHandler.cxx#L65-L73)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxexport.text-effects.test.ts)

### WRITER-661 — Word page borders lose first-page selection and stacking order

The Word page-border grammar admits `display` and `zOrder`. The native page
border handler reads `display`, but `ApplyBorderToPageStyles` ignores the
selection and applies the box to the section page style. The export always
writes `allPages`. The handler also has no case for `zOrder`. Writer
preserves these decisions.

- [Original page border handler](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/PageBordersHandler.cxx#L45-L88)
- [Original page style application](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/PropertyMap.cxx#L630-L702)
- [Original section page border output](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxattributeoutput.cxx#L7615-L7623)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxattributeoutput.borders.test.ts)

### WRITER-662 — Word page shadow import depends only on the right border

The section map records shadow flags for all four sides, then checks only the
right side when it creates the Writer page shadow. A shadow flag on another
side alone disappears on round trip. A right-side flag becomes a black
bottom-right shadow and exports a shadow flag on every emitted border line.
Writer retains this source behavior.

- [Original page style shadow conversion](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/PropertyMap.cxx#L698-L719)
- [Original border shadow output](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxattributeoutput.cxx#L4819-L4844)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxattributeoutput.borders.test.ts)

### WRITER-663 — Extra ODF shadow offsets replace the first offset

The ODF shadow handler tests an offset-found flag but never sets it. Each
additional pair of lengths replaces the location and width derived from the
preceding pair. The port retains that behavior, including an unpaired final
length using zero for its second coordinate.

- [Original shadow value parser](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/xmloff/source/style/shadwhdl.cxx#L43-L116)
- [Regression](../../apps/office/src/xmloff/source/style/shadwhdl.test.ts)

### WRITER-664 — Word's variable story height fallback reads the opposite UL margin

With dynamic spacing disabled and no layout rectangle, Word export estimates
the height of a variable header or footer as 274 twips plus UL spacing.
`CalcHdDist` reads the header's upper spacing, and `CalcFtDist` reads the
footer's lower spacing. The UNO body-distance properties map to the opposite
sides. Writer preserves the source fallback and its distinction from fixed
and minimum heights.

- [Original Word distance calculation](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/writerwordglue.cxx#L61-L106)
- [Original page-style property map](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/core/unocore/unomap1.cxx#L508-L542)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxexport.page-stories.test.ts)

### WRITER-665 — Resetting a nested page-story property targets the page master

The UNO page-style setter resolves the header or footer item set when
setting a nested story property. The inherited `setPropertiesToDefault`
resolves the page master as the target format and resets the property
WhichId there. Resetting a header body distance can therefore reset page
UL spacing while leaving the header's own distance in place. Writer retains
the source distinction.

- [Original nested setter](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/core/unocore/unostyle.cxx#L2983-L3050)
- [Original reset implementation](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/core/unocore/unostyle.cxx#L2732-L2784)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxexport.page-stories.test.ts)

### WRITER-666 — A false Word building-block uniqueness flag is exported as true

The OOXML importer represents `w:docPartUnique` as a boolean. The domain
mapper asks the corresponding value for a string, which is empty for a boolean.
When it reads the interoperability record, the Word exporter converts the
empty string to `true`. Writer retains this behavior when round-tripping
an explicit `w:docPartUnique w:val="0"`.

- [Original Word building-block property mapping](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/dmapper/DomainMapper.cxx#L3674-L3688)
- [Original OOXML value string conversion](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/writerfilter/ooxml/OOXMLPropertySet.cxx#L133-L141)
- [Original Word output normalization](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/sw/source/filter/ww8/docxattributeoutput.cxx#L1090-L1097)
- [Writer regression](../../apps/office/src/sw/source/filter/ww8/docxexport.page-stories.test.ts)

### WRITER-667 — VML rounds negative EMU lengths toward zero

The measure decoder adds 0.5 before converting to a signed integer. This
makes a negative whole-point input of `-1pt` become `-12699` EMU, whereas
`1pt` becomes `12700` EMU. An unrecognized two-character suffix also keeps
the raw value as EMU, bypassing the reference fallback used for other unknown
suffix lengths. The VML converter preserves both decisions.

- [Original measure conversion](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/vml/vmlformatting.cxx#L154-L210)
- [VML conversion regression](../../apps/office/src/oox/source/vml/vmlshape.test.ts)

### WRITER-668 — VML fit-to-text enables automatic height when its style value is false

The VML style context tests for a nonempty `mso-fit-shape-to-text` declaration
and unconditionally enables automatic height. The value `false` therefore
has the same effect as `true`. The shape type retains that source decision.

- [Original VML style parsing](https://github.com/LibreOffice/core/blob/9bc445578031fecf56086729d8e4940c77e14d65/oox/source/vml/vmlshapecontext.cxx#L527-L563)
- [VML style regression](../../apps/office/src/oox/source/vml/vmlshape.test.ts)

### WRITER-669 — Eleven consecutive DOCX header rows disable all repetition

Writer's DOCX table mapper accepts at most ten consecutive leading
`w:tblHeader` rows. Reading an eleventh clears `HeaderRowCount` and prevents
subsequent rows from restoring it. The source identifies this fixed limit as
a workaround for Word's suppression of repeated headers that exceed the
available page area. The implementation keeps the row-count cutoff regardless
of row heights or page geometry.

- [Original table mapper](../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/DomainMapperTableManager.cxx)
- [Original tdf58944 regression](../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/ooxmlexport26.cxx)

### WRITER-670 — Word export assigns a row split item during serialization

For a simple one-row table with layout splitting disabled and no table keep
flag, the Word exporter writes a row split item into the connected row's
frame format while visiting the first paragraph of the first cell.
`DocxAttributeOutput::TableCanSplit` then consumes that item. The source
performs this assignment on the live row, even though it is needed to
project `w:cantSplit` into the file. The browser exporter applies the same
split condition to the emitted row property and retains its active
document's original row format.

- [Original one-row export condition](../../vendor/libreoffice-reference/sw/source/filter/ww8/wrtw8nds.cxx)
- [Original tdf101589 regression](../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/ooxmlexport3.cxx)

### WRITER-671 — A false conditional table-style header enables repetition

The DOCX table-style handler inserts a header row count of one when it sees
`w:tblHeader` inside a conditional row style. It does so even when the element
explicitly sets `w:val="0"`. The first-row style can therefore enable
repetition when the table look activates it. A direct false property on the
first row still takes precedence. The mapper preserves both rules.

- [Original conditional table-style handler](../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/TblStylePrHandler.cxx)
- [Original first-row style application](../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/DomainMapperTableHandler.cxx)
- [Writer table flow regression](../../apps/office/src/sw/source/filter/ww8/docxexport.table-flow.test.ts)

### WRITER-672 — DOCX export counts headers in any conditional style group

`DocxTableStyleExport` tracks styles for the explicit first-row false
override. Its row-property writer records the style ID whenever it emits
`tblHeader`, including for a conditional group that applies to other rows.
A table using that style with first-row look enabled can therefore receive
`w:tblHeader w:val="false"` even if the style's header belongs to another
conditional group. The export keeps this source behavior.

- [Original conditional row writer](../../vendor/libreoffice-reference/sw/source/filter/ww8/docxtablestyleexport.cxx)
- [Original first-row output](../../vendor/libreoffice-reference/sw/source/filter/ww8/docxattributeoutput.cxx)

### WRITER-673 — A missing table look can omit the explicit header override

DOCX import uses `0x04A0` as the default table look even when the source
omits `w:tblLook`. This enables a conditional first-row style. The exporter
consults the stored table look property before writing the explicit false
header override. If the source omitted the element, clearing the repeat count
can therefore export a table whose style enables repetition again. The
exporter retains the source condition on the stored property.

- [Original table look default](../../vendor/libreoffice-reference/sw/source/writerfilter/dmapper/DomainMapperTableHandler.cxx)
- [Original header override lookup](../../vendor/libreoffice-reference/sw/source/filter/ww8/docxattributeoutput.cxx)

### WRITER-674 — Writer row repeats and cell defaults use the style namespace

Pinned `SwXMLTableRowContext_Impl` reads `style:number-rows-repeated` and
`style:default-cell-style-name`. The same local names in the table namespace
do not trigger either branch. Calc's row importer reads both attributes in
the table namespace. Writer keeps the source token checks and tests both forms
with separate rows in an ODT round trip.

- [Writer row import](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L795)
- [Calc row import](../../vendor/libreoffice-reference/sc/source/filter/xml/xmlrowi.cxx#L72)

### WRITER-675 — The table cell fallback requires a column default declaration

Pinned `SwXMLTableContext::InsertCell` consults the table-wide default only
when the column default list exists. `InsertColumn` first creates that list
on a nonempty column default. A column without its own default can therefore
receive different formatting when an unrelated column declares one. The
Writer filter preserves the conditional lookup and the regression verifies
the direct brushes after package save and reopen.

- [Column default list initialization](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1325)
- [Cell default selection](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1456)

### WRITER-676 — Oversized table merges are clipped before the grid-growth branch

`SwXMLTableContext::InsertCell` truncates the requested span to the
declared column count, then truncates it again at the first occupied slot
in the row. The subsequent condition for growing the column grid cannot
be reached through this path. The Writer regression verifies both truncation
points in one authored table and checks that export retains the admitted grid.

- [Original span normalization](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1402)

### WRITER-677 — Unstyled covered markers leave the compatibility cursor in place

The native covered-cell context calls `InsertCoveredCell` only when the
marker has a nonempty style name. With `TableRowKeep` enabled, a styled
marker after an unstyled marker can therefore apply to an earlier
covered slot. The filter keeps the independent compatibility cursor. A
regression verifies this behavior and the pinned border fixture verifies
explicit covered styling through package export.

- [Original covered-cell context](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L847)
- [Original compatibility cursor](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1491)

### WRITER-678 — Writer can export more equal columns than a single import repeat accepts

`SwXMLExport::ExportTableLines` emits one repeat count per consecutive run
of equal column styles. The column import context replaces counts above
256 with one. The Writer filter retains both original rules.

- [Original column repeat export](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltble.cxx#L1038)
- [Original column repeat import](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L672)

### WRITER-679 — Writer rejects the maximum double as an imported table-cell value

Writer uses `DBL_MAX` internally to signal a faulty table expression.
The ODT cell importer rejects that serialized numeric value. Resolving
an explicit missing box in the formula reproduces the calculation
error and replaces any stale numeric text with the error presentation.
The Writer regression
uses the original `tdf139126.odt` and checks both the valid and failed
formulas across import, Worker transfer and export.

- [Original ODF value admission](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L433)
- [Original table formula syntax error](../../vendor/libreoffice-reference/sw/source/core/fields/cellfml.cxx#L422)
- [Original error presentation](../../vendor/libreoffice-reference/sw/source/core/table/swtable.cxx#L2694)
- [Original ODT regression](../../vendor/libreoffice-reference/sw/qa/extras/odfexport/odfexport.cxx#L244)

### WRITER-680 — Writer reads numeric values without matching the declared value type

A cell's numeric, duration, date and boolean attributes can set the
same cached value independently of its declared ODF value type. Each
successfully parsed attribute replaces the preceding value in XML
attribute order. The string type check applies specifically to
`office:string-value`, which supplies the cell text in place of its
child elements. The filter preserves both source rules.

- [Original cell attribute dispatch](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L433)
- [Original string-override decision](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L570)

### WRITER-681 — A General zero can be treated as broken text during table import

A styled cell with a General number format, a cached zero and no
formula loses its numeric items if it contains several nodes or its
single text node is longer than ten characters or lacks the character
`0`. Writer preserves the visible text and the source heuristic.

- [Original numeric-content rescue](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1911)

### WRITER-682 — Missing integer digits override automatic decimal selection

For a plain ODF number style without either digit count, the shared data
style context first selects General for automatic decimal places and
then replaces it with the locale's system number format for automatic
integer digits. Writer and Calc retain that order.

- [Original automatic number format selection](../../vendor/libreoffice-reference/xmloff/source/style/xmlnumfi.cxx#L1627)

### WRITER-683 — The effective box style and cell paragraph default can differ

A column or row default can supply the physical cell style without
supplying its paragraph and text properties. The cell context changes
the text import default only for its own explicit style name. A nested
cell without that attribute therefore inherits the outer cell paragraph
default while resolving its physical style independently. For a cell
populated from `office:string-value`, the section creation path uses
the explicit cell style alone.

- [Original cell context and paragraph default](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L392)
- [Original physical style fallback](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L1460)
- [Original string-value section style application](../../vendor/libreoffice-reference/sw/source/filter/xml/xmltbli.cxx#L2722)

### WRITER-684 — A paragraph style assignment can discard cell text formatting

The paragraph context applies the cell paragraph default, then applies
the paragraph's own style and direct attributes. If that second style
has a named parent, the normal paragraph collection change resets
existing direct paragraph items, including character items represented
at paragraph scope. An automatic paragraph style with no parent
applies its authored properties without that collection change.

- [Original two calls in paragraph import](../../vendor/libreoffice-reference/xmloff/source/text/txtparai.cxx#L1738)
- [Original automatic-style parent lookup and assignment](../../vendor/libreoffice-reference/xmloff/source/text/txtimp.cxx#L1036)
- [Original paragraph collection reset flags](../../vendor/libreoffice-reference/sw/inc/doc.hxx#L832)

### WRITER-685 — Reconfiguring TextSearch can retain an earlier Japanese complex query

- Upstream: `i18npool/source/search/textsearch.cxx`, `TextSearch::setOptions2`,
  `searchForward` and `searchBackward` at the pinned baseline.
- Observation: `setOptions2` clears the jump-table and wildcard caches but only
  loads or replaces `xTranslit2` when the new options contain complex flags.
  It leaves the previous complex transliterator and key in place otherwise.
  Subsequent non-regex searches can therefore return a match for the previous
  complex query. For example, initialize with `ハ` and the Ba/Fa equivalence,
  then change the query to `q` with zero flags and search `xファ`.
- Preserve the retained second pass when the same backend instance is
  reconfigured. The Writer options-based wrapper uses a fresh backend when
  options change, as exercised separately by its cache contract.

### WRITER-686 — The complex Japanese pass excludes the ordinary ignore-width flag

- Upstream: `i18npool/source/search/textsearch.cxx`, `maskComplexTrans` at the
  pinned baseline.
- Observation: the comment says width conversion also takes effect in the
  complex pass, but the mask includes `FULLWIDTH_HALFWIDTH`, an older
  conversion value distinct from the `IGNORE_WIDTH` bit set by the Japanese
  search options. The ordinary ignore-width flag participates in the primary
  pass only.
- Preserve the source mask for the complex pass and run the configured primary
  pass independently.

### WRITER-687 — Similarity search can extend a selection to the script boundary

- Upstream: `sw/source/core/crsr/findtxt.cxx`, model-text approximate-search
  branch at the pinned baseline.
- Observation: the loop saves the original range end as `nStringEnd` for its
  continuation test, then assigns the full script transition to `nEnd` before
  invoking the matcher. The first call can search past a range ending inside
  the same script. For example, searching `abc def` in the range `[0,3)` for
  `def` with zero similarity tolerances can report `[4,7)`.
- Preserve the script-transition argument and cover the resulting source
  offsets on an actual Writer text node.

### WRITER-688 — A moved caret can retain the extra-area search phase

- Upstream: `sw/source/uibase/uiview/viewsrch.cxx`, `SwView::SearchAndWrap`
  and `SwView::FUNC_Search` at the pinned baseline.
- Observation: after a single search succeeds in an extra area, `s_bExtra`
  remains true. Moving the caret into the main text does not reset that
  flag. The next search starts in `InOther` even when the caret is at a
  body match. Find All and Replace All reset the flag on entry.
- Preserve the phase in the browser view owner and cover the observable
  ordering with an anchored text frame and a body match. The evidence is
  source-derived and does not claim a compiled native differential.

### WRITER-689 — The no-wrap decision can predate a change of search origin

- Upstream: `sw/source/uibase/uiview/viewsrch.cxx`, `SwSearchOptions` and
  `SwView::SearchAndWrap` at the pinned baseline.
- Observation: the options constructor computes `bDontWrap` from the cursor
  before `SearchAndWrap` normalizes the selection. A reversed selection with
  its point at the start of the document can therefore suppress forward
  wrap even though normalization advances the search start to the other
  end of the selection.
- Preserve the initial boundary decision and the normalized cursor after
  the unsuccessful pass. A subsequent forward search from that cursor
  can wrap. The browser regression exercises this source ordering.

### WRITER-690 — A failed selection-only search can set the extra-area flag

- Upstream: `sw/source/uibase/uiview/viewsrch.cxx`, `SwView::SearchAndWrap`
  and `SwView::FUNC_Search` at the pinned baseline.
- Observation: `FUNC_Search` uses `InSel` for both passes when selection-only
  is on. If the first pass misses, `SearchAndWrap` still flips `s_bExtra`.
  A later miss that entered with this flag set can clear the current mark
  and move the point to the document boundary before retrying `InSel`.
  Matches outside the selection remain excluded.
- Preserve the shared flag, the restored cursor on wrap, and the resulting
  mark and point. The browser regression covers the source-derived order
  through the modeless dialog.

### WRITER-691 — A zero-result Replace All can leave Find All as the last command

- Upstream: `sw/source/uibase/uiview/viewsrch.cxx`, `SwView::ExecSearch`
  and `SwView::SearchAndWrap` at the pinned baseline.
- Observation: the zero-result Replace All branch returns before committing
  `m_eLastSearchCommand`. A following single search can still perform the
  repositioning normally associated with Find All.
- Preserve this command-state distinction. This observation is based on
  source control flow.

### WRITER-692 — Find Bar buttons and keyboard activation remember different queries

- Upstream: `svx/source/tbxctrls/tbunosearchcontrollers.cxx`,
  `FindTextFieldControl::ActivateFind`, `UpDownSearchToolboxController::execute`,
  `FindAllToolboxController::execute`, and
  `FindTextFieldControl::SetTextToSelected_Impl` at the pinned baseline.
- Observation: Next and Previous append to the toolbar history without
  changing the remembered activation string. Find All does neither.
  With no selection, reopening Find Bar prefers the last keyboard-activated
  query over the most recent history item.
- Preserve the separate updates and verify them together through the
  Writer toolbar. This observation is based on source control flow.

### WRITER-693 — Replace All can count style matches when the replacement is missing

- Upstream: `sw/source/uibase/wrtsh/select.cxx`, `SwWrtShell::SearchTempl`;
  `sw/source/uibase/uiview/viewsrch.cxx`, `SwView::ExecSearch` and
  `SwView::Replace`; `sw/source/core/crsr/findcoll.cxx`,
  `SwFindParaFormatColl::DoFind` at the pinned baseline.
- Observation: if the requested replacement style cannot be resolved,
  style Replace All searches with a null replacement collection. It
  returns the number of matches to the replacement feedback even though
  it did not change their styles. Single Replace goes through
  `SwEditShell::SetTextFormatColl`, which uses the default collection
  when its argument is null.
- Preserve the separate paths and test them at the Writer view command
  boundary. The evidence is source-derived.

### WRITER-694 — A favourite built-in style can bypass hidden-style filtering

- Upstream: `sw/source/uibase/app/docstyle.cxx`,
  `SwStyleSheetIterator::First` and `SwStyleSheetIterator::AppendStyleList`;
  `svx/source/dialog/srchdlg.cxx`, `SvxSearchDialog::TemplatesChanged_Impl`
  at the pinned baseline.
- Observation: the document-style enumeration omits a hidden style that
  is unused. The built-in pool enumeration can append that name again
  because its favourite flag bypasses the visibility check. The dialog
  still requires use before putting it in the search-style selector.
- Preserve its availability for replacement and its absence from the
  search selector. This observation is based on source control flow.

### WRITER-695 — Style replacement checks protected frames at the selection endpoints

- Upstream: `sw/source/core/crsr/pam.cxx`, `SwPaM::HasReadonlySel`;
  `sw/source/core/edit/edfcol.cxx`, `SwEditShell::SetTextFormatColl`;
  `sw/source/core/doc/docfmt.cxx`, `SwDoc::SetTextFormatColl`.
- Observation: the range check tests frame protection at the point and
  mark and has a separate interior scan for protected section formats.
  It does not perform the same scan for protected table cells wholly
  inside the range. If such a range reaches the edit-shell command with
  editable endpoints, the style-application loop visits its interior
  text nodes.
- Preserve the endpoint admission for single style replacement in the
  represented table and fly profile. Bulk style replacement checks the
  individual match. This finding is source-derived.

### WRITER-696 — Editing the dialog can clear its entry error while retaining its old message

- Upstream: `svx/source/dialog/srchdlg.cxx`,
  `SvxSearchDialog::SetModifyFlag_Impl` and
  `SvxSearchDialogWrapper::GetSearchLabel` at the pinned baseline.
- Observation: editing the search entry directly resets its message type.
  The shared label is cleared only if the wrapper reads a nonempty
  label from the Find Bar. A closed toolbar yields an empty string from
  that query even when the dialog still shows a previous message.
- Preserve the independent entry state and the status row. The evidence
  is source-derived and covered through the Writer search UI.

### WRITER-697 — Named argument admission depends on the last recognized member

- Upstream: `sfx2/source/appl/appuno.cxx`, `TransformParameters`, complex
  formal argument with individually named members.
- Observation: the loop replaces the conversion status for each recognized
  member. A trailing malformed member suppresses the assembled item even
  after earlier members converted. The same malformed member listed before
  a valid member can leave the assembled item admitted, with defaults for
  the member that failed. Unrecognized names do not change that status.
- Writer preserves this ordering for the represented `SearchItem.*` members
  of `.uno:ExecuteSearch`. This observation applies to the shared Sfx
  source. Calc-side dispatch was not changed in this checkpoint.

### WRITER-698 — Failed aggregate SearchItem conversion retains successful writes

- Upstream: `svl/source/items/srchitem.cxx`, `SvxSearchItem::PutValue`,
  member zero with a thirteen-property sequence.
- Observation: each successfully converted property updates the item
  before the source counts the distinct successful names. A duplicate or
  malformed entry may make the function return false after changing the
  other properties.
- The shared item preserves the mutation order. The Writer dispatcher
  admits an aggregate argument only when conversion reports success.

### WRITER-699 — The Highlighting search page can miss an identical visible highlight

- Upstream: `cui/source/dialogs/srchxtra.cxx` configures the search Format
  dialog with `SHOW_HIGHLIGHTING`. `SvxBkgTabPage` in
  `cui/source/tabpages/backgrnd.cxx` reads and writes `SID_ATTR_BRUSH_CHAR`,
  whose Writer pool item is `RES_CHRATR_BACKGROUND`.
- Observation: `SwTextPaintInfo::DrawBackground` in
  `sw/source/core/text/inftxt.cxx` paints a nontransparent
  `RES_CHRATR_HIGHLIGHT` before considering `RES_CHRATR_BACKGROUND`.
  `FindAttrsImpl` and `CmpAttr` in `sw/source/core/crsr/findattr.cxx`
  compare the requested WhichId. A run with only the separate highlight
  item can therefore look identical to a run with the background brush
  and be absent from the same Highlighting query.
- Writer preserves the separate WhichIds and the display precedence.
  The browser regression exercises identical effective colors and different
  native item families. The original desktop behavior is source-derived.

### WRITER-700 — A paragraph-format search can find text beyond the selected substring

- Upstream: `sw/source/core/crsr/findattr.cxx`, `FindAttrsImpl` and
  `SwFindParaAttr::DoFind`, and `sw/source/core/crsr/pam.cxx`, `GetNode`.
- Observation: `GetNode` admits a paragraph intersecting the search range.
  The paragraph-only `OtherSet` branch keeps the directional starting
  endpoint and sets the other endpoint to the paragraph edge. The
  subsequent text search receives that candidate range. In a centered
  paragraph containing `red word`, a forward search for `word` with only
  `red` selected can return the word outside the original selection.
  A backward search can similarly extend to the paragraph start.
- Writer retains both directional endpoints for the represented
  paragraph-only attribute branch. The view regression covers both
  directions. This is a source-derived observation.

### WRITER-701 — The attribute resource labels pair kerning as character blinking

- Upstream `include/svx/svxitems.hrc` assigns “Character blinking” to
  `SID_ATTR_CHAR_AUTOKERN`. Writer’s pool maps that slot to `RES_CHRATR_AUTOKERN`.
  The actual blinking item uses `SID_ATTR_FLASH` and appears as “Blinking”.
- The Writer Attributes dialog now uses the pinned dialog ranges. Writer
  lists “Blinking” and excludes the pair-kerning slot. The original strings
  remain available to other callers.
- The Font Position page shows the pair-kerning control, but the same Writer
  ranges exclude its item from the output set. Toggling it alone does not
  produce a formatting criterion.

### WRITER-702 — Format can append an exact criterion after a presence criterion for the same slot

- Upstream `svx/source/dialog/srchdlg.cxx`, `FormatHdl_Impl`, updates only
  concrete existing entries before appending unused output items. A slot with
  an existing invalid-item presence criterion can then appear twice.
- `SearchAttrItemList::Get` transfers both entries in order, so the appended
  exact value takes effect. `cui/source/dialogs/srchxtra.cxx` reads the first
  occurrence for the checkbox and edits the last occurrence on confirmation.
- Writer retains the ordered entries and the different lookup directions.
  The formatting dialog regression checks the combined summary, checkbox
  state, and effective search.

### WRITER-703 — Search formatting summaries can hide settings that affect a match

- Upstream `SvxAdjustItem::GetPresentation` reports the primary alignment
  even when the search criterion also includes last-line alignment, word and
  letter spacing, glyph scaling, or the paragraph composer. The method has
  a TODO for word spacing. `SvxFirstLineIndentItem::GetPresentation` reports
  the measure without its automatic-indentation flag.
- Writer retains the summary fields and compares the complete items. The
  browser regression distinguishes paragraphs that differ only in a
  justification member or the automatic-first-line flag.

### WRITER-704 — “Not Bold” and “Not Italic” produce exact default font members

- Upstream `cui/source/tabpages/chardlg.cxx`, in
  `SvxCharNamePage::FillItemSet_Impl`, the two search-only style entries
  write normal weight and upright posture respectively. The other member
  is left alone. Writer’s attribute search compares the native values,
  so “Not Bold” can exclude light weight alongside bold weight.
- Writer retains the exact, one-sided criteria. The browser regression
  distinguishes regular, light and bold text and verifies that italic
  text can match “Not Bold”.

### WRITER-705 — The Font search page shares the extra style row index across scripts

- Upstream `cui/source/tabpages/chardlg.cxx`, in
  `SvxCharNamePage::FillStyleBox_Impl`, updates a single `m_nExtraEntryPos`
  after filling whichever script's family is active. Reset fills Western,
  Asian and Complex in that order.
- `FillItemSet_Impl` reads that index when interpreting style rows for each
  script. Families with different style counts can cause an ordinary style or
  a search-only row to be interpreted using the other family's boundary.
- Writer preserves the shared index and uses it when collecting all three
  scripts' formatting.

### WRITER-706 — Double-line enclosures truncate supplementary characters

- Upstream `cui/source/tabpages/chardlg.cxx`, in `SvxCharTwoLinesPage::SelectCharacter`,
  casts the full Unicode codepoint from `SvxCharacterMap::GetChar` to
  `sal_Unicode`. A supplementary codepoint can become an unrelated BMP
  character or zero before the item is written.
- Writer retains the same low 16 bits when committing the enclosure. The
  character picker still previews the selected Unicode codepoint.

### WRITER-707 — Two mathematical Unicode subsets share one label

- Upstream `svx/source/dialog/charmap.cxx`, in `SubsetMap::InitList`, uses
  `RID_SUBSETSTR_MISC_MATH_SYMS_B` for both Miscellaneous Mathematical
  Symbols-B and Supplemental Mathematical Operators.
- Writer preserves both ranges and their shared display string. Selecting a
  row still navigates to its own range.

### WRITER-708 — The enclosure picker records OK and Return differently

- Upstream `svx/source/dialog/cuicharmap.cxx` adds a recent character in
  `InsertClickHdl` when the picker has no Writer frame. Pressing Return on the
  character grid also accepts the enclosure, but `ReturnKeypressOnCharHdl`
  bypasses that recent-list update.
- Writer preserves both acceptance paths and the resulting difference in
  recent characters.

### WRITER-709 — An assertion can produce the empty region-end match described as a dollar anchor

- Upstream `i18npool/source/search/textsearch.cxx` describes the retained
  zero-length match at the end of a search region as a dollar anchor.
  `RESrchFrwrd` and `RESrchBkwrd` inspect offsets rather than pattern syntax.
- With transparent bounds, `(?=y)` matches at offset 1 in `xy` over the
  region from 0 to 1. The native ICU binding retains that empty match in
  both directions.

### WRITER-710 — A complex-only regex can use the previous non-regex key

- In upstream `i18npool/source/search/textsearch.cxx`, regex setup does not
  compute `sSrchStr2`, but `RESrchPrepare` selects it when all enabled
  transliteration flags are complex. The compiled pattern can be empty on a
  fresh instance or retain the key from a previous non-regex search.
- The shared search owner preserves that pattern selection and skips the
  second transliteration pass for regex, as the source does.

### WRITER-711 — Regex capture expansion keeps a soft hyphen ignored by the original match

- In upstream `sw/source/core/crsr/findtxt.cxx`, the original model-text
  search normally drops soft hyphens. `ReplaceBackReferences` searches the
  selected range again with soft hyphens retained.
- For `(ab)` over `a<U+00AD>b`, the initial search succeeds and the capture
  search fails. Replace All falls back to Unicode escape processing without
  expanding `$1`. Single Replace in `sw/source/uibase/uiview/viewsrch.cxx`
  and formatted Replace All in `sw/source/core/crsr/findattr.cxx` instead
  pass the original template to the regex replacement operation. The Writer
  model and view regressions preserve both outcomes against the pinned ICU.

- The same search and capture passes apply different rules to comment
  anchors. An ordinary pattern can match across a removed annotation marker;
  the capture pass retains the marker and can fail on the same range. The
  annotation regression exercises both passes over a real point hint.

### WRITER-712 — Escaped dollar signs can trigger the paragraph-end range gate

- The regex check in `sw/source/core/crsr/findtxt.cxx` inspects the final
  character and the character before each vertical bar to determine whether
  the range must reach the end of the paragraph. It does not interpret
  escaping or regex grouping.
- An escaped dollar at the end of a pattern therefore requires the range to
  reach the paragraph end even when the literal dollar is inside the range.
  Writer preserves these checks in both directions.

### WRITER-713 — Paragraph-anchor search omits the final paragraph

- For `$`, `^$` and `$^`, upstream `sw/source/core/crsr/findtxt.cxx`
  selects a range spanning two adjacent nodes. At the end of the document, no
  following text node exists, even when the last paragraph is empty.
- `testTdf147583_backwardSearch` in
  `sw/qa/extras/uiwriter/uiwriter7.cxx` expects the paragraph-end find-all
  count to be one less than the paragraph count and explicitly calls out the
  omitted last empty paragraph. Writer preserves this document boundary.

### WRITER-714 — EditEngine Replace All can revisit a zero-width paragraph-end match

- In `editeng/source/editeng/impedit4.cxx`, the Replace All loop starts its
  next search at the position returned by insertion. `ImpSearch` accepts a
  successful zero-width match from the shared text search.
- For a paragraph-end assertion and nonempty replacement, the new insertion
  position can be the new paragraph end, allowing the same assertion to match
  again. An empty replacement can leave the position unchanged. The port
  retains the source loop. This finding follows from the source branches and
  has not been exercised as an unbounded native operation.

### WRITER-715 — Annotation search compares an absolute bound with the span length

- When notes are included, `sw/source/core/crsr/findtxt.cxx` sets the text
  length passed to `DoSearch` to the subrange length for each span between
  comment markers. The bound passed separately remains a paragraph offset.
- The trailing-dollar check compares those values. A pattern such as `b$`
  can match at the paragraph end during ordinary text search and fail with
  notes enabled. Writer preserves this check in the annotation traversal.

### WRITER-716 — Regex replacement inserts capture references literally in comments

- Writer delegates a single replacement in the active annotation to
  `SwPostItMgr::Replace` in `sw/source/uibase/docvw/PostItMgr.cxx`. The
  EditEngine branch in `editeng/source/editeng/impedit4.cxx` inserts
  `SvxSearchItem::GetReplaceString()` into the current editor selection.
- Writer body text resolves capture references in its replacement path. A
  replacement of `(😀)7` with `$1` therefore inserts the characters `$1` in
  the comment editor, while body replacement inserts the captured emoji.
  The browser preserves the annotation behavior.

### WRITER-717 — ODT drops a bookmark condition when the bookmark is visible

Import stores the hide condition on a matched bookmark range even when the
hidden flag is false. Export writes the condition only on a hidden bookmark
start. A visible bookmark therefore loses its stored condition on an ODT
save and reopen. Writer preserves this behavior, including the case covered
by the pinned `tdf101856.odt` fixture.

- [Original bookmark import](../../vendor/libreoffice-reference/xmloff/source/text/XMLTextMarkImportContext.cxx)
- [Original bookmark export](../../vendor/libreoffice-reference/xmloff/source/text/txtparae.cxx)

### WRITER-718 — A repeated ODT bookmark start replaces the earlier start

Bookmark starts are keyed by name and the latest start replaces an existing
entry with the same name. An end consumes that entry even when it belongs to
a different text owner and cannot produce a bookmark. Names left pending
at the end of import produce no marks. Writer preserves these pairing rules.

- [Original pending range map](../../vendor/libreoffice-reference/xmloff/source/text/txtimp.cxx)
- [Original range validation](../../vendor/libreoffice-reference/xmloff/source/text/XMLTextMarkImportContext.cxx)

### WRITER-719 — ODT infers right-to-left gutter direction from writing mode

The page exporter uses the native `RtlGutter` flag when choosing the side
that receives the gutter. Its property handler emits no separate attribute
for the flag. Import infers the flag from `style:writing-mode`, including
the legacy `rl` and `tb` tokens. An independently set gutter direction can
therefore change on reopen if it disagrees with the writing mode. Writer
preserves both sides of this contract.

- [Original getter and setter mapping](../../vendor/libreoffice-reference/xmloff/source/style/XMLRtlGutterPropertyHandler.cxx)
- [Original margin adjustment](../../vendor/libreoffice-reference/xmloff/source/style/PageMasterImportPropMapper.cxx)

### WRITER-720 — ODT adjusts only explicit page margins for a gutter

Shorthand `fo:margin` creates a property for each missing side. The gutter
adjustment visits only the original side properties. A margin inherited
from the shorthand therefore keeps its authored value before Writer adds
the gutter during layout. Writer preserves this ordering.

- [Original margin synthesis and gutter adjustment](../../vendor/libreoffice-reference/xmloff/source/style/PageMasterImportPropMapper.cxx)

### WRITER-721 — A legacy page background image can override a modern bitmap mode

When a page declares a modern bitmap mode and also has a loaded legacy
background image, the legacy image context replaces the modern mode with
repeat, stretch, or center placement. An image with a package link and no
placement defaults to repeat. Writer keeps this precedence.

- [Original legacy image placement and bitmap mode override](../../vendor/libreoffice-reference/xmloff/source/style/XMLBackgroundImageContext.cxx)

### WRITER-722 — Legacy percentage positions can select the bottom edge

The legacy background-image importer passes a left-column point to its
vertical merge when processing the second percentage. For example, it
maps `20% 50%` to bottom left. Writer preserves that result when converting
the legacy image to a DrawingLayer reference point.

- [Original legacy position conversion](../../vendor/libreoffice-reference/xmloff/source/style/XMLBackgroundImageContext.cxx)

### WRITER-723 — ODT writes only one bitmap tile-offset axis

DrawingLayer stores horizontal and vertical offsets independently. If both
are present, the page exporter emits the horizontal offset when it is
nonzero and emits the vertical offset otherwise. The omitted offset can
therefore change on reopen. Writer retains the two values in memory and
applies the same selection when writing ODT.

- [Original tile-offset export selection](../../vendor/libreoffice-reference/xmloff/source/style/PageMasterExportPropMapper.cxx)

### WRITER-724 — ODT named bitmap fills and legacy backgrounds use different inline fallback rules

The named fill-image context consults its first inline stream when its href
did not resolve to a graphic. The legacy background context only opens a
stream when the href is empty, so a missing package resource can suppress
otherwise valid inline image data. Writer follows the source behavior for
both package-local cases.

- [Original named bitmap context](../../vendor/libreoffice-reference/xmloff/source/style/FillStyleContext.cxx)
- [Original legacy background image context](../../vendor/libreoffice-reference/xmloff/source/style/XMLBackgroundImageContext.cxx)

### WRITER-725 — An explicit resolved-comments visibility argument is inverted

`SwView::ExecViewOptions` applies an explicit Boolean directly for Comments.
For Resolved Comments it negates the explicit value before changing the
visibility option. The argument-free menu action still toggles the current
option. Writer preserves both branches.

- [Original Writer view options dispatcher](../../vendor/libreoffice-reference/sw/source/uibase/uiview/view0.cxx)

### WRITER-726 — Ordinary comment undo snapshots both contain the new resolution state

`SwAnnotationWin::SetResolved` changes the field before calling `UpdateData`.
The latter copies the old field for `SwUndoFieldFromDoc` after the change.
Outside the Yrs transaction path, undo can restore the previous text
snapshot while leaving the new resolution state in place. Writer preserves
this ordering in the local annotation history.

- [Original annotation update and history capture](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin.cxx)
- [Original field undo replay](../../vendor/libreoffice-reference/sw/source/core/undo/SwUndoField.cxx)

### WRITER-727 — Resolving a mixed comment thread by ID can reopen it

The annotation window's menu resolves a thread whenever any of its notes
are unresolved. The text shell's ID-based command toggles the root note
and copies that state to the other notes. A resolved root with unresolved
replies therefore produces opposite results through the two commands.
Writer preserves both paths.

- [Original annotation menu action](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin2.cxx)
- [Original root-based toggle](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin.cxx)

### WRITER-728 — Thread navigation follows adjacent comment windows

LibreOffice uses parent metadata to mark a reply as a follow window.
Finding its thread root then walks backward in sidebar order while the
current window is a follow window. For interleaved comments this can
associate a reply with a preceding root whose ID differs from its stored
parent. Writer preserves anchor order and the follow-window rule.

- [Original parent metadata and sidebar ordering](../../vendor/libreoffice-reference/sw/source/uibase/docvw/PostItMgr.cxx)
- [Original root navigation](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin2.cxx)

### WRITER-729 — A reply can quote an ellipsis before a nonempty paragraph

`SwAnnotationWin::InitAnswer` tests only the first paragraph before copying
the original text object. When that paragraph is empty, the quotation is
`...` even if a later paragraph contains text. Writer preserves this rule.

- [Original reply quotation](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin.cxx)

### WRITER-730 — Promoting a reply can leave it in its original sidebar thread

`SwAnnotationWin::SetAsRoot` clears the parent links and calls
`SwPostItMgr::MoveSubthreadToRoot`. The manager rotates the promoted subthread
past the remaining replies, then `CalcRects` sorts the notes by field anchor.
This restores their original order when the anchors differ. Layout sets
the follow flag for replies and leaves the existing flag in place for a
promoted note. A mounted note can therefore still appear within the previous
thread after Promote Comment disappears from its menu. Writer keeps the field
anchors and the mounted window's follow flag. Recreated windows group the
comments from the persisted parent links.

- [Original root promotion](../../vendor/libreoffice-reference/sw/source/uibase/docvw/AnnotationWin.cxx)
- [Original anchor sorting, follow flag, and subthread rotation](../../vendor/libreoffice-reference/sw/source/uibase/docvw/PostItMgr.cxx)

### WRITER-731 — Character dialog can report the first paragraph's font for a mixed selection

`ImpEditEngine::GetAttribs` fills character attributes from the first
paragraph's defaults when the selection has no hard character formatting.
For later paragraphs it invalidates differing paragraph attributes, while
a differing character default leaves the first paragraph's item set.
In the annotation Character dialog, accepting the original input set can
therefore apply that first font to every comment. Writer preserves the
selection aggregation and the bulk-format merge.

- [Original EditEngine selection aggregation](../../vendor/libreoffice-reference/editeng/source/editeng/impedit5.cxx)
- [Original annotation Character dialog and bulk formatting](../../vendor/libreoffice-reference/sw/source/uibase/docvw/PostItMgr.cxx)

### WRITER-732 — Text replacement can skip the second of two adjacent annotation markers

`SwTextNode::ReplaceText` deletes a dummy attribute and its character, then
decrements the remaining range length. The loop advances its position even
though the next character shifted into the position just processed. If that
character is another annotation marker, the following raw text replacement can
overwrite the marker without deleting its field. The source-derived Writer
test replaces `a<annotation><annotation>bc` with `ZZ` and observes the
second field still associated with offset 1. Writer retains the original
forward scan. The native result is inferred from the pinned source and has
been reproduced in the port.

- [Original ReplaceText loop](../../vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx#L3916)
- [Original DeleteAttribute behavior](../../vendor/libreoffice-reference/sw/source/core/txtnode/thints.cxx#L1785)

### WRITER-733 — Redo can move a character-anchored graphic to the other side of its match

For replacement, `SwUndoSaveContent::DelContentIndex` preserves objects
anchored to characters in the boundary paragraphs. It moves a covered
anchor to the mark endpoint. A backward search can leave that endpoint at
the end of the match. `SwUndoReplace::Impl::RedoImpl` reconstructs the
selection with its mark at the start regardless of the original direction.

The source-derived Writer test replaces `hit` with `matched` with an
image anchored at offset 1. In the backward pass, the anchor moves to the
old match end at offset 3. The insertion at that boundary leaves the
character anchor in place. Undo restores offset 1 and Redo moves the anchor
to offset 0. Writer preserves this sequence. The native result is inferred
from the pinned source and verified in the port.

- [Original anchor movement](../../vendor/libreoffice-reference/sw/source/core/undo/undobj.cxx#L1087)
- [Original redo selection](../../vendor/libreoffice-reference/sw/source/core/undo/unins.cxx#L729)
- [Original anchor handling at the insertion boundary](../../vendor/libreoffice-reference/sw/source/core/txtnode/ndtxt.cxx#L1562)

### WRITER-734 — Page Style presence can produce no search matches

The Attributes checklist receives a slot range that includes
`SID_ATTR_PARA_MODEL`. It can add an invalid-item presence criterion for
that slot. Writer's search conversion handles a set `SvxPageModelItem`.
It leaves the invalid presence marker in the search set. The paragraph
comparison set then drops the raw slot because its range ends with the
graphic attributes. A Page Style criterion alone produces
no matches even when combined with text. Alongside a model criterion it
does not constrain the match. Writer preserves both branches and tests
them with an explicit page style on the paragraph.

- [Original checklist construction and confirmation](../../vendor/libreoffice-reference/cui/source/dialogs/srchxtra.cxx#L112)
- [Original conversion to a page descriptor](../../vendor/libreoffice-reference/sw/source/uibase/utlui/uitool.cxx#L701)
- [Original comparison ranges](../../vendor/libreoffice-reference/sw/source/core/crsr/findattr.cxx#L1080)

### WRITER-735 — Hyphenation zone UNO values narrow through unsigned storage

`SvxHyphenZoneItem::PutValue` takes a signed 32-bit value and assigns it
to a byte or a 16-bit word without range validation. `QueryValue` reads
both widths as signed 16-bit values. A leading-character count of 257
becomes 1, and a zone value of 65535 is read back as -1. The member
handlers strip the conversion flag without converting units. Writer
preserves the source narrowing and tests the results through UNO Any.

- [Original member conversion and assignment](../../vendor/libreoffice-reference/editeng/source/items/paraitem.cxx#L639)

### WRITER-736 — ODF suppresses colors for absent underlines only

The text-property map assigns the underline color entries context IDs used
by the export filter to clear colors when the underline is absent or has
style NONE. The analogous overline entries carry context ID zero. An
explicit overline color can therefore be exported alongside
`style:text-overline-style="none"`. Writer preserves this asymmetry.

- [Original text-property mappings](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx#L178)
- [Original overline mappings](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx#L260)
- [Original underline color filter](../../vendor/libreoffice-reference/xmloff/source/text/txtexppr.cxx#L893)

### WRITER-737 — Expanding title case restarts at a Writer portion boundary

The title-case scan in `SvxFont::CalcCaseMap` resets its word flag at
ASCII space and tab only. Writer normally applies that scan to the
whole paragraph before drawing an individual portion. When a mapped
initial expands, the drawing code maps the selected portion again as
a standalone snippet. A portion beginning inside an existing word
can then acquire an uppercase initial. Writer preserves the
space/tab boundary and expansion-triggered restart.

- [Original title-case scan and midword comment](../../vendor/libreoffice-reference/editeng/source/items/svxfont.cxx#L166)
- [Original Writer portion handling after a length change](../../vendor/libreoffice-reference/sw/source/core/txtnode/swfont.cxx#L1182)

### WRITER-738 — The ODF text-shadow import accepts arbitrary values as enabled

The character shadow property uses `XMLShadowedPropHdl`. Its import
handler treats every attribute value except the exact token `none`
as true, including an empty value or a malformed shadow expression.
Its export handler emits `1pt 1pt` for true. Writer uses the same
handler for this boolean character property.

- [Original boolean shadow handler](../../vendor/libreoffice-reference/xmloff/source/style/shdwdhdl.cxx#L37)
- [Original character property mapping](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx#L175)

### WRITER-739 — Fit to Line exports as fixed character rotation scale

The character Position page stores the Fit to Line checkbox in the
`SvxCharRotateItem` boolean exposed as `CharRotationIsFitToLine`.
The XML handler maps true to `fixed` and false to `line-height`.
The mapping appears reversed relative to the token names. Writer
preserves both directions of the original conversion.

- [Original character rotation property](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx#L244)
- [Original rotation scale handler factory](../../vendor/libreoffice-reference/xmloff/source/text/txtprhdl.cxx#L1403)

## Automatic paragraph direction and first-strong isolates

The pinned direction detector describes the Unicode paragraph-level algorithm but increments its isolate depth only for LRI and RLI. FSI leaves the depth unchanged. A strong character inside an FSI can therefore determine the outer paragraph direction. The Writer port preserves the pinned switch behavior in `GuessParagraphDirection`. See [guessparadirection.cxx](../../vendor/libreoffice-reference/i18nutil/source/utility/guessparadirection.cxx).

### WRITER-740 — Numbering format invalidation truncates the upper-level mask

- Source: pinned `sw/source/core/doc/docnum.cxx`, `GetUpperLvlChg` and `lcl_ChgNumRule`.
- Observation: the helper produces a mask from a 16-bit argument and returns it as an 8-bit value. On the tenth list level, a change to the ninth level cannot trigger the dependent-level notification through this mask, even when the tenth-level label includes its parent. Direct format changes still mark their own level.
- Local behavior: Writer retains the eight-bit return width in `docnum.ts`. This observation concerns the per-node invalidation path. The source still invalidates and validates the numbering rule after a format change.

### WRITER-741 — Some numbering fields compare only the first and last selected levels

- Source: pinned `cui/source/tabpages/numpages.cxx`, `SvxNumOptionsTabPage::InitControls`.
- Observation: the loop assigns equality for the start, prefix and suffix on each selected level. An intermediate level can differ without the field appearing mixed if the last selected level matches the first. Type, character style and sublevels accumulate equality across the selection.
- Local behavior: Writer keeps the first-to-last comparison for those three fields and retains full selection comparisons for the others. Display alone leaves the rule unchanged.

### WRITER-742 — Normal text grid preview takes character width from base text height

In normal paper mode, the native dialog stores Character width separately from
Max. base text size. The preview advances the character boundaries by the
magnified base text height. The horizontal page painter advances them by
`GetGridWidth`, which reads the stored character width in normal mode.
[Preview calculation](../../vendor/libreoffice-reference/sw/source/uibase/frmdlg/colex.cxx#L505)
[Page painting](../../vendor/libreoffice-reference/sw/source/core/layout/paintfrm.cxx#L6114)
[Width selection](../../vendor/libreoffice-reference/sw/source/core/layout/pagechg.cxx#L2889)

A normal grid with 18 pt base text and 13 pt character width still previews
18 pt cells before magnification. Changing only the width updates the document
cell spacing. Writer preserves both source calculations. This observation is
based on the pinned source. A compiled differential check is pending.

### WRITER-743 — Page Style undo leaves the reference paragraph style participating in page line-spacing

Accepting a page line-spacing reference applies `SwRegisterItem(true)`
directly to the selected paragraph style before changing the page descriptor.
The page undo action restores the descriptor and its reference. It carries no
snapshot of the selected paragraph style's prior register item.
[Page Style exchange](../../vendor/libreoffice-reference/sw/source/uibase/utlui/uitool.cxx#L449)
[Page descriptor undo creation](../../vendor/libreoffice-reference/sw/source/core/doc/docdesc.cxx#L433)
[Page undo application](../../vendor/libreoffice-reference/sw/source/core/undo/SwUndoPageDesc.cxx#L232)

With reference style participation initially disabled, enable page line-spacing
with that style and undo the page edit. The descriptor reference is cleared and
the paragraph style retains its enabled register item. Writer preserves this
sequence. The observation follows the pinned source and the local dialog
regression test. A compiled upstream differential check is pending.

### WRITER-744 — A legacy frame background can say stretch while the bitmap mode is tiled

The three bitmap frames in the original `framebackgrounds.odt` fixture
declare `style:repeat="stretch"` on the legacy child and omit the modern
repeat property on `style:graphic-properties`. The original test expects
tiling in the model. The generic text background context is constructed
without a modern bitmap-mode index. Writer preserves the DrawingLayer
default for this combination.

- [Original bitmap frame assertions](../../vendor/libreoffice-reference/sw/qa/extras/odfexport/odfexport.cxx)
- [Original text background context selection](../../vendor/libreoffice-reference/xmloff/source/text/XMLTextPropertySetContext.cxx)

### WRITER-745 — The old frame transparency attribute is ignored for a modern bitmap

The original frame descriptor uses the old `style:background-transparency`
value to recover a missing modern opacity on non-bitmap fills. It ignores
this fallback for bitmap fills because historical writers generated the
wrong value. A legacy-only bitmap gets its transparency from the opacity
on the background-image child.

- [Original Writer frame fill precedence and compatibility fallback](../../vendor/libreoffice-reference/sw/source/core/unocore/unoframe.cxx)

### WRITER-746 — A frame RGB fallback can keep a modern solid fill transparent

When a modern solid fill has no modern color, Writer's descriptor
applies the legacy RGB member through a default transparent brush. The
RGB member preserves the brush alpha, and the converter writes a
transparent fill unless a subsequent legacy transparency value supplies
the alpha. The text import map also drops a solid style with no modern
color when its legacy color is explicitly transparent.

- [Original Writer frame RGB fallback](../../vendor/libreoffice-reference/sw/source/core/unocore/unoframe.cxx)
- [Original Writer text import filtering of the solid style](../../vendor/libreoffice-reference/xmloff/source/text/txtimppr.cxx)

### WRITER-747 — A saturated line-number offset is exported as absent

The line-number settings setter caps a positive offset at 65535 twips.
The getter interprets that same value as the unspecified-distance
sentinel and reports zero. The ODT exporter consequently omits the
offset. An omitted or malformed XML offset also reaches the sentinel
through the import context's signed minus-one default. Writer preserves
both paths.

- [Original XML offset default](../../vendor/libreoffice-reference/xmloff/source/text/XMLLineNumberingImportContext.cxx)
- [Original Writer property setter and getter](../../vendor/libreoffice-reference/sw/source/core/unocore/unosett.cxx)

### WRITER-748 — A later line-number separator can retain the preceding interval

Each separator context replaces the separator text when it closes,
while its increment reaches the parent only if conversion succeeds.
If a second separator has an invalid or omitted increment, its text
replaces the first separator and its interval comes from the first.
Writer preserves the separate updates.

- [Original separator context](../../vendor/libreoffice-reference/xmloff/source/text/XMLLineNumberingSeparatorImportContext.cxx)

### WRITER-749 — A negative paragraph line restart becomes a large positive number

The UNO setter accepts a signed 32-bit value and assigns it to an unsigned
24-bit field. For example, an ODT paragraph style with `text:line-number="-1"`
stores 16777215. Its next ODT export uses that positive value. A value that
narrows to zero means continuation. Writer preserves the original field width
and conversion.

- [Original line-number field](../../vendor/libreoffice-reference/sw/inc/fmtline.hxx)
- [Original UNO start-value setter](../../vendor/libreoffice-reference/sw/source/core/layout/atrfrm.cxx)

### WRITER-750 — Character shadow loses its input color and offsets

The ODF character property projects every value except the exact token
`none` to the same boolean. On output an enabled shadow always becomes
`1pt 1pt`. A colored shadow with other offsets therefore reopens with
the enabled flag and exports with the fixed spelling. Writer preserves
the native conversion.

- [Original character shadow property map](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx)
- [Original shadow handler](../../vendor/libreoffice-reference/xmloff/source/style/shdwdhdl.cxx)

### WRITER-751 — Inactive overlines can export explicit colors

The text export mapper suppresses both underline color states when the
underline style is absent or none. Overline uses the same color handlers
but has no equivalent context filter. An explicit overline color can
therefore survive export with an inactive overline. Writer preserves
the separate behavior.

- [Original line-decoration property map](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx)
- [Original underline-only export filter](../../vendor/libreoffice-reference/xmloff/source/text/txtexppr.cxx)

### WRITER-752 — Text-combine brackets are truncated to a UTF-16 unit

The ODF text-combine bracket handler keeps only the first UTF-16 unit.
A supplementary character therefore enters the Writer item as its high
surrogate. The export handler admits just one unit and omits an empty
bracket, including an explicitly imported empty attribute. Writer
preserves these native handler rules.

- [Original combine bracket handlers](../../vendor/libreoffice-reference/xmloff/source/text/txtprhdl.cxx)

### WRITER-753 — Extra spaces invalidate text emphasis

The parser treats each literal space as a delimiter and receives empty
tokens between consecutive spaces. It rejects an emphasis attribute
with such a token, including an otherwise valid mark and position.
Writer preserves the native tokenization and failed assignment.

- [Original emphasis handler](../../vendor/libreoffice-reference/xmloff/source/text/txtprhdl.cxx)
- [Original XML token enumerator](../../vendor/libreoffice-reference/xmloff/source/core/xmluconv.cxx)

### WRITER-754 — Two ODF casing attributes share one Writer property

The text property maps assign both `fo:font-variant` and
`fo:text-transform` to `CharCaseMap` without a merge flag. An explicit
`font-variant="normal"` therefore supplies the same reset as
`text-transform="none"`. If both attributes set different modes, the
multi-property import sends two values with the same property name and
the native name sort has no tie-breaker. Writer retains the single
property and accepts both original conversions.

- [Original text property tables](../../vendor/libreoffice-reference/xmloff/source/text/txtprmap.cxx)
- [Original casing handlers](../../vendor/libreoffice-reference/xmloff/source/style/csmaphdl.cxx)
- [Original multi-property name sort](../../vendor/libreoffice-reference/xmloff/source/style/xmlimppr.cxx)

### WRITER-755 — Hyphenation limits narrow through unsigned item fields

Writer accepts signed numeric UNO input and narrows character limits into
unsigned bytes and the zone values into unsigned words. Out-of-range
counts can wrap. A zone with its top bit set reads back through the UNO
member as a negative short. Writer preserves the storage and projection
used by the original item.

- [Original hyphenation fields](../../vendor/libreoffice-reference/include/editeng/hyphenzoneitem.hxx)
- [Original hyphenation item query and assignment](../../vendor/libreoffice-reference/editeng/source/items/paraitem.cxx)

### WRITER-756 — An unrecognized font charset still counts as present

The XML font charset handler reports success for every token and assigns
a value only for `x-symbol`. The font defaults pass sees that property
as present and skips the missing-charset default. Writer preserves the
resulting distinction between an absent charset and an unrecognized
authored charset.

- [Original font charset handler](../../vendor/libreoffice-reference/xmloff/source/style/fonthdl.cxx)
- [Original font defaulting pass](../../vendor/libreoffice-reference/xmloff/source/text/txtimppr.cxx)

### WRITER-757 — An empty annotation date is formatted as an invalid ODF date

An annotation without a parsed date receives `DateTime::EMPTY`. The
annotation exporter still writes `dc:date` when keeping author and date
metadata, so the original formatter produces `0000-00-00T00:00:00`.
The full date-time importer requires a positive month and day and
leaves the field at its native empty default. Writer preserves both
the serialization and the import result.

- [Original annotation field default](../../vendor/libreoffice-reference/sw/source/core/unocore/unofield.cxx)
- [Original annotation field export](../../vendor/libreoffice-reference/xmloff/source/text/txtflde.cxx)
- [Original date-time conversion](../../vendor/libreoffice-reference/sax/source/tools/converter.cxx)

### WRITER-758 — An authored annotation name overrides mark uniqueness

The annotation mark initializer takes a nonempty name from its trailing
field even after the mark manager has resolved a name collision. This
keeps parent-name references intact when copying comments. A later
name-based lookup can therefore find the first matching field when
more than one annotation retains the same authored name. Writer
preserves the original field name and the lookup behavior.

- [Original annotation name reconciliation](../../vendor/libreoffice-reference/sw/source/core/crsr/annotationmark.cxx)
- [Original mark creation and lookup](../../vendor/libreoffice-reference/sw/source/core/doc/docbm.cxx)
- [Original annotation field unique-ID lookup](../../vendor/libreoffice-reference/sw/source/core/unocore/unofield.cxx)

### WRITER-759 — Duplicate master-page names can bind references to an earlier display name

The master-page importer creates or reuses each page style by its own
display name. The shared style-name map keeps the first display name
registered for an encoded name. If different master pages declare the
same encoded name, paragraph and follow-style references can therefore
resolve to the earlier display name even though both page styles exist.
Writer preserves that registration behavior.

- [Original master-page style creation](../../vendor/libreoffice-reference/xmloff/source/text/XMLTextMasterPageContext.cxx)
- [Original display-name map insertion and lookup](../../vendor/libreoffice-reference/xmloff/source/core/xmlimp.cxx)

### WRITER-760 — A section name with a numeric prefix reserves an automatic name

The section name allocator parses the part after the localized default
name as an integer and does not require the entire suffix to be numeric.
For example, in English an existing section named `Section1Appendix`
can reserve `Section1` from automatic allocation even though the names
are distinct. Writer keeps the native suffix conversion for this path.

- [Original Writer section name allocation](../../vendor/libreoffice-reference/sw/source/core/docnode/ndsect.cxx#L1385)

The same permissive suffix scan applies to automatic TOC names. A contents
index named `Table of Contents1Appendix` can reserve `Table of Contents1`.

- [Original Writer TOC name allocation](../../vendor/libreoffice-reference/sw/source/core/doc/doctxm.cxx#L719)

### WRITER-761 — An explicitly empty TOC outline level selects one level

The TOC source starts at the document's full chapter-numbering depth. If the
outline-level attribute is present with an empty value, the shared SAX number
converter consumes the entire empty string, obtains zero and clamps it to one
before reporting success. Omitting the attribute retains the original full
depth. The port preserves this distinction and the separate exact-token lookup
for individual level templates.

- [Original TOC source](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexTOCSourceContext.cxx#L62)
- [Original SAX number converter](../../vendor/libreoffice-reference/sax/source/tools/converter.cxx#L716)

### WRITER-762 — The TOC mark importer ignores the last available outline level

Writer's UNO index-mark descriptor accepts all ten outline levels, and its
exporter writes the one-based level for every TOC mark. The TOC mark reader
accepts levels strictly below the chapter numbering count. Reopening a mark
exported at level ten leaves it at the descriptor's default, level one.
User-index marks include the last level in their import range. That reader
also admits zero before subtracting one, which the UNO setter rejects.
Writer preserves both filters' original bounds.

- [Original mark attribute readers](../../vendor/libreoffice-reference/xmloff/source/text/txtparai.cxx#L1120)
- [Original mark descriptor level setter](../../vendor/libreoffice-reference/sw/source/core/unocore/unoidx.cxx#L2123)
- [Original mark level exporter](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexMarkExport.cxx#L139)

### WRITER-763 — The index mark copy constructor drops its bookmark name

The native UNO descriptor exposes a bookmark-name property on TOC marks.
The native `SwTOXMark` copy constructor retains the alternative text, keys
and levels but leaves the bookmark name empty. The port retains this
behavior for native mark cloning.

- [Original bookmark property setter](../../vendor/libreoffice-reference/sw/source/core/unocore/unoidx.cxx#L2133)
- [Original mark copy constructor](../../vendor/libreoffice-reference/sw/source/core/tox/tox.cxx#L116)

### WRITER-764 — A TOC entry-number token exports only two of its accepted chapter formats

The native chapter field importer accepts the five recognized display formats
for both entry numbers and chapter information. When Writer exposes an
entry-number token to the ODF exporter, it only retains the original number
or plain-number formatting. It maps the other recognized values to number.
A chapter-information token in a user or alphabetical index retains its full
format. Writer preserves these type-specific read and export rules.

- [Original chapter field importer](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexChapterInfoEntryContext.cxx#L69)
- [Original Writer token exposure](../../vendor/libreoffice-reference/sw/source/core/unocore/unoidx.cxx#L2894)

### WRITER-765 — Single-level index imports leave the entry template at the default

The table, illustration, and object index readers pass a level-name map to the
shared template constructor while providing no level attribute. The constructor
enables implicit level one only when its map is absent. The resulting template
context retains an invalid level and exits before assigning the entry tokens or
paragraph style. Writer keeps the original type-specific form defaults when
loading these sources while preserving the saved index body.

- [Original table index template dispatch](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexTableSourceContext.cxx#L131)
- [Original illustration index template dispatch](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexIllustrationSourceContext.cxx#L52)
- [Original object index template dispatch](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexObjectSourceContext.cxx#L118)
- [Original level initialization and early return](../../vendor/libreoffice-reference/xmloff/source/text/XMLIndexTemplateContext.cxx#L59)


### WRITER-766 — Annotation lists can retain a text level without an exportable numbering rule

- Source: `xmloff/source/text/txtfldi.cxx` `XMLAnnotationImportContext::createFastChildContext`, `xmloff/source/text/txtimp.cxx` `XMLTextImportHelper::SetStyleAndAttrs`, `sw/source/core/fields/textapi.cxx` `ImplGetSvxTextPortionPropertySet`, `editeng/source/uno/unotext.cxx` `SvxUnoTextRangeBase::SetPropertyValueHelper`, `editeng/source/editeng/eerdll.cxx`, and `xmloff/source/text/XMLTextNumRuleInfo.cxx` `XMLTextNumRuleInfo::Set`.
- The annotation Outliner exposes `NumberingRules`, but its special setter rejects a nonempty incoming rule. The XML importer catches that rejection and still sets `NumberingLevel`. A fresh EditEngine numbering item has zero levels, which the ODF exporter refuses as a list rule. The note retains its paragraph content and inline formatting even when the authored list wrapper is omitted on export.
- The Writer annotation path follows the same sequence for its represented EditEngine properties. It retains the native outline depth through the Worker and exports the paragraph without inventing a replacement numbering rule.


### WRITER-767 — Duplicate scalar metadata can remain in the DOM after editing the first entry

- Source: `sfx2/source/doc/SfxDocumentMetaData.cxx` `getChildNodeByName`, `SfxDocumentMetaData::init`, `SfxDocumentMetaData::setMetaText` and `SfxDocumentMetaData::serialize`.
- Scalar property lookup claims the first matching immediate DOM element. Updating that property edits the selected node, while native SAX export traverses the whole preserved DOM. An invalid file with duplicate scalar elements can therefore still carry its later stale entry after save.
- Ordinary ODF package filtering uses the same native property selection and DOM serialization. Browser shell titles continue to use the selected value returned by the Writer filter.

### WRITER-768 — Incompatible ruby values can succeed and reset the original property

The native ruby adjustment and position setters initialize a signed 16-bit
temporary to zero and validate its range after extraction without checking
whether extraction succeeded. An incompatible value can therefore report
success and set left adjustment or above position. The legacy above setter
also reports success for incompatible values, while leaving position as it was.
Writer preserves both setter behaviors.

- [Original ruby UNO property writeback](../../vendor/libreoffice-reference/sw/source/core/txtnode/fmtatr2.cxx#L533)

### WRITER-769 — Resolving an unregistered redline author may never terminate

The author lookup tries to grow the table by repeatedly inserting the name
`nn`. The insertion method deduplicates names, so once that name exists an
index beyond the table stays beyond it. ODT and Worker import register the
author name before storing its index. The lookup retains the original behavior.

- [Original author lookup](../../vendor/libreoffice-reference/sw/source/uibase/app/swmodul1.cxx#L425)
- [Original author insertion](../../vendor/libreoffice-reference/sw/source/uibase/app/swmodul1.cxx#L471)

### WRITER-770 — The change-info reader joins adjacent comment paragraphs without line breaks

The ODF reader sends each comment paragraph into the same string buffer and
supplies the accumulated characters to Writer without inserting paragraph
separators. Export splits comment strings on line breaks, so an imported
multiline comment can come back as one paragraph. Writer retains the native
reader behavior.

- [Original comment import](../../vendor/libreoffice-reference/xmloff/source/text/XMLChangeInfoContext.cxx#L66)
- [Original change-info export](../../vendor/libreoffice-reference/xmloff/source/text/XMLRedlineExport.cxx#L543)
