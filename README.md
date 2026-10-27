# Vite Office

Vite Office is an experiment to reimplement LibreOffice as a TypeScript package. It is a
browser-only office suite targeting functional, test, and documentation parity with a pinned
LibreOffice baseline. The product is delivered as static frontend assets built with TypeScript,
Vite, and Tailwind CSS; it does not depend on an application backend.

The project is currently under development, with limited working implementations of Writer and Calc.
Both have browser editing, local document storage, and file import/export. They implement bounded
subsets of the desktop applications; complete LibreOffice compatibility is not yet achieved. No
application capability is considered parity-complete until its source, upstream behavior, tests, and
documentation are linked by evidence in the parity matrix.

## Program documents

- [Program charter](docs/program/README.md)
- [LibreOffice baseline](docs/program/libreoffice-baseline.md)
- [Parity matrix](docs/program/parity-matrix.md)
- [Application inventory registry](docs/program/registry/README.md)
- [Architecture](docs/program/architecture.md)
- [Test strategy](docs/program/test-strategy.md)
- [Documentation strategy](docs/program/documentation-strategy.md)
- [Roadmap](docs/program/roadmap.md)

## Current status

The TypeScript, React, Vite, and Tailwind CSS workspace lives under `apps/office`. The shared
browser workbench builds with relative asset paths and does not use an application backend.

- **Writer:** text and paragraph editing, character and paragraph formatting, styles, lists,
  hyperlinks, bounded table support, page geometry and document rendering, undo/redo, and local
  saving. This is a partial rich-text implementation, with layout and document-model limitations.
- **Calc:** an editable spreadsheet grid with cell selection, an input line, text and numeric
  values, arithmetic formulas, cell/range references, selected aggregate functions (`SUM`, `SUMSQ`,
  `PRODUCT`, `AVERAGE`), and dependency updates for the implemented formula subset. Cell formatting,
  sheet operations, row/column sizing, undo/redo, and local saving are available. The complete
  formula language, function library, and number-format handling remain incomplete.
- **Other applications:** Impress, Draw, Base, and Math do not yet have working application
  implementations.

Implementation details and limits are recorded in the
[Writer format documentation](docs/program/writer-odt-format.md) and
[Calc UI readiness audit](docs/program/calc-ui-readiness.md). Working features do not by themselves
establish complete upstream parity; the [parity matrix](docs/program/parity-matrix.md) tracks that
evidence separately.

The quality contract includes strict TypeScript, ESLint and Prettier, 100% Vitest coverage
thresholds for authored application behavior, Chromium browser tests and accessibility checks,
static-distribution validation, JSDoc validation, and authored file-size gates. The ignored research
checkout is pinned to LibreOffice `libreoffice-26.8.0.2` at commit
`9bc445578031fecf56086729d8e4940c77e14d65`; its source, test, fixture, and documentation inventory
and every office feature remain separate AgentPlane tasks so scope, verification, and parity
evidence stay auditable.

## Supported file formats

These formats are available through the existing browser Open and Export dialogs:

| Application | Format                            | Import | Export      | Current boundary                                                                                                |
| ----------- | --------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Writer      | OpenDocument Text (`.odt`)        | Yes    | Yes         | Supported Writer model and ODF package subset; not full ODT compatibility.                                      |
| Writer      | Plain text (`.txt`)               | Yes    | Yes         | Text content; rich formatting is not retained.                                                                  |
| Writer      | Rich Text Format (`.rtf`)         | Yes    | Yes         | Partial native text-filter implementation; feature retention varies.                                            |
| Writer      | Markdown (`.md`, `.markdown`)     | Yes    | Yes (`.md`) | Partial text-filter implementation; not every Writer feature has a Markdown representation.                     |
| Calc        | OpenDocument Spreadsheet (`.ods`) | Yes    | Yes         | Supported cell, sheet, formula, and style subset; not full ODS compatibility.                                   |
| Calc        | Comma-separated values (`.csv`)   | Yes    | Yes         | Tabular text; the Export dialog downloads the active sheet. Workbook structure and formatting are not retained. |

Format support applies only to the currently implemented model. Unsupported content can be rejected
or omitted according to each filter's documented limits; arbitrary desktop documents are not
guaranteed to round-trip without loss. See the
[Writer ODT boundary](docs/program/writer-odt-format.md),
[Writer TXT/RTF/Markdown audit](docs/program/writer-native-text-filter-slice.md), and
[Calc implementation audit](docs/program/calc-ui-readiness.md).

DOCX and XLSX are still under development and are not available in the application file dialogs.
Other LibreOffice import/export formats and PDF export are not currently offered there.

Writer and Calc store local document copies in browser IndexedDB, independently of downloaded files.
Import creates a browser copy; downloads do not overwrite the original file on disk. Local copies
belong to the browser profile and origin and can be removed when browser data is cleared.

## Local development

Prerequisites are Node.js 22 or newer and npm.

Compilation and type checking use stable TypeScript 7 through the `tsc` command, including the
type-check step of `npm run build`. Vite performs the subsequent asset bundling. Tools that need the
legacy compiler API, including ESLint and the repository's AST checks, retain TypeScript 6. The
dependencies follow Microsoft's
[side-by-side installation](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/):
`@typescript/native` aliases the TS7 compiler, while `typescript` aliases `@typescript/typescript6`
for legacy imports. The compatibility compiler is also available as `tsc6`.

```bash
npm install
npm run dev
```

The development server prints its local URL. The production output is generated under
`apps/office/dist`:

```bash
npm run build
npm run preview
```

Run the complete repository quality contract with:

```bash
npm run verify
```

Application development has independent unit and browser test commands:

| Scope                 | Unit tests            | Unit coverage                  | Browser tests             |
| --------------------- | --------------------- | ------------------------------ | ------------------------- |
| Writer                | `npm run test:writer` | `npm run test:coverage:writer` | `npm run test:e2e:writer` |
| Calc                  | `npm run test:calc`   | `npm run test:coverage:calc`   | `npm run test:e2e:calc`   |
| Shared infrastructure | `npm run test:shared` | `npm run test:coverage:shared` | `npm run test:e2e:shared` |

To select one file or directory, append a filter, for example
`npm run test:writer -- src/sw/source/core/table`. Each coverage command requires 100% coverage only
for its owner and writes to `apps/office/coverage/<scope>`. Calc unit tests cover `src/sc`, and its
browser tests live under `e2e/calc`. Shared coverage also runs application integration tests that
exercise shared code; `test:shared` itself runs only shared unit tests. Writer and Calc coverage
runs are independent.

Run `npm run test:all` for all unit, inventory, test-tooling and browser tests; `npm run verify`
additionally runs the complete quality contract. Shared-module changes require shared tests and
affected application tests. See the
[test strategy](docs/program/test-strategy.md#application-test-selection) for ownership details.

Playwright requires the task-approved Chromium download before the first E2E run:

```bash
npx playwright install chromium
npm run test:e2e
```

The complete LibreOffice parity target is not yet achieved. See the
[parity matrix](docs/program/parity-matrix.md) for the authoritative status and the
[roadmap](docs/program/roadmap.md) for the delivery sequence.

Inventory records are independently authored under `docs/program/registry/{writer,calc,shared}`. Use
`npm run inventory:id` for new UUID capability IDs and `npm run inventory:parity:writer`,
`inventory:parity:calc`, or `inventory:parity:shared` for scoped evidence checks. The complete
registry gate is `npm run inventory:registry:check`; it also detects collisions and orphan
references across applications. See the [registry contract](docs/program/registry/README.md) for
record ownership and shared-contract coordination.
