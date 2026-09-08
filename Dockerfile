# Multi-stage Dockerfile for Landslide Sentinel AI
FROM nginx:alpine as production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY locales/ /usr/share/nginx/html/locales/
COPY data/ /usr/share/nginx/html/data/
COPY sw.js /usr/share/nginx/html/sw.js

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
