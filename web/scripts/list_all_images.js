import fs from 'fs'
import path from 'path'

const baseDir = 'C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\public\\servicios'

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(fullPath))
    } else { 
      if (file.endsWith('.webp')) {
        results.push(fullPath.replace('C:\\Users\\karni\\Documents\\Proyectos\\StylerNow\\web\\public', '').replace(/\\/g, '/'))
      }
    }
  })
  return results
}

try {
  const images = walk(baseDir)
  console.log("=== IMÁGENES EN DISCO ===")
  console.log(JSON.stringify(images, null, 2))
} catch (e) {
  console.error(e)
}
