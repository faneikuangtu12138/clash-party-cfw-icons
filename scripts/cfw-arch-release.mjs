import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const archDir = join('dist', 'arch')
mkdirSync(archDir, { recursive: true })

if (process.argv.includes('--checksums')) {
  for (const file of readdirSync('dist').filter((name) => name.endsWith('.pkg.tar.zst'))) {
    const digest = createHash('sha256')
      .update(readFileSync(join('dist', file)))
      .digest('hex')
    writeFileSync(join('dist', `${file}.sha256`), `${digest}  ${file}\n`)
  }
} else {
  if (process.platform !== 'linux' || process.arch !== 'x64') {
    throw new Error('Build the Arch x86_64 release on Linux x64')
  }
  const archiveName = `clash-party-linux-${version}-x64.tar.gz`
  const archive = join('dist', archiveName)
  execFileSync('tar', [
    '-czf',
    archive,
    '-C',
    'dist',
    'linux-unpacked',
    '-C',
    '..',
    'build/icon.png',
    'LICENSE.md'
  ])
  const digest = createHash('sha256').update(readFileSync(archive)).digest('hex')
  writeFileSync(`${archive}.sha256`, `${digest}  ${archiveName}\n`)
  const template = readFileSync('packaging/arch/PKGBUILD.in', 'utf8')
    .replaceAll('@PKGVER@', version.replaceAll('-', '_'))
    .replaceAll('@VERSION@', version)
    .replaceAll('@SHA256@', digest)
  writeFileSync(join(archDir, 'PKGBUILD'), template)
}
