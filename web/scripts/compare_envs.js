const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}="?([^"\\n]+)"?`, 'm'));
  return match ? match[1] : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const directUrl = getEnvVar('DIRECT_URL');

console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
console.log("DIRECT_URL:", directUrl);

if (supabaseUrl && directUrl) {
  const urlHost = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  // Extraer host de direct URL
  // postgres://user:pass@host:5432/postgres
  const directMatch = directUrl.match(/@([^:]+):/);
  const directHost = directMatch ? directMatch[1] : null;

  console.log("\nComparación:");
  console.log("-> Host del Cliente (URL):", urlHost);
  console.log("-> Host de Direct URL:", directHost);

  if (directHost && directHost.includes(urlHost)) {
     console.log("\n✅ Los hosts COINCIDEN. El frontend y la base de datos directa apuntan al mismo proyecto.");
  } else {
     console.log("\n❌ LOS HOSTS NO COINCIDEN. Probablemente estés auditando el proyecto incorrecto.");
  }
} else {
  console.log("Faltan variables para comparar.");
}
