"""Extract source-ordered LC_CURRENCY rows from pinned LibreOffice locale XML."""

import argparse
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "vendor/libreoffice-reference/i18npool/source/localedata/data"
REGISTERED = ROOT / "apps/office/src/i18npool/source/localedata/data/language-country-info.json"
OUTPUT = ROOT / "apps/office/src/i18npool/source/localedata/data/currencies.json"
LOCALE_TABLE = ROOT / "vendor/libreoffice-reference/i18npool/source/localedata/localedata.cxx"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="verify the generated catalog")
    check = parser.parse_args().check
    documents = {path.stem: ET.parse(path).getroot() for path in SOURCE.glob("*.xml")}
    registered = json.loads(REGISTERED.read_text())
    table = LOCALE_TABLE.read_text().split("} aLibTable[] = {", 1)[1].split("\n};", 1)[0]
    installed = re.findall(r'\{\s*"([^"]+)"\s*,\s*DataLocaleLibrary::\w+\s*\}', table)
    if len(installed) != len(set(installed)) or set(installed) != set(registered):
        raise ValueError("Pinned installed locale table differs from registered locale XML")

    def currencies(locale, seen=()):
        if locale in seen:
            raise ValueError(f"Circular LC_CURRENCY reference: {seen + (locale,)}")
        section = documents[locale].find("LC_CURRENCY")
        if section is None:
            raise ValueError(f"No LC_CURRENCY in {locale}")
        if reference := section.get("ref"):
            return currencies(reference, seen + (locale,))
        return [
            {
                "id": row.findtext("CurrencyID") or "",
                "symbol": row.findtext("CurrencySymbol") or "",
                "bankSymbol": row.findtext("BankSymbol") or "",
                "name": row.findtext("CurrencyName") or "",
                "decimalPlaces": int(row.findtext("DecimalPlaces") or "0"),
                "default": row.get("default") == "true",
                "usedInCompatibleFormatCodes": row.get("usedInCompatibleFormatCodes") == "true",
                "legacyOnly": row.get("legacyOnly") == "true",
            }
            for row in section.findall("Currency")
        ]

    records = {locale: currencies(locale) for locale in installed}
    generated = json.dumps(records, ensure_ascii=False, separators=(",", ":")) + "\n"
    if check:
        if not OUTPUT.exists() or OUTPUT.read_text() != generated:
            raise SystemExit(f"Stale pinned currency catalog: {OUTPUT.relative_to(ROOT)}")
        print(f"Verified {len(records)} pinned locale currency sections")
    else:
        OUTPUT.write_text(generated)
        print(f"Extracted {len(records)} pinned locale currency sections to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
