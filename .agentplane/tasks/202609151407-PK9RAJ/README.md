---
id: "202609151407-PK9RAJ"
title: "Implement Writer upstream parity Phase 4"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T14:07:52.588Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T14:08:05.933Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-15T14:33:58.258Z"
doc_updated_by: "CODER"
description: "Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main."
sections:
  Summary: |-
    Implement Writer upstream parity Phase 4

    Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main.
  Scope: |-
    - In scope: P4.1 object-identity SfxMedium and shell-owned lifecycle/save/recovery state; P4.2 SwDocShell, SwView, SwWrtShell and bounded context/list shell ownership; P4.3 decomposition of file, transfer, view-option and operation-state workflows; P4.4 undo grouping, comments, cursor/list/style/save-mark integration; necessary tests, provenance and parity inventories.
    - Authority: pinned vendor/libreoffice-reference tag libreoffice-26.8.0.2 at commit 9bc445578031fecf56086729d8e4940c77e14d65.
    - Browser adaptations remain narrow ports at browser/vcl boundaries.
    - No backward compatibility for superseded persisted document snapshots.
    - Out of scope: independent Phase 5 DOM projection and Phase 7 filter/storage redesign beyond dependencies strictly required by Phase 4.
  Plan: "Implement approved Phase 4 as one atomic CODER-owned deliverable with upstream-derived shell, medium, lifecycle, workflow, and undo ownership; verify focused behavior and the full repository; finish and push main."
  Verify Steps: |-
    1. `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docfile.test.ts src/sfx2/source/doc/objsh.test.ts src/svl/source/undo/undo.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/uiview/view.test.tsx src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/browser/workflows/writer-workflows.test.ts src/framework/source/services/autorecovery.test.ts` — expected: focused shell, lifecycle, workflow, recovery, and undo tests pass.
    2. `npm run typecheck` — expected: production and tooling TypeScript contracts compile.
    3. `npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity` — expected: ownership boundaries, upstream paths, evidence, and parity mappings pass.
    4. `npm run verify` — expected: complete repository validation, coverage, browser e2e, build, inventories, formatting, lint, and static checks pass.
    5. `ap doctor && node .agentplane/policy/check-routing.mjs` — expected: Agentplane health and policy routing pass.
    6. `git status --short --untracked-files=all` — expected: no unintended changes or unreviewed artifacts remain before finish/push.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the Phase 4 implementation and Agentplane lifecycle commits.
    - Do not restore compatibility shims for the superseded persistence model.
    - Re-run focused tests and npm run verify after rollback.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Writer upstream parity Phase 4

Restore shell, medium, lifecycle, browser workflow, and undo ownership for the supported Writer slice using pinned LibreOffice 26.8.0.2 semantics; update tests and parity evidence; verify and push main.

## Scope

- In scope: P4.1 object-identity SfxMedium and shell-owned lifecycle/save/recovery state; P4.2 SwDocShell, SwView, SwWrtShell and bounded context/list shell ownership; P4.3 decomposition of file, transfer, view-option and operation-state workflows; P4.4 undo grouping, comments, cursor/list/style/save-mark integration; necessary tests, provenance and parity inventories.
- Authority: pinned vendor/libreoffice-reference tag libreoffice-26.8.0.2 at commit 9bc445578031fecf56086729d8e4940c77e14d65.
- Browser adaptations remain narrow ports at browser/vcl boundaries.
- No backward compatibility for superseded persisted document snapshots.
- Out of scope: independent Phase 5 DOM projection and Phase 7 filter/storage redesign beyond dependencies strictly required by Phase 4.

## Plan

Implement approved Phase 4 as one atomic CODER-owned deliverable with upstream-derived shell, medium, lifecycle, workflow, and undo ownership; verify focused behavior and the full repository; finish and push main.

## Verify Steps

1. `npm exec --workspace @vite-office/office -- vitest run src/sfx2/source/doc/docfile.test.ts src/sfx2/source/doc/objsh.test.ts src/svl/source/undo/undo.test.ts src/sw/source/core/doc/writer-storage.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/source/uibase/uiview/view.test.tsx src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/browser/workflows/writer-workflows.test.ts src/framework/source/services/autorecovery.test.ts` — expected: focused shell, lifecycle, workflow, recovery, and undo tests pass.
2. `npm run typecheck` — expected: production and tooling TypeScript contracts compile.
3. `npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:parity` — expected: ownership boundaries, upstream paths, evidence, and parity mappings pass.
4. `npm run verify` — expected: complete repository validation, coverage, browser e2e, build, inventories, formatting, lint, and static checks pass.
5. `ap doctor && node .agentplane/policy/check-routing.mjs` — expected: Agentplane health and policy routing pass.
6. `git status --short --untracked-files=all` — expected: no unintended changes or unreviewed artifacts remain before finish/push.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the Phase 4 implementation and Agentplane lifecycle commits.
- Do not restore compatibility shims for the superseded persistence model.
- Re-run focused tests and npm run verify after rollback.

## Findings
