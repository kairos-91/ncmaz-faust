# Desplegar Levery en un VPS (Hostinger)

Esta guía asume Ubuntu (la imagen más común en Hostinger) y que **Supabase
sigue siendo el backend** — solo estás moviendo dónde corre el proceso de
Next.js, nada de Auth/RLS/Storage/Realtime cambia.

## 0. Antes de empezar

- Acceso SSH a tu VPS (`ssh root@tu-ip` o el usuario que te dio Hostinger).
- Un dominio o subdominio apuntando a la IP del VPS (registro A en tu DNS).
  Sin esto no puedes sacar certificado HTTPS.
- Los mismos valores de `.env.local` que usas en Vercel ahora mismo
  (Supabase URL/anon key, claves VAPID, `NEXT_PUBLIC_SITE_URL`).

## 1. Preparar el VPS (una sola vez)

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS (vía NodeSource — Next.js 16 necesita Node 20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# PM2 (mantiene el proceso vivo y lo reinicia si el VPS reinicia)
sudo npm install -g pm2

# Certbot para HTTPS gratis (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Clonar y configurar el proyecto

```bash
cd /var/www   # o donde prefieras
git clone https://github.com/kairos-91/ncmaz-faust.git levery
cd levery
git checkout claude/restaurant-menu-web-app-wclz6w   # o main, según qué tengas desplegado

npm ci
cp .env.example .env.local
nano .env.local   # completa con los mismos valores que tienes en Vercel
```

**Importante:** `NEXT_PUBLIC_SITE_URL` debe quedar en `https://tudominio.com`
(el dominio final, no `localhost`) — varias partes de la app arman URLs
absolutas con esa variable (el QR del menú, links de WhatsApp, etc.).

```bash
npm run build
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # sigue la instrucción que imprime (un comando sudo para
              # que PM2 arranque solo si el VPS se reinicia)
```

Verifica que responde localmente antes de meter Nginx:

```bash
curl -I http://localhost:3000
```

## 3. Nginx + HTTPS

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/levery
sudo nano /etc/nginx/sites-available/levery   # cambia "tudominio.com" por el real
sudo ln -s /etc/nginx/sites-available/levery /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot edita el archivo de Nginx para agregar HTTPS y programa la
renovación automática — no hace falta tocar nada más.

## 4. Actualizar Levery a una nueva versión

Cada vez que quieras subir cambios nuevos:

```bash
cd /var/www/levery
bash deploy/redeploy.sh
```

Esto hace `git pull` + `npm ci` + `npm run build` + `pm2 reload` (sin
downtime — PM2 espera a que el nuevo proceso esté listo antes de matar
el viejo).

## 5. Checklist antes de apuntar el dominio de verdad (cutover)

Estas cosas **no** se arreglan solas al cambiar de servidor — actualízalas
quirúrgicamente el mismo día que muevas el DNS, para no tener usuarios
tocando el sitio nuevo con configuración del viejo:

- [ ] **Supabase → Authentication → URL Configuration**: agrega
      `https://tudominio.com` a *Site URL* y a *Redirect URLs* (si no lo
      haces, el login con Google y los links de "confirmar cuenta" /
      "restablecer contraseña" van a redirigir al dominio viejo de
      Vercel).
- [ ] **Google Cloud Console**: el *Authorized redirect URI* de tu OAuth
      client apunta a `https://<tu-proyecto>.supabase.co/auth/v1/callback`
      — ese no cambia (Supabase hace el intercambio, no tu dominio), así
      que este paso normalmente no requiere tocar nada.
- [ ] **Google Apps Script** (reenvío de notificaciones bancarias): el
      `UrlFetchApp.fetch(...)` apunta al webhook — cámbialo a
      `https://tudominio.com/api/bank-notifications`.
- [ ] **Notificaciones push**: las suscripciones existentes (admin,
      repartidores, clientes) quedan atadas al dominio donde se
      registraron. Si cambias de dominio (no solo de servidor), esas
      suscripciones viejas dejan de funcionar y cada quien tiene que
      volver a activar notificaciones desde el nuevo dominio. Si solo
      cambias *dónde corre el servidor* pero el dominio sigue siendo el
      mismo (ej. ya tenías un dominio propio apuntando a Vercel y ahora
      apunta al VPS), esto no aplica — las suscripciones siguen sirviendo
      igual.
- [ ] Prueba el flujo completo en `https://tudominio.com` antes de bajar
      Vercel: login, crear un pedido de prueba, subir una imagen, el
      webhook de banco (mándale una prueba desde `/superadmin/bank-notifications`).

## Notas

- `vercel.json` queda en el repo sin usarse — no estorba, Nginx/PM2 lo
  ignoran por completo. Si en algún momento vuelves a desplegar en
  Vercel en paralelo (por ejemplo como ambiente de pruebas), sigue
  funcionando tal cual.
- Los backups de la base de datos siguen siendo responsabilidad de
  Supabase (backups automáticos según tu plan) — mover el hosting de
  Next.js no cambia eso para nada, la base de datos nunca estuvo en
  Vercel.
