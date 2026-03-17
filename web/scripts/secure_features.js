const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=["']?([^"'\r\n]+)["']?`, 'm'));
  return match ? match[1] : null;
}

const connectionString = getEnvVar('DIRECT_URL') || getEnvVar('DATABASE_URL');
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado a Postgres.");

    console.log("🛡️ Activando RLS en saas_features...");
    await client.query("ALTER TABLE saas_features ENABLE ROW LEVEL SECURITY");

    // Borrar políticas previas si las hay para evitar duplicados
    await client.query("DROP POLICY IF EXISTS \"Adms can select saas_features\" ON saas_features");
    await client.query("DROP POLICY IF EXISTS \"Adms can update saas_features\" ON saas_features");

    // Crear Política SELECT para admins
    await client.query(`
      CREATE POLICY "Adms can select saas_features" ON saas_features 
      FOR SELECT TO authenticated 
      USING (
        EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
      )
    `);

    // Crear Política UPDATE para admins
    await client.query(`
      CREATE POLICY "Adms can update saas_features" ON saas_features 
      FOR UPDATE TO authenticated 
      USING (
        EXISTS (SELECT 1 FROM usuarios WHERE auth_id = auth.uid() AND role = 'admin')
      )
    `);

    console.log("✅ RLS y Políticas aplicadas con éxito.");

  } catch (err) {
    console.error("❌ Error aplicando seguridad:", err);
  } finally {
    await client.end();
  }
}

run();
