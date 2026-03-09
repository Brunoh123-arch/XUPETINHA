#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path("/vercel/share/v0-project")
print("ROOT exists:", ROOT.exists())
print("ROOT is dir:", ROOT.is_dir())

# list first-level
items = list(ROOT.iterdir())
print(f"Items in ROOT ({len(items)}):")
for item in sorted(items)[:20]:
    print(f"  {item.name}")

# Try to find a specific file
target = ROOT / "lib" / "services" / "ride-service.ts"
print("\ntarget exists:", target.exists())
if target.exists():
    first_line = target.read_text(encoding="utf-8").splitlines()[43]
    print("line 44:", first_line)
