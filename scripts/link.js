import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

fs.writeFileSync(
  path.resolve(__dirname, '../dist/package.json'),
  JSON.stringify({
    type: 'module'
  })
)
