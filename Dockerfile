FROM nginx:1.19-alpine

#COPY nginx.conf /etc/nginx/nginx.conf
COPY ./dist/pwa /usr/share/nginx/html
