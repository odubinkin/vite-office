"""Extract LC_CALENDAR name arrays from the pinned LibreOffice locale XML files.

The native LocaleData generator resolves section refs such as en_US_gregorian;
keep that resolution here instead of substituting platform Intl month names.
"""

import argparse
import json
from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor/libreoffice-reference/i18npool/source/localedata/data"
OUTPUT = ROOT / "apps/office/src/i18npool/source/localedata/data/calendar-items.json"
REGISTERED = ROOT / "apps/office/src/i18npool/source/localedata/data/language-country-info.json"


def main():
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument("--check", action="store_true", help="verify the committed catalog")
    check = arguments.parse_args().check
    documents = {path.stem: ET.parse(path).getroot() for path in SOURCE.glob("*.xml")}

    def calendar(locale):
        node = documents[locale].find("LC_CALENDAR")
        if node is None:
            raise ValueError(f"No LC_CALENDAR in {locale}")
        if reference := node.get("ref"):
            return calendar(reference)
        result = next((item for item in node.findall("Calendar") if item.get("default") == "true"), None)
        if result is None:
            raise ValueError(f"No default Calendar in {locale}")
        return result

    def items(locale, section):
        selected = calendar(locale)
        node = selected.find(section)
        if node is None:
            return []
        if reference := node.get("ref"):
            if reference in documents:
                return items(reference, section)
            name, _, calendar_id = reference.rpartition("_")
            if not name or not calendar_id:
                raise ValueError(f"Invalid calendar reference {reference}")
            referenced = documents[name].find("LC_CALENDAR")
            if referenced is None:
                raise ValueError(f"Missing calendar reference {reference}")
            source = next((item for item in referenced.findall("Calendar") if item.get("unoid") == calendar_id), None)
            if source is None:
                raise ValueError(f"Missing calendar {reference}")
            node = source.find(section)
            if node is None:
                raise ValueError(f"Missing calendar section {reference}/{section}")
            # Nested references are legal in the locale source.
            if node.get("ref"):
                return items(name, section)
        return [
            {"full": (item.findtext("DefaultFullName") or ""), "abbreviated": (item.findtext("DefaultAbbrvName") or "")}
            for item in node
        ]

    records = {}
    # The service registry excludes source-only XML files such as ti_ET.
    registered = json.loads(REGISTERED.read_text())
    for locale in sorted(registered):
        if documents[locale].find("LC_CALENDAR") is None:
            continue
        records[locale] = {
            "id": calendar(locale).get("unoid"),
            "months": items(locale, "MonthsOfYear"),
            "genitiveMonths": items(locale, "GenitiveMonths"),
            "partitiveMonths": items(locale, "PartitiveMonths"),
            "days": items(locale, "DaysOfWeek"),
        }
    generated = json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n"
    if check:
        if not OUTPUT.exists() or OUTPUT.read_text() != generated:
            raise SystemExit(f"Stale pinned calendar catalog: {OUTPUT.relative_to(ROOT)}")
        print(f"Verified {len(records)} pinned locale calendars")
    else:
        OUTPUT.write_text(generated)
        print(f"Extracted {len(records)} pinned locale calendars to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
