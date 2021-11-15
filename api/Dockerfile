FROM node:14-alpine

WORKDIR /app

COPY api api
COPY package.json .
COPY package-lock.json .

RUN npm install

CMD ["npm", "run", "start-api"]
