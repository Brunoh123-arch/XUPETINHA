/**
 * Gera um package-lock.json minimo e compativel com o package.json atual.
 */
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const root = '/vercel/share/v0-project'
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))

const lock = {
  name: pkg.name,
  version: pkg.version,
  lockfileVersion: 3,
  requires: true,
  packages: {
    '': {
      name: pkg.name,
      version: pkg.version,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
    },
  },
}

writeFileSync(resolve(root, 'package-lock.json'), JSON.stringify(lock, null, 2))
console.log('[v0] package-lock.json gerado com sucesso!')
