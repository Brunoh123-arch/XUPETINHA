"""
Remove o prefixo '[v0] ' de todos os console.log/error/warn/info em arquivos .ts/.tsx
Executa diretamente no sistema de arquivos (não usa uv/pip).
"""
import os
import re

# Path fixo — o sandbox executa os scripts dentro do diretório do projeto
ROOT = "/vercel/share/v0-project"

# Padrão: qualquer string entre aspas que inicia com [v0]
# Ex: console.error('[v0] msg', ...) → console.error('msg', ...)
# Ex: console.log("[v0] msg") → console.log("msg")
PATTERN = re.compile(r"""(console\.(log|error|warn|info)\(['"]).?\[v0\] ?""")

files_changed = 0
replacements_total = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    # Ignorar node_modules, .next, .git, scripts
    dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.next', '.git', 'scripts', '.turbo')]
    
    for filename in filenames:
        if not (filename.endswith('.ts') or filename.endswith('.tsx')):
            continue
        
        filepath = os.path.join(dirpath, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception:
            continue
        
        if '[v0]' not in content:
            continue
        
        # Contar ocorrências antes
        count_before = content.count('[v0]')
        
        # Substituição via regex — remove '[v0] ' após a aspas de abertura
        new_content = re.sub(
            r"""(console\.(log|error|warn|info)\((?:"|'))?\[v0\] ?""",
            lambda m: m.group(0).split('[v0]')[0],
            content
        )
        
        # Fallback para strings entre backtick ou casos restantes
        new_content = new_content.replace("'[v0] ", "'").replace('"[v0] ', '"').replace('`[v0] ', '`')
        # Remover prefixos sem espaço também
        new_content = new_content.replace("'[v0]", "'").replace('"[v0]', '"')
        
        count_after = new_content.count('[v0]')
        removed = count_before - count_after
        
        if removed > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            files_changed += 1
            replacements_total += removed
            rel = os.path.relpath(filepath, ROOT)
            print(f"  [{removed}x] {rel}")

print(f"\nTotal: {replacements_total} prefixos removidos em {files_changed} arquivos.")
