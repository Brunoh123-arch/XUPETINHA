#!/usr/bin/env python3
import os
from pathlib import Path

print("CWD:", os.getcwd())
print("HOME:", os.path.expanduser("~"))

# Procurar package.json para encontrar raiz do projeto
for root, dirs, files in os.walk("/"):
    dirs[:] = [d for d in dirs if d not in {"proc", "sys", "dev", "run", "tmp"}]
    if "package.json" in files and "node_modules" in dirs:
        print("Possible project root:", root)
        if len(root.split("/")) < 6:  # nao muito profundo
            break
