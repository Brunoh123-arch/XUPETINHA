#!/usr/bin/env python3
"""
Remove o prefixo de debug '[v0] ' de todos os console.log/error/warn
em arquivos .ts e .tsx do projeto.
"""

import os
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent

SKIP_DIRS = {".next", "node_modules", ".git", "scripts"}

PATTERN = re.compile(r'''(console\.(log|error|warn|info)\()('[v0][v0]\])\s*''')
# Match: console.log('[v0] ... ou console.error('[v0] ...
# Substitui removendo o '[v0] ' do argumento e deixa o restante
FULL_PATTERN = re.compile(
    r"""(console\.(log|error|warn|info)\()'?\[v0\]\s*(.*?)""",
    re.DOTALL
)

# Pattern mais simples e seguro: linha a linha
LINE_PATTERN = re.compile(r"""(console\.(log|error|warn|info)\()'?\[v0\] ?""")

def clean_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    new_text, count = LINE_PATTERN.subn(r'\1', text)
    if count > 0:
        path.write_text(new_text, encoding="utf-8")
    return count

total_files = 0
total_replacements = 0

for root, dirs, files in os.walk(ROOT):
    # Pular diretorios desnecessarios
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        if fname.endswith((".ts", ".tsx")):
            fpath = Path(root) / fname
            try:
                n = clean_file(fpath)
                if n > 0:
                    rel = fpath.relative_to(ROOT)
                    print(f"  {rel}: {n} substituicao(oes)")
                    total_files += 1
                    total_replacements += n
            except Exception as e:
                print(f"  ERRO em {fpath}: {e}")

print(f"\nTotal: {total_replacements} substituicoes em {total_files} arquivos")
