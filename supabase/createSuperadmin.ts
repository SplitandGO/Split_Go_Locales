import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperadmin() {
  const email = 'benjamin@gimeno.cl';
  const password = 'SplitGoSuperadmin2024!'; // Cambia la contraseña luego de acceder

  // Crea el usuario
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'superadmin' }
  });

  if (error) {
    console.error('Error creando superadmin:', error.message);
    return;
  }

  // Actualiza el rol en la tabla users si es necesario
  await supabase.from('users').update({ role: 'superadmin' }).eq('email', email);

  console.log('Superadmin creado:', data.user.email);
}

createSuperadmin(); 