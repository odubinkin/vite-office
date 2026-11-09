#!/usr/bin/env python3
"""Project the original registered LC_MISC word rules and hanging characters."""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from subprocess import check_output

FIELDS = ("EditMode", "DictionaryMode", "WordCountMode", "CharacterMode", "LineMode")


def catalog(source: Path) -> tuple[dict[str, list[str]], dict[str, str]]:
    """Resolve the registered source LC_MISC rules in native generated order."""
    pin = check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
    if pin != "9bc445578031fecf56086729d8e4940c77e14d65":
        raise ValueError("Changed pinned LibreOffice source")
    spec = importlib.util.spec_from_file_location(
        "formats", Path(__file__).with_name("generate-locale-number-formats.py")
    )
    if spec is None or spec.loader is None:
        raise RuntimeError("Missing original locale catalog reader")
    sys.dont_write_bytecode = True
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    roots = module.registered_roots(source)
    resolved: dict[str, tuple[list[str], str]] = {}

    def rules(name: str, trail: tuple[str, ...] = ()) -> tuple[list[str], str]:
        """Follow the source reference or generate all five string fields."""
        if name in resolved:
            return resolved[name]
        if name in trail:
            raise ValueError("Cyclic LC_MISC ref: " + name)
        misc = roots[name].find("LC_MISC")
        if misc is None:
            raise ValueError("Missing LC_MISC: " + name)
        ref = misc.get("ref", "")
        if ref:
            value = rules(ref.replace("-", "_"), trail + (name,))
        else:
            block = misc.find("BreakIteratorRules")
            breaks = [block.findtext(key) or "" for key in FIELDS] if block is not None else [""] * len(FIELDS)
            hanging = misc.findtext("ForbiddenCharacters/LineBreakHangingCharacters") or ""
            value = breaks, hanging
        resolved[name] = value
        return value

    names = sorted(roots)
    return {name: rules(name)[0] for name in names}, {name: rules(name)[1] for name in names}


def main() -> None:
    """Generate or verify the source-bound artifact."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = catalog(Path("vendor/libreoffice-reference"))
    directory = Path("apps/office/src/i18npool/source/localedata/data")
    for filename, values in zip(("break-rules.json", "hanging-characters.json"), data):
        target = directory / filename
        rendered = json.dumps(values, ensure_ascii=False, indent=2) + "\n"
        if args.check:
            if target.read_text() != rendered:
                raise ValueError("Pinned locale field differs: " + filename)
        else:
            target.write_text(rendered)
    print(f"Original break data: {len(data[0])} locales x5 rule fields and hanging characters")


if __name__ == "__main__":
    main()
