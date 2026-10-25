---
id: "202610241710-Z2BZNW"
title: "Canonize Writer paragraph split widow and orphan controls"
result_summary: "Connected native paragraph split widow and orphan controls to existing attributes"
status: "DONE"
priority: "high"
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
  updated_at: "2026-10-24T17:11:10.347Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-24T17:16:07.407Z"
  updated_by: "CODER"
  note: "14focused cases,strict2owner100coverage S53 B48 F14 L46;52related cases;2production Chromium cases with actual undo/redo/ODT,screenshot inspection and no errors;build and declared gates pass after format correction. Close first of two tasks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-24T17:16:08.040Z"
  updated_by: "EVALUATOR"
  note: "Represented source paragraph split controls meet first-task acceptance;ready to close."
  evaluated_sha: "14f54f1d5de0394e8b3f696106f1d64885cc3d83"
  blueprint_digest: "09e93514154cf97095c3c4661ae5e471981c63240f2bb644f791f61b0d904f78"
  evidence_refs:
    - ".agentplane/tasks/202610241710-Z2BZNW/README.md"
    - ".agentplane/tasks/202610241710-Z2BZNW/quality/20261024-171608040-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610241710-Z2BZNW/quality/20261024-171608040-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610241710-Z2BZNW/quality/20261024-171608040-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610241710-Z2BZNW/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-hashes.json"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-coverage.log"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-consumers.log"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-e2e.log"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-gates.json"
    - "output/playwright/writer-full-checkpoint/Z2BZNW-format-fixed.log"
  findings:
    - "Native definite-state reset/handler order,bounds,sensitivity asymmetry,inactive numbers and changed-output semantics are reused by actual Paragraph requests. Existing core/history/filter ownership remains authoritative;source suspicion documented as WRITER090."
    - "Strict2owner100coverage,14focused cases,52consumer cases and2production Chromium1280/390 cases pass. Real cancellation,undo/redo and ODT round-trip verified;declared gates pass after final format correction without suppression or parity promotion."
commit:
  hash: "14f54f1d5de0394e8b3f696106f1d64885cc3d83"
  message: "🖋️ Z2BZNW writer: connect native paragraph split widow and orphan controls"
comments:
  -
    author: "CODER"
    body: "Start: connect source paragraph split/widow/orphan controls to actual existing attributes;verify and close first of two tasks."
  -
    author: "CODER"
    body: "Verified: represented native paragraph split widow and orphan control contracts pass strict new-owner100coverage,related tests,production Chromium and actual undo/redo/ODT. Source asymmetry documented and preserved. First of two tasks closed;continue one keyboard/focus task before pausing goal."
events:
  -
    type: "status"
    at: "2026-10-24T17:11:14.781Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect source paragraph split/widow/orphan controls to actual existing attributes;verify and close first of two tasks."
  -
    type: "verify"
    at: "2026-10-24T17:16:07.407Z"
    author: "CODER"
    state: "ok"
    note: "14focused cases,strict2owner100coverage S53 B48 F14 L46;52related cases;2production Chromium cases with actual undo/redo/ODT,screenshot inspection and no errors;build and declared gates pass after format correction. Close first of two tasks."
  -
    type: "status"
    at: "2026-10-24T17:17:23.152Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: represented native paragraph split widow and orphan control contracts pass strict new-owner100coverage,related tests,production Chromium and actual undo/redo/ODT. Source asymmetry documented and preserved. First of two tasks closed;continue one keyboard/focus task before pausing goal."
doc_version: 3
doc_updated_at: "2026-10-24T17:17:23.153Z"
doc_updated_by: "CODER"
description: "First of exactly two tasks after J1K3KF. Connect existing keepTogether/widow/orphan core attributes through consumed native SvxExtParagraphTabPage control rules,source numeric bounds,checkboxes,handler-order sensitivity and changed-output semantics. Only writer checkout/branch,up to24primary implementation/test/doc paths plus paired records. No mixed/HTML/full textflow service port,network,other task or full suite. Task6after checkpoint. Close first task then execute one keyboard/dialog-focus task and pause goal."
sections:
  Summary: "Connect native represented paragraph split/widow/orphan control contracts to existing Writer core attributes."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired canonical/task/generated records. Consumed definite-state paragraph options only;no mixed/HTML/hyphenation/break-controller expansion,network or full suite. First of two tasks;one keyboard/focus task follows then pause goal."
  Plan: "Extract consumed SvxExtParagraphTabPage reset/AllowSplit/Widow/Orphan and changed-output decisions at native source owner. Keep source handler-order asymmetry and widget1..9bounds;checkboxes encode zero disabled values without destroying inactive numeric drafts. Introduce a bounded presentation component and wire into actual paragraph dialog request without mirrored document state. Preserve unchanged output and existing core/undo/ODT owners. Test direct decisions,UI,actual command/history/ODT and Chromium1280/390;document source suspicion,update provenance,verify,evaluate,commit and close."
  Verify Steps: "Focused Vitest for new source/control owners with strict100coverage,no ignores or threshold reductions;existing Paragraph dialog,advanced controls,toolbar/core/filter consumers. Cover initial0/nonzero,reset order,AllowSplit checkbox sensitivity versus row sensitivity,asymmetric off-handlers,1..9bounds,unchanged output,inactive numeric retention,zero checkbox encoding,real undo/redo/ODT. Production build and Chromium1280/390 actual UI/model/filter flow,screenshot inspection and no page errors. Run typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff and clean state. Task6after checkpoint;no full suite due. Evaluator pass,close first task then execute exactly one keyboard/focus task and pause goal."
  Verification: |-
    Command: focused Vitest source paragrph,split-controls,Paragraph dialog,advanced controls and actual toolbar with coverage (Z2BZNW-coverage.log). Result:14cases/5files pass;strict2owner100coverage S53/B48/F14/L46,zero skips/no ignores or thresholds changed. Scope: source Reset/handler order,sensitivity asymmetry,1..9numeric bounds,zero checkbox encoding,retained inactive numbers,unchanged output and actual controller integration. Command:npm run test:writer -- src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx. Result:52cases/4files pass,Z2BZNW-consumers.log. Scope: core/history/layout/filter. Command:npm run build;playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-split-controls.spec.ts. Result:2production Chromium cases1280/390 pass,Z2BZNW-build.log/Z2BZNW-e2e.log;no page errors,inspected both screenshots. Scope: actual Format command,cancel,undo/redo,ODT export/reopen. Command:15static/source gate argv in Z2BZNW-gates.json. Result:14initial passes;format second pass corrected in Z2BZNW-format-fixed.log. Registry build,scope lint/type/docs/deps/size/tree/provenance/resources/invariants/parity/static/doctor/routing/diff pass. Task6after checkpoint,no full suite due. Close first task then exactly one keyboard/focus task remains before pause.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-24T17:16:07.407Z — VERIFY — ok

    By: CODER

    Note: 14focused cases,strict2owner100coverage S53 B48 F14 L46;52related cases;2production Chromium cases with actual undo/redo/ODT,screenshot inspection and no errors;build and declared gates pass after format correction. Close first of two tasks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T17:16:05.719Z, excerpt_hash=sha256:23271c0d9db99a93679cdb6dee57209fbcbb1e2b2fd9d86c8a7d3663c40c9fdb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241710-Z2BZNW/blueprint/resolved-snapshot.json
    - old_digest: 09e93514154cf97095c3c4661ae5e471981c63240f2bb644f791f61b0d904f78
    - current_digest: 09e93514154cf97095c3c4661ae5e471981c63240f2bb644f791f61b0d904f78
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610241710-Z2BZNW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610241710-Z2BZNW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task commits;retain earlier work and other tasks."
  Findings: "Source definite-state handler order and changed-output behavior preserved without a second document model;old inverse checkbox labels were migrated to native Allow to split paragraph while core expectations remain unchanged. WRITER090 documents source asymmetric off-handler sensitivity and numeric rows remaining sensitive when split checkboxes disable. Strict100new-owner coverage,actual kernel/history/ODT and production browser evidence pass. Initial new browser test formatting needed a second formatting pass;final scoped check passed. Full mixed/HTML and other textflow services remain outside this leaf;no broad parity promotion,network or full suite. First of two requested tasks;one formatting keyboard/focus task follows."
extensions:
  implementation_commit:
    hash: "14f54f1d5de0394e8b3f696106f1d64885cc3d83"
    message: "🖋️ Z2BZNW writer: connect native paragraph split widow and orphan controls"
id_source: "generated"
---
## Summary

Connect native represented paragraph split/widow/orphan control contracts to existing Writer core attributes.

## Scope

Only writer checkout/branch;up to24primary paths plus paired canonical/task/generated records. Consumed definite-state paragraph options only;no mixed/HTML/hyphenation/break-controller expansion,network or full suite. First of two tasks;one keyboard/focus task follows then pause goal.

## Plan

Extract consumed SvxExtParagraphTabPage reset/AllowSplit/Widow/Orphan and changed-output decisions at native source owner. Keep source handler-order asymmetry and widget1..9bounds;checkboxes encode zero disabled values without destroying inactive numeric drafts. Introduce a bounded presentation component and wire into actual paragraph dialog request without mirrored document state. Preserve unchanged output and existing core/undo/ODT owners. Test direct decisions,UI,actual command/history/ODT and Chromium1280/390;document source suspicion,update provenance,verify,evaluate,commit and close.

## Verify Steps

Focused Vitest for new source/control owners with strict100coverage,no ignores or threshold reductions;existing Paragraph dialog,advanced controls,toolbar/core/filter consumers. Cover initial0/nonzero,reset order,AllowSplit checkbox sensitivity versus row sensitivity,asymmetric off-handlers,1..9bounds,unchanged output,inactive numeric retention,zero checkbox encoding,real undo/redo/ODT. Production build and Chromium1280/390 actual UI/model/filter flow,screenshot inspection and no page errors. Run typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff and clean state. Task6after checkpoint;no full suite due. Evaluator pass,close first task then execute exactly one keyboard/focus task and pause goal.

## Verification

Command: focused Vitest source paragrph,split-controls,Paragraph dialog,advanced controls and actual toolbar with coverage (Z2BZNW-coverage.log). Result:14cases/5files pass;strict2owner100coverage S53/B48/F14/L46,zero skips/no ignores or thresholds changed. Scope: source Reset/handler order,sensitivity asymmetry,1..9numeric bounds,zero checkbox encoding,retained inactive numbers,unchanged output and actual controller integration. Command:npm run test:writer -- src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx. Result:52cases/4files pass,Z2BZNW-consumers.log. Scope: core/history/layout/filter. Command:npm run build;playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-split-controls.spec.ts. Result:2production Chromium cases1280/390 pass,Z2BZNW-build.log/Z2BZNW-e2e.log;no page errors,inspected both screenshots. Scope: actual Format command,cancel,undo/redo,ODT export/reopen. Command:15static/source gate argv in Z2BZNW-gates.json. Result:14initial passes;format second pass corrected in Z2BZNW-format-fixed.log. Registry build,scope lint/type/docs/deps/size/tree/provenance/resources/invariants/parity/static/doctor/routing/diff pass. Task6after checkpoint,no full suite due. Close first task then exactly one keyboard/focus task remains before pause.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-24T17:16:07.407Z — VERIFY — ok

By: CODER

Note: 14focused cases,strict2owner100coverage S53 B48 F14 L46;52related cases;2production Chromium cases with actual undo/redo/ODT,screenshot inspection and no errors;build and declared gates pass after format correction. Close first of two tasks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T17:16:05.719Z, excerpt_hash=sha256:23271c0d9db99a93679cdb6dee57209fbcbb1e2b2fd9d86c8a7d3663c40c9fdb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241710-Z2BZNW/blueprint/resolved-snapshot.json
- old_digest: 09e93514154cf97095c3c4661ae5e471981c63240f2bb644f791f61b0d904f78
- current_digest: 09e93514154cf97095c3c4661ae5e471981c63240f2bb644f791f61b0d904f78
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610241710-Z2BZNW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610241710-Z2BZNW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task commits;retain earlier work and other tasks.

## Findings

Source definite-state handler order and changed-output behavior preserved without a second document model;old inverse checkbox labels were migrated to native Allow to split paragraph while core expectations remain unchanged. WRITER090 documents source asymmetric off-handler sensitivity and numeric rows remaining sensitive when split checkboxes disable. Strict100new-owner coverage,actual kernel/history/ODT and production browser evidence pass. Initial new browser test formatting needed a second formatting pass;final scoped check passed. Full mixed/HTML and other textflow services remain outside this leaf;no broad parity promotion,network or full suite. First of two requested tasks;one formatting keyboard/focus task follows.
