---
id: "202610031549-F4HAPT"
title: "Keep command menu popups reachable within the viewport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T15:50:49.626Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-03T16:09:51.623Z"
  updated_by: "CODER"
  note: "Complete selected viewport popup correction verified on actual semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def;792/109/20,both100%,offline14,old expectations/gates preserved. Whole menu and goal remain unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-03T16:09:52.344Z"
  updated_by: "EVALUATOR"
  note: "Distinct same-actor EVALUATOR phase passes selected screen-bounded owned popup behavior on actual semantic HEAD2d2ccc6eb5ec; no independent-agent/full menu/goal claim."
  evaluated_sha: "2d2ccc6eb5ec217ebe57adab8d2082e18f810def"
  blueprint_digest: "a2d3ea32fc650505328b86086af71a94449653904687fab2e7d694652d13691c"
  evidence_refs:
    - ".agentplane/tasks/202610031549-F4HAPT/README.md"
    - ".agentplane/tasks/202610031549-F4HAPT/quality/20261003-160952344-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610031549-F4HAPT/quality/20261003-160952344-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610031549-F4HAPT/quality/20261003-160952344-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610031549-F4HAPT/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610031549-F4HAPT/artifacts/scope-integrity.json"
    - ".agentplane/tasks/202610031549-F4HAPT/artifacts/native-menu-inspection.json"
    - ".agentplane/tasks/202610031549-F4HAPT/artifacts/artifact-log-integrity.json"
    - ".agentplane/tasks/202610031549-F4HAPT/artifacts/full-verify.log"
    - ".agentplane/tasks/202610031549-F4HAPT/artifacts/offline-results.json"
  findings:
    - "Exactly5semantic paths: shared in-file fixed popup preserves DOM hierarchy and existing menu state machine; above/below size, nested edge flip and internal scroll follow inspected native screen constraints through browser geometry."
    - "Two new owned units fail old code,final14pass with vendor absent/restored;6focused browser scenarios and full792app/109inventory/20browser pass,both100%. All3old unit/3old responsive bodies unchanged and metadata evidence/responsibility only; no gate,IO or recovery change."
    - "Native3file/5span hashes and bounded log/scope integrity checked; zero Python/native/helper source artifacts at rest. Transient synthetic C++ test fixture under Agentplane identified for separate one-file cleanup, not upstream source."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore viewport-bounded scrollable command popups under continuing goal authorization; preserve old menu expectations, gates and deliberate IO deviations."
events:
  -
    type: "status"
    at: "2026-10-03T15:50:50.054Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore viewport-bounded scrollable command popups under continuing goal authorization; preserve old menu expectations, gates and deliberate IO deviations."
  -
    type: "verify"
    at: "2026-10-03T16:09:51.623Z"
    author: "CODER"
    state: "ok"
    note: "Complete selected viewport popup correction verified on actual semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def;792/109/20,both100%,offline14,old expectations/gates preserved. Whole menu and goal remain unverified."
doc_version: 3
doc_updated_at: "2026-10-03T16:09:51.672Z"
doc_updated_by: "CODER"
description: "Resolve reproducible short-viewport Writer menu overflow independently of committed iteration61 core change; native screen-bounded scrolling behavior through browser-owned popup placement, preserve existing menu and IO behavior."
sections:
  Summary: "Restore selected native screen-bounded menu scrolling behavior through browser-owned DOM geometry; resolve iteration61 full verification blocker without widening the core task."
  Scope: "Exactly5semantic paths: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx; apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx; apps/office/e2e/writer-responsive-sidebar.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own task bookkeeping and related parent/core findings only."
  Plan: "One browser correction after reproducible isolated failure. Keep top-level and nested popups anchored in viewport coordinates, constrain size to available screen space, scroll within the popup, flip submenus at horizontal edges and reposition on resize/ancestor scroll. Retain DOM ownership, outside dismissal, mouse hover, keyboard focus, command dispatch and all old expected results. Implement a shared in-file popup presenter in CommandMenuBar.tsx, add owned geometry integration checks and responsive browser scrolling/submenu checks, update only its provenance/inventory evidence/responsibility rows without status promotion. Fresh native menu and floating-window inspection hashes only; no saved source/helper files, no test upstream access, no dependencies/policy/gate/IO/recovery changes. Unchanged full verification must pass both100% coverage; evaluator on actual semantic SHA, clean leaf closure. Core task RD0HQY stays blocked/unverified until full gates pass; parent/full goal remain active."
  Verify Steps: |-
    1. Fresh pinned vcl menu/floating-window screen sizing, internal scrolling and keyboard visibility spans/file hashes; unchanged pin, no native copies, compiled probes or saved helper scripts. No claim of full native mouse timer/scroller visuals/mobile native parity.
    2. Existing responsive scenario fails baseline independently; owned tests establish top-level below/above placement, horizontal clamping, submenu flip/vertical clamping, resize and scroll updates/listener cleanup, command dismissal, keyboard navigation and nonclipped submenu reachability. Existing expected values/gates unchanged.
    3. Focused unit/browser checks, vendor-absent owned unit tests, then unchanged npm run verify all gates/both100%; no source calls from project tests. Exactly5semantic paths and evidence/responsibility metadata only; all statuses/deviations/defaults preserved. Zero ignored-inclusive Python/bytecode/native/helper sources in Agentplane, diff/routing/doctor0newerrors.
    4. Canonical verify plus distinct same-actor EVALUATOR actual semantic SHA, clean browser leaf close; core semantic commit910775c2b7a5 separately unverified until fresh full result, parent/full goal active.
  Verification: |-
    Pass on semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def. Unchanged npm run verify terminal29020 exit0:792app/179files,109inventory/36files,20browser,both100% and all formatting/lint/types/boundaries/resources/static/docs/size/source-tree/provenance/invariants/parity gates. Focused14owned unit tests pass vendor absent/restored;6focused browser tests pass. Native3files/5spans unchanged;all3old unit/3old responsive bodies unchanged,only1metadata evidence/responsibility row each. Baseline2new units fail old code;baseline browser old340 bounds=false/scrolls=false. No Python/native/helper sources at rest; transient inventory-owned C++ fixture path will move in separate cleanup task. Doctor0errors/1preexisting warning;routing/diff pass. Selected popup behavior only; parent/full goal remain active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-03T16:09:51.623Z — VERIFY — ok

    By: CODER

    Note: Complete selected viewport popup correction verified on actual semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def;792/109/20,both100%,offline14,old expectations/gates preserved. Whole menu and goal remain unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T16:09:51.327Z, excerpt_hash=sha256:d843f4fd4a4b5813c7e530a47b1d7c8e0a2357a38962a29b4f4979d6fc734cdf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610031549-F4HAPT/blueprint/resolved-snapshot.json
    - old_digest: a2d3ea32fc650505328b86086af71a94449653904687fab2e7d694652d13691c
    - current_digest: a2d3ea32fc650505328b86086af71a94449653904687fab2e7d694652d13691c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610031549-F4HAPT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610031549-F4HAPT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only browser semantic commit on request, preserving committed core work, cleanup, pin and history."
  Findings: |-
    Continuing user goal authorizes safe local correction. Core leaf RD0HQY committed910775c2b7a5 but blocked, not verified. Full second attempt and isolated responsive suite reproduce Paragraph popup scroll/detach failure at390x340 without any numbering operation. Existing browser popup is absolute, unbounded and descendant-clipped; native PopupMenu sizes to screen and enables internal scroll, keyboard selection scrolls to visible entries. Native minimum384 is desktop fallback, browser-owned actual viewport bounds remain adaptation; no new registered deviation or full native visual equivalence claim. No Agentplane Python/native source files found at preflight.

    Implementation: one in-file fixed owned popup presenter handles screen bounds, internal scrolling, above/below placement, nested edge flip and resize/ancestor-scroll cleanup. Native3files/5spans manually inspected and hashed; no source/helper copies. Two added owned unit cases fail baseline and pass final,all3old unit and3old responsive test bodies byte-identical; one added responsive browser test establishes bounds/scroll/nested reachability. Baseline built old340px popup within=false/scrolls=false. An initial unchanged3browser rerun used olddist and passed, so intermittent old detachment is not claimed deterministic; new geometry assertion provides direct evidence. Initial new browser340 fixture incorrectly demanded internal scrolling although corrected five-item popup fits208px; new dedicated short240 fixture requires real internal overflow and passes. Two new unit fixture calculations and unsupported assertion spelling were corrected before final expectations; all old expectations retained. One mistaken root Vitest invocation lacked app DOM config; corrected app cwd, no config/gate changes.

    Command: app-cwd focused Vitest menu suites. Result: pass2files/14tests. Command: focused Playwright responsive/alignment/foundation. Result: pass6tests,focused-browser-final.log; earlier new-fixture failure retained focused-browser.log. Command: same owned menu suites with vendor absent and restored in finally. Result: pass14tests,offline-owned-tests.log/offline-results.json. Scope: current exact5semantic paths, only one metadata evidence/responsibility or justification row each, no status/default/deviation promotion. Fresh ignored-inclusive source artifact scan0; all tooling inline and unsaved. Full unchanged verification next; no completion claim.

    Command: npm run verify first browser-leaf attempt. Result: fail/exit1 terminal7569 only at check:docs after792app/179files,109inventory/36files,both100%,20browser and static smoke pass. Evidence: full-verify-first.log; one new test mock TypeScript this parameter lacked @param documentation. Added @param this, check:docs now passes; no logic/expectation/gate changes. Run unchanged full command again; all remaining static gates still required.

    Command: npm run verify final attempt. Result: pass/exit0 terminal29020,792app/179files,109inventory/36files,20browser,both100%,allstatic/provenance/parity gates. Native6related files unchanged; all3old menu/3old responsive bodies unchanged. Agentplane no Python/bytecode/source/helper artifacts at rest. Concurrent scan briefly found one synthetic C++ input generated by scripts/test-fixtures/inventory-reference.ts under .agentplane/tmp and cleaned by tests; create a separate one-file correction moving fixture scratch to test-results, no native copy or Python/helper evidence. Doctor0errors/1preexisting hook warning; routing passes. No full native timer/scroller/visual/full menu/context/lifetime claim.
id_source: "generated"
---
## Summary

Restore selected native screen-bounded menu scrolling behavior through browser-owned DOM geometry; resolve iteration61 full verification blocker without widening the core task.

## Scope

Exactly5semantic paths: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx; apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx; apps/office/e2e/writer-responsive-sidebar.spec.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Own task bookkeeping and related parent/core findings only.

## Plan

One browser correction after reproducible isolated failure. Keep top-level and nested popups anchored in viewport coordinates, constrain size to available screen space, scroll within the popup, flip submenus at horizontal edges and reposition on resize/ancestor scroll. Retain DOM ownership, outside dismissal, mouse hover, keyboard focus, command dispatch and all old expected results. Implement a shared in-file popup presenter in CommandMenuBar.tsx, add owned geometry integration checks and responsive browser scrolling/submenu checks, update only its provenance/inventory evidence/responsibility rows without status promotion. Fresh native menu and floating-window inspection hashes only; no saved source/helper files, no test upstream access, no dependencies/policy/gate/IO/recovery changes. Unchanged full verification must pass both100% coverage; evaluator on actual semantic SHA, clean leaf closure. Core task RD0HQY stays blocked/unverified until full gates pass; parent/full goal remain active.

## Verify Steps

1. Fresh pinned vcl menu/floating-window screen sizing, internal scrolling and keyboard visibility spans/file hashes; unchanged pin, no native copies, compiled probes or saved helper scripts. No claim of full native mouse timer/scroller visuals/mobile native parity.
2. Existing responsive scenario fails baseline independently; owned tests establish top-level below/above placement, horizontal clamping, submenu flip/vertical clamping, resize and scroll updates/listener cleanup, command dismissal, keyboard navigation and nonclipped submenu reachability. Existing expected values/gates unchanged.
3. Focused unit/browser checks, vendor-absent owned unit tests, then unchanged npm run verify all gates/both100%; no source calls from project tests. Exactly5semantic paths and evidence/responsibility metadata only; all statuses/deviations/defaults preserved. Zero ignored-inclusive Python/bytecode/native/helper sources in Agentplane, diff/routing/doctor0newerrors.
4. Canonical verify plus distinct same-actor EVALUATOR actual semantic SHA, clean browser leaf close; core semantic commit910775c2b7a5 separately unverified until fresh full result, parent/full goal active.

## Verification

Pass on semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def. Unchanged npm run verify terminal29020 exit0:792app/179files,109inventory/36files,20browser,both100% and all formatting/lint/types/boundaries/resources/static/docs/size/source-tree/provenance/invariants/parity gates. Focused14owned unit tests pass vendor absent/restored;6focused browser tests pass. Native3files/5spans unchanged;all3old unit/3old responsive bodies unchanged,only1metadata evidence/responsibility row each. Baseline2new units fail old code;baseline browser old340 bounds=false/scrolls=false. No Python/native/helper sources at rest; transient inventory-owned C++ fixture path will move in separate cleanup task. Doctor0errors/1preexisting warning;routing/diff pass. Selected popup behavior only; parent/full goal remain active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-03T16:09:51.623Z — VERIFY — ok

By: CODER

Note: Complete selected viewport popup correction verified on actual semantic 2d2ccc6eb5ec217ebe57adab8d2082e18f810def;792/109/20,both100%,offline14,old expectations/gates preserved. Whole menu and goal remain unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T16:09:51.327Z, excerpt_hash=sha256:d843f4fd4a4b5813c7e530a47b1d7c8e0a2357a38962a29b4f4979d6fc734cdf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610031549-F4HAPT/blueprint/resolved-snapshot.json
- old_digest: a2d3ea32fc650505328b86086af71a94449653904687fab2e7d694652d13691c
- current_digest: a2d3ea32fc650505328b86086af71a94449653904687fab2e7d694652d13691c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610031549-F4HAPT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610031549-F4HAPT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only browser semantic commit on request, preserving committed core work, cleanup, pin and history.

## Findings

Continuing user goal authorizes safe local correction. Core leaf RD0HQY committed910775c2b7a5 but blocked, not verified. Full second attempt and isolated responsive suite reproduce Paragraph popup scroll/detach failure at390x340 without any numbering operation. Existing browser popup is absolute, unbounded and descendant-clipped; native PopupMenu sizes to screen and enables internal scroll, keyboard selection scrolls to visible entries. Native minimum384 is desktop fallback, browser-owned actual viewport bounds remain adaptation; no new registered deviation or full native visual equivalence claim. No Agentplane Python/native source files found at preflight.

Implementation: one in-file fixed owned popup presenter handles screen bounds, internal scrolling, above/below placement, nested edge flip and resize/ancestor-scroll cleanup. Native3files/5spans manually inspected and hashed; no source/helper copies. Two added owned unit cases fail baseline and pass final,all3old unit and3old responsive test bodies byte-identical; one added responsive browser test establishes bounds/scroll/nested reachability. Baseline built old340px popup within=false/scrolls=false. An initial unchanged3browser rerun used olddist and passed, so intermittent old detachment is not claimed deterministic; new geometry assertion provides direct evidence. Initial new browser340 fixture incorrectly demanded internal scrolling although corrected five-item popup fits208px; new dedicated short240 fixture requires real internal overflow and passes. Two new unit fixture calculations and unsupported assertion spelling were corrected before final expectations; all old expectations retained. One mistaken root Vitest invocation lacked app DOM config; corrected app cwd, no config/gate changes.

Command: app-cwd focused Vitest menu suites. Result: pass2files/14tests. Command: focused Playwright responsive/alignment/foundation. Result: pass6tests,focused-browser-final.log; earlier new-fixture failure retained focused-browser.log. Command: same owned menu suites with vendor absent and restored in finally. Result: pass14tests,offline-owned-tests.log/offline-results.json. Scope: current exact5semantic paths, only one metadata evidence/responsibility or justification row each, no status/default/deviation promotion. Fresh ignored-inclusive source artifact scan0; all tooling inline and unsaved. Full unchanged verification next; no completion claim.

Command: npm run verify first browser-leaf attempt. Result: fail/exit1 terminal7569 only at check:docs after792app/179files,109inventory/36files,both100%,20browser and static smoke pass. Evidence: full-verify-first.log; one new test mock TypeScript this parameter lacked @param documentation. Added @param this, check:docs now passes; no logic/expectation/gate changes. Run unchanged full command again; all remaining static gates still required.

Command: npm run verify final attempt. Result: pass/exit0 terminal29020,792app/179files,109inventory/36files,20browser,both100%,allstatic/provenance/parity gates. Native6related files unchanged; all3old menu/3old responsive bodies unchanged. Agentplane no Python/bytecode/source/helper artifacts at rest. Concurrent scan briefly found one synthetic C++ input generated by scripts/test-fixtures/inventory-reference.ts under .agentplane/tmp and cleaned by tests; create a separate one-file correction moving fixture scratch to test-results, no native copy or Python/helper evidence. Doctor0errors/1preexisting hook warning; routing passes. No full native timer/scroller/visual/full menu/context/lifetime claim.
