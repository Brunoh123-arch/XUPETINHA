/**
 * Remove o prefixo [v0] de todos os console.log/error/warn nos arquivos do projeto.
 * Converte console.log('[v0] ...') em console.error/warn sem o prefixo de debug.
 * Em arquivos de pagina (app/uppi/**) remove inteiramente os console.log de debug.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const ROOT = new URL('..', import.meta.url).pathname
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// Arquivos/diretorios a ignorar
const IGNORE = ['node_modules', '.next', '.git', 'scripts', 'user_read_only_context']

let filesChanged = 0
let replacements = 0

function processFile(filePath) {
  const content = readFileSync(filePath, 'utf8')

  // Substituir console.log/error/warn('[v0] ...') removendo o prefixo [v0]
  const updated = content
    // console.log('[v0] texto', ...) → remove a linha inteira (debug statements)
    .replace(/^\s*console\.log\(\s*['"`]\[v0\][^'"`]*['"`].*\).*\n?/gm, '')
    // console.error('[v0] texto', ...) → console.error('texto', ...)
    .replace(/console\.error\(\s*['"`]\[v0\]\s*/g, "console.error('")
    // console.warn('[v0] texto', ...) → console.warn('texto', ...)
    .replace(/console\.warn\(\s*['"`]\[v0\]\s*/g, "console.warn('")

  if (updated !== content) {
    writeFileSync(filePath, updated, 'utf8')
    filesChanged++
    console.log(`Updated: ${filePath.replace(ROOT, '')}`)
  }
}

function walk(dir) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    if (IGNORE.includes(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (EXTENSIONS.includes(extname(full))) {
      processFile(full)
    }
  }
}

walk(ROOT)
console.log(`\nDone: ${filesChanged} files updated, ${replacements} patterns removed.`)
