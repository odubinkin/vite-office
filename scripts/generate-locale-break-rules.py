#!/usr/bin/env python3
"""Project the original registered LC_MISC break rules and reference chains."""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path
from subprocess import check_output

FIELDS = ("EditMode", "DictionaryMode", "WordCountMode", "CharacterMode", "LineMode")


def catalog(source: Path) -> dict[str, list[str]]:
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
    resolved: dict[str, list[str]] = {}

    def rules(name: str, trail: tuple[str, ...] = ()) -> list[str]:
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
            value = [block.findtext(key) or "" for key in FIELDS] if block is not None else [""] * len(FIELDS)
        resolved[name] = value
        return value

    return {name: rules(name) for name in sorted(roots)}


def main() -> None:
    """Generate or verify the source-bound artifact."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    target = Path("apps/office/src/i18npool/source/localedata/data/break-rules.json")
    data = catalog(Path("vendor/libreoffice-reference"))
    rendered = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if target.read_text() != rendered:
            raise ValueError("Pinned break rules differ")
    else:
        target.write_text(rendered)
    print(f"Original break rules: {len(data)} locales x5 fields")


if __name__ == "__main__":
    main()
