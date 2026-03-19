import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve('.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}="([^"]+)"`))
  return match ? match[1] : null
}

const connectionString = getEnvVar('DIRECT_URL')

const sql = postgres(connectionString)

async function run() {
  try {
    console.log('--- APLICANDO ARREGLOS SQL ---')

    // 1. Clonar permisos de 'owner' a 'master'
    const permissionsResult = await sql`
      INSERT INTO role_permissions (role, permission)
      SELECT 'master', permission 
      FROM role_permissions 
      WHERE role = 'owner'
      ON CONFLICT DO NOTHING
      RETURNING *
    `
    console.log(`Permisos clonados a 'master': ${permissionsResult.length}`)

    // 2. Corregir imágenes de servicios faciales
    const servicesToFix = [
      'Hidratación Profunda',
      'Peeling Facial',
      'Tratamiento Anti-Acné'
    ]

    const updateImagesResult = await sql`
      UPDATE service_catalog
      SET image_path = '/servicios/facial/Limpieza Facial Profunda.webp'
      WHERE name = ANY(${servicesToFix})
      RETURNING name
    `
    console.log(`Imágenes actualizadas para: ${updateImagesResult.map(r => r.name).join(', ')}`)

    console.log('--- PROCESO COMPLETADO ---')

  } catch (err) {
    console.error('SQL Error:', err)
  } finally {
    await sql.end()
  }
}

run()
