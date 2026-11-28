---
id: "202611280824-8CEV8N"
title: "Port Writer ODT heading fields and chapter references"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:24:55.241Z"
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
    body: "Start: port the native heading lookup, Chapter field and chapter-reference presentation across the represented Writer layout and ODT path."
events:
  -
    type: "status"
    at: "2026-11-28T08:24:55.599Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port the native heading lookup, Chapter field and chapter-reference presentation across the represented Writer layout and ODT path."
doc_version: 3
doc_updated_at: "2026-11-28T08:24:55.599Z"
doc_updated_by: "CODER"
description: "Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker."
sections:
  Summary: |-
    Port Writer ODT heading fields and chapter references

    Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
  Scope: |-
    - In scope: Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
    - Out of scope: unrelated refactors not required for "Port Writer ODT heading fields and chapter references".
  Plan: "Trace pinned SwChapterField, SwNode outline lookup, plain outline number formatting and the Chapter UNO and XML contexts. Implement numbered headings and chapter references through native body/layout story lookup, ODT and Worker. Replay a pinned ODT chapter-field fixture and verify the affected Writer tests only. Preserve browser file/recovery and save behavior. Do not run full verification."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Writer ODT heading fields and chapter references". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Writer ODT heading fields and chapter references". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Port Writer ODT heading fields and chapter references

Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.

## Scope

- In scope: Implement native SwChapterField, outline lookup and formatted heading number/title across ODT page stories and body, chapter reference fields and the Writer Worker.
- Out of scope: unrelated refactors not required for "Port Writer ODT heading fields and chapter references".

## Plan

Trace pinned SwChapterField, SwNode outline lookup, plain outline number formatting and the Chapter UNO and XML contexts. Implement numbered headings and chapter references through native body/layout story lookup, ODT and Worker. Replay a pinned ODT chapter-field fixture and verify the affected Writer tests only. Preserve browser file/recovery and save behavior. Do not run full verification.

## Verify Steps

PLANNER fallback scaffold for "Port Writer ODT heading fields and chapter references". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Writer ODT heading fields and chapter references". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
