---
id: "202608100706-BQGY2W"
title: "Validate and commit corrected AgentPlane policy gateway"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T07:07:27.376Z"
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
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-08-10T07:07:40.671Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-08-10T07:07:40.671Z"
doc_updated_by: "DOCS"
description: "Validate the user-supplied AGENTS.md replacement against AgentPlane 0.6.26 and canonical policy modules, commit only the corrected gateway and task lifecycle artifacts, and close the dedicated docs/policy task before resuming frontend implementation."
sections:
  Summary: "Validate and commit the corrected AgentPlane policy gateway supplied by the user. The replacement must match the installed AgentPlane 0.6.26 direct-workflow command surface and remain a compact routing gateway."
  Scope: |-
    - In scope: AGENTS.md and the AgentPlane lifecycle artifacts for task 202608100706-BQGY2W.
    - Validate the already supplied gateway; make only corrections required by repository enforcement or canonical policy consistency.
    - Out of scope: canonical policy module edits, frontend implementation, dependency installation, LibreOffice cloning, and changes to task 202608100659-GY449B beyond preserving its existing artifact.
  Plan: |-
    1. Inspect the user-supplied AGENTS.md diff against installed AgentPlane 0.6.26 guidance and canonical modules.
    2. Validate routing, command references, canonical links, line budget, whitespace, and AgentPlane health.
    3. If validation exposes a gateway-only defect, correct only AGENTS.md and rerun all checks; otherwise preserve the supplied content unchanged.
    4. Record verification and independent evaluator evidence.
    5. Commit only AGENTS.md and this task's lifecycle artifacts, close the task, confirm final Git status, then resume task 202608100659-GY449B.
  Verify Steps: |-
    1. Run `git diff -- AGENTS.md` and confirm the replacement removes unsupported `task advance --agent-json` guidance and restores the installed 0.6.26 preflight, role, route, lifecycle, and verification commands.
    2. Run `node .agentplane/policy/check-routing.mjs`. Expected: `policy routing OK`.
    3. Run `agentplane doctor`. Expected: zero errors and zero warnings.
    4. Run `wc -l AGENTS.md`. Expected: no more than 250 lines.
    5. Resolve every `@.agentplane/policy/...` import and canonical policy/example path named by AGENTS.md. Expected: every referenced repository path exists.
    6. Run `git diff --check -- AGENTS.md`. Expected: no whitespace errors.
    7. Inspect `git status --short --untracked-files=all`. Expected: the task commit contains only AGENTS.md and task 202608100706-BQGY2W lifecycle artifacts; the pre-existing untracked task 202608100659-GY449B README remains uncommitted and untouched.
    8. Run an EVALUATOR review against the changed gateway and recorded command evidence. Expected: pass with no unresolved conflict or missing verification.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task's deterministic commits if the corrected gateway proves incompatible.
    - Restore the preceding tracked AGENTS.md revision and rerun routing plus AgentPlane doctor.
    - Do not alter or delete the independent frontend task artifact during rollback.
  Findings: "Pre-implementation read-only evidence on 2026-08-10: `node .agentplane/policy/check-routing.mjs` passed, `agentplane doctor` reported zero errors and warnings, AGENTS.md contains 216 lines, referenced policy imports exist, and `git diff --check -- AGENTS.md` passed. The prior gateway described `task advance --agent-json`, which installed AgentPlane 0.6.26 rejects; the user-supplied replacement restores the compatible direct-workflow command surface. Task-document shell quoting briefly expanded Markdown command substitutions while drafting Verify Steps; the malformed text was detected before plan approval, no implementation or policy file was changed by that error, and the section was replaced safely."
id_source: "generated"
---
## Summary

Validate and commit the corrected AgentPlane policy gateway supplied by the user. The replacement must match the installed AgentPlane 0.6.26 direct-workflow command surface and remain a compact routing gateway.

## Scope

- In scope: AGENTS.md and the AgentPlane lifecycle artifacts for task 202608100706-BQGY2W.
- Validate the already supplied gateway; make only corrections required by repository enforcement or canonical policy consistency.
- Out of scope: canonical policy module edits, frontend implementation, dependency installation, LibreOffice cloning, and changes to task 202608100659-GY449B beyond preserving its existing artifact.

## Plan

1. Inspect the user-supplied AGENTS.md diff against installed AgentPlane 0.6.26 guidance and canonical modules.
2. Validate routing, command references, canonical links, line budget, whitespace, and AgentPlane health.
3. If validation exposes a gateway-only defect, correct only AGENTS.md and rerun all checks; otherwise preserve the supplied content unchanged.
4. Record verification and independent evaluator evidence.
5. Commit only AGENTS.md and this task's lifecycle artifacts, close the task, confirm final Git status, then resume task 202608100659-GY449B.

## Verify Steps

1. Run `git diff -- AGENTS.md` and confirm the replacement removes unsupported `task advance --agent-json` guidance and restores the installed 0.6.26 preflight, role, route, lifecycle, and verification commands.
2. Run `node .agentplane/policy/check-routing.mjs`. Expected: `policy routing OK`.
3. Run `agentplane doctor`. Expected: zero errors and zero warnings.
4. Run `wc -l AGENTS.md`. Expected: no more than 250 lines.
5. Resolve every `@.agentplane/policy/...` import and canonical policy/example path named by AGENTS.md. Expected: every referenced repository path exists.
6. Run `git diff --check -- AGENTS.md`. Expected: no whitespace errors.
7. Inspect `git status --short --untracked-files=all`. Expected: the task commit contains only AGENTS.md and task 202608100706-BQGY2W lifecycle artifacts; the pre-existing untracked task 202608100659-GY449B README remains uncommitted and untouched.
8. Run an EVALUATOR review against the changed gateway and recorded command evidence. Expected: pass with no unresolved conflict or missing verification.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task's deterministic commits if the corrected gateway proves incompatible.
- Restore the preceding tracked AGENTS.md revision and rerun routing plus AgentPlane doctor.
- Do not alter or delete the independent frontend task artifact during rollback.

## Findings

Pre-implementation read-only evidence on 2026-08-10: `node .agentplane/policy/check-routing.mjs` passed, `agentplane doctor` reported zero errors and warnings, AGENTS.md contains 216 lines, referenced policy imports exist, and `git diff --check -- AGENTS.md` passed. The prior gateway described `task advance --agent-json`, which installed AgentPlane 0.6.26 rejects; the user-supplied replacement restores the compatible direct-workflow command surface. Task-document shell quoting briefly expanded Markdown command substitutions while drafting Verify Steps; the malformed text was detected before plan approval, no implementation or policy file was changed by that error, and the section was replaced safely.
