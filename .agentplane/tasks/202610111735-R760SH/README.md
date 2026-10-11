---
id: "202610111735-R760SH"
title: "Restore native frame-area geometry ownership"
result_summary: "Restore native frame-area ownership and geometry contracts;14056related/tooling cases,35fresh,whole changed-core Istanbul100; inventory and WRITER-006 updated"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:36:35.195Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T18:05:36.590Z"
  updated_by: "CODER"
  note: "14030 related plus26 tooling cases pass with35fresh cases and zero pending; all four complete current core modules Istanbul100 (616positive raw counters),864old acceptance byte-identical, canonical history preserved, all static/build and9metadata gates pass. Production unchanged after runtime coverage; see ignored proof.json and task Verification. No full checkpoint; broad goal remains active with pause-after-next-full instruction."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-11T18:06:23.253Z"
  updated_by: "EVALUATOR"
  note: "Same-agent non-independent review of exact ee7b031ed9224862df1461a0eb4e3b32d60ca507: native area ownership task satisfies scoped source, behavior, current whole-module coverage, inventory, preservation and security gates. Recommend task finish; broad parity remains incomplete."
  evaluated_sha: "ee7b031ed9224862df1461a0eb4e3b32d60ca507"
  blueprint_digest: "fe789b4ea843181a9d23bca87386c069b6fb39e29f155bbc18558bbcdf19e8bb"
  evidence_refs:
    - ".agentplane/tasks/202610111735-R760SH/README.md"
    - ".agentplane/tasks/202610111735-R760SH/quality/20261011-180623253-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610111735-R760SH/quality/20261011-180623253-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610111735-R760SH/quality/20261011-180623253-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610111735-R760SH/blueprint/resolved-snapshot.json"
    - "apps/office/node_modules/.cache/parity-coverage/R760SH/proof.json"
    - "apps/office/node_modules/.cache/parity-coverage/R760SH/review-binding.json"
    - "apps/office/node_modules/.cache/parity-coverage/R760SH/related-tests.json"
    - "apps/office/node_modules/.cache/parity-coverage/R760SH/tooling-tests.json"
  findings:
    - "Compared original tools/gen.hxx, swrect.hxx, frame.hxx, wsfrm/newfrm.cxx ownership and represented contracts against committed code. Every actual frame composes the native area owner; flags/defaults/scoped writeback/uint32 IDs and WRITER-006 empty containment are retained without model/client replacement. Full browser geometry/query integration is not claimed."
    - "14030 related plus26 tooling cases pass with35fresh cases, no pending/failed cases; complete four current core modules100 in all four metrics.616raw positive integer counters are tied to exact committed source/test bytes, with installed remapper unbounded endpoints and source-verified implicit else locations retained raw.864prior acceptance files unchanged and canonical prefixes preserved."
    - "All required static/build and9metadata checks pass after bounded declaration/comment/witness repairs. Runtime/build/tests execute with LibreOffice/mdds/ICU links physically absent and restore them; source-only audits run after restoration. No passing test replay, upstream copies/helper scripts/raw reports in AgentPlane, network or unrelated source mutation."
commit:
  hash: "ee7b031ed9224862df1461a0eb4e3b32d60ca507"
  message: "🧩 R760SH code: Restore original native frame-area ownership"
comments:
  -
    author: "CODER"
    body: "Start: restore original frame area/print geometry, validity and scoped writeback owners and remove duplicate SwFrame validity fields, preserve native empty containment and old acceptance/inventory/IO contracts; targeted current four-module100 coverage, correction2."
  -
    author: "CODER"
    body: "Verified: Native SwFrameAreaDefinition now owns original area/print values, validity and frame IDs for actual root/text/table/row/cell clients; scoped writeback and WRITER-006 contracts retained.14056 related/tooling cases pass with35fresh cases, complete four core modules Istanbul100, all864old acceptance and canonical histories preserved,9metadata gates pass. Same-agent exact semantic quality review is non-independent; broad geometry/UI parity remains incomplete."
events:
  -
    type: "status"
    at: "2026-10-11T17:36:44.275Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore original frame area/print geometry, validity and scoped writeback owners and remove duplicate SwFrame validity fields, preserve native empty containment and old acceptance/inventory/IO contracts; targeted current four-module100 coverage, correction2."
  -
    type: "status"
    at: "2026-10-11T18:05:35.645Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
  -
    type: "verify"
    at: "2026-10-11T18:05:36.590Z"
    author: "CODER"
    state: "ok"
    note: "14030 related plus26 tooling cases pass with35fresh cases and zero pending; all four complete current core modules Istanbul100 (616positive raw counters),864old acceptance byte-identical, canonical history preserved, all static/build and9metadata gates pass. Production unchanged after runtime coverage; see ignored proof.json and task Verification. No full checkpoint; broad goal remains active with pause-after-next-full instruction."
  -
    type: "status"
    at: "2026-10-11T18:06:49.349Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Native SwFrameAreaDefinition now owns original area/print values, validity and frame IDs for actual root/text/table/row/cell clients; scoped writeback and WRITER-006 contracts retained.14056 related/tooling cases pass with35fresh cases, complete four core modules Istanbul100, all864old acceptance and canonical histories preserved,9metadata gates pass. Same-agent exact semantic quality review is non-independent; broad geometry/UI parity remains incomplete."
doc_version: 3
doc_updated_at: "2026-10-11T18:06:49.350Z"
doc_updated_by: "CODER"
description: "Correction2 after full checkpoint: replace SwFrame-owned validity booleans with original SwFrameAreaDefinition composition and native area/print rectangles, frame IDs and scoped original write accesses. Port represented Point/Size/SwRect ownership and literal geometry, record source empty-rectangle containment without fixing it. Preserve original frame APIs/clients, inventory history and registered IO deviations; geometric lookup integration remains subsequent work."
sections:
  Summary: "Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active."
  Scope: |-
    Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network.

    Necessary native tools owner registration also touches scripts/check-module-boundaries.mjs and one fresh scripts/native-tools-ownership.test.ts. Register only the source-proven tools owner and sw-to-tools edge; prohibit reverse/application/browser dependencies. No previous acceptance file edited.
  Plan: "Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion."
  Verify Steps: |-
    1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
    2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases with new tools-owner allowlist/ownership acceptance; dependency-checker algorithm is unchanged. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
    3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
    4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
    5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.
  Verification: |-
    Command: upstream-absent static/related/tooling command arrays in apps/office/node_modules/.cache/parity-coverage/R760SH/commands.json, preflight-commands.json, repair-commands.json and final-size-commands.json; source-only audit command arrays in audit-commands.json/audit-repair-commands.json/audit-final-commands.json.
    Result: pass after bounded declaration/comment and canonical-witness repairs.
    Evidence:14030 related cases/510files plus26 tooling cases/5files =14056 unique cases, zero failed/pending.35fresh cases use actual Point/Size/SwRect, native area scopes and original root/text/table/row/cell clients, plus source ownership constraints. Four complete current production modules have100% lines280/280, statements306/306, functions114/114 and branches196/196.616raw positive safe-integer counters; map SHA256 23de3b2a0d4e5a548346630a6078b418187a25ae02bfcb16f28c6f396d96b526; source hashes, map-ID/line/finite-column checks and explicit remapper conventions are recorded in ignored proof.json.598unbounded end columns and44implicit else locations retain original raw representations; no counter/map edits. All864prior acceptance files byte-identical;2809prior non-AgentPlane paths audited, only5approved existing paths changed; old canonical scalar/default/status/classification/array/evidence/text prefixes retained.
    Scope: actual frame-area base ownership and represented geometry contracts, replacing original misplaced validity storage. Native shared tools ownership registration adds only tools module, empty outbound allowlist and source-proven sw-to-tools edge; fresh test rejects reverse/application/browser edges. Runtime symbol records name genuine class/method declarations; nested helper/property evidence remains in provenance without weakening declaration validators. Inventory:6new runtime/provenance records and2append-only wsfrm records, broad statuses/defaults remain unverified. WRITER-006 preserves original empty-area containment.
    All runtime/static/build/test runs hide LibreOffice/mdds/ICU links physically and restore original targets in finally. Source pin 9bc445578031fecf56086729d8e4940c77e14d65 and original five-file source hashes retained.9metadata gates pass: source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff. Source-dependent audits execute after restoration only; no runtime reads/executes pinned upstream. No upstream/helper/Python/log/raw-map files in AgentPlane.
    Residual: finite JavaScript exact-range geometry only; complete native tools/SwRect operators, transforms, full layout geometry, formatter/query/client unification, measured browser cursor registry and UI integration remain pending. This is a substrate refactor, not a completed UI geometry port. Same-agent evaluator review is non-independent. No full checkpoint for correction2; the broad goal remains active and must pause after the next full checkpoint only after correcting any failures.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T18:05:36.590Z — VERIFY — ok

    By: CODER

    Note: 14030 related plus26 tooling cases pass with35fresh cases and zero pending; all four complete current core modules Istanbul100 (616positive raw counters),864old acceptance byte-identical, canonical history preserved, all static/build and9metadata gates pass. Production unchanged after runtime coverage; see ignored proof.json and task Verification. No full checkpoint; broad goal remains active with pause-after-next-full instruction.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T18:05:35.645Z, excerpt_hash=sha256:9b0e7b029ecaf7f33d798833d2236e999fd44a9b9750a272d898e781821351cc

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610111735-R760SH/blueprint/resolved-snapshot.json
    - old_digest: fe789b4ea843181a9d23bca87386c069b6fb39e29f155bbc18558bbcdf19e8bb
    - current_digest: fe789b4ea843181a9d23bca87386c069b6fb39e29f155bbc18558bbcdf19e8bb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610111735-R760SH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610111735-R760SH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution."
  Findings: |-
    Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete.

    - Observation: Initial source-independent static preflight found constructor-overload lint, readonly return typing and overload JSDoc defects; source audits later found insufficient SwRect method witnesses and a declaration-inventory limit for class-expression/property names.
      Impact: No production behavior test failed. Metadata and static gates were initially incomplete; runtime reports remain valid at unchanged final production bytes.
      Resolution: Repair only fresh declarations/comments and canonical witnesses. Lint/TS7/JSDoc then pass; 14030 related and26 tooling cases pass once, all four complete modules100. Provenance uses actual methods and nested helper evidence without weakening validators. Retain initial raw logs in ignored cache; do not replay passing acceptance.

    - Observation: Native frame validity was stored directly in SwFrame and represented frames lacked their original area-definition owner. Upstream SwRect empty containment and Size/SwRect negative-size emptiness are unusual but defined.
      Impact: Original area/print scope, identity and geometry contracts were unavailable to future direct frame-query/UI integration; normalizing the unusual contracts would diverge from pinned source.
      Resolution: Compose original SwFrameAreaDefinition into all real frames; port shared Point/Size and SwRect values/scoped native writes with full changed-app-module Istanbul100 and35fresh scenarios. Record WRITER-006, preserve registration/defaults and all prior acceptance. Full browser geometry/query integration and complete native operators/transforms remain explicitly unverified.
extensions:
  implementation_commit:
    hash: "ee7b031ed9224862df1461a0eb4e3b32d60ca507"
    message: "🧩 R760SH code: Restore original native frame-area ownership"
id_source: "generated"
---
## Summary

Restore original SwFrameAreaDefinition geometry ownership and remove direct duplicate validity storage from SwFrame. Correction2 following full checkpoint and accepted QJTZN0 native content-node query. Previous goal turn was completed progress, exact semanticb682d0ff/close180e855b. Broad goal remains active.

## Scope

Four production files: new tools/inc/gen.ts, sw/inc/swrect.ts, sw/source/core/inc/frame.ts and existing sw/source/core/layout/wsfrm.ts. Fresh native geometry/frame-area tests, corresponding eight canonical runtime/provenance records (six new,two existing), WRITER-006 in docs/program/writer-upstream-suspected-issues.md and parent/task evidence. Preserve all old acceptance files, semantic/default/classification/history fields and registered recovery/open/save/settings differences. No query/formatter/DOM geometry integration, old cursor registry changes, Calc code or network.

Necessary native tools owner registration also touches scripts/check-module-boundaries.mjs and one fresh scripts/native-tools-ownership.test.ts. Register only the source-proven tools owner and sw-to-tools edge; prohibit reverse/application/browser dependencies. No previous acceptance file edited.

## Plan

Port original represented Point/Size class ownership and SwRect value semantics including integer native edges, copy/rectangle ownership, empty/negative geometry and containment. Introduce actual SwFrameAreaDefinition with native empty rectangles, validity defaults, original process uint32 postincrement ID and copy-on-scope-release FrameAreaWriteAccess/FramePrintAreaWriteAccess. Use composition for C++ multiple inheritance while retaining current SwFrame APIs and original clients; remove the three direct booleans and delegate their owners. Test original root/text/table/row/cell frame component identity, validity and writeback isolation, literal native rectangle values, copy/print-relative geometry and unchanged object ownership. Preserve source questionable zero-area containment and append observed initialized example. Record canonical boundaries explicitly, validate related tests/whole four-module100 maps with three references absent, then metadata gates restored. Commit exact semantic result, same-agent non-independent review, clean finish. Native transforms/Calc/page geometry/client iteration/UI query remain unported; no whole parity promotion.

## Verify Steps

1. Inspect pinned tools/gen.hxx, swrect.hxx, frame.hxx and wsfrm/newfrm.cxx constructors/write-access/validity/ID definitions. Native point/size/rectangle API/value and original validity ownership must be retained; WRITER-006 reproduces zero-area containment without normalization.
2. With LibreOffice/mdds/ICU links physically absent run format/lint/TS7/dependencies/JSDoc/file-size/build/current-static, related Vitest for four changed modules with whole-file Istanbul100 in lines/statements/functions/branches, fresh actual native geometry/owner cases and source-independent ownership/provenance/resource tooling cases with new tools-owner allowlist/ownership acceptance; dependency-checker algorithm is unchanged. Restore references in finally; never edit sources/tests/ref links while producer live. No full checkpoint for correction2.
3. Inspect complete current raw maps/IDs/locations/nonnegative integer counters and original source hashes; all four whole modules100, all related/new assertions pass with zero skipped acceptance, every old acceptance file byte-identical and canonical old scalar/evidence/history prefixes unchanged. Fresh fixtures must use actual native owners and integer literal source contracts; no mapped-copy model or counter adjustment.
4. After restoration run9metadata gates: source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor/diff. Confirm reference targets and pin unchanged, only approved paths changed, no upstream/helpers/Python/raw maps/logs in AgentPlane.
5. Record English evidence/Findings and exact semantic same-agent non-independent quality review; finish clean writer and leave broad goal active.

## Verification

Command: upstream-absent static/related/tooling command arrays in apps/office/node_modules/.cache/parity-coverage/R760SH/commands.json, preflight-commands.json, repair-commands.json and final-size-commands.json; source-only audit command arrays in audit-commands.json/audit-repair-commands.json/audit-final-commands.json.
Result: pass after bounded declaration/comment and canonical-witness repairs.
Evidence:14030 related cases/510files plus26 tooling cases/5files =14056 unique cases, zero failed/pending.35fresh cases use actual Point/Size/SwRect, native area scopes and original root/text/table/row/cell clients, plus source ownership constraints. Four complete current production modules have100% lines280/280, statements306/306, functions114/114 and branches196/196.616raw positive safe-integer counters; map SHA256 23de3b2a0d4e5a548346630a6078b418187a25ae02bfcb16f28c6f396d96b526; source hashes, map-ID/line/finite-column checks and explicit remapper conventions are recorded in ignored proof.json.598unbounded end columns and44implicit else locations retain original raw representations; no counter/map edits. All864prior acceptance files byte-identical;2809prior non-AgentPlane paths audited, only5approved existing paths changed; old canonical scalar/default/status/classification/array/evidence/text prefixes retained.
Scope: actual frame-area base ownership and represented geometry contracts, replacing original misplaced validity storage. Native shared tools ownership registration adds only tools module, empty outbound allowlist and source-proven sw-to-tools edge; fresh test rejects reverse/application/browser edges. Runtime symbol records name genuine class/method declarations; nested helper/property evidence remains in provenance without weakening declaration validators. Inventory:6new runtime/provenance records and2append-only wsfrm records, broad statuses/defaults remain unverified. WRITER-006 preserves original empty-area containment.
All runtime/static/build/test runs hide LibreOffice/mdds/ICU links physically and restore original targets in finally. Source pin 9bc445578031fecf56086729d8e4940c77e14d65 and original five-file source hashes retained.9metadata gates pass: source-tree/provenance/registry/resource-generation/invariants/parity/routing/doctor/diff. Source-dependent audits execute after restoration only; no runtime reads/executes pinned upstream. No upstream/helper/Python/log/raw-map files in AgentPlane.
Residual: finite JavaScript exact-range geometry only; complete native tools/SwRect operators, transforms, full layout geometry, formatter/query/client unification, measured browser cursor registry and UI integration remain pending. This is a substrate refactor, not a completed UI geometry port. Same-agent evaluator review is non-independent. No full checkpoint for correction2; the broad goal remains active and must pause after the next full checkpoint only after correcting any failures.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T18:05:36.590Z — VERIFY — ok

By: CODER

Note: 14030 related plus26 tooling cases pass with35fresh cases and zero pending; all four complete current core modules Istanbul100 (616positive raw counters),864old acceptance byte-identical, canonical history preserved, all static/build and9metadata gates pass. Production unchanged after runtime coverage; see ignored proof.json and task Verification. No full checkpoint; broad goal remains active with pause-after-next-full instruction.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T18:05:35.645Z, excerpt_hash=sha256:9b0e7b029ecaf7f33d798833d2236e999fd44a9b9750a272d898e781821351cc

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610111735-R760SH/blueprint/resolved-snapshot.json
- old_digest: fe789b4ea843181a9d23bca87386c069b6fb39e29f155bbc18558bbcdf19e8bb
- current_digest: fe789b4ea843181a9d23bca87386c069b6fb39e29f155bbc18558bbcdf19e8bb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610111735-R760SH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610111735-R760SH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Use a separately approved corrective task to revert the semantic source/inventory/document changes if needed. Restore all three original ignored source-reference link names and targets in finally. No network or reference execution.

## Findings

Clean authoritative baselinewriter180e855b. Actual frame area ownership in frame.hxx includes two SwRects, ID andthreevalidity flags, with scoped native by-value writeback in wsfrm.cxx. Current SwFrame fields claim only bounded validity, not native geometry owner. Composition will represent source multiple inheritance without changing original SwClient identity or introducing an index/model copy. Source Contains(Point) admits an empty rectangle origin despite IsEmpty; preserve and document unconfirmed observation. Read-only discovery of absent src/tools and core/inc directories was rerouted before mutation; new native directories are intentional source-shaped declarations. No gateway user-instructions found. Original query/UI measured registry/geometry/Calc responsibilities remain incomplete.

- Observation: Initial source-independent static preflight found constructor-overload lint, readonly return typing and overload JSDoc defects; source audits later found insufficient SwRect method witnesses and a declaration-inventory limit for class-expression/property names.
  Impact: No production behavior test failed. Metadata and static gates were initially incomplete; runtime reports remain valid at unchanged final production bytes.
  Resolution: Repair only fresh declarations/comments and canonical witnesses. Lint/TS7/JSDoc then pass; 14030 related and26 tooling cases pass once, all four complete modules100. Provenance uses actual methods and nested helper evidence without weakening validators. Retain initial raw logs in ignored cache; do not replay passing acceptance.

- Observation: Native frame validity was stored directly in SwFrame and represented frames lacked their original area-definition owner. Upstream SwRect empty containment and Size/SwRect negative-size emptiness are unusual but defined.
  Impact: Original area/print scope, identity and geometry contracts were unavailable to future direct frame-query/UI integration; normalizing the unusual contracts would diverge from pinned source.
  Resolution: Compose original SwFrameAreaDefinition into all real frames; port shared Point/Size and SwRect values/scoped native writes with full changed-app-module Istanbul100 and35fresh scenarios. Record WRITER-006, preserve registration/defaults and all prior acceptance. Full browser geometry/query integration and complete native operators/transforms remain explicitly unverified.
