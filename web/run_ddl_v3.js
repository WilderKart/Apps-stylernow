const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Leer .env.local para extraer DIRECT_URL
const envPath = path.join(__dirname, '.env.local');
const sqlPath = path.join(__dirname, 'tmp_fase2_triggers.sql');

if (!fs.existsSync(envPath)) {
    console.error(`Error: No se encontró .env.local en ${envPath}`);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const directUrlLine = envContent.split('\n').find(line => line.startsWith('DIRECT_URL='));

if (!directUrlLine) {
    console.error('Error: No se encontró DIRECT_URL en .env.local');
    process.exit(1);
}

const connectionString = directUrlLine.split('=')[1].replace(/"/g, '').trim();

// 2. Leer el archivo SQL
if (!fs.existsSync(sqlPath)) {
    console.error(`Error: No se encontró el archivo SQL en ${sqlPath}`);
    process.exit(1);
}

const sqlText = fs.readFileSync(sqlPath, 'utf-8');

// 3. Conectar y Ejecutar
const client = new Client({
    connectionString: connectionString,
});

async function run() {
    try {
        await client.connect();
        console.log('Conectado a la base de datos Supabase con éxito.');
        
        console.log('Ejecutando script Triggers (Fase 2)...');
        const res = await client.query(sqlText);
        console.log('Triggers ejecutados con éxito.');
        
    } catch (err) {
        console.error('Error durante la ejecución del SQL:', err);
    } finally {
        await client.end();
    }
}

run();
