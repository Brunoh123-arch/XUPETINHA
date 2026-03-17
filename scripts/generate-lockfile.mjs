/**
 * Script auxiliar para garantir que o pnpm-lock.yaml existe na raiz
 * Execute: node scripts/generate-lockfile.mjs
 */
import { execSync } from 'child_process'
import { existsSync } from 'fs'

const lockfilePath = 'pnpm-lock.yaml'

if (!existsSync(lockfilePath)) {
  console.log('[v0] pnpm-lock.yaml not found at root, generating...')
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' })
  console.log('[v0] pnpm-lock.yaml generated.')
} else {
  console.log('[v0] pnpm-lock.yaml already exists at root.')
}
