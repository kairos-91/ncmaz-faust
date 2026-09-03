// Configuración de PM2 para correr Levery en el VPS con `next start`.
// Uso: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "levery",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      // Next.js ya tiene su propio manejo de memoria; esto es solo una
      // red de seguridad por si algo se queda pegado.
      max_memory_restart: "500M",
      out_file: "logs/pm2-out.log",
      error_file: "logs/pm2-error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
