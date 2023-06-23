FROM node:18

RUN apt update && apt install tzdata -y
ENV TZ="Asia/Taipei"

WORKDIR /usr/src/app
COPY package*.json ./

RUN apt update && apt install tzdata -y
ENV TZ="Asia/Taipei"

ARG PRIVATE_REPO_TOKEN
RUN npm install
RUN npm install pm2 -g

COPY . .

CMD ["pm2-runtime", "index.js"]