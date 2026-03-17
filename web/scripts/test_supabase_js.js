const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=["']?([^"'\r\n]+)["']?`, 'm'));
  return match ? match[1] : null;
}

const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!url || !serviceKey) {
  console.error("❌ Variables faltantes en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  try {
    const { data, error } = await supabase
      .from('saas_features')
      .select('*');

    if (error) {
      console.error("❌ Error de Supabase JS:", error);
    } else {
      console.log("✅ Datos obtenidos con Supabase JS:", data);
    }
  } catch (err) {
    console.error("❌ Excepción:", err);
  }
}

run();
