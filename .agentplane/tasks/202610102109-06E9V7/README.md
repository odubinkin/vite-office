---
id: "202610102109-06E9V7"
title: "Publish original cursor frame chains from mounted Writer fragments"
status: "DOING"
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
  updated_at: "2026-10-10T21:10:22.761Z"
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
    body: "Start: Publish actual complete body device fragments as original native frame chains and remove length proxy; preserve original cell/header occurrence and historical acceptance, verify current whole-module100 upstream-absent."
events:
  -
    type: "status"
    at: "2026-10-10T21:10:23.967Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Publish actual complete body device fragments as original native frame chains and remove length proxy; preserve original cell/header occurrence and historical acceptance, verify current whole-module100 upstream-absent."
doc_version: 3
doc_updated_at: "2026-10-10T21:10:23.967Z"
doc_updated_by: "CODER"
description: "Correction9 after BZ14P4: replace standalone cursor-frame device publication with full actual body fragment chain, isolate repeated cell occurrences, remove end-versus-node-length continuation proxy and retain native model/view adjacency. Then full checkpoint as task10 and pause after repairs."
sections:
  Summary: "Publish actual mounted body master/follow geometry as original native cursor frames and replace residual text-length continuation proxy with native GetFollow."
  Scope: "Four production modules newfrm.ts, edtwin.ts, frmcrsr.ts, browser-writer-edit-window.ts. Replace singular SetCursorTextFrame API with SetCursorTextFrames carrying an ordered array of actual measured fragment ranges/lines; root owns and releases every original native client and source SetFollow links. Browser gathers current body fragments of original node in physical DOM order from the same editing host; table/repeated header occurrences remain a single selected independent master because current cell presentation does not expose original text follows. Native margin trims spaces only for actual next line/GetFollow. Existing callers/tests migrate mechanically to array API; the two old partial-frame continuation tests get a real explicit follow rather than synthetic flag and retain literal offset3. Up to3 fresh core/React/Chromium files,8 existing canonical runtime/provenance records plus parent Findings and generated registry. Original node identity/lifetime/selection/history retained; no native formatter, scroll, merged/vertical/absolute geometry, GetFrameOfModify or table text-follow implementation claimed. Entire actual four production modules100 all-four from complete current maps/hashes; no subrange exclusions or coverage relaxation. Registered IO/recovery deviations unchanged. This is correction9; task10 full checkpoint then repair failures and pause."
  Plan: "Audit source RightMargin and original follow ownership; publish all actual mounted body fragments through native original frame chain, isolate current table occurrence, eliminate singular API and length proxy. Preserve acceptance fixtures via literal-preserving API migration and real follow fixture; add original lifecycle/mounted/page/browser tests. Current four whole modules100 and scoped upstream-absent static/related/browser checks; update historical inventory and restored-source9gates; review exact semantic non-independently and close. Standing human goal/resume authorizes local scope; task9 then full task10 and pause after repairs."
  Verify Steps: |-
    1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 frmcrsr.cxx RightMargin GetNext/GetFollow and txtfrm/flowfrm original links. Actual root-owned original frames, master/follow identities and all client release during replacement, zero frames, document switch and view close; no forged follow flag. Native margin final-line spaces retained without a follow, trimmed with actual follow, API retains spaces, native right affinity and mapped positions.
    2. Actual mounted paginated body Home/End/Shift with original owners and continued editing/UndoRedo; repeated table header occurrence independent, body/cell old acceptance cases and matrices/literal offsets retained. Existing12 Chromium specs plus fresh chain check. Tests never read/call upstream.
    3. Current whole4 production modules100 lines/statements/functions/branches, complete current maps and all source/test hashes/nonnegative integer counters; fresh+related Vitest once and causal failed/new-only repair, changed Prettier/ESLint TS7/deps/docs/size/build/static/browser with both reference symlinks physically absent and finally restored. Full deferred to next task10, not rerun per correction.
    4. Historical8canonical statuses/default/classification/responsibility/prefix evidence preserved without promotion. Restored-source registry/source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor9gates; source suspected issues documented only if actually found. Exact semantic same-agent non-independent review, clean writer. Pause after next full and required failures fixed.
  Verification: "Pending scoped implementation and verification. Full checkpoint next task10; stop after full and necessary repairs."
  Rollback Plan: "Revert only task-scoped semantic commit through a separately authorized task, preserving other checkout/history."
  Findings: "Baseline a6f796fd846b; eight accepted tasks since BZ14P4. Current UI publishes only selected physical paragraph, root owns one cursor frame; native margins still infer continuation from frame.end < node.Len. Current table cells are full text DOM occurrences, including repeated headers; do not force them into body follow chains. A read-only discovery guessed nonexistent presentation filenames; bounded rg --files corrected location and parent route recomputed before mutation."
id_source: "generated"
---
## Summary

Publish actual mounted body master/follow geometry as original native cursor frames and replace residual text-length continuation proxy with native GetFollow.

## Scope

Four production modules newfrm.ts, edtwin.ts, frmcrsr.ts, browser-writer-edit-window.ts. Replace singular SetCursorTextFrame API with SetCursorTextFrames carrying an ordered array of actual measured fragment ranges/lines; root owns and releases every original native client and source SetFollow links. Browser gathers current body fragments of original node in physical DOM order from the same editing host; table/repeated header occurrences remain a single selected independent master because current cell presentation does not expose original text follows. Native margin trims spaces only for actual next line/GetFollow. Existing callers/tests migrate mechanically to array API; the two old partial-frame continuation tests get a real explicit follow rather than synthetic flag and retain literal offset3. Up to3 fresh core/React/Chromium files,8 existing canonical runtime/provenance records plus parent Findings and generated registry. Original node identity/lifetime/selection/history retained; no native formatter, scroll, merged/vertical/absolute geometry, GetFrameOfModify or table text-follow implementation claimed. Entire actual four production modules100 all-four from complete current maps/hashes; no subrange exclusions or coverage relaxation. Registered IO/recovery deviations unchanged. This is correction9; task10 full checkpoint then repair failures and pause.

## Plan

Audit source RightMargin and original follow ownership; publish all actual mounted body fragments through native original frame chain, isolate current table occurrence, eliminate singular API and length proxy. Preserve acceptance fixtures via literal-preserving API migration and real follow fixture; add original lifecycle/mounted/page/browser tests. Current four whole modules100 and scoped upstream-absent static/related/browser checks; update historical inventory and restored-source9gates; review exact semantic non-independently and close. Standing human goal/resume authorizes local scope; task9 then full task10 and pause after repairs.

## Verify Steps

1. Source-only pin9bc445578031fecf56086729d8e4940c77e14d65 frmcrsr.cxx RightMargin GetNext/GetFollow and txtfrm/flowfrm original links. Actual root-owned original frames, master/follow identities and all client release during replacement, zero frames, document switch and view close; no forged follow flag. Native margin final-line spaces retained without a follow, trimmed with actual follow, API retains spaces, native right affinity and mapped positions.
2. Actual mounted paginated body Home/End/Shift with original owners and continued editing/UndoRedo; repeated table header occurrence independent, body/cell old acceptance cases and matrices/literal offsets retained. Existing12 Chromium specs plus fresh chain check. Tests never read/call upstream.
3. Current whole4 production modules100 lines/statements/functions/branches, complete current maps and all source/test hashes/nonnegative integer counters; fresh+related Vitest once and causal failed/new-only repair, changed Prettier/ESLint TS7/deps/docs/size/build/static/browser with both reference symlinks physically absent and finally restored. Full deferred to next task10, not rerun per correction.
4. Historical8canonical statuses/default/classification/responsibility/prefix evidence preserved without promotion. Restored-source registry/source-tree/provenance/registry/resource generation/invariants/parity/routing/doctor9gates; source suspected issues documented only if actually found. Exact semantic same-agent non-independent review, clean writer. Pause after next full and required failures fixed.

## Verification

Pending scoped implementation and verification. Full checkpoint next task10; stop after full and necessary repairs.

## Rollback Plan

Revert only task-scoped semantic commit through a separately authorized task, preserving other checkout/history.

## Findings

Baseline a6f796fd846b; eight accepted tasks since BZ14P4. Current UI publishes only selected physical paragraph, root owns one cursor frame; native margins still infer continuation from frame.end < node.Len. Current table cells are full text DOM occurrences, including repeated headers; do not force them into body follow chains. A read-only discovery guessed nonexistent presentation filenames; bounded rg --files corrected location and parent route recomputed before mutation.
