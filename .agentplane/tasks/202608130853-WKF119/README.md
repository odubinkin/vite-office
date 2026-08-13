---
id: "202608130853-WKF119"
title: "Implement Writer Cut and Paste clipboard baseline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T08:53:48.797Z"
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
    body: "Start: implement bounded Writer Cut and Paste with the pinned Writer clipboard command placement and explicit format limits."
events:
  -
    type: "status"
    at: "2026-08-13T08:53:49.384Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement bounded Writer Cut and Paste with the pinned Writer clipboard command placement and explicit format limits."
doc_version: 3
doc_updated_at: "2026-08-13T08:53:49.384Z"
doc_updated_by: "CODER"
description: "Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly."
sections:
  Summary: |-
    Implement Writer Cut and Paste clipboard baseline

    Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly.
  Scope: |-
    - In scope: Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly.
    - Out of scope: unrelated refactors not required for "Implement Writer Cut and Paste clipboard baseline".
  Plan: "1. Add pure Writer selection replacement and deletion transitions that preserve paragraph ordering, list state, and direct text runs. 2. Add browser clipboard readers and bounded HTML/plain-text parser at sw/source/uibase/dochdl/swdtflvr.ts ownership; permit only Writer-produced strong/em/single-underline semantics and reject unsafe markup. 3. Wire native paste/cut events, Edit menu, standard toolbar, Ctrl/Meta X/V, immutable history, focused caret, and deterministic feedback through the Writer text shell/view. 4. Add tests for domain transitions, parser safety, menu/toolbar/shortcuts/history, native ClipboardEvent handling, and one targeted Chromium E2E. 5. Record LO-WRITER-0110, upstream implementation/UI/test/help evidence, explicit gaps, docs, source provenance when new modules are added, and file-size review. 6. Run npm run test:coverage, targeted E2E, lint/typecheck/docs/source-tree/provenance/static checks; full all-suite cadence remains deferred until the tenth completed task."
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

Implement Writer Cut and Paste clipboard baseline

Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly.

## Scope

- In scope: Implement LO-WRITER-0110: Writer Cut and Paste in their pinned Edit and standard-toolbar placements. Support one same-paragraph or whole-document browser selection, plain text and the bounded Writer semantic HTML emitted by Copy; preserve supported direct character formatting for safe HTML. Record unsupported clipboard formats, multi-range behavior, and full Writer filter semantics explicitly.
- Out of scope: unrelated refactors not required for "Implement Writer Cut and Paste clipboard baseline".

## Plan

1. Add pure Writer selection replacement and deletion transitions that preserve paragraph ordering, list state, and direct text runs. 2. Add browser clipboard readers and bounded HTML/plain-text parser at sw/source/uibase/dochdl/swdtflvr.ts ownership; permit only Writer-produced strong/em/single-underline semantics and reject unsafe markup. 3. Wire native paste/cut events, Edit menu, standard toolbar, Ctrl/Meta X/V, immutable history, focused caret, and deterministic feedback through the Writer text shell/view. 4. Add tests for domain transitions, parser safety, menu/toolbar/shortcuts/history, native ClipboardEvent handling, and one targeted Chromium E2E. 5. Record LO-WRITER-0110, upstream implementation/UI/test/help evidence, explicit gaps, docs, source provenance when new modules are added, and file-size review. 6. Run npm run test:coverage, targeted E2E, lint/typecheck/docs/source-tree/provenance/static checks; full all-suite cadence remains deferred until the tenth completed task.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
