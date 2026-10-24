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
