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

## Recording future observations

Add a stable `WRITER-###` case ID, pinned source location, original condition,
concrete defined result or a clearly labelled source proof, existing acceptance
evidence, consumer uncertainty and the preservation decision. Update an entry
when stronger evidence arrives. An unusual source expression is sufficient for
an observation, not sufficient for a confirmed defect classification or an
implementation change.
