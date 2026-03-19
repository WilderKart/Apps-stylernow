const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://povaaoywqsfapxatnleu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const userId = '010485b2-e854-433a-9346-9643fc6b5b8f';
  console.log("Reparando usuario ID:", userId);

  // 1. Asignar Password en auth.users
  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
     password: 'Foncor88*'
  });
  if (authError) {
     console.error("Error password:", authError.message);
  } else {
     console.log("✅ Password asignado con éxito.");
  }

  // 2. Cambiar rol a 'manager'
  const { error: profileError } = await supabase
    .from('usuarios')
    .update({ role: 'manager' })
    .eq('auth_id', userId);
  if (profileError) {
     console.error("Error perfil:", profileError.message);
  } else {
     console.log("✅ Rol actualizado a manager.");
  }

  // 3. Crear membresía
  const { error: memError } = await supabase
    .from('memberships')
    .insert({ user_id: userId, role: 'owner' });
  if (memError) {
     console.error("Error membresía:", memError.message);
  } else {
     console.log("✅ Membresía owner creada.");
  }
}

run();
