---
id: "202610150501-FNSEP3"
title: "Restore canonical XML border handler ownership before Calc attribute containers"
result_summary: "Removed the reversed xmloff-to-editeng dependency by relocating unchanged Writer item mapping helpers and migrating all consumers; retained strict cycle rejection and recorded35-path source/coverage/native evidence."
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
  updated_at: "2026-10-15T05:08:08.785Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T05:25:34.066Z"
  updated_by: "CODER"
  note: "Verified canonical border responsibility migration:312 related,182 Calc,38 boundary and12 Chromium tests; raw shared/Calc100; all13 source gates/build/inventory pass;35paths/3843hashes/8pins/4links audited. Writer-only coverage gaps left; evaluator same-agent, not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T05:25:33.303Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: canonical XML handler versus Writer mapper ownership restored without border algorithm or cycle-rejection changes."
  evaluated_sha: "91a3deaa14c1d0f8084ab7204f321a2f97231150"
  blueprint_digest: "100d521f6d8f8166c9b8e2fd66be50ce87fef1aa10641e9670c0986c6b2c8bbd"
  evidence_refs:
    - ".agentplane/tasks/202610150501-FNSEP3/README.md"
    - ".agentplane/tasks/202610150501-FNSEP3/quality/20261015-052533303-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150501-FNSEP3/quality/20261015-052533303-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150501-FNSEP3/quality/20261015-052533303-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150501-FNSEP3/blueprint/resolved-snapshot.json"
    - "output/playwright/task143-checks/verification.json"
    - "output/playwright/task143-checks/mapping-source-audit.json"
    - "output/playwright/task143-checks/source-gates.json"
    - "output/playwright/task143-checks/build-browser-manifest.json"
  findings:
    - "Native xmloff bordrhdl operates on published UNO types; Writer xmlimpit/xmlexpit own concrete item mapping. Reverse xmloff-to-editeng edge removed and rejected by tests; no cycle exception introduced."
    - "AST audit proves all3 moved function bodies unchanged and every actual consumer migrated. Shared handler bodies differ only by published enum owner; all3 cycle rejection functions unchanged."
    - "312 related tests,182 whole Calc tests,38 boundary tests and12 targeted existing Chromium scenarios pass. Strict shared and whole Calc raw counters100; six Writer-only gap owners measured and left as authorized."
    - "35 intentional paths,3843 final source hashes,8 native pins,4 restored reference links; all13 source gates and production build pass; inventory semantic violations zero. New full UNO mapper parity remains explicitly unverified."
commit:
  hash: "91a3deaa14c1d0f8084ab7204f321a2f97231150"
  message: "Implement FNSEP3 core: restore XML border mapper ownership"
comments:
  -
    author: "CODER"
    body: "Start: correct the real XML attribute-container prerequisite by restoring shared UNO handler vs Writer item mapping ownership. Remove reverse edge, migrate all users, preserve algorithms and reject cycle exceptions."
  -
    author: "CODER"
    body: "Verified: canonical XML border handler and Writer item mapper ownership;312 related,182 Calc,38 boundary and12 Chromium tests pass with strict shared/Calc raw100 and audited inventory/build/pins."
events:
  -
    type: "status"
    at: "2026-10-15T05:09:18.747Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the real XML attribute-container prerequisite by restoring shared UNO handler vs Writer item mapping ownership. Remove reverse edge, migrate all users, preserve algorithms and reject cycle exceptions."
  -
    type: "verify"
    at: "2026-10-15T05:25:34.066Z"
    author: "CODER"
    state: "ok"
    note: "Verified canonical border responsibility migration:312 related,182 Calc,38 boundary and12 Chromium tests; raw shared/Calc100; all13 source gates/build/inventory pass;35paths/3843hashes/8pins/4links audited. Writer-only coverage gaps left; evaluator same-agent, not independent."
  -
    type: "status"
    at: "2026-10-15T05:25:40.999Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: canonical XML border handler and Writer item mapper ownership;312 related,182 Calc,38 boundary and12 Chromium tests pass with strict shared/Calc raw100 and audited inventory/build/pins."
doc_version: 3
doc_updated_at: "2026-10-15T05:25:41.000Z"
doc_updated_by: "CODER"
description: "Task143 resolves the real prerequisite discovered before XML attribute value implementation: xmloff border handlers wrongly import Editeng items through Writer browser mapping helpers. Move item mapping to native Writer xmlimpit/xmlexpit responsibility boundaries, keep shared handlers on published UNO types, remove reverse dependency and migrate actual consumers without compatibility reexports. Do not add a cycle exception or change border algorithms. Attribute collection/item implementation follows after this canonical boundary correction."
sections:
  Summary: "Task143 removes the actual reversed dependency blocking canonical XML attribute containers: existing xmloff border code mixes native published UNO handlers with Writer item/presentation adapters. User authorizes correcting shared/Writer modules canonically; native ItemInfo and namespace maps are ready. This prerequisite precedes XML attribute value classes and does not redefine the overall UI/ODS goal."
  Scope: "At most45intentional source/doc/inventory paths: shared xmloff bordrhdl and published BorderLineStyle reuse; actual existing item import/export/shorthand helpers move to Writer xmlimpit.ts/xmlexpit.ts source responsibility boundaries without algorithm changes; migrate all production/test consumers, no compatibility reexports from xmloff. Tighten module ownership by removing xmloff-to-editeng allowlist entry and update precise boundary tests; do not add cycle exceptions, weaken cycle checks or port runtime memory mechanisms. Matching runtime/provenance/capability and calc-core documentation. All behavior and deliberate I/O/recovery choices retained; no full native UNO mapper/Any property pipeline or XML attribute classes are fabricated."
  Plan: "Correct the actual namespace-container prerequisite by moving Writer-specific border item adapters out of shared xmloff to native Writer filter counterparts, reuse published BorderLineStyle, migrate every consumer without compatibility reexports and remove reversed edge. No cycle exception or border algorithm changes. Bound45paths, strict whole shared/Calc raw100, related Writer tests/browser flows, portable build/source gates/helper equivalence/pins/hashes/clean calc."
  Verify Steps: "No production xmloff-to-editeng import remains; shared border handlers use actual published BorderLine2/BorderLineStyle. Native border parsing/emission/presentation values and all existing border/page/cell/Writer history behavior remain unchanged. Import/export/shorthand helper implementations retained verbatim except responsibility imports and shared token-helper binding; all real consumers move, no old-path forwarding/compatibility aliases. Module matrix rejects xmloff-to-editeng, permits existing published offapi edge, leaves SAL/o3tl and every cycle-rejection algorithm unchanged; boundary tests enforce the direction. Entire changed shared executable owner and whole Calc every raw S/B/F/L counter positive100; relevant Writer XML/core/component tests, changed Writer owner coverage-only gaps measured/left.4reference links absent/restored finally during portable tests/build/browser flows. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries; production build and relevant existing Writer border browser scenarios. Audit exact45paths/native reference pins/source hashes, helper-body equivalence/complete consumer migration and clean calc. Full suite stays human-gated to actual minimum connected UI+same-model ODS readiness, then repair/pause."
  Verification: |-
    - Command: `node output/playwright/task143-checks/portable.mjs` (exact test argv, cwd and reference-link absence in `value-shared-manifest.json` and `value-calc-manifest.json`).
      Result: pass.
      Evidence: 312 related tests/25 files; whole Calc182 tests/72 files. Entire shared bordrhdl owner raw S58/B55/F8/L50 and all33 Calc executable owners S4172/B2731/F821/L3720 at100 with every raw statement/branch/function counter positive. Both new Writer helper owners also100. Six existing changed Writer owners have measured coverage-only gaps and are left under explicit user exemption; no repository coverage settings, thresholds or source maps changed.
      Scope: shared border handler, all changed Writer item mapping/presentation/filter consumers, and whole Calc. Native references absent during portable execution and all4 restored finally.
    - Command: `node output/playwright/task143-checks/build-browser-portable.mjs`.
      Result: pass.
      Evidence: production `npm run build` exit0;12 existing Chromium Writer border/cell/history cases in4 specs pass. Exact argv and reference absence/restoration in `build-browser-manifest.json`; no new browser specs or full-suite run.
      Scope: actual Writer browser consumers affected by import migration at desktop/mobile widths; existing deliberate browser I/O choices preserved.
    - Command: every exact argv in `output/playwright/task143-checks/source-gates.json`; `npx prettier --check` on4 corrected new mapper metadata JSON files; `git diff --check`.
      Result: pass.
      Evidence: all13 gates exit0: scoped format/lint, typecheck, docs1900 authored sources, size, dependency graph640 runtime sources/2849 relative imports/93 allowed cross-module edges, source-tree/provenance, inventory with zero semantic violations, routing, doctor, diff,38 boundary tests. Initial new-file inventory classification failed and was corrected without weakening checks; finding retained. Existing hook shim/chunk advisories do not fail checks.
      Scope: all35 intentional implementation/doc/inventory paths; no policy changes, new cycle exceptions, cycle-check relaxation or Writer coverage repair.
    - Command: `npx tsx output/playwright/task143-checks/audit-mapping.ts`; `python3 output/playwright/task143-checks/audit-final.py`.
      Result: pass.
      Evidence:3 moved helper bodies identical; shared bodies identical except actual published enum owner; NONE unchanged; all10 named-import consumers migrated; no shared item import/compatibility export. All3 cycle-rejection functions unchanged.35paths within45 approved bound;3843 source hashes (3836baseline,28changed existing,7new,3808unchanged);8 native pins at9bc445578031fecf56086729d8e4940c77e14d65 and4 exact reference targets restored. Detailed `verification.json`, hash/intentional-path and mapping audits retained in ignored evidence directory.
      Scope: canonical ownership prerequisite only. XML attribute classes, full native UNO item mapper/Any pipeline, ScDocumentPool/model and connected Calc UI/ODS remain pending. Same-agent EVALUATOR review is not independent. Full all-app suite remains deferred until minimum connected UI plus same-model ODS readiness; repair applicable failures then pause as user requested.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T05:25:34.066Z — VERIFY — ok

    By: CODER

    Note: Verified canonical border responsibility migration:312 related,182 Calc,38 boundary and12 Chromium tests; raw shared/Calc100; all13 source gates/build/inventory pass;35paths/3843hashes/8pins/4links audited. Writer-only coverage gaps left; evaluator same-agent, not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T05:25:18.475Z, excerpt_hash=sha256:2c9d5f15cfa6fee39d9056a1a1858ea966657e77522b98096c3d7b79106b259a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150501-FNSEP3/blueprint/resolved-snapshot.json
    - old_digest: 100d521f6d8f8166c9b8e2fd66be50ce87fef1aa10641e9670c0986c6b2c8bbd
    - current_digest: 100d521f6d8f8166c9b8e2fd66be50ce87fef1aa10641e9670c0986c6b2c8bbd
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150501-FNSEP3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150501-FNSEP3 -m 🧩 FNSEP3 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task changes through a later authorized task; no reset, merge or publication."
  Findings: |-
    Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent.

    - Observation: Inventory rejects local-only browser-adaptation classification on the actual native Writer xmlimpit/xmlexpit counterpart paths.
      Impact: New mapper-responsibility files need explicit native source mapping; classifying them as browser-only contradicts their actual native counterpart. Algorithms and all runtime tests are unchanged.
      Resolution: Register the two files as unverified/divergent upstream-mechanism foundations with actual native mapper method witnesses and explicit omitted full class/Any pipeline responsibilities. Do not promote parity, fabricate native classes, rename away the source boundary or weaken enforcement.
id_source: "generated"
---
## Summary

Task143 removes the actual reversed dependency blocking canonical XML attribute containers: existing xmloff border code mixes native published UNO handlers with Writer item/presentation adapters. User authorizes correcting shared/Writer modules canonically; native ItemInfo and namespace maps are ready. This prerequisite precedes XML attribute value classes and does not redefine the overall UI/ODS goal.

## Scope

At most45intentional source/doc/inventory paths: shared xmloff bordrhdl and published BorderLineStyle reuse; actual existing item import/export/shorthand helpers move to Writer xmlimpit.ts/xmlexpit.ts source responsibility boundaries without algorithm changes; migrate all production/test consumers, no compatibility reexports from xmloff. Tighten module ownership by removing xmloff-to-editeng allowlist entry and update precise boundary tests; do not add cycle exceptions, weaken cycle checks or port runtime memory mechanisms. Matching runtime/provenance/capability and calc-core documentation. All behavior and deliberate I/O/recovery choices retained; no full native UNO mapper/Any property pipeline or XML attribute classes are fabricated.

## Plan

Correct the actual namespace-container prerequisite by moving Writer-specific border item adapters out of shared xmloff to native Writer filter counterparts, reuse published BorderLineStyle, migrate every consumer without compatibility reexports and remove reversed edge. No cycle exception or border algorithm changes. Bound45paths, strict whole shared/Calc raw100, related Writer tests/browser flows, portable build/source gates/helper equivalence/pins/hashes/clean calc.

## Verify Steps

No production xmloff-to-editeng import remains; shared border handlers use actual published BorderLine2/BorderLineStyle. Native border parsing/emission/presentation values and all existing border/page/cell/Writer history behavior remain unchanged. Import/export/shorthand helper implementations retained verbatim except responsibility imports and shared token-helper binding; all real consumers move, no old-path forwarding/compatibility aliases. Module matrix rejects xmloff-to-editeng, permits existing published offapi edge, leaves SAL/o3tl and every cycle-rejection algorithm unchanged; boundary tests enforce the direction. Entire changed shared executable owner and whole Calc every raw S/B/F/L counter positive100; relevant Writer XML/core/component tests, changed Writer owner coverage-only gaps measured/left.4reference links absent/restored finally during portable tests/build/browser flows. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries; production build and relevant existing Writer border browser scenarios. Audit exact45paths/native reference pins/source hashes, helper-body equivalence/complete consumer migration and clean calc. Full suite stays human-gated to actual minimum connected UI+same-model ODS readiness, then repair/pause.

## Verification

- Command: `node output/playwright/task143-checks/portable.mjs` (exact test argv, cwd and reference-link absence in `value-shared-manifest.json` and `value-calc-manifest.json`).
  Result: pass.
  Evidence: 312 related tests/25 files; whole Calc182 tests/72 files. Entire shared bordrhdl owner raw S58/B55/F8/L50 and all33 Calc executable owners S4172/B2731/F821/L3720 at100 with every raw statement/branch/function counter positive. Both new Writer helper owners also100. Six existing changed Writer owners have measured coverage-only gaps and are left under explicit user exemption; no repository coverage settings, thresholds or source maps changed.
  Scope: shared border handler, all changed Writer item mapping/presentation/filter consumers, and whole Calc. Native references absent during portable execution and all4 restored finally.
- Command: `node output/playwright/task143-checks/build-browser-portable.mjs`.
  Result: pass.
  Evidence: production `npm run build` exit0;12 existing Chromium Writer border/cell/history cases in4 specs pass. Exact argv and reference absence/restoration in `build-browser-manifest.json`; no new browser specs or full-suite run.
  Scope: actual Writer browser consumers affected by import migration at desktop/mobile widths; existing deliberate browser I/O choices preserved.
- Command: every exact argv in `output/playwright/task143-checks/source-gates.json`; `npx prettier --check` on4 corrected new mapper metadata JSON files; `git diff --check`.
  Result: pass.
  Evidence: all13 gates exit0: scoped format/lint, typecheck, docs1900 authored sources, size, dependency graph640 runtime sources/2849 relative imports/93 allowed cross-module edges, source-tree/provenance, inventory with zero semantic violations, routing, doctor, diff,38 boundary tests. Initial new-file inventory classification failed and was corrected without weakening checks; finding retained. Existing hook shim/chunk advisories do not fail checks.
  Scope: all35 intentional implementation/doc/inventory paths; no policy changes, new cycle exceptions, cycle-check relaxation or Writer coverage repair.
- Command: `npx tsx output/playwright/task143-checks/audit-mapping.ts`; `python3 output/playwright/task143-checks/audit-final.py`.
  Result: pass.
  Evidence:3 moved helper bodies identical; shared bodies identical except actual published enum owner; NONE unchanged; all10 named-import consumers migrated; no shared item import/compatibility export. All3 cycle-rejection functions unchanged.35paths within45 approved bound;3843 source hashes (3836baseline,28changed existing,7new,3808unchanged);8 native pins at9bc445578031fecf56086729d8e4940c77e14d65 and4 exact reference targets restored. Detailed `verification.json`, hash/intentional-path and mapping audits retained in ignored evidence directory.
  Scope: canonical ownership prerequisite only. XML attribute classes, full native UNO item mapper/Any pipeline, ScDocumentPool/model and connected Calc UI/ODS remain pending. Same-agent EVALUATOR review is not independent. Full all-app suite remains deferred until minimum connected UI plus same-model ODS readiness; repair applicable failures then pause as user requested.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T05:25:34.066Z — VERIFY — ok

By: CODER

Note: Verified canonical border responsibility migration:312 related,182 Calc,38 boundary and12 Chromium tests; raw shared/Calc100; all13 source gates/build/inventory pass;35paths/3843hashes/8pins/4links audited. Writer-only coverage gaps left; evaluator same-agent, not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T05:25:18.475Z, excerpt_hash=sha256:2c9d5f15cfa6fee39d9056a1a1858ea966657e77522b98096c3d7b79106b259a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150501-FNSEP3/blueprint/resolved-snapshot.json
- old_digest: 100d521f6d8f8166c9b8e2fd66be50ce87fef1aa10641e9670c0986c6b2c8bbd
- current_digest: 100d521f6d8f8166c9b8e2fd66be50ce87fef1aa10641e9670c0986c6b2c8bbd
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150501-FNSEP3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150501-FNSEP3 -m 🧩 FNSEP3 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task changes through a later authorized task; no reset, merge or publication.

## Findings

Initial exploration suggested an import-cycle exception for the original editeng XML item dependency, but actual source evidence rejects that workaround: native editeng links xo, while native xmloff bordrhdl uses published UNO structs rather than Editeng objects. Existing reverse import is a misplaced Writer adapter. Correct the ownership instead of creating a cycle exception. Native Writer xmlimpit/xmlexpit handle item-property mapping; current browser-shaped adapter behavior remains bounded/unverified rather than falsely declared a full native mapper. Same-agent evaluation is not independent.

- Observation: Inventory rejects local-only browser-adaptation classification on the actual native Writer xmlimpit/xmlexpit counterpart paths.
  Impact: New mapper-responsibility files need explicit native source mapping; classifying them as browser-only contradicts their actual native counterpart. Algorithms and all runtime tests are unchanged.
  Resolution: Register the two files as unverified/divergent upstream-mechanism foundations with actual native mapper method witnesses and explicit omitted full class/Any pipeline responsibilities. Do not promote parity, fabricate native classes, rename away the source boundary or weaken enforcement.
