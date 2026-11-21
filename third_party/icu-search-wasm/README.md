# Native ICU text search binding

The binding owns an ICU regular-expression matcher and its last capture pairs. The caller supplies
the UTF-16 pattern after LibreOffice's transliteration and pattern selection. The binding applies
the original Unicode word semantics, case flag, chevron substitution and match time limit.

Forward and backward use the pinned LibreOffice search loops. Each capture is a pair of signed
UTF-16 offsets. Backward search reverses both offsets in each pair. A capture pointer belongs to its
matcher and remains valid until the next search on that matcher or its destruction.

Run the host differential probe with a local build of pinned ICU 78.3.

```sh
node scripts/icu-search-regex-native-probe.mjs path/to/icu-build
```

The probe links the actual ICU archives and compiles the pinned LibreOffice bodies with small UTF-16
and sequence adapters. It checks initialization, directional regions, captures and the supported
native regression scenarios.

The browser still needs the Emscripten build and the TypeScript integration with the shared search
owner before Writer can expose this mode.

After building the host probe, use it to exercise the TypeScript search owner against ICU through
local standard I/O.

```sh
WRITER_ICU_REGEX_PROBE="$PWD/output/playwright/writer-icu-regex/probe" npm run test:shared -- src/i18npool/source/search/textsearch-regex.test.ts
```

## Browser module build

With an installed and activated repository-local SDK, the build uses the pinned ICU source archive,
a local ICU 78.3 host build and the pinned Emscripten compiler. The script leaves the existing
deployment alone and writes the module and its binary under `output/playwright/icu-regex-wasm` after
an ICU smoke test.

```sh
python3 scripts/build-icu-regex-wasm.py --host-icu path/to/icu-build --emsdk path/to/emsdk
```

Add `--verify-inputs` to verify the archive, ICU data and host tool version without an SDK. The
application adapter is tested with real growable WebAssembly memory and ABI observers. These tests
cover the memory and lifetime contract, while the host differential covers matcher semantics.
