import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const root = '/vercel/share/v0-project'
const lockfile = resolve(root, 'pnpm-lock.yaml')

if (!existsSync(lockfile)) {
  console.log('[v0] Generating pnpm-lock.yaml...')
  execSync('pnpm install --no-frozen-lockfile', { cwd: root, stdio: 'inherit' })
} else {
  console.log('[v0] pnpm-lock.yaml already exists.')
}
