---
id: "202610102025-0MZPHY"
title: "Restore frame-owned native paragraph lines and cursor iteration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T20:25:53.120Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore original frame-owned paragraph lines and native linked text iterator for actual visual-line margins; retain explicit full formatting/query gaps and verify upstream-absent scoped100 coverage."
events:
  -
    type: "status"
    at: "2026-10-10T20:25:54.343Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore original frame-owned paragraph lines and native linked text iterator for actual visual-line margins; retain explicit full formatting/query gaps and verify upstream-absent scoped100 coverage."
doc_version: 3
doc_updated_at: "2026-10-10T20:25:54.343Z"
doc_updated_by: "CODER"
description: "Correction7/10 after BZ14P4: replace text cursor array/index adapter with original frame-owned SwParaPortion/SwLineLayout, native SwTextInfo and linked SwTextIter traversal used by actual Home End; preserve registered IO boundaries and pause after next full and repairs."
sections:
  Summary: "Restore original frame-owned linked paragraph lines and native text iterator ownership for actual Writer visual-line margin movement."
  Scope: "Six production modules: new porlin.ts/porlay.ts plus inftxt.ts/itrtxt.ts/frmcrsr.ts/txtfrm.ts. Restore represented SwLinePortion length, SwLineLayout links/real height/dummy and SwParaPortion first-line inheritance/par length; frame owns native paragraph instead of duplicate array; SwTextInfo/SwTextSizeInfo original frame/para/text/offset; SwTextIter derives actual SwAttrIter and restores current/previous line identity, native cumulative start/Y/line count, Next/Prev/PrevLine/CharToLine. SwTextCursor consumes frame/info rather than array/text. Actual margin helper consumes original native paragraph iterator. One old native-line-margin.test API fixture migration only, preserve literal scenarios/matrices/device values/matcher values except obsolete empty iterator admission now native ctor rejection. Up to2 fresh native core/React tests; 12 corresponding canonical records with 4 new unverified source mappings, registry generated metadata and parent Findings. Do not change native margin follow selection or end proxy here: query/adjacent frame/native formatting/SwTextMargin/SwTextAdjuster/SwAttrIter font/scripts/register/merged/redline callbacks/paragraph flags and full line portions remain explicit residual gaps. Browser measurements only populate native frame-owned line layout; no invented native formatter claim. Registered recovery/open/save/settings deviations untouched. Correction7/10, full every10 then pause after next full and repairs."
  Plan: "Port represented native line ownership and iterator contract from original pinned source, connect actual Home End, migrate only constructor/result-identity API fixtures and add real native identity/dummy/affinity/offset/history/lifetime checks. Update append-only truthful inventory, execute whole-current six-module100 four metrics plus fresh/related/static/browser upstream-absent once, restored-source metadata checks, exact semantic same-agent non-independent review and clean closure. Standing human goal/resume authorizes this safe local correction."
  Verify Steps: |-
    1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65: porlin.hxx/porlay.hxx/porlay.cxx line defaults/links/inheritance/GetParLen; itrtxt.hxx/cxx original SwTextIter Init/GetPrev_/GetPrev/Prev/Next/PrevLine/CharToLine and CharCursorToLine; inftxt.hxx/cxx original frame/para/textstart/text/char; txtfrm source native para ownership. Tests never call/read pinned source.
    2. Actual original SwDoc nodes/SwTextFrame own SwParaPortion and original line identities, no external array cursor ownership; cumulative nonzero offsets, null first/last Next/Prev, previous cache, real Y/line number/dummy skip and all-dummy fallback, CharToLine backward/forward/soft-boundary/hard-break affinity including zero-length line behavior, original AttrIter hints inherited, missing para constructor rejects native precondition. Actual shell body/cell Home End/Shift/label/edit/UndoRedo and browser rendering retained.
    3. Read declared steps; changed Prettier/ESLint; TS7 typecheck/dependencies/docs/file-size/build/static; fresh/new plus related Vitest coverage for entire6 modules100 lines/statements/functions/branches with complete current raw maps and all-source/test hashes/nonnegative counters; existing12 Chromium specs. Runtime/static/build/browser both upstream refs absent and restored in finally, no full7/10. Repair only affected failures, no passing replay for metadata/helper fixes.
    4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor (9 gates); preserve old acceptance cases/device matrices/literal matchers except explicit native API migration; canonical historical prefix/status/default/classification preserved, new native modules unverified; exact semantic same-agent non-independent quality review and clean writer/restored refs.
  Verification: "Pending execution; no full suite at7/10. Full native paragraph formatting/query/geometry/intermediate cursor inheritance and wider parity are not proven."
  Rollback Plan: "Revert only semantic implementation commit and corresponding scoped inventory through a separately authorized task; never discard unrelated work."
  Findings: "Current clean writer baseline2998886d3ea3df886931d7c0e79774f34bfdcd09, sixth accepted correction after BZ14P4. Prior human stop-rule acknowledgment yielded no repository progress; inspection now shows array/index cursor adapter can be removed by restoring real linked native paragraph ownership. Missing-file read probes were corrected using rg and route recomputation; no implementation or runtime mutation occurred before task creation. All native full-formatting/query/geometry gaps remain unverified."
id_source: "generated"
---
## Summary

Restore original frame-owned linked paragraph lines and native text iterator ownership for actual Writer visual-line margin movement.

## Scope

Six production modules: new porlin.ts/porlay.ts plus inftxt.ts/itrtxt.ts/frmcrsr.ts/txtfrm.ts. Restore represented SwLinePortion length, SwLineLayout links/real height/dummy and SwParaPortion first-line inheritance/par length; frame owns native paragraph instead of duplicate array; SwTextInfo/SwTextSizeInfo original frame/para/text/offset; SwTextIter derives actual SwAttrIter and restores current/previous line identity, native cumulative start/Y/line count, Next/Prev/PrevLine/CharToLine. SwTextCursor consumes frame/info rather than array/text. Actual margin helper consumes original native paragraph iterator. One old native-line-margin.test API fixture migration only, preserve literal scenarios/matrices/device values/matcher values except obsolete empty iterator admission now native ctor rejection. Up to2 fresh native core/React tests; 12 corresponding canonical records with 4 new unverified source mappings, registry generated metadata and parent Findings. Do not change native margin follow selection or end proxy here: query/adjacent frame/native formatting/SwTextMargin/SwTextAdjuster/SwAttrIter font/scripts/register/merged/redline callbacks/paragraph flags and full line portions remain explicit residual gaps. Browser measurements only populate native frame-owned line layout; no invented native formatter claim. Registered recovery/open/save/settings deviations untouched. Correction7/10, full every10 then pause after next full and repairs.

## Plan

Port represented native line ownership and iterator contract from original pinned source, connect actual Home End, migrate only constructor/result-identity API fixtures and add real native identity/dummy/affinity/offset/history/lifetime checks. Update append-only truthful inventory, execute whole-current six-module100 four metrics plus fresh/related/static/browser upstream-absent once, restored-source metadata checks, exact semantic same-agent non-independent review and clean closure. Standing human goal/resume authorizes this safe local correction.

## Verify Steps

1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65: porlin.hxx/porlay.hxx/porlay.cxx line defaults/links/inheritance/GetParLen; itrtxt.hxx/cxx original SwTextIter Init/GetPrev_/GetPrev/Prev/Next/PrevLine/CharToLine and CharCursorToLine; inftxt.hxx/cxx original frame/para/textstart/text/char; txtfrm source native para ownership. Tests never call/read pinned source.
2. Actual original SwDoc nodes/SwTextFrame own SwParaPortion and original line identities, no external array cursor ownership; cumulative nonzero offsets, null first/last Next/Prev, previous cache, real Y/line number/dummy skip and all-dummy fallback, CharToLine backward/forward/soft-boundary/hard-break affinity including zero-length line behavior, original AttrIter hints inherited, missing para constructor rejects native precondition. Actual shell body/cell Home End/Shift/label/edit/UndoRedo and browser rendering retained.
3. Read declared steps; changed Prettier/ESLint; TS7 typecheck/dependencies/docs/file-size/build/static; fresh/new plus related Vitest coverage for entire6 modules100 lines/statements/functions/branches with complete current raw maps and all-source/test hashes/nonnegative counters; existing12 Chromium specs. Runtime/static/build/browser both upstream refs absent and restored in finally, no full7/10. Repair only affected failures, no passing replay for metadata/helper fixes.
4. Restored-source registry build/source-tree/provenance/registry/resources generation/invariants/parity/routing/doctor (9 gates); preserve old acceptance cases/device matrices/literal matchers except explicit native API migration; canonical historical prefix/status/default/classification preserved, new native modules unverified; exact semantic same-agent non-independent quality review and clean writer/restored refs.

## Verification

Pending execution; no full suite at7/10. Full native paragraph formatting/query/geometry/intermediate cursor inheritance and wider parity are not proven.

## Rollback Plan

Revert only semantic implementation commit and corresponding scoped inventory through a separately authorized task; never discard unrelated work.

## Findings

Current clean writer baseline2998886d3ea3df886931d7c0e79774f34bfdcd09, sixth accepted correction after BZ14P4. Prior human stop-rule acknowledgment yielded no repository progress; inspection now shows array/index cursor adapter can be removed by restoring real linked native paragraph ownership. Missing-file read probes were corrected using rg and route recomputation; no implementation or runtime mutation occurred before task creation. All native full-formatting/query/geometry gaps remain unverified.
