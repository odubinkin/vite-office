---
id: "202610221940-TV1H69"
title: "Complete native Writer row height balancing and layout publication"
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
  updated_at: "2026-10-22T19:43:18.463Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-22T20:27:13.800Z"
  updated_by: "CODER"
  note: "Verified d3539d3199ec: final45 related tests and16 Chromium scenarios; prior broad1401 tests/60 scenarios labeled before last completion fix. Nine-owner strict exact-span coverage100%; required static/resource/build/provenance checks pass. Evidence output/playwright/writer-row-balancing; task3 after full checkpoint, no full repeat."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-22T20:27:31.608Z"
  updated_by: "EVALUATOR"
  note: "Bounded native flat-row sizing contract satisfies the approved plan on d3539d3199ec; finish task and continue goal."
  evaluated_sha: "d3539d3199ec33001b9e0e06a155d21954fe7e71"
  blueprint_digest: "1cab5c8dbc94440d3fa788e6ea0ea2f3898ab9d12a8f1bf14c654580f6df384d"
  evidence_refs:
    - ".agentplane/tasks/202610221940-TV1H69/README.md"
    - ".agentplane/tasks/202610221940-TV1H69/quality/20261022-202731608-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610221940-TV1H69/quality/20261022-202731608-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610221940-TV1H69/quality/20261022-202731608-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610221940-TV1H69/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-row-balancing/incremental-coverage-audit.json"
    - "output/playwright/writer-row-balancing/final-delta-coverage.log"
    - "output/playwright/writer-row-balancing/browser-endaction-final.log"
    - "output/playwright/writer-row-balancing/build-endaction-final.log"
  findings:
    - "Reviewed source selection, registered frame iteration, native integer arithmetic, actual area publication, read-only state query, two-pass shell action completion and source command placements. Tests preserve original format/frame/cursor owners, source two-action undo, natural measurement and actual ODT."
    - "Final45 tests/16 Chromium cases cover latest source; prior1401/60 broader evidence is explicitly version-scoped. Raw partial owner coverage failures remain visible; deterministic exact-span incremental audit reaches100% in all four metrics without changing thresholds or transferring changed-span hits."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port native row balancing through actual frame geometry and shell layout completion, fix natural device measurement, and connect source sizing controls with related evidence."
events:
  -
    type: "status"
    at: "2026-10-22T19:44:18.008Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native row balancing through actual frame geometry and shell layout completion, fix natural device measurement, and connect source sizing controls with related evidence."
  -
    type: "verify"
    at: "2026-10-22T20:27:13.800Z"
    author: "CODER"
    state: "ok"
    note: "Verified d3539d3199ec: final45 related tests and16 Chromium scenarios; prior broad1401 tests/60 scenarios labeled before last completion fix. Nine-owner strict exact-span coverage100%; required static/resource/build/provenance checks pass. Evidence output/playwright/writer-row-balancing; task3 after full checkpoint, no full repeat."
doc_version: 3
doc_updated_at: "2026-10-22T20:27:13.888Z"
doc_updated_by: "CODER"
description: "Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint."
sections:
  Summary: |-
    Complete native Writer row height balancing and layout publication

    Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint.
  Scope: "Only vite-office-writer on writer. Native row frame geometry/publication, existing root layout completion and browser natural-row device measurement, document/shell BalanceRowHeight, two original table sizing slots and their menu/sidebar controls, related core/layout/UI/ODT/browser tests and conservative provenance/runtime records. Port source selection, history and arithmetic without model snapshots or browser-supplied command height arrays. No column auto-fit, structural deletion, network/branch/merge operations, locale expansion or recovery/save/open policy changes."
  Plan: "Publish represented row frame/print area height during core Format and remove Format calls from browser paint; measure natural row content independently of authored fixed/minimum height. Complete root layout synchronously from its existing device inputs at the native shell action boundary. Port native BalanceRowHeight test-only admission, registered SwFrame maximums and optimize-average/normal-maximum modes through actual row formats and history. Connect SetOptimalRowHeight and DistributeRows with source two-pass ordering, state, menu placements and full consumed row-sizing sidebar group. Verify natural-content shrink/growth, selection, callbacks, frame identity, history and ODT on desktop/mobile; document any suspected upstream arithmetic issue and preserve it. Continue goal after task closure."
  Verify Steps: "Verify real registered row frame areas, print-height publication and invalidation; test-only command must not mutate history/layout/model. Cover current versus table-selected and ordinary marks, multiple frame clients, optimize mean and normal running maximum, exact item/history/cursor behavior and arithmetic boundaries from source. Verify shell completion between two optimal-height passes using original root-owned measured geometry. Browser tests at1280/390 must prove content-dependent natural sizing, shrinking after fixed height, distribution of unequal rows, proper source UI sensitivity and repeated Undo/Redo, actual ODT roundtrip and original cursor owners. Run related row/table layout, measurement, native owner, sizing/sidebar/menu and I/O regressions; strict coverage for changed responsibilities, typecheck, changed-source lint/format, build/static, resources/boundaries/JSDoc/file-size/source-tree/provenance/invariants/parity and AgentPlane doctor/routing. Task3 after ACR55N full checkpoint; do not repeat full suites until the ten-task cadence."
  Verification: |-
    PASS. Current-source focused coverage run: 7 files /45 tests after SetRowHeight action-completion correction; prior broad related run188 files /1401 tests. Final Chromium4 files /16 scenarios passed at1280/390 including immediate sidebar height then distribution, optimize/distribute, natural content shrink/growth, history and actual ODT; prior broader22 files /60 scenarios passed before the final correction. Desktop/mobile final screenshots inspected. Strict nine-owner exact-source incremental audit:1893/1893 lines,2117/2117 statements,418/418 functions,1556/1556 branch arms. Source-byte-corresponding previous hits only; changed spans require fresh execution. Current-source build, typecheck, scoped ESLint/Prettier, resources, boundaries, JSDoc, file-size, source-tree, provenance, invariants, parity, static smoke, routing and diff checks pass. Doctor has zero errors and the existing managed-hook readiness warning. Evidence: output/playwright/writer-row-balancing/{final-delta-coverage.log,related-coverage.log,browser-endaction-final.log,browser-related.log,incremental-coverage-audit.json,incremental-coverage.log,build-endaction-final.log,final-check-0.log through final-check-8.log,browser-results,validated-browser-evidence}. Full suites intentionally not repeated: task3 after ACR55N, per approved ten-task cadence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-22T20:27:13.800Z — VERIFY — ok

    By: CODER

    Note: Verified d3539d3199ec: final45 related tests and16 Chromium scenarios; prior broad1401 tests/60 scenarios labeled before last completion fix. Nine-owner strict exact-span coverage100%; required static/resource/build/provenance checks pass. Evidence output/playwright/writer-row-balancing; task3 after full checkpoint, no full repeat.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T20:26:58.343Z, excerpt_hash=sha256:8d3e47ffc30af3c15f76c4f9d8a598dce7b6a8aea3ae41e341a9ae9b4d32b3a5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610221940-TV1H69/blueprint/resolved-snapshot.json
    - old_digest: 1cab5c8dbc94440d3fa788e6ea0ea2f3898ab9d12a8f1bf14c654580f6df384d
    - current_digest: 1cab5c8dbc94440d3fa788e6ea0ea2f3898ab9d12a8f1bf14c654580f6df384d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610221940-TV1H69

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610221940-TV1H69
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task implementation commits while retaining completed table flow and column sizing functionality. No branch/integration operations."
  Findings: |-
    Previous goal turn made verified progress: AAX9TR closed with native column width command/dialog, document-bound size drafts and clean writer state. Current inspection found row Format returns height without publishing actual frame areas, browser paint calls Format(0), and offscreen measurement inherits authored fixed/minimum heights. These prevent faithful native balancing and content shrink. Existing root already owns real registered frames and measured device inputs; extend that ownership without parallel geometry registries. Broad user continuation/mutation authorization remains in force; use pinned local sources, no network or outside access.

    - Observation: A read-only task-brief command piped through head reported EPIPE after the consumer closed stdout; canonical task state was already DOING and its route remained artifact persistence.
      Impact: No implementation mutation occurred; this is output handling rather than a source or scope failure.
      Resolution: Recompute authoritative route and use bounded tool output instead of early-closing stdout pipes. Retain original failure and continue approved artifact persistence.

    - Observation: Initial Chromium run terminated before discovery because localhost4173 was already occupied; no browser scenarios executed.
      Impact: Browser behavior is not yet verified. The occupied listener is not evidence of a live test run belonging to this task.
      Resolution: Inspect the exact listener and ownership; preserve unrelated servers. If needed, use an ignored task-local Playwright configuration on a verified free localhost port while retaining source test settings and storage origin.

    - Observation: Native layout completion test exposed root snapshot reuse after a direct row-format invalidation without a model revision. Real long-text Chromium flows completed sizing but exact subpixel equality was too strict, and the existing device table measurement supplied fractional twips to native integer frame areas.
      Impact: A native Calc boundary must complete invalidated geometry even when the model revision is unchanged; physical browser row boundaries may differ by less than one twip due to pixel quantization.
      Resolution: Invalidate the represented root before completing Calc from its existing device inputs; convert measured natural row heights to nearest integer twips at the device boundary. Retain exact native attribute assertions and compare rendered natural-content geometry within one twip. No threshold or source algorithm change.

    - Observation: Native SetRowHeight also ends an action before subsequent commands. The existing portable wrapper did not complete root geometry, so an immediate core balancing call could read the previous authored heights without an intervening browser render.
      Impact: The same approved row-sizing action contract requires completion for ordinary row-height edits as well as the two balancing passes.
      Resolution: Complete original root layout after SetRowHeight, matching its inspected native EndAllActionAndCall path; add a direct real-frame SetRowHeight-then-balance regression. Full generic native action scheduling and fresh device remeasurement on unrelated history remain outside the represented profile and unverified; no ad-hoc history special case is introduced.

    - Observation: Raw focused and broad owner-wide coverage gates remain below100 because they intentionally omit unchanged unrelated callbacks. No raw failure was hidden. Final strict audit reuses only prior counters for byte-identical complete spans at corresponding diff locations; ambiguous maps abort, fresh changed counters are mandatory. Source behavior preserves signed32 total and unsigned64 division, and two optimal undo actions (suspected issues WRITER050/051).
      Impact: Verification establishes the bounded represented flat-row sizing contract; it does not establish full native geometry, generic action/history scheduling, nested rows, RTL/vertical layout, or protected/deleted-table parity. Registry statuses and defaults are not promoted.
      Resolution: Retain raw logs and deterministic audit script/hash evidence under task output. Final focused suite and16 Chromium scenarios run after the last source change. Broader1401/60 runs precede that small action-completion correction and are labeled accordingly. No full suite until ten-task checkpoint; continue active goal after task closure.
id_source: "generated"
---
## Summary

Complete native Writer row height balancing and layout publication

Port native BalanceRowHeight through actual registered row frame areas, synchronous shell layout completion and source UI commands; correct natural row device measurement and remove layout mutation from browser paint.

## Scope

Only vite-office-writer on writer. Native row frame geometry/publication, existing root layout completion and browser natural-row device measurement, document/shell BalanceRowHeight, two original table sizing slots and their menu/sidebar controls, related core/layout/UI/ODT/browser tests and conservative provenance/runtime records. Port source selection, history and arithmetic without model snapshots or browser-supplied command height arrays. No column auto-fit, structural deletion, network/branch/merge operations, locale expansion or recovery/save/open policy changes.

## Plan

Publish represented row frame/print area height during core Format and remove Format calls from browser paint; measure natural row content independently of authored fixed/minimum height. Complete root layout synchronously from its existing device inputs at the native shell action boundary. Port native BalanceRowHeight test-only admission, registered SwFrame maximums and optimize-average/normal-maximum modes through actual row formats and history. Connect SetOptimalRowHeight and DistributeRows with source two-pass ordering, state, menu placements and full consumed row-sizing sidebar group. Verify natural-content shrink/growth, selection, callbacks, frame identity, history and ODT on desktop/mobile; document any suspected upstream arithmetic issue and preserve it. Continue goal after task closure.

## Verify Steps

Verify real registered row frame areas, print-height publication and invalidation; test-only command must not mutate history/layout/model. Cover current versus table-selected and ordinary marks, multiple frame clients, optimize mean and normal running maximum, exact item/history/cursor behavior and arithmetic boundaries from source. Verify shell completion between two optimal-height passes using original root-owned measured geometry. Browser tests at1280/390 must prove content-dependent natural sizing, shrinking after fixed height, distribution of unequal rows, proper source UI sensitivity and repeated Undo/Redo, actual ODT roundtrip and original cursor owners. Run related row/table layout, measurement, native owner, sizing/sidebar/menu and I/O regressions; strict coverage for changed responsibilities, typecheck, changed-source lint/format, build/static, resources/boundaries/JSDoc/file-size/source-tree/provenance/invariants/parity and AgentPlane doctor/routing. Task3 after ACR55N full checkpoint; do not repeat full suites until the ten-task cadence.

## Verification

PASS. Current-source focused coverage run: 7 files /45 tests after SetRowHeight action-completion correction; prior broad related run188 files /1401 tests. Final Chromium4 files /16 scenarios passed at1280/390 including immediate sidebar height then distribution, optimize/distribute, natural content shrink/growth, history and actual ODT; prior broader22 files /60 scenarios passed before the final correction. Desktop/mobile final screenshots inspected. Strict nine-owner exact-source incremental audit:1893/1893 lines,2117/2117 statements,418/418 functions,1556/1556 branch arms. Source-byte-corresponding previous hits only; changed spans require fresh execution. Current-source build, typecheck, scoped ESLint/Prettier, resources, boundaries, JSDoc, file-size, source-tree, provenance, invariants, parity, static smoke, routing and diff checks pass. Doctor has zero errors and the existing managed-hook readiness warning. Evidence: output/playwright/writer-row-balancing/{final-delta-coverage.log,related-coverage.log,browser-endaction-final.log,browser-related.log,incremental-coverage-audit.json,incremental-coverage.log,build-endaction-final.log,final-check-0.log through final-check-8.log,browser-results,validated-browser-evidence}. Full suites intentionally not repeated: task3 after ACR55N, per approved ten-task cadence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-22T20:27:13.800Z — VERIFY — ok

By: CODER

Note: Verified d3539d3199ec: final45 related tests and16 Chromium scenarios; prior broad1401 tests/60 scenarios labeled before last completion fix. Nine-owner strict exact-span coverage100%; required static/resource/build/provenance checks pass. Evidence output/playwright/writer-row-balancing; task3 after full checkpoint, no full repeat.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T20:26:58.343Z, excerpt_hash=sha256:8d3e47ffc30af3c15f76c4f9d8a598dce7b6a8aea3ae41e341a9ae9b4d32b3a5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610221940-TV1H69/blueprint/resolved-snapshot.json
- old_digest: 1cab5c8dbc94440d3fa788e6ea0ea2f3898ab9d12a8f1bf14c654580f6df384d
- current_digest: 1cab5c8dbc94440d3fa788e6ea0ea2f3898ab9d12a8f1bf14c654580f6df384d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610221940-TV1H69

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610221940-TV1H69
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task implementation commits while retaining completed table flow and column sizing functionality. No branch/integration operations.

## Findings

Previous goal turn made verified progress: AAX9TR closed with native column width command/dialog, document-bound size drafts and clean writer state. Current inspection found row Format returns height without publishing actual frame areas, browser paint calls Format(0), and offscreen measurement inherits authored fixed/minimum heights. These prevent faithful native balancing and content shrink. Existing root already owns real registered frames and measured device inputs; extend that ownership without parallel geometry registries. Broad user continuation/mutation authorization remains in force; use pinned local sources, no network or outside access.

- Observation: A read-only task-brief command piped through head reported EPIPE after the consumer closed stdout; canonical task state was already DOING and its route remained artifact persistence.
  Impact: No implementation mutation occurred; this is output handling rather than a source or scope failure.
  Resolution: Recompute authoritative route and use bounded tool output instead of early-closing stdout pipes. Retain original failure and continue approved artifact persistence.

- Observation: Initial Chromium run terminated before discovery because localhost4173 was already occupied; no browser scenarios executed.
  Impact: Browser behavior is not yet verified. The occupied listener is not evidence of a live test run belonging to this task.
  Resolution: Inspect the exact listener and ownership; preserve unrelated servers. If needed, use an ignored task-local Playwright configuration on a verified free localhost port while retaining source test settings and storage origin.

- Observation: Native layout completion test exposed root snapshot reuse after a direct row-format invalidation without a model revision. Real long-text Chromium flows completed sizing but exact subpixel equality was too strict, and the existing device table measurement supplied fractional twips to native integer frame areas.
  Impact: A native Calc boundary must complete invalidated geometry even when the model revision is unchanged; physical browser row boundaries may differ by less than one twip due to pixel quantization.
  Resolution: Invalidate the represented root before completing Calc from its existing device inputs; convert measured natural row heights to nearest integer twips at the device boundary. Retain exact native attribute assertions and compare rendered natural-content geometry within one twip. No threshold or source algorithm change.

- Observation: Native SetRowHeight also ends an action before subsequent commands. The existing portable wrapper did not complete root geometry, so an immediate core balancing call could read the previous authored heights without an intervening browser render.
  Impact: The same approved row-sizing action contract requires completion for ordinary row-height edits as well as the two balancing passes.
  Resolution: Complete original root layout after SetRowHeight, matching its inspected native EndAllActionAndCall path; add a direct real-frame SetRowHeight-then-balance regression. Full generic native action scheduling and fresh device remeasurement on unrelated history remain outside the represented profile and unverified; no ad-hoc history special case is introduced.

- Observation: Raw focused and broad owner-wide coverage gates remain below100 because they intentionally omit unchanged unrelated callbacks. No raw failure was hidden. Final strict audit reuses only prior counters for byte-identical complete spans at corresponding diff locations; ambiguous maps abort, fresh changed counters are mandatory. Source behavior preserves signed32 total and unsigned64 division, and two optimal undo actions (suspected issues WRITER050/051).
  Impact: Verification establishes the bounded represented flat-row sizing contract; it does not establish full native geometry, generic action/history scheduling, nested rows, RTL/vertical layout, or protected/deleted-table parity. Registry statuses and defaults are not promoted.
  Resolution: Retain raw logs and deterministic audit script/hash evidence under task output. Final focused suite and16 Chromium scenarios run after the last source change. Broader1401/60 runs precede that small action-completion correction and are labeled accordingly. No full suite until ten-task checkpoint; continue active goal after task closure.
