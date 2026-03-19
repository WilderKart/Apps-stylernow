const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    
    // Tablas a inspeccionar columnas
    const tables = [
      'barberias', 'usuarios', 'servicios', 'promociones', 'reservas', 
      'especialidades', 'notifications', 'service_catalog', 'support_tickets', 
      'email_verifications', 'password_reset_log', 'promo_banners', 'saas_features', 
      'trial_registrations', 'colombia_holidays', 'users'
    ];
    
    const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN (${tables.map(t => `'${t}'`).join(',')}) 
      AND table_schema = 'public';
    `);

    const grouped = res.rows.reduce((acc, row) => {
      acc[row.table_name] = acc[row.table_name] || [];
      acc[row.table_name].push(row.column_name);
      return acc;
    }, {});
    
    console.log(JSON.stringify(grouped, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
