#!/usr/bin/env python3
"""Project the original registered LC_MISC reserved words, refs and generator defaults."""
from __future__ import annotations
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from subprocess import check_output


def catalog(source: Path) -> dict[str, dict[str, str]]:
    """Resolve the source service catalog and unchanged ReserveWord order/defaults."""
    pin = check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip()
    if pin != "9bc445578031fecf56086729d8e4940c77e14d65":
        raise ValueError("Changed pinned LibreOffice source")
    spec = importlib.util.spec_from_file_location("formats", Path(__file__).with_name("generate-locale-number-formats.py"))
    if spec is None or spec.loader is None:
        raise RuntimeError("Missing original locale catalog reader")
    sys.dont_write_bytecode = True
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    roots = module.registered_roots(source)
    original = (source / "i18npool/source/localedata/LocaleNode.cxx").read_text()
    table = original.split("const NameValuePair ReserveWord[] = {", 1)[1].split("};", 1)[0]
    words = re.findall(r'\{\s*"([^"]+)",\s*"([^"]*)"\s*\}', table)
    if len(words) != 12:
        raise ValueError("Changed native ReserveWord contract")
    resolved: dict[str, dict[str, str]] = {}

    def resolve(name: str, trail: tuple[str, ...] = ()) -> dict[str, str]:
        """Follow the actual LC_MISC ref chain without inventing locale fallback."""
        if name in resolved:
            return resolved[name]
        if name in trail:
            raise ValueError("Cyclic LC_MISC ref")
        node = roots[name].find("LC_MISC")
        if node is None:
            raise ValueError("Missing native LC_MISC: " + name)
        reference = node.get("ref", "")
        if reference:
            result = dict(resolve(reference.replace("-", "_"), trail + (name,)))
        else:
            reserved = node.find("ReservedWords")
            result = {}
            for field, default in words:
                child = None if reserved is None else reserved.find(field)
                value = default if child is None else (child.text or "")
                if not value:
                    raise ValueError("Empty native reserved word: " + name + "/" + field)
                result[field] = value
        resolved[name] = result
        return result

    return {name: resolve(name) for name in sorted(roots)}


def main() -> None:
    """Generate or verify the in-repository original source projection."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    target = Path("apps/office/src/i18npool/source/localedata/data/reserved-words.json")
    data = catalog(Path("vendor/libreoffice-reference"))
    rendered = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if target.read_text() != rendered:
            raise ValueError("Pinned reserved words differ")
    else:
        target.write_text(rendered)
    print(f"Original reserved words: {len(data)} locales x12 fields")


if __name__ == "__main__":
    main()
