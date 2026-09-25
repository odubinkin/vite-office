---
id: "202609250553-GNP6YY"
title: "Align Writer dialogs and browser print with upstream"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T05:54:03.859Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-25T06:48:44.002Z"
  updated_by: "CODER"
  note: "verified-202609250553-GNP6YY"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-25T06:48:31.308Z"
  updated_by: "EVALUATOR"
  note: "Approved Writer UI slice is implemented and repository verification passes."
  evaluated_sha: "7094ab6c31d797e7586036e0ab47eac80d0bf5d5"
  blueprint_digest: "473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9"
  evidence_refs:
    - ".agentplane/tasks/202609250553-GNP6YY/README.md"
    - ".agentplane/tasks/202609250553-GNP6YY/quality/20260925-064831308-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609250553-GNP6YY/quality/20260925-064831308-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609250553-GNP6YY/quality/20260925-064831308-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609250553-GNP6YY/blueprint/resolved-snapshot.json"
    - "npm run verify: 544 office tests, 109 inventory tests, 17 e2e scenarios, 100% coverage and all static checks passed"
    - "Manual 390x700 and 390x340 mobile checks and print PDF inspection"
  findings:
    - "Print placement follows generated upstream command locations and invokes the browser print dialog; print CSS excludes Writer UI."
    - "Modal styling and scrolling, palette dismissal, mobile containment, and supported upstream table and hyperlink settings are covered by tests."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Writer dialog, print, and mobile UI corrections against pinned upstream."
events:
  -
    type: "status"
    at: "2026-09-25T05:54:09.195Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer dialog, print, and mobile UI corrections against pinned upstream."
  -
    type: "verify"
    at: "2026-09-25T06:47:31.448Z"
    author: "CODER"
    state: "ok"
    note: "npm run verify passed: 544 office tests, 109 inventory tests, both 100% coverage, 17 e2e scenarios; mobile, modal scroll and print PDF inspected. Supported upstream dialog settings aligned; remaining unsupported tabs documented in Findings."
  -
    type: "verify"
    at: "2026-09-25T06:48:44.002Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609250553-GNP6YY"
doc_version: 3
doc_updated_at: "2026-09-25T06:48:44.075Z"
doc_updated_by: "CODER"
description: "Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only."
sections:
  Summary: |-
    Align Writer dialogs and browser print with upstream

    Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only.
  Scope: "Writer browser presentation, command resources, page print CSS, and focused UI tests. Match local pinned LibreOffice dialog layouts and settings where supported by the document model; retain browser print dialog."
  Plan: "1. Audit each Writer modal and quick popup against pinned upstream UI resources and align layout, labels, tabs, and supported settings. 2. Share modal presentation and viewport scrolling; close palettes on outside interaction. 3. Contain mobile viewport overflow. 4. Wire Print at upstream menu and toolbar locations to browser print; print document pages only. 5. Remove unsupported toolbar line-spacing dropdown. 6. Add focused regression coverage, run verification, and commit intentional changes."
  Verify Steps: "Run npm run typecheck and focused Vitest suites for Writer dialogs, menu, toolbar, page layout, and mobile/print behavior; run npm run verify if feasible. Browser-check at a narrow mobile viewport that the document canvas alone scrolls and dialogs scroll within the viewport. Browser-check print preview or print CSS: only document pages appear, without Writer chrome or page overlays. Compare dialog layouts and controls against pinned LibreOffice UI XML."
  Verification: |-
    Command: npm run verify
    Result: pass
    Evidence: 544 office tests and 109 inventory tests passed with 100% coverage; 17 Playwright e2e tests passed; build, static smoke, JSDoc, file-size, source-tree, source-provenance, invariants and parity checks passed.
    Scope: Writer implementation, generated command resources, tests, browser behavior and repository gates.

    Command: git diff --check
    Result: pass
    Evidence: no whitespace errors.
    Scope: task diff.

    Command: manual Playwright CLI browser and print PDF inspection
    Result: pass
    Evidence: at 390x700 the document scroll width/height equaled viewport bounds while canvas scrolled; at 390x340 the Paragraph modal panel scrolled; print PDF had one page with text Print proof and no Writer chrome.
    Scope: mobile containment, modal scroll and browser print output.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-25T06:47:31.448Z — VERIFY — ok

    By: CODER

    Note: npm run verify passed: 544 office tests, 109 inventory tests, both 100% coverage, 17 e2e scenarios; mobile, modal scroll and print PDF inspected. Supported upstream dialog settings aligned; remaining unsupported tabs documented in Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T06:47:18.335Z, excerpt_hash=sha256:5535eecc583403effcbd86d959bf34261c2a56355b9012fd363adaa1ba611af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250553-GNP6YY/blueprint/resolved-snapshot.json
    - old_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
    - current_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250553-GNP6YY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609250553-GNP6YY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-25T06:48:44.002Z — VERIFY — ok

    By: CODER

    Note: verified-202609250553-GNP6YY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T06:47:31.523Z, excerpt_hash=sha256:5535eecc583403effcbd86d959bf34261c2a56355b9012fd363adaa1ba611af3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250553-GNP6YY/blueprint/resolved-snapshot.json
    - old_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
    - current_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250553-GNP6YY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609250553-GNP6YY --result verified-202609250553-GNP6YY --commit 7094ab6c31d797e7586036e0ab47eac80d0bf5d5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit; preserve unrelated existing task state."
  Findings: "The dialog layouts and quick controls follow pinned upstream structure only for Writer settings implemented by the current browser document model. LibreOffice dialog tabs and fields without model support remain unimplemented, including additional Hyperlink and Page Style tabs and advanced Paragraph options. Insert Table header-row counts and repeating headers round trip through ODT; a header marked non-repeating is not preserved as a distinct ODT state. These are follow-up gaps for full upstream parity. The browser build emits its existing bundle-size warning; the build and static smoke still pass."
id_source: "generated"
---
## Summary

Align Writer dialogs and browser print with upstream

Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only.

## Scope

Writer browser presentation, command resources, page print CSS, and focused UI tests. Match local pinned LibreOffice dialog layouts and settings where supported by the document model; retain browser print dialog.

## Plan

1. Audit each Writer modal and quick popup against pinned upstream UI resources and align layout, labels, tabs, and supported settings. 2. Share modal presentation and viewport scrolling; close palettes on outside interaction. 3. Contain mobile viewport overflow. 4. Wire Print at upstream menu and toolbar locations to browser print; print document pages only. 5. Remove unsupported toolbar line-spacing dropdown. 6. Add focused regression coverage, run verification, and commit intentional changes.

## Verify Steps

Run npm run typecheck and focused Vitest suites for Writer dialogs, menu, toolbar, page layout, and mobile/print behavior; run npm run verify if feasible. Browser-check at a narrow mobile viewport that the document canvas alone scrolls and dialogs scroll within the viewport. Browser-check print preview or print CSS: only document pages appear, without Writer chrome or page overlays. Compare dialog layouts and controls against pinned LibreOffice UI XML.

## Verification

Command: npm run verify
Result: pass
Evidence: 544 office tests and 109 inventory tests passed with 100% coverage; 17 Playwright e2e tests passed; build, static smoke, JSDoc, file-size, source-tree, source-provenance, invariants and parity checks passed.
Scope: Writer implementation, generated command resources, tests, browser behavior and repository gates.

Command: git diff --check
Result: pass
Evidence: no whitespace errors.
Scope: task diff.

Command: manual Playwright CLI browser and print PDF inspection
Result: pass
Evidence: at 390x700 the document scroll width/height equaled viewport bounds while canvas scrolled; at 390x340 the Paragraph modal panel scrolled; print PDF had one page with text Print proof and no Writer chrome.
Scope: mobile containment, modal scroll and browser print output.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-25T06:47:31.448Z — VERIFY — ok

By: CODER

Note: npm run verify passed: 544 office tests, 109 inventory tests, both 100% coverage, 17 e2e scenarios; mobile, modal scroll and print PDF inspected. Supported upstream dialog settings aligned; remaining unsupported tabs documented in Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T06:47:18.335Z, excerpt_hash=sha256:5535eecc583403effcbd86d959bf34261c2a56355b9012fd363adaa1ba611af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250553-GNP6YY/blueprint/resolved-snapshot.json
- old_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
- current_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250553-GNP6YY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609250553-GNP6YY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-25T06:48:44.002Z — VERIFY — ok

By: CODER

Note: verified-202609250553-GNP6YY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T06:47:31.523Z, excerpt_hash=sha256:5535eecc583403effcbd86d959bf34261c2a56355b9012fd363adaa1ba611af3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250553-GNP6YY/blueprint/resolved-snapshot.json
- old_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
- current_digest: 473ee4706c6909507c2cb652f500ef9b31ad6b657222ae1f07bdccbc33fd2dc9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250553-GNP6YY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609250553-GNP6YY --result verified-202609250553-GNP6YY --commit 7094ab6c31d797e7586036e0ab47eac80d0bf5d5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit; preserve unrelated existing task state.

## Findings

The dialog layouts and quick controls follow pinned upstream structure only for Writer settings implemented by the current browser document model. LibreOffice dialog tabs and fields without model support remain unimplemented, including additional Hyperlink and Page Style tabs and advanced Paragraph options. Insert Table header-row counts and repeating headers round trip through ODT; a header marked non-repeating is not preserved as a distinct ODT state. These are follow-up gaps for full upstream parity. The browser build emits its existing bundle-size warning; the build and static smoke still pass.
