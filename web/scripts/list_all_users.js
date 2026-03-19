const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://povaaoywqsfapxatnleu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  console.log("--- TODOS LOS USUARIOS RECIENTES ---");
  // Ordenar por creación descendente si es posible (no hay Sort en listUsers típicamente)
  // Pero podemos imprimir todos o los últimos 20
  const list = users.users.map(u => ({
     email: u.email,
     id: u.id,
     created_at: u.created_at
  }));
  
  console.log(JSON.stringify(list, null, 2));
}

run();
