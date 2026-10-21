import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const packages = readdirSync('dist').filter((file) => file.endsWith('.rpm'))
if (packages.length === 0) throw new Error('No RPM packages were built')
for (const file of packages) {
  const digest = createHash('sha256')
    .update(readFileSync(join('dist', file)))
    .digest('hex')
  writeFileSync(join('dist', `${file}.sha256`), `${digest}  ${file}\n`)
}
