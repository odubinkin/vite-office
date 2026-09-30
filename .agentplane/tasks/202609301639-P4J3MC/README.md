---
id: "202609301639-P4J3MC"
title: "Preserve signed tab-stop positions and default distances"
result_summary: "Preserves negative native tab positions and direct default distances through ordering, replacement, clone and browser codec. ODF negative direct/style positions survive input, export and reimport with alignment/leaders. 14 focused, 576 app, 109 inventory and 19 browser tests passed; required coverage 100%; all other gates and doctor/routing pass. Deliberate deviations remain intact; wider tab contracts and overall audit remain unverified."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T16:40:10.337Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T16:48:39.635Z"
  updated_by: "CODER"
  note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 576 application, 109 inventory, 19 browser tests; all required coverage 100%; all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Fourteen focused core/codec/ODT tests, doctor and routing passed. Scope: signed tab position/direct default-distance domain and negative ODF tab import; broader module parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T16:49:09.865Z"
  updated_by: "EVALUATOR"
  note: "Signed tab position and direct default-distance domains match pinned sal_Int32 sources; negative tab import follows signed measure conversion and round-trip evidence."
  evaluated_sha: "9fab51e76f38c873e1ac7b20ef1adbcb40aa958f"
  blueprint_digest: "81cdcbd5b7fc9c4f86596b8d92cd2a8d2cd77eeb54389bae125f0e8907dcc4b6"
  evidence_refs:
    - ".agentplane/tasks/202609301639-P4J3MC/README.md"
    - ".agentplane/tasks/202609301639-P4J3MC/quality/20260930-164909865-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301639-P4J3MC/quality/20260930-164909865-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301639-P4J3MC/quality/20260930-164909865-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301639-P4J3MC/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301639-P4J3MC/verify.log"
  findings:
    - "Reviewed signed endpoints and independent direct setter versus UNO PutValue restriction; generated unsigned spacing stays scoped. Ordered replacement, clone/snapshot/real-pool codec and negative direct/style ODT input/export/reimport assertions pass. Metadata records bounded evidence and removes unsupported whole-module XML parity claim. No validator/schema/generator or deliberate product-policy changes. Full verification 576/109/19 and all required coverage 100%, doctor/routing pass; remaining tab defaults/filtering remain unverified."
commit:
  hash: "9fab51e76f38c873e1ac7b20ef1adbcb40aa958f"
  message: "🛠️ P4J3MC task: preserve signed tab values and ODF positions"
comments:
  -
    author: "CODER"
    body: "Start: align direct tab position/default-distance signed domains and XML negative tab import with pinned sources; preserve all deliberate browser policies."
  -
    author: "CODER"
    body: "Verified: signed sal_Int32 tab position/default-distance storage and negative ODF tab import with core/codec/package regression assertions; full npm run verify passes."
events:
  -
    type: "status"
    at: "2026-09-30T16:40:11.001Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align direct tab position/default-distance signed domains and XML negative tab import with pinned sources; preserve all deliberate browser policies."
  -
    type: "verify"
    at: "2026-09-30T16:48:39.635Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 576 application, 109 inventory, 19 browser tests; all required coverage 100%; all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Fourteen focused core/codec/ODT tests, doctor and routing passed. Scope: signed tab position/direct default-distance domain and negative ODF tab import; broader module parity remains unverified."
  -
    type: "status"
    at: "2026-09-30T16:49:33.137Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: signed sal_Int32 tab position/default-distance storage and negative ODF tab import with core/codec/package regression assertions; full npm run verify passes."
doc_version: 3
doc_updated_at: "2026-09-30T16:49:33.138Z"
doc_updated_by: "CODER"
description: "One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies."
sections:
  Summary: |-
    Preserve signed tab-stop positions and default distances

    One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies.
  Scope: "apps/office/src/editeng/source/items/paraitem.ts and paraitem.test.ts; apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Bounded signed sal_Int32 position/direct default-distance domain and negative ODF tab positions. Preserve generated-stop spacing constructor unsigned domain, unsupported native APIs, deliberate browser save/open/recovery decisions, validators/schemas/generators and unrelated UI behavior."
  Plan: "CODER performs one signed tab-value correction. Align SvxTabStop position bounds and direct SvxTabStopItem.SetDefaultDistance with sal_Int32 from the pinned constructors/setter; do not apply the separate UNO PutValue negative-distance rejection to direct setter storage. Keep generated count/distance constructor domains unchanged. Allow signed style:position measures at XMLTextPropertySetContext tab import. Add bounded unit regression tests for boundaries, signed ordered replacement, clone/record/Writer item-codec restoration and negative-position ODT round trips. Update only the relevant runtime inventory/provenance evidence with honest unverified module status. Run focused tests, full npm run verify, doctor/routing, then record verification, implementation commit, quality review and close. Work stays local in the current direct checkout; no network, unsupported APIs, validation/schema changes or registered conscious product deviations."
  Verify Steps: "1. Compare pinned tstpitem.hxx/paraitem.cxx and xmltabi.cxx/xmluconv.hxx: SvxTabStop position and direct SetDefaultDistance preserve signed int32; XML tab position accepts negative measures. 2. Focused paraitem/ODT tests prove int32 endpoints, invalid fractional/nonfinite/out-of-domain rejection, signed ordering/replacement, GetPos, independent clone, snapshot and real Writer pool item-codec restoration, negative ODT tab import/export/reimport with alignment/leader preservation, and unchanged nonnegative unsigned constructor spacing. 3. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Source metadata records bounded evidence without whole-module promotion; review scoped diff and finish with clean tracked/untracked git status."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T16:48:39.635Z — VERIFY — ok

    By: CODER

    Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 576 application, 109 inventory, 19 browser tests; all required coverage 100%; all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Fourteen focused core/codec/ODT tests, doctor and routing passed. Scope: signed tab position/direct default-distance domain and negative ODF tab import; broader module parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:48:39.120Z, excerpt_hash=sha256:b1282ab220b1d035ba308fdd372f486fc8f16aabdb46c8f4ee630ff6c13e77cb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301639-P4J3MC/blueprint/resolved-snapshot.json
    - old_digest: 81cdcbd5b7fc9c4f86596b8d92cd2a8d2cd77eeb54389bae125f0e8907dcc4b6
    - current_digest: 81cdcbd5b7fc9c4f86596b8d92cd2a8d2cd77eeb54389bae125f0e8907dcc4b6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301639-P4J3MC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301639-P4J3MC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: Pinned SvxTabStop constructor and SvxTabStopItem.SetDefaultDistance store sal_Int32 without a nonnegative restriction; xmltabi.cxx imports style:position with xmluconv.hxx signed default bounds. Local core setters and XML import rejected negative values. Native UNO PutValue default-distance validation is a separate contract.
      Impact: Representable native tab values could not be constructed, cloned or restored locally, and valid negative ODF tab positions failed import. Existing whole-module XML parity metadata exceeded the bounded tests available.
      Resolution: Aligned tab position and direct default-distance domains to signed int32 and allowed signed ODF tab measures. Focused assertions cover both endpoints, invalid fractional/nonfinite/out-of-domain values, signed ordering and position replacement, independent clones, complete snapshots and real Writer pool browser-codec restoration. Real ODT input/export/reimport preserves negative direct and inherited-style positions, alignment and leaders. Scoped metadata adds pinned evidence and marks wider XML behavior/contracts unverified. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log, 576 app tests, 109 inventory tests, 19 browser tests, 100% required coverage; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Focused tests: 14 passed; doctor and routing passed with pre-existing doctor warnings. Scope excludes generated-stop unsigned spacing, unsupported APIs and deliberate product deviations; other native contracts remain unverified.
id_source: "generated"
---
## Summary

Preserve signed tab-stop positions and default distances

One source-backed correction under the approved iterative parity audit: preserve signed sal_Int32 tab positions and direct SetDefaultDistance values, and import negative ODF tab lengths without changing UNO PutValue restrictions or deliberate browser product policies.

## Scope

apps/office/src/editeng/source/items/paraitem.ts and paraitem.test.ts; apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Bounded signed sal_Int32 position/direct default-distance domain and negative ODF tab positions. Preserve generated-stop spacing constructor unsigned domain, unsupported native APIs, deliberate browser save/open/recovery decisions, validators/schemas/generators and unrelated UI behavior.

## Plan

CODER performs one signed tab-value correction. Align SvxTabStop position bounds and direct SvxTabStopItem.SetDefaultDistance with sal_Int32 from the pinned constructors/setter; do not apply the separate UNO PutValue negative-distance rejection to direct setter storage. Keep generated count/distance constructor domains unchanged. Allow signed style:position measures at XMLTextPropertySetContext tab import. Add bounded unit regression tests for boundaries, signed ordered replacement, clone/record/Writer item-codec restoration and negative-position ODT round trips. Update only the relevant runtime inventory/provenance evidence with honest unverified module status. Run focused tests, full npm run verify, doctor/routing, then record verification, implementation commit, quality review and close. Work stays local in the current direct checkout; no network, unsupported APIs, validation/schema changes or registered conscious product deviations.

## Verify Steps

1. Compare pinned tstpitem.hxx/paraitem.cxx and xmltabi.cxx/xmluconv.hxx: SvxTabStop position and direct SetDefaultDistance preserve signed int32; XML tab position accepts negative measures. 2. Focused paraitem/ODT tests prove int32 endpoints, invalid fractional/nonfinite/out-of-domain rejection, signed ordering/replacement, GetPos, independent clone, snapshot and real Writer pool item-codec restoration, negative ODT tab import/export/reimport with alignment/leader preservation, and unchanged nonnegative unsigned constructor spacing. 3. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Source metadata records bounded evidence without whole-module promotion; review scoped diff and finish with clean tracked/untracked git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T16:48:39.635Z — VERIFY — ok

By: CODER

Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 576 application, 109 inventory, 19 browser tests; all required coverage 100%; all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Fourteen focused core/codec/ODT tests, doctor and routing passed. Scope: signed tab position/direct default-distance domain and negative ODF tab import; broader module parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:48:39.120Z, excerpt_hash=sha256:b1282ab220b1d035ba308fdd372f486fc8f16aabdb46c8f4ee630ff6c13e77cb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301639-P4J3MC/blueprint/resolved-snapshot.json
- old_digest: 81cdcbd5b7fc9c4f86596b8d92cd2a8d2cd77eeb54389bae125f0e8907dcc4b6
- current_digest: 81cdcbd5b7fc9c4f86596b8d92cd2a8d2cd77eeb54389bae125f0e8907dcc4b6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301639-P4J3MC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301639-P4J3MC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: Pinned SvxTabStop constructor and SvxTabStopItem.SetDefaultDistance store sal_Int32 without a nonnegative restriction; xmltabi.cxx imports style:position with xmluconv.hxx signed default bounds. Local core setters and XML import rejected negative values. Native UNO PutValue default-distance validation is a separate contract.
  Impact: Representable native tab values could not be constructed, cloned or restored locally, and valid negative ODF tab positions failed import. Existing whole-module XML parity metadata exceeded the bounded tests available.
  Resolution: Aligned tab position and direct default-distance domains to signed int32 and allowed signed ODF tab measures. Focused assertions cover both endpoints, invalid fractional/nonfinite/out-of-domain values, signed ordering and position replacement, independent clones, complete snapshots and real Writer pool browser-codec restoration. Real ODT input/export/reimport preserves negative direct and inherited-style positions, alignment and leaders. Scoped metadata adds pinned evidence and marks wider XML behavior/contracts unverified. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log, 576 app tests, 109 inventory tests, 19 browser tests, 100% required coverage; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Focused tests: 14 passed; doctor and routing passed with pre-existing doctor warnings. Scope excludes generated-stop unsigned spacing, unsupported APIs and deliberate product deviations; other native contracts remain unverified.
