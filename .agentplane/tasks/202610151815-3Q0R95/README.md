---
id: "202610151815-3Q0R95"
title: "Extend shared Font metadata for Calc document defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:16:17.645Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T18:21:55.615Z"
  updated_by: "CODER"
  note: "PASS:42 related tests,187 Calc tests, strict shared Font and all33 Calc owners raw100 with exact owner sets;13 source gates/43 boundary tests; production build and19 browser cases upstream-absent. Inventory updated without parity promotion;6 pinned blobs/18 anchors; no native probe or full-suite run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T18:22:03.534Z"
  updated_by: "EVALUATOR"
  note: "Native stored Font metadata defaults, getters/setters and independent copies are implemented in existing shared VCL owner, with real Writer numbering and Worker transport preservation."
  evaluated_sha: "4491fd725093182a2a211d2aa7a27abf03a27a00"
  blueprint_digest: "403412b8a2bab10267c947dbf9deb45969731f9b7dd5e24571bca07019805e53"
  evidence_refs:
    - ".agentplane/tasks/202610151815-3Q0R95/README.md"
    - ".agentplane/tasks/202610151815-3Q0R95/quality/20261015-182203534-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151815-3Q0R95/quality/20261015-182203534-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151815-3Q0R95/quality/20261015-182203534-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151815-3Q0R95/blueprint/resolved-snapshot.json"
    - "output/playwright/task162-checks/final-verification.json"
    - "apps/office/src/vcl/source/font/native-font-metadata.test.ts"
    - "apps/office/src/sw/browser/filter/xml/native-font-metadata.test.ts"
  findings:
    - "Same-agent review, not independent. Source audit6 pinned blobs/18 anchors;42 related and187 Calc tests pass with strict shared/Calc raw100 and exact measured owner sets. All13 gates, build and19 browser cases pass; only native vcl-to-sal edge added, no cycle algorithm changes. No full Font/default-device or UI/ODS readiness claim; inventory limitations preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement shared native stored Font metadata for real Calc document defaults and preserve it across existing Writer value and transport consumers."
events:
  -
    type: "status"
    at: "2026-10-15T18:16:21.518Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement shared native stored Font metadata for real Calc document defaults and preserve it across existing Writer value and transport consumers."
  -
    type: "verify"
    at: "2026-10-15T18:21:55.615Z"
    author: "CODER"
    state: "ok"
    note: "PASS:42 related tests,187 Calc tests, strict shared Font and all33 Calc owners raw100 with exact owner sets;13 source gates/43 boundary tests; production build and19 browser cases upstream-absent. Inventory updated without parity promotion;6 pinned blobs/18 anchors; no native probe or full-suite run."
doc_version: 3
doc_updated_at: "2026-10-15T18:21:55.668Z"
doc_updated_by: "CODER"
description: "Task162: implement native stored Font style/family/pitch/charset values required by ScDocumentPool in the existing VCL owner, with copy/equality and const contracts; preserve them through real Writer numbering copies and Worker transport. Configuration lookup/default-font resolution remains a subsequent actual provider, never a fake MaybeAskConfig implementation."
sections:
  Summary: "Task162: extend the existing shared Font stored metadata required by Calc docpool font items; prevent loss in real Writer numbering copies and Worker records."
  Scope: "Existing vcl/source/font/font.ts; one native-metadata test; existing writer-document-codec.ts and focused transport test; relevant shared runtime/provenance/capability records and calc-core/readiness docs (up to14 intentional files). No font-provider placeholder, MaybeAskConfig approximation, memory manager, native compilation/probe, UI localization, formula/ODS stub or unrelated Writer coverage repair."
  Plan: "Implement default-empty style, FAMILY_DONTKNOW, PITCH_DONTKNOW and RTL_TEXTENCODING_DONTKNOW, native getters/setters and copy/COW/equality in existing Font. Broaden const exclusion to all mutators. Preserve newly represented values through native numbering copies and Writer Worker encoding/decoding with validation and old records retaining original defaults. Update authoritative existing inventories without claiming full Font/default-device parity; record exact native source evidence. Run focused shared/Writer tests with strict raw100 on changed shared owner and whole Calc raw100,13 established source gates and required build/browser checks with reference symlinks absent as applicable. Commit verified source before evaluator/finish."
  Verify Steps: "Inspect pinned Font/ImplFont defaults, setter guards, stored getters and equality. Test all new default fields, independent copied changes, no-op setters and type-safe const view; actual SvxNumberFormat copying/equality and Worker round trips with non-default metadata, present-empty/absent/legacy fonts and malformed metadata. Whole Calc and changed Font shared owner exact raw statements/branches/functions/lines100 with every counter positive; related Writer tests (Writer-only coverage exempt). Run established typecheck/format/lint/JSDoc/size/dependency/tree/provenance/inventory/routing/doctor gates, production build and related existing browser suites with reference symlinks removed/restored. No full all-app suite before requested minimum UI/ODS milestone."
  Verification: |-
    Command: node output/playwright/task162-checks/portable.mjs. Result: PASS. Scope:42 related tests in6 files;187 Calc tests in76 files, upstream symlinks absent. Font raw S20/B17/F14/L19 all100 and every raw counter positive; all33 Calc owners S4179/B2731/F821/L3727 all100 and exact paths match accepted task160 final report. Related measured set exactly Font plus Writer codec; Writer-only codec coverage gap exempt under user instruction. Command: node output/playwright/task162-checks/source-gates.mjs (resume and format/lint refresh after graph correction). Result:13 gates PASS, including43 boundary tests and authoritative inventory/provenance; doctor OK with existing hook warning. Command: node output/playwright/task162-checks/build-browser-portable.mjs. Result: production build PASS and19 Writer browser scenarios PASS in7 files with4 native reference symlinks absent, restored afterward. Source audit:6 pinned native blobs and18 source anchors, no native compilation/probe. Final evidence: output/playwright/task162-checks/final-verification.json, exact13 intentional non-task paths and hashes. Only original vcl-to-sal module edge added; cycle algorithms unchanged. No full all-app run or minimum UI/ODS readiness claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T18:21:55.615Z — VERIFY — ok

    By: CODER

    Note: PASS:42 related tests,187 Calc tests, strict shared Font and all33 Calc owners raw100 with exact owner sets;13 source gates/43 boundary tests; production build and19 browser cases upstream-absent. Inventory updated without parity promotion;6 pinned blobs/18 anchors; no native probe or full-suite run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:21:42.725Z, excerpt_hash=sha256:40f84a7b9b44c55d29603717fe5cf999af35154468fc25750bad6b4973a04ccb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151815-3Q0R95/blueprint/resolved-snapshot.json
    - old_digest: 403412b8a2bab10267c947dbf9deb45969731f9b7dd5e24571bca07019805e53
    - current_digest: 403412b8a2bab10267c947dbf9deb45969731f9b7dd5e24571bca07019805e53
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151815-3Q0R95

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151815-3Q0R95
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional source/test/docs/registry task commit; older Worker records continue to decode with default Font metadata. No unrelated task state or reference checkout is changed."
  Findings: |-
    - Observation: Initial source gates passed format/lint/typecheck/docs/size; dependency guard rejected vcl -> sal for native rtl_TextEncoding import. Original VCL font header and VCL library directly depend on SAL; the local allowlist omitted that edge.
      Impact: Cannot import the canonical encoding default/type without correcting the recorded native module graph; replacing it with a magic constant would hide the real dependency.
      Resolution: Add only the original vcl -> sal edge, retain all runtime cycle and ownership checks, and rerun affected dependency/boundary gates. No cycle exception or new module owner.

    - Observation: Inventory gate rejected an appended capability limitation because the existing closure contract requires a matching ordered X divergence for every limitation.
      Impact: The new limitation text must participate in the same authoritative capability closure schema; no validator weakening is appropriate.
      Resolution: Add the corresponding explicit pending-scope X entry in the existing capability record and rerun inventory validation; retain all prior statuses and evidence.

    - Observation: An evidence helper initially compared Calc against task160 value-coverage-audit.json, which had been overwritten by a shared-only rerun and contained no Calc entry.
      Impact: The resulting empty expected set was invalid evidence, not a change in measured owners or a runtime failure.
      Resolution: Use task160 final-verification.json, which retains all33 accepted Calc owner paths; the exact set matches current coverage. All raw Calc/shared counters remain positive.

    - Observation: Native stored font metadata is now represented and retained through real numbering copies and Worker graph. ConstFont excludes every represented setter. Legacy Worker records without metadata preserve empty/unknown native defaults; malformed typed metadata is rejected.
      Impact: Calc can reuse the same richer Font value owner when default-font resolution and ScDocumentPool are implemented. Previously family-only copies/transport would lose these fields.
      Resolution: Keep MaybeAskConfig, native default-font configuration/device selection and other rendering attributes explicitly pending. No fabricated provider, C++/ABI or new lifetime engine. Reuse and correct this shared owner in subsequent actual font-provider work.
id_source: "generated"
---
## Summary

Task162: extend the existing shared Font stored metadata required by Calc docpool font items; prevent loss in real Writer numbering copies and Worker records.

## Scope

Existing vcl/source/font/font.ts; one native-metadata test; existing writer-document-codec.ts and focused transport test; relevant shared runtime/provenance/capability records and calc-core/readiness docs (up to14 intentional files). No font-provider placeholder, MaybeAskConfig approximation, memory manager, native compilation/probe, UI localization, formula/ODS stub or unrelated Writer coverage repair.

## Plan

Implement default-empty style, FAMILY_DONTKNOW, PITCH_DONTKNOW and RTL_TEXTENCODING_DONTKNOW, native getters/setters and copy/COW/equality in existing Font. Broaden const exclusion to all mutators. Preserve newly represented values through native numbering copies and Writer Worker encoding/decoding with validation and old records retaining original defaults. Update authoritative existing inventories without claiming full Font/default-device parity; record exact native source evidence. Run focused shared/Writer tests with strict raw100 on changed shared owner and whole Calc raw100,13 established source gates and required build/browser checks with reference symlinks absent as applicable. Commit verified source before evaluator/finish.

## Verify Steps

Inspect pinned Font/ImplFont defaults, setter guards, stored getters and equality. Test all new default fields, independent copied changes, no-op setters and type-safe const view; actual SvxNumberFormat copying/equality and Worker round trips with non-default metadata, present-empty/absent/legacy fonts and malformed metadata. Whole Calc and changed Font shared owner exact raw statements/branches/functions/lines100 with every counter positive; related Writer tests (Writer-only coverage exempt). Run established typecheck/format/lint/JSDoc/size/dependency/tree/provenance/inventory/routing/doctor gates, production build and related existing browser suites with reference symlinks removed/restored. No full all-app suite before requested minimum UI/ODS milestone.

## Verification

Command: node output/playwright/task162-checks/portable.mjs. Result: PASS. Scope:42 related tests in6 files;187 Calc tests in76 files, upstream symlinks absent. Font raw S20/B17/F14/L19 all100 and every raw counter positive; all33 Calc owners S4179/B2731/F821/L3727 all100 and exact paths match accepted task160 final report. Related measured set exactly Font plus Writer codec; Writer-only codec coverage gap exempt under user instruction. Command: node output/playwright/task162-checks/source-gates.mjs (resume and format/lint refresh after graph correction). Result:13 gates PASS, including43 boundary tests and authoritative inventory/provenance; doctor OK with existing hook warning. Command: node output/playwright/task162-checks/build-browser-portable.mjs. Result: production build PASS and19 Writer browser scenarios PASS in7 files with4 native reference symlinks absent, restored afterward. Source audit:6 pinned native blobs and18 source anchors, no native compilation/probe. Final evidence: output/playwright/task162-checks/final-verification.json, exact13 intentional non-task paths and hashes. Only original vcl-to-sal module edge added; cycle algorithms unchanged. No full all-app run or minimum UI/ODS readiness claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T18:21:55.615Z — VERIFY — ok

By: CODER

Note: PASS:42 related tests,187 Calc tests, strict shared Font and all33 Calc owners raw100 with exact owner sets;13 source gates/43 boundary tests; production build and19 browser cases upstream-absent. Inventory updated without parity promotion;6 pinned blobs/18 anchors; no native probe or full-suite run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:21:42.725Z, excerpt_hash=sha256:40f84a7b9b44c55d29603717fe5cf999af35154468fc25750bad6b4973a04ccb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151815-3Q0R95/blueprint/resolved-snapshot.json
- old_digest: 403412b8a2bab10267c947dbf9deb45969731f9b7dd5e24571bca07019805e53
- current_digest: 403412b8a2bab10267c947dbf9deb45969731f9b7dd5e24571bca07019805e53
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151815-3Q0R95

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151815-3Q0R95
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional source/test/docs/registry task commit; older Worker records continue to decode with default Font metadata. No unrelated task state or reference checkout is changed.

## Findings

- Observation: Initial source gates passed format/lint/typecheck/docs/size; dependency guard rejected vcl -> sal for native rtl_TextEncoding import. Original VCL font header and VCL library directly depend on SAL; the local allowlist omitted that edge.
  Impact: Cannot import the canonical encoding default/type without correcting the recorded native module graph; replacing it with a magic constant would hide the real dependency.
  Resolution: Add only the original vcl -> sal edge, retain all runtime cycle and ownership checks, and rerun affected dependency/boundary gates. No cycle exception or new module owner.

- Observation: Inventory gate rejected an appended capability limitation because the existing closure contract requires a matching ordered X divergence for every limitation.
  Impact: The new limitation text must participate in the same authoritative capability closure schema; no validator weakening is appropriate.
  Resolution: Add the corresponding explicit pending-scope X entry in the existing capability record and rerun inventory validation; retain all prior statuses and evidence.

- Observation: An evidence helper initially compared Calc against task160 value-coverage-audit.json, which had been overwritten by a shared-only rerun and contained no Calc entry.
  Impact: The resulting empty expected set was invalid evidence, not a change in measured owners or a runtime failure.
  Resolution: Use task160 final-verification.json, which retains all33 accepted Calc owner paths; the exact set matches current coverage. All raw Calc/shared counters remain positive.

- Observation: Native stored font metadata is now represented and retained through real numbering copies and Worker graph. ConstFont excludes every represented setter. Legacy Worker records without metadata preserve empty/unknown native defaults; malformed typed metadata is rejected.
  Impact: Calc can reuse the same richer Font value owner when default-font resolution and ScDocumentPool are implemented. Previously family-only copies/transport would lose these fields.
  Resolution: Keep MaybeAskConfig, native default-font configuration/device selection and other rendering attributes explicitly pending. No fabricated provider, C++/ABI or new lifetime engine. Reuse and correct this shared owner in subsequent actual font-provider work.
