const fs = require('fs');

const path = "C:/Users/karni/Documents/Proyectos/StylerNow/web/src/app/auth/register/page.tsx";
let content = fs.readFileSync(path, 'utf8');

// Fragmento exacto para reemplazar (con indentación aproximada)
const targetText = `    // Auto-Finalizar si volvemos del email (Hay sesión y credenciales guardadas)
    const checkSessionAndFinalize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
         // Existe sesión y mail verificado. Proceder a consolidar perfil.
         const savedData = localStorage.getItem('registro_form');
         if (savedData) {
            const data = JSON.parse(savedData);
            startTransition(async () => {
                const res = await finalizarRegistroAction({
                    nombre: data.fullName,
                    email: data.email,
                    celular: \`\${data.countryCode} \${data.phone}\`,
                    contrasena: data.password,
                    role: role === 'shop_owner' ? 'manager' : (role === 'barber' ? 'barbero' : 'cliente')
                });

                if (res.success) {
                    localStorage.removeItem('registro_form');
                    setSuccess('¡Cuenta activada exitosamente! Redirigiendo al Login...');
                    setTimeout(() => router.push(\`/auth/login?role=\${role}\`), 2000);
                } else {
                    setError(res.error || 'Fallo al consolidar cuenta.');
                    // Fail-Safe: No limpiamos localStorage. El usuario puede arreglar datos y reintentar.
                }
            });
         } else if (resume) {
              // Si es un huérfano sin localStorage, pedirle que llene el formulario de nuevo en la vista
              setStep('form');
              setError('Completa tus datos para recuperar tu cuenta.');
         }
      } else if (resume && !user) {
          // Intento de resume sin sesión
          router.push('/auth/login');
      }
    };`;

const replacementText = `    const checkSessionAndFinalize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Control de Expiración (V10.5.7)
      const hasSavedData = !!localStorage.getItem('registro_form');
      if (!user && hasSavedData && step !== 'verify') {
         setError('Tu enlace ha expirado o ya fue utilizado. Por seguridad, solicita uno nuevo.');
         return;
      }

      if (user && user.email_confirmed_at) {
         const savedData = localStorage.getItem('registro_form');
         if (savedData) {
            const data = JSON.parse(savedData);
            setLoadingText('Validando tu cuenta...');
            
            startTransition(async () => {
                await new Promise(r => setTimeout(r, 800));
                setLoadingText('Creando tu perfil...');
                await new Promise(r => setTimeout(r, 800));
                setLoadingText('Configurando tu barbería...');

                const res = await finalizarRegistroAction({
                    nombre: data.fullName,
                    email: data.email,
                    celular: \`\${data.countryCode} \${data.phone}\`,
                    contrasena: data.password,
                    role: role === 'shop_owner' ? 'manager' : (role === 'barber' ? 'barbero' : 'cliente')
                });

                if (res.success) {
                    localStorage.removeItem('registro_form');
                    setSuccess('¡Cuenta activada exitosamente! Redirigiendo al Login...');
                    setTimeout(() => router.push(\`/auth/login?role=\${role}\`), 2000);
                } else {
                    setError(res.error || 'Fallo al consolidar cuenta.');
                    setLoadingText(null);
                }
            });
         } else if (resume) {
              setStep('form');
              setError('Completa tus datos para recuperar tu cuenta.');
         }
      } else if (resume && !user) {
           router.push('/auth/login');
      }
    };`;

if (content.includes("const checkSessionAndFinalize = async () => {")) {
   console.log("Found function! Replacing...");
   content = content.replace(targetText, replacementText);
   content = content.replace("}, [supabase, router, role, resume]);", "}, [supabase, router, role, resume, step]);");
   fs.writeFileSync(path, content, 'utf8');
   console.log("Parchado exitoso.");
} else {
   console.log("Function targeting string NOT found!");
}
