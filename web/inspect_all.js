const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    
    // 1. Listar todas las tablas
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `);

    const tables = tableRes.rows.map(r => r.table_name);
    console.log("Tablas en public:", tables);

    const checkBookings = tables.includes('bookings');
    console.log("\n¿Existe tabla 'bookings'?:", checkBookings ? "SÍ" : "NO");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
