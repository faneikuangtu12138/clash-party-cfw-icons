import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'yaml'

const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const portableArchives = readdirSync('dist').filter((file) => file.endsWith('-portable.7z'))
writeFileSync('PORTABLE', '')
for (const file of portableArchives) {
  execFileSync(
    join(process.cwd(), 'extra', 'files', '7za.exe'),
    ['a', join('dist', file), 'PORTABLE'],
    {
      stdio: 'inherit'
    }
  )
}
const packages = readdirSync('dist').filter(
  (file) => file.endsWith('-setup.exe') || file.endsWith('-portable.7z')
)
if (packages.length === 0) throw new Error('No Windows packages were built')
for (const file of packages) {
  const hash = createHash('sha256')
    .update(readFileSync(join('dist', file)))
    .digest('hex')
  writeFileSync(join('dist', `${file}.sha256`), `${hash}  ${file}\n`)
}
writeFileSync(
  'dist/latest.yml',
  yaml.stringify({
    version,
    changelog: '经典 CFW 渐变小猫：关闭深蓝、规则与直连绿色、全局与 TUN 橙色，透明背景。'
  })
)
