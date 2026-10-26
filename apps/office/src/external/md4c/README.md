# md4c 0.5.3 TypeScript port

LibreOffice 26.8.0.2 pins `md4c-release-0.5.3.tar.gz` with SHA-256
`353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e`. The original MIT license is
retained in LICENSE. The locally downloaded source is under the ignored `vendor/md4c-reference/src`
directory.

The TypeScript modules retain native function groups and UTF-8 byte offsets. They do not invoke a
compiler or SDK in the browser. The complete block/inline pipeline is being ported; currently Writer
consumes the entity recognizer.

Regenerate native differential fixtures with:

```sh
python3 scripts/generate-md4c-native-fixtures.py
```

This uses the host clang with the unmodified md4c.c included in a test-only translation unit. It
records a digest over classification and folding of all Unicode codepoints, forward/reverse
malformed UTF-8 cases and native scanner results. Tests consume the portable JSON fixture without a
compiler or vendor source dependency. A passing primitive fixture is not full parser parity.
