---
id: "202608100919-2WRBJ2"
title: "Inventory pinned LibreOffice XHP help topics into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202608100905-Q9AWEJ"
tags:
  - "documentation"
  - "inventory"
  - "libreoffice"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:19:32.853Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
verification:
  state: "ok"
  updated_at: "2026-08-10T09:30:13.118Z"
  updated_by: "REVIEWER"
  note: "Full verification and exact pinned XHP path comparison passed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract every pinned XHP help topic into deterministic provenance-only unmapped records."
events:
  -
    type: "status"
    at: "2026-08-10T09:19:33.445Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract every pinned XHP help topic into deterministic provenance-only unmapped records."
  -
    type: "verify"
    at: "2026-08-10T09:30:13.118Z"
    author: "REVIEWER"
    state: "ok"
    note: "Full verification and exact pinned XHP path comparison passed."
doc_version: 3
doc_updated_at: "2026-08-10T09:30:13.241Z"
doc_updated_by: "CODER"
description: "Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity."
sections:
  Summary: |-
    Inventory pinned LibreOffice XHP help topics into atomic records

    Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
  Scope: |-
    - In scope: Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
    - Out of scope: unrelated refactors not required for "Inventory pinned LibreOffice XHP help topics into atomic records".
  Plan: |-
    1. Define a provenance-only XHP topic record and exact 2,746-topic discovery contract.
    2. Implement a read-only deterministic extractor, command, tests, and generated JSON.
    3. Document the inventory handoff without copying help content or claiming documentation parity.
    4. Run full quality gates, record evidence and evaluator review, then close.
  Verify Steps: |-
    1. Strict tooling, lint, JSDoc, and file-size checks pass.
    2. Inventory test coverage remains 100% across executable modules.
    3. Regenerated help inventory has exactly 2,746 unique XHP topic records with helpcontent2 corpus and pinned help commit provenance.
    4. Output is byte-stable and exactly matches live Git XHP paths; no help content is copied.
    5. npm run verify passes and documentation links/ignore boundaries remain valid.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T09:30:13.118Z — VERIFY — ok

    By: REVIEWER

    Note: Full verification and exact pinned XHP path comparison passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:19:33.445Z, excerpt_hash=sha256:b45a292903d940eab31ad01584df005f6cabaa593564f892e58b295a1104fba4

    Details:

    npm run verify passed: format, lint, tool and app type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 67150ccf3c459581fff6363ca541831341ee4b5ec9c948adbfa9d617f97f7567; exact Git comparison confirmed 2746 source/text/<area> XHP paths at help commit 70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100919-2WRBJ2/blueprint/resolved-snapshot.json
    - old_digest: aaeda2f460060647d4107452fb6ba4a7149b7b60e02686246043bb675f8b4b8e
    - current_digest: aaeda2f460060647d4107452fb6ba4a7149b7b60e02686246043bb675f8b4b8e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608100919-2WRBJ2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608100919-2WRBJ2
    - diagnostic_command: agentplane task run status 202608100919-2WRBJ2
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: The deterministic XHP inventory contains all 2746 tracked pinned paths.
      Impact: Topic-content, license, behavior, and local documentation mapping remains intentionally unmapped.
      Resolution: A later atomic mapping task must resolve every LO-HELP-TOPIC record.
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice XHP help topics into atomic records

Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.

## Scope

- In scope: Extend deterministic inventory tooling to extract every pinned LibreOffice help XHP topic into canonical provenance-complete unmapped documentation records with exact corpus and topic counts, without copying help content or claiming documentation parity.
- Out of scope: unrelated refactors not required for "Inventory pinned LibreOffice XHP help topics into atomic records".

## Plan

1. Define a provenance-only XHP topic record and exact 2,746-topic discovery contract.
2. Implement a read-only deterministic extractor, command, tests, and generated JSON.
3. Document the inventory handoff without copying help content or claiming documentation parity.
4. Run full quality gates, record evidence and evaluator review, then close.

## Verify Steps

1. Strict tooling, lint, JSDoc, and file-size checks pass.
2. Inventory test coverage remains 100% across executable modules.
3. Regenerated help inventory has exactly 2,746 unique XHP topic records with helpcontent2 corpus and pinned help commit provenance.
4. Output is byte-stable and exactly matches live Git XHP paths; no help content is copied.
5. npm run verify passes and documentation links/ignore boundaries remain valid.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T09:30:13.118Z — VERIFY — ok

By: REVIEWER

Note: Full verification and exact pinned XHP path comparison passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T09:19:33.445Z, excerpt_hash=sha256:b45a292903d940eab31ad01584df005f6cabaa593564f892e58b295a1104fba4

Details:

npm run verify passed: format, lint, tool and app type checks, app and inventory coverage at 100%, Playwright E2E, static build, JSDoc, and file-size checks. Regeneration twice produced SHA-256 67150ccf3c459581fff6363ca541831341ee4b5ec9c948adbfa9d617f97f7567; exact Git comparison confirmed 2746 source/text/<area> XHP paths at help commit 70c3f30b73ae2cc3e1d2abe0e8c7cf643a56715b.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608100919-2WRBJ2/blueprint/resolved-snapshot.json
- old_digest: aaeda2f460060647d4107452fb6ba4a7149b7b60e02686246043bb675f8b4b8e
- current_digest: aaeda2f460060647d4107452fb6ba4a7149b7b60e02686246043bb675f8b4b8e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608100919-2WRBJ2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608100919-2WRBJ2
- diagnostic_command: agentplane task run status 202608100919-2WRBJ2
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: The deterministic XHP inventory contains all 2746 tracked pinned paths.
  Impact: Topic-content, license, behavior, and local documentation mapping remains intentionally unmapped.
  Resolution: A later atomic mapping task must resolve every LO-HELP-TOPIC record.
