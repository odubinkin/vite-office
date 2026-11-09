"""Regenerate LocaleNode's pinned LCMisc break-rule arrays."""
from argparse import ArgumentParser
from functools import cache
from pathlib import Path
import json
import xml.etree.ElementTree as ET


root = Path(__file__).resolve().parent.parent
source = root / "vendor/libreoffice-reference/i18npool/source/localedata/data"
target = root / "apps/office/src/i18npool/source/localedata/data/break-iterator-rules.json"
fields = ("EditMode", "DictionaryMode", "WordCountMode", "CharacterMode", "LineMode")
nodes = {p.stem: ET.parse(p).getroot().find("LC_MISC") for p in sorted(source.glob("*.xml"))}


@cache
def read_rules(locale):
    """Follow the original LCMisc ref or return the five generated values."""
    section = nodes[locale]
    if section is None:
        return [""] * len(fields)
    ref = section.get("ref")
    if ref:
        return read_rules(ref.replace("-", "_"))
    rules = section.find("BreakIteratorRules")
    if rules is None:
        return [""] * len(fields)
    return [rules.findtext(field) or "" for field in fields]


parser = ArgumentParser(description=__doc__)
parser.add_argument("--check", action="store_true")
args = parser.parse_args()
data = "{\n" + ",\n".join(
    f"  {json.dumps(locale)}: {json.dumps(read_rules(locale), ensure_ascii=False)}"
    for locale in nodes
) + "\n}\n"
if args.check:
    if target.read_text(encoding="utf-8") != data:
        raise SystemExit("BreakIteratorRules differ from pinned LibreOffice locale data")
else:
    target.write_text(data, encoding="utf-8")
