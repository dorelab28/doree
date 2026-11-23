# Activar Budines Doré Lab

El catálogo está integrado al sitio y al carrito. Para habilitar precios administrables y el área privada:

1. Ejecutar [`supabase-budines-dorelab.sql`](supabase-budines-dorelab.sql) en el SQL Editor del proyecto Supabase conectado a Doré Lab.
2. Crear el usuario administrador en **Supabase → Authentication → Users**.
3. Copiar el UUID de esa cuenta y autorizarlo desde el SQL Editor:

   ```sql
   insert into public.budin_admins(user_id)
   values ('UUID-DE-LA-CUENTA');
   ```

4. Desplegar el checkout en Vercel. El archivo `api/budines-config.js` se publica como función y solo entrega recetas iniciales a una sesión Supabase cuyo UUID figure en `budin_admins`.
5. Abrir `/budines-admin.html`, ingresar con esa cuenta y guardar la configuración. A partir de entonces las recetas y costos modificados se guardan en `budin_cost_config`, protegidos por RLS.

La página de administración puede ser visitada sin iniciar sesión, pero los precios de costo, recetas internas y márgenes no se entregan sin autenticación y autorización. El catálogo público solo lee `budin_prices` (precios y pesos).

La configuración inicial queda marcada como pendiente de validación. Completar costos de sal, frosting, frutos secos de decoración, cantidades de toppings, merma, mano de obra y energía antes de habilitar resultados de ganancia o rentabilidad.
