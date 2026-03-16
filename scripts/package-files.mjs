import fs from 'fs'
import path from 'path'

const EXCLUDE_DIRS = ['node_modules', '.next', '.expo', '.git']
const EXCLUDE_FILES = ['.DS_Store', 'Thumbs.db', '.gitignore'] // Already pushed .gitignore

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
  
  // Skip images/binaries to avoid payload limits
  if (['.png', '.jpg', '.jpeg', '.webp', '.ico', '.svg'].some(ext => relPath.endsWith(ext))) {
    continue
  }
  
  try {
    const content = fs.readFileSync(f, 'utf8')
    result.push({ path: relPath, content })
  } catch (_) {}
}

const outputPath = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\scripts\\packaged-files.json'
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
console.log(`Packaged ${result.length} text files`)
