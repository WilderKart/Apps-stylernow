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
    console.log("Aplicando actualizaciones...")

    // 1. Mascarillas -> Solo hay 'Exfoliación y Mascarillas.webp'
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/mascarilla/Exfoliación y Mascarillas.webp' 
      WHERE category = 'mascarilla'
    `

    // 2. Depilación -> Ajustar mayúsculas y acentos
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/depilacion/Depilación Facial.webp' 
      WHERE name = 'Depilación Facial'
    `
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/depilacion/Depilación de Zonas Pequeñas.webp' 
      WHERE name IN ('Depilación de Espalda', 'Depilación de Hombros')
    `

    // 3. Manicure -> Homologar nombres de archivos
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/manicure/manicura-basica.webp' 
      WHERE name = 'Manicure Clásico'
    `
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/manicure/esmalte-gel.webp' 
      WHERE name = 'Manicure Permanente'
    `
     await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/manicure/corte-unas.webp' 
      WHERE name = 'Limpieza de Cutículas'
    `

    // 4. Facial -> Homologar
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/facial/Limpieza Facial Profunda.webp' 
      WHERE name = 'Limpieza Facial'
    `
    await sql`
      UPDATE service_catalog 
      SET image_path = '/servicios/facial/Afeitado Tradicional (Hot Towel Shave).webp' 
      WHERE name = 'Afeitado Tradicional' OR name ILIKE '%Afeitado%'
    `

    console.log("Actualización completada ✅")
  } catch (e) {
    console.error("Error al actualizar:", e)
  } finally {
    await sql.end()
  }
}

run()
