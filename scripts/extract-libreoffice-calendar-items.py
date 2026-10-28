"""Extract LC_CALENDAR name arrays from the pinned LibreOffice locale XML files.

The native LocaleData generator resolves section refs such as en_US_gregorian;
keep that resolution here instead of substituting platform Intl month names.
"""

import argparse
import json
import subprocess
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

    def calendar_nodes(locale):
        node = documents[locale].find("LC_CALENDAR")
        if node is None:
            raise ValueError(f"No LC_CALENDAR in {locale}")
        if reference := node.get("ref"):
            return calendar_nodes(reference.replace("-", "_"))
        return node.findall("Calendar")

    sections = {
        "days": ("DaysOfWeek", 0),
        "months": ("MonthsOfYear", 1),
        "genitiveMonths": ("GenitiveMonths", 1),
        "partitiveMonths": ("PartitiveMonths", 1),
        "eras": ("Eras", 2),
    }
    records = {}
    building = set()

    def all_calendars(locale):
        if locale in records:
            return records[locale]
        if locale in building:
            raise ValueError(f"Recursive native calendar reference in {locale}")
        building.add(locale)
        nodes = calendar_nodes(locale)
        result = []
        # getAllCalendars2 exposes only already-constructed Calendar2 entries
        # to a same-locale reference while traversing native calendar order.
        records[locale] = result
        for index, selected in enumerate(nodes):
            row = {
                "id": selected.get("unoid"),
                "isDefault": selected.get("default") == "true",
                "startOfWeek": selected.findtext("StartDayOfWeek/DayID") or "",
                "minimumDays": int(selected.findtext("MinimalDaysInFirstWeek")),
            }
            for name, (section, local_index) in sections.items():
                node = selected.find(section)
                if node is None and section == "GenitiveMonths":
                    node = selected.find("MonthsOfYear")
                if node is None and section == "PartitiveMonths":
                    node = selected.find("GenitiveMonths")
                    if node is None:
                        node = selected.find("MonthsOfYear")
                if node is None:
                    raise ValueError(f"Missing native calendar section {locale}/{row['id']}/{section}")
                reference = (node.get("ref") or "").replace("-", "_")
                if reference:
                    # LocaleNode's local-reference branch uses these exact
                    # child indices, including MonthsOfYear for grammatical
                    # month refs and child2 for eras. Do not infer a section.
                    prior = next((item for item in nodes[:index] if item.get("unoid") == reference), None)
                    if prior is not None:
                        node = list(prior)[local_index]
                    else:
                        target_locale, _, target_id = reference.rpartition("_")
                        targets = all_calendars(target_locale) if target_locale in documents else []
                        target = next((item for item in targets if item["id"] == target_id), None)
                        if target is None:
                            target = all_calendars("en_US")[0]
                        row[name] = [dict(item) for item in target[name]]
                        continue
                values = []
                for item in node:
                    full = item.findtext("DefaultFullName") or ""
                    narrow = item.findtext("DefaultNarrowName")
                    if narrow is None:
                        narrow = full[:1]  # Native first Unicode codepoint.
                    values.append({
                        "id": list(item)[0].text or "",
                        "full": full,
                        "abbreviated": item.findtext("DefaultAbbrvName") or "",
                        "narrow": "" if name == "eras" else narrow,
                    })
                row[name] = values
            result.append(row)
        building.remove(locale)
        return result

    registered = json.loads(REGISTERED.read_text())
    for locale in sorted(registered):
        if documents[locale].find("LC_CALENDAR") is not None:
            all_calendars(locale)
    full_records = {key: records[key] for key in sorted(registered) if key in records}
    defaults = {}
    for locale, calendars in full_records.items():
        selected = next(item for item in calendars if item["isDefault"])
        defaults[locale] = {"id": selected["id"]}
        for section in ("months", "genitiveMonths", "partitiveMonths", "days"):
            defaults[locale][section] = [
                {"full": item["full"], "abbreviated": item["abbreviated"]}
                for item in selected[section]
            ]
    outputs = {
        OUTPUT: defaults,
        OUTPUT.with_name("calendars.json"): full_records,
    }
    for path, values in outputs.items():
        generated = json.dumps(values, ensure_ascii=False, separators=(",", ":")) + "\n"
        generated = subprocess.run(
            ["npx", "--no-install", "prettier", "--stdin-filepath", str(path)],
            input=generated, text=True, capture_output=True, check=True, cwd=ROOT,
        ).stdout
        if check:
            if not path.exists() or path.read_text() != generated:
                raise SystemExit(f"Stale pinned calendar catalog: {path.relative_to(ROOT)}")
        else:
            path.write_text(generated)
    print(f"{'Verified' if check else 'Extracted'} {len(full_records)} pinned locale calendar lists")


if __name__ == "__main__":
    main()
