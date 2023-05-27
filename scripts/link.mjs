import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const folderPath = path.resolve(__dirname, '../dist')
const filePath = path.join(folderPath, 'package.json')

const write = () => {
  fs.writeFile(
    path.resolve(__dirname, filePath),
    `{"type":"module","exports":{"import":"./index.mjs"}}`,
    error => {
      if (error && error.message.includes('no such file or directory')) {
        fs.mkdir(folderPath, { recursive: true }, error => {
          if (!error) write()
        })
      }
    }
  )
}

write()
