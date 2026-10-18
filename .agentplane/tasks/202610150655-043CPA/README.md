---
id: "202610150655-043CPA"
title: "Restore native signed16 pooled item contracts for text metrics"
result_summary: "Corrected existing shared SfxInt16Item for native text metric dependencies and actual Calc inheritance; Which identity remains in areSame/set, no Writer compatibility shim or duplicate value wrapper."
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
  updated_at: "2026-10-15T06:55:45.052Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T07:04:35.046Z"
  updated_by: "CODER"
  note: "Verified146related,187Calc,39boundary tests, complete changed shared/33Calc raw100, all13source gates/build/inventory pass.13paths/3915hashes/6pins/4links audited. Native signed16 contracts/actual Calc inheritance restored without Writer shim; same-agent review not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T07:04:21.958Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: existing shared signed16 value owner canonically corrected for mutation/copy/payload/Any/hash/plain presentation, actual Calc inheritance and related Writer consumers verified."
  evaluated_sha: "dc202f38a9dde05e55f7c70ed9c1315df5f9ebe2"
  blueprint_digest: "caa31170e7d4a032aceaacbdbb88b5627d4cd9400942dd0c743684163bacc8be"
  evidence_refs:
    - ".agentplane/tasks/202610150655-043CPA/README.md"
    - ".agentplane/tasks/202610150655-043CPA/quality/20261015-070421958-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150655-043CPA/quality/20261015-070421958-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150655-043CPA/quality/20261015-070421958-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150655-043CPA/blueprint/resolved-snapshot.json"
    - "output/playwright/task151-checks/verification.json"
    - "output/playwright/task151-checks/native-source-audit.json"
    - "output/playwright/task151-checks/source-gates.json"
    - "output/playwright/task151-checks/build-manifest.json"
  findings:
    - "Original native SfxInt16Item contracts and ScMergeFlagAttr inheritance source-audited. Direct equality excludes Which; areSame/set retain identity/type guards. Checked JS scalar boundary and no-argument query remain explicit, no compatibility shim."
    - "146related,187Calc,39boundary tests pass with complete changed shared and33Calc owners raw100. All13source gates/build/inventory pass,657runtime sources/2894imports/95edges, no graph or gate exceptions."
    - "13intentional paths/3915source hashes/6native pins/4restored links audited. Initial new test omitted native string nul and was corrected without production change. Native diagnostics/Boost serializer deferred, no memory manager or localized resources."
commit:
  hash: "dc202f38a9dde05e55f7c70ed9c1315df5f9ebe2"
  message: "Implement 043CPA core: native signed16 pooled item contracts"
comments:
  -
    author: "CODER"
    body: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
  -
    author: "CODER"
    body: "Verified: shared native signed16 copy/mutation/equality/Any/hash/plain presentation and actual Calc merge flag inheritance;146related,187Calc,39boundary tests pass, raw100 and all gates/build/inventory/source audits."
events:
  -
    type: "status"
    at: "2026-10-15T06:55:52.999Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct original shared signed16 item contracts and real Calc inherited flag behavior, no compatibility shim or duplicate metric primitive; scoped strict coverage and portable source audit."
  -
    type: "verify"
    at: "2026-10-15T07:04:35.046Z"
    author: "CODER"
    state: "ok"
    note: "Verified146related,187Calc,39boundary tests, complete changed shared/33Calc raw100, all13source gates/build/inventory pass.13paths/3915hashes/6pins/4links audited. Native signed16 contracts/actual Calc inheritance restored without Writer shim; same-agent review not independent."
  -
    type: "status"
    at: "2026-10-15T07:04:47.304Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: shared native signed16 copy/mutation/equality/Any/hash/plain presentation and actual Calc merge flag inheritance;146related,187Calc,39boundary tests pass, raw100 and all gates/build/inventory/source audits."
doc_version: 3
doc_updated_at: "2026-10-15T07:04:47.321Z"
doc_updated_by: "CODER"
description: "Task151 corrects shared SfxInt16Item mutation/copy/payload equality/typed Any/hash/numeric presentation, with actual Calc ScMergeFlagAttr inherited behavior and related Writer tests. Real prerequisite for future SvxKerningItem; no duplicate wrapper, no UI localization or memory manager."
sections:
  Summary: "Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner."
  Scope: "At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization."
  Plan: "Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish."
  Verify Steps: "Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause."
  Verification: |-
    - Command: `node output/playwright/task151-checks/portable.mjs`; initial failed presentation test retained, corrected assertion rerun. Exact argv/cwd/source absence retained in manifests.
      Result: pass.
      Evidence:146related tests/19files (shared pool/set/numeric, actual Calc flags, Writer style/automatic/table/notifications);187whole Calc tests/76files. Complete changed shared intitem executable owner raw S54/B37/F23/L48 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No thresholds/exclusions/source-map/counter modifications or Writer coverage repairs.
      Scope: source default/value/copy/factory/SetValue/independent Clone, checked JS signed16 scalar boundary, same-type payload equality excluding Which and areSame/set identity distinction, native value-only logical unsigned64 size_t hash/support, real short Any query/update ignoring member with failure nonmutation and retained scalar query. Native locale-independent OUString.number presentation including real nul-terminated getStr buffer, no translated resources/provider. Actual ScMergeFlagAttr inherits mutation/Any/hash while preserving flags, independent clone and exact concrete type; no compatibility shim. Four source links absent/restored finally for tests/build.
    - Command: all13exact argv in `output/playwright/task151-checks/source-gates.json`; `node output/playwright/task151-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests;657runtime sources/2894relative imports/95allowed edges, inventory zero semantic violations. Portable production build exit0.
      Scope:13intentional non-agent paths within24approved bound, existing source/header/Calc metadata updated without broad parity promotion. Two obsolete direct-equality assertions corrected to Which-independent source payload behavior. Existing source module reused, no new primitive wrapper/cycle exception or graph algorithm change. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable repairs/pause.
    - Command: `python3 output/playwright/task151-checks/audit-native.py`; `python3 output/playwright/task151-checks/audit-final.py`.
      Result: pass.
      Evidence: original default/copy/SetValue/Clone/payload equality/hash/numeric presentation/short Any definitions and actual Calc derived type/areSame Which guards source-audited.6native pins at9bc445578031fecf56086729d8e4940c77e14d65;3915source hashes (3913baseline,11changed existing,2new,3902unchanged),13intentional paths/4restored links audited. Initial test incorrectly omitted the existing native nul terminator, corrected only the expected code units; failed evidence retained in Findings.
      Scope: existing checked host scalar domain/no-argument query explicitly retained; no claim of unchecked C++ caller-conversion or binary document layout parity. Logical hash uses repository unsigned64 convention and is not persisted. Native property-tree/base diagnostic serializer remains unported, no Boost/lifetime manager. Native Writer frame QA is broader unported source context only; no native compiler/probe/execution. Same-agent review is not independent. Actual text-metric subclasses/EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T07:04:35.046Z — VERIFY — ok

    By: CODER

    Note: Verified146related,187Calc,39boundary tests, complete changed shared/33Calc raw100, all13source gates/build/inventory pass.13paths/3915hashes/6pins/4links audited. Native signed16 contracts/actual Calc inheritance restored without Writer shim; same-agent review not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T07:03:56.456Z, excerpt_hash=sha256:af01d4f810503d06c52f3f474e355602e23a929ca57364b1c7a368e763be169a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150655-043CPA/blueprint/resolved-snapshot.json
    - old_digest: caa31170e7d4a032aceaacbdbb88b5627d4cd9400942dd0c743684163bacc8be
    - current_digest: caa31170e7d4a032aceaacbdbb88b5627d4cd9400942dd0c743684163bacc8be
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150655-043CPA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150655-043CPA -m 🧩 043CPA task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional task paths in later authorized task; no reset/merge/publication."
  Findings: |-
    The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

    - Observation: Initial new numeric presentation assertion omitted the terminating nul included by the real shared OUString.getStr buffer;145other related tests passed.
      Impact: New test expectation failed while production numeric presentation and existing shared string behavior matched native source. Calc was not yet started because portable wrapper stops on first failed case.
      Resolution: Corrected independent expected code units to include the source nul, retained failed log and reran portable related/Calc checks. No production behavior or shared string implementation changed.
id_source: "generated"
---
## Summary

Task151 restores original shared SfxInt16Item value contracts required by native text-metric items, reusing and correcting the existing owner.

## Scope

At most24intentional non-agent paths: existing svl intitem implementation/header metadata, direct signed16 tests, two obsolete equality assertions in existing sibling/itemset tests, actual Calc merge-flag inheritance regression, matched runtime/provenance/capability and calc-core docs. Native default/copy/SetValue/Clone, concrete payload equality excluding Which, typed Any short query/write, hash support and locale-independent numeric presentation. Existing validated JS scalar input domain and no-argument scalar query remain explicit browser boundaries. No false compatibility branch, native tree/Boost diagnostics port, memory manager, fake kerning class or UI localization.

## Plan

Restore existing shared signed16 item native copy/mutation/equality/typed Any/hash/numeric presentation; correct obsolete expectations, verify actual Calc derived flags and Writer consumers, strict raw100/gates/build/source inventory audit and24path clean calc finish.

## Verify Steps

Compare original svl/intitem.hxx and intitem.cxx constructors/value/copy/Clone/equality/typed short Any/hash/number presentation, ScMergeFlagAttr header inheritance and poolitem areSame guards. Test signed16 extrema/defaults/factory/copy/SetValue/Clone with independence, Which-excluding direct equality but exact native-type guard and areSame/set Which/type distinctions; existing checked JS scalar rejection remains explicit host precondition. Real Any short read/write ignoring all member values, extraction failure and unchanged values, existing scalar Query retained. Hash support/source value with repository unsigned64 logical size_t convention excluding Which; no persisted binary data claim. Native numeric presentation writes OUString without translation/resources or locale provider. Real Calc merge flags inherit mutation/Any, flags/masks/clone/state consistency and payload/Which separation. Related whole shared itempool/set/numeric/Writer automatic equality/notification/table tests; whole changed shared executable owner and whole Calc every raw S/B/F/L counter positive100. Writer-only coverage gaps exempt. Four references absent for tests/build and restored finally; all13source gates incl39boundary cases/inventory zero semantic violations, exact24path scope/source pins/hashes/clean calc. No native compiler/probe/Boost port. Full all-app suite only when actual minimum connected UI plus same-model ODS ready then applicable repairs/pause.

## Verification

- Command: `node output/playwright/task151-checks/portable.mjs`; initial failed presentation test retained, corrected assertion rerun. Exact argv/cwd/source absence retained in manifests.
  Result: pass.
  Evidence:146related tests/19files (shared pool/set/numeric, actual Calc flags, Writer style/automatic/table/notifications);187whole Calc tests/76files. Complete changed shared intitem executable owner raw S54/B37/F23/L48 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. No thresholds/exclusions/source-map/counter modifications or Writer coverage repairs.
  Scope: source default/value/copy/factory/SetValue/independent Clone, checked JS signed16 scalar boundary, same-type payload equality excluding Which and areSame/set identity distinction, native value-only logical unsigned64 size_t hash/support, real short Any query/update ignoring member with failure nonmutation and retained scalar query. Native locale-independent OUString.number presentation including real nul-terminated getStr buffer, no translated resources/provider. Actual ScMergeFlagAttr inherits mutation/Any/hash while preserving flags, independent clone and exact concrete type; no compatibility shim. Four source links absent/restored finally for tests/build.
- Command: all13exact argv in `output/playwright/task151-checks/source-gates.json`; `node output/playwright/task151-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and39existing boundary tests;657runtime sources/2894relative imports/95allowed edges, inventory zero semantic violations. Portable production build exit0.
  Scope:13intentional non-agent paths within24approved bound, existing source/header/Calc metadata updated without broad parity promotion. Two obsolete direct-equality assertions corrected to Which-independent source payload behavior. Existing source module reused, no new primitive wrapper/cycle exception or graph algorithm change. Full all-app suite deferred until actual minimum connected Calc UI plus same-model ODS readiness, then applicable repairs/pause.
- Command: `python3 output/playwright/task151-checks/audit-native.py`; `python3 output/playwright/task151-checks/audit-final.py`.
  Result: pass.
  Evidence: original default/copy/SetValue/Clone/payload equality/hash/numeric presentation/short Any definitions and actual Calc derived type/areSame Which guards source-audited.6native pins at9bc445578031fecf56086729d8e4940c77e14d65;3915source hashes (3913baseline,11changed existing,2new,3902unchanged),13intentional paths/4restored links audited. Initial test incorrectly omitted the existing native nul terminator, corrected only the expected code units; failed evidence retained in Findings.
  Scope: existing checked host scalar domain/no-argument query explicitly retained; no claim of unchecked C++ caller-conversion or binary document layout parity. Logical hash uses repository unsigned64 convention and is not persisted. Native property-tree/base diagnostic serializer remains unported, no Boost/lifetime manager. Native Writer frame QA is broader unported source context only; no native compiler/probe/execution. Same-agent review is not independent. Actual text-metric subclasses/EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; UI localization deferred. Final clean calc/hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T07:04:35.046Z — VERIFY — ok

By: CODER

Note: Verified146related,187Calc,39boundary tests, complete changed shared/33Calc raw100, all13source gates/build/inventory pass.13paths/3915hashes/6pins/4links audited. Native signed16 contracts/actual Calc inheritance restored without Writer shim; same-agent review not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T07:03:56.456Z, excerpt_hash=sha256:af01d4f810503d06c52f3f474e355602e23a929ca57364b1c7a368e763be169a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150655-043CPA/blueprint/resolved-snapshot.json
- old_digest: caa31170e7d4a032aceaacbdbb88b5627d4cd9400942dd0c743684163bacc8be
- current_digest: caa31170e7d4a032aceaacbdbb88b5627d4cd9400942dd0c743684163bacc8be
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150655-043CPA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150655-043CPA -m 🧩 043CPA task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional task paths in later authorized task; no reset/merge/publication.

## Findings

The immutable/no-setter/Which-in-payload behavior is a local divergence, not a suspected native defect. Correct shared owner without a Writer compatibility shim; task148 areSame retains original Which/type comparison at caller sites. Native diagnostic property-tree JSON/base serializer remains unported, no fake Boost owner. UI localization stays deferred. Actual EditEngine/EditTextObject/Calc pool/model/UI/ODS remain pending; same-agent evaluation is not independent.

- Observation: Initial new numeric presentation assertion omitted the terminating nul included by the real shared OUString.getStr buffer;145other related tests passed.
  Impact: New test expectation failed while production numeric presentation and existing shared string behavior matched native source. Calc was not yet started because portable wrapper stops on first failed case.
  Resolution: Corrected independent expected code units to include the source nul, retained failed log and reran portable related/Calc checks. No production behavior or shared string implementation changed.
