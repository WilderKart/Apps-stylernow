const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data: members, error } = await supabase
    .from('memberships')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching memberships:', error)
    return
  }

  console.log('--- RECENT MEMBERSHIPS ---')
  console.log(JSON.stringify(members, null, 2))
}

run()
