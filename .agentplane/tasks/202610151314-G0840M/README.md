---
id: "202610151314-G0840M"
title: "Canonicalize shared line spacing and Writer consumers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T13:15:00.315Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T13:31:26.792Z"
  updated_by: "CODER"
  note: "Verified252related,187Calc,40boundary,9Writer browser tests;7whole changed shared and33Calc owners raw100. All13gates/build/inventory pass;73paths/3989hashes/11pins/4links audited. Native spacing state and every Writer consumer canonicalized; localized presentation and actual engine/model/UI/ODS remain pending. Same-agent review not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T13:31:25.955Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: restored original shared five-field line spacing and typed Any state; migrated all Writer consumers without a core compatibility facade."
  evaluated_sha: "13bb59d8fbac9f08b25880cb3eb1be912c59f7b3"
  blueprint_digest: "4d03acc802440b0a6acefd4ac05d8fb36c974bbcdde6ae29334c7f8c02750cdc"
  evidence_refs:
    - ".agentplane/tasks/202610151314-G0840M/README.md"
    - ".agentplane/tasks/202610151314-G0840M/quality/20261015-133125955-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151314-G0840M/quality/20261015-133125955-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151314-G0840M/quality/20261015-133125955-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151314-G0840M/blueprint/resolved-snapshot.json"
    - "output/playwright/task155-checks/verification.json"
    - "output/playwright/task155-checks/native-source-audit.json"
    - "output/playwright/task155-checks/source-gates.json"
    - "output/playwright/task155-checks/build-browser-manifest.json"
  findings:
    - "252related,187Calc,40boundary and9existing Writer browser scenarios pass; whole7shared and33Calc owners every raw S/B/F/L counter positive100, Writer-only gaps exempt. All13source gates, portable build and inventory pass."
    - "Original defaults/rules/casts/copy/active equality/all-field hash/unknown-member normalization audited; CALC131132133 preserved, real CPPU reused under JS GC. Writer all-field persistence and ODF/filter/dialog ownership corrected."
    - "73intentional paths/3989source hashes/11native pins/4restored links audited. Translated presentation, canonical tab stops and actual engine/pool/Calc model/connected UI/ODS remain pending; full suite remains deferred to actual readiness then fixes/pause."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: canonical shared five-field line spacing, real typed Any transport and all Writer model/filter/persistence/layout/dialog consumers; source-backed native quirks retained."
events:
  -
    type: "status"
    at: "2026-10-15T13:15:08.183Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: canonical shared five-field line spacing, real typed Any transport and all Writer model/filter/persistence/layout/dialog consumers; source-backed native quirks retained."
  -
    type: "verify"
    at: "2026-10-15T13:31:26.792Z"
    author: "CODER"
    state: "ok"
    note: "Verified252related,187Calc,40boundary,9Writer browser tests;7whole changed shared and33Calc owners raw100. All13gates/build/inventory pass;73paths/3989hashes/11pins/4links audited. Native spacing state and every Writer consumer canonicalized; localized presentation and actual engine/model/UI/ODS remain pending. Same-agent review not independent."
doc_version: 3
doc_updated_at: "2026-10-15T13:31:26.851Z"
doc_updated_by: "CODER"
description: "Task155 restores the native five-field SvxLineSpacingItem and real LineSpacing UNO value, migrates Writer model/filter/persistence/layout/UI consumers, removes wrongly-owned font-independent paragraph state, and verifies scoped portable fidelity without localization or native probes."
sections:
  Summary: "Restore native shared five-field line spacing and migrate Writer consumers including ODF, persistence and paragraph UI."
  Scope: "At most110 intentional non-agent paths within editeng, offapi style IDL values, svl member identifiers, Writer model/layout/filter/persistence/dialog code and direct related tests, matched runtime/provenance/capability/inventory records and calc-core documentation. Five native fields, canonical public lspcitem header, real typed Any struct and numeric selectors. Remove incorrect Writer font-independent paragraph property while preserving generic Drawing XML parsing. No tab-stop refactor, localization, lifetime manager, native compiler/probes or unrelated modules."
  Plan: "One cohesive CODER boundary: native shared line-spacing state/typed Any, every Writer model/filter/persistence/layout/dialog consumer, source quirks/inventory and scoped raw100 verification within110paths. Reuse actual shared CPPU and JS GC, no localization/native probes; full suite only actual UI+ODS readiness then pause."
  Verify Steps: "Audit pinned lspcitem.hxx/paraitem.cxx/svxenum.hxx/LineSpacing IDL and selectors MID_LINESPACE59/MID_HEIGHT6. Test defaults 200/0/100/Auto/Off, original setter side effects and signed16/unsigned16 casts, copied identities and independent Clone, inactive-field equality and all-field hash, typed Any struct/short transport, twips conversion and cast order, unknown selectors and modes, extraction failure nonmutation and native inherited metrics. Real CPPU struct default/copy/assignment/short fields and normal member lvalues, not binary persistence. Writer defaults use height200, proportional commands set the actual percentage/rule; all four layout modes and zero/default behavior, format dispatch and ODF reopen remain coherent. Browser persistence serializes all five raw fields and accepts prior scalar/tuple inputs at the adapter only; remove font-independent state from Writer imports/exports/projection/dialog while generic Drawing XML support remains. Existing scoped Writer formatting browser tests, related model/filter/layout/UI tests, whole changed/new executable shared owners and all Calc every raw S/B/F/L counter positive100; Writer-only coverage gaps exempt. References absent during tests/build and restored finally. All13 source gates including inventory/provenance/boundary/format/lint/typecheck/size/docs/routing/doctor and portable production build; native pins, exact110path bound and tracked non-agent hashes. Full all-app run deferred until genuine minimum connected UI and same-model ODS readiness, then applicable fixes and pause per user."
  Verification: |-
    Command: node output/playwright/task155-checks/portable.mjs, followed by --shared-only after strengthening inactive-field persistence and comment/format corrections. Result: pass. Evidence:252related tests/30files,187Calc tests/76files. Entire7changed/new shared executable owners raw S411/B161/F79/L399 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Eight Writer-only owner coverage gaps left per user. Scope: original defaults/casts/setter side effects/copy/Clone/active equality/all-field hash, real CPPU struct and typed Any transport, selectors/conversion/unknown behavior; actual Writer modes/defaults/dispatch/ODF/dialog/history and all-five-field snapshot including inactive values. Initial failures were migrated old toolbar assertions and two old numeric0-as-Any fixture calls plus one error-text expectation; logs retained, no core compatibility shim. Four source references absent during tests and restored finally.

    Command: all13 exact argv in output/playwright/task155-checks/source-gates.json. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and40boundary tests; inventory semanticViolationCount0. Initial JSDoc header/callback errors corrected without semantic changes; only affected docs/format/lint gates replayed. Scope:73intentional source paths within110approved bound, original classifications/history preserved, complete spacing separated because333line existing owner plus220line spacing exceeds500; no dependency/cycle/policy or coverage exceptions.

    Command: node output/playwright/task155-checks/build-browser-portable.mjs. Result: pass. Evidence:portable production build and9existing Writer browser scenarios across automatic first-line layout, cell paragraph formatting/history/ODT reopen and native paragraph text surface. Exact argv/source absence/restored links in build-browser-manifest.json. Scope:actual body/cell/browser consumers of changed shared state; no Calc UI implementation claim.

    Command: python3 output/playwright/task155-checks/audit-native.py; python3 output/playwright/task155-checks/audit-final.py. Result: pass. Evidence:11pinned original files at9bc445578031fecf56086729d8e4940c77e14d65; five fields, enums, IDL shorts/selectors, original casts/hash/normalization/default200 and Drawing ownership verified.73intentional paths/3989exact source hashes (3975baseline,59changed existing,14new,3916unchanged),4restored links. Scope:CALC131132133 surprising native behavior preserved; no native compilation/memory probe, localization or broad parity promotion. Actual text engine/pool/Calc model/connected UI/same-model ODS remain pending. Same-agent evaluation is not independent. Full all-app suite deferred until actual minimum UI+ODS readiness then applicable fixes/pause, as instructed. Final clean calc and source-commit/hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T13:31:26.792Z — VERIFY — ok

    By: CODER

    Note: Verified252related,187Calc,40boundary,9Writer browser tests;7whole changed shared and33Calc owners raw100. All13gates/build/inventory pass;73paths/3989hashes/11pins/4links audited. Native spacing state and every Writer consumer canonicalized; localized presentation and actual engine/model/UI/ODS remain pending. Same-agent review not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T13:30:54.039Z, excerpt_hash=sha256:670a7be10c49bcc56075a8aaeafeb04f617f05b7e46f3986e9d298124897c669

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151314-G0840M/blueprint/resolved-snapshot.json
    - old_digest: 4d03acc802440b0a6acefd4ac05d8fb36c974bbcdde6ae29334c7f8c02750cdc
    - current_digest: 4d03acc802440b0a6acefd4ac05d8fb36c974bbcdde6ae29334c7f8c02750cdc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151314-G0840M

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610151314-G0840M -m 🧩 G0840M task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task intentional source commit and lifecycle artifacts; preserve unrelated tasks and user merges. No destructive history changes."
  Findings: |-
    User explicitly authorizes canonical shared and Writer corrections; localization is deferred. Existing five-field item was reduced to a browser value/mode/font flag and must be replaced without a core compatibility facade. Prior turn established native source ownership; authoritative state revalidated clean calc at12789879e97f353f7d1dc829a9108970901d328e.

    - Observation: Plan approval rejected because full-doc Summary used a level-one heading.
      Impact: No execution or source mutation occurred.
      Resolution: Populate canonical Summary section through the lifecycle CLI, then repeat approval.

    - Observation: Initial migration script stopped at an ambiguous paragraph-dialog label assertion; typecheck exposed readonly-copy private member access and nonexistent base hash/factory override annotations.
      Impact: Migration is incomplete; no tests or parity claim.
      Resolution: Select the exact font-independent label, finish remaining adapters, use public source getters and remove unsupported override modifiers before rerunning typecheck.

    - Observation: Initial scoped run passed224 tests but failed28 from two unconverted toolbar assertions, an existing font-height snapshot helper passing numeric0 as Any, and one renamed error message assertion.
      Impact: No native item failure observed; related acceptance remains incomplete, Calc was not started after failure.
      Resolution: Migrate toolbar assertions to the native percentage getter and use no-argument snapshot queries in the existing fixture; update message expectation and rerun scoped tests. Preserve initial logs.

    - Observation: All semantic/source gates passed except JSDoc: newly prepended imports displaced opening fileoverview blocks and new test callbacks lacked comments. Metadata preparation also encountered differing existing Writer provenance responsibility field names.
      Impact: No semantic code or coverage workaround needed; metadata statuses/history remain unchanged.
      Resolution: Restore fileoverview headers, document callbacks and append to each existing provenance schema. Rerun affected documentation/format checks; retain initial gate logs.

    - Observation: Canonical line spacing is now shared five-field state; Writer default200, percentage/absolute/additive consumers and all-field persistence migrated. Native CALC131132133 quirks documented. All scoped acceptance passes.
      Impact: A real shared text-engine dependency is corrected without keeping the old reduced constructor/method/flag facade. Remaining tab-stop interfaces and actual engine/pool/Calc model/UI/ODS are not certified by this change.
      Resolution: Keep native behavior and existing inventory history, defer translated presentation, preserve Writer-only coverage exemptions and user full-suite readiness/pause rule. Same-agent review explicitly not independent.
id_source: "generated"
---
## Summary

Restore native shared five-field line spacing and migrate Writer consumers including ODF, persistence and paragraph UI.

## Scope

At most110 intentional non-agent paths within editeng, offapi style IDL values, svl member identifiers, Writer model/layout/filter/persistence/dialog code and direct related tests, matched runtime/provenance/capability/inventory records and calc-core documentation. Five native fields, canonical public lspcitem header, real typed Any struct and numeric selectors. Remove incorrect Writer font-independent paragraph property while preserving generic Drawing XML parsing. No tab-stop refactor, localization, lifetime manager, native compiler/probes or unrelated modules.

## Plan

One cohesive CODER boundary: native shared line-spacing state/typed Any, every Writer model/filter/persistence/layout/dialog consumer, source quirks/inventory and scoped raw100 verification within110paths. Reuse actual shared CPPU and JS GC, no localization/native probes; full suite only actual UI+ODS readiness then pause.

## Verify Steps

Audit pinned lspcitem.hxx/paraitem.cxx/svxenum.hxx/LineSpacing IDL and selectors MID_LINESPACE59/MID_HEIGHT6. Test defaults 200/0/100/Auto/Off, original setter side effects and signed16/unsigned16 casts, copied identities and independent Clone, inactive-field equality and all-field hash, typed Any struct/short transport, twips conversion and cast order, unknown selectors and modes, extraction failure nonmutation and native inherited metrics. Real CPPU struct default/copy/assignment/short fields and normal member lvalues, not binary persistence. Writer defaults use height200, proportional commands set the actual percentage/rule; all four layout modes and zero/default behavior, format dispatch and ODF reopen remain coherent. Browser persistence serializes all five raw fields and accepts prior scalar/tuple inputs at the adapter only; remove font-independent state from Writer imports/exports/projection/dialog while generic Drawing XML support remains. Existing scoped Writer formatting browser tests, related model/filter/layout/UI tests, whole changed/new executable shared owners and all Calc every raw S/B/F/L counter positive100; Writer-only coverage gaps exempt. References absent during tests/build and restored finally. All13 source gates including inventory/provenance/boundary/format/lint/typecheck/size/docs/routing/doctor and portable production build; native pins, exact110path bound and tracked non-agent hashes. Full all-app run deferred until genuine minimum connected UI and same-model ODS readiness, then applicable fixes and pause per user.

## Verification

Command: node output/playwright/task155-checks/portable.mjs, followed by --shared-only after strengthening inactive-field persistence and comment/format corrections. Result: pass. Evidence:252related tests/30files,187Calc tests/76files. Entire7changed/new shared executable owners raw S411/B161/F79/L399 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Eight Writer-only owner coverage gaps left per user. Scope: original defaults/casts/setter side effects/copy/Clone/active equality/all-field hash, real CPPU struct and typed Any transport, selectors/conversion/unknown behavior; actual Writer modes/defaults/dispatch/ODF/dialog/history and all-five-field snapshot including inactive values. Initial failures were migrated old toolbar assertions and two old numeric0-as-Any fixture calls plus one error-text expectation; logs retained, no core compatibility shim. Four source references absent during tests and restored finally.

Command: all13 exact argv in output/playwright/task155-checks/source-gates.json. Result: pass. Evidence:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and40boundary tests; inventory semanticViolationCount0. Initial JSDoc header/callback errors corrected without semantic changes; only affected docs/format/lint gates replayed. Scope:73intentional source paths within110approved bound, original classifications/history preserved, complete spacing separated because333line existing owner plus220line spacing exceeds500; no dependency/cycle/policy or coverage exceptions.

Command: node output/playwright/task155-checks/build-browser-portable.mjs. Result: pass. Evidence:portable production build and9existing Writer browser scenarios across automatic first-line layout, cell paragraph formatting/history/ODT reopen and native paragraph text surface. Exact argv/source absence/restored links in build-browser-manifest.json. Scope:actual body/cell/browser consumers of changed shared state; no Calc UI implementation claim.

Command: python3 output/playwright/task155-checks/audit-native.py; python3 output/playwright/task155-checks/audit-final.py. Result: pass. Evidence:11pinned original files at9bc445578031fecf56086729d8e4940c77e14d65; five fields, enums, IDL shorts/selectors, original casts/hash/normalization/default200 and Drawing ownership verified.73intentional paths/3989exact source hashes (3975baseline,59changed existing,14new,3916unchanged),4restored links. Scope:CALC131132133 surprising native behavior preserved; no native compilation/memory probe, localization or broad parity promotion. Actual text engine/pool/Calc model/connected UI/same-model ODS remain pending. Same-agent evaluation is not independent. Full all-app suite deferred until actual minimum UI+ODS readiness then applicable fixes/pause, as instructed. Final clean calc and source-commit/hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T13:31:26.792Z — VERIFY — ok

By: CODER

Note: Verified252related,187Calc,40boundary,9Writer browser tests;7whole changed shared and33Calc owners raw100. All13gates/build/inventory pass;73paths/3989hashes/11pins/4links audited. Native spacing state and every Writer consumer canonicalized; localized presentation and actual engine/model/UI/ODS remain pending. Same-agent review not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T13:30:54.039Z, excerpt_hash=sha256:670a7be10c49bcc56075a8aaeafeb04f617f05b7e46f3986e9d298124897c669

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151314-G0840M/blueprint/resolved-snapshot.json
- old_digest: 4d03acc802440b0a6acefd4ac05d8fb36c974bbcdde6ae29334c7f8c02750cdc
- current_digest: 4d03acc802440b0a6acefd4ac05d8fb36c974bbcdde6ae29334c7f8c02750cdc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151314-G0840M

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610151314-G0840M -m 🧩 G0840M task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task intentional source commit and lifecycle artifacts; preserve unrelated tasks and user merges. No destructive history changes.

## Findings

User explicitly authorizes canonical shared and Writer corrections; localization is deferred. Existing five-field item was reduced to a browser value/mode/font flag and must be replaced without a core compatibility facade. Prior turn established native source ownership; authoritative state revalidated clean calc at12789879e97f353f7d1dc829a9108970901d328e.

- Observation: Plan approval rejected because full-doc Summary used a level-one heading.
  Impact: No execution or source mutation occurred.
  Resolution: Populate canonical Summary section through the lifecycle CLI, then repeat approval.

- Observation: Initial migration script stopped at an ambiguous paragraph-dialog label assertion; typecheck exposed readonly-copy private member access and nonexistent base hash/factory override annotations.
  Impact: Migration is incomplete; no tests or parity claim.
  Resolution: Select the exact font-independent label, finish remaining adapters, use public source getters and remove unsupported override modifiers before rerunning typecheck.

- Observation: Initial scoped run passed224 tests but failed28 from two unconverted toolbar assertions, an existing font-height snapshot helper passing numeric0 as Any, and one renamed error message assertion.
  Impact: No native item failure observed; related acceptance remains incomplete, Calc was not started after failure.
  Resolution: Migrate toolbar assertions to the native percentage getter and use no-argument snapshot queries in the existing fixture; update message expectation and rerun scoped tests. Preserve initial logs.

- Observation: All semantic/source gates passed except JSDoc: newly prepended imports displaced opening fileoverview blocks and new test callbacks lacked comments. Metadata preparation also encountered differing existing Writer provenance responsibility field names.
  Impact: No semantic code or coverage workaround needed; metadata statuses/history remain unchanged.
  Resolution: Restore fileoverview headers, document callbacks and append to each existing provenance schema. Rerun affected documentation/format checks; retain initial gate logs.

- Observation: Canonical line spacing is now shared five-field state; Writer default200, percentage/absolute/additive consumers and all-field persistence migrated. Native CALC131132133 quirks documented. All scoped acceptance passes.
  Impact: A real shared text-engine dependency is corrected without keeping the old reduced constructor/method/flag facade. Remaining tab-stop interfaces and actual engine/pool/Calc model/UI/ODS are not certified by this change.
  Resolution: Keep native behavior and existing inventory history, defer translated presentation, preserve Writer-only coverage exemptions and user full-suite readiness/pause rule. Same-agent review explicitly not independent.
