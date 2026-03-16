import fs from 'fs'
import path from 'path'

const EXCLUDE_DIRS = ['node_modules', '.next', '.expo', '.git']
const EXCLUDE_FILES = ['.gitignore', 'node_modules', '.next', '.expo', 'scripts/package-files.mjs', 'scripts/packaged-files.json']

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []

  files.forEach(file => {
    if (EXCLUDE_DIRS.includes(file)) return
    if (EXCLUDE_FILES.includes(file)) return

    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })
  return arrayOfFiles
}

const rootDir = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow'
const files = getAllFiles(rootDir)
const result = []

for (const f of files) {
  const relPath = path.relative(rootDir, f).replace(/\\/g, '/')
  
  if (EXCLUDE_FILES.includes(relPath)) continue
  if (['.png', '.jpg', '.jpeg', '.webp', '.ico', '.svg'].some(ext => relPath.endsWith(ext))) {
    continue // skip binaries
  }
  if (relPath.includes('packaged-')) continue // avoid self-copies
  
  try {
    const content = fs.readFileSync(f, 'utf8')
    result.push({ path: relPath, content })
  } catch (_) {}
}

// Split into batches of 15
const BATCH_SIZE = 15
for (let i = 0; i < result.length; i += BATCH_SIZE) {
  const batch = result.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const outputPath = `C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\scripts\\packaged-batch-${batchNum}.json`
  fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2))
  console.log(`Created packaged-batch-${batchNum}.json with ${batch.length} files`)
}
