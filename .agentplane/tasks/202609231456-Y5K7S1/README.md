---
id: "202609231456-Y5K7S1"
title: "Preserve Writer construction defaults across document lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T14:57:26.235Z"
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
    body: "Start: Preserve session locale and font device through Writer New, ODT import/transfer, and browser cache restore with focused verification."
events:
  -
    type: "status"
    at: "2026-09-23T14:57:33.220Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Preserve session locale and font device through Writer New, ODT import/transfer, and browser cache restore with focused verification."
doc_version: 3
doc_updated_at: "2026-09-23T14:57:33.220Z"
doc_updated_by: "CODER"
description: "Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults."
sections:
  Summary: |-
    Preserve Writer construction defaults across document lifecycle

    Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
  Scope: |-
    - In scope: Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
    - Out of scope: unrelated refactors not required for "Preserve Writer construction defaults across document lifecycle".
  Plan: "1. Preserve the session construction context in SwDocShell and use it for New and ODT Open. 2. Store document locale in the canonical graph record; inject current font device when decoding browser cache and ODT transfers, including worker import/export. 3. Keep ODT document language where imported/exported source supports it; align versioned schemas without legacy loading. 4. Add focused locale, font and paper lifecycle tests; run typecheck, relevant Vitest suites, doctor and routing validation."
  Verify Steps: "1. Run npm exec -- vitest run focused Writer shell, codec, storage, ODT filter and worker tests. Expected: all pass, including locale/device/page golden cases. 2. Run npm run typecheck --workspace @vite-office/office. Expected: no TypeScript errors. 3. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: both pass. 4. Review git diff and git status --short --untracked-files=all. Expected: only intentional task changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Preserve Writer construction defaults across document lifecycle

Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.

## Scope

- In scope: Implement parity plan D: retain locale and font-device construction context through New, ODT import/worker transfer, and browser cache restore; persist document language without legacy compatibility; verify locale, font, and page defaults.
- Out of scope: unrelated refactors not required for "Preserve Writer construction defaults across document lifecycle".

## Plan

1. Preserve the session construction context in SwDocShell and use it for New and ODT Open. 2. Store document locale in the canonical graph record; inject current font device when decoding browser cache and ODT transfers, including worker import/export. 3. Keep ODT document language where imported/exported source supports it; align versioned schemas without legacy loading. 4. Add focused locale, font and paper lifecycle tests; run typecheck, relevant Vitest suites, doctor and routing validation.

## Verify Steps

1. Run npm exec -- vitest run focused Writer shell, codec, storage, ODT filter and worker tests. Expected: all pass, including locale/device/page golden cases. 2. Run npm run typecheck --workspace @vite-office/office. Expected: no TypeScript errors. 3. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: both pass. 4. Review git diff and git status --short --untracked-files=all. Expected: only intentional task changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
