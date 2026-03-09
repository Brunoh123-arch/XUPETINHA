#!/usr/bin/env python3
"""
Remove o prefixo de debug '[v0] ' de todos os console.log/error/warn
em arquivos .ts e .tsx do projeto, usando substituicao de string simples.
"""

import os
from pathlib import Path

ROOT = Path("/vercel/share/v0-project")
SKIP_DIRS = {".next", "node_modules", ".git", "scripts", "public"}

# Todos os padroes de prefixo que aparecem nos arquivos
REPLACEMENTS = [
    ("'[v0] ', ",  ""),   # console.log('[v0] ', var)  -> console.log(var)
    ('"[v0] ", ',  ""),   # variante aspas duplas
    ("'[v0] '",    "''"), # console.log('[v0] ') -> console.log('')  — mas melhor remover
    ('"[v0] "',    '""'),
    # Padrao mais comum: console.log('[v0] Texto...', ...)
    # A string '[v0] X' deve ter o prefixo removido do proprio conteudo
]

def clean_line(line: str) -> str:
    # Substitui '[v0] Qualquer texto' -> 'Qualquer texto' dentro de console calls
    import re
    # Aspas simples: '[v0] ...'
    line = re.sub(r"'(\[v0\] )", "'", line)
    # Aspas duplas: "[v0] ..."
    line = re.sub(r'"(\[v0\] )', '"', line)
    return line

total_files = 0
total_lines = 0

for root, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        if fname.endswith((".ts", ".tsx")):
            fpath = Path(root) / fname
            try:
                original = fpath.read_text(encoding="utf-8")
                lines = original.splitlines(keepends=True)
                new_lines = []
                changed = 0
                for line in lines:
                    new_line = clean_line(line)
                    if new_line != line:
                        changed += 1
                    new_lines.append(new_line)
                if changed > 0:
                    fpath.write_text("".join(new_lines), encoding="utf-8")
                    rel = fpath.relative_to(ROOT)
                    print(f"  {rel}: {changed} linha(s)")
                    total_files += 1
                    total_lines += changed
            except Exception as e:
                print(f"  ERRO em {fpath}: {e}")

print(f"\nTotal: {total_lines} linhas em {total_files} arquivos")
