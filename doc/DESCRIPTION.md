Angular-based book review blog with reviews, **YunoHost SSO** (no local passwords), and an admin panel (moderation, user directory, statistics).

The frontend is built on the server during installation and served as static files. The bundled **Fastify** API and **MariaDB** database are installed with the app; NGINX proxies `/path/api/` to the API and forwards SSOWat identity headers.
