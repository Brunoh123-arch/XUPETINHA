import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Localiza o rootDir verificando onde esta o package.json
const candidates = [
  '/vercel/share/v0-project',
  process.env.VERCEL_PROJECT_DIR || '',
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  '/app',
  '/workspace',
]
let rootDir = candidates.find(dir => dir && existsSync(path.join(dir, 'package.json'))) || '.'
console.log('[INFO] rootDir encontrado:', rootDir)

// 1. Verifica se o middleware.ts está correto
try {
  const middleware = readFileSync(path.join(rootDir, 'middleware.ts'), 'utf-8')
  console.log('[CHECK] middleware.ts existe:', middleware.substring(0, 100))
} catch (e) {
  console.log('[ERROR] middleware.ts nao encontrado:', e.message)
}

// 2. Verifica lib/supabase/server.ts
try {
  const server = readFileSync(path.join(rootDir, 'lib/supabase/server.ts'), 'utf-8')
  console.log('[CHECK] lib/supabase/server.ts existe:', server.substring(0, 100))
} catch (e) {
  console.log('[ERROR] lib/supabase/server.ts nao encontrado:', e.message)
}

// 3. Verifica lib/supabase/client.ts
try {
  const client = readFileSync(path.join(rootDir, 'lib/supabase/client.ts'), 'utf-8')
  console.log('[CHECK] lib/supabase/client.ts existe:', client.substring(0, 100))
} catch (e) {
  console.log('[ERROR] lib/supabase/client.ts nao encontrado:', e.message)
}

// 4. Verifica tsconfig.json
try {
  const tsconfig = JSON.parse(readFileSync(path.join(rootDir, 'tsconfig.json'), 'utf-8'))
  console.log('[CHECK] tsconfig jsx:', tsconfig.compilerOptions?.jsx)
  console.log('[CHECK] tsconfig paths:', JSON.stringify(tsconfig.compilerOptions?.paths))
} catch (e) {
  console.log('[ERROR] tsconfig.json:', e.message)
}

// 5. Verifica next.config.mjs opcoes criticas
try {
  const nextConfig = readFileSync(path.join(rootDir, 'next.config.mjs'), 'utf-8')
  console.log('[CHECK] ignoreBuildErrors:', nextConfig.includes('ignoreBuildErrors: true'))
  console.log('[CHECK] ignoreDuringBuilds:', nextConfig.includes('ignoreDuringBuilds: true'))
} catch (e) {
  console.log('[ERROR] next.config.mjs:', e.message)
}

// 6. Tenta o build e captura o erro
try {
  console.log('\n[BUILD] Iniciando next build...\n')
  const output = execSync('npm run build 2>&1', {
    timeout: 120000,
    encoding: 'utf-8',
    cwd: rootDir
  })
  console.log('[BUILD] Sucesso!\n', output.slice(-3000))
} catch (e) {
  console.log('[BUILD ERROR] Saida do erro:\n')
  // Mostra apenas as ultimas 4000 chars que contem o erro real
  const output = (e.stdout || '') + (e.stderr || '') + (e.message || '')
  console.log(output.slice(-4000))
}
