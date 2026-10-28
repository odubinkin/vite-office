# Native XML byte encoding contracts

The shared byte owner now includes original internal OStringLiteral/OString
storage, default/copy/adopt/move construction, assignment, borrowed field
addresses, length/search and substring ownership. Actual SAL C entrypoints use
the existing rtl::str allocation/refcount/static-empty owners. The common
Copy/newFromStr_WithLength/assign/newFromSubString templates now also instantiate
the original byte specialization; existing UTF16 callers keep their default
specialization. Counted byte payloads retain embedded zeros and high bytes.

MIME lookup in the original tencinfo owner includes all40 VIP and184 ordered alias
entries from the pinned source, including duplicates. A direct ordered-table
source audit proves no entries were added, removed, reordered or substituted.
The original C-string loop keeps at most30 ASCII alphanumeric bytes, lowercases
only ASCII capitals, checks exact VIP names and then ordered alias prefixes.
Names such as utf-16 and ucs-4 retain the original DONTKNOW result: they are not
silently supplied through browser encoding aliases.

CALC-362 / WRITER199 records prefix aliases accepting suffixes while exact VIP
names do not. This native behavior is preserved. OString move assignment releases
the destination and resets the source through rtl_string_new, rather than
swapping the old destination into the source.

This checkpoint is a prerequisite for XMLFile2UTFConverter. Its scanning,
incremental conversion, declaration removal, actual SAX InputSource values and
UNO stream parser admission remain pending, along with complete DOCX/XLSX
model/filter/worker/UI round trips. OString numeric/concat/format and additional
convenience methods are not implemented or advertised. Physical native ABI,
constant evaluation, allocator exhaustion, pointer undefined behavior and native
threads are not certified by the portable tests.

Existing prior SAL native evidence remains limited to its recorded scopes. New
byte template/C/OString/MIME behavior does not inherit a broad parity promotion.
EOF/binary-model coverage gaps from prior checkpoints remain open.
