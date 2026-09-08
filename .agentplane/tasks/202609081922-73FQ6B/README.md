---
id: "202609081922-73FQ6B"
title: "Reimplement Writer character attributes as pooled items"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-08T19:23:32.734Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-08T20:07:04.139Z"
  updated_by: "CODER"
  note: "verified-202609081922-73FQ6B"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-08T20:07:18.331Z"
  updated_by: "EVALUATOR"
  note: "Pooled Writer character attributes preserve LibreOffice WhichId, item-set ownership, inheritance, cloning, snapshot, and bounded ODF semantics without regressions."
  evaluated_sha: "e32c6fa5f04d21dd1eadbec1906827ae374b7e39"
  blueprint_digest: "21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8"
  evidence_refs:
    - ".agentplane/tasks/202609081922-73FQ6B/README.md"
    - ".agentplane/tasks/202609081922-73FQ6B/quality/20260908-200718331-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609081922-73FQ6B/quality/20260908-200718331-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609081922-73FQ6B/quality/20260908-200718331-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609081922-73FQ6B/blueprint/resolved-snapshot.json"
    - "npm run verify"
    - "npm run check:source-provenance"
    - "npm run check:source-tree"
    - "npm run inventory:parity"
  findings:
    - "All planned behavior is implemented and fully verified; real LibreOffice ODT fixtures now reach the explicit next unsupported paragraph-margin model boundary."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace Writer boolean canonical character formatting with pooled RES_CHRATR item sets and source-guided ODF mappings while preserving browser runs as derived projections."
events:
  -
    type: "status"
    at: "2026-09-08T19:23:41.022Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace Writer boolean canonical character formatting with pooled RES_CHRATR item sets and source-guided ODF mappings while preserving browser runs as derived projections."
  -
    type: "verify"
    at: "2026-09-08T20:06:51.184Z"
    author: "CODER"
    state: "ok"
    note: "Verified pooled RES_CHRATR Western/CJK/CTL weight and posture plus underline, item-backed SwFormatAutoFormat snapshots and inheritance, ODF style import/export, 152 office tests and 74 inventory tests at 100% coverage, 7 Chromium E2E tests, pinned LibreOffice fixtures reaching explicit fo:margin-top boundary, zero parity exceptions, source provenance/tree, static build, doctor, and routing."
  -
    type: "verify"
    at: "2026-09-08T20:07:04.139Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609081922-73FQ6B"
doc_version: 3
doc_updated_at: "2026-09-08T20:07:04.197Z"
doc_updated_by: "CODER"
description: "Replace boolean canonical character formatting with LibreOffice-shaped RES_CHRATR pooled items, SfxItemSet-backed SwFormatAutoFormat hints, paragraph-style character inheritance, and source-guided ODF mapping while preserving browser runs as derived projections."
sections:
  Summary: "Reimplement the current Writer bold, italic, and underline state on LibreOffice-shaped pooled character items. Canonical text hints must own SfxItemSet-backed SwFormatAutoFormat data, while React, clipboard, and command runs remain derived boolean projections."
  Scope: "In scope: exact RES_CHRATR identities for Western/CJK/CTL weight and posture plus underline; bounded SvxWeightItem, SvxPostureItem, and SvxUnderlineItem classes; SwAttrPool registration; character-capable Writer item ranges; SfxItemSet-backed SwFormatAutoFormat and SwpHints; snapshot migration/restore; ODF supported-property mapping into style and automatic-format item sets; source provenance, parity, and architecture documentation. Out of scope: font family/size/language/color, arbitrary paragraph styles, complete ODF style import, layout, and browser File Open/Save UI."
  Plan: "Implement source-owned EditEngine item classes first, then wire their defaults and ranges into Writer. Refactor text hints without changing browser command APIs by translating between item sets and WriterCharacterAttributes only at projection boundaries. Move ODF character-style data through item sets and style inheritance, update persistence, and verify that no canonical boolean formatting store remains."
  Verify Steps: "1. Inspect the final diff and search canonical Writer core paths. Expected: SwFormatAutoFormat stores an SfxItemSet or SwAttrSet representation, exact RES_CHRATR WhichIds are used, and boolean WriterCharacterAttributes exist only at browser/command projection boundaries. 2. Run focused Vitest suites for EditEngine text items, SfxItemSet/SwAttrPool, Writer hints/editing/snapshot cloning, and ODF import/export. Expected: exact enum/WhichId/default/inheritance semantics, independent cloning, range normalization, and XML round trips all pass at 100 percent changed-branch coverage. 3. Exercise the pinned LibreOffice feature_text, feature_text_bold, and feature_text_italic ODT fixtures through the ZIP and XML import path or record the exact next unsupported semantic boundary. Expected: package parsing succeeds and any rejection is tied to an explicit unimplemented model item rather than ZIP structure or boolean canonical storage. 4. Run npm run check:source-provenance, npm run check:source-tree, and the Writer parity validator against vendor/libreoffice-reference. Expected: every runtime file maps to existing pinned sources and parity has zero evidence exceptions. 5. Run npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and full git status. Expected: formatting, lint, typecheck, both 100 percent coverage suites, all Chromium E2E, static build, docs/file-size gates, workflow checks, and repository hygiene pass."
  Verification: |-
    Pending implementation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-08T20:06:51.184Z — VERIFY — ok

    By: CODER

    Note: Verified pooled RES_CHRATR Western/CJK/CTL weight and posture plus underline, item-backed SwFormatAutoFormat snapshots and inheritance, ODF style import/export, 152 office tests and 74 inventory tests at 100% coverage, 7 Chromium E2E tests, pinned LibreOffice fixtures reaching explicit fo:margin-top boundary, zero parity exceptions, source provenance/tree, static build, doctor, and routing.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T19:23:41.022Z, excerpt_hash=sha256:d1bd78213b3e17e14d766e163ba5a55a84ced99076ff842d3f70bbe6e4aa30ed

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081922-73FQ6B/blueprint/resolved-snapshot.json
    - old_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
    - current_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081922-73FQ6B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609081922-73FQ6B
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-08T20:07:04.139Z — VERIFY — ok

    By: CODER

    Note: verified-202609081922-73FQ6B
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T20:06:51.242Z, excerpt_hash=sha256:d1bd78213b3e17e14d766e163ba5a55a84ced99076ff842d3f70bbe6e4aa30ed

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081922-73FQ6B/blueprint/resolved-snapshot.json
    - old_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
    - current_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609081922-73FQ6B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609081922-73FQ6B --result verified-202609081922-73FQ6B --commit e32c6fa5f04d21dd1eadbec1906827ae374b7e39
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and task-close commits. Restore boolean hint snapshots only through the existing migration reader, remove the new character item module and provenance entries, and rerun the complete Writer and ODT verification set."
  Findings: "Audit finding: Writer paragraph items already use SfxItemSet, but RES_TXTATR_AUTOFMT still owns a plain boolean object. This diverges from LibreOffice SwFormatAutoFormat and prevents paragraph-style character properties from participating in the same inherited item graph. Pinned feature_text packages now pass ZIP validation and fail at this semantic boundary."
id_source: "generated"
---
## Summary

Reimplement the current Writer bold, italic, and underline state on LibreOffice-shaped pooled character items. Canonical text hints must own SfxItemSet-backed SwFormatAutoFormat data, while React, clipboard, and command runs remain derived boolean projections.

## Scope

In scope: exact RES_CHRATR identities for Western/CJK/CTL weight and posture plus underline; bounded SvxWeightItem, SvxPostureItem, and SvxUnderlineItem classes; SwAttrPool registration; character-capable Writer item ranges; SfxItemSet-backed SwFormatAutoFormat and SwpHints; snapshot migration/restore; ODF supported-property mapping into style and automatic-format item sets; source provenance, parity, and architecture documentation. Out of scope: font family/size/language/color, arbitrary paragraph styles, complete ODF style import, layout, and browser File Open/Save UI.

## Plan

Implement source-owned EditEngine item classes first, then wire their defaults and ranges into Writer. Refactor text hints without changing browser command APIs by translating between item sets and WriterCharacterAttributes only at projection boundaries. Move ODF character-style data through item sets and style inheritance, update persistence, and verify that no canonical boolean formatting store remains.

## Verify Steps

1. Inspect the final diff and search canonical Writer core paths. Expected: SwFormatAutoFormat stores an SfxItemSet or SwAttrSet representation, exact RES_CHRATR WhichIds are used, and boolean WriterCharacterAttributes exist only at browser/command projection boundaries. 2. Run focused Vitest suites for EditEngine text items, SfxItemSet/SwAttrPool, Writer hints/editing/snapshot cloning, and ODF import/export. Expected: exact enum/WhichId/default/inheritance semantics, independent cloning, range normalization, and XML round trips all pass at 100 percent changed-branch coverage. 3. Exercise the pinned LibreOffice feature_text, feature_text_bold, and feature_text_italic ODT fixtures through the ZIP and XML import path or record the exact next unsupported semantic boundary. Expected: package parsing succeeds and any rejection is tied to an explicit unimplemented model item rather than ZIP structure or boolean canonical storage. 4. Run npm run check:source-provenance, npm run check:source-tree, and the Writer parity validator against vendor/libreoffice-reference. Expected: every runtime file maps to existing pinned sources and parity has zero evidence exceptions. 5. Run npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and full git status. Expected: formatting, lint, typecheck, both 100 percent coverage suites, all Chromium E2E, static build, docs/file-size gates, workflow checks, and repository hygiene pass.

## Verification

Pending implementation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-08T20:06:51.184Z — VERIFY — ok

By: CODER

Note: Verified pooled RES_CHRATR Western/CJK/CTL weight and posture plus underline, item-backed SwFormatAutoFormat snapshots and inheritance, ODF style import/export, 152 office tests and 74 inventory tests at 100% coverage, 7 Chromium E2E tests, pinned LibreOffice fixtures reaching explicit fo:margin-top boundary, zero parity exceptions, source provenance/tree, static build, doctor, and routing.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T19:23:41.022Z, excerpt_hash=sha256:d1bd78213b3e17e14d766e163ba5a55a84ced99076ff842d3f70bbe6e4aa30ed

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081922-73FQ6B/blueprint/resolved-snapshot.json
- old_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
- current_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081922-73FQ6B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609081922-73FQ6B
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-08T20:07:04.139Z — VERIFY — ok

By: CODER

Note: verified-202609081922-73FQ6B
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-08T20:06:51.242Z, excerpt_hash=sha256:d1bd78213b3e17e14d766e163ba5a55a84ced99076ff842d3f70bbe6e4aa30ed

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609081922-73FQ6B/blueprint/resolved-snapshot.json
- old_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
- current_digest: 21e5144ba657306dc8477e312be8530564173fb4082dde4da08a3b572d8c55a8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609081922-73FQ6B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609081922-73FQ6B --result verified-202609081922-73FQ6B --commit e32c6fa5f04d21dd1eadbec1906827ae374b7e39
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and task-close commits. Restore boolean hint snapshots only through the existing migration reader, remove the new character item module and provenance entries, and rerun the complete Writer and ODT verification set.

## Findings

Audit finding: Writer paragraph items already use SfxItemSet, but RES_TXTATR_AUTOFMT still owns a plain boolean object. This diverges from LibreOffice SwFormatAutoFormat and prevents paragraph-style character properties from participating in the same inherited item graph. Pinned feature_text packages now pass ZIP validation and fail at this semantic boundary.
