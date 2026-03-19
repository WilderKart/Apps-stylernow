const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://povaaoywqsfapxatnleu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvdmFhb3l3cXNmYXB4YXRubGV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY4ODQ5MCwiZXhwIjoyMDg5MjY0NDkwfQ.gKNRsO-JZQAmOH4KpUbTOOb6m39tQxw38yYUoDoa4f4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'alt.rw-6oxt749s@yopmail.com';
  console.log("Searching for user:", email);
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const user = users.users.find(u => u.email === email);
  console.log("\n--- AUTH.USERS ---");
  if (!user) {
    console.log("User NOT found in auth.users");
    return;
  }
  
  console.log("User ID:", user.id);
  console.log("Email Verified At:", user.email_confirmed_at);
  console.log("Has Password Hash:", !!user.encrypted_password);

  console.log("\n--- PUBLIC.USUARIOS ---");
  const { data: profile, error: profileError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (profileError) {
    console.log("Profile error:", profileError.message);
  } else {
    console.log("Profile found:", profile);
  }

  console.log("\n--- MEMBERSHIPS ---");
  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  console.log("Membership found:", membership);
}

run();
