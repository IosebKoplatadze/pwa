FROM node:14-alpine as builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM nginx:1.19-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/pwa /usr/share/nginx/html
