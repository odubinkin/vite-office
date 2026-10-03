---
id: "202610032229-MJAGH0"
title: "Restore Writer root popup opening focus contracts"
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
  updated_at: "2026-10-03T22:31:03.339Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-03T22:46:44.305Z"
  updated_by: "CODER"
  note: "Full verify912app109inventory29browser2resources100%coverage and0semantic violations; sequential upstream-absent912app109inventory12scripts29browser pass with pin restored;55focused9browser; exact six-path scope and0source/helper/Python artifacts. Full menubar parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-03T22:47:51.623Z"
  updated_by: "EVALUATOR"
  note: "Same-actor separate EVALUATOR phase reviewed exact semantic ef2b2a1f85e127dbd32618f0732ca4a0b9602ab6; bounded root opening correction satisfies approved scope and terminal evidence."
  evaluated_sha: "ef2b2a1f85e127dbd32618f0732ca4a0b9602ab6"
  blueprint_digest: "c75d4d9e7b92d30184e8e0dd68a0d29b21277abe4c0c1a0043ac27a3a186e5d2"
  evidence_refs:
    - ".agentplane/tasks/202610032229-MJAGH0/README.md"
    - ".agentplane/tasks/202610032229-MJAGH0/quality/20261003-224751623-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610032229-MJAGH0/quality/20261003-224751623-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610032229-MJAGH0/quality/20261003-224751623-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610032229-MJAGH0/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610032229-MJAGH0/source-inspection.json"
    - ".agentplane/tasks/202610032229-MJAGH0/baseline-runtime.json"
    - ".agentplane/tasks/202610032229-MJAGH0/baseline-browser.json"
    - ".agentplane/tasks/202610032229-MJAGH0/corrected-runtime.json"
    - ".agentplane/tasks/202610032229-MJAGH0/corrected-browser.json"
    - ".agentplane/tasks/202610032229-MJAGH0/full-verify-summary.json"
    - ".agentplane/tasks/202610032229-MJAGH0/offline-results.json"
    - ".agentplane/tasks/202610032229-MJAGH0/scope-integrity.json"
    - ".agentplane/tasks/202610032229-MJAGH0/auxiliary-checks.json"
  findings:
    - "Manual pinned VCL header/callers/active-popup guard/popup focus establish pointer popup focus without selection and both-arrow/Return first-entry opening; actual production diff implements that contract while preserving child logic."
    - "Baseline10of17owned and5of5browser failures corrected;55focused and9browser pass; full912app109inventory29browser2resources100%coverage0semantic. Sequential upstream-absent912app109inventory12scripts29browser pass and pin restored."
    - "Exact six semantic paths;246prior tests byte-identical and one exact3line native-contradicting expectation corrected. Both215row manifests append bounded evidence only; statuses/defaults/ownership and exceptions preserved. Artifact storage has0source/helpers/Python/executables including ignored files."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: reproduce and restore root menu pointer focus and native keyboard first-entry contracts under standing parity goal authorization, preserving registered I/O and outcome-only artifact storage."
events:
  -
    type: "status"
    at: "2026-10-03T22:31:03.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and restore root menu pointer focus and native keyboard first-entry contracts under standing parity goal authorization, preserving registered I/O and outcome-only artifact storage."
  -
    type: "verify"
    at: "2026-10-03T22:46:44.305Z"
    author: "CODER"
    state: "ok"
    note: "Full verify912app109inventory29browser2resources100%coverage and0semantic violations; sequential upstream-absent912app109inventory12scripts29browser pass with pin restored;55focused9browser; exact six-path scope and0source/helper/Python artifacts. Full menubar parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-03T22:48:16.659Z"
doc_updated_by: "CODER"
description: "Iteration77 under C9TN6M: restore native root popup focus for pointer opening, first-entry keyboard preselection for both arrows/Return, consumed opening requests and active popup reuse; preserve generated composition and registered I/O. Owned tests never invoke upstream; artifacts outcomes only."
sections:
  Summary: "Iteration77 under C9TN6M restores existing root popup opening focus and native first-entry keyboard preselection under standing iterative authorization."
  Scope: "Six semantic paths: CommandMenuBar.tsx (root opening request/ref/effect, trigger entry and bool callsites only), new CommandMenuBar-root-focus.test.tsx, new writer-root-menu-focus.spec.ts, WriterMenuBar.test.tsx (only its existing View ArrowUp first-command assertion/target block), append-only existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. Of247prior test/spec files,246remain byte-identical and one changes only the upstream-contradicting last-entry block. Submenu behavior, root saved-document focus, disabled/style/mnemonic policy, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions. Tests never read/compile/invoke upstream; task artifacts bounded outcomes/logs/hashes only, no source/helper/Python/binaries."
  Plan: "1. Manual exact-pin MenuBarWindow pointer/keyboard/active-popup guards and popup preselection/focus dependencies, hashes only. 2. Owned and real Chromium reproduction of pointer focus and native both-arrow/Return first entry; capture old contradictory View ArrowUp expectation. 3. Refactor root focus request to one-shot optional native preselection boolean, focus unselected popup for pointer, first eligible item for keyboard, preserve active popup reuse, handle keyboard activation independently of pointer click and discard consumed/closed requests. 4. Correct only the old contradictory assertion block and append narrow manifest evidence without broader status/ownership/default promotion. 5. Focused runtime/types/lint/browser, fullverify100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic review, finish leaf and parent findings; goal/parent stay active."
  Verify Steps: "1. Complete relevant manual pinned MenuBarWindow ImplCreatePopup/MouseButtonDown/MouseMove/ChangeHighlightItem/HandleKeyEvent and header, popup ImplExecute/Run/StartPopupMode and invalid-highlight navigation/Return inspection; hashes only, no native execution. 2. Before/after owned cases: pointer root popup takes focus without first item; pointer hover switches root focus without selection; unselected root boundaries navigate correctly; both initial arrows and Enter preselect first eligible item, existing browser Space activation retained; selected single command dispatch; repeated active root requests preserve its selection and nested popup, consumed requests do not steal focus on rerender; closing/reopening and keyboard toggle remain coherent. Real Chromium pointer root-to-keyboard navigation and actual StatusBar action, root keyboard matrix ArrowDown/ArrowUp/Enter/Space each first eligible item and one actual command execution. Old View ArrowUp block changes from Sidebar(last) to StatusBar(first) with exact native source evidence, remaining assertions unchanged. Native disabled-style defaults and Space/mnemonic/full saved-focus behavior remain separately unverified. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Vendor rename inside repository restoredfinally: sequential npm run test, all three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.246prior tests/spec byte-identical and one exact three-line assertion/target block change; production outside declared root focus/entry/bool callsites unchanged, both215-row manifests one append-only evidence row preserving original statuses/defaults/ownership/prior conclusions; ignored-inclusive source/helper/Python/executable artifacts0. 6. ap doctor,routing,git diff --check, terminal results, exact semantic quality review and clean final tracked/untracked checkout."
  Verification: |-
    Command: npm run verify. Result: pass. Evidence: 912app tests/195files,109inventory/36files,29browser,2resources; app and tools100% statements/branches/functions/lines; semanticViolationCount0. Scope: all existing project gates. Command: sequential vendor-absent npm run test; vitest three noninventory scripts; npm run test:e2e. Result: pass. Evidence:912app109inventory12scripts29browser all exit0 while pinned root unavailable; finally restored pin and6hashes unchanged. Scope: project tests execute owned implementation/fixtures without reading, compiling or invoking pinned upstream. Command: focused Vitest5files, Playwright3specs, ESLint, doctor, routing, git diff --check and exact scope/storage audit. Result: pass. Evidence:55focused cases,9focused browser;246prior tests byte-identical and old Writer assertion exact3line correction; both215row manifests preserve all statuses/defaults/ownership; source/helper/Python/executable artifacts0 including ignored files. Doctor0errors2preexisting warnings. Complete menubar composition, saved focus, platform disabled defaults, mnemonics/F10/Alt and native timing remain unverified; parent/goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-03T22:46:44.305Z — VERIFY — ok

    By: CODER

    Note: Full verify912app109inventory29browser2resources100%coverage and0semantic violations; sequential upstream-absent912app109inventory12scripts29browser pass with pin restored;55focused9browser; exact six-path scope and0source/helper/Python artifacts. Full menubar parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T22:46:44.011Z, excerpt_hash=sha256:78e274cd43f107676db65dc72fdb84864450b816cd883e57bdb24e0bab01881d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610032229-MJAGH0/blueprint/resolved-snapshot.json
    - old_digest: c75d4d9e7b92d30184e8e0dd68a0d29b21277abe4c0c1a0043ac27a3a186e5d2
    - current_digest: c75d4d9e7b92d30184e8e0dd68a0d29b21277abe4c0c1a0043ac27a3a186e5d2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610032229-MJAGH0

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610032229-MJAGH0
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access; temporary vendor rename restored in finally."
  Findings: |-
    Preflight main/direct clean at8037e4bf6fbbde9d7d7afbcc76eac43cb4a2c274. Previous goal turn classified progress: iteration76 semantic2b175b44 restores child popup pointer/keyboard preselection and focus restoration, DONE with full/offline terminal evidence. Native pointer passes preselectfalse but popup still grabs focus; keyboard Return/Up/Down request preselecttrue, active same-popup creation is guarded. Local pointer focusnone skips popup focus, ArrowUp opens last, trigger Enter/Space relies on pointer click default; opening request enum also conflates no item selection with no pending request. One existing old test encodes last-entry View ArrowUp behavior; update its exact block to source-matched first entry, not weaken or delete coverage. Saved document focus, F10/Alt/mnemonics, platform disabled flags and timers remain separate obligations.

    Reproduction: 17 new owned cases produced10fail/7pass on baseline; all5 real Chromium opening/toggle scenarios failed. Corrected targeted5files/55cases and9browser cases all pass. Root opening enum replaced by consumed optional preselection boolean; pointer grabs popup focus, both initial arrows/Return select first, browser Space activation handled explicitly, active same-popup request preserves child state. Existing Writer View ArrowUp changes only3lines from last Sidebar to first currently implemented Status Bar; this is not certification of complete upstream View composition. Full npm run verify passes912app/195files,109inventory/36files,29browser,2resource cases; app/tools100% coverage and semantic violations0.246prior tests/spec byte-identical, exact old3line block, production outside scoped root opening unchanged and both215row manifests evidence-only append with statuses/defaults/ownership/prior conclusions preserved. Doctor0errors2known warnings; routing/diff/lint pass. Source inspection is manual exactpin and6hashes, with no native execution or source/helper artifacts. Sequential upstream-absent verification is in progress; final results and restoration will be recorded before verification. Read-only evidence collection briefly attempted coverage totals while the offline suite was regenerating coverage, observed ENOENT; full verification totals remain recorded, recollect only after the live suite is terminal. CLI show uses no JSON flag; bounded help corrected the read-only invocation.

    Final offline run terminal:912app109inventory12scripts29browser all pass sequentially with vendor absent; finally restored exact pin and6hashes. Coverage totals recollected after terminal completion; artifact audit ignored-inclusive0source/helpers/Python/executables. Next bounded candidate is native root saved-document focus lifecycle; this iteration changes opening only. No scope drift or approval skips.

    Semantic commit ef2b2a1f85e127dbd32618f0732ca4a0b9602ab6; same-actor separate EVALUATOR phase reviewed exact semantic HEAD and recorded pass in quality/20261003-224751623-recovery-context/quality-report.json. Commit hook rejected the initial subject scope fix (expected code/task/close/integrate); retried the same intentional staged paths using permitted code scope, without changing implementation or verification. Route oracle generic complete points at latest artifact HEAD; canonical gateway finish with explicit actual implementation hash is used to preserve implementation traceability and descriptive close subject.
id_source: "generated"
---
## Summary

Iteration77 under C9TN6M restores existing root popup opening focus and native first-entry keyboard preselection under standing iterative authorization.

## Scope

Six semantic paths: CommandMenuBar.tsx (root opening request/ref/effect, trigger entry and bool callsites only), new CommandMenuBar-root-focus.test.tsx, new writer-root-menu-focus.spec.ts, WriterMenuBar.test.tsx (only its existing View ArrowUp first-command assertion/target block), append-only existing CommandMenuBar rows in source-provenance.json/runtime-inventory.json. Of247prior test/spec files,246remain byte-identical and one changes only the upstream-contradicting last-entry block. Submenu behavior, root saved-document focus, disabled/style/mnemonic policy, generated resources, core and menu composition unchanged. Preserve registered save/open/recovery exceptions. Tests never read/compile/invoke upstream; task artifacts bounded outcomes/logs/hashes only, no source/helper/Python/binaries.

## Plan

1. Manual exact-pin MenuBarWindow pointer/keyboard/active-popup guards and popup preselection/focus dependencies, hashes only. 2. Owned and real Chromium reproduction of pointer focus and native both-arrow/Return first entry; capture old contradictory View ArrowUp expectation. 3. Refactor root focus request to one-shot optional native preselection boolean, focus unselected popup for pointer, first eligible item for keyboard, preserve active popup reuse, handle keyboard activation independently of pointer click and discard consumed/closed requests. 4. Correct only the old contradictory assertion block and append narrow manifest evidence without broader status/ownership/default promotion. 5. Focused runtime/types/lint/browser, fullverify100%gates, sequential vendor-absent app/inventory/scripts/browser, source/scope/storage/doctor/routing. 6. Same-actor separate EVALUATOR exact semantic review, finish leaf and parent findings; goal/parent stay active.

## Verify Steps

1. Complete relevant manual pinned MenuBarWindow ImplCreatePopup/MouseButtonDown/MouseMove/ChangeHighlightItem/HandleKeyEvent and header, popup ImplExecute/Run/StartPopupMode and invalid-highlight navigation/Return inspection; hashes only, no native execution. 2. Before/after owned cases: pointer root popup takes focus without first item; pointer hover switches root focus without selection; unselected root boundaries navigate correctly; both initial arrows and Enter preselect first eligible item, existing browser Space activation retained; selected single command dispatch; repeated active root requests preserve its selection and nested popup, consumed requests do not steal focus on rerender; closing/reopening and keyboard toggle remain coherent. Real Chromium pointer root-to-keyboard navigation and actual StatusBar action, root keyboard matrix ArrowDown/ArrowUp/Enter/Space each first eligible item and one actual command execution. Old View ArrowUp block changes from Sidebar(last) to StatusBar(first) with exact native source evidence, remaining assertions unchanged. Native disabled-style defaults and Space/mnemonic/full saved-focus behavior remain separately unverified. 3. npm run verify all existing gates and100%coverage pass; static CLI source/resource/parity audits may read vendor separately from tests. 4. Vendor rename inside repository restoredfinally: sequential npm run test, all three noninventory script Vitest files and npm run test:e2e pass without upstream. 5.246prior tests/spec byte-identical and one exact three-line assertion/target block change; production outside declared root focus/entry/bool callsites unchanged, both215-row manifests one append-only evidence row preserving original statuses/defaults/ownership/prior conclusions; ignored-inclusive source/helper/Python/executable artifacts0. 6. ap doctor,routing,git diff --check, terminal results, exact semantic quality review and clean final tracked/untracked checkout.

## Verification

Command: npm run verify. Result: pass. Evidence: 912app tests/195files,109inventory/36files,29browser,2resources; app and tools100% statements/branches/functions/lines; semanticViolationCount0. Scope: all existing project gates. Command: sequential vendor-absent npm run test; vitest three noninventory scripts; npm run test:e2e. Result: pass. Evidence:912app109inventory12scripts29browser all exit0 while pinned root unavailable; finally restored pin and6hashes unchanged. Scope: project tests execute owned implementation/fixtures without reading, compiling or invoking pinned upstream. Command: focused Vitest5files, Playwright3specs, ESLint, doctor, routing, git diff --check and exact scope/storage audit. Result: pass. Evidence:55focused cases,9focused browser;246prior tests byte-identical and old Writer assertion exact3line correction; both215row manifests preserve all statuses/defaults/ownership; source/helper/Python/executable artifacts0 including ignored files. Doctor0errors2preexisting warnings. Complete menubar composition, saved focus, platform disabled defaults, mnemonics/F10/Alt and native timing remain unverified; parent/goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-03T22:46:44.305Z — VERIFY — ok

By: CODER

Note: Full verify912app109inventory29browser2resources100%coverage and0semantic violations; sequential upstream-absent912app109inventory12scripts29browser pass with pin restored;55focused9browser; exact six-path scope and0source/helper/Python artifacts. Full menubar parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T22:46:44.011Z, excerpt_hash=sha256:78e274cd43f107676db65dc72fdb84864450b816cd883e57bdb24e0bab01881d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610032229-MJAGH0/blueprint/resolved-snapshot.json
- old_digest: c75d4d9e7b92d30184e8e0dd68a0d29b21277abe4c0c1a0043ac27a3a186e5d2
- current_digest: c75d4d9e7b92d30184e8e0dd68a0d29b21277abe4c0c1a0043ac27a3a186e5d2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610032229-MJAGH0

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610032229-MJAGH0
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task semantic commit if necessary; preserve history and registered exceptions. No network/outside-repo access; temporary vendor rename restored in finally.

## Findings

Preflight main/direct clean at8037e4bf6fbbde9d7d7afbcc76eac43cb4a2c274. Previous goal turn classified progress: iteration76 semantic2b175b44 restores child popup pointer/keyboard preselection and focus restoration, DONE with full/offline terminal evidence. Native pointer passes preselectfalse but popup still grabs focus; keyboard Return/Up/Down request preselecttrue, active same-popup creation is guarded. Local pointer focusnone skips popup focus, ArrowUp opens last, trigger Enter/Space relies on pointer click default; opening request enum also conflates no item selection with no pending request. One existing old test encodes last-entry View ArrowUp behavior; update its exact block to source-matched first entry, not weaken or delete coverage. Saved document focus, F10/Alt/mnemonics, platform disabled flags and timers remain separate obligations.

Reproduction: 17 new owned cases produced10fail/7pass on baseline; all5 real Chromium opening/toggle scenarios failed. Corrected targeted5files/55cases and9browser cases all pass. Root opening enum replaced by consumed optional preselection boolean; pointer grabs popup focus, both initial arrows/Return select first, browser Space activation handled explicitly, active same-popup request preserves child state. Existing Writer View ArrowUp changes only3lines from last Sidebar to first currently implemented Status Bar; this is not certification of complete upstream View composition. Full npm run verify passes912app/195files,109inventory/36files,29browser,2resource cases; app/tools100% coverage and semantic violations0.246prior tests/spec byte-identical, exact old3line block, production outside scoped root opening unchanged and both215row manifests evidence-only append with statuses/defaults/ownership/prior conclusions preserved. Doctor0errors2known warnings; routing/diff/lint pass. Source inspection is manual exactpin and6hashes, with no native execution or source/helper artifacts. Sequential upstream-absent verification is in progress; final results and restoration will be recorded before verification. Read-only evidence collection briefly attempted coverage totals while the offline suite was regenerating coverage, observed ENOENT; full verification totals remain recorded, recollect only after the live suite is terminal. CLI show uses no JSON flag; bounded help corrected the read-only invocation.

Final offline run terminal:912app109inventory12scripts29browser all pass sequentially with vendor absent; finally restored exact pin and6hashes. Coverage totals recollected after terminal completion; artifact audit ignored-inclusive0source/helpers/Python/executables. Next bounded candidate is native root saved-document focus lifecycle; this iteration changes opening only. No scope drift or approval skips.

Semantic commit ef2b2a1f85e127dbd32618f0732ca4a0b9602ab6; same-actor separate EVALUATOR phase reviewed exact semantic HEAD and recorded pass in quality/20261003-224751623-recovery-context/quality-report.json. Commit hook rejected the initial subject scope fix (expected code/task/close/integrate); retried the same intentional staged paths using permitted code scope, without changing implementation or verification. Route oracle generic complete points at latest artifact HEAD; canonical gateway finish with explicit actual implementation hash is used to preserve implementation traceability and descriptive close subject.
