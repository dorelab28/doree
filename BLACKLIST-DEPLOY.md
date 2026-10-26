# DORÉ LAB // BLACKLIST — despliegue seguro

## Qué agrega esta implementación

BLACKLIST no es una página pública escondida. La pantalla de entrada es estática, pero la validación ocurre en `/api/blacklist/login`, el catálogo se entrega únicamente desde `/api/blacklist/catalog` y `/blacklist` es una ruta servida por el backend después de comprobar la cookie de sesión.

La tienda pública no cambia: sigue siendo HTML/CSS/JS estático; su catálogo, carrito local y checkout por WhatsApp continúan en `app.js`. Las fotografías del menú BLACKLIST son referencias a las fotos originales existentes en `assets/`; no se añadieron imágenes generadas.

## Requisito de hosting

El proyecto original no incluía backend ni configuración de despliegue. Esta implementación requiere desplegarlo en **Vercel** (o adaptar los archivos de `api/` a una plataforma equivalente de funciones serverless). Vercel ejecuta las rutas `api/` del repositorio como funciones de servidor y aplica `vercel.json` para que `/blacklist` sea una ruta protegida.

No publicar este cambio en un hosting sólo estático: las rutas `api/` no correrían y la pantalla de acceso no tendría autenticación real.

## Variables privadas de Vercel

En Vercel, abrir el proyecto → **Settings → Environment Variables**. Cargar las variables para Production (y Preview si se desea probar) sin prefijos `NEXT_PUBLIC_` ni `VITE_`:

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `BLACKLIST_SESSION_SECRET` | Sí | Secreto aleatorio de al menos 32 bytes para firmar la cookie de sesión. |
| `BLACKLIST_PASSWORD_HASH` | Recomendada | Hash scrypt de la contraseña de acceso. |
| `BLACKLIST_PASSWORD` | Sólo migración inicial | Alternativa temporal, privada y del servidor, para configurar inicialmente `OVERRIDE`. |

Para la contraseña inicial solicitada, puede cargarse temporalmente `BLACKLIST_PASSWORD` con el valor indicado por la persona administradora. Esa variable nunca debe añadirse a `.env` versionado, JavaScript público, HTML, URLs ni logs. Cuando se prepare producción, reemplazarla por `BLACKLIST_PASSWORD_HASH` y borrar `BLACKLIST_PASSWORD`.

La app no abre acceso si falta el secreto de sesión o ambas variables de contraseña; no existe una clave de demostración como fallback.

## Generar el hash recomendado

En una terminal local segura (sin pegar la salida en el repositorio), ejecutar este comando e ingresar la contraseña cuando lo pida:

```powershell
node -e "const c=require('crypto'),r=require('readline');r.createInterface({input:process.stdin,output:process.stdout}).question('Password: ',p=>{const s=c.randomBytes(16);const d=c.scryptSync(p,s,64,{N:16384,r:8,p:1});console.log(['scrypt',16384,8,1,s.toString('base64url'),d.toString('base64url')].join('$'));process.exit()})"
```

Copiar sólo el resultado a `BLACKLIST_PASSWORD_HASH` en Vercel. La API prioriza ese hash y usa comparación de tiempo constante. Nunca guardar la contraseña ni el hash generado en los archivos del proyecto.

## Despliegue y prueba

1. Importar/conectar este repositorio en Vercel y configurar las variables privadas anteriores.
2. Desplegar desde Vercel. Sus previews son útiles para probar, pero usar secretos distintos de producción.
3. Verificar en producción que el ícono de cookie abre `/blacklist-access.html`; luego iniciar sesión y comprobar que `/blacklist` carga el menú.
4. Abrir una ventana privada e intentar `/blacklist` y `/api/blacklist/catalog`: ambos deben rechazar el acceso sin cookie.
5. Confirmar que `Set-Cookie` usa `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` y una expiración de seis horas en producción; usar **CLOSE SESSION** y comprobar que deja de accederse al menú.

La limitación de intentos incluida en la función limita ocho fallos por IP durante 15 minutos por instancia serverless. Para una protección distribuida y durable de producción, añadir una tasa perimetral de Vercel WAF y/o un store compartido (Vercel KV/Upstash) y reemplazar el store de memoria en `api/_blacklist.js`. Es necesario porque las instancias serverless no comparten memoria de forma global.

## Límites deliberados

Las fotos de productos ya existen en la tienda pública; no es posible volverlas privadas sin reorganizar también el catálogo público. Lo que esta capa protege son la ruta BLACKLIST y la respuesta que revela identidades, precios y descripciones clandestinas. Las operaciones comerciales públicas actuales siguen siendo locales/WhatsApp y no existe un backend de pagos en este proyecto.
