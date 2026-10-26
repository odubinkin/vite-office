# md4c 0.5.3 TypeScript port

LibreOffice 26.8.0.2 pins `md4c-release-0.5.3.tar.gz` with SHA-256
`353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e`. The original MIT license is
retained in LICENSE. The locally downloaded source is under the ignored `vendor/md4c-reference/src`
directory.

The TypeScript modules retain native function groups and UTF-8 byte offsets. They do not invoke a
compiler or SDK in the browser. The complete block/inline/callback pipeline is ported; Writer
callback integration is pending. Writer currently consumes the entity recognizer.

Regenerate native differential fixtures with:

```sh
python3 scripts/generate-md4c-native-fixtures.py
```

This uses the host clang with the unmodified md4c.c included in a test-only translation unit. It
records a digest over classification and folding of all Unicode codepoints, forward/reverse
malformed UTF-8 cases and native scanner results. Tests consume the portable JSON fixture without a
compiler or vendor source dependency. A passing primitive fixture is not full parser parity.

The full block-analysis phase is checked against compiled C on 733 examples with
`MD_DIALECT_GITHUB | MD_FLAG_WIKILINKS`. Regenerate it with
`python3 scripts/generate-md4c-block-fixtures.py`. Unused/uninitialized C block data fields are not
treated as portable contracts; meaningful headers, line bounds/indentation, container flags and
reference definitions are compared.

`native-blocks.json` contains Markdown examples from the md4c 0.5.3 bundled CommonMark 0.31.2
specification by John MacFarlane and md4c extension examples. The CommonMark-derived example inputs
are provided under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); source
attribution and version are retained here and in the fixture. The md4c extension material retains
its original MIT license. Native-generated expected records describe the pinned implementation;
passing this phase alone is not full parser conformance.

The public `md_parse` pipeline matches 813 complete native callback streams, including exact text
chunks, byte attributes, extension flags, malformed UTF-8 and NULL handling. Every callback prefix
is checked for propagation of its original nonzero abort result. Regenerate these fixtures with
`python3 scripts/generate-md4c-callback-fixtures.py`. The CommonMark input attribution above also
applies to `native-callbacks.json`. Dependency conformance is distinct from Writer model
integration.
