FROM node:18-slim

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install

COPY . /app
EXPOSE 3000

CMD ["nodemon", "index.js"]
