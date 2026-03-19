const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    console.log("==========================================");
    console.log("🕵️ AUDITORÍA DE POLÍTICAS POR COMPORTAMIENTO V10.1");
    console.log("==========================================\n");

    // 1. Obtener SQL de policies para análisis semántico
    const policyRes = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    const vulnerabilities = [];
    const tablesAudited = new Set();

    console.log("🔍 [BLOQUE 1] Analizando Semántica de USING:");
    
    policyRes.rows.forEach(p => {
      // Excepciones para tablas/políticas públicas o de datos propios (Self-Access)
      const isPublicOrSelf = p.policyname.toLowerCase().includes('public') || 
                            p.policyname.toLowerCase().includes('own data') ||
                            p.policyname.toLowerCase().includes('select_own') ||
                            p.policyname.toLowerCase().includes('cualquiera puede ver') ||
                            p.tablename === 'permissions' || p.tablename === 'role_permissions';

      const isCorrect = isPublicOrSelf || (p.qual && (
        p.qual.includes('role_permissions') || 
        p.qual.includes('permission') || 
        p.qual.includes('users') && p.qual.includes('role')
      ));

      if (!isCorrect) {
        vulnerabilities.push({
          Tabla: p.tablename,
          Policy: p.policyname,
          Falla: "Falta validación de PERMISOS (solo utiliza aislamiento tenant_id)",
          Severidad: "CRÍTICA"
        });
      }
    });

    if (vulnerabilities.length > 0) {
      console.log("\n🚨 VULNERABILIDADES CRÍTICAS DETECTADAS:");
      console.table(vulnerabilities);
    } else {
      console.log("\n✅ Todas las políticas auditadas integran control de permisos RBAC.");
    }

    // Reportar tablas con RLS encendido pero SIN policies de escritura
    const allTables = ['appointments', 'reservas', 'servicios', 'promociones', 'schedules', 'staff'];
    const writeRes = await client.query(`
      SELECT tablename, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public' AND cmd IN ('INSERT', 'UPDATE', 'DELETE');
    `);

    const writeGroup = writeRes.rows.reduce((acc, r) => {
      acc[r.tablename] = acc[r.tablename] || [];
      acc[r.tablename].push(r.cmd);
      return acc;
    }, {});

    const hollowTables = allTables.filter(t => !writeGroup[t] || writeGroup[t].length === 0);
    if (hollowTables.length > 0) {
      console.log("\n🚨 [BLOQUE 1] Tablas sin políticas de Escritura (Incompletas):");
      console.log(hollowTables.join(", "));
    }

  } catch (err) {
    console.error("❌ Error en Auditoría Profunda:", err);
  } finally {
    await client.end();
  }
}

main();
