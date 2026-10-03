---
id: "202610032331-31YTFD"
title: "Focus Writer document when inactive popup menu has no saved owner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T23:32:16.258Z"
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
    body: "Start: implement approved iteration79 document focus fallback on unopened Writer menubar Escape under persistent user parity authorization; no upstream test dependency or source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-03T23:32:16.697Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved iteration79 document focus fallback on unopened Writer menubar Escape under persistent user parity authorization; no upstream test dependency or source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-03T23:45:49.030Z"
doc_updated_by: "CODER"
description: "Iteration79 under C9TN6M: restore native default-to-document behavior for Escape on activated menubar without popup when no live saved owner, through active Writer editing-host reference. Preserve saved-owner precedence and popup/submenu/command paths. No upstream source/helper artifacts or test dependency."
sections:
  Summary: "Iteration79: restore document fallback for Escape on activated Writer menubar without popup and without a live saved focus owner."
  Scope: "Seven semantic paths: CommandMenuBar.tsx, writer-view.tsx, WriterPlainTextEditor.tsx, new CommandMenuBar-document-focus.test.tsx, new writer-menu-document-focus.spec.ts and append-only evidence in existing relevant rows of source-provenance.json/runtime-inventory.json. Preserve all251prior test/spec files byte-identical, all popup close/dispatch/submenu/selection/resource contracts, core and registered save/open/recovery deviations. Inject active Writer editing-host reference without DOM selectors or core DOM dependencies. Native no-owner popup paths/frame/global focus/mnemonics/full menu parity remain separate open obligations."
  Plan: "1. Manually inspect exact pinned ChangeHighlightItem defaults/deactivation, GetFocus, Escape, PopupClosed, GrabFocusToDocument client-frame routing and saved Window disposal; hashes/conclusions only. 2. Add owned test/E2E before correction: no-popup menubar Escape with absent or disconnected saved owner focuses document; valid owner wins; opened popup and external focus transfer retain previous contracts; multiple Writer frames use own editor. 3. Inject optional document focus callback into generic browser menu and stable optional editingHostRef into editor, route only no-popup trigger Escape default-to-document branch after saved-owner check. 4. Append relevant evidence only preserving statuses/defaults/ownership/prior conclusions. 5. Focused checks and fullverify100%coverage0semantic; sequential all suites with vendor unavailable and finally restored; exact251prior tests/production scope/manifests/pin/storage/doctor/routing checks. 6. Semantic commit, same-actor separate EVALUATOR exact semantic review, canonical finish and parent findings; goal active."
  Verify Steps: "Manual exact-pin native complete relevant functions inspection, no native compilation/execution or source copying. Owned tests absent/connected/disconnected saved owner on unopened Escape, original owner precedence, opened popup fallback unchanged, outside focus no-steal and per-instance document target; actual Writer editing host focuses and accepts input after body blur plus trigger Escape without popup, valid toolbar owner wins. Focused cases and npm run verify all gates100%coverage0semantic violations. Sequential vendor root renamed/restoredfinally: npm run test; root vitest3script test files; npm run test:e2e, allpass.251prior test/spec byte-identical, seven semantic paths only and precise bounded focus/reference changes,215row manifests evidence-only preserving all statuses/defaults/ownership/prior conclusions, unchanged pinned hashes, ignored-inclusive0source/helper/Python/executable artifacts. Doctor/routing/diff pass, recorded terminal evidence, same-actor EVALUATOR at exact semantic HEAD, canonical finish and final cleantracked/untracked."
  Verification: "Pending before/after checks. All tests use owned runtime/fixtures and must pass with pinned upstream absent; static CLI provenance/resource/parity audits are separate source reads."
  Rollback Plan: "Revert only the semantic iteration79 commit through a separately authorized task if needed; preserve task outcomes and history. Do not modify registered save/open/recovery deviations."
  Findings: |-
    Preflight main/direct clean; only parent C9TN6M DOING. Prior turn progress: iteration78 completed saved-owner and close-before-dispatch leaf. Manual native inspection shows ChangeHighlightItem bDefaultToDocument=true by default, PopupClosed explicitlyfalse; GetFocus activates without popup and Escape deactivates with defaulttrue. ImplGrabFocusToDocument routes enclosing frame client. Browser closed-menubar Escape currently has no document fallback. No upstream source/helper artifact permitted. Read-only guessed nonexistent paths produced missing-file/glob errors with no mutation; actual native header discovered at vcl/source/window/menubarwindow.hxx.
    Owned baseline corrected missing QueryCommand descriptor fixture: initial4fail included1fixture issue; owned baseline3fail5pass exposes absent/disconnected/per-frame document fallback. Corrected86focused cases and6Chromium cases pass. First fullverify stopped at ESLint2missing rootElement dependencies after optional ref injection; add actual reference to selection/subscription effect dependencies within approved editing-host lifecycle scope. No pass criterion change or lint suppression. Failed full outcome retained.
    Second fullverify938cases/197files allpass and100%branches; required coverage gate exposed actual Writer client callback line418 only exercised in Chromium, not owned unit suite (statement/line99.99%,function99.96%). Added actual Desktop/Writer client focus-and-beforeinput integration case to existing new test file, preserving251prior tests, no threshold relaxation or production changes. This exercises true view ref wiring rather than duplicating generic callback fixture. Failed gate retained as writer-callback-coverage-full-verify-summary.json.
    Actual Writer integration focus passed immediately; JSDOM does not create a native caret on editing-host focus, so input assertion initially failed. Set an explicit owned paragraph Range before beforeinput, as other owned editor tests do; Chromium already validates actual native caret/input behavior. Corrected final87cases/7files pass; earlier fixture outcome retained as writer-selection-fixture-runtime.json. All production paths unchanged after effect-dependency correction.
    Third fullverify939app/197files109inventory/36files35browser2resources allpass100%coverage; static provenance failed because new local evidence used strings instead of required path/marker objects. Corrected only new evidence formatting to source objects/runtime #markers and appended actual routesWriterClient integration marker, preserving old evidence/status/default/ownership. Outcome retained as evidence-schema-full-verify-summary.json.
id_source: "generated"
---
## Summary

Iteration79: restore document fallback for Escape on activated Writer menubar without popup and without a live saved focus owner.

## Scope

Seven semantic paths: CommandMenuBar.tsx, writer-view.tsx, WriterPlainTextEditor.tsx, new CommandMenuBar-document-focus.test.tsx, new writer-menu-document-focus.spec.ts and append-only evidence in existing relevant rows of source-provenance.json/runtime-inventory.json. Preserve all251prior test/spec files byte-identical, all popup close/dispatch/submenu/selection/resource contracts, core and registered save/open/recovery deviations. Inject active Writer editing-host reference without DOM selectors or core DOM dependencies. Native no-owner popup paths/frame/global focus/mnemonics/full menu parity remain separate open obligations.

## Plan

1. Manually inspect exact pinned ChangeHighlightItem defaults/deactivation, GetFocus, Escape, PopupClosed, GrabFocusToDocument client-frame routing and saved Window disposal; hashes/conclusions only. 2. Add owned test/E2E before correction: no-popup menubar Escape with absent or disconnected saved owner focuses document; valid owner wins; opened popup and external focus transfer retain previous contracts; multiple Writer frames use own editor. 3. Inject optional document focus callback into generic browser menu and stable optional editingHostRef into editor, route only no-popup trigger Escape default-to-document branch after saved-owner check. 4. Append relevant evidence only preserving statuses/defaults/ownership/prior conclusions. 5. Focused checks and fullverify100%coverage0semantic; sequential all suites with vendor unavailable and finally restored; exact251prior tests/production scope/manifests/pin/storage/doctor/routing checks. 6. Semantic commit, same-actor separate EVALUATOR exact semantic review, canonical finish and parent findings; goal active.

## Verify Steps

Manual exact-pin native complete relevant functions inspection, no native compilation/execution or source copying. Owned tests absent/connected/disconnected saved owner on unopened Escape, original owner precedence, opened popup fallback unchanged, outside focus no-steal and per-instance document target; actual Writer editing host focuses and accepts input after body blur plus trigger Escape without popup, valid toolbar owner wins. Focused cases and npm run verify all gates100%coverage0semantic violations. Sequential vendor root renamed/restoredfinally: npm run test; root vitest3script test files; npm run test:e2e, allpass.251prior test/spec byte-identical, seven semantic paths only and precise bounded focus/reference changes,215row manifests evidence-only preserving all statuses/defaults/ownership/prior conclusions, unchanged pinned hashes, ignored-inclusive0source/helper/Python/executable artifacts. Doctor/routing/diff pass, recorded terminal evidence, same-actor EVALUATOR at exact semantic HEAD, canonical finish and final cleantracked/untracked.

## Verification

Pending before/after checks. All tests use owned runtime/fixtures and must pass with pinned upstream absent; static CLI provenance/resource/parity audits are separate source reads.

## Rollback Plan

Revert only the semantic iteration79 commit through a separately authorized task if needed; preserve task outcomes and history. Do not modify registered save/open/recovery deviations.

## Findings

Preflight main/direct clean; only parent C9TN6M DOING. Prior turn progress: iteration78 completed saved-owner and close-before-dispatch leaf. Manual native inspection shows ChangeHighlightItem bDefaultToDocument=true by default, PopupClosed explicitlyfalse; GetFocus activates without popup and Escape deactivates with defaulttrue. ImplGrabFocusToDocument routes enclosing frame client. Browser closed-menubar Escape currently has no document fallback. No upstream source/helper artifact permitted. Read-only guessed nonexistent paths produced missing-file/glob errors with no mutation; actual native header discovered at vcl/source/window/menubarwindow.hxx.
Owned baseline corrected missing QueryCommand descriptor fixture: initial4fail included1fixture issue; owned baseline3fail5pass exposes absent/disconnected/per-frame document fallback. Corrected86focused cases and6Chromium cases pass. First fullverify stopped at ESLint2missing rootElement dependencies after optional ref injection; add actual reference to selection/subscription effect dependencies within approved editing-host lifecycle scope. No pass criterion change or lint suppression. Failed full outcome retained.
Second fullverify938cases/197files allpass and100%branches; required coverage gate exposed actual Writer client callback line418 only exercised in Chromium, not owned unit suite (statement/line99.99%,function99.96%). Added actual Desktop/Writer client focus-and-beforeinput integration case to existing new test file, preserving251prior tests, no threshold relaxation or production changes. This exercises true view ref wiring rather than duplicating generic callback fixture. Failed gate retained as writer-callback-coverage-full-verify-summary.json.
Actual Writer integration focus passed immediately; JSDOM does not create a native caret on editing-host focus, so input assertion initially failed. Set an explicit owned paragraph Range before beforeinput, as other owned editor tests do; Chromium already validates actual native caret/input behavior. Corrected final87cases/7files pass; earlier fixture outcome retained as writer-selection-fixture-runtime.json. All production paths unchanged after effect-dependency correction.
Third fullverify939app/197files109inventory/36files35browser2resources allpass100%coverage; static provenance failed because new local evidence used strings instead of required path/marker objects. Corrected only new evidence formatting to source objects/runtime #markers and appended actual routesWriterClient integration marker, preserving old evidence/status/default/ownership. Outcome retained as evidence-schema-full-verify-summary.json.
