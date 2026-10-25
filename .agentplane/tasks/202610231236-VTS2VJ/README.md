---
id: "202610231236-VTS2VJ"
title: "Implement native formula reference pointing and mouse selection"
result_summary: "verified-202610231236-VTS2VJ"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T12:36:38.858Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-23T17:00:19.095Z"
  updated_by: "CODER"
  note: "verified-202610231236-VTS2VJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-23T16:59:36.289Z"
  updated_by: "EVALUATOR"
  note: "Implementation f111d0b9c08f satisfies the approved local-reference/native mouse selection profile with real owners and stable edit lifetime;837Calc cases and raw100 are tied to473committed source/test/config hashes."
  evaluated_sha: "f111d0b9c08f48c5d84a277ed5728900fa47ff9b"
  blueprint_digest: "df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19"
  evidence_refs:
    - ".agentplane/tasks/202610231236-VTS2VJ/README.md"
    - ".agentplane/tasks/202610231236-VTS2VJ/quality/20261023-165936289-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610231236-VTS2VJ/quality/20261023-165936289-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610231236-VTS2VJ/quality/20261023-165936289-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610231236-VTS2VJ/evidence/pointing-final/checks.json"
    - ".agentplane/tasks/202610231236-VTS2VJ/evidence/pointing-final/source-hashes.json"
    - ".agentplane/tasks/202610231236-VTS2VJ/evidence/pointing-final/calc-coverage.log"
    - ".agentplane/tasks/202610231236-VTS2VJ/evidence/pointing-final/chromium-worker.log"
    - ".agentplane/tasks/202610231236-VTS2VJ/evidence/pointing-gates"
  findings:
    - "Original input/reference/view/mark contracts are represented without alternate cell models or fake native services;real active view/document identity rejects unsupported cross-document contexts."
    - "Click/drag/full-axis/modifier/negative selection,capture/scroll/hidden geometry,UTF16 equals protection,caret/focus/IME/paste/manual-word semantics,history and ODS recalculation have actual-owner evidence;5Chromium/Worker and33related Writer/VCL scenarios pass."
    - "All authored Calc lint/format and required build/type/static/source/registry gates pass. Broad npm lint diagnostic retains unchanged Writer/ignored-probe baseline errors;the report does not certify that broad command."
commit:
  hash: "ce222357a35ed6b4c342e648f3de5aabd71d3bcc"
  message: "🧩 VTS2VJ task: persist verified quality and gate evidence"
comments:
  -
    author: "CODER"
    body: "Start: implement the human-prioritized native mouse reference entry and selection block in calc before continuing76."
  -
    author: "CODER"
    body: "Verified: verified-202610231236-VTS2VJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-23T12:36:45.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the human-prioritized native mouse reference entry and selection block in calc before continuing76."
  -
    type: "verify"
    at: "2026-10-23T16:55:00.355Z"
    author: "CODER"
    state: "ok"
    note: "Approved Calc scope passes837tests/213files,raw100 S/B/F/L,5Chromium/Worker and33related Writer/VCL scenarios;473source/test/config hashes stable. Scoped Calc lint/format,build/types and static/source/registry gates pass. Broad npm lint baseline outside77 is explicitly recorded. Evidence: evidence/pointing-final/checks.json."
  -
    type: "verify"
    at: "2026-10-23T16:55:27.923Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610231236-VTS2VJ"
  -
    type: "verify"
    at: "2026-10-23T16:59:30.281Z"
    author: "CODER"
    state: "ok"
    note: "Reviewed implementation f111d0b9c08f: same473source/test/config hashes as complete837scenario Calc raw100 run,5Chromium/Worker and33Writer/VCL checks. Scoped authored/static/source/registry gates pass;broader lint baseline outside77 recorded. Durable evidence/pointing-final and pointing-gates."
  -
    type: "verify"
    at: "2026-10-23T16:59:50.878Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610231236-VTS2VJ"
  -
    type: "verify"
    at: "2026-10-23T17:00:19.095Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610231236-VTS2VJ"
  -
    type: "status"
    at: "2026-10-23T17:00:19.231Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610231236-VTS2VJ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-23T17:00:19.231Z"
doc_updated_by: "CODER"
description: "Block77 is the human-requested next priority ahead of pending76: implement upstream ScInputHandler reference entry and ScTabView reference mode over real draft/caret/view/mark owners,then browser mouse cells/ranges/row/column/full-sheet and modifier selection. Preserve edit origin,UTF16 replacement selection,formula equals protection,reference continuation,drag lifetime,focus,commit/cancel,visual reference and ordinary selection distinctions. Support maximum source-backed pointing and selection scenarios within the current local-reference core;do not simulate clipboard fill/move,matrix,merged or external-reference services. Up to110 source/test/registry/evidence-probe paths,only vite-office-calc branch calc. Keep Writer shared controls/styles. Require real controller/mounted/Chromium/Worker scenarios,Calc and changed shared raw100,related consumers,build and all static/source/registry checks. No full all-app replay before the established checkpoint80."
sections:
  Summary: "Make mouse reference entry usable while editing formulas and implement source-backed mouse selection for cells,ranges,rows and columns."
  Scope: "Human-prioritized block77 ahead of open76. Native input/reference/view/mark contracts plus browser pointer,capture,hit-testing,scroll/focus/caret and reference overlays using shared Writer styling. Up to110 source/test/registry/evidence-probe paths,only calc checkout/branch. Local-reference supported formula domain;unported clipboard fill/move,merged,external/3D/matrix calculation services remain explicit. No network,outside-repo access or merges."
  Plan: "Port original input reference selection/continuation and view reference anchor/end state first;bind actual controlled editor selection to those contracts. Route formula pointing before ordinary Commit. Add drag/capture/scroll and header reference/range selection,then native modifier and ordinary selection scenarios with distinct reference painting. Verify exact source vectors,actual controller/history/formula results and mounted/Chromium/DOM-free Worker interactions. Achieve unchanged raw100 for Calc and changed shared owners and run related/build/static/source/registry gates. Keep76/74 open until their own acceptance;full all-app cadence80."
  Verify Steps: "Test source-shaped SetReference/AddRefEntry and reference view lifetime with actual owners:UTF16/reversed selections,never overwrite equals,successive click replacement,drag forward/backward,single/range/full-axis references,operator/separator continuation,existing/formula-bar/inline edits,commit/cancel/error recovery. Test ordinary cell/header mouse selection,Shift range extension,Ctrl/Cmd disjoint selection and deselection,drag endpoints,capture cancellation,scroll/hidden geometry and edit-origin/focus preservation. Exercise calculation,Undo/Redo and ODS reopen after pointing-created formulas. Actual mounted React and Chromium/DOM-free Worker must verify pointer/caret/painting contracts. Run complete Calc and changed shared raw100 S/B/F/L without threshold/exclusion changes,related consumers,production build,and type/lint/format/boundaries/JSDoc/size/source/provenance/registry/resources/static/routing/doctor. No full all-app run before80."
  Verification: |-
    Verified approved Calc scope. Complete current-state Calc run:837scenarios/213files pass;raw100 statements15210/15210,branches9269/9269,functions2620/2620,lines13623/13623. Five actual Chromium1280/390px and DOM-free Worker scenarios pass,including stable edit-view identity/focus after reference scrolling,mouse caret/word editing and formula calculation. Related Writer/VCL:33scenarios/3files pass. All473Calc source/test/config hashes remained unchanged through final verification. Production build and application/tools TypeScript,all-Calc lint/format,JSDoc,size,resources,static,module boundaries,source-tree,provenance,Calc registry,routing and doctor pass. Immutable receipts are under evidence/pointing-final. Global npm lint remains failing on unchanged Writer ODT-boundary fixtures and ignored historical output probes;no broad lint success or whole native Calc parity is claimed. No changed shared production modules. Full all-application replay is deferred until80 under the human cadence.76/74 and the overall goal remain open.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-23T16:55:00.355Z — VERIFY — ok

    By: CODER

    Note: Approved Calc scope passes837tests/213files,raw100 S/B/F/L,5Chromium/Worker and33related Writer/VCL scenarios;473source/test/config hashes stable. Scoped Calc lint/format,build/types and static/source/registry gates pass. Broad npm lint baseline outside77 is explicitly recorded. Evidence: evidence/pointing-final/checks.json.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:54:59.852Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
    - old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610231236-VTS2VJ -m 🧩 VTS2VJ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-23T16:55:27.923Z — VERIFY — ok

    By: CODER

    Note: verified-202610231236-VTS2VJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:55:00.408Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
    - old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit 9049f92885be2f14820063724e009fd7d09ba562
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-23T16:59:30.281Z — VERIFY — ok

    By: CODER

    Note: Reviewed implementation f111d0b9c08f: same473source/test/config hashes as complete837scenario Calc raw100 run,5Chromium/Worker and33Writer/VCL checks. Scoped authored/static/source/registry gates pass;broader lint baseline outside77 recorded. Durable evidence/pointing-final and pointing-gates.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:55:27.975Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
    - old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit f111d0b9c08f48c5d84a277ed5728900fa47ff9b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-23T16:59:50.878Z — VERIFY — ok

    By: CODER

    Note: verified-202610231236-VTS2VJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:59:30.337Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
    - old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit f111d0b9c08f48c5d84a277ed5728900fa47ff9b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-10-23T17:00:19.095Z — VERIFY — ok

    By: CODER

    Note: verified-202610231236-VTS2VJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:59:50.935Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
    - old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit ce222357a35ed6b4c342e648f3de5aabd71d3bcc
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task77 implementation commits while preserving75,76 checkpoint and integrated user changes."
  Findings: |-
    Implemented human priority77 before pending76. Only vite-office-calc branch calc was changed;no network,merges or new checkout. Actual native owners now handle local single-line formula reference entry:ScInputHandler SetReference/AddRefEntry/RemoveSelection and selected-reference lifecycle,ScAddress/ScRange local OOO Format,ScModule ordered receiver dispatch and real active-view/document identity,ScViewData reference fields,and ScTabView block/reference/function-set anchor state. Input binding borrows the actual ScTabViewShell and one controller draft/UTF16 caret. External/inactive document contexts,nonlocal/alternate formatting and unsupported VCL device requests reject explicitly rather than using fake native services.

    The browser reuses Writer/shared menus,controls,fonts/styles and VCL pointer capture. Click/drag/backward ranges,whole rows/columns/sheet,Shift and Ctrl/Cmd addition/subtraction and Ctrl+Shift extension preserve native marks and edit origin. The active formula frame uses pinned light CALCREFERENCE0xef0fff. Actual hidden/resized native geometry drives hit testing and endpoint reveal. Native mouse Shift/marking lifetime and original first-Ctrl-click behavior are retained;CALC-259 documents the intentional upstream i3875 workaround. Existing selection/row/column/AutoSum/sheet commands use the actual view shell and original block transitions. Complete drag transfer/fill,range-finder/color-cycling/handles,external/3D/matrix,merged/protected/split/device and full keyboard cursor services remain unported;browser out-of-client repeat uses the native maximum300ms. Foundation/B/unverified broad module parity is retained.

    The actual inline editor now lives for the edit session independently of virtual cell painting. One DOM input retains focus,caret and draft when its cell leaves the paint window;pure readonly native typography is shared with cell painting. Focus restoration uses preventScroll so the browser cannot override native endpoint reveal. Focus-only transitions preserve selected-reference state;explicit edit-view mouse input clears it and enters TABLE before caret/word selection. Paste/IME commands collapse automatically selected references before browser editing;manual text selection keeps ordinary replacement semantics. Associated DOM text guards reject stale selection notifications. Active replacement preserves existing-content classification and resets actual UTF16 caret bounds without adding history.

    Command: npm run test:coverage:calc -- --coverage.reportOnFailure=true;Result:pass;Evidence:837scenarios213files and raw100 S15210/15210 B9269/9269 F2620/2620 L13623/13623 in evidence/pointing-final/calc-coverage.log and coverage-summary.json;Scope:complete current Calc and its configured integration owners. All473source/test/config hashes are stored in source-hashes.json and verified unchanged after the run. Thresholds/exclusions/configuration were not changed. Initial diagnostic failures and source refinements remain in output/playwright/task77-* logs;no failed diagnostic is presented as final success. The inherited IndexedDB-list query race now awaits the actual list promise;modal tests check actual inert ancestry after the legitimate viewport wrapper change. An inherited Calc ODS test non-null assertion was replaced by an equivalent typed fixture access.

    Command: npx playwright test e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc;Result:pass;Evidence:5scenarios in evidence/pointing-final/chromium-worker.log;Scope:production Chromium1280/390,real mouse capture/caret/focus/operator continuation/calculation,cell/header modifiers,edit-view identity after scrolling,and actual production controller/input/view/document/history owners in a DOM-free Worker. Unit persistence acceptance reopens pointer-created ODS formulas and verifies dependency recalculation and Undo/Redo.

    Command: npx vitest run src/vcl/browser/use-window-tracking.test.tsx and npx vitest run src/sw/browser/presentation/WriterRulers-tracking.test.tsx src/sw/browser/presentation/WriterRulers-document-drag.test.tsx;Result:pass;Evidence:33scenarios3files in evidence/pointing-final/window-tracking.log and writer-rulers.log;Scope:related shared Writer/VCL capture consumers;no shared production module changed.

    Command: npm run build; npm run typecheck:tools; npx eslint apps/office/src/sc apps/office/e2e/calc --max-warnings 0; npx prettier --check apps/office/src/sc apps/office/e2e/calc; npm run check:docs; npm run check:file-size; npm run check:calc-resources; node scripts/check-static-build.mjs; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor;Result:pass;Evidence:checks.json records exact final logs and hashes;Scope:all authored Calc and required production/static/source/registry gates.464commands/11menus/17policy dispositions;zero semantic registry violations. All intentional paths fit the approved110-path budget.

    Command: npm run lint;Result:fail;Evidence:output/playwright/task77-lint3.log;Scope:the broad diagnostic includes unchanged Writer ODT-boundary fixture lint and ignored historical output probes. Writer source remains identical to HEAD;all authored Calc source/E2E lint passes. This is a recorded baseline outside77,not a green broad lint claim or a policy/threshold weakening.

    Skipped:full all-application test replay before80. Reason:the human explicitly requested related/application checks between the established ten-task checkpoints. Risk:unrelated application regressions are not re-certified by this Calc block. Approval:standing human cadence. Complete Calc,actual Chromium/Worker and related Writer/VCL consumers were executed. Tasks76/74 remain unfinished under their own acceptance;the overall goal is neither complete nor paused.
extensions:
  implementation_commit:
    hash: "f111d0b9c08f48c5d84a277ed5728900fa47ff9b"
    message: "🧩 VTS2VJ feat: add native formula pointing and mouse selection"
id_source: "generated"
---
## Summary

Make mouse reference entry usable while editing formulas and implement source-backed mouse selection for cells,ranges,rows and columns.

## Scope

Human-prioritized block77 ahead of open76. Native input/reference/view/mark contracts plus browser pointer,capture,hit-testing,scroll/focus/caret and reference overlays using shared Writer styling. Up to110 source/test/registry/evidence-probe paths,only calc checkout/branch. Local-reference supported formula domain;unported clipboard fill/move,merged,external/3D/matrix calculation services remain explicit. No network,outside-repo access or merges.

## Plan

Port original input reference selection/continuation and view reference anchor/end state first;bind actual controlled editor selection to those contracts. Route formula pointing before ordinary Commit. Add drag/capture/scroll and header reference/range selection,then native modifier and ordinary selection scenarios with distinct reference painting. Verify exact source vectors,actual controller/history/formula results and mounted/Chromium/DOM-free Worker interactions. Achieve unchanged raw100 for Calc and changed shared owners and run related/build/static/source/registry gates. Keep76/74 open until their own acceptance;full all-app cadence80.

## Verify Steps

Test source-shaped SetReference/AddRefEntry and reference view lifetime with actual owners:UTF16/reversed selections,never overwrite equals,successive click replacement,drag forward/backward,single/range/full-axis references,operator/separator continuation,existing/formula-bar/inline edits,commit/cancel/error recovery. Test ordinary cell/header mouse selection,Shift range extension,Ctrl/Cmd disjoint selection and deselection,drag endpoints,capture cancellation,scroll/hidden geometry and edit-origin/focus preservation. Exercise calculation,Undo/Redo and ODS reopen after pointing-created formulas. Actual mounted React and Chromium/DOM-free Worker must verify pointer/caret/painting contracts. Run complete Calc and changed shared raw100 S/B/F/L without threshold/exclusion changes,related consumers,production build,and type/lint/format/boundaries/JSDoc/size/source/provenance/registry/resources/static/routing/doctor. No full all-app run before80.

## Verification

Verified approved Calc scope. Complete current-state Calc run:837scenarios/213files pass;raw100 statements15210/15210,branches9269/9269,functions2620/2620,lines13623/13623. Five actual Chromium1280/390px and DOM-free Worker scenarios pass,including stable edit-view identity/focus after reference scrolling,mouse caret/word editing and formula calculation. Related Writer/VCL:33scenarios/3files pass. All473Calc source/test/config hashes remained unchanged through final verification. Production build and application/tools TypeScript,all-Calc lint/format,JSDoc,size,resources,static,module boundaries,source-tree,provenance,Calc registry,routing and doctor pass. Immutable receipts are under evidence/pointing-final. Global npm lint remains failing on unchanged Writer ODT-boundary fixtures and ignored historical output probes;no broad lint success or whole native Calc parity is claimed. No changed shared production modules. Full all-application replay is deferred until80 under the human cadence.76/74 and the overall goal remain open.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-23T16:55:00.355Z — VERIFY — ok

By: CODER

Note: Approved Calc scope passes837tests/213files,raw100 S/B/F/L,5Chromium/Worker and33related Writer/VCL scenarios;473source/test/config hashes stable. Scoped Calc lint/format,build/types and static/source/registry gates pass. Broad npm lint baseline outside77 is explicitly recorded. Evidence: evidence/pointing-final/checks.json.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:54:59.852Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
- old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610231236-VTS2VJ -m 🧩 VTS2VJ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-23T16:55:27.923Z — VERIFY — ok

By: CODER

Note: verified-202610231236-VTS2VJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:55:00.408Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
- old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit 9049f92885be2f14820063724e009fd7d09ba562
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-23T16:59:30.281Z — VERIFY — ok

By: CODER

Note: Reviewed implementation f111d0b9c08f: same473source/test/config hashes as complete837scenario Calc raw100 run,5Chromium/Worker and33Writer/VCL checks. Scoped authored/static/source/registry gates pass;broader lint baseline outside77 recorded. Durable evidence/pointing-final and pointing-gates.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:55:27.975Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
- old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit f111d0b9c08f48c5d84a277ed5728900fa47ff9b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-23T16:59:50.878Z — VERIFY — ok

By: CODER

Note: verified-202610231236-VTS2VJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:59:30.337Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
- old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit f111d0b9c08f48c5d84a277ed5728900fa47ff9b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-10-23T17:00:19.095Z — VERIFY — ok

By: CODER

Note: verified-202610231236-VTS2VJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-23T16:59:50.935Z, excerpt_hash=sha256:0577bf1c157b7d229284a2fb8cfbe37ec067bdbee1167dba2ee9553d007156a2

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610231236-VTS2VJ/blueprint/resolved-snapshot.json
- old_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- current_digest: df14cbfd3d7f242642745d0fb119e82d2d34e83140a4a2f3736582764e9fef19
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610231236-VTS2VJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610231236-VTS2VJ --result verified-202610231236-VTS2VJ --commit ce222357a35ed6b4c342e648f3de5aabd71d3bcc
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task77 implementation commits while preserving75,76 checkpoint and integrated user changes.

## Findings

Implemented human priority77 before pending76. Only vite-office-calc branch calc was changed;no network,merges or new checkout. Actual native owners now handle local single-line formula reference entry:ScInputHandler SetReference/AddRefEntry/RemoveSelection and selected-reference lifecycle,ScAddress/ScRange local OOO Format,ScModule ordered receiver dispatch and real active-view/document identity,ScViewData reference fields,and ScTabView block/reference/function-set anchor state. Input binding borrows the actual ScTabViewShell and one controller draft/UTF16 caret. External/inactive document contexts,nonlocal/alternate formatting and unsupported VCL device requests reject explicitly rather than using fake native services.

The browser reuses Writer/shared menus,controls,fonts/styles and VCL pointer capture. Click/drag/backward ranges,whole rows/columns/sheet,Shift and Ctrl/Cmd addition/subtraction and Ctrl+Shift extension preserve native marks and edit origin. The active formula frame uses pinned light CALCREFERENCE0xef0fff. Actual hidden/resized native geometry drives hit testing and endpoint reveal. Native mouse Shift/marking lifetime and original first-Ctrl-click behavior are retained;CALC-259 documents the intentional upstream i3875 workaround. Existing selection/row/column/AutoSum/sheet commands use the actual view shell and original block transitions. Complete drag transfer/fill,range-finder/color-cycling/handles,external/3D/matrix,merged/protected/split/device and full keyboard cursor services remain unported;browser out-of-client repeat uses the native maximum300ms. Foundation/B/unverified broad module parity is retained.

The actual inline editor now lives for the edit session independently of virtual cell painting. One DOM input retains focus,caret and draft when its cell leaves the paint window;pure readonly native typography is shared with cell painting. Focus restoration uses preventScroll so the browser cannot override native endpoint reveal. Focus-only transitions preserve selected-reference state;explicit edit-view mouse input clears it and enters TABLE before caret/word selection. Paste/IME commands collapse automatically selected references before browser editing;manual text selection keeps ordinary replacement semantics. Associated DOM text guards reject stale selection notifications. Active replacement preserves existing-content classification and resets actual UTF16 caret bounds without adding history.

Command: npm run test:coverage:calc -- --coverage.reportOnFailure=true;Result:pass;Evidence:837scenarios213files and raw100 S15210/15210 B9269/9269 F2620/2620 L13623/13623 in evidence/pointing-final/calc-coverage.log and coverage-summary.json;Scope:complete current Calc and its configured integration owners. All473source/test/config hashes are stored in source-hashes.json and verified unchanged after the run. Thresholds/exclusions/configuration were not changed. Initial diagnostic failures and source refinements remain in output/playwright/task77-* logs;no failed diagnostic is presented as final success. The inherited IndexedDB-list query race now awaits the actual list promise;modal tests check actual inert ancestry after the legitimate viewport wrapper change. An inherited Calc ODS test non-null assertion was replaced by an equivalent typed fixture access.

Command: npx playwright test e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc;Result:pass;Evidence:5scenarios in evidence/pointing-final/chromium-worker.log;Scope:production Chromium1280/390,real mouse capture/caret/focus/operator continuation/calculation,cell/header modifiers,edit-view identity after scrolling,and actual production controller/input/view/document/history owners in a DOM-free Worker. Unit persistence acceptance reopens pointer-created ODS formulas and verifies dependency recalculation and Undo/Redo.

Command: npx vitest run src/vcl/browser/use-window-tracking.test.tsx and npx vitest run src/sw/browser/presentation/WriterRulers-tracking.test.tsx src/sw/browser/presentation/WriterRulers-document-drag.test.tsx;Result:pass;Evidence:33scenarios3files in evidence/pointing-final/window-tracking.log and writer-rulers.log;Scope:related shared Writer/VCL capture consumers;no shared production module changed.

Command: npm run build; npm run typecheck:tools; npx eslint apps/office/src/sc apps/office/e2e/calc --max-warnings 0; npx prettier --check apps/office/src/sc apps/office/e2e/calc; npm run check:docs; npm run check:file-size; npm run check:calc-resources; node scripts/check-static-build.mjs; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; node .agentplane/policy/check-routing.mjs; ap doctor;Result:pass;Evidence:checks.json records exact final logs and hashes;Scope:all authored Calc and required production/static/source/registry gates.464commands/11menus/17policy dispositions;zero semantic registry violations. All intentional paths fit the approved110-path budget.

Command: npm run lint;Result:fail;Evidence:output/playwright/task77-lint3.log;Scope:the broad diagnostic includes unchanged Writer ODT-boundary fixture lint and ignored historical output probes. Writer source remains identical to HEAD;all authored Calc source/E2E lint passes. This is a recorded baseline outside77,not a green broad lint claim or a policy/threshold weakening.

Skipped:full all-application test replay before80. Reason:the human explicitly requested related/application checks between the established ten-task checkpoints. Risk:unrelated application regressions are not re-certified by this Calc block. Approval:standing human cadence. Complete Calc,actual Chromium/Worker and related Writer/VCL consumers were executed. Tasks76/74 remain unfinished under their own acceptance;the overall goal is neither complete nor paused.
