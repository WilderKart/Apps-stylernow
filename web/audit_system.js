const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    console.log("==========================================");
    console.log("🛡️ REPORTE DE AUTO-AUDITORÍA STYLERNOW V10");
    console.log("==========================================\n");

    // 1. Verificar FORCE RLS en tablas
    const rlsRes = await client.query(`
      SELECT 
        tablename, 
        rowsecurity,
        (SELECT count(*) FROM pg_policies p WHERE p.tablename = t.tablename) as policies_count
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log("📋 [BLOQUE 1] Estado de RLS y Políticas:");
    console.table(rlsRes.rows.map(r => ({
      Tabla: r.tablename,
      "RLS Activo": r.rowsecurity ? "✅ SÍ" : "❌ NO",
      "Políticas": r.policies_count > 0 ? `✅ ${r.policies_count}` : "⚠️ 0 (Restrictivo por Defecto)"
    })));

    // 2. Verificar Event Triggers (Auto-Escalabilidad V9)
    const triggerRes = await client.query(`
      SELECT evtname 
      FROM pg_event_trigger;
    `);
    
    console.log("\n📋 [BLOQUE 12] Auto-Escalabilidad (Event Triggers):");
    const hasAutoRls = triggerRes.rows.some(t => t.evtname === 'rls_auto_trigger');
    console.log(hasAutoRls ? "✅ rls_auto_trigger ACTIVO: Cada nueva tabla heredará RLS." : "❌ rls_auto_trigger INACTIVO");

    // 3. Verificar triggers de auditoría (Inmutabilidad)
    const auditTriggers = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name LIKE 'audit_%';
    `);

    console.log("\n📋 [BLOQUE 6] Triggers de Auditoría:");
    if (auditTriggers.rows.length > 0) {
      console.table(auditTriggers.rows.map(t => ({
        Tabla: t.event_object_table,
        Trigger: t.trigger_name
      })));
    } else {
      console.log("⚠️ No se detectaron triggers audit_ activos en vistas transaccionales.");
    }

    // 4. Verificar Rate Limit HITs y RPC
    const rateLimitRes = await client.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'check_rate_limit';
    `);
    
    console.log("\n📋 [BLOQUE 3] Throttling / Rate Limits:");
    const hasRateLimit = rateLimitRes.rows.length > 0;
    console.log(hasRateLimit ? "✅ check_rate_limit(p_user_id, p_ip, p_action) INSTALADO." : "❌ Función check_rate_limit no encontrada.");

    // 5. Verificar Políticas de Storage
    const storageRes = await client.query(`
      SELECT policyname 
      FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage';
    `);
    console.log("\n📋 [BLOQUE 7/11] Seguridad en Storage (Bucket Aislado):");
    if (storageRes.rows.length > 0) {
      storageRes.rows.forEach(p => console.log(`✅ Política activa: ${p.policyname}`));
    } else {
      console.log("⚠️ Sin políticas visibles en storage.objects. (Revisar en dashboard si está encriptado).");
    }

    console.log("\n==========================================");
    console.log("🏁 Diagnóstico Finalizado.");
    console.log("==========================================");

  } catch (err) {
    console.error("❌ Error en Auditoría:", err);
  } finally {
    await client.end();
  }
}

main();
