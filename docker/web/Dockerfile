FROM nginx:stable
RUN rm /etc/nginx/conf.d/default.conf

COPY --chown=nginx:root ./docker/web/nginx/ /etc/nginx/
COPY --chown=nginx:root ./web-app/dist/web-app /usr/share/nginx/html/

#envsubst to perform the variable substitution on nginx startup
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]