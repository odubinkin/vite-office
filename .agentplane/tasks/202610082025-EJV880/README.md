---
id: "202610082025-EJV880"
title: "Connect native linked cell frame clients to original formats and rendering lifetime"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T20:26:19.884Z"
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
    body: "Start: Connect original linked native SwCellFrame clients through common frame bases, format claims/history, direct rendering and recursive flat teardown; retain all prior acceptance files and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-08T20:26:20.125Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect original linked native SwCellFrame clients through common frame bases, format claims/history, direct rendering and recursive flat teardown; retain all prior acceptance files and registered deviations."
doc_version: 3
doc_updated_at: "2026-10-08T20:44:09.747Z"
doc_updated_by: "CODER"
description: "Iteration244: replace duplicated flat-row registration with native frame bases and original linked cell clients; retarget native box claims/history, recursive deletion and direct main UI/painter ownership without DTOs. Preserve registered deviations and targeted test cadence."
sections:
  Summary: "Native linked cell frame ownership and format client lifetime over original table models."
  Scope: |-
    apps/office/src/sw/source/core/layout/wsfrm.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/docnode/nodes.ts
    apps/office/src/sw/source/core/layout/paintfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/source/core/layout/native-cell-format-client.test.ts
    apps/office/src/sw/source/core/undo/native-cell-format-client-history.test.ts
    apps/office/src/sw/browser/editor/native-cell-format-client.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration244 adds native SwFrame/SwLayoutFrame original-client registration and linked upper/previous/next/lower ownership, replacing duplicated row frame GetFormat/RegisterToFormat with common native bases. SwRowFrame constructs original SwCellFrame children in box order and recursively releases flat children on destruction. SwCellFrame registers at the actual original box format, borrows typed GetFormat/GetTabBox, follows only matching native TableBoxFormatChanged/MoveTableBoxHint, and destroys a final-client format. SwTableBox ClaimFrameFormat directly retargets matching actual cell clients before model registration; Chg and SaveTable already publish exact native hints. Actual destructive column/row/table section deletion removes cell frames from their parent links before registration release, ordinary model RemoveBox remains nondestructive. Main JSX table consumes the row's original linked cell frame formats; collapsing-border painter and physical box-width query read registered native frames with bounded finally cleanup. Preserve all657 prior acceptance files byte-identically, registered save/open/recovery deviations/IO4/whole writer-view/pin/stash. Three fresh files cover hierarchy order/sibling mutations/client registration/claim/hints/last-client teardown, original-cell Undo/Redo/numeric deletion and actual main UI/measurement/painter success/exception lifetimes. One new wsfrm source has unverified native frame geometry/invalidation/content/accessibility/fly/flags/root; old316 metadata fields/order/status/default/classification/prefixes preserved and append one bounded unverified native record317, no promotion. Full content/follow/split/nested/merged/UNO/vertical/RTL/invalidation/calculation/whole parity remain partial. New/related runtime/build once physically upstream absent/restored finally; only failed/new/unexecuted closures, no passing replay. All-four100 actual counters source-bound from243 entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations. Last full237,next247,no full244. Current agent sequential ORCHESTRATOR/PLANNER/CODER/EVALUATOR roles, explicitly non-independent actual-SHA review; no network/global/subagents/source/Python/scripts/raw evidence in AP/DONE edits; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a; safe local scope authorized by standing user goal."
  Verify Steps: |-
    1. Byte-bind native SwFrame ctor/KnowsFormat/RegisterToFormat/InsertBehind/RemoveFromLayout and SwLayoutFrame ctor in wsfrm.cxx, typed GetFormat/DestroyImpl in ssfrm.cxx, Row/Cell ctor/DestroyImpl/SwClientNotify in tabfrm.cxx, SwTableBox ClaimFrameFormat cell client loop in swtable.cxx and exact MoveTableBoxHint/BoxFormatChanged history. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
    2. Fresh tests assert original SwFrame/SwLayoutFrame/SwCellFrame/row identities, default null links, original linked cell order and insertion/removal neighbors, exclusive/shared claims and matching repeated clients before model registration, distinct native borrowed hints/no sibling retarget, final-client deletion and flat recursive teardown. Real complete cell attribute Undo/Redo moves actual frames while preserving original cell/text/cursor; numeric row/column/table deletion destroys actual frame registrations and Redo creates new model owners. Real JSX/collapsing paint/width measurement read registered native frames and release clients after success/exception. No DTO/cache/layout graph copy. Full native geometry/invalidation/content/follow/accessibility/UNO remains partial.
    3. Baseline657 prior acceptance files all byte-identical; three fresh files no only/skip/todo. Existing316metadata fields/order/status/default/classification/evidence prefixes preserved, new unverified wsfrm native record appended to317; no promotion. Normal physical source lines<1000, intentional scope only.
    4. Six statics/build and exact new/related native row/cell format/border/geometry/insertion/history/mounted/ODF/Chromium selections once upstream physically absent/restored finally; no passing runtime replay. Failed/new/unexecuted-only closures retain raw threshold exits/skips. Full244 skipped per user last237,next247.
    5. Actual all-four100 app/inventory coverage reconstructs source/map equality or complete unchanged declaration/body/enclosing branch/all branch locations from243; no clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
    6. Restored-vendor UI generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audit. IO4/whole writer-view/pin/stash preserved; no AP upstream/application/Python/scripts/raw maps/results. Current-agent explicitly non-independent EVALUATOR binds actual implementation SHA and reconstructs four certificates byte-identically. Clean meaningful close/DONE immutability; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a append, goal ACTIVE.
  Verification: |-
    Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json and closure1.json.
    Result:1318 unique app cases passed, including12 fresh cases, plus25 Chromium cases; zero passing replay, unhandled errors or flaky cases. Initial1317pass1fail; failed-only closure1pass2skip corrected a fresh equivalent CSS unit expectation. Build/runtime physically upstream absent, restored finally. Raw partial coverage threshold exits1 retained.
    Command: actual source/map-bound cumulative coverage reconstruction in evidence/final-coverage.json.
    Result: all-four100% app17793lines/19535statements/4461functions/14394branches, inventory1464/1523/384/1081;314app/38inventory sources. Prior243 accepted only for entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations;5 modified-source region proofs. Raw focused V8 painter inferred-else negative retained; entire valid initial current-source maps/counters already all-four100 supply that module, never sanitized. Unchanged inventory/infra runtime not replayed.
    Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; UI generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Eight native source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65. IO4, whole writer-view, stash and parent exact-prefix baseline preserved. Doctor retains two historical warnings for managed hook readiness and old DONE2Z3962 missing implementation hash; completed leaves untouched.
    Evidence: bounded English JSON identifiers/hashes/counts under evidence; raw output/maps/results/source snapshots/reconstruction scripts only in ignored app cache. Zero forbidden AgentPlane upstream/application/Python/scripts/raw evidence.
    Scope: original linked SwFrame/SwLayoutFrame/SwCellFrame registration and lifetimes, source-shaped row children, matching physical clients before box claim registration, history retargeting, recursive deletion, actual JSX/painter/width queries. All657 prior acceptance files byte-identical;3fresh files/12cases. Existing316 metadata fields/order/status/default/classification/evidence prefixes preserved, one new unverified wsfrm record317, no promotion; native physical files<1000lines.
    Skipped: full suite.
    Reason: explicit user cadence once per10tasks, last237,next247.
    Risk: broader unrelated behavior is not re-executed this leaf; unchanged whole source/maps retain prior actual certified counters.
    Approval: standing user goal and explicit testing instructions.
    Residual gaps: full native frame geometry/flags/invalidation/content/follows/accessibility/fly/root, pooling/nested/merged/UNO/calculation/modified-state and whole core/browser parity remain partial; goal ACTIVE. Actual-SHA explicitly non-independent current-agent EVALUATOR required before closure.
  Rollback Plan: "Revert the intentional implementation commit through a new approved follow-up without rewriting completed task history. Preserve registered I/O deviations, actual coverage certificates and original model ownership."
  Findings: |-
    Previous243 is DONE at implementation57b9fda0a19503f9df84fccce914b73f71c44474; main/direct clean preflight, parent only active. Read-only comparison found absent native cell frame clients and duplicated row registration, missing linked row cell ownership. Standing user goal authorizes this safe local coherent repair; no repeat approval requested. Native GetFormat belongs to SwLayoutFrame (ssfrm.cxx), while shared registration/links belong to SwFrame (wsfrm.cxx). A guessed absent layfrm.cxx path and a no-match wsfrm MoveTableBox search were followed by route recomputation and exact discovered sources; no mutation or runtime was performed on those errors. Full frame invalidation/geometry/content/accessibility/follows remain partial. No global/network/subagents/AP copied source/raw evidence.
    Implementation: SwRowFrame and SwCellFrame now inherit actual common native frame registration and original linked upper/next/previous/lower pointers. Row construction creates real original cells; box claims migrate matching physical clients before model registration, while original change/history hints retain actual identities. Recursive flat deletion removes frame links and registrations before original box disposal. Main JSX/collapsing painter/box width use registered native frames with finally cleanup. No cloned frame graph, cell DTO cache or new TextRuns bridge.
    Observation: initial static typecheck rejected a fresh test passing a transaction to an atomic hint API. Resolution: test now uses the real RunNotificationTransaction with atomic MoveTableBoxHint notifications; final six static gates pass. No production expansion.
    Observation: initial1318app scenarios yielded1317pass1fail in one fresh mounted CSS assertion. Resolution: expected native30twip border changed from equivalent2px to actual1.5pt, preserving exact color/padding and all model/history/lifetime assertions. Failed-only1pass2skip, no passing replay. All25Chromium pass.
    Observation: focused V8 paint map contains inferred else counter-92. Resolution: raw map retained; reconstruction selects the entire independently valid initial current-byte-identical painter source/maps/counters already all-four100. No individual counter clamping or sanitization; aggregate invalidation is explicit in final-coverage/proof.
    Observation: parity inventory rejected a final appended native record because runtime paths must be ordered. Resolution: insert new wsfrm record into required runtime ordering while preserving all316 prior records' relative order and fields; source provenance preserves original order plus the new record. An intermediate whole-provenance sort was restored before final gates; scope-integrity independently proves prior prefixes/order/defaults/statuses/classifications unchanged.
    Result:1318unique app passes/12fresh/25Chromium;657 old acceptance files byte-identical;314app/38inventory actual all-four100 coverage. Six statics/build/restored source/governance/artifact audits pass;8native sources pinned, IO4/wholewriter-view/stash preserved. All raw files/scripts stay ignored outside AgentPlane. Last full237,next247,no full244.
    Full native geometry/flags/invalidation/content/follows/accessibility/fly/root/UNO and broader calculation/pooling/nested/merged/modified-state parity remain unverified. No full parity promotion, registered save/open/recovery/settings deviations unchanged; goal ACTIVE. Current-agent review remains explicitly non-independent and will bind actual implementation SHA.
id_source: "generated"
---
## Summary

Native linked cell frame ownership and format client lifetime over original table models.

## Scope

apps/office/src/sw/source/core/layout/wsfrm.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/docnode/nodes.ts
apps/office/src/sw/source/core/layout/paintfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/source/core/layout/native-cell-format-client.test.ts
apps/office/src/sw/source/core/undo/native-cell-format-client-history.test.ts
apps/office/src/sw/browser/editor/native-cell-format-client.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration244 adds native SwFrame/SwLayoutFrame original-client registration and linked upper/previous/next/lower ownership, replacing duplicated row frame GetFormat/RegisterToFormat with common native bases. SwRowFrame constructs original SwCellFrame children in box order and recursively releases flat children on destruction. SwCellFrame registers at the actual original box format, borrows typed GetFormat/GetTabBox, follows only matching native TableBoxFormatChanged/MoveTableBoxHint, and destroys a final-client format. SwTableBox ClaimFrameFormat directly retargets matching actual cell clients before model registration; Chg and SaveTable already publish exact native hints. Actual destructive column/row/table section deletion removes cell frames from their parent links before registration release, ordinary model RemoveBox remains nondestructive. Main JSX table consumes the row's original linked cell frame formats; collapsing-border painter and physical box-width query read registered native frames with bounded finally cleanup. Preserve all657 prior acceptance files byte-identically, registered save/open/recovery deviations/IO4/whole writer-view/pin/stash. Three fresh files cover hierarchy order/sibling mutations/client registration/claim/hints/last-client teardown, original-cell Undo/Redo/numeric deletion and actual main UI/measurement/painter success/exception lifetimes. One new wsfrm source has unverified native frame geometry/invalidation/content/accessibility/fly/flags/root; old316 metadata fields/order/status/default/classification/prefixes preserved and append one bounded unverified native record317, no promotion. Full content/follow/split/nested/merged/UNO/vertical/RTL/invalidation/calculation/whole parity remain partial. New/related runtime/build once physically upstream absent/restored finally; only failed/new/unexecuted closures, no passing replay. All-four100 actual counters source-bound from243 entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations. Last full237,next247,no full244. Current agent sequential ORCHESTRATOR/PLANNER/CODER/EVALUATOR roles, explicitly non-independent actual-SHA review; no network/global/subagents/source/Python/scripts/raw evidence in AP/DONE edits; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a; safe local scope authorized by standing user goal.

## Verify Steps

1. Byte-bind native SwFrame ctor/KnowsFormat/RegisterToFormat/InsertBehind/RemoveFromLayout and SwLayoutFrame ctor in wsfrm.cxx, typed GetFormat/DestroyImpl in ssfrm.cxx, Row/Cell ctor/DestroyImpl/SwClientNotify in tabfrm.cxx, SwTableBox ClaimFrameFormat cell client loop in swtable.cxx and exact MoveTableBoxHint/BoxFormatChanged history. Pin9bc445578031fecf56086729d8e4940c77e14d65; no source copies in AP.
2. Fresh tests assert original SwFrame/SwLayoutFrame/SwCellFrame/row identities, default null links, original linked cell order and insertion/removal neighbors, exclusive/shared claims and matching repeated clients before model registration, distinct native borrowed hints/no sibling retarget, final-client deletion and flat recursive teardown. Real complete cell attribute Undo/Redo moves actual frames while preserving original cell/text/cursor; numeric row/column/table deletion destroys actual frame registrations and Redo creates new model owners. Real JSX/collapsing paint/width measurement read registered native frames and release clients after success/exception. No DTO/cache/layout graph copy. Full native geometry/invalidation/content/follow/accessibility/UNO remains partial.
3. Baseline657 prior acceptance files all byte-identical; three fresh files no only/skip/todo. Existing316metadata fields/order/status/default/classification/evidence prefixes preserved, new unverified wsfrm native record appended to317; no promotion. Normal physical source lines<1000, intentional scope only.
4. Six statics/build and exact new/related native row/cell format/border/geometry/insertion/history/mounted/ODF/Chromium selections once upstream physically absent/restored finally; no passing runtime replay. Failed/new/unexecuted-only closures retain raw threshold exits/skips. Full244 skipped per user last237,next247.
5. Actual all-four100 app/inventory coverage reconstructs source/map equality or complete unchanged declaration/body/enclosing branch/all branch locations from243; no clamping/sanitization/weaker thresholds. Unchanged inventory/infra runtime not replayed.
6. Restored-vendor UI generator/source-tree/provenance/inventory invariants/parity, doctor/routing/diff/artifact audit. IO4/whole writer-view/pin/stash preserved; no AP upstream/application/Python/scripts/raw maps/results. Current-agent explicitly non-independent EVALUATOR binds actual implementation SHA and reconstructs four certificates byte-identically. Clean meaningful close/DONE immutability; parent exact-prefix710281/hash fccb2f0dca6bfdaa56b2a602f0468b718442a13c68e175bdfb935f427e3de80a append, goal ACTIVE.

## Verification

Command: npm run test:static; exact new/related runtime selections in evidence/targeted-profile.json and closure1.json.
Result:1318 unique app cases passed, including12 fresh cases, plus25 Chromium cases; zero passing replay, unhandled errors or flaky cases. Initial1317pass1fail; failed-only closure1pass2skip corrected a fresh equivalent CSS unit expectation. Build/runtime physically upstream absent, restored finally. Raw partial coverage threshold exits1 retained.
Command: actual source/map-bound cumulative coverage reconstruction in evidence/final-coverage.json.
Result: all-four100% app17793lines/19535statements/4461functions/14394branches, inventory1464/1523/384/1081;314app/38inventory sources. Prior243 accepted only for entire identical source/maps or complete unchanged declaration/body/enclosing branch/all locations;5 modified-source region proofs. Raw focused V8 painter inferred-else negative retained; entire valid initial current-source maps/counters already all-four100 supply that module, never sanitized. Unchanged inventory/infra runtime not replayed.
Command: npm run format:check; lint; typecheck; check:dependencies; check:docs; check:file-size; UI generator --check; check:source-tree; check:source-provenance; inventory:invariants; inventory:parity; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Eight native source files byte-bound to pin9bc445578031fecf56086729d8e4940c77e14d65. IO4, whole writer-view, stash and parent exact-prefix baseline preserved. Doctor retains two historical warnings for managed hook readiness and old DONE2Z3962 missing implementation hash; completed leaves untouched.
Evidence: bounded English JSON identifiers/hashes/counts under evidence; raw output/maps/results/source snapshots/reconstruction scripts only in ignored app cache. Zero forbidden AgentPlane upstream/application/Python/scripts/raw evidence.
Scope: original linked SwFrame/SwLayoutFrame/SwCellFrame registration and lifetimes, source-shaped row children, matching physical clients before box claim registration, history retargeting, recursive deletion, actual JSX/painter/width queries. All657 prior acceptance files byte-identical;3fresh files/12cases. Existing316 metadata fields/order/status/default/classification/evidence prefixes preserved, one new unverified wsfrm record317, no promotion; native physical files<1000lines.
Skipped: full suite.
Reason: explicit user cadence once per10tasks, last237,next247.
Risk: broader unrelated behavior is not re-executed this leaf; unchanged whole source/maps retain prior actual certified counters.
Approval: standing user goal and explicit testing instructions.
Residual gaps: full native frame geometry/flags/invalidation/content/follows/accessibility/fly/root, pooling/nested/merged/UNO/calculation/modified-state and whole core/browser parity remain partial; goal ACTIVE. Actual-SHA explicitly non-independent current-agent EVALUATOR required before closure.

## Rollback Plan

Revert the intentional implementation commit through a new approved follow-up without rewriting completed task history. Preserve registered I/O deviations, actual coverage certificates and original model ownership.

## Findings

Previous243 is DONE at implementation57b9fda0a19503f9df84fccce914b73f71c44474; main/direct clean preflight, parent only active. Read-only comparison found absent native cell frame clients and duplicated row registration, missing linked row cell ownership. Standing user goal authorizes this safe local coherent repair; no repeat approval requested. Native GetFormat belongs to SwLayoutFrame (ssfrm.cxx), while shared registration/links belong to SwFrame (wsfrm.cxx). A guessed absent layfrm.cxx path and a no-match wsfrm MoveTableBox search were followed by route recomputation and exact discovered sources; no mutation or runtime was performed on those errors. Full frame invalidation/geometry/content/accessibility/follows remain partial. No global/network/subagents/AP copied source/raw evidence.
Implementation: SwRowFrame and SwCellFrame now inherit actual common native frame registration and original linked upper/next/previous/lower pointers. Row construction creates real original cells; box claims migrate matching physical clients before model registration, while original change/history hints retain actual identities. Recursive flat deletion removes frame links and registrations before original box disposal. Main JSX/collapsing painter/box width use registered native frames with finally cleanup. No cloned frame graph, cell DTO cache or new TextRuns bridge.
Observation: initial static typecheck rejected a fresh test passing a transaction to an atomic hint API. Resolution: test now uses the real RunNotificationTransaction with atomic MoveTableBoxHint notifications; final six static gates pass. No production expansion.
Observation: initial1318app scenarios yielded1317pass1fail in one fresh mounted CSS assertion. Resolution: expected native30twip border changed from equivalent2px to actual1.5pt, preserving exact color/padding and all model/history/lifetime assertions. Failed-only1pass2skip, no passing replay. All25Chromium pass.
Observation: focused V8 paint map contains inferred else counter-92. Resolution: raw map retained; reconstruction selects the entire independently valid initial current-byte-identical painter source/maps/counters already all-four100. No individual counter clamping or sanitization; aggregate invalidation is explicit in final-coverage/proof.
Observation: parity inventory rejected a final appended native record because runtime paths must be ordered. Resolution: insert new wsfrm record into required runtime ordering while preserving all316 prior records' relative order and fields; source provenance preserves original order plus the new record. An intermediate whole-provenance sort was restored before final gates; scope-integrity independently proves prior prefixes/order/defaults/statuses/classifications unchanged.
Result:1318unique app passes/12fresh/25Chromium;657 old acceptance files byte-identical;314app/38inventory actual all-four100 coverage. Six statics/build/restored source/governance/artifact audits pass;8native sources pinned, IO4/wholewriter-view/stash preserved. All raw files/scripts stay ignored outside AgentPlane. Last full237,next247,no full244.
Full native geometry/flags/invalidation/content/follows/accessibility/fly/root/UNO and broader calculation/pooling/nested/merged/modified-state parity remain unverified. No full parity promotion, registered save/open/recovery/settings deviations unchanged; goal ACTIVE. Current-agent review remains explicitly non-independent and will bind actual implementation SHA.
