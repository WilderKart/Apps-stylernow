const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.povaaoywqsfapxatnleu:Kevin327andres*@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
  });
  
  try {
    await client.connect();
    // Tablas críticas
    const tables = ['appointments', 'reservas', 'schedules', 'staff', 'usuarios', 'time_blocks'];
    
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN (${tables.map(t => `'${t}'`).join(',')}) 
      AND table_schema = 'public';
    `);

    // Group columns by table_name
    const grouped = res.rows.reduce((acc, row) => {
      acc[row.table_name] = acc[row.table_name] || [];
      acc[row.table_name].push(row.column_name);
      return acc;
    }, {});
    
    console.log(JSON.stringify(grouped, null, 2));

    // Validar si existe 'earnings' como tabla o vista
    const viewRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'earnings' AND table_schema = 'public';
    `);
    console.log("\n¿Existe tabla/vista 'earnings'?:", viewRes.rows.length > 0 ? "SÍ" : "NO");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
