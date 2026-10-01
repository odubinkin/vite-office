"""Storage for manual development probes, never imported by project tests."""

import json
from pathlib import Path


def probe_source(path):
    """Keep generated native probe sources in ignored scratch storage."""
    path = Path(path)
    if path.is_absolute():
        path = path.relative_to(Path.cwd())
    relative = path.relative_to('.agentplane/tasks')
    target = Path('.agentplane/tmp/upstream-probes') / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    return target


def identity_json(value, **kwargs):
    """Serialize identities and results without duplicating upstream bodies."""
    def strip(item):
        if isinstance(item, dict):
            return {
                key: strip(value)
                for key, value in item.items()
                if not (key == 'text' and 'sha256' in item)
            }
        if isinstance(item, list):
            return [strip(value) for value in item]
        return item

    return json.dumps(strip(value), **kwargs)
