# Calc full test cycle 1

Task `202610090923-CAPX37` completes the first ten-task Calc development interval
on 2026-10-09 in `vite-office-calc`, branch `calc`. Core implementation through
task 9 is followed by this full integration-validation task. Branch integration
remains with the user. The user requested pausing the goal after this run and
explicitly directed that missing Writer coverage be left for another branch.

## Full-run results

| Stage | Result | Evidence |
| --- | --- | --- |
| Office application/shared tests | Pass | 14,097 tests in 516 files |
| Office global coverage | Authorized Writer exception | Statements 20,835/20,835; functions 4,767/4,767; lines 18,958/18,958; branches 15,369/15,370 (99.99%) |
| Calc coverage within full office report | Pass, all four metrics 100% | Statements 959/959; branches 802/802; functions 213/213; lines 853/853; 12 owned modules |
| Inventory tests and coverage after remediation | Pass, all four metrics 100% | 122 tests in 38 files; statements 1,733/1,733; branches 1,288/1,288; functions 435/435; lines 1,667/1,667 |
| Tooling | Pass | 11 tests in 2 files |
| Source-provenance tests | Pass | 3 tests in 1 file |
| Writer resource generation/model check | Pass | Generation unchanged; 2 tests in 1 file |
| Additional native module-boundary tests | Pass | 5 tests in 3 files |
| Built browser E2E | Pass | 303 scenarios, including Writer and shared launcher routes |
| Static build smoke | Pass | Relative assets, two JavaScript bundles, no backend endpoints |

The office test execution has no failing test. The single uncovered branch is
`apps/office/src/sw/source/core/layout/paintfrm.ts:141`. No Writer implementation
or test was edited. No threshold or coverage exclusion was changed. The user
explicitly reserved that branch for remediation in another branch; the complete
repository coverage gate therefore still exits nonzero, despite passing office
tests and 100% Calc coverage.

`npm run test:all` stopped at the office coverage gate. Its remaining stages were
executed individually with `npm run test:inventory:coverage`,
`npm run test:tooling` and `npm run test:e2e`. This executes the complete full-run
stages without claiming that the original aggregate command exited successfully.
A repeat of the office stage would reproduce the explicitly retained Writer
coverage deficit; application source and test behavior remain unchanged.

## Remediation

Full formatting initially rejected five generated Calc JSON fixtures. Prettier
normalized their serialization. Before/after normalized SHA256 comparisons prove
that every coordinate, expected outcome and source/body hash is unchanged.
All affected pinned native probes rechecked successfully under ASan/UBSan.
After fixture regeneration with `--write`, format the generated JSON before
committing it, following the normal repository formatting gate.

The full inventory stage initially failed four cases exposed by Calc activation.
The legacy Writer parity CLI now obtains strictly parsed canonical capability
identities for its complete runtime validation, while its parity evidence report
retains the Writer mapping scope. It reuses canonical registry loading/parsing;
capability IDs are never inferred from the runtime references being validated.
A regression assertion confirms that explicitly missing global identities still
reject Calc runtime references.

Test fixtures now select their Writer capability template explicitly, deactivate
test-owned Calc for the inactive-app rejection, derive scope counts from owned
input records and collect markers from all canonical records. This retains
collision/orphan rejection and synthetic evidence isolation as apps grow.
No production app owner, upstream source, parity status or shared mechanism was
duplicated or replaced. The final full inventory rerun passes all 122 cases and
actual100 coverage.

## Repository checks and evidence

Full formatting passed after fixture normalization; all changed inventory files
also pass formatting and ESLint. Full lint and typecheck passed; tools typecheck
and documentation checks passed again after inventory remediation. Dependency,
file-size and source-tree checks passed. Calc inventory has 9 capabilities,
124 modules (12 Calc and 112 shared) and zero semantic violations. Existing
semantic status flags remain unchanged and Calc parity remains unverified.

Routing validation passes. `ap doctor` reports zero errors and one pre-existing
managed-shim readiness warning; hook configuration remains outside this task.
Static build retains its existing bundle-size advisory. Neither advisory is a
failed test or a new Calc behavior defect.

Complete logs and summaries reside under ignored `output/playwright/` with the
`calc-full-cycle1-` prefix; durable command/result/scope evidence is recorded in
[the task README](../../.agentplane/tasks/202610090923-CAPX37/README.md).
[Calc core boundaries and cadence](calc-core.md) retain the native contracts and
remaining integration gaps. Final closeout checks require a clean tracked and
untracked state on `calc` before pausing the goal. This milestone does not claim
that the overall Calc implementation is complete.
