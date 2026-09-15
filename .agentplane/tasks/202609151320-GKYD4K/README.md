---
id: "202609151320-GKYD4K"
title: "Implement Phase 3 Writer styles fonts and lists parity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T13:21:16.140Z"
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
    body: "Start: Approved Phase 3 implementation will port the bounded upstream Writer style, font, and list model with focused parity evidence."
events:
  -
    type: "status"
    at: "2026-09-15T13:21:21.859Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Approved Phase 3 implementation will port the bounded upstream Writer style, font, and list model with focused parity evidence."
doc_version: 3
doc_updated_at: "2026-09-15T13:21:21.859Z"
doc_updated_by: "CODER"
description: "Implement P3.1–P3.3 from docs/program/vite-office-upstream-parity-plan.md by porting supported upstream LibreOffice Writer style-pool semantics, default-font policy, and bounded list/numbering graph; verify fixtures, ODF behavior, and undo for the supported slice."
sections:
  Summary: |-
    Implement Phase 3 Writer styles fonts and lists parity

    Implement P3.1–P3.3 from docs/program/vite-office-upstream-parity-plan.md by porting supported upstream LibreOffice Writer style-pool semantics, default-font policy, and bounded list/numbering graph; verify fixtures, ODF behavior, and undo for the supported slice.
  Scope: |-
    - In scope: P3.1 style-pool identity, creation, semantic attributes, and locale display names; P3.2 Writer script/language default-font policy and VCL browser fallback; P3.3 bounded list/node counter graph, NumOrBulletOn supported behavior, ODF import/export, and undo.
    - In scope: upstream-derived source mapping under vendor/libreoffice-reference and focused regression tests.
    - Out of scope: unsupported Writer style families, browser presentation controls before their model semantics, and Phase 4+ shell/DOM work.
  Plan: "1. Compare the existing bounded Writer style, font, and list implementations with matching sources in vendor/libreoffice-reference; preserve upstream names, ownership, and file placement where the supported browser slice permits. 2. Port complete supported style-pool definitions and creation semantics, including immutable pool identities, parent/follow chains, item sets, outline assignment, and locale display-name resolution; expose only styles with implemented semantics. 3. Port the document default-font decision path through a VCL browser font-device abstraction for Western, CJK, and CTL script/language requests with deterministic fallback. 4. Replace the current rule-only numbering table with bounded SwList, SwNodeNum, list registration/invalidation, ten-level counter-tree, and NumOrBulletOn-compatible supported operations; update ODF codec and undo integration. 5. Add focused model, ODF, and undo tests; run specified checks; record evidence and finish with a traceable commit."
  Verify Steps: |-
    1. Run focused Writer model tests covering styles, font selection, lists/numbering, ODF round-trip, and undo. Expected: representative style/list fixtures preserve pool IDs, parent/follow links, ten-level labels, ODF structures, and undo state.
    2. Run npm run typecheck --workspace @vite-office/office and npm run lint. Expected: both pass with no errors.
    3. Run npm run check:source-tree, npm run check:source-provenance, and node .agentplane/policy/check-routing.mjs. Expected: upstream placement/provenance and policy routing pass.
    4. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Phase 3 implementation, tests, and task traceability are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Phase 3 implementation commit and task-close commit, then run the focused Writer model suite to restore the prior bounded model."
  Findings: ""
id_source: "generated"
---
## Summary

Implement Phase 3 Writer styles fonts and lists parity

Implement P3.1–P3.3 from docs/program/vite-office-upstream-parity-plan.md by porting supported upstream LibreOffice Writer style-pool semantics, default-font policy, and bounded list/numbering graph; verify fixtures, ODF behavior, and undo for the supported slice.

## Scope

- In scope: P3.1 style-pool identity, creation, semantic attributes, and locale display names; P3.2 Writer script/language default-font policy and VCL browser fallback; P3.3 bounded list/node counter graph, NumOrBulletOn supported behavior, ODF import/export, and undo.
- In scope: upstream-derived source mapping under vendor/libreoffice-reference and focused regression tests.
- Out of scope: unsupported Writer style families, browser presentation controls before their model semantics, and Phase 4+ shell/DOM work.

## Plan

1. Compare the existing bounded Writer style, font, and list implementations with matching sources in vendor/libreoffice-reference; preserve upstream names, ownership, and file placement where the supported browser slice permits. 2. Port complete supported style-pool definitions and creation semantics, including immutable pool identities, parent/follow chains, item sets, outline assignment, and locale display-name resolution; expose only styles with implemented semantics. 3. Port the document default-font decision path through a VCL browser font-device abstraction for Western, CJK, and CTL script/language requests with deterministic fallback. 4. Replace the current rule-only numbering table with bounded SwList, SwNodeNum, list registration/invalidation, ten-level counter-tree, and NumOrBulletOn-compatible supported operations; update ODF codec and undo integration. 5. Add focused model, ODF, and undo tests; run specified checks; record evidence and finish with a traceable commit.

## Verify Steps

1. Run focused Writer model tests covering styles, font selection, lists/numbering, ODF round-trip, and undo. Expected: representative style/list fixtures preserve pool IDs, parent/follow links, ten-level labels, ODF structures, and undo state.
2. Run npm run typecheck --workspace @vite-office/office and npm run lint. Expected: both pass with no errors.
3. Run npm run check:source-tree, npm run check:source-provenance, and node .agentplane/policy/check-routing.mjs. Expected: upstream placement/provenance and policy routing pass.
4. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Phase 3 implementation, tests, and task traceability are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Phase 3 implementation commit and task-close commit, then run the focused Writer model suite to restore the prior bounded model.

## Findings
