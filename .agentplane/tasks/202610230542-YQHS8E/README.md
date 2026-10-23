---
id: "202610230542-YQHS8E"
title: "Run full Writer checkpoint, repair regressions and stop the goal"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T05:43:25.754Z"
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
    body: "Start: execute the human-requested tenth-task full application/inventory/tooling/Chromium checkpoint, repair necessary Writer/shared regressions with unchanged native contracts and coverage thresholds, close verified work and pause the goal."
events:
  -
    type: "status"
    at: "2026-10-23T05:43:52.102Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the human-requested tenth-task full application/inventory/tooling/Chromium checkpoint, repair necessary Writer/shared regressions with unchanged native contracts and coverage thresholds, close verified work and pause the goal."
doc_version: 3
doc_updated_at: "2026-10-23T05:55:28.124Z"
doc_updated_by: "CODER"
description: "Tenth task after ACR55N: run full application coverage, inventory coverage, tooling and Chromium suites plus static/canonical gates; repair current Writer/shared integration regressions and add or correct meaningful scenarios with preserved native contracts and explicit synthetic-only annotations where authorized. Close the verified task and pause the goal as the human requested; no new feature work, network, merge, worktree or mutations outside writer checkout."
sections:
  Summary: "Run the requested tenth-task full verification checkpoint after RH91WB, repair necessary regressions, close the verified task and pause the overall Writer goal."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on writer. Full application/inventory coverage, tooling and Chromium plus static/canonical gates; necessary Writer/shared implementation, UI selector and test corrections with original pinned native contracts. Up to80 implementation/tooling/test paths plus paired canonical records and generated views. No new features, policy/CLI upgrade, network, merge, other worktree or outside-repository mutation. Existing save/open/recovery/autosave differences remain. Explicit synthetic-only qualification for real-world unreachable native code is retained."
  Plan: "Capture clean RH91WB baseline and full source identities. Run complete application coverage and inventory coverage, complete tooling suite and current-build Chromium across all projects, with command-bound logs and live process handles. Inspect every failure against actual source and original contracts; repair current Writer/shared regressions and add meaningful cases, keeping source structure and explicit synthetic-only annotations. Use related repair checks while iterating; repeat complete affected suites only when changes/failures justify it, then ensure final aggregate coverage and all canonical/static gates pass without lowering thresholds. Record source-bound results, necessary commit and EVALUATOR review; close the task with a meaningful result and clean tracked state. Pause the goal at the human-requested checkpoint and start no further task."
  Verify Steps: "Run npm run test:coverage (all application projects, untouched100 thresholds), npm run test:inventory:coverage, npm run test:tooling, and npm run test:e2e or an equivalent full-project current-build Playwright command using the task-local port configuration. Inspect full case/file counts and coverage counters, not only exit status. Repairs must preserve native source/item/default/UI contracts and intentional browser I/O differences; add/regress real command/history/table/import-export paths where affected. Synthetic-only tests for otherwise unreachable retained native code must stay explicitly labeled and must not claim real UI reachability. Run typecheck, bounded full authored-file format/lint, build/static smoke, writer/calc resources, docs, dependencies, provenance/source-tree, inventory invariants/parity, file-size, doctor/routing and diff checks. Current full results must cover final source identities; no thresholds weakened, stale reports accepted, fixture selector mismatches hidden, or unchecked failure left. Record verification/quality/source evidence, close with clean final status and pause the goal as requested."
  Verification: "Initial full checkpoint in progress; not verified. Full tooling25files140cases pass. Initial inventory36/38files122/124cases pass; one stale command count and one native inclusive-right diagnostic bug identified, repairs pending. Full app and Chromium still have confirmed live handles; app has one reported Calc shared font-size assertion failure so far, complete results pending. Authored full format/lint scan running in bounded batches. Expected command count test corrected59->62 after its initial run ended; app/browser runtime source unchanged during live runs. Final complete coverage and source-bound repair/full browser evidence, canonical/static gates, quality/commit/closure and requested goal pause remain required. Artifacts output/playwright/writer-full-checkpoint. Goal active."
  Rollback Plan: "Revert only this checkpoint repair commits if necessary; preserve prior Writer work, full raw evidence and task history. No reset, merge, branch/worktree creation or outside mutation."
  Findings: |-
    Initial complete checkpoint is running against source baseline4ce82fbcf335 with per-command timestamped logs and runtime-source identities. Full application coverage unified-session7692 is confirmed live by write_stdin; full Chromium session83030 is live and progressing through more than270 cases. Full authored-format/lint batching session15124 is live. Do not restart any run from a stale status file or an observation timeout; poll these exact handles. Full inventory session74902 finished exit1:122/124 cases,36/38 files pass; failures are a stale parity CLI expected59commands versus actual62, and tdf114287 print-bound right11340 versus upstream11339. Full tooling session53205 finished exit0:25files140cases, no runtime source changed during either completed run. Initial full app has reported a Calc shared font-size resource assertion failure but is not terminal; inspect the final failure details before remediation. Chromium has not yet reported a failure. No suite is claimed complete from a partial log.

    Read-only root-cause evidence for ODT: actual imported page is width11906 with left/right margins283, yielding body width11340. Native sw/source/core/text/xmldump.cxx emits prtBounds through SwRect::dumpAsXmlAttributes; sw/source/core/bastyp/swrect.cxx uses Right(), and sw/inc/swrect.hxx defines Width()?Left()+Width()-1:Left(). Our projectSwTextPrintBounds in sw/source/core/layout/newfrm.ts returns the exclusive body endpoint. Therefore preserve the original11339 fixture assertion, repair the scalar calculation with original zero-width behavior and add exact positive/empty/negative-width native arithmetic cases. Do not blindly update the expected bound or change unrelated paper values. Application runtime code is intentionally held unchanged while the first full app/browser runs complete; expected commandCount alone was corrected59->62 in scripts/libreoffice-inventory/parity-mapping-cli.test.ts after the inventory/tooling runs were terminal. This test-only edit does not affect the live app/browser input.

    Artifacts: output/playwright/writer-full-checkpoint/{application,inventory,tooling,browser}-latest.json point to timestamped start/result manifests and logs. The wrapper captures source identities, baseline, completion/exit/signal and changed runtime sources; failed runs must not reuse old coverage outputs as current. An initial broad git filename inspection exceeded the default child-process buffer; the bounded authored checker now uses a32MiB buffer, explicit formatter/lint eligible-file filters and200-path batches, preserving all configured ignores. Targeted incident advice reviewed: repair fixture expectations only from actual pinned source, preserve strict coverage/source identity, avoid passing-case replay for wrapper-only issues; earlier leaf-specific no-full deferrals are superseded by this explicit tenth-task full checkpoint authorization.

    Stop rule unchanged: repair failures and add meaningful tests, obtain complete current-source coverage and full required verification, commit/quality/close this task, then pause the overall goal. Do not start another feature task or pause early. Source/code repair scope remains within the approved80implementation/test/tooling paths plus canonical pairs. No network, merge, branch/worktree changes or outside mutation.
id_source: "generated"
---
## Summary

Run the requested tenth-task full verification checkpoint after RH91WB, repair necessary regressions, close the verified task and pause the overall Writer goal.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on writer. Full application/inventory coverage, tooling and Chromium plus static/canonical gates; necessary Writer/shared implementation, UI selector and test corrections with original pinned native contracts. Up to80 implementation/tooling/test paths plus paired canonical records and generated views. No new features, policy/CLI upgrade, network, merge, other worktree or outside-repository mutation. Existing save/open/recovery/autosave differences remain. Explicit synthetic-only qualification for real-world unreachable native code is retained.

## Plan

Capture clean RH91WB baseline and full source identities. Run complete application coverage and inventory coverage, complete tooling suite and current-build Chromium across all projects, with command-bound logs and live process handles. Inspect every failure against actual source and original contracts; repair current Writer/shared regressions and add meaningful cases, keeping source structure and explicit synthetic-only annotations. Use related repair checks while iterating; repeat complete affected suites only when changes/failures justify it, then ensure final aggregate coverage and all canonical/static gates pass without lowering thresholds. Record source-bound results, necessary commit and EVALUATOR review; close the task with a meaningful result and clean tracked state. Pause the goal at the human-requested checkpoint and start no further task.

## Verify Steps

Run npm run test:coverage (all application projects, untouched100 thresholds), npm run test:inventory:coverage, npm run test:tooling, and npm run test:e2e or an equivalent full-project current-build Playwright command using the task-local port configuration. Inspect full case/file counts and coverage counters, not only exit status. Repairs must preserve native source/item/default/UI contracts and intentional browser I/O differences; add/regress real command/history/table/import-export paths where affected. Synthetic-only tests for otherwise unreachable retained native code must stay explicitly labeled and must not claim real UI reachability. Run typecheck, bounded full authored-file format/lint, build/static smoke, writer/calc resources, docs, dependencies, provenance/source-tree, inventory invariants/parity, file-size, doctor/routing and diff checks. Current full results must cover final source identities; no thresholds weakened, stale reports accepted, fixture selector mismatches hidden, or unchecked failure left. Record verification/quality/source evidence, close with clean final status and pause the goal as requested.

## Verification

Initial full checkpoint in progress; not verified. Full tooling25files140cases pass. Initial inventory36/38files122/124cases pass; one stale command count and one native inclusive-right diagnostic bug identified, repairs pending. Full app and Chromium still have confirmed live handles; app has one reported Calc shared font-size assertion failure so far, complete results pending. Authored full format/lint scan running in bounded batches. Expected command count test corrected59->62 after its initial run ended; app/browser runtime source unchanged during live runs. Final complete coverage and source-bound repair/full browser evidence, canonical/static gates, quality/commit/closure and requested goal pause remain required. Artifacts output/playwright/writer-full-checkpoint. Goal active.

## Rollback Plan

Revert only this checkpoint repair commits if necessary; preserve prior Writer work, full raw evidence and task history. No reset, merge, branch/worktree creation or outside mutation.

## Findings

Initial complete checkpoint is running against source baseline4ce82fbcf335 with per-command timestamped logs and runtime-source identities. Full application coverage unified-session7692 is confirmed live by write_stdin; full Chromium session83030 is live and progressing through more than270 cases. Full authored-format/lint batching session15124 is live. Do not restart any run from a stale status file or an observation timeout; poll these exact handles. Full inventory session74902 finished exit1:122/124 cases,36/38 files pass; failures are a stale parity CLI expected59commands versus actual62, and tdf114287 print-bound right11340 versus upstream11339. Full tooling session53205 finished exit0:25files140cases, no runtime source changed during either completed run. Initial full app has reported a Calc shared font-size resource assertion failure but is not terminal; inspect the final failure details before remediation. Chromium has not yet reported a failure. No suite is claimed complete from a partial log.

Read-only root-cause evidence for ODT: actual imported page is width11906 with left/right margins283, yielding body width11340. Native sw/source/core/text/xmldump.cxx emits prtBounds through SwRect::dumpAsXmlAttributes; sw/source/core/bastyp/swrect.cxx uses Right(), and sw/inc/swrect.hxx defines Width()?Left()+Width()-1:Left(). Our projectSwTextPrintBounds in sw/source/core/layout/newfrm.ts returns the exclusive body endpoint. Therefore preserve the original11339 fixture assertion, repair the scalar calculation with original zero-width behavior and add exact positive/empty/negative-width native arithmetic cases. Do not blindly update the expected bound or change unrelated paper values. Application runtime code is intentionally held unchanged while the first full app/browser runs complete; expected commandCount alone was corrected59->62 in scripts/libreoffice-inventory/parity-mapping-cli.test.ts after the inventory/tooling runs were terminal. This test-only edit does not affect the live app/browser input.

Artifacts: output/playwright/writer-full-checkpoint/{application,inventory,tooling,browser}-latest.json point to timestamped start/result manifests and logs. The wrapper captures source identities, baseline, completion/exit/signal and changed runtime sources; failed runs must not reuse old coverage outputs as current. An initial broad git filename inspection exceeded the default child-process buffer; the bounded authored checker now uses a32MiB buffer, explicit formatter/lint eligible-file filters and200-path batches, preserving all configured ignores. Targeted incident advice reviewed: repair fixture expectations only from actual pinned source, preserve strict coverage/source identity, avoid passing-case replay for wrapper-only issues; earlier leaf-specific no-full deferrals are superseded by this explicit tenth-task full checkpoint authorization.

Stop rule unchanged: repair failures and add meaningful tests, obtain complete current-source coverage and full required verification, commit/quality/close this task, then pause the overall goal. Do not start another feature task or pause early. Source/code repair scope remains within the approved80implementation/test/tooling paths plus canonical pairs. No network, merge, branch/worktree changes or outside mutation.
