---
id: "202611220211-TEJDRR"
title: "Connect Calc Format Cells dialog and native scalar attribute pages"
result_summary: "calc-format-cells-scalar-pages"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202611220152-4W24JY"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:11:14.583Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T02:47:10.454Z"
  updated_by: "CODER"
  note: "Verified: native Calc Format Cells pages and entry points pass focused Calc, formatter, Chromium and production checks"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T02:47:43.477Z"
  updated_by: "EVALUATOR"
  note: "The reviewed implementation preserves the active view, draft formatter lifetime, native item-set application and reversible document history."
  evaluated_sha: "e3e30f4cce82744aa65ab02b15db908962b8bbe2"
  blueprint_digest: "dcc857ffb8b5f4477be4c950e0421fcddfdced73919906310a230f35e2c0dfdb"
  evidence_refs:
    - ".agentplane/tasks/202611220211-TEJDRR/README.md"
    - ".agentplane/tasks/202611220211-TEJDRR/quality/20261122-024743477-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220211-TEJDRR/quality/20261122-024743477-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220211-TEJDRR/quality/20261122-024743477-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220211-TEJDRR/blueprint/resolved-snapshot.json"
    - "output/calc-task19-verification.md"
    - "output/calc-task19-browser-final.log"
    - "output/calc-task19-office-types-final.log"
    - "output/calc-task19-calc.log"
  findings:
    - "Same-agent review checked the recorded implementation and test evidence. The remaining Font, Font Effects, Borders and advanced format administration are outside this slice."
commit:
  hash: "e3e30f4cce82744aa65ab02b15db908962b8bbe2"
  message: "🧩 TEJDRR code: preserve tuple types in native gallery regression"
comments:
  -
    author: "CODER"
    body: "Start: connect Format Cells, native formatter preview and scalar attribute pages."
  -
    author: "CODER"
    body: "Verified: Calc Format Cells entry points, native scalar pages, single history transaction, production Chromium and targeted regressions"
events:
  -
    type: "status"
    at: "2026-11-22T02:11:14.770Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect Format Cells, native formatter preview and scalar attribute pages."
  -
    type: "verify"
    at: "2026-11-22T02:47:10.454Z"
    author: "CODER"
    state: "ok"
    note: "Verified: native Calc Format Cells pages and entry points pass focused Calc, formatter, Chromium and production checks"
  -
    type: "status"
    at: "2026-11-22T02:49:36.159Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Calc Format Cells entry points, native scalar pages, single history transaction, production Chromium and targeted regressions"
doc_version: 3
doc_updated_at: "2026-11-22T02:49:36.160Z"
doc_updated_by: "CODER"
description: "Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview."
sections:
  Summary: |-
    Connect Calc Format Cells dialog and native scalar attribute pages

    Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview.
  Scope: "Implement Format Cells Sfx entry points, main menu, keyboard, cell popup and sidebar access. Preserve input snapshot and typed damage-free output, one ApplyAttributes history step, protected-sheet admission and cancellation. Port Numbers (category, locale, formats, available currency list, options, code, validation and preview), Alignment (native selection items), Background color and Cell Protection pages in original relative order. Use formatter-owned codes and original source item defaults. Font, Font Effects, Borders and conditional Asian typography pages, advanced custom format administration and unsupported background types are a subsequent block."
  Plan: "Create the native ScAttrDlg exchange and format shell route. Bind the Numbers draft and locale-aware preview to existing formatter services, then connect Alignment, Background and Cell Protection item pages. Reuse existing modal and history owners, wire the natural menu, accelerator and popup entry points, and port upstream focused cases."
  Verify Steps: |-
    - Run targeted Calc regressions for mounted Numbers, Alignment, Background, Protection, source defaults and mixed selection, typed requests, cancellation and single undo. Port corresponding upstream regressions for represented controls and exercise ODS and production Chromium entry points.
    - Run related shared formatter tests, types, changed-source lint/format, dependency, resources, source provenance and inventory, AgentPlane routing and doctor, and production build. This is task nine of ten before the next full run.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T02:47:10.454Z — VERIFY — ok

    By: CODER

    Note: Verified: native Calc Format Cells pages and entry points pass focused Calc, formatter, Chromium and production checks
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:33:16.222Z, excerpt_hash=sha256:be5a173426ab2effddd486bc364fac39ebf76850fc93f90ce7b3e74e399a2d34

    Details:

    - Calc targeted: 26 passing tests in four files, including original Numbers options, scientific precision, NatNum12 English gallery examples, alignment persistence and rotation wrap, mixed values, typed dispatch, ODS and single Undo/Redo. The final five Format Cells cases passed after the typed query correction.
    - Shared formatter: 46 passing in four files covering built-in generation, formatted pictures, currency choices and standard number formatter behavior.
    - Production Chromium: keyboard accelerator and cell context popup, formatted gallery and highlighted live preview, actual grid text/color/fill, persisted protection when reopened, cancellation and one reversible change set. Static production build and bundle check.
    - Changed-source ESLint and formatting, tooling and office types, boundaries, generated Calc resources, source tree, provenance, Calc inventory with zero semantic violations, routing and AgentPlane doctor.
    - The existing repository-wide file-size and JSDoc gates already report violations outside the change. The modified size-bounded Calc files are below 1,000 source lines, and the new callbacks are documented. AgentPlane doctor reports an existing managed hook readiness warning.
    - Scientific recognition for this regression comes from the actual ScDocument recognizer. The independent browser plain-input path, Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced format administration remain out of this delivery.
    - Cadence: task 9 of 10. No full regression was used for this delivery.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220211-TEJDRR/blueprint/resolved-snapshot.json
    - old_digest: dcc857ffb8b5f4477be4c950e0421fcddfdced73919906310a230f35e2c0dfdb
    - current_digest: dcc857ffb8b5f4477be4c950e0421fcddfdced73919906310a230f35e2c0dfdb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220211-TEJDRR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220211-TEJDRR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this dialog and registry update. The original document formatter, attribute history and storage routes remain the owners."
  Findings: |-
    - The Format Cells command routes through the active native view and applies the dialog output with one ApplyAttributes call. Numbers supports original examples and color, categories, locales, currency selection, option-based picture generation, validation and a scratch formatter for read-only previews. Alignment, solid/no fill and Cell Protection write native pool items.
    - CALC-833 records the unmatched default style popup identifier in the pinned resources. The generator preserves the source ID and its missing registration.
    - The adapted tdf88999 dialog case enters the scientific value through the existing ScDocument recognizer. Browser plain input has its own simpler parsing and history path. Automatic scientific format assignment through that browser path remains a separate binding.
    - Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced custom format administration remain separate scope.
id_source: "generated"
---
## Summary

Connect Calc Format Cells dialog and native scalar attribute pages

Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview.

## Scope

Implement Format Cells Sfx entry points, main menu, keyboard, cell popup and sidebar access. Preserve input snapshot and typed damage-free output, one ApplyAttributes history step, protected-sheet admission and cancellation. Port Numbers (category, locale, formats, available currency list, options, code, validation and preview), Alignment (native selection items), Background color and Cell Protection pages in original relative order. Use formatter-owned codes and original source item defaults. Font, Font Effects, Borders and conditional Asian typography pages, advanced custom format administration and unsupported background types are a subsequent block.

## Plan

Create the native ScAttrDlg exchange and format shell route. Bind the Numbers draft and locale-aware preview to existing formatter services, then connect Alignment, Background and Cell Protection item pages. Reuse existing modal and history owners, wire the natural menu, accelerator and popup entry points, and port upstream focused cases.

## Verify Steps

- Run targeted Calc regressions for mounted Numbers, Alignment, Background, Protection, source defaults and mixed selection, typed requests, cancellation and single undo. Port corresponding upstream regressions for represented controls and exercise ODS and production Chromium entry points.
- Run related shared formatter tests, types, changed-source lint/format, dependency, resources, source provenance and inventory, AgentPlane routing and doctor, and production build. This is task nine of ten before the next full run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T02:47:10.454Z — VERIFY — ok

By: CODER

Note: Verified: native Calc Format Cells pages and entry points pass focused Calc, formatter, Chromium and production checks
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T02:33:16.222Z, excerpt_hash=sha256:be5a173426ab2effddd486bc364fac39ebf76850fc93f90ce7b3e74e399a2d34

Details:

- Calc targeted: 26 passing tests in four files, including original Numbers options, scientific precision, NatNum12 English gallery examples, alignment persistence and rotation wrap, mixed values, typed dispatch, ODS and single Undo/Redo. The final five Format Cells cases passed after the typed query correction.
- Shared formatter: 46 passing in four files covering built-in generation, formatted pictures, currency choices and standard number formatter behavior.
- Production Chromium: keyboard accelerator and cell context popup, formatted gallery and highlighted live preview, actual grid text/color/fill, persisted protection when reopened, cancellation and one reversible change set. Static production build and bundle check.
- Changed-source ESLint and formatting, tooling and office types, boundaries, generated Calc resources, source tree, provenance, Calc inventory with zero semantic violations, routing and AgentPlane doctor.
- The existing repository-wide file-size and JSDoc gates already report violations outside the change. The modified size-bounded Calc files are below 1,000 source lines, and the new callbacks are documented. AgentPlane doctor reports an existing managed hook readiness warning.
- Scientific recognition for this regression comes from the actual ScDocument recognizer. The independent browser plain-input path, Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced format administration remain out of this delivery.
- Cadence: task 9 of 10. No full regression was used for this delivery.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611220211-TEJDRR/blueprint/resolved-snapshot.json
- old_digest: dcc857ffb8b5f4477be4c950e0421fcddfdced73919906310a230f35e2c0dfdb
- current_digest: dcc857ffb8b5f4477be4c950e0421fcddfdced73919906310a230f35e2c0dfdb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220211-TEJDRR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220211-TEJDRR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this dialog and registry update. The original document formatter, attribute history and storage routes remain the owners.

## Findings

- The Format Cells command routes through the active native view and applies the dialog output with one ApplyAttributes call. Numbers supports original examples and color, categories, locales, currency selection, option-based picture generation, validation and a scratch formatter for read-only previews. Alignment, solid/no fill and Cell Protection write native pool items.
- CALC-833 records the unmatched default style popup identifier in the pinned resources. The generator preserves the source ID and its missing registration.
- The adapted tdf88999 dialog case enters the scientific value through the existing ScDocument recognizer. Browser plain input has its own simpler parsing and history path. Automatic scientific format assignment through that browser path remains a separate binding.
- Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced custom format administration remain separate scope.
