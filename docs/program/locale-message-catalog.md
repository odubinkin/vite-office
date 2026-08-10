# Browser locale message catalog contract

The locale catalog contract normalizes BCP 47 tags through `Intl.Locale` and
resolves messages in deterministic order: exact canonical locale, language-only
locale, then canonical default locale. An unknown message ID is returned as-is,
so callers can expose missing resources without an invented translation.

`interpolateMessage` replaces every `{name}` placeholder whose key is supplied
as a string or number and preserves unknown placeholders literally. It does not
implement ICU syntax, plural categories, gender, markup escaping, RTL rendering,
or a message-loading UI. Those are separately scoped localization tasks.

No LibreOffice translation file is copied or claimed mapped by this module. The
pinned translation catalog inventory remains the source of truth for future
atomic mapping and licensed message import decisions.
